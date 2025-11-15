const environment = require('./environment');

/**
 * 队列配置
 */
class QueueConfig {
  constructor() {
    const config = environment.get();

    // Redis 连接配置
    this.connection = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
    };

    // 默认任务选项
    this.defaultJobOptions = {
      attempts: 3, // 最多重试3次
      backoff: {
        type: 'exponential',
        delay: 2000, // 初始延迟2秒
      },
      removeOnComplete: {
        age: 3600, // 1小时后删除完成的任务
        count: 100, // 保留最近100个
      },
      removeOnFail: {
        age: 86400, // 24小时后删除失败的任务
      },
    };

    // Worker 配置
    this.workerOptions = {
      concurrency: 3, // 并发数
      limiter: {
        max: 10, // 每个时间窗口最多处理10个任务
        duration: 1000, // 时间窗口1秒
      },
    };
  }

  getConnection() {
    return this.connection;
  }

  getDefaultJobOptions() {
    return this.defaultJobOptions;
  }

  getWorkerOptions() {
    return this.workerOptions;
  }
}

module.exports = new QueueConfig();
