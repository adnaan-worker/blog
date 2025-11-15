const BaseSocketHandler = require('../base-handler');
const aiProvider = require('../../services/langchain/ai-provider.service');
const aiWriting = require('../../services/langchain/ai-writing.service');
const { aiQuotaService } = require('../../services/ai-quota.service');

/**
 * AI 流式输出 Socket 处理器
 */
class AIHandler extends BaseSocketHandler {
  constructor() {
    super('AI');

    this.on('ai:stream_chat', this.handleStreamChat);
    this.on('ai:stream_polish', this.handleStreamPolish);
    this.on('ai:stream_improve', this.handleStreamImprove);
    this.on('ai:stream_expand', this.handleStreamExpand);
    this.on('ai:cancel', this.handleCancel);
  }

  /**
   * 流式聊天
   */
  async handleStreamChat(socket, io, data) {
    const { message, sessionId } = data;
    const userId = socket.userId || socket.id;

    try {
      // 检查配额
      const quota = await aiQuotaService.checkChatQuota(userId);
      if (!quota.available) {
        this.emit(socket, 'ai:error', {
          sessionId,
          error: `每日聊天次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式聊天', { userId, sessionId });

      // 流式生成
      await aiProvider.streamChat(message, null, chunk => {
        this.emit(socket, 'ai:chunk', {
          sessionId,
          chunk,
          type: 'chat',
        });
      });

      // 更新配额
      await aiQuotaService.incrementChatUsage(userId);

      this.emit(socket, 'ai:done', { sessionId });
    } catch (error) {
      this.log('error', '流式聊天失败', { userId, error: error.message });
      this.emit(socket, 'ai:error', {
        sessionId,
        error: error.message,
      });
    }
  }

  /**
   * 流式润色
   */
  async handleStreamPolish(socket, io, data) {
    const { content, style = '更加流畅和专业', taskId } = data;
    const userId = socket.userId || socket.id;

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, 'ai:error', {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式润色', { userId, taskId });

      // 流式生成
      await aiWriting.streamPolishText(content, style, chunk => {
        this.emit(socket, 'ai:chunk', {
          taskId,
          chunk,
          action: 'polish',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

      this.emit(socket, 'ai:done', { taskId, action: 'polish' });
    } catch (error) {
      this.log('error', '流式润色失败', { userId, error: error.message });
      this.emit(socket, 'ai:error', {
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
    const userId = socket.userId || socket.id;

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, 'ai:error', {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式改进', { userId, taskId });

      // 流式生成
      await aiWriting.streamImproveText(content, improvements, chunk => {
        this.emit(socket, 'ai:chunk', {
          taskId,
          chunk,
          action: 'improve',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

      this.emit(socket, 'ai:done', { taskId, action: 'improve' });
    } catch (error) {
      this.log('error', '流式改进失败', { userId, error: error.message });
      this.emit(socket, 'ai:error', {
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
    const userId = socket.userId || socket.id;

    try {
      // 检查配额
      const quota = await aiQuotaService.checkGenerateQuota(userId);
      if (!quota.available) {
        this.emit(socket, 'ai:error', {
          taskId,
          error: `每日生成次数已达上限(${quota.limit})`,
        });
        return;
      }

      this.log('info', '开始流式扩展', { userId, taskId });

      // 流式生成
      await aiWriting.streamExpandContent(content, length, chunk => {
        this.emit(socket, 'ai:chunk', {
          taskId,
          chunk,
          action: 'expand',
        });
      });

      // 更新配额
      await aiQuotaService.incrementGenerateUsage(userId);

      this.emit(socket, 'ai:done', { taskId, action: 'expand' });
    } catch (error) {
      this.log('error', '流式扩展失败', { userId, error: error.message });
      this.emit(socket, 'ai:error', {
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
