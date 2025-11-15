const aiProvider = require('../services/langchain/ai-provider.service');
const aiWriting = require('../services/langchain/ai-writing.service');
const { aiQuotaService } = require('../services/ai-quota.service');
const { aiQueue } = require('../queues');
const { asyncHandler } = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * AI LangChain 控制器
 * 基于 LangChain 的全新 AI 接口
 */

/**
 * 简单聊天
 */
exports.chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.id || req.ip;

  if (!message || message.trim() === '') {
    return res.apiValidationError([{ field: 'message', message: '消息不能为空' }]);
  }

  // 检查配额
  const quota = await aiQuotaService.checkChatQuota(userId);
  if (!quota.available) {
    return res.apiError(`每日聊天次数已达上限(${quota.limit})`, 429);
  }

  const response = await aiProvider.chat(message);

  // 更新配额
  await aiQuotaService.incrementChatUsage(userId);

  return res.apiSuccess({
    message: response,
    timestamp: new Date().toISOString(),
  });
});

/**
 * 对话聊天（带记忆）
 */
exports.conversationChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.id || req.ip;

  if (!message || message.trim() === '') {
    return res.apiValidationError([{ field: 'message', message: '消息不能为空' }]);
  }

  // 检查配额
  const quota = await aiQuotaService.checkChatQuota(userId);
  if (!quota.available) {
    return res.apiError(`每日聊天次数已达上限(${quota.limit})`, 429);
  }

  const response = await aiProvider.conversationChat(userId, message);

  // 更新配额
  await aiQuotaService.incrementChatUsage(userId);

  return res.apiSuccess({
    message: response,
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

  const content = await aiWriting.generateArticle({
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
 * 清除对话记忆
 */
exports.clearMemory = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.ip;

  aiProvider.clearMemory(userId);

  return res.apiSuccess(null, '对话记忆已清除');
});

/**
 * 获取 AI 服务状态
 */
exports.getStatus = asyncHandler(async (req, res) => {
  const info = aiProvider.getInfo();

  return res.apiSuccess(info);
});

/**
 * 获取队列统计
 */
exports.getQueueStats = asyncHandler(async (req, res) => {
  const { queueManager } = require('../queues');
  const stats = await queueManager.getAllStats();

  return res.apiSuccess(stats);
});
