const BaseSocketHandler = require('../base-handler');
const visitorStatsService = require('../../services/visitor-stats.service');

/**
 * 访客统计 Socket 处理器
 */
class VisitorHandler extends BaseSocketHandler {
  constructor() {
    super('Visitor');

    this.on('visitor:activity', this.handleActivity);
    this.on('visitor:page_change', this.handlePageChange);
    this.on('visitor:get_stats', this.handleGetStats);
  }

  /**
   * 处理访客活动上报
   */
  async handleActivity(socket, io, data) {
    const { location, device, browser, page, pageTitle } = data;
    const deviceId = socket.clientInfo?.deviceId;

    if (!deviceId || socket.clientInfo.isStatusMonitor) {
      return;
    }

    visitorStatsService.recordActivity({
      deviceId,
      location,
      device,
      browser,
      page,
      pageTitle,
    });

    this.log('info', '记录访客活动', {
      deviceId: deviceId.substring(0, 8),
      page,
    });
  }

  /**
   * 处理页面切换
   */
  async handlePageChange(socket, io, data) {
    const { page, pageTitle } = data;
    const deviceId = socket.clientInfo?.deviceId;

    if (!deviceId || !page) {
      return;
    }

    visitorStatsService.updateVisitorPage(deviceId, page, pageTitle);

    this.log('info', '页面切换', {
      deviceId: deviceId.substring(0, 8),
      page,
    });
  }

  /**
   * 获取访客统计
   */
  async handleGetStats(socket, io, data) {
    const socketManager = require('../../utils/socket');
    const roomsInfo = socketManager.getRoomsInfo();
    const stats = visitorStatsService.getStats({ roomCount: roomsInfo });

    this.emit(socket, 'visitor:stats', stats);
  }
}

module.exports = new VisitorHandler();
