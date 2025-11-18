const BaseSocketHandler = require('../base-handler');
const visitorStatsService = require('../../services/visitor-stats.service');
const { VISITOR_EVENTS } = require('../../utils/socket-events');
const { SocketValidationError } = require('../../utils/socket-response');

/**
 * 访客统计 Socket 处理器
 */
class VisitorHandler extends BaseSocketHandler {
  constructor() {
    super('Visitor');

    // 使用事件常量
    this.on(VISITOR_EVENTS.ACTIVITY, this.handleActivity);
    this.on(VISITOR_EVENTS.PAGE_CHANGE, this.handlePageChange);
    this.on(VISITOR_EVENTS.GET_STATS, this.handleGetStats);
  }

  /**
   * 处理访客活动上报
   */
  async handleActivity(socket, io, data) {
    // 数据验证
    if (!data || !data.location || !data.device || !data.page) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['location', 'device', 'page'],
        received: data ? Object.keys(data) : [],
      });
    }

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
    // 数据验证
    if (!data || !data.page) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['page'],
        received: data ? Object.keys(data) : [],
      });
    }

    const { page, pageTitle } = data;
    const deviceId = socket.clientInfo?.deviceId;

    if (!deviceId) {
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

    // 使用统一的事件名称
    this.emit(socket, VISITOR_EVENTS.STATS_UPDATE, stats);
  }
}

module.exports = new VisitorHandler();
