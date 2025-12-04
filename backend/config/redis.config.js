const environment = require('./environment');

// 获取Redis配置
const redisConfig = environment.get('redis');

// ioredis 配置
module.exports = {
  // 基础连接配置
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: redisConfig.db || 0,

  // ioredis 特定配置 - 从环境变量读取超时设置
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 30000, // 连接超时
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 10000, // 命令超时
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY_ON_FAILOVER) || 100,
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 5, // 最大重试次数
  lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true' ? true : false, // 是否懒加载连接
  keepAlive: parseInt(process.env.REDIS_KEEP_ALIVE) || 30000, // keepAlive时间

  // 重连策略 - 更积极的重连
  retryStrategy: times => {
    const maxRetries = parseInt(process.env.REDIS_MAX_RETRY_ATTEMPTS) || 20;
    if (times > maxRetries) {
      return null; // 停止重连
    }
    // 指数退避，但有最大值限制
    const retryDelay = parseInt(process.env.REDIS_RETRY_DELAY) || 200;
    const maxRetryDelay = parseInt(process.env.REDIS_MAX_RETRY_DELAY) || 3000;
    return Math.min(times * retryDelay, maxRetryDelay);
  },

  // 事件配置
  enableAutoPipelining: true,
  enableOfflineQueue: true,

  // 连接池配置
  family: 4, // 强制使用IPv4

  // 健康检查
  maxLoadingTimeout: 5000,

  // 如果有 URL，优先使用 URL
  ...(redisConfig.url && {
    // 从 URL 解析配置（ioredis 会自动处理）
    connectionString: redisConfig.url,
  }),
};
