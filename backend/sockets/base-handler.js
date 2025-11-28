const { logger } = require('@/utils/logger');
const { socketError } = require('@/utils/socket-response');

/**
 * Socket 事件处理器基类
 * 提供统一的事件注册、错误处理、日志记录
 */
class BaseSocketHandler {
  constructor(name) {
    this.name = name;
    this.events = new Map();
  }

  /**
   * 注册事件处理器
   * @param {string} event - 事件名
   * @param {Function} handler - 处理函数
   */
  on(event, handler) {
    this.events.set(event, handler.bind(this));
    return this;
  }

  /**
   * 注册所有事件到 Socket
   * @param {Socket} socket - Socket 实例
   * @param {Server} io - Socket.IO 服务器实例
   */
  register(socket, io) {
    for (const [event, handler] of this.events) {
      socket.on(event, async data => {
        try {
          this.log('info', `收到事件: ${event}`, { socketId: socket.id });
          await handler(socket, io, data);
        } catch (error) {
          this.handleError(socket, event, error);
        }
      });
    }

    this.log('info', '事件处理器已注册', {
      socketId: socket.id,
      events: Array.from(this.events.keys()),
    });
  }

  /**
   * 错误处理（增强版）
   */
  handleError(socket, event, error) {
    this.log('error', `事件处理失败: ${event}`, {
      socketId: socket.id,
      userId: socket.userId,
      error: error.message,
      stack: error.stack,
      errorType: error.type || error.name,
    });

    // 使用统一的错误响应格式
    const errorResponse = socketError(error, error.message || '处理请求时发生错误', {
      handler: this.name,
      event,
      type: error.type || 'internal',
    });

    socket.emit('error', errorResponse.toJSON());
  }

  /**
   * 日志记录
   */
  log(level, message, data = {}) {
    const logData = {
      handler: this.name,
      ...data,
    };

    logger[level](`[${this.name}] ${message}`, logData);
  }

  /**
   * 向客户端发送消息
   */
  emit(socket, event, data) {
    socket.emit(event, {
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * 广播消息
   */
  broadcast(io, event, data, excludeSocket = null) {
    if (excludeSocket) {
      excludeSocket.broadcast.emit(event, {
        ...data,
        timestamp: Date.now(),
      });
    } else {
      io.emit(event, {
        ...data,
        timestamp: Date.now(),
      });
    }
  }
}

module.exports = BaseSocketHandler;
