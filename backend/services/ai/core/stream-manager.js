const { EventEmitter } = require('events');
const { logger } = require('@/utils/logger');

/**
 * 流式输出管理器
 * 支持取消、暂停、恢复、进度追踪
 */
class StreamManager extends EventEmitter {
  constructor() {
    super();
    this.activeStreams = new Map(); // taskId -> StreamController
  }

  /**
   * 创建流式任务
   * @param {string} taskId - 任务ID
   * @param {AsyncGenerator} stream - LangChain 流式生成器
   * @param {Object} options - 配置选项
   * @returns {StreamController}
   */
  createStream(taskId, stream, options = {}) {
    const controller = new StreamController(taskId, stream, options);

    this.activeStreams.set(taskId, controller);

    // 任务完成或错误时自动清理
    controller.on('done', () => this.removeStream(taskId));
    controller.on('error', () => this.removeStream(taskId));
    controller.on('cancelled', () => this.removeStream(taskId));

    logger.debug('创建流式任务', { taskId, options });

    return controller;
  }

  /**
   * 获取流式任务
   */
  getStream(taskId) {
    return this.activeStreams.get(taskId);
  }

  /**
   * 取消流式任务
   */
  cancelStream(taskId) {
    const controller = this.activeStreams.get(taskId);
    if (controller) {
      controller.cancel();
      return true;
    }
    return false;
  }

  /**
   * 移除流式任务
   */
  removeStream(taskId) {
    this.activeStreams.delete(taskId);
    logger.debug('移除流式任务', { taskId });
  }

  /**
   * 获取活跃任务数
   */
  getActiveCount() {
    return this.activeStreams.size;
  }

  /**
   * 清理所有任务
   */
  clear() {
    for (const [taskId, controller] of this.activeStreams) {
      controller.cancel();
    }
    this.activeStreams.clear();
  }
}

/**
 * 流式控制器
 * 管理单个流式任务的生命周期
 */
class StreamController extends EventEmitter {
  constructor(taskId, stream, options = {}) {
    super();
    this.taskId = taskId;
    this.stream = stream;
    this.options = options;

    this.status = 'pending'; // pending, running, paused, done, error, cancelled
    this.isCancelled = false;
    this.isPaused = false;
    this.chunks = [];
    this.fullContent = '';
    this.startTime = Date.now();
    this.endTime = null;
  }

  /**
   * 开始流式输出
   * @param {Function} onChunk - 每个 chunk 的回调
   */
  async start(onChunk) {
    if (this.status !== 'pending') {
      throw new Error(`任务状态错误: ${this.status}`);
    }

    this.status = 'running';
    this.emit('start', { taskId: this.taskId });

    try {
      for await (const chunk of this.stream) {
        // 检查是否取消
        if (this.isCancelled) {
          this.status = 'cancelled';
          this.emit('cancelled', { taskId: this.taskId });
          return this.fullContent;
        }

        // 检查是否暂停
        while (this.isPaused && !this.isCancelled) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 提取内容
        const content = chunk.content || chunk;

        if (content) {
          this.chunks.push(content);
          this.fullContent += content;

          // 触发 chunk 事件
          this.emit('chunk', {
            taskId: this.taskId,
            chunk: content,
            totalLength: this.fullContent.length,
          });

          // 调用回调
          if (onChunk) {
            await onChunk(content, {
              taskId: this.taskId,
              totalLength: this.fullContent.length,
              chunkCount: this.chunks.length,
            });
          }
        }
      }

      // 完成
      this.status = 'done';
      this.endTime = Date.now();

      this.emit('done', {
        taskId: this.taskId,
        content: this.fullContent,
        duration: this.endTime - this.startTime,
        chunkCount: this.chunks.length,
      });

      return this.fullContent;
    } catch (error) {
      this.status = 'error';
      this.endTime = Date.now();

      this.emit('error', {
        taskId: this.taskId,
        error: error.message,
        duration: this.endTime - this.startTime,
      });

      throw error;
    }
  }

  /**
   * 取消任务
   */
  cancel() {
    if (this.status === 'done' || this.status === 'cancelled') {
      return;
    }

    this.isCancelled = true;
    logger.info('取消流式任务', { taskId: this.taskId });
  }

  /**
   * 暂停任务
   */
  pause() {
    if (this.status === 'running') {
      this.isPaused = true;
      this.emit('paused', { taskId: this.taskId });
      logger.debug('暂停流式任务', { taskId: this.taskId });
    }
  }

  /**
   * 恢复任务
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.emit('resumed', { taskId: this.taskId });
      logger.debug('恢复流式任务', { taskId: this.taskId });
    }
  }

  /**
   * 获取任务状态
   */
  getStatus() {
    return {
      taskId: this.taskId,
      status: this.status,
      isPaused: this.isPaused,
      isCancelled: this.isCancelled,
      chunkCount: this.chunks.length,
      contentLength: this.fullContent.length,
      duration: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime,
    };
  }

  /**
   * 获取完整内容
   */
  getContent() {
    return this.fullContent;
  }
}

module.exports = new StreamManager();
