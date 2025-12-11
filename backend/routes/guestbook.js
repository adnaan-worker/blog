const express = require('express');
const router = express.Router();

const guestbookController = require('@/controllers/guestbook.controller');
const authMiddleware = require('@/middlewares/auth.middleware');
const { commentLimiter } = require('@/middlewares/rate-limit.middleware');
const {
  withPagination,
  withUserContext,
  withEnumFilter,
} = require('@/middlewares/request-context.middleware');

/**
 * 留言板相关路由
 */

// 前台：获取留言列表
router.get(
  '/messages',
  authMiddleware.optionalAuth,
  withUserContext,
  withPagination({ defaultLimit: 10, maxLimit: 50 }),
  guestbookController.getPublicMessages
);

// 前台：创建留言（支持访客和登录用户）
router.post(
  '/messages',
  authMiddleware.optionalAuth,
  commentLimiter,
  guestbookController.createMessage
);

// 管理端：获取留言列表
router.get(
  '/admin/messages',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  withUserContext,
  withPagination({ defaultLimit: 10, maxLimit: 100 }),
  withEnumFilter('status', ['approved', 'pending', 'spam'], 'status'),
  guestbookController.getAdminMessages
);

// 管理端：更新留言状态
router.patch(
  '/messages/:id/status',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  guestbookController.updateMessageStatus
);

// 管理端：更新留言回复
router.patch(
  '/messages/:id/reply',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  guestbookController.updateMessageReply
);

// 管理端：删除留言
router.delete(
  '/messages/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  guestbookController.deleteMessage
);

module.exports = router;
