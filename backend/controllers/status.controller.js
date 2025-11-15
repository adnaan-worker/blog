const statusService = require('../services/status.service');
const { logger } = require('../utils/logger');
const socketManager = require('../utils/socket');

class StatusController {
  /**
   * 接收状态推送（统一处理函数）
   * POST /api/status
   */
  async receiveStatus(req, res) {
    try {
      const {
        timestamp,
        computer_name,
        appName,
        appIcon,
        appType,
        displayInfo,
        action,
        active_app,
      } = req.body;

      // 参数验证
      if (!timestamp || !computer_name) {
        return res.apiValidationError(
          [
            { field: 'timestamp', message: '时间戳不能为空' },
            { field: 'computer_name', message: '计算机名称不能为空' },
          ],
          '缺少必要参数'
        );
      }

      // 构建状态数据
      const statusData = {
        active_app: active_app || '',
        timestamp: new Date(timestamp),
        computer_name: computer_name.trim(),
        appName,
        appIcon,
        appType,
        displayInfo,
        action,
      };

      // 检查状态变化
      const hasChanged = await statusService.hasStatusChanged(statusData);

      if (!hasChanged) {
        // 即使状态没有变化，也要刷新过期时间，避免其他应用过期
        await statusService.refreshExpireTime(statusData);
        logger.info('📋 状态无变化，已刷新过期时间', { computer: computer_name });
        return res.apiSuccess({ changed: false }, '状态无变化，已刷新过期时间');
      }

      // 保存状态
      const savedStatus = await statusService.saveStatus(statusData, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      logger.info('📤 状态更新', { app: savedStatus.appName, action: savedStatus.action });

      // 广播给所有前端客户端
      socketManager.broadcast('status:updated', {
        success: true,
        message: '状态更新',
        data: await statusService.getCurrentStatusWithHistory(3),
        timestamp: new Date().toISOString(),
      });

      // 响应推送客户端
      return res.apiSuccess({ changed: true }, '状态更新成功');
    } catch (err) {
      logger.error('状态推送失败:', err);
      return res.apiServerError('状态更新失败', { error: err.message });
    }
  }

  // 旧的 initializeSocketHandlers 已废弃
  // Socket 事件处理器已迁移到 sockets/handlers/status.handler.js

  /**
   * 获取缓存状态信息
   * GET /api/status/cache
   */
  async getCacheStatus(req, res) {
    try {
      const cacheStatus = await statusService.getCacheStatus();

      return res.apiSuccess(cacheStatus, '获取缓存状态成功');
    } catch (error) {
      logger.error('获取缓存状态失败:', error);
      return res.apiServerError('获取缓存状态失败', { error: error.message });
    }
  }

  /**
   * 手动清理缓存
   * DELETE /api/status/cache
   */
  async clearCache(req, res) {
    try {
      await statusService.clearAllStatusCache();

      return res.apiSuccess({ cleared: true }, '缓存清理成功');
    } catch (error) {
      logger.error('清理缓存失败:', error);
      return res.apiServerError('清理缓存失败', { error: error.message });
    }
  }
}

module.exports = new StatusController();
