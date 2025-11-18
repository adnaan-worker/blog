const BaseSocketHandler = require('../base-handler');
const aiProvider = require('../../services/langchain/ai-provider.service');
const aiWriting = require('../../services/langchain/ai-writing.service');
const { aiQuotaService } = require('../../services/ai-quota.service');
const { AI_EVENTS } = require('../../utils/socket-events');
const { SocketValidationError, SocketAuthenticationError } = require('../../utils/socket-response');

/**
 * AI 流式输出 Socket 处理器
 */
class AIHandler extends BaseSocketHandler {
  constructor() {
    super('AI');

    // 使用事件常量
    this.on(AI_EVENTS.STREAM_CHAT, this.handleStreamChat);
    this.on(AI_EVENTS.STREAM_POLISH, this.handleStreamPolish);
    this.on(AI_EVENTS.STREAM_IMPROVE, this.handleStreamImprove);
    this.on(AI_EVENTS.STREAM_EXPAND, this.handleStreamExpand);
    this.on(AI_EVENTS.STREAM_SUMMARIZE, this.handleStreamSummarize);
    this.on(AI_EVENTS.STREAM_TRANSLATE, this.handleStreamTranslate);
    this.on(AI_EVENTS.CANCEL, this.handleCancel);
  }

  /**
   * 流式聊天
   */
  async handleStreamChat(socket, io, data) {
    // 数据验证
    if (!data || !data.message || !data.sessionId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['message', 'sessionId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { message, sessionId } = data;
    const userId = socket.userId;

    // 检查用户是否登录
    if (!userId) {
      throw new SocketAuthenticationError('请先登录后使用AI功能');
    }

    try {
      // 检查配额
      const quota = await aiQuotaService.checkChatQuota(userId);
      if (!quota.available) {
        this.emit(socket, AI_EVENTS.ERROR, {
          sessionId,
          error: `每日聊天次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式聊天', { userId, sessionId });

      // 流式生成
      await aiProvider.streamChat(message, null, chunk => {
        this.emit(socket, AI_EVENTS.CHUNK, {
          sessionId,
          chunk,
          type: 'chat',
        });
      });

      // 更新配额
      await aiQuotaService.incrementChatUsage(userId);

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
    // 数据验证
    if (!data || !data.content || !data.taskId) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['content', 'taskId'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { content, style = '更加流畅和专业', taskId } = data;
    const userId = socket.userId;

    // 检查用户是否登录
    if (!userId) {
      throw new SocketAuthenticationError('请先登录后使用AI功能');
    }

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, AI_EVENTS.ERROR, {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式润色', { userId, taskId });

      // 流式生成
      await aiWriting.streamPolishText(content, style, chunk => {
        this.emit(socket, AI_EVENTS.CHUNK, {
          taskId,
          chunk,
          action: 'polish',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

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
    const { content, improvements = '提高可读性和逻辑性', taskId } = data;
    const userId = socket.userId;

    // 检查用户是否登录
    if (!userId) {
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: '请先登录后使用AI功能',
      });
      return;
    }

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, AI_EVENTS.ERROR, {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式改进', { userId, taskId });

      // 流式生成
      await aiWriting.streamImproveText(content, improvements, chunk => {
        this.emit(socket, AI_EVENTS.CHUNK, {
          taskId,
          chunk,
          action: 'improve',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

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
    const { content, length = 'medium', taskId } = data;
    const userId = socket.userId;

    // 检查用户是否登录
    if (!userId) {
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: '请先登录后使用AI功能',
      });
      return;
    }

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, AI_EVENTS.ERROR, {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式扩展', { userId, taskId });

      // 流式生成
      await aiWriting.streamExpandContent(content, length, chunk => {
        this.emit(socket, AI_EVENTS.CHUNK, {
          taskId,
          chunk,
          action: 'expand',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

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
    const { content, length = 'medium', taskId } = data;
    const userId = socket.userId;

    // 检查用户是否登录
    if (!userId) {
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: '请先登录后使用AI功能',
      });
      return;
    }

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, AI_EVENTS.ERROR, {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式总结', { userId, taskId });

      // 流式生成
      await aiWriting.streamSummarizeContent(content, length, chunk => {
        this.emit(socket, AI_EVENTS.CHUNK, {
          taskId,
          chunk,
          action: 'summarize',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

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
    const { content, targetLang = '英文', taskId } = data;
    const userId = socket.userId;

    // 检查用户是否登录
    if (!userId) {
      this.emit(socket, AI_EVENTS.ERROR, {
        taskId,
        error: '请先登录后使用AI功能',
      });
      return;
    }

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, AI_EVENTS.ERROR, {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式翻译', { userId, taskId, targetLang });

      // 流式生成
      await aiWriting.streamTranslateContent(content, targetLang, chunk => {
        this.emit(socket, AI_EVENTS.CHUNK, {
          taskId,
          chunk,
          action: 'translate',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

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
    const { taskId } = data;

    this.log('info', '取消任务', { taskId });
    this.emit(socket, 'ai:cancelled', { taskId });
  }
}

module.exports = new AIHandler();
