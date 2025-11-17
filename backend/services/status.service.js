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
   * 验证并规范化状态数据
   */
  validateAppInfo(statusData) {
    // 完整的解析数据，直接使用
    if (statusData.appName && statusData.appIcon && statusData.displayInfo) {
      return {
        appIcon: statusData.appIcon,
        appType: statusData.appType || 'app',
        appName: statusData.appName,
        displayInfo: statusData.displayInfo,
        action: statusData.action || '使用中',
      };
    }

    // 兼容旧格式或返回默认状态
    const fallbackName = statusData.active_app || '无活动';
    const fallbackInfo = statusData.active_app || '暂无活动信息';
    const fallbackAction = statusData.active_app ? '使用中' : '空闲中';

    return {
      appIcon: 'default',
      appType: 'app',
      appName: fallbackName,
      displayInfo: fallbackInfo,
      action: fallbackAction,
    };
  }

  /**
   * 保存状态到 Redis
   * 使用 ZSET + Hash 方案维护活跃应用列表
   */
  async saveStatus(statusData, clientInfo = {}) {
    try {
      const appInfo = this.validateAppInfo(statusData);
      const currentTime = Date.now();
      const now = new Date().toISOString();

      const fullStatusData = {
        active_app: statusData.active_app,
        timestamp: statusData.timestamp,
        computer_name: statusData.computer_name,
        ...appInfo,
        client_ip: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        created_at: now,
        last_updated: now,
      };

      // 更新活跃应用列表
      await redisManager.zadd(this.REDIS_KEYS.ACTIVE_APPS_SET, currentTime, appInfo.appName);
      await redisManager.hset(this.REDIS_KEYS.ACTIVE_APPS_HASH, appInfo.appName, fullStatusData);

      // 保持最多 MAX_ACTIVE_APPS 个应用
      const appCount = await redisManager.zcard(this.REDIS_KEYS.ACTIVE_APPS_SET);
      if (appCount > this.CONFIG.MAX_ACTIVE_APPS) {
        const allApps = await redisManager.zrevrange(this.REDIS_KEYS.ACTIVE_APPS_SET, 0, -1);
        const appsToRemove = allApps.slice(this.CONFIG.MAX_ACTIVE_APPS);

        if (appsToRemove.length > 0) {
          await redisManager.zrem(this.REDIS_KEYS.ACTIVE_APPS_SET, appsToRemove);
          await redisManager.hdel(this.REDIS_KEYS.ACTIVE_APPS_HASH, appsToRemove);
          logger.info('🗑️ 删除最不活跃的应用', { apps: appsToRemove });
        }
      }

      // 刷新过期时间
      await redisManager.expire(this.REDIS_KEYS.ACTIVE_APPS_SET, this.CONFIG.APP_EXPIRE_TIME);
      await redisManager.expire(this.REDIS_KEYS.ACTIVE_APPS_HASH, this.CONFIG.APP_EXPIRE_TIME);

      // 音乐类应用单独保存
      if (appInfo.appType === 'music') {
        await redisManager.set(
          this.REDIS_KEYS.MUSIC_STATUS,
          fullStatusData,
          this.CONFIG.MUSIC_EXPIRE_TIME
        );
        logger.info('🎵 音乐状态已更新', { song: appInfo.displayInfo, app: appInfo.appName });
      }

      // 保存当前状态和最后推送时间
      await redisManager.set(
        this.REDIS_KEYS.CURRENT_STATUS,
        fullStatusData,
        this.CONFIG.APP_EXPIRE_TIME
      );
      await redisManager.set(this.REDIS_KEYS.LAST_PUSH_TIME, currentTime.toString(), 3600);

      logger.info('✅ 状态已保存', {
        app: appInfo.appName,
        type: appInfo.appType,
        computer: statusData.computer_name,
      });

      return fullStatusData;
    } catch (error) {
      logger.error('保存状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前状态和历史记录
   * 音乐状态会被智能插入到历史记录中
   */
  async getCurrentStatusWithHistory(limit = 5) {
    try {
      await this.checkAndCleanupIfNeeded();

      // 从 ZSET + Hash 获取活跃应用
      const activeAppNames = await redisManager.zrevrange(
        this.REDIS_KEYS.ACTIVE_APPS_SET,
        0,
        limit - 1
      );
      const allAppData = await redisManager.hgetall(this.REDIS_KEYS.ACTIVE_APPS_HASH);

      const statusList = activeAppNames.map(appName => allAppData[appName]).filter(Boolean);

      const currentStatus = statusList[0] || null;
      const historyData = statusList.slice(1);

      // 智能插入音乐状态
      const musicStatus = await redisManager.get(this.REDIS_KEYS.MUSIC_STATUS);
      if (musicStatus && (!currentStatus || currentStatus.appType !== 'music')) {
        historyData.unshift(musicStatus);
        if (historyData.length > limit) {
          historyData.pop();
        }
      }

      // 兼容旧逻辑
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
}

module.exports = new StatusService();
