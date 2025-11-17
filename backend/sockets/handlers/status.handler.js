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
    this.log('info', '收到状态推送', {
      computer: data.computer_name,
      appName: data.appName,
      action: data.action,
    });

    // 直接传递完整的数据，让 service 层处理
    const savedStatus = await statusService.saveStatus(data);

    // 广播给所有客户端
    const status = await statusService.getCurrentStatusWithHistory(3);
    this.broadcast(io, 'status:updated', {
      success: true,
      data: status,
    });
  }
}

module.exports = new StatusHandler();
