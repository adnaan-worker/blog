const visitorHandler = require('./handlers/visitor.handler');
const statusHandler = require('./handlers/status.handler');
const aiHandler = require('./handlers/ai.handler');

/**
 * 注册所有 Socket 处理器
 * @param {Socket} socket - Socket 实例
 * @param {Server} io - Socket.IO 服务器实例
 */
function registerAllHandlers(socket, io) {
  visitorHandler.register(socket, io);
  statusHandler.register(socket, io);
  aiHandler.register(socket, io);
}

module.exports = {
  registerAllHandlers,
  visitorHandler,
  statusHandler,
  aiHandler,
};
