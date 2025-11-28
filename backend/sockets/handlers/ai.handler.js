const BaseSocketHandler = require('../base-handler');
const aiService = require('@/services/ai/ai.service');
const writingService = require('@/services/ai/writing.service');
const { aiQuotaService } = require('@/services/ai-quota.service');
const { AI_EVENTS } = require('@/utils/socket-events');
const { SocketValidationError, SocketAuthenticationError } = require('@/utils/socket-response');
const promptManager = require('@/services/ai/prompts');

/**
 * AI 流式输出 Socket 处理器（新版）
 * 基于重构后的 AI 服务
 */
class AINewHandler extends BaseSocketHandler {
  constructor() {
    super('AI');

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
   * 流式聊天
   */
  async handleStreamChat(socket, io, data) {
    // 验证数据
    if (!data?.message || !data?.sessionId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['message', 'sessionId'],
        received: data ? Object.keys(data) : [],
      });
    }

    this._checkAuth(socket);

    const { message, sessionId } = data;
    const userId = socket.userId;

    try {
      // 检查配额
      await this._checkQuota(userId, 'chat');

      this.log('info', '开始流式聊天', { userId, sessionId });

      // 始终使用博客助手身份
      const systemPrompt = promptManager.getSystemPrompt('blog');

      // 流式生成
      await aiService.streamChat(
        message,
        chunk => {
          this.emit(socket, AI_EVENTS.CHUNK, {
            sessionId,
            chunk,
            type: 'chat',
          });
        },
        { taskId: sessionId, systemPrompt }
      );

      // 更新配额
      await this._updateQuota(userId, 'chat');

      this.emit(socket, AI_EVENTS.DONE, { sessionId });
    } catch (error) {
      this.log('error', '流式聊天失败', { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        sessionId,
        error: error.message,
      });
    }
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

    this._checkAuth(socket);

    const { content, style = '更加流畅和专业', taskId } = data;
    const userId = socket.userId;

    try {
      await this._checkQuota(userId);

      this.log('info', '开始流式润色', { userId, taskId });

      await writingService.polish(
        content,
        style,
        chunk => {
          this.emit(socket, AI_EVENTS.CHUNK, {
            taskId,
            chunk,
            action: 'polish',
          });
        },
        taskId
      );

      await this._updateQuota(userId);

      this.emit(socket, AI_EVENTS.DONE, { taskId, action: 'polish' });
    } catch (error) {
      this.log('error', '流式润色失败', { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: error.message,
      });
    }
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

    this._checkAuth(socket);

    const { content, improvements = '提高可读性和逻辑性', taskId } = data;
    const userId = socket.userId;

    try {
      await this._checkQuota(userId);

      this.log('info', '开始流式改进', { userId, taskId });

      await writingService.improve(
        content,
        improvements,
        chunk => {
          this.emit(socket, AI_EVENTS.CHUNK, {
            taskId,
            chunk,
            action: 'improve',
          });
        },
        taskId
      );

      await this._updateQuota(userId);

      this.emit(socket, AI_EVENTS.DONE, { taskId, action: 'improve' });
    } catch (error) {
      this.log('error', '流式改进失败', { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: error.message,
      });
    }
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

    this._checkAuth(socket);

    const { content, length = 'medium', taskId } = data;
    const userId = socket.userId;

    try {
      await this._checkQuota(userId);

      this.log('info', '开始流式扩展', { userId, taskId });

      await writingService.expand(
        content,
        length,
        chunk => {
          this.emit(socket, AI_EVENTS.CHUNK, {
            taskId,
            chunk,
            action: 'expand',
          });
        },
        taskId
      );

      await this._updateQuota(userId);

      this.emit(socket, AI_EVENTS.DONE, { taskId, action: 'expand' });
    } catch (error) {
      this.log('error', '流式扩展失败', { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: error.message,
      });
    }
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

    this._checkAuth(socket);

    const { content, length = 'medium', taskId } = data;
    const userId = socket.userId;

    try {
      await this._checkQuota(userId);

      this.log('info', '开始流式总结', { userId, taskId });

      await writingService.summarize(
        content,
        length,
        chunk => {
          this.emit(socket, AI_EVENTS.CHUNK, {
            taskId,
            chunk,
            action: 'summarize',
          });
        },
        taskId
      );

      await this._updateQuota(userId);

      this.emit(socket, AI_EVENTS.DONE, { taskId, action: 'summarize' });
    } catch (error) {
      this.log('error', '流式总结失败', { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: error.message,
      });
    }
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

    this._checkAuth(socket);

    const { content, targetLang = '英文', taskId } = data;
    const userId = socket.userId;

    try {
      await this._checkQuota(userId);

      this.log('info', '开始流式翻译', { userId, taskId, targetLang });

      await writingService.translate(
        content,
        targetLang,
        chunk => {
          this.emit(socket, AI_EVENTS.CHUNK, {
            taskId,
            chunk,
            action: 'translate',
          });
        },
        taskId
      );

      await this._updateQuota(userId);

      this.emit(socket, AI_EVENTS.DONE, { taskId, action: 'translate' });
    } catch (error) {
      this.log('error', '流式翻译失败', { userId, error: error.message });
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: error.message,
      });
    }
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
