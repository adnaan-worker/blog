const winston = require('winston');
const path = require('path');
const fs = require('fs');
const environment = require('@/config/environment');

// 确保日志目录存在
const config = environment.get();
const logDir = config.logging.filePath;

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // 添加元数据
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    // 添加错误堆栈
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// 创建日志记录器
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'blog-api',
    environment: config.nodeEnv,
  },
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 访问日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 添加控制台输出（开发和生产环境都需要，便于Docker日志查看）
logger.add(
  new winston.transports.Console({
    format: config.nodeEnv === 'production' ? logFormat : consoleFormat,
    level: config.nodeEnv === 'production' ? 'info' : config.logging.level,
  })
);

// 创建请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // 记录请求开始
  logger.info('请求开始', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
  });

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('请求完成', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      userId: req.user?.id || 'anonymous',
    });
  });

  next();
};

// 创建错误日志中间件
const errorLogger = (err, req, res, next) => {
  logger.error('应用错误', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params,
  });

  next(err);
};

// 性能监控日志
const performanceLogger = {
  logDatabaseQuery: (query, duration, success = true) => {
    logger.info('数据库查询', {
      type: 'database',
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration: `${duration}ms`,
      success,
    });
  },

  logCacheOperation: (operation, key, duration, success = true) => {
    logger.info('缓存操作', {
      type: 'cache',
      operation,
      key,
      duration: `${duration}ms`,
      success,
    });
  },

  logApiCall: (endpoint, method, duration, statusCode) => {
    logger.info('API调用', {
      type: 'api',
      endpoint,
      method,
      duration: `${duration}ms`,
      statusCode,
    });
  },
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  performanceLogger,
};
