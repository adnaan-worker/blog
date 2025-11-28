const express = require('express');
const router = express.Router();
const aiController = require('@/controllers/ai-langchain.controller');
const authMiddleware = require('@/middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: AI基础
 *   description: 基础 AI 功能接口（无记忆），对话管理功能请使用 /api/ai/conversation
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: 聊天接口
 *     description: 与博客智能机器人 Wayne (#89757) 对话。传入 sessionId 则使用记忆，否则为无记忆聊天
 *     tags: [AI基础]
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
 *                 example: "你是谁？"
 *               sessionId:
 *                 type: string
 *                 description: 会话ID（可选，传入则使用记忆）
 *                 example: "session_123"
 *     responses:
 *       200:
 *         description: 聊天成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: AI回复内容
 *                     sessionId:
 *                       type: string
 *                       nullable: true
 *                       description: 会话ID
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 参数错误
 *       429:
 *         description: 配额已用完
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/chat', authMiddleware.verifyToken, aiController.chat);

/**
 * @swagger
 * /api/ai/generate/article:
 *   post:
 *     summary: 生成文章
 *     description: 根据标题和关键词生成文章内容
 *     tags: [AI基础]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *                 example: "React Hooks 最佳实践"
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 关键词列表
 *                 example: ["useState", "useEffect", "自定义Hooks"]
 *               wordCount:
 *                 type: integer
 *                 description: 目标字数
 *                 example: 1000
 *               style:
 *                 type: string
 *                 description: 写作风格
 *                 enum: [professional, casual, technical]
 *                 example: "technical"
 *     responses:
 *       200:
 *         description: 生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                       description: 生成的文章内容（Markdown格式）
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 参数错误
 *       429:
 *         description: 配额已用完
 */
router.post('/generate/article', authMiddleware.verifyToken, aiController.generateArticle);

/**
 * @swagger
 * /api/ai/generate/title:
 *   post:
 *     summary: 生成标题
 *     description: 根据文章内容生成多个标题选项
 *     tags: [AI基础]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 文章内容
 *     responses:
 *       200:
 *         description: 生成成功
 */
router.post('/generate/title', authMiddleware.verifyToken, aiController.generateTitle);

/**
 * @swagger
 * /api/ai/generate/summary:
 *   post:
 *     summary: 生成摘要
 *     description: 根据文章内容生成摘要
 *     tags: [AI基础]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 文章内容
 *     responses:
 *       200:
 *         description: 生成成功
 */
router.post('/generate/summary', authMiddleware.verifyToken, aiController.generateSummary);

/**
 * @swagger
 * /api/ai/task/:jobId:
 *   get:
 *     summary: 查询任务状态
 *     description: 查询异步任务的执行状态和结果
 *     tags: [AI基础]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 查询成功
 */
router.get('/task/:jobId', authMiddleware.verifyToken, aiController.getTaskStatus);

/**
 * @swagger
 * /api/ai/quota:
 *   get:
 *     summary: 获取用户AI配额
 *     description: 查询当前用户的AI使用配额和剩余次数
 *     tags: [AI基础]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/AIQuota'
 */
router.get('/quota', authMiddleware.verifyToken, aiController.getQuota);

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: 获取AI服务状态
 *     description: 检查AI服务是否可用，返回服务信息
 *     tags: [AI基础]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       description: 服务是否可用
 *                     provider:
 *                       type: string
 *                       description: AI提供商
 *                       example: "openai"
 *                     model:
 *                       type: string
 *                       description: 使用的模型
 *                       example: "gpt-3.5-turbo"
 */
router.get('/status', authMiddleware.verifyToken, aiController.getStatus);

// 注意：队列相关功能已废弃，改用 Socket.IO 流式输出
// 注意：对话聊天（带记忆）功能已迁移到 /api/ai/conversation
// 注意：清除记忆功能已迁移到 DELETE /api/ai/conversation 和 DELETE /api/ai/conversation/:sessionId

module.exports = router;
