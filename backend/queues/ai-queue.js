const { Queue, Worker } = require('bullmq');
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

// AI 任务处理器
async function processAITask(job) {
  const { action, userId, params } = job.data;

  logger.info('处理 AI 任务', { jobId: job.id, action, userId });

  // 检查配额
  const quota = await aiQuotaService.checkGenerateQuota(userId);
  if (!quota.available) {
    throw new Error(`每日生成次数已达上限(${quota.limit})`);
  }

  let result;

  switch (action) {
    case 'generate_article':
      result = await aiWriting.generateArticle(params);
      break;

    case 'polish':
      result = await aiWriting.polishText(params.content, params.style);
      break;

    case 'improve':
      result = await aiWriting.improveText(params.content, params.improvements);
      break;

    case 'expand':
      result = await aiWriting.expandContent(params.content, params.length);
      break;

    case 'summarize':
      result = await aiWriting.summarizeContent(params.content, params.length);
      break;

    case 'continue':
      result = await aiWriting.continueContent(params.content, params.length);
      break;

    case 'rewrite':
      result = await aiWriting.rewriteStyle(params.content, params.style);
      break;

    case 'translate':
      result = await aiWriting.translateContent(params.content, params.targetLang);
      break;

    case 'generate_title':
      result = await aiWriting.generateTitle(params.content, params.keywords);
      break;

    case 'generate_summary':
      result = await aiWriting.generateSummary(params.content);
      break;

    case 'generate_outline':
      result = await aiWriting.generateOutline(params.topic, params.keywords);
      break;

    default:
      throw new Error(`不支持的操作类型: ${action}`);
  }

  // 更新配额
  await aiQuotaService.incrementGenerateUsage(userId);

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
};
