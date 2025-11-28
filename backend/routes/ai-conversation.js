const express = require('express');
const router = express.Router();
const aiConversationController = require('@/controllers/ai-conversation.controller');
const { verifyToken } = require('@/middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: AI会话管理
 *   description: 💭 AI会话历史管理接口，支持会话列表、历史记录、统计分析
 */

/**
 * @swagger
 * /api/ai/sessions:
 *   get:
 *     summary: 获取用户所有会话列表
 *     tags: [AI会话管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', verifyToken, aiConversationController.getSessions);

/**
 * @swagger
 * /api/ai/sessions/{sessionId}/history:
 *   get:
 *     summary: 获取会话历史
 *     tags: [AI会话管理]
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
router.get('/:sessionId/history', verifyToken, aiConversationController.getHistory);

/**
 * @swagger
 * /api/ai/sessions/{sessionId}/stats:
 *   get:
 *     summary: 获取会话统计
 *     tags: [AI会话管理]
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
router.get('/:sessionId/stats', verifyToken, aiConversationController.getStats);

/**
 * @swagger
 * /api/ai/sessions/{sessionId}:
 *   delete:
 *     summary: 清除指定会话历史
 *     tags: [AI会话管理]
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
 * /api/ai/sessions:
 *   delete:
 *     summary: 清除用户所有会话历史
 *     tags: [AI会话管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清除成功
 */
router.delete('/', verifyToken, aiConversationController.clearAllSessions);

module.exports = router;
