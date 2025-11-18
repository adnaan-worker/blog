const BaseSocketHandler = require('../base-handler');
const statusService = require('../../services/status.service');
const { STATUS_EVENTS } = require('../../utils/socket-events');
const { socketSuccess, SocketValidationError } = require('../../utils/socket-response');

/**
 * 状态更新 Socket 处理器
 */
class StatusHandler extends BaseSocketHandler {
  constructor() {
    super('Status');

    // 使用事件常量
    this.on(STATUS_EVENTS.REQUEST, this.handleRequest);
    this.on(STATUS_EVENTS.PUSH, this.handlePush);
  }

  /**
   * 处理状态请求
   */
  async handleRequest(socket, io, data) {
    const isInactive = await statusService.isSystemInactive();

    if (isInactive) {
      this.emit(socket, STATUS_EVENTS.INACTIVE, {
        message: '系统处于不活跃状态',
      });
      return;
    }

    const status = await statusService.getCurrentStatusWithHistory(3);

    // 使用统一的响应格式
    this.emit(socket, STATUS_EVENTS.UPDATED, socketSuccess(status, '获取状态成功').toJSON());
  }

  /**
   * 处理状态推送
   */
  async handlePush(socket, io, data) {
    // 数据验证
    if (!data || !data.computer_name || !data.appName) {
      throw new SocketValidationError('缺少必填字段', {
        required: ['computer_name', 'appName'],
        received: data ? Object.keys(data) : [],
      });
    }

    this.log('info', '收到状态推送', {
      computer: data.computer_name,
      appName: data.appName,
      action: data.action,
    });

    // 保存状态
    await statusService.saveStatus(data);

    // 广播给所有客户端
    const status = await statusService.getCurrentStatusWithHistory(3);
    this.broadcast(io, STATUS_EVENTS.UPDATED, socketSuccess(status, '状态更新成功').toJSON());
  }
}

module.exports = new StatusHandler();
