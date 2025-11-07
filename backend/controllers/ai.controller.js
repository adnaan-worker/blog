const aiService = require('../services/ai.service');
const { aiTaskService } = require('../services/ai-task.service');
const { aiQuotaService } = require('../services/ai-quota.service');
const { asyncHandler } = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * 初始化AI服务
 */
exports.initAI = asyncHandler(async (req, res) => {
  const success = await aiService.init();

  if (success) {
    return res.apiSuccess(
      {
        available: true,
      },
      'AI服务初始化成功'
    );
  } else {
    return res.apiError('AI服务初始化失败', 500);
  }
});

/**
 * 简单聊天
 */
exports.chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user?.id || req.ip;

  if (!message || message.trim() === '') {
    return res.apiValidationError([{ field: 'message', message: '消息不能为空' }], '消息验证失败');
  }

  if (message.length > 2000) {
    return res.apiValidationError(
      [{ field: 'message', message: '消息长度不能超过2000字符' }],
      '消息验证失败'
    );
  }

  try {
    const response = await aiService.chat(message, userId, sessionId);

    return res.apiSuccess(
      {
        message: response,
        sessionId,
        timestamp: new Date().toISOString(),
      },
      '聊天成功'
    );
  } catch (error) {
    if (error.message.includes('已达上限')) {
      return res.apiError(error.message, 429);
    }
    throw error;
  }
});

/**
 * 流式聊天
 */
exports.streamChat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const userId = req.user?.id || req.ip;

  if (!message || message.trim() === '') {
    return res.apiValidationError([{ field: 'message', message: '消息不能为空' }], '消息验证失败');
  }

  if (message.length > 2000) {
    return res.apiValidationError(
      [{ field: 'message', message: '消息长度不能超过2000字符' }],
      '消息验证失败'
    );
  }

  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  try {
    await aiService.streamChat(message, userId, sessionId, chunk => {
      res.write(`data: ${JSON.stringify({ chunk, type: 'chunk' })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message, type: 'error' })}\n\n`);
    res.end();
  }
});

/**
 * 博客助手
 */
exports.blogAssistant = asyncHandler(async (req, res) => {
  const { query, context } = req.body;
  const userId = req.user?.id || req.ip;

  if (!query || query.trim() === '') {
    return res.apiValidationError(
      [{ field: 'query', message: '查询内容不能为空' }],
      '查询验证失败'
    );
  }

  const response = await aiService.blogAssistant(query, userId, context);

  return res.apiSuccess(
    {
      response,
      timestamp: new Date().toISOString(),
    },
    '博客助手回复成功'
  );
});

/**
 * 内容生成
 */
exports.generateContent = asyncHandler(async (req, res) => {
  const { type, params } = req.body;

  if (!type) {
    return res.apiValidationError([{ field: 'type', message: '内容类型不能为空' }], '参数验证失败');
  }

  const validTypes = ['article', 'summary', 'title', 'tags'];
  if (!validTypes.includes(type)) {
    return res.apiValidationError([{ field: 'type', message: '不支持的内容类型' }], '参数验证失败');
  }

  const content = await aiService.generateContent(type, params);

  return res.apiSuccess(
    {
      type,
      content,
      timestamp: new Date().toISOString(),
    },
    '内容生成成功'
  );
});

/**
 * 智能分析
 */
exports.analyze = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  if (!type) {
    return res.apiValidationError([{ field: 'type', message: '分析类型不能为空' }], '参数验证失败');
  }

  const validTypes = ['blog_stats', 'content_quality'];
  if (!validTypes.includes(type)) {
    return res.apiValidationError([{ field: 'type', message: '不支持的分析类型' }], '参数验证失败');
  }

  const analysis = await aiService.analyze(type, data);

  return res.apiSuccess(
    {
      type,
      analysis,
      timestamp: new Date().toISOString(),
    },
    '分析完成'
  );
});

/**
 * 获取聊天历史
 */
exports.getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.ip;
  const history = aiService.getChatHistory(userId);

  return res.apiSuccess(
    {
      history: history.map(msg => ({
        type: msg.constructor.name === 'HumanMessage' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date().toISOString(),
      })),
      count: history.length,
    },
    '获取聊天历史成功'
  );
});

/**
 * 清除聊天历史
 */
exports.clearChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.ip;
  aiService.clearChatHistory(userId);

  return res.apiSuccess(null, '聊天历史已清除');
});

/**
 * 获取AI服务状态
 */
exports.getAIStatus = asyncHandler(async (req, res) => {
  const status = {
    ...(aiService.isServiceAvailable()
      ? aiConfig.getProviderInfo()
      : { provider: 'none', available: false }),
    timestamp: new Date().toISOString(),
  };

  return res.apiSuccess(status, '获取AI服务状态成功');
});

/**
 * 批量内容生成（异步）
 */
exports.batchGenerate = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  const userId = req.user?.id;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.apiValidationError(
      [{ field: 'tasks', message: '任务列表不能为空' }],
      '参数验证失败'
    );
  }

  // 创建异步任务
  const task = await aiTaskService.createTask(userId, 'batch_generate', {
    tasks,
  });

  return res.apiSuccess(
    {
      taskId: task.taskId,
      status: 'pending',
      message: '批量生成任务已提交，请稍后查询结果',
    },
    '任务提交成功'
  );
});

/**
 * 获取任务状态
 */
exports.getTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user?.id;

  const taskStatus = await aiTaskService.getTaskStatus(taskId);

  // 验证任务所有权
  if (taskStatus.userId !== userId) {
    return res.apiError('无权访问此任务', 403);
  }

  return res.apiSuccess(taskStatus, '获取任务状态成功');
});

/**
 * 获取用户任务列表
 */
exports.getUserTasks = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page = 1, limit = 10 } = req.query;

  const tasks = await aiTaskService.getUserTasks(userId, parseInt(page), parseInt(limit));

  return res.apiSuccess(tasks, '获取任务列表成功');
});

/**
 * 获取用户配额
 */
exports.getUserQuota = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const quota = await aiQuotaService.getQuotaStats(userId);

  return res.apiSuccess(quota, '获取配额信息成功');
});

/**
 * 智能写作助手（异步）
 */
exports.writingAssistant = asyncHandler(async (req, res) => {
  const { action, content, params } = req.body;
  const userId = req.user?.id;

  if (!action) {
    return res.apiValidationError(
      [{ field: 'action', message: '操作类型不能为空' }],
      '参数验证失败'
    );
  }

  if (!content) {
    return res.apiValidationError([{ field: 'content', message: '内容不能为空' }], '参数验证失败');
  }

  // 创建异步任务
  const task = await aiTaskService.createTask(userId, 'writing_assistant', {
    action,
    content,
    params,
  });

  return res.apiSuccess(
    {
      taskId: task.taskId,
      status: 'pending',
      message: '写作助手任务已提交，请稍后查询结果',
    },
    '任务提交成功'
  );
});

/**
 * 删除AI任务
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  // 验证参数
  if (!taskId) {
    return res.apiValidationError([{ field: 'taskId', message: '任务ID不能为空' }]);
  }

  // 查找任务
  const task = await aiTaskService.getTaskStatus(taskId);
  if (!task) {
    return res.apiNotFound('任务不存在');
  }

  // 检查任务所有权
  if (task.userId !== userId) {
    return res.apiError('无权删除此任务', 403);
  }

  // 删除任务
  await aiTaskService.deleteTask(taskId);

  res.apiSuccess(null, '任务删除成功');
});
