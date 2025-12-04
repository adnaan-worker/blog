/**
 * 统一错误处理工具
 * 定义标准错误类和错误码
 */

// ================================================================================
// 错误码定义
// ================================================================================

const ERROR_CODES = {
  // ============ 1xxx: 认证相关错误 ============
  INVALID_CREDENTIALS: { code: 1001, message: '用户名或密码错误' },
  TOKEN_EXPIRED: { code: 1002, message: '登录已过期，请重新登录' },
  TOKEN_INVALID: { code: 1003, message: '无效的访问令牌' },
  TOKEN_MISSING: { code: 1004, message: '缺少访问令牌' },
  UNAUTHORIZED: { code: 1005, message: '未授权访问' },
  FORBIDDEN: { code: 1006, message: '没有权限执行此操作' },
  ACCOUNT_DISABLED: { code: 1007, message: '账号已被禁用' },
  ACCOUNT_NOT_VERIFIED: { code: 1008, message: '账号未验证' },

  // ============ 2xxx: 资源相关错误 ============
  RESOURCE_NOT_FOUND: { code: 2001, message: '请求的资源不存在' },
  RESOURCE_ALREADY_EXISTS: { code: 2002, message: '资源已存在' },
  RESOURCE_CONFLICT: { code: 2003, message: '资源冲突' },
  RESOURCE_DELETED: { code: 2004, message: '资源已被删除' },

  // ============ 3xxx: 请求相关错误 ============
  BAD_REQUEST: { code: 3001, message: '请求参数错误' },
  VALIDATION_ERROR: { code: 3002, message: '数据验证失败' },
  INVALID_INPUT: { code: 3003, message: '输入数据无效' },
  MISSING_REQUIRED_FIELD: { code: 3004, message: '缺少必填字段' },
  INVALID_FILE_TYPE: { code: 3005, message: '不支持的文件类型' },
  FILE_TOO_LARGE: { code: 3006, message: '文件大小超过限制' },

  // ============ 4xxx: 业务逻辑错误 ============
  OPERATION_FAILED: { code: 4001, message: '操作失败' },
  INSUFFICIENT_QUOTA: { code: 4002, message: 'AI配额不足' },
  RATE_LIMIT_EXCEEDED: { code: 4003, message: '请求过于频繁，请稍后再试' },
  DUPLICATE_ACTION: { code: 4004, message: '重复操作' },
  INVALID_STATUS: { code: 4005, message: '无效的状态' },
  OPERATION_NOT_ALLOWED: { code: 4006, message: '不允许的操作' },

  // ============ 5xxx: 服务器错误 ============
  INTERNAL_SERVER_ERROR: { code: 5001, message: '服务器内部错误' },
  DATABASE_ERROR: { code: 5002, message: '数据库错误' },
  EXTERNAL_SERVICE_ERROR: { code: 5003, message: '外部服务错误' },
  SERVICE_UNAVAILABLE: { code: 5004, message: '服务暂时不可用' },
  TIMEOUT: { code: 5005, message: '请求超时' },

  // ============ 6xxx: AI相关错误 ============
  AI_SERVICE_ERROR: { code: 6001, message: 'AI服务错误' },
  AI_QUOTA_EXCEEDED: { code: 6002, message: 'AI配额已用完' },
  AI_REQUEST_FAILED: { code: 6003, message: 'AI请求失败' },
  AI_INVALID_PROMPT: { code: 6004, message: '无效的AI提示词' },
};

// ================================================================================
// 基础错误类
// ================================================================================

class AppError extends Error {
  constructor(errorCode, customMessage = null, details = null) {
    const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_SERVER_ERROR;
    const message = customMessage || errorInfo.message;

    super(message);

    this.name = this.constructor.name;
    this.code = errorInfo.code;
    this.errorCode = errorCode;
    this.message = message;
    this.details = details;
    this.isOperational = true; // 标记为可预期的错误
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      code: this.code,
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// ================================================================================
// 具体错误类
// ================================================================================

/**
 * 认证错误 (401)
 */
class AuthenticationError extends AppError {
  constructor(errorCode = 'UNAUTHORIZED', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 401;
  }
}

/**
 * 授权错误 (403)
 */
class AuthorizationError extends AppError {
  constructor(errorCode = 'FORBIDDEN', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 403;
  }
}

/**
 * 资源未找到错误 (404)
 */
class NotFoundError extends AppError {
  constructor(errorCode = 'RESOURCE_NOT_FOUND', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 404;
  }
}

/**
 * 请求参数错误 (400)
 */
class BadRequestError extends AppError {
  constructor(errorCode = 'BAD_REQUEST', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 400;
  }
}

/**
 * 数据验证错误 (422)
 */
class ValidationError extends AppError {
  constructor(errorCode = 'VALIDATION_ERROR', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 422;
  }
}

/**
 * 资源冲突错误 (409)
 */
class ConflictError extends AppError {
  constructor(errorCode = 'RESOURCE_CONFLICT', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 409;
  }
}

/**
 * 业务逻辑错误 (400)
 */
class BusinessError extends AppError {
  constructor(errorCode = 'OPERATION_FAILED', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 400;
  }
}

/**
 * 服务器错误 (500)
 */
class InternalServerError extends AppError {
  constructor(errorCode = 'INTERNAL_SERVER_ERROR', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 500;
    this.isOperational = false; // 标记为不可预期的错误
  }
}

/**
 * 外部服务错误 (502)
 */
class ExternalServiceError extends AppError {
  constructor(errorCode = 'EXTERNAL_SERVICE_ERROR', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 502;
  }
}

/**
 * 服务不可用错误 (503)
 */
class ServiceUnavailableError extends AppError {
  constructor(errorCode = 'SERVICE_UNAVAILABLE', customMessage = null, details = null) {
    super(errorCode, customMessage, details);
    this.statusCode = 503;
  }
}

// ================================================================================
// 错误处理辅助函数
// ================================================================================

/**
 * 判断是否为可操作的错误
 */
const isOperationalError = error => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * 格式化Sequelize验证错误
 */
const formatSequelizeError = error => {
  if (error.name === 'SequelizeValidationError') {
    const details = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    return new ValidationError('VALIDATION_ERROR', '数据验证失败', details);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'unknown';
    return new ConflictError('RESOURCE_ALREADY_EXISTS', `${field}已存在`);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new BadRequestError('BAD_REQUEST', '关联数据不存在');
  }

  return new InternalServerError('DATABASE_ERROR', '数据库操作失败', {
    originalError: error.message,
  });
};

/**
 * 格式化JWT错误
 */
const formatJWTError = error => {
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('TOKEN_EXPIRED');
  }

  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('TOKEN_INVALID');
  }

  return new AuthenticationError('UNAUTHORIZED');
};

/**
 * 统一错误响应格式
 */
const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    code: error.code || 5001,
    errorCode: error.errorCode || 'INTERNAL_SERVER_ERROR',
    message: error.message || '服务器内部错误',
    timestamp: error.timestamp || new Date().toISOString(),
  };

  // 添加详细信息
  if (error.details) {
    response.details = error.details;
  }

  // 开发环境添加堆栈信息
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

// ================================================================================
// 导出
// ================================================================================

module.exports = {
  // 错误码
  ERROR_CODES,

  // 错误类
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  ValidationError,
  ConflictError,
  BusinessError,
  InternalServerError,
  ExternalServiceError,
  ServiceUnavailableError,

  // 辅助函数
  isOperationalError,
  formatSequelizeError,
  formatJWTError,
  formatErrorResponse,
};
