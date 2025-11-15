const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai-langchain.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * AI LangChain 路由
 * 全新的基于 LangChain 的 AI 接口
 */

// 简单聊天
router.post('/chat', authMiddleware.verifyToken, aiController.chat);

// 对话聊天（带记忆）
router.post('/conversation', authMiddleware.verifyToken, aiController.conversationChat);

// 生成文章
router.post('/generate/article', authMiddleware.verifyToken, aiController.generateArticle);

// 获取用户配额
router.get('/quota', authMiddleware.verifyToken, aiController.getQuota);

// 清除对话记忆
router.delete('/memory', authMiddleware.verifyToken, aiController.clearMemory);

// 获取 AI 服务状态
router.get('/status', authMiddleware.verifyToken, aiController.getStatus);

// 获取队列统计
router.get('/queue/stats', authMiddleware.verifyToken, aiController.getQueueStats);

module.exports = router;
