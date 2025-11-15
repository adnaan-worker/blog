const { aiQueue, aiWorker } = require('./ai-queue');
const { logger } = require('../utils/logger');

/**
 * 初始化所有队列 (BullMQ)
 */
async function initializeQueues() {
  logger.info('✅ BullMQ 队列系统已启动', { concurrency: 3 });
  // BullMQ Worker 会自动启动，无需手动操作
}

/**
 * 关闭所有队列
 */
async function shutdownQueues() {
  logger.info('关闭 BullMQ 队列系统...');

  try {
    await aiWorker.close();
    await aiQueue.close();
    logger.info('✅ 队列系统已关闭');
  } catch (error) {
    logger.error('关闭队列系统失败', { error: error.message });
  }
}

module.exports = {
  initializeQueues,
  shutdownQueues,
  aiQueue,
  aiWorker,
};
