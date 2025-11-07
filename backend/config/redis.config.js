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

  // ioredis 特定配置 - 优化超时设置
  connectTimeout: 30000, // 增加连接超时到30秒
  commandTimeout: 10000, // 增加命令超时到10秒
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 5, // 增加重试次数
  lazyConnect: false, // 改为立即连接，避免懒加载导致的延迟
  keepAlive: 30000, // 增加keepAlive时间

  // 重连策略 - 更积极的重连
  retryStrategy: times => {
    if (times > 20) {
      // 增加重连次数
      return null; // 停止重连
    }
    // 指数退避，但有最大值限制
    return Math.min(times * 200, 3000);
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
