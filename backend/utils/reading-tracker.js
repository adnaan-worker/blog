const redisManager = require('./redis');
const { logger } = require('./logger');

/**
 * 阅读追踪工具
 * 使用 Redis 缓存 + 节流策略，避免频繁更新数据库
 *
 * 设计思路：
 * 1. 每次阅读时，先检查 Redis 中的缓存时间
 * 2. 如果距离上次更新不足阈值（默认30分钟），只更新 Redis
 * 3. 如果超过阈值或首次访问，同时更新 Redis 和数据库
 * 4. 降级方案：Redis 失败时直接写数据库
 */
class ReadingTracker {
  /**
   * 更新阈值（分钟）
   * 只有距离上次更新超过此阈值，才会更新数据库
   */
  static UPDATE_THRESHOLD_MINUTES = 30;

  /**
   * Redis 键前缀
   */
  static REDIS_PREFIX = {
    POST: 'reading:post:',
    NOTE: 'reading:note:',
  };

  /**
   * Redis 缓存过期时间（秒）
   * 24小时后自动清理
   */
  static CACHE_TTL = 86400;

  /**
   * 记录文章阅读
   * @param {number} postId - 文章ID
   * @param {Object} postModel - 文章模型实例
   * @returns {Promise<void>}
   */
  static async trackPostReading(postId, postModel) {
    const redisKey = `${this.REDIS_PREFIX.POST}${postId}`;
    const now = new Date();
    const nowISO = now.toISOString();

    try {
      // 1. 检查 Redis 中的缓存
      const cachedTime = await redisManager.get(redisKey);

      if (cachedTime) {
        // 2. 计算距离上次更新的时间差
        const lastUpdate = new Date(cachedTime);
        const minutesDiff = (now - lastUpdate) / (1000 * 60);

        // 3. 如果未超过阈值，只更新 Redis，不写数据库
        if (minutesDiff < this.UPDATE_THRESHOLD_MINUTES) {
          await redisManager.set(redisKey, nowISO, this.CACHE_TTL);
          logger.debug(`文章 ${postId} 阅读时间已缓存（未达阈值）`);
          return;
        }
      }

      // 4. 超过阈值或首次访问，更新数据库
      await postModel.update({ lastReadAt: now });
      logger.info(`文章 ${postId} 阅读时间已更新到数据库`);

      // 5. 更新 Redis 缓存
      await redisManager.set(redisKey, nowISO, this.CACHE_TTL);
    } catch (error) {
      logger.error('记录文章阅读失败:', error);
      // 即使 Redis 失败，也尝试直接更新数据库（降级方案）
      try {
        await postModel.update({ lastReadAt: now });
        logger.warn('Redis 失败，已降级直接写数据库');
      } catch (dbError) {
        logger.error('数据库更新失败:', dbError);
      }
    }
  }

  /**
   * 记录手记阅读
   * @param {number} noteId - 手记ID
   * @param {Object} noteModel - 手记模型实例
   * @returns {Promise<void>}
   */
  static async trackNoteReading(noteId, noteModel) {
    const redisKey = `${this.REDIS_PREFIX.NOTE}${noteId}`;
    const now = new Date();
    const nowISO = now.toISOString();

    try {
      // 1. 检查 Redis 中的缓存
      const cachedTime = await redisManager.get(redisKey);

      if (cachedTime) {
        // 2. 计算距离上次更新的时间差
        const lastUpdate = new Date(cachedTime);
        const minutesDiff = (now - lastUpdate) / (1000 * 60);

        // 3. 如果未超过阈值，只更新 Redis，不写数据库
        if (minutesDiff < this.UPDATE_THRESHOLD_MINUTES) {
          await redisManager.set(redisKey, nowISO, this.CACHE_TTL);
          logger.debug(`手记 ${noteId} 阅读时间已缓存（未达阈值）`);
          return;
        }
      }

      // 4. 超过阈值或首次访问，更新数据库
      await noteModel.update({ lastReadAt: now });
      logger.info(`手记 ${noteId} 阅读时间已更新到数据库`);

      // 5. 更新 Redis 缓存
      await redisManager.set(redisKey, nowISO, this.CACHE_TTL);
    } catch (error) {
      logger.error('记录手记阅读失败:', error);
      // 即使 Redis 失败，也尝试直接更新数据库（降级方案）
      try {
        await noteModel.update({ lastReadAt: now });
        logger.warn('Redis 失败，已降级直接写数据库');
      } catch (dbError) {
        logger.error('数据库更新失败:', dbError);
      }
    }
  }

  /**
   * 获取文章的最后阅读时间（优先从 Redis 获取）
   * @param {number} postId - 文章ID
   * @param {Date|null} dbLastReadAt - 数据库中的最后阅读时间
   * @returns {Promise<Date|null>}
   */
  static async getPostLastReadAt(postId, dbLastReadAt) {
    try {
      const redisKey = `${this.REDIS_PREFIX.POST}${postId}`;
      const cachedTime = await redisManager.get(redisKey);

      if (cachedTime) {
        return new Date(cachedTime);
      }

      return dbLastReadAt ? new Date(dbLastReadAt) : null;
    } catch (error) {
      logger.error('获取文章阅读时间失败:', error);
      return dbLastReadAt ? new Date(dbLastReadAt) : null;
    }
  }

  /**
   * 获取手记的最后阅读时间（优先从 Redis 获取）
   * @param {number} noteId - 手记ID
   * @param {Date|null} dbLastReadAt - 数据库中的最后阅读时间
   * @returns {Promise<Date|null>}
   */
  static async getNoteLastReadAt(noteId, dbLastReadAt) {
    try {
      const redisKey = `${this.REDIS_PREFIX.NOTE}${noteId}`;
      const cachedTime = await redisManager.get(redisKey);

      if (cachedTime) {
        return new Date(cachedTime);
      }

      return dbLastReadAt ? new Date(dbLastReadAt) : null;
    } catch (error) {
      logger.error('获取手记阅读时间失败:', error);
      return dbLastReadAt ? new Date(dbLastReadAt) : null;
    }
  }
}

module.exports = ReadingTracker;
