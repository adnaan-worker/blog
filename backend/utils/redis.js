const Redis = require('ioredis');
const redisConfig = require('../config/redis.config');
const { logger } = require('./logger');

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * 初始化 Redis 连接
   */
  async connect() {
    if (this.client && this.isConnected) {
      return this.client;
    }

    if (this.isConnecting) {
      // 如果正在连接，等待连接完成
      return new Promise(resolve => {
        const checkConnection = () => {
          if (this.isConnected && this.client) {
            resolve(this.client);
          } else if (!this.isConnecting) {
            resolve(null);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    try {
      // 创建 Redis 客户端
      this.client = new Redis(redisConfig);

      // 连接成功事件
      this.client.on('connect', () => {
        this.isConnected = true;
        this.isConnecting = false;
      });

      // 连接就绪事件（静默）
      this.client.on('ready', () => {
        // 连接就绪（日志在 Promise 中统一输出）
      });

      // 错误事件
      this.client.on('error', err => {
        logger.error('❌ Redis 连接错误:', err.message);
        this.isConnected = false;
      });

      // 断开连接事件
      this.client.on('close', () => {
        logger.warn('🔌 Redis 连接已断开');
        this.isConnected = false;
      });

      // 重连事件
      this.client.on('reconnecting', delay => {
        logger.info(`🔄 Redis 重连中... (${delay}ms 后)`);
      });

      // 等待连接建立 - 优化连接等待逻辑
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Redis 连接超时'));
        }, 30000); // 增加到30秒

        // 连接成功处理
        const onReady = () => {
          clearTimeout(timeout);
          this.client.removeListener('error', onError);
          logger.info('✅ Redis 连接就绪');
          resolve();
        };

        // 错误处理
        const onError = err => {
          clearTimeout(timeout);
          this.client.removeListener('ready', onReady);
          logger.error('❌ Redis 连接错误:', err.message);
          reject(err);
        };

        this.client.once('ready', onReady);
        this.client.once('error', onError);

        // 如果已经连接，直接resolve
        if (this.client.status === 'ready') {
          clearTimeout(timeout);
          resolve();
        }
      });

      return this.client;
    } catch (error) {
      logger.error('Redis 连接失败:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * 获取 Redis 客户端实例
   */
  getClient() {
    return this.client;
  }

  /**
   * 检查连接状态
   */
  isReady() {
    return this.client && this.isConnected && this.client.status === 'ready';
  }

  /**
   * 健康检查 - 执行ping命令测试连接
   */
  async healthCheck() {
    try {
      if (!this.client) {
        return false;
      }

      // 使用ping命令测试连接
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.warn('Redis 健康检查失败:', error.message);
      return false;
    }
  }

  /**
   * 确保连接可用 - 如果连接不可用则尝试重连
   */
  async ensureConnection() {
    try {
      // 首先检查基本状态
      if (this.isReady()) {
        // 执行健康检查
        const isHealthy = await this.healthCheck();
        if (isHealthy) {
          return true;
        }
        logger.warn('Redis 连接不健康，尝试重连...');
      }

      // 如果连接不可用，尝试重连
      logger.info('🔄 尝试重新连接Redis...');
      await this.connect();
      return this.isReady();
    } catch (error) {
      logger.error('Redis 连接确保失败:', error.message);
      return false;
    }
  }

  /**
   * 设置键值对
   * @param {string} key - 键
   * @param {any} value - 值
   * @param {number} ttl - 过期时间（秒）
   */
  async set(key, value, ttl = null) {
    try {
      // 确保连接可用
      const isConnected = await this.ensureConnection();
      if (!isConnected) {
        throw new Error('Redis 连接不可用');
      }

      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttl) {
        return await this.client.setex(key, ttl, stringValue);
      } else {
        return await this.client.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`Redis SET 操作失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 获取键值
   * @param {string} key - 键
   */
  async get(key) {
    try {
      // 确保连接可用
      const isConnected = await this.ensureConnection();
      if (!isConnected) {
        throw new Error('Redis 连接不可用');
      }

      const value = await this.client.get(key);

      if (value === null) {
        return null;
      }

      // 尝试解析 JSON，如果失败则返回原始字符串
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error(`Redis GET 操作失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 删除键
   * @param {string|string[]} keys - 键或键数组
   */
  async del(keys) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }

      return await this.client.del(keys);
    } catch (error) {
      logger.error(`Redis DEL 操作失败 [${keys}]:`, error);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 键
   */
  async exists(key) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }

      return (await this.client.exists(key)) === 1;
    } catch (error) {
      logger.error(`Redis EXISTS 操作失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   * @param {string} key - 键
   * @param {number} seconds - 过期时间（秒）
   */
  async expire(key, seconds) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }

      return (await this.client.expire(key, seconds)) === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE 操作失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 批量删除键（支持模式匹配）
   * @param {string} pattern - 键模式
   */
  async deletePattern(pattern) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }

      const keys = await this.client.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      return await this.client.del(keys);
    } catch (error) {
      logger.error(`Redis 批量删除操作失败 [${pattern}]:`, error);
      return 0;
    }
  }

  /**
   * 获取所有匹配的键
   * @param {string} pattern - 键模式
   */
  async keys(pattern) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }

      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Redis KEYS 操作失败 [${pattern}]:`, error);
      return [];
    }
  }

  /**
   * ZSET 操作：添加成员
   * @param {string} key - ZSET键名
   * @param {number} score - 分数（时间戳）
   * @param {string} member - 成员
   */
  async zadd(key, score, member) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      return await this.client.zadd(key, score, member);
    } catch (error) {
      logger.error(`Redis ZADD 操作失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * ZSET 操作：获取成员分数
   * @param {string} key - ZSET键名
   * @param {string} member - 成员
   */
  async zscore(key, member) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      const score = await this.client.zscore(key, member);
      return score ? parseFloat(score) : null;
    } catch (error) {
      logger.error(`Redis ZSCORE 操作失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * ZSET 操作：获取按分数排序的成员列表（降序）
   * @param {string} key - ZSET键名
   * @param {number} start - 起始索引
   * @param {number} stop - 结束索引
   */
  async zrevrange(key, start = 0, stop = -1) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      return await this.client.zrevrange(key, start, stop);
    } catch (error) {
      logger.error(`Redis ZREVRANGE 操作失败 [${key}]:`, error);
      return [];
    }
  }

  /**
   * ZSET 操作：删除成员
   * @param {string} key - ZSET键名
   * @param {string|string[]} members - 成员或成员数组
   */
  async zrem(key, members) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      const memberArray = Array.isArray(members) ? members : [members];
      return await this.client.zrem(key, ...memberArray);
    } catch (error) {
      logger.error(`Redis ZREM 操作失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * ZSET 操作：获取成员数量
   * @param {string} key - ZSET键名
   */
  async zcard(key) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      return await this.client.zcard(key);
    } catch (error) {
      logger.error(`Redis ZCARD 操作失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * ZSET 操作：删除分数范围内的成员（删除最旧的）
   * @param {string} key - ZSET键名
   * @param {number} count - 保留的数量，删除超出部分
   */
  async zremrangebyrank(key, count) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      // 保留前count个，删除剩余的（从0开始索引，保留0到count-1，删除count到末尾）
      const total = await this.client.zcard(key);
      if (total > count) {
        // 删除从count开始到最后的所有成员（保留最新的count个）
        return await this.client.zremrangebyrank(key, count, -1);
      }
      return 0;
    } catch (error) {
      logger.error(`Redis ZREMRANGEBYRANK 操作失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * Hash 操作：设置字段
   * @param {string} key - Hash键名
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   */
  async hset(key, field, value) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return await this.client.hset(key, field, stringValue);
    } catch (error) {
      logger.error(`Redis HSET 操作失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * Hash 操作：获取字段
   * @param {string} key - Hash键名
   * @param {string} field - 字段名
   */
  async hget(key, field) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      const value = await this.client.hget(key, field);
      if (value === null) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error(`Redis HGET 操作失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * Hash 操作：获取所有字段
   * @param {string} key - Hash键名
   */
  async hgetall(key) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      const data = await this.client.hgetall(key);
      if (!data || Object.keys(data).length === 0) return {};

      const result = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    } catch (error) {
      logger.error(`Redis HGETALL 操作失败 [${key}]:`, error);
      return {};
    }
  }

  /**
   * Hash 操作：删除字段
   * @param {string} key - Hash键名
   * @param {string|string[]} fields - 字段名或字段数组
   */
  async hdel(key, fields) {
    try {
      if (!this.isReady()) {
        await this.connect();
      }
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      return await this.client.hdel(key, ...fieldArray);
    } catch (error) {
      logger.error(`Redis HDEL 操作失败 [${key}]:`, error);
      return 0;
    }
  }

  /**
   * 缓存包装器 - 如果缓存中有数据则返回，否则执行回调并缓存结果
   * @param {string} key - 缓存键
   * @param {Function} callback - 获取数据的回调函数
   * @param {number} ttl - 缓存时间（秒）
   */
  async cached(key, callback, ttl = 3600) {
    try {
      // 先尝试从缓存获取
      const cached = await this.get(key);
      if (cached !== null) {
        logger.info(`✅ 缓存命中 [${key}]`);
        return cached;
      }

      // 缓存未命中，执行回调获取数据
      logger.info(`❌ 缓存未命中，执行回调 [${key}]`);
      const result = await callback();

      // 将结果缓存
      if (result !== null && result !== undefined) {
        await this.set(key, result, ttl);
        logger.info(`💾 数据已缓存 [${key}] TTL: ${ttl}s`);
      }

      return result;
    } catch (error) {
      logger.error(`缓存包装器执行失败 [${key}]:`, error);
      // 如果缓存操作失败，直接执行回调
      return await callback();
    }
  }

  /**
   * 获取 Redis 信息
   */
  async getInfo() {
    try {
      if (!this.isReady()) {
        return null;
      }

      const info = await this.client.info();
      return info;
    } catch (error) {
      logger.error('获取 Redis 信息失败:', error);
      return null;
    }
  }

  /**
   * 关闭连接
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('🔌 Redis 连接已关闭');
    }
  }
}

// 创建单例实例
const redisManager = new RedisManager();

// 导出实例和类
module.exports = redisManager;
module.exports.RedisManager = RedisManager;
