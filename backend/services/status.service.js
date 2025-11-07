const { logger } = require('../utils/logger');
const redisManager = require('../utils/redis');

class StatusService {
  constructor() {
    // Redis 键名常量
    this.REDIS_KEYS = {
      CURRENT_STATUS: 'status:current',
      MUSIC_STATUS: 'status:music', // 独立的音乐状态槽
      LAST_PUSH_TIME: 'status:last_push',
      STATUS_HISTORY: 'status:history',
      ACTIVE_APPS_SET: 'status:active_apps:set', // ZSET: 存储活跃应用（score为时间戳）
      ACTIVE_APPS_HASH: 'status:active_apps:hash', // Hash: 存储应用状态数据
    };

    // 配置参数
    this.CONFIG = {
      INACTIVE_THRESHOLD: 30 * 60 * 1000, // 30分钟无活动则认为不活跃
      CLEANUP_THRESHOLD: 60 * 60 * 1000, // 1小时无活动则清理缓存
      AUTO_CLEANUP_INTERVAL: 5 * 60 * 1000, // 每5分钟检查一次
      MUSIC_EXPIRE_TIME: 3600, // 音乐状态1小时过期
      MAX_ACTIVE_APPS: 3, // 最多保留3个活跃应用
      APP_EXPIRE_TIME: 86400, // 应用状态24小时过期（刷新机制）
    };

    // 启动自动清理任务
    this.startAutoCleanup();
  }

  /**
   * 验证小工具解析的数据格式
   * 如果数据不完整，提供默认值
   */
  validateAppInfo(statusData) {
    // 如果小工具提供了完整的解析数据，直接使用
    if (statusData.appName && statusData.appIcon && statusData.displayInfo) {
      return {
        appIcon: statusData.appIcon,
        appType: statusData.appType || 'app',
        appName: statusData.appName,
        displayInfo: statusData.displayInfo,
        action: statusData.action || '使用中',
      };
    }

    // 如果数据不完整，提供默认值
    return {
      appIcon: 'default',
      appType: 'app',
      appName: statusData.active_app || '无活动',
      displayInfo: statusData.active_app || '无活动',
      action: '使用中', // 默认动作状态
    };
  }

  /**
   * 检查状态是否发生变化
   */
  async hasStatusChanged(newStatusData) {
    try {
      const currentStatus = await redisManager.get(this.REDIS_KEYS.CURRENT_STATUS);

      if (!currentStatus) {
        return true; // 没有缓存数据，认为是变化
      }

      // 标准化比较字段
      const normalize = str => (str ? str.trim() : '');

      const currentApp = normalize(currentStatus.active_app);
      const newApp = normalize(newStatusData.active_app);

      // 只比较应用信息变化
      return currentApp !== newApp;
    } catch (error) {
      logger.error('检查状态变化失败:', error);
      return true; // 发生错误时，认为状态改变，确保数据更新
    }
  }

  /**
   * 刷新过期时间（即使状态没有变化）
   * 用于避免因同一应用长时间使用导致其他应用过期
   */
  async refreshExpireTime(statusData) {
    try {
      const appInfo = this.validateAppInfo(statusData);
      const appName = appInfo.appName;
      const currentTime = Date.now();

      // 1. 更新 ZSET 中当前应用的 score（刷新时间戳）
      // 这样即使应用一直在用，时间戳也会更新，保持最新状态
      await redisManager.zadd(this.REDIS_KEYS.ACTIVE_APPS_SET, currentTime, appName);

      // 2. 刷新 ZSET 和 Hash 的过期时间
      // 关键：即使状态没有变化，也要刷新过期时间，确保其他应用不会过期
      await redisManager.expire(this.REDIS_KEYS.ACTIVE_APPS_SET, this.CONFIG.APP_EXPIRE_TIME);
      await redisManager.expire(this.REDIS_KEYS.ACTIVE_APPS_HASH, this.CONFIG.APP_EXPIRE_TIME);

      // 3. 如果当前应用在Hash中已存在，更新其last_updated时间
      const existingStatus = await redisManager.hget(this.REDIS_KEYS.ACTIVE_APPS_HASH, appName);
      if (existingStatus) {
        existingStatus.last_updated = new Date().toISOString();
        await redisManager.hset(this.REDIS_KEYS.ACTIVE_APPS_HASH, appName, existingStatus);
      }

      // 4. 刷新当前状态的过期时间
      const currentStatus = await redisManager.get(this.REDIS_KEYS.CURRENT_STATUS);
      if (currentStatus) {
        await redisManager.expire(this.REDIS_KEYS.CURRENT_STATUS, this.CONFIG.APP_EXPIRE_TIME);
      }

      logger.debug('🔄 已刷新过期时间', { app: appName });
    } catch (error) {
      logger.error('刷新过期时间失败:', error);
      // 不抛出错误，因为这不是关键操作
    }
  }

  /**
   * 保存状态到 Redis
   * 使用 ZSET + Hash 方案，避免状态丢失
   *
   * 方案说明：
   * 1. ZSET存储活跃应用列表（member: appName, score: 时间戳）
   * 2. Hash存储应用状态数据（field: appName, value: 状态数据）
   * 3. 每次推送时刷新所有应用的过期时间，避免因同一应用长时间使用导致其他应用过期
   * 4. 保持最多 MAX_ACTIVE_APPS 个应用，删除最不活跃的
   */
  async saveStatus(statusData, clientInfo = {}) {
    try {
      // 验证并使用小工具解析的数据
      const appInfo = this.validateAppInfo(statusData);
      const appName = appInfo.appName;

      // 构建完整的状态数据
      const fullStatusData = {
        active_app: statusData.active_app,
        timestamp: statusData.timestamp,
        computer_name: statusData.computer_name,
        ...appInfo,
        client_ip: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(), // 最后更新时间
      };

      // ========== 核心逻辑：使用 ZSET + Hash 维护活跃应用 ==========
      const currentTime = Date.now();

      // 1. 更新 ZSET：将当前应用添加到活跃应用列表（或更新score到最新时间）
      // 如果是已存在的应用，ZADD会更新其score（时间戳），使其成为最新
      await redisManager.zadd(this.REDIS_KEYS.ACTIVE_APPS_SET, currentTime, appName);

      // 2. 更新 Hash：保存应用状态数据
      await redisManager.hset(this.REDIS_KEYS.ACTIVE_APPS_HASH, appName, fullStatusData);

      // 3. 保持最多 MAX_ACTIVE_APPS 个应用，删除最不活跃的（在刷新过期时间之前）
      const appCount = await redisManager.zcard(this.REDIS_KEYS.ACTIVE_APPS_SET);
      if (appCount > this.CONFIG.MAX_ACTIVE_APPS) {
        // 获取需要删除的应用（score最小的，即最不活跃的）
        // 注意：zrevrange 是降序（最新的在前），所以需要获取后面的
        const allApps = await redisManager.zrevrange(this.REDIS_KEYS.ACTIVE_APPS_SET, 0, -1);
        const appsToRemove = allApps.slice(this.CONFIG.MAX_ACTIVE_APPS);

        if (appsToRemove.length > 0) {
          // 从ZSET中删除
          await redisManager.zrem(this.REDIS_KEYS.ACTIVE_APPS_SET, appsToRemove);
          // 从Hash中删除
          await redisManager.hdel(this.REDIS_KEYS.ACTIVE_APPS_HASH, appsToRemove);

          logger.info('🗑️ 删除最不活跃的应用', { apps: appsToRemove, totalBefore: appCount });
        }
      }

      // 4. 刷新过期时间（统一刷新，避免循环）
      // 关键：每次推送时都刷新ZSET和Hash的过期时间，确保即使同一应用长时间使用，其他应用也不会过期
      await redisManager.expire(this.REDIS_KEYS.ACTIVE_APPS_SET, this.CONFIG.APP_EXPIRE_TIME);
      await redisManager.expire(this.REDIS_KEYS.ACTIVE_APPS_HASH, this.CONFIG.APP_EXPIRE_TIME);

      // 🎵 特殊处理：如果是音乐类应用，额外保存到独立的音乐状态槽
      if (appInfo.appType === 'music') {
        await redisManager.set(
          this.REDIS_KEYS.MUSIC_STATUS,
          fullStatusData,
          this.CONFIG.MUSIC_EXPIRE_TIME
        );
        logger.info('🎵 音乐状态已更新', {
          song: appInfo.displayInfo,
          app: appInfo.appName,
        });
      }

      // 5. 保存当前状态（用于快速访问）
      await redisManager.set(
        this.REDIS_KEYS.CURRENT_STATUS,
        fullStatusData,
        this.CONFIG.APP_EXPIRE_TIME
      );

      // 6. 更新最后推送时间
      await redisManager.set(this.REDIS_KEYS.LAST_PUSH_TIME, currentTime.toString(), 3600);

      logger.info('✅ 状态已保存', {
        app: appInfo.appName,
        type: appInfo.appType,
        computer: statusData.computer_name,
        activeAppsCount: await redisManager.zcard(this.REDIS_KEYS.ACTIVE_APPS_SET),
      });

      return fullStatusData;
    } catch (error) {
      logger.error('保存状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前状态和历史记录
   * 🎵 音乐状态会被智能插入到历史记录中
   *
   * 从 ZSET + Hash 中获取活跃应用列表
   */
  async getCurrentStatusWithHistory(limit = 5) {
    try {
      // 检查是否需要清理过期数据
      await this.checkAndCleanupIfNeeded();

      // ========== 从 ZSET + Hash 获取活跃应用 ==========
      // 1. 从ZSET获取活跃应用列表（按时间戳降序，最新的在前）
      const activeAppNames = await redisManager.zrevrange(
        this.REDIS_KEYS.ACTIVE_APPS_SET,
        0,
        limit - 1
      );

      // 2. 从Hash获取所有应用的状态数据
      const allAppData = await redisManager.hgetall(this.REDIS_KEYS.ACTIVE_APPS_HASH);

      // 3. 按ZSET的顺序构建状态列表
      const statusList = [];
      for (const appName of activeAppNames) {
        if (allAppData[appName]) {
          statusList.push(allAppData[appName]);
        }
      }

      // 4. 获取当前状态（最新的）
      const currentStatus = statusList.length > 0 ? statusList[0] : null;

      // 5. 获取历史记录（除当前状态外的其他状态）
      const historyData = statusList.slice(1);

      // 🎵 获取音乐状态
      const musicStatus = await redisManager.get(this.REDIS_KEYS.MUSIC_STATUS);

      // 🎵 智能插入音乐状态：
      // 1. 如果当前状态是音乐，保持不变
      // 2. 如果当前状态不是音乐但有音乐状态，将音乐插入到历史记录第一位
      if (musicStatus) {
        if (currentStatus && currentStatus.appType === 'music') {
          // 当前就是音乐，不需要特殊处理
        } else {
          // 当前不是音乐，将音乐状态插入历史记录开头
          historyData.unshift(musicStatus);
          // 限制历史记录数量
          if (historyData.length > limit) {
            historyData.pop();
          }
        }
      }

      // 兼容旧逻辑：如果ZSET为空，尝试从旧的CURRENT_STATUS获取
      if (!currentStatus) {
        const oldCurrentStatus = await redisManager.get(this.REDIS_KEYS.CURRENT_STATUS);
        if (oldCurrentStatus) {
          return {
            current: oldCurrentStatus,
            history: historyData,
            total_history: historyData.length,
          };
        }
      }

      return {
        current: currentStatus,
        history: historyData,
        total_history: activeAppNames.length,
      };
    } catch (error) {
      logger.error('获取状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取状态历史（从 Redis，简化版）
   */
  async getStatusHistory(page = 1, limit = 20) {
    try {
      const historyKeys = await redisManager.keys(`${this.REDIS_KEYS.STATUS_HISTORY}:*`);
      const total = historyKeys.length;
      const offset = (page - 1) * limit;

      // 分页获取历史记录
      const sortedKeys = historyKeys
        .sort()
        .reverse()
        .slice(offset, offset + limit);
      const historyData = [];

      for (const key of sortedKeys) {
        const data = await redisManager.get(key);
        if (data) {
          historyData.push(data);
        }
      }

      return {
        data: historyData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('获取状态历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取统计信息（简化版，基于 Redis）
   */
  async getStatusStats() {
    try {
      const historyKeys = await redisManager.keys(`${this.REDIS_KEYS.STATUS_HISTORY}:*`);
      const currentStatus = await redisManager.get(this.REDIS_KEYS.CURRENT_STATUS);

      return {
        total_records: historyKeys.length + (currentStatus ? 1 : 0),
        today_records: historyKeys.length + (currentStatus ? 1 : 0), // 简化统计
        current_status: currentStatus ? 'active' : 'inactive',
        last_update: currentStatus ? currentStatus.created_at : null,
      };
    } catch (error) {
      logger.error('获取统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 检查并清理过期数据
   */
  async checkAndCleanupIfNeeded() {
    try {
      const lastPushTime = await redisManager.get(this.REDIS_KEYS.LAST_PUSH_TIME);

      if (!lastPushTime) {
        // 如果没有推送时间记录，清理所有缓存
        await this.clearAllStatusCache();
        return;
      }

      const timeSinceLastPush = Date.now() - parseInt(lastPushTime);

      // 如果超过清理阈值，清理所有缓存
      if (timeSinceLastPush > this.CONFIG.CLEANUP_THRESHOLD) {
        logger.info(
          `🧹 检测到 ${Math.round(timeSinceLastPush / 1000 / 60)} 分钟无活动，清理状态缓存`
        );
        await this.clearAllStatusCache();
      }
    } catch (error) {
      logger.error('检查清理状态失败:', error);
    }
  }

  /**
   * 清理所有状态相关的Redis缓存
   */
  async clearAllStatusCache() {
    try {
      // 清理当前状态
      await redisManager.del([this.REDIS_KEYS.CURRENT_STATUS]);

      // 🎵 清理音乐状态
      await redisManager.del([this.REDIS_KEYS.MUSIC_STATUS]);

      // 清理历史记录（旧方式）
      await redisManager.deletePattern(`${this.REDIS_KEYS.STATUS_HISTORY}:*`);

      // 清理活跃应用ZSET和Hash
      await redisManager.del([this.REDIS_KEYS.ACTIVE_APPS_SET]);
      await redisManager.del([this.REDIS_KEYS.ACTIVE_APPS_HASH]);

      // 清理最后推送时间
      await redisManager.del([this.REDIS_KEYS.LAST_PUSH_TIME]);

      logger.info('✅ 状态缓存已清理');
    } catch (error) {
      logger.error('清理状态缓存失败:', error);
    }
  }

  /**
   * 启动自动清理任务
   */
  startAutoCleanup() {
    // 防止重复启动
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      try {
        await this.checkAndCleanupIfNeeded();
      } catch (error) {
        logger.error('自动清理任务失败:', error);
      }
    }, this.CONFIG.AUTO_CLEANUP_INTERVAL);

    logger.info('🔄 状态缓存自动清理任务已启动', {
      interval: `${this.CONFIG.AUTO_CLEANUP_INTERVAL / 1000}秒`,
      cleanupThreshold: `${this.CONFIG.CLEANUP_THRESHOLD / 1000 / 60}分钟`,
    });
  }

  /**
   * 停止自动清理任务
   */
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('⏹️ 状态缓存自动清理任务已停止');
    }
  }

  /**
   * 检查系统是否处于不活跃状态
   */
  async isSystemInactive() {
    try {
      const lastPushTime = await redisManager.get(this.REDIS_KEYS.LAST_PUSH_TIME);

      if (!lastPushTime) {
        return true; // 没有推送记录，认为不活跃
      }

      const timeSinceLastPush = Date.now() - parseInt(lastPushTime);
      return timeSinceLastPush > this.CONFIG.INACTIVE_THRESHOLD;
    } catch (error) {
      logger.error('检查系统活跃状态失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存状态信息
   */
  async getCacheStatus() {
    try {
      const lastPushTime = await redisManager.get(this.REDIS_KEYS.LAST_PUSH_TIME);
      const currentStatus = await redisManager.get(this.REDIS_KEYS.CURRENT_STATUS);
      const historyKeys = await redisManager.keys(`${this.REDIS_KEYS.STATUS_HISTORY}:*`);

      const timeSinceLastPush = lastPushTime ? Date.now() - parseInt(lastPushTime) : null;
      const isInactive = await this.isSystemInactive();

      return {
        lastPushTime: lastPushTime ? new Date(parseInt(lastPushTime)).toISOString() : null,
        timeSinceLastPush: timeSinceLastPush ? Math.round(timeSinceLastPush / 1000) : null,
        hasCurrentStatus: !!currentStatus,
        historyCount: historyKeys.length,
        isInactive,
        willCleanupIn: timeSinceLastPush
          ? Math.max(0, Math.round((this.CONFIG.CLEANUP_THRESHOLD - timeSinceLastPush) / 1000))
          : null,
      };
    } catch (error) {
      logger.error('获取缓存状态失败:', error);
      return null;
    }
  }
}

module.exports = new StatusService();
