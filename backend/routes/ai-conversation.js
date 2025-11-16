const express = require('express');
const router = express.Router();
const aiConversationController = require('../controllers/ai-conversation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: AI对话
 *   description: 💭 AI多轮对话管理接口，支持会话历史、上下文记忆、统计分析
 */

/**
 * @swagger
 * /api/ai/conversation:
 *   post:
 *     summary: 对话聊天（带记忆）
 *     description: 支持多轮对话的智能聊天，AI会记住上下文，基于LangChain的DatabaseChatMessageHistory实现
 *     tags: [AI对话]
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
 *                 description: 会话ID（可选，不传则使用默认会话）
 *               chatType:
 *                 type: string
 *                 enum: [chat, blog_assistant, writing_assistant]
 *                 description: 聊天类型
 *     responses:
 *       200:
 *         description: 对话成功
 */
router.post('/', verifyToken, aiConversationController.chat);

/**
 * @swagger
 * /api/ai/conversation/sessions:
 *   get:
 *     summary: 获取用户所有会话列表
 *     tags: [AI对话]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/sessions', verifyToken, aiConversationController.getSessions);

/**
 * @swagger
 * /api/ai/conversation/history/{sessionId}:
 *   get:
 *     summary: 获取会话历史
 *     tags: [AI对话]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 获取消息数量
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/history/:sessionId', verifyToken, aiConversationController.getHistory);

/**
 * @swagger
 * /api/ai/conversation/stats/{sessionId}:
 *   get:
 *     summary: 获取会话统计
 *     tags: [AI对话]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/stats/:sessionId', verifyToken, aiConversationController.getStats);

/**
 * @swagger
 * /api/ai/conversation/{sessionId}:
 *   delete:
 *     summary: 清除指定会话历史
 *     tags: [AI对话]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 清除成功
 */
router.delete('/:sessionId', verifyToken, aiConversationController.clearSession);

/**
 * @swagger
 * /api/ai/conversation:
 *   delete:
 *     summary: 清除用户所有会话历史
 *     tags: [AI对话]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清除成功
 */
router.delete('/', verifyToken, aiConversationController.clearAllSessions);

module.exports = router;
