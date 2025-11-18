/**
 * Socket.IO 响应格式工具
 * 基于现有的 response.js，为 Socket.IO 提供统一的响应格式
 */

const { logger } = require('./logger');

/**
 * Socket 响应基类
 */
class SocketResponse {
  constructor(success, data = null, message = '', error = null, meta = {}) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.meta = meta;
  }

  toJSON() {
    const response = {
      success: this.success,
      timestamp: this.timestamp,
    };

    if (this.data !== null) response.data = this.data;
    if (this.message) response.message = this.message;
    if (this.error) response.error = this.error;
    if (Object.keys(this.meta).length > 0) response.meta = this.meta;

    return response;
  }
}

/**
 * 创建成功响应
 */
const socketSuccess = (data = null, message = '操作成功', meta = {}) => {
  return new SocketResponse(true, data, message, null, meta);
};

/**
 * 创建错误响应
 */
const socketError = (error, message = '操作失败', meta = {}) => {
  // 如果 error 是 Error 对象，提取消息
  const errorMessage = error instanceof Error ? error.message : error;

  return new SocketResponse(false, null, message, errorMessage, meta);
};

/**
 * Socket 错误类型枚举
 */
const SocketErrorType = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  RATE_LIMIT: 'rate_limit',
  BUSINESS: 'business',
  INTERNAL: 'internal',
};

/**
 * 创建验证错误响应
 */
const socketValidationError = (errors, message = '数据验证失败') => {
  return socketError(errors, message, { type: SocketErrorType.VALIDATION });
};

/**
 * 创建认证错误响应
 */
const socketAuthError = (message = '认证失败') => {
  return socketError(message, message, { type: SocketErrorType.AUTHENTICATION });
};

/**
 * 创建权限错误响应
 */
const socketPermissionError = (message = '权限不足') => {
  return socketError(message, message, { type: SocketErrorType.PERMISSION });
};

/**
 * 创建速率限制错误响应
 */
const socketRateLimitError = (message = '请求过于频繁') => {
  return socketError(message, message, { type: SocketErrorType.RATE_LIMIT });
};

/**
 * Socket 事件处理器包装器
 * 自动处理错误并返回统一格式
 */
const socketHandler = handler => {
  return async (socket, io, data) => {
    try {
      const result = await handler(socket, io, data);
      return result;
    } catch (error) {
      logger.error('Socket handler error:', {
        error: error.message,
        stack: error.stack,
        socketId: socket.id,
      });

      // 发送错误响应给客户端
      const errorResponse = socketError(error, error.message || '处理请求时发生错误', {
        type: error.type || SocketErrorType.INTERNAL,
        handler: handler.name,
      });

      socket.emit('error', errorResponse.toJSON());
      throw error; // 继续抛出以便上层处理
    }
  };
};

/**
 * 自定义 Socket 错误类
 */
class SocketBusinessError extends Error {
  constructor(message, type = SocketErrorType.BUSINESS) {
    super(message);
    this.name = 'SocketBusinessError';
    this.type = type;
  }
}

class SocketValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'SocketValidationError';
    this.type = SocketErrorType.VALIDATION;
    this.details = details;
  }
}

class SocketAuthenticationError extends Error {
  constructor(message = '认证失败') {
    super(message);
    this.name = 'SocketAuthenticationError';
    this.type = SocketErrorType.AUTHENTICATION;
  }
}

class SocketPermissionError extends Error {
  constructor(message = '权限不足') {
    super(message);
    this.name = 'SocketPermissionError';
    this.type = SocketErrorType.PERMISSION;
  }
}

class SocketRateLimitError extends Error {
  constructor(message = '请求过于频繁') {
    super(message);
    this.name = 'SocketRateLimitError';
    this.type = SocketErrorType.RATE_LIMIT;
  }
}

module.exports = {
  // 响应类
  SocketResponse,

  // 响应方法
  socketSuccess,
  socketError,
  socketValidationError,
  socketAuthError,
  socketPermissionError,
  socketRateLimitError,

  // 错误类型
  SocketErrorType,

  // 自定义错误类
  SocketBusinessError,
  SocketValidationError,
  SocketAuthenticationError,
  SocketPermissionError,
  SocketRateLimitError,

  // 工具方法
  socketHandler,
};
