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

  /**
   * 初始化状态相关的 Socket 事件处理器
   */
  initializeSocketHandlers() {
    // 注册状态请求事件处理器
    socketManager.registerEventHandler('status:request', async socket => {
      try {
        // 检查系统是否处于不活跃状态
        const isInactive = await statusService.isSystemInactive();

        let statusData;
        let message;

        if (isInactive) {
          // 系统不活跃时返回空状态
          statusData = { current: null, history: [], total_history: 0 };
          message = '系统处于不活跃状态';
          logger.info('📤 系统不活跃，返回空状态', { socketId: socket.id });
        } else {
          statusData = await statusService.getCurrentStatusWithHistory(3);
          message = '获取状态成功';
          logger.info('📤 发送当前状态', { socketId: socket.id });
        }

        // 统一数据格式
        const responseData = {
          success: true,
          message,
          data: statusData,
          timestamp: new Date().toISOString(),
          isInactive, // 添加活跃状态标识
        };

        socket.emit('status:current', responseData);
      } catch (error) {
        logger.error('发送状态失败:', error);

        const errorResponse = {
          success: false,
          message: '获取状态失败',
          error: error.message,
          timestamp: new Date().toISOString(),
        };

        socket.emit('status:current', errorResponse);
      }
    });

    // 注册Python客户端推送事件处理器（备用Socket方式）
    socketManager.registerEventHandler('status:push', async (socket, io, data) => {
      try {
        logger.info('📨 收到Socket状态推送', { computer: data.computer_name });

        // 构建状态数据
        const statusData = {
          active_app: data.active_app || '',
          timestamp: new Date(data.timestamp || Date.now()),
          computer_name: data.computer_name?.trim() || 'Unknown',
          appName: data.appName,
          appIcon: data.appIcon,
          appType: data.appType,
          displayInfo: data.displayInfo,
          action: data.action,
        };

        // 检查状态变化
        const hasChanged = await statusService.hasStatusChanged(statusData);

        if (!hasChanged) {
          // 即使状态没有变化，也要刷新过期时间，避免其他应用过期
          await statusService.refreshExpireTime(statusData);
          socket.emit('status:push:result', {
            success: true,
            changed: false,
            message: '状态无变化，已刷新过期时间',
          });
          return;
        }

        // 保存状态
        const savedStatus = await statusService.saveStatus(statusData, {
          ip: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent'],
          socketId: socket.id,
        });

        logger.info('📤 状态更新', { app: savedStatus.appName, action: savedStatus.action });

        // 确认推送成功
        socket.emit('status:push:result', {
          success: true,
          changed: true,
          message: '状态更新成功',
        });

        // 广播给所有前端客户端（排除推送者）
        socket.broadcast.emit('status:updated', {
          success: true,
          message: '状态更新',
          data: await statusService.getCurrentStatusWithHistory(3),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('处理Socket状态推送失败:', error);
        socket.emit('status:push:result', {
          success: false,
          message: '处理失败: ' + error.message,
        });
      }
    });
  }

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
