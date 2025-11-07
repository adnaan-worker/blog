const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/ai/init:
 *   post:
 *     summary: 初始化AI服务
 *     description: 初始化AI服务配置
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI服务初始化成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: AI服务初始化失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/init', authMiddleware.verifyToken, aiController.initAI);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI聊天
 *     description: 与AI进行简单对话
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户消息
 *     responses:
 *       200:
 *         description: 聊天成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: 参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/chat', authMiddleware.verifyToken, aiController.chat);

/**
 * @swagger
 * /api/ai/stream-chat:
 *   post:
 *     summary: 流式AI聊天
 *     description: 与AI进行流式对话
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户消息
 *               sessionId:
 *                 type: string
 *                 description: 会话ID
 *     responses:
 *       200:
 *         description: 流式聊天成功
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/stream-chat', authMiddleware.verifyToken, aiController.streamChat);

/**
 * @swagger
 * /api/ai/blog-assistant:
 *   post:
 *     summary: 博客助手
 *     description: 专业的博客写作和运营助手
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: 用户查询
 *               context:
 *                 type: object
 *                 description: 博客上下文信息
 *     responses:
 *       200:
 *         description: 博客助手回复成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/blog-assistant', authMiddleware.verifyToken, aiController.blogAssistant);

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: 内容生成
 *     description: 生成各种类型的内容
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [article, summary, title, tags]
 *                 description: 内容类型
 *               params:
 *                 type: object
 *                 description: 生成参数
 *     responses:
 *       200:
 *         description: 内容生成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generate', authMiddleware.verifyToken, aiController.generateContent);

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: 智能分析
 *     description: 分析博客数据和内容质量
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [blog_stats, content_quality]
 *                 description: 分析类型
 *               data:
 *                 type: object
 *                 description: 要分析的数据
 *     responses:
 *       200:
 *         description: 分析完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/analyze', authMiddleware.verifyToken, aiController.analyze);

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: 获取聊天历史
 *     description: 获取用户的聊天历史记录
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取聊天历史成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', authMiddleware.verifyToken, aiController.getChatHistory);

/**
 * @swagger
 * /api/ai/history:
 *   delete:
 *     summary: 清除聊天历史
 *     description: 清除用户的聊天历史记录
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: 聊天历史已清除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.delete('/history', authMiddleware.verifyToken, aiController.clearChatHistory);

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: 获取AI服务状态
 *     description: 检查AI服务是否可用
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取AI服务状态成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', authMiddleware.verifyToken, aiController.getAIStatus);

/**
 * @swagger
 * /api/ai/batch-generate:
 *   post:
 *     summary: 批量内容生成
 *     description: 批量生成多种类型的内容
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: 内容类型
 *                     params:
 *                       type: object
 *                       description: 生成参数
 *     responses:
 *       200:
 *         description: 批量生成完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/batch-generate', authMiddleware.verifyToken, aiController.batchGenerate);

/**
 * @swagger
 * /api/ai/writing-assistant:
 *   post:
 *     summary: 智能写作助手
 *     description: 提供文章改进、扩展、总结、翻译等功能
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - content
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [improve, expand, summarize, translate]
 *                 description: 操作类型
 *               content:
 *                 type: string
 *                 description: 要处理的内容
 *               params:
 *                 type: object
 *                 description: 额外参数
 *     responses:
 *       200:
 *         description: 写作助手处理完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/writing-assistant', authMiddleware.verifyToken, aiController.writingAssistant);

/**
 * @swagger
 * /api/ai/task/{taskId}:
 *   get:
 *     summary: 获取任务状态
 *     description: 获取异步任务的状态和结果
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 获取任务状态成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/task/:taskId', authMiddleware.verifyToken, aiController.getTaskStatus);

/**
 * @swagger
 * /api/ai/tasks:
 *   get:
 *     summary: 获取用户任务列表
 *     description: 获取用户的AI任务列表
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取任务列表成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/tasks', authMiddleware.verifyToken, aiController.getUserTasks);

/**
 * @swagger
 * /api/ai/quota:
 *   get:
 *     summary: 获取用户配额
 *     description: 获取用户的AI使用配额信息
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取配额信息成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/quota', authMiddleware.verifyToken, aiController.getUserQuota);

/**
 * @swagger
 * /api/ai/task/{taskId}:
 *   delete:
 *     summary: 删除AI任务
 *     description: 删除指定的AI任务
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 任务删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: 无权删除此任务
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 任务不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/task/:taskId', authMiddleware.verifyToken, aiController.deleteTask);

module.exports = router;
