const { logger } = require('@/utils/logger');
const {
  AppError,
  NotFoundError,
  InternalServerError,
  formatSequelizeError,
  formatJWTError,
  formatErrorResponse,
  isOperationalError,
} = require('@/utils/errors');
const environment = require('@/config/environment');

/**
 * 错误处理中间件
 * 用于统一处理API请求中的错误
 */

// 捕获404错误
const notFound = (req, res, next) => {
  logger.warn('404错误', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const error = new NotFoundError('RESOURCE_NOT_FOUND', `未找到资源 - ${req.originalUrl}`, {
    url: req.originalUrl,
    method: req.method,
  });

  next(error);
};

// 全局错误处理
const errorHandler = (err, req, res, next) => {
  let error = err;

  // 转换Sequelize错误
  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError' ||
    err.name === 'SequelizeForeignKeyConstraintError'
  ) {
    error = formatSequelizeError(err);
  }

  // 转换JWT错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = formatJWTError(err);
  }

  // 如果不是AppError，转换为InternalServerError
  if (!(error instanceof AppError)) {
    error = new InternalServerError('INTERNAL_SERVER_ERROR', err.message, {
      originalError: err.name,
    });
  }

  // 确定状态码
  const statusCode = error.statusCode || 500;

  // 记录错误日志
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('应用错误', {
    code: error.code,
    errorCode: error.errorCode,
    message: error.message,
    statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params,
    stack: error.stack,
    isOperational: isOperationalError(error),
  });

  // 格式化错误响应
  const isDevelopment = environment.isDevelopment();
  const response = formatErrorResponse(error, isDevelopment);

  // 发送响应
  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
