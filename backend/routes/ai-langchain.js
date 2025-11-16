const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai-langchain.controller');
const authMiddleware = require('../middlewares/auth.middleware');

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
 *     summary: 简单聊天（无记忆）
 *     description: 单次问答，不保存对话历史，适合快速问答场景
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
 *                 example: "什么是React？"
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

/**
 * @swagger
 * /api/ai/queue/stats:
 *   get:
 *     summary: 获取任务队列统计
 *     description: 查看AI任务队列的状态和统计信息
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
 *                     waiting:
 *                       type: integer
 *                       description: 等待中的任务数
 *                     active:
 *                       type: integer
 *                       description: 执行中的任务数
 *                     completed:
 *                       type: integer
 *                       description: 已完成的任务数
 *                     failed:
 *                       type: integer
 *                       description: 失败的任务数
 */
router.get('/queue/stats', authMiddleware.verifyToken, aiController.getQueueStats);

// 注意：对话聊天（带记忆）功能已迁移到 /api/ai/conversation
// 注意：清除记忆功能已迁移到 DELETE /api/ai/conversation 和 DELETE /api/ai/conversation/:sessionId

module.exports = router;
