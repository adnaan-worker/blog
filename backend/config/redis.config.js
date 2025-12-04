const environment = require('./environment');

// 获取Redis配置
const config = environment.get();
const redisConfig = config.redis;
const redisAdvanced = config.redisAdvanced;

// ioredis 配置
module.exports = {
  // 基础连接配置
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password || '',
  db: redisConfig.db,

  // ioredis 特定配置 - 从环境配置读取
  connectTimeout: redisAdvanced.connectTimeout,
  commandTimeout: redisAdvanced.commandTimeout,
  retryDelayOnFailover: redisAdvanced.retryDelayOnFailover,
  maxRetriesPerRequest: redisAdvanced.maxRetries,
  lazyConnect: redisAdvanced.lazyConnect,
  keepAlive: redisAdvanced.keepAlive,

  // 重连策略
  retryStrategy: times => {
    if (times > redisAdvanced.maxRetryAttempts) {
      return null; // 停止重连
    }
    // 指数退避，但有最大值限制
    return Math.min(times * redisAdvanced.retryDelay, redisAdvanced.maxRetryDelay);
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
