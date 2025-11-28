const { logger } = require('@/utils/logger');

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

  res.apiNotFound(`未找到资源 - ${req.originalUrl}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
};

// 全局错误处理
const errorHandler = (err, req, res, next) => {
  // 确定状态码
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // 记录错误日志
  logger.error('应用错误', {
    error: err.message,
    stack: err.stack,
    statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // 设置响应状态
  res.status(statusCode);

  // 处理Sequelize验证错误
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.apiValidationError(errors, '数据验证错误', {
      errorType: err.name,
    });
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.apiUnauthorized('无效的令牌', {
      errorType: err.name,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.apiUnauthorized('令牌已过期', {
      errorType: err.name,
    });
  }

  // 返回标准错误响应
  const meta = {
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  if (statusCode >= 500) {
    return res.apiServerError(err.message, meta);
  } else {
    return res.apiError(err.message, statusCode, null, meta);
  }
};

module.exports = {
  notFound,
  errorHandler,
};
