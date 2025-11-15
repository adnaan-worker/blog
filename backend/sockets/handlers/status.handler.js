const BaseSocketHandler = require('../base-handler');
const statusService = require('../../services/status.service');

/**
 * 状态更新 Socket 处理器
 */
class StatusHandler extends BaseSocketHandler {
  constructor() {
    super('Status');

    this.on('status:request', this.handleRequest);
    this.on('status:push', this.handlePush);
  }

  /**
   * 处理状态请求
   */
  async handleRequest(socket, io, data) {
    const isInactive = await statusService.isSystemInactive();

    if (isInactive) {
      this.emit(socket, 'status:inactive', {
        message: '系统处于不活跃状态',
      });
      return;
    }

    const status = await statusService.getCurrentStatusWithHistory(3);
    this.emit(socket, 'status:response', status);
  }

  /**
   * 处理状态推送
   */
  async handlePush(socket, io, data) {
    this.log('info', '收到状态推送', { computer: data.computer_name });

    const savedStatus = await statusService.saveStatus({
      appName: data.app_name,
      windowTitle: data.window_title,
      action: data.action,
      computerName: data.computer_name,
    });

    // 广播给所有客户端
    const status = await statusService.getCurrentStatusWithHistory(3);
    this.broadcast(io, 'status:updated', {
      success: true,
      data: status,
    });
  }
}

module.exports = new StatusHandler();
