const redisManager = require('../utils/redis');
const { logger } = require('../utils/logger');

/**
 * 访客统计服务
 * 负责存储和查询访客实时数据（数据由前端提供）
 */
class VisitorStatsService {
  constructor() {
    this.REDIS_ACTIVITY_KEY = 'visitor:activities';
    // 不再使用 TTL，改为在客户端断开连接时手动清理
  }

  /**
   * 记录访客活动
   * @param {Object} visitor - 访客信息（由前端提供）
   * @param {string} visitor.deviceId - 设备ID
   * @param {string} visitor.location - 地区（前端已解析）
   * @param {string} visitor.device - 设备类型（desktop/mobile/tablet）
   * @param {string} visitor.browser - 浏览器类型
   * @param {string} visitor.page - 当前页面路径
   * @param {string} visitor.pageTitle - 页面标题
   */
  async recordActivity(visitor) {
    try {
      const { deviceId, location, device, browser, page, pageTitle } = visitor;

      if (!deviceId) {
        logger.warn('访客设备ID为空，跳过记录');
        return;
      }

      // 构建活动数据
      const activity = {
        id: deviceId,
        location: location || '未知',
        device: device || 'desktop',
        browser: browser || 'Unknown',
        page: page || '/',
        pageTitle: pageTitle || '首页',
        timestamp: Date.now(),
      };

      // 使用 Hash 存储访客活动，设备ID作为field
      // 不设置过期时间，由客户端断开连接时手动清理
      await redisManager
        .getClient()
        .hset(this.REDIS_ACTIVITY_KEY, deviceId, JSON.stringify(activity));

      logger.debug(`✅ 记录访客活动: ${location} - ${device} - ${pageTitle}`);
    } catch (error) {
      logger.error('记录访客活动失败:', error);
    }
  }

  /**
   * 更新访客页面
   * @param {string} deviceId - 设备ID
   * @param {string} page - 新页面路径
   * @param {string} pageTitle - 新页面标题
   */
  async updateVisitorPage(deviceId, page, pageTitle) {
    try {
      if (!deviceId || !page) return;

      // 获取现有活动
      const activityJson = await redisManager.getClient().hget(this.REDIS_ACTIVITY_KEY, deviceId);

      if (activityJson) {
        const activity = JSON.parse(activityJson);
        activity.page = page;
        activity.pageTitle = pageTitle || page;
        activity.timestamp = Date.now();

        // 更新活动
        await redisManager
          .getClient()
          .hset(this.REDIS_ACTIVITY_KEY, deviceId, JSON.stringify(activity));

        logger.debug(`✅ 更新访客页面: ${deviceId} -> ${page}`);
      }
    } catch (error) {
      logger.error('更新访客页面失败:', error);
    }
  }

  /**
   * 移除访客活动
   * @param {string} deviceId - 设备ID
   */
  async removeActivity(deviceId) {
    try {
      if (!deviceId) return;

      await redisManager.getClient().hdel(this.REDIS_ACTIVITY_KEY, deviceId);
      logger.debug(`✅ 移除访客活动: ${deviceId}`);
    } catch (error) {
      logger.error('移除访客活动失败:', error);
    }
  }

  /**
   * 获取所有活动访客统计
   * @returns {Object} 统计数据
   */
  async getStats() {
    try {
      // 获取所有活动
      const activitiesData = await redisManager.getClient().hgetall(this.REDIS_ACTIVITY_KEY);

      if (!activitiesData || Object.keys(activitiesData).length === 0) {
        return {
          onlineCount: 0,
          activities: [],
          timestamp: Date.now(),
        };
      }

      // 解析所有活动
      const activities = Object.values(activitiesData).map(json => JSON.parse(json));

      // 聚合相同 location + device + page 的访客
      const aggregated = new Map();

      activities.forEach(activity => {
        const key = `${activity.location}|${activity.device}|${activity.page}`;

        if (aggregated.has(key)) {
          const existing = aggregated.get(key);
          existing.count++;
          existing.devices.add(activity.id);
        } else {
          aggregated.set(key, {
            id: key,
            location: activity.location,
            device: activity.device,
            page: activity.page,
            pageTitle: activity.pageTitle,
            count: 1,
            devices: new Set([activity.id]),
          });
        }
      });

      // 转换为数组，并按人数排序
      const activitiesList = Array.from(aggregated.values())
        .map(item => ({
          id: item.id,
          location: item.location,
          device: item.device,
          page: item.page,
          pageTitle: item.pageTitle,
          count: item.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // 最多返回10条

      return {
        onlineCount: activities.length,
        activities: activitiesList,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('获取访客统计失败:', error);
      return {
        onlineCount: 0,
        activities: [],
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 清理过期活动（备用方法）
   * 正常情况下，活动数据会在客户端断开连接时自动清理
   * 此方法用于清理可能遗漏的僵尸数据（如异常断开等）
   * @param {number} expireThreshold - 过期阈值（毫秒），默认5分钟
   */
  async cleanExpiredActivities(expireThreshold = 5 * 60 * 1000) {
    try {
      const activitiesData = await redisManager.getClient().hgetall(this.REDIS_ACTIVITY_KEY);

      if (!activitiesData) return 0;

      const now = Date.now();
      let cleaned = 0;

      for (const [deviceId, json] of Object.entries(activitiesData)) {
        try {
          const activity = JSON.parse(json);

          if (now - activity.timestamp > expireThreshold) {
            await redisManager.getClient().hdel(this.REDIS_ACTIVITY_KEY, deviceId);
            cleaned++;
          }
        } catch (error) {
          // 如果解析失败，直接删除
          await redisManager.getClient().hdel(this.REDIS_ACTIVITY_KEY, deviceId);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.info(`🧹 清理了 ${cleaned} 个过期访客活动（备用清理）`);
      }

      return cleaned;
    } catch (error) {
      logger.error('清理过期活动失败:', error);
      return 0;
    }
  }
}

// 创建单例实例
const visitorStatsService = new VisitorStatsService();

module.exports = visitorStatsService;
module.exports.VisitorStatsService = VisitorStatsService;
