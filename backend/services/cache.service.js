const redisManager = require('../utils/redis');

/**
 * 缓存服务
 * 提供Redis缓存功能，用于提高API性能
 * 当Redis不可用时，将直接调用原始函数
 */
class CacheService {
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（秒），默认1小时
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value, ttl = 3600) {
    try {
      const result = await redisManager.set(key, value, ttl);
      return result !== null;
    } catch (error) {
      console.error(`缓存设置失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Promise<any>} 缓存值，不存在则返回null
   */
  async get(key) {
    try {
      return await redisManager.get(key);
    } catch (error) {
      console.error(`缓存获取失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param {string|string[]} keys - 缓存键或键数组
   * @returns {Promise<number>} 删除的键数量
   */
  async del(keys) {
    try {
      return await redisManager.del(keys);
    } catch (error) {
      console.error(`缓存删除失败 [${keys}]:`, error);
      return 0;
    }
  }

  /**
   * 批量删除缓存（支持模式匹配）
   * @param {string} pattern - 键模式，如 'user:*'
   * @returns {Promise<number>} 删除的键数量
   */
  async deletePattern(pattern) {
    try {
      return await redisManager.deletePattern(pattern);
    } catch (error) {
      console.error(`批量删除缓存失败 [${pattern}]:`, error);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    try {
      return await redisManager.exists(key);
    } catch (error) {
      console.error(`检查缓存存在性失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   * @param {string} key - 缓存键
   * @param {number} seconds - 过期时间（秒）
   * @returns {Promise<boolean>} 是否成功
   */
  async expire(key, seconds) {
    try {
      return await redisManager.expire(key, seconds);
    } catch (error) {
      console.error(`设置过期时间失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 缓存包装器 - 如果缓存中有数据则返回，否则执行回调并缓存结果
   * @param {string} key - 缓存键
   * @param {Function} callback - 获取数据的回调函数
   * @param {number} ttl - 缓存时间（秒），默认1小时
   * @returns {Promise<any>} 数据
   */
  async cached(key, callback, ttl = 3600) {
    try {
      return await redisManager.cached(key, callback, ttl);
    } catch (error) {
      console.error(`缓存包装器执行失败 [${key}]:`, error);
      // 如果缓存操作失败，直接执行回调
      return await callback();
    }
  }

  /**
   * 获取或设置缓存（别名方法，为了兼容性）
   * @param {string} key - 缓存键
   * @param {Function} callback - 获取数据的回调函数
   * @param {number} ttl - 缓存时间（秒），默认1小时
   * @returns {Promise<any>} 数据
   */
  async getOrSet(key, callback, ttl = 3600) {
    return await this.cached(key, callback, ttl);
  }

  /**
   * 获取Redis连接状态
   * @returns {boolean} 是否连接
   */
  isConnected() {
    return redisManager.isReady();
  }

  /**
   * 获取Redis信息
   * @returns {Promise<string|null>} Redis信息
   */
  async getInfo() {
    try {
      return await redisManager.getInfo();
    } catch (error) {
      console.error('获取Redis信息失败:', error);
      return null;
    }
  }

  /**
   * 清空所有缓存
   * @returns {Promise<boolean>} 是否成功
   */
  async flush() {
    try {
      const client = redisManager.getClient();
      if (client && redisManager.isReady()) {
        await client.flushdb();
        logger.info('缓存已清空');
        return true;
      }
      return false;
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  }

  /**
   * 获取所有匹配的键
   * @param {string} pattern - 键模式
   * @returns {Promise<string[]>} 键列表
   */
  async keys(pattern) {
    try {
      return await redisManager.keys(pattern);
    } catch (error) {
      console.error(`获取键列表失败 [${pattern}]:`, error);
      return [];
    }
  }

  /**
   * 批量获取缓存
   * @param {string[]} keys - 键数组
   * @returns {Promise<any[]>} 值数组
   */
  async mget(keys) {
    try {
      const client = redisManager.getClient();
      if (!client || !redisManager.isReady()) {
        await redisManager.connect();
      }

      const values = await client.mget(keys);
      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error(`批量获取缓存失败 [${keys}]:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * 批量设置缓存
   * @param {Object} keyValuePairs - 键值对对象
   * @param {number} ttl - 过期时间（秒）
   * @returns {Promise<boolean>} 是否成功
   */
  async mset(keyValuePairs, ttl = null) {
    try {
      const client = redisManager.getClient();
      if (!client || !redisManager.isReady()) {
        await redisManager.connect();
      }

      const pairs = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pairs.push(key);
        pairs.push(typeof value === 'string' ? value : JSON.stringify(value));
      }

      await client.mset(pairs);

      // 如果指定了TTL，为所有键设置过期时间
      if (ttl) {
        const expirePromises = Object.keys(keyValuePairs).map(key => client.expire(key, ttl));
        await Promise.all(expirePromises);
      }

      return true;
    } catch (error) {
      console.error('批量设置缓存失败:', error);
      return false;
    }
  }

  /**
   * 关闭连接
   */
  async disconnect() {
    try {
      await redisManager.disconnect();
    } catch (error) {
      console.error('关闭Redis连接失败:', error);
    }
  }
}

// 创建单例实例
const cacheService = new CacheService();

module.exports = cacheService;
