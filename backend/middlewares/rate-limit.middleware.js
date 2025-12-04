/**
 * API速率限制中间件
 * 针对不同接口实施差异化的速率限制策略
 */

const rateLimit = require('express-rate-limit');
const { logger } = require('@/utils/logger');
const { BusinessError } = require('@/utils/errors');

// ================================================================================
// 速率限制配置
// ================================================================================

/**
 * 创建速率限制器
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 时间窗口（默认1分钟）
    max = 100, // 最大请求数
    message = '请求过于频繁，请稍后再试',
    skipSuccessfulRequests = false, // 是否跳过成功的请求
    skipFailedRequests = false, // 是否跳过失败的请求
    keyGenerator = null, // 自定义key生成器
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true, // 返回 `RateLimit-*` 头
    legacyHeaders: false, // 禁用 `X-RateLimit-*` 头

    // 自定义key生成器（默认使用IP）
    keyGenerator:
      keyGenerator ||
      (req => {
        // 优先使用用户ID，其次使用IP
        return req.user?.id?.toString() || req.ip;
      }),

    // 自定义错误处理
    handler: (req, res) => {
      logger.warn('速率限制触发', {
        ip: req.ip,
        userId: req.user?.id,
        url: req.originalUrl,
        method: req.method,
      });

      const error = new BusinessError('RATE_LIMIT_EXCEEDED', message);
      res.status(429).json(error.toJSON());
    },

    // 跳过某些请求
    skip: req => {
      // 管理员不受限制
      if (req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
  });
};

// ================================================================================
// 预定义的速率限制器
// ================================================================================

/**
 * 严格限制 - 用于敏感操作（登录、注册等）
 * 15分钟内最多5次请求
 */
const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5,
  message: '操作过于频繁，请15分钟后再试',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * 认证限制 - 用于登录接口
 * 15分钟内最多5次登录尝试
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5,
  message: '登录尝试次数过多，请15分钟后再试',
  skipSuccessfulRequests: true, // 成功的登录不计入限制
  skipFailedRequests: false,
  keyGenerator: req => {
    // 使用用户名或邮箱 + IP作为key
    const identifier = req.body.username || req.body.email || req.ip;
    return `auth:${identifier}:${req.ip}`;
  },
});

/**
 * 注册限制 - 用于注册接口
 * 1小时内最多3次注册尝试
 */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3,
  message: '注册请求过多，请1小时后再试',
  keyGenerator: req => {
    // 使用邮箱 + IP作为key
    const email = req.body.email || req.ip;
    return `register:${email}:${req.ip}`;
  },
});

/**
 * AI接口限制 - 用于AI相关接口
 * 1分钟内最多10次请求
 */
const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 10,
  message: 'AI请求过于频繁，请稍后再试',
  skipSuccessfulRequests: false,
  keyGenerator: req => {
    // 使用用户ID作为key
    return req.user?.id?.toString() || req.ip;
  },
});

/**
 * AI流式聊天限制 - 更严格
 * 1分钟内最多5次
 */
const aiChatLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 5,
  message: 'AI聊天请求过于频繁，请稍后再试',
  keyGenerator: req => {
    return req.user?.id?.toString() || req.ip;
  },
});

/**
 * 文件上传限制
 * 5分钟内最多10次上传
 */
const uploadLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 10,
  message: '文件上传过于频繁，请稍后再试',
});

/**
 * 评论限制
 * 1分钟内最多5条评论
 */
const commentLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 5,
  message: '评论发布过于频繁，请稍后再试',
  keyGenerator: req => {
    return req.user?.id?.toString() || req.ip;
  },
});

/**
 * 点赞/收藏限制
 * 1分钟内最多20次操作
 */
const interactionLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 20,
  message: '操作过于频繁，请稍后再试',
});

/**
 * 搜索限制
 * 1分钟内最多30次搜索
 */
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 30,
  message: '搜索请求过于频繁，请稍后再试',
});

/**
 * 普通接口限制
 * 1分钟内最多100次请求
 */
const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 100,
  message: '请求过于频繁，请稍后再试',
});

/**
 * 宽松限制 - 用于读取接口
 * 1分钟内最多200次请求
 */
const looseLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 200,
  message: '请求过于频繁，请稍后再试',
});

// ================================================================================
// 全局速率限制（应用于所有API）
// ================================================================================

/**
 * 全局速率限制
 * 防止单个IP过度请求
 */
const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1分钟
  max: 300, // 每分钟最多300次请求
  message: '请求过于频繁，请稍后再试',
  keyGenerator: req => req.ip, // 只使用IP
});

// ================================================================================
// 导出
// ================================================================================

module.exports = {
  // 创建函数
  createRateLimiter,

  // 预定义限制器
  strictLimiter,
  authLimiter,
  registerLimiter,
  aiLimiter,
  aiChatLimiter,
  uploadLimiter,
  commentLimiter,
  interactionLimiter,
  searchLimiter,
  generalLimiter,
  looseLimiter,
  globalLimiter,
};
