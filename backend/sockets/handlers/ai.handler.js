const BaseSocketHandler = require('../base-handler');
const aiService = require('@/services/ai/ai.service');
const writingService = require('@/services/ai/writing.service');
const { aiQuotaService } = require('@/services/ai-quota.service');
const chatHistoryService = require('@/services/ai/chat-history.service');
const { AI_EVENTS } = require('@/utils/socket-events');
const { SocketValidationError, SocketAuthenticationError } = require('@/utils/socket-response');
const promptManager = require('@/services/ai/prompts');
const ConcurrencyLimiter = require('@/utils/concurrency-limiter');
const cacheService = require('@/services/cache.service');

/**
 * AI 流式输出 Socket 处理器（新版 + 并发控制）
 * 基于重构后的 AI 服务
 */
class AINewHandler extends BaseSocketHandler {
  constructor() {
    super('AI');

    // 初始化并发控制器
    this.concurrencyLimiter = new ConcurrencyLimiter({
      maxConcurrent: 3, // 每用户最多3个并发AI请求
      queueSize: 5, // 队列最多5个等待请求
      timeout: 120000, // 超时时间2分钟
    });

    // 缓存配置
    this.CACHE_TTL = 5 * 60; // 5分钟
    this.CACHE_PREFIX = 'ai:chat:';

    // 注册事件处理器
    this.on(AI_EVENTS.STREAM_CHAT, this.handleStreamChat);
    this.on(AI_EVENTS.STREAM_POLISH, this.handleStreamPolish);
    this.on(AI_EVENTS.STREAM_IMPROVE, this.handleStreamImprove);
    this.on(AI_EVENTS.STREAM_EXPAND, this.handleStreamExpand);
    this.on(AI_EVENTS.STREAM_SUMMARIZE, this.handleStreamSummarize);
    this.on(AI_EVENTS.STREAM_TRANSLATE, this.handleStreamTranslate);
    this.on(AI_EVENTS.CANCEL, this.handleCancel);
  }

  /**
   * 获取消息缓存键
   */
  _getCacheKey(messageId) {
    return `${this.CACHE_PREFIX}${messageId}`;
  }

  /**
   * 检查消息是否已缓存（已处理）
   */
  async _isMessageCached(messageId) {
    if (!messageId) return false;
    const key = this._getCacheKey(messageId);
    return await cacheService.exists(key);
  }

  /**
   * 获取缓存的消息内容
   */
  async _getCachedMessage(messageId) {
    if (!messageId) return null;
    const key = this._getCacheKey(messageId);
    return await cacheService.get(key);
  }

  /**
   * 缓存消息内容
   */
  async _cacheMessage(messageId, content) {
    if (!messageId) return;
    const key = this._getCacheKey(messageId);
    await cacheService.set(key, content, this.CACHE_TTL);
  }

  /**
   * 追加内容到缓存（用于流式输出）
   */
  async _appendToCache(messageId, chunk) {
    if (!messageId) return;
    const key = this._getCacheKey(messageId);

    // 获取现有内容
    const existing = (await cacheService.get(key)) || '';
    const updated = existing + chunk;

    // 更新缓存并刷新TTL
    await cacheService.set(key, updated, this.CACHE_TTL);

    return updated.length; // 返回当前总长度
  }

  /**
   * 通用流式处理包装器（支持幂等性和断点续传）
   * @param {Object} socket - Socket实例
   * @param {Object} data - 请求数据
   * @param {Function} streamFunction - 流式生成函数
   * @param {Object} options - 选项
   */
  async _handleStreamWithCache(socket, data, streamFunction, options = {}) {
    const { taskId, _messageId, continue_from = 0 } = data;

    const {
      eventType = 'generate', // 事件类型
      requireAuth = false, // 是否需要认证
      checkQuota = true, // 是否检查配额
      quotaType = 'generate', // 配额类型：'chat' 或 'generate'
    } = options;

    const userId = socket.userId || socket.id;
    const isGuest = !socket.userId;

    // 🔒 幂等性检查：如果消息已处理，直接返回缓存内容
    if (_messageId && (await this._isMessageCached(_messageId))) {
      this.log('info', `${eventType}消息已处理，返回缓存内容`, {
        messageId: _messageId,
        userId,
        taskId,
        continueFrom: continue_from,
      });

      const cachedContent = await this._getCachedMessage(_messageId);
      if (cachedContent) {
        // 🎯 主流方案：缓存消息直接发送done，不发送chunk
        // 原因：前端可能已经有部分内容，发送chunk会导致重复
        this.log('info', `返回缓存消息（不发送chunk）`, {
          messageId: _messageId,
          length: cachedContent.length,
        });

        this.emit(socket, AI_EVENTS.DONE, {
          taskId,
          cached: true,
          totalLength: cachedContent.length,
          messageId: _messageId,
        });

        if (_messageId) {
          this.emit(socket, 'message:ack', {
            messageId: _messageId,
            success: true,
            cached: true,
            response: { taskId, userId, totalLength: cachedContent.length },
          });
        }

        return;
      }
    }

    try {
      // 认证检查
      if (requireAuth) {
        this._checkAuth(socket);
      }

      // 并发控制
      await this.concurrencyLimiter.acquire(userId);

      // 配额检查
      if (checkQuota && !isGuest) {
        await this._checkQuota(userId, quotaType);
      }

      // 🎯 立即发送ACK，告知客户端消息已接收并开始处理
      if (_messageId) {
        this.emit(socket, 'message:ack', {
          messageId: _messageId,
          success: true,
          processing: true, // 标记为处理中
          response: { taskId, userId },
        });
      }

      // 流式生成
      let result = '';
      let position = 0;

      await streamFunction(async chunk => {
        result += chunk;
        position += chunk.length;

        // 实时缓存
        if (_messageId) {
          await this._appendToCache(_messageId, chunk);
        }

        // 发送chunk
        this.emit(socket, AI_EVENTS.CHUNK, {
          taskId,
          chunk,
          type: eventType,
          position,
          messageId: _messageId,
        });
      });

      // 更新配额
      if (checkQuota && !isGuest) {
        await this._updateQuota(userId, quotaType);
      }

      // 完成信号
      this.emit(socket, AI_EVENTS.DONE, {
        taskId,
        totalLength: position,
        messageId: _messageId,
      });

      return result;
    } catch (error) {
      this.log('error', `${eventType}失败`, { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: error.message,
      });

      if (_messageId) {
        this.emit(socket, 'message:ack', {
          messageId: _messageId,
          success: false,
          error: error.message,
        });
      }

      throw error;
    } finally {
      this.concurrencyLimiter.release(userId);
    }
  }

  /**
   * 检查用户认证
   */
  _checkAuth(socket) {
    if (!socket.userId) {
      throw new SocketAuthenticationError('请先登录后使用 AI 功能');
    }
  }

  /**
   * 检查配额
   */
  async _checkQuota(userId, type = 'generate') {
    const quota =
      type === 'chat'
        ? await aiQuotaService.checkChatQuota(userId)
        : await aiQuotaService.checkGenerateQuota(userId);

    if (!quota.available) {
      throw new Error(`每日${type === 'chat' ? '聊天' : '生成'}次数已达上限(${quota.limit})`);
    }

    return quota;
  }

  /**
   * 更新配额
   */
  async _updateQuota(userId, type = 'generate') {
    if (type === 'chat') {
      await aiQuotaService.incrementChatUsage(userId);
    } else {
      await aiQuotaService.incrementGenerateUsage(userId);
    }
  }

  /**
   * 流式聊天（支持历史记录和多轮对话）
   */
  async handleStreamChat(socket, io, data) {
    // 验证数据
    if (!data?.message || !data?.sessionId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['message', 'sessionId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { message, sessionId } = data;
    const userId = socket.userId || socket.id;
    const isGuest = !socket.userId;

    // 使用通用包装器处理流式输出
    await this._handleStreamWithCache(
      socket,
      { ...data, taskId: sessionId }, // 将sessionId映射为taskId
      async onChunk => {
        // 1. 保存用户消息（仅登录用户）
        if (!isGuest) {
          await chatHistoryService.saveMessage(
            userId,
            sessionId,
            'user',
            message,
            'blog_assistant'
          );
        }

        // 2. 加载历史记录（仅登录用户）
        let history = [];
        if (!isGuest) {
          history = await chatHistoryService.getSessionHistory(userId, sessionId, 20);
        }

        // 3. 构建消息上下文
        const systemPrompt = promptManager.getSystemPrompt('blog');
        const messages = [{ role: 'system', content: systemPrompt }];
        if (history.length > 0) {
          messages.push(...history);
        }
        messages.push({ role: 'user', content: message });

        // 4. 流式生成
        let assistantReply = '';
        await aiService.streamChat(
          message,
          async chunk => {
            assistantReply += chunk;
            await onChunk(chunk); // 使用包装器的回调
          },
          {
            taskId: sessionId,
            systemPrompt,
            messages: history.length > 0 ? messages : undefined,
          }
        );

        // 5. 保存 AI 回复（仅登录用户）
        if (!isGuest && assistantReply) {
          await chatHistoryService.saveMessage(
            userId,
            sessionId,
            'assistant',
            assistantReply,
            'blog_assistant'
          );
          await chatHistoryService.cleanOldMessages(userId, sessionId, 50);
        }

        return assistantReply;
      },
      {
        eventType: 'chat',
        requireAuth: false, // 支持访客
        checkQuota: !isGuest, // 只对登录用户检查配额
        quotaType: 'chat', // 使用聊天配额
      }
    );
  }

  /**
   * 流式润色
   */
  async handleStreamPolish(socket, io, data) {
    if (!data?.content || !data?.taskId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['content', 'taskId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { content, style = '更加流畅和专业' } = data;

    await this._handleStreamWithCache(
      socket,
      data,
      async onChunk => {
        await writingService.polish(content, style, onChunk, data.taskId);
      },
      {
        eventType: 'polish',
        requireAuth: true,
        checkQuota: true,
      }
    );
  }

  /**
   * 流式改进
   */
  async handleStreamImprove(socket, io, data) {
    if (!data?.content || !data?.taskId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['content', 'taskId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { content, improvements = '提高可读性和逻辑性' } = data;

    await this._handleStreamWithCache(
      socket,
      data,
      async onChunk => {
        await writingService.improve(content, improvements, onChunk, data.taskId);
      },
      {
        eventType: 'improve',
        requireAuth: true,
        checkQuota: true,
      }
    );
  }

  /**
   * 流式扩展
   */
  async handleStreamExpand(socket, io, data) {
    if (!data?.content || !data?.taskId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['content', 'taskId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { content, length = 'medium' } = data;

    await this._handleStreamWithCache(
      socket,
      data,
      async onChunk => {
        await writingService.expand(content, length, onChunk, data.taskId);
      },
      {
        eventType: 'expand',
        requireAuth: true,
        checkQuota: true,
      }
    );
  }

  /**
   * 流式总结
   */
  async handleStreamSummarize(socket, io, data) {
    if (!data?.content || !data?.taskId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['content', 'taskId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { content, length = 'medium' } = data;

    await this._handleStreamWithCache(
      socket,
      data,
      async onChunk => {
        await writingService.summarize(content, length, onChunk, data.taskId);
      },
      {
        eventType: 'summarize',
        requireAuth: true,
        checkQuota: true,
      }
    );
  }

  /**
   * 流式翻译
   */
  async handleStreamTranslate(socket, io, data) {
    if (!data?.content || !data?.taskId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['content', 'taskId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { content, targetLang = '英文' } = data;

    await this._handleStreamWithCache(
      socket,
      data,
      async onChunk => {
        await writingService.translate(content, targetLang, onChunk, data.taskId);
      },
      {
        eventType: 'translate',
        requireAuth: true,
        checkQuota: true,
      }
    );
  }

  /**
   * 取消任务
   */
  async handleCancel(socket, io, data) {
    if (!data?.taskId) {
      throw new SocketValidationError('缺少 taskId');
    }

    const { taskId } = data;

    this.log('info', '取消任务', { taskId });

    const cancelled = writingService.cancelTask(taskId);

    if (cancelled) {
      this.emit(socket, 'ai:cancelled', { taskId });
    } else {
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: '任务不存在或已完成',
      });
    }
  }
}

module.exports = new AINewHandler();
