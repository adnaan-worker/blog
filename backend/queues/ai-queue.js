const { Queue, Worker, QueueEvents } = require('bullmq');
const aiWriting = require('../services/langchain/ai-writing.service');
const { aiQuotaService } = require('../services/ai-quota.service');
const { logger } = require('../utils/logger');
const queueConfig = require('../config/queue.config');

/**
 * AI 任务队列 (BullMQ)
 */

// 创建队列
const aiQueue = new Queue('ai-tasks', {
  connection: queueConfig.getConnection(),
  defaultJobOptions: queueConfig.getDefaultJobOptions(),
});

// 创建队列事件监听器（用于 waitUntilFinished）
const queueEvents = new QueueEvents('ai-tasks', {
  connection: queueConfig.getConnection(),
});

// AI 任务处理器
async function processAITask(job) {
  const { action, userId, params } = job.data;

  logger.info('处理 AI 任务', { jobId: job.id, action, userId });

  // 更新进度：开始处理
  await job.updateProgress(10);

  // 检查配额
  const quota = await aiQuotaService.checkGenerateQuota(userId);
  if (!quota.available) {
    throw new Error(`每日生成次数已达上限(${quota.limit})`);
  }

  // 更新进度：配额检查完成
  await job.updateProgress(20);

  let result;

  switch (action) {
    case 'generate_article':
      await job.updateProgress(30);
      result = await aiWriting.generateArticle(params);
      await job.updateProgress(90);
      break;

    case 'generate_title':
      await job.updateProgress(30);
      result = await aiWriting.generateTitle(params.content, params.keywords);
      await job.updateProgress(90);
      break;

    case 'generate_summary':
      await job.updateProgress(30);
      result = await aiWriting.generateSummary(params.content);
      await job.updateProgress(90);
      break;

    default:
      throw new Error(`不支持的操作类型: ${action}`);
  }

  // 更新配额
  await aiQuotaService.incrementGenerateUsage(userId);

  // 更新进度：完成
  await job.updateProgress(100);

  logger.info('AI 任务完成', { jobId: job.id, action });

  return result;
}

// 创建 Worker
const aiWorker = new Worker('ai-tasks', processAITask, {
  connection: queueConfig.getConnection(),
  ...queueConfig.getWorkerOptions(),
});

// Worker 事件监听
aiWorker.on('completed', job => {
  logger.info('任务完成', { jobId: job.id });
});

aiWorker.on('failed', (job, err) => {
  logger.error('任务失败', { jobId: job?.id, error: err.message });
});

aiWorker.on('error', err => {
  logger.error('Worker 错误', { error: err.message });
});

module.exports = {
  aiQueue,
  aiWorker,
  queueEvents,
};
