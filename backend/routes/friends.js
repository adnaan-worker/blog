const express = require('express');
const router = express.Router();

const friendLinkController = require('@/controllers/friend-link.controller');
const authMiddleware = require('@/middlewares/auth.middleware');
const { generalLimiter } = require('@/middlewares/rate-limit.middleware');
const {
  withPagination,
  withUserContext,
  withEnumFilter,
} = require('@/middlewares/request-context.middleware');

/**
 * 友情链接相关路由
 */

// 公开：获取已通过的友链列表
router.get(
  '/',
  authMiddleware.optionalAuth,
  withUserContext,
  withPagination({ defaultLimit: 50, maxLimit: 100 }),
  friendLinkController.getPublicFriends
);

// 公开：提交友链申请
router.post(
  '/apply',
  authMiddleware.optionalAuth,
  generalLimiter,
  friendLinkController.applyFriendLink
);

// 管理端：获取友链列表
router.get(
  '/admin',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  withUserContext,
  withPagination({ defaultLimit: 10, maxLimit: 100 }),
  withEnumFilter('status', ['pending', 'approved', 'rejected', 'blocked'], 'status'),
  friendLinkController.getAdminFriends
);

// 管理端：更新友链
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  friendLinkController.updateFriendLink
);

// 管理端：更新友链状态
router.patch(
  '/:id/status',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  friendLinkController.updateFriendLinkStatus
);

// 管理端：删除友链
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  friendLinkController.deleteFriendLink
);

module.exports = router;
