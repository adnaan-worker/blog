const { logger } = require('../utils/logger');

/**
 * 访客统计服务
 * 负责存储和查询访客实时数据（数据由前端提供）
 * 使用内存存储，类似在线人数统计
 */
class VisitorStatsService {
  constructor() {
    // 使用内存 Map 存储访客活动，设备ID作为key
    this.activities = new Map();
    // 数据变化回调，用于通知 Socket.IO 广播更新
    this.onChangeCallback = null;
  }

  /**
   * 设置数据变化回调
   * @param {Function} callback - 回调函数
   */
  setOnChangeCallback(callback) {
    this.onChangeCallback = callback;
  }

  /**
   * 触发数据变化回调
   */
  _triggerChange() {
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
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
  recordActivity(visitor) {
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

      // 使用内存 Map 存储访客活动
      this.activities.set(deviceId, activity);

      logger.debug(`✅ 记录访客活动: ${location} - ${device} - ${pageTitle}`);

      // 触发数据变化回调
      this._triggerChange();
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
  updateVisitorPage(deviceId, page, pageTitle) {
    try {
      if (!deviceId || !page) return;

      // 获取现有活动
      const activity = this.activities.get(deviceId);

      if (activity) {
        activity.page = page;
        activity.pageTitle = pageTitle || page;
        activity.timestamp = Date.now();

        // 更新活动
        this.activities.set(deviceId, activity);

        logger.debug(`✅ 更新访客页面: ${deviceId} -> ${page}`);

        // 触发数据变化回调
        this._triggerChange();
      }
    } catch (error) {
      logger.error('更新访客页面失败:', error);
    }
  }

  /**
   * 移除访客活动
   * @param {string} deviceId - 设备ID
   */
  removeActivity(deviceId) {
    try {
      if (!deviceId) return;

      this.activities.delete(deviceId);
      logger.debug(`✅ 移除访客活动: ${deviceId}`);

      // 触发数据变化回调
      this._triggerChange();
    } catch (error) {
      logger.error('移除访客活动失败:', error);
    }
  }

  /**
   * 获取所有活动访客统计
   * @param {Object} options - 可选参数
   * @param {Object} options.roomCount - 房间人数统计（可选，用于增强统计信息）
   * @returns {Object} 统计数据
   */
  getStats(options = {}) {
    try {
      const { roomCount = {} } = options;

      // 获取所有活动
      if (this.activities.size === 0) {
        return {
          onlineCount: 0,
          activities: [],
          roomCount: {},
          timestamp: Date.now(),
        };
      }

      // 转换为数组
      const activities = Array.from(this.activities.values());

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
        roomCount, // 添加房间人数统计
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('获取访客统计失败:', error);
      return {
        onlineCount: 0,
        activities: [],
        roomCount: {},
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
  cleanExpiredActivities(expireThreshold = 5 * 60 * 1000) {
    try {
      if (this.activities.size === 0) return 0;

      const now = Date.now();
      let cleaned = 0;
      const toDelete = [];

      // 收集过期活动
      for (const [deviceId, activity] of this.activities.entries()) {
        if (now - activity.timestamp > expireThreshold) {
          toDelete.push(deviceId);
        }
      }

      // 批量删除
      for (const deviceId of toDelete) {
        this.activities.delete(deviceId);
        cleaned++;
      }

      if (cleaned > 0) {
        logger.info(`🧹 清理了 ${cleaned} 个过期访客活动（备用清理）`);
        // 触发数据变化回调
        this._triggerChange();
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
