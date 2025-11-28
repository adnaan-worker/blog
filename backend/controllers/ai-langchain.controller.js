const { aiService, writingService } = require('@/services/ai');
const { aiQuotaService } = require('@/services/ai-quota.service');
const { aiQueue, queueEvents } = require('@/queues/ai-queue');
const { asyncHandler } = require('@/utils/response');
const { logger } = require('@/utils/logger');
const promptManager = require('@/services/ai/prompts');

/**
 * AI LangChain 控制器
 * 基于 LangChain 的全新 AI 接口
 */

/**
 * 聊天接口（支持可选记忆）
 * 如果传入 sessionId 则使用记忆，否则为无记忆聊天
 */
exports.chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user?.id || req.ip;

  if (!message || message.trim() === '') {
    return res.apiValidationError([{ field: 'message', message: '消息不能为空' }]);
  }

  // 检查配额
  const quota = await aiQuotaService.checkChatQuota(userId);
  if (!quota.available) {
    return res.apiError(`每日聊天次数已达上限(${quota.limit})`, 429);
  }

  // 调用 AI 服务（始终使用博客助手身份）
  const systemPrompt = promptManager.getSystemPrompt('blog');
  const response = await aiService.chat(message, { systemPrompt });

  // 更新配额
  await aiQuotaService.incrementChatUsage(userId);

  return res.apiSuccess({
    message: response,
    sessionId: sessionId || null,
    timestamp: new Date().toISOString(),
  });
});

/**
 * 生成文章
 */
exports.generateArticle = asyncHandler(async (req, res) => {
  const { title, keywords, wordCount, style } = req.body;
  const userId = req.user?.id || req.ip;

  if (!title) {
    return res.apiValidationError([{ field: 'title', message: '标题不能为空' }]);
  }

  // 检查配额
  const quota = await aiQuotaService.checkGenerateQuota(userId);
  if (!quota.available) {
    return res.apiError(`每日生成次数已达上限(${quota.limit})`, 429);
  }

  const content = await writingService.generateArticle({
    title,
    keywords,
    wordCount,
    style,
  });

  // 更新配额
  await aiQuotaService.incrementGenerateUsage(userId);

  return res.apiSuccess({
    content,
    timestamp: new Date().toISOString(),
  });
});

/**
 * 获取用户配额
 */
exports.getQuota = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.ip;

  const quota = await aiQuotaService.getQuotaStats(userId);

  return res.apiSuccess(quota);
});

/**
 * 获取 AI 服务状态
 */
exports.getStatus = asyncHandler(async (req, res) => {
  const info = aiService.getInfo();

  return res.apiSuccess(info);
});

/**
 * 生成标题（异步任务，立即返回任务ID）
 */
exports.generateTitle = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?.id || req.ip;

  if (!content || content.trim() === '') {
    return res.apiValidationError([{ field: 'content', message: '内容不能为空' }]);
  }

  // 检查配额
  const quota = await aiQuotaService.checkGenerateQuota(userId);
  if (!quota.available) {
    return res.apiError(`每日生成次数已达上限(${quota.limit})`, 429);
  }

  // 添加到队列（不等待完成）
  const job = await aiQueue.add('generate_title', {
    action: 'generate_title',
    userId,
    params: { content },
  });

  // 立即返回任务ID
  return res.apiSuccess({
    jobId: job.id,
    status: 'processing',
    message: '任务已创建，请轮询查询状态',
  });
});

/**
 * 生成摘要（异步任务，立即返回任务ID）
 */
exports.generateSummary = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?.id || req.ip;

  if (!content || content.trim() === '') {
    return res.apiValidationError([{ field: 'content', message: '内容不能为空' }]);
  }

  // 检查配额
  const quota = await aiQuotaService.checkGenerateQuota(userId);
  if (!quota.available) {
    return res.apiError(`每日生成次数已达上限(${quota.limit})`, 429);
  }

  // 添加到队列（不等待完成）
  const job = await aiQueue.add('generate_summary', {
    action: 'generate_summary',
    userId,
    params: { content },
  });

  // 立即返回任务ID
  return res.apiSuccess({
    jobId: job.id,
    status: 'processing',
    message: '任务已创建，请轮询查询状态',
  });
});

/**
 * 查询任务状态
 */
exports.getTaskStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await aiQueue.getJob(jobId);

  if (!job) {
    return res.apiError('任务不存在', 404);
  }

  const state = await job.getState();
  const progress = job.progress || 0;

  let result = null;
  if (state === 'completed') {
    result = job.returnvalue;

    // 处理标题结果（生成多个变体）
    if (job.data.action === 'generate_title' && result) {
      const baseTitle = result.trim();
      const titles = [
        baseTitle,
        `${baseTitle}详解`,
        `深入理解${baseTitle}`,
        `${baseTitle}实战指南`,
        `${baseTitle}核心要点`,
      ]
        .filter((t, index, self) => self.indexOf(t) === index && t.length <= 30)
        .slice(0, 5);
      result = { titles };
    } else if (job.data.action === 'generate_summary' && result) {
      result = { summary: result };
    }
  }

  return res.apiSuccess({
    jobId,
    status: state, // 'waiting', 'active', 'completed', 'failed'
    progress,
    result,
    failedReason: job.failedReason || null,
  });
});
