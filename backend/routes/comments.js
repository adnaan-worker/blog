const express = require('express');
const router = express.Router();
const authMiddleware = require('@/middlewares/auth.middleware');
const commentController = require('@/controllers/comment.controller');
const {
  withPagination,
  withUserContext,
  withEnumFilter,
  withScope,
} = require('@/middlewares/request-context.middleware');

/**
 * @swagger
 * tags:
 *   name: 评论
 *   description: 评论管理相关接口
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: 获取评论列表（管理员返回所有，普通用户返回自己的）
 *     tags: [评论]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending, spam]
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get(
  '/',
  authMiddleware.verifyToken,
  withUserContext,
  withPagination({ defaultLimit: 10, maxLimit: 50 }),
  withEnumFilter('status', ['approved', 'pending', 'spam'], 'status'),
  withScope({ adminScope: 'all-comments', userScope: 'own-comments' }),
  commentController.getUserComments
);

/**
 * @swagger
 * /api/comments/{targetId}:
 *   get:
 *     summary: 获取指定目标的所有评论
 *     description: 通过 targetType + targetId 获取文章、手记、项目等目标下的评论列表
 *     tags: [评论]
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 目标ID（文章ID/手记ID/项目ID等）
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [post, note, project]
 *           default: post
 *         description: 目标类型（post-文章/note-手记/project-项目）
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
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get(
  '/:targetId',
  authMiddleware.optionalAuth,
  withUserContext,
  withPagination({ defaultLimit: 10, maxLimit: 50 }),
  commentController.getCommentsByPost
);

/**
 * @swagger
 * /api/comments/{id}/detail:
 *   get:
 *     summary: 根据ID获取评论详情
 *     tags: [评论]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 评论不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:id/detail',
  authMiddleware.optionalAuth,
  withUserContext,
  commentController.getCommentById
);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: 创建新评论
 *     tags: [评论]
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
 *               - targetType
 *               - targetId
 *             properties:
 *               content:
 *                 type: string
 *                 description: 评论内容
 *               targetType:
 *                 type: string
 *                 enum: [post, note, project]
 *                 description: 评论目标类型（post-文章/note-手记/project-项目）
 *               targetId:
 *                 type: integer
 *                 description: 评论目标ID
 *               parentId:
 *                 type: integer
 *                 description: 父评论ID (用于回复功能)
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 创建失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 文章不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 创建评论支持访客和登录用户（使用可选认证）
router.post('/', authMiddleware.optionalAuth, commentController.createComment);

/**
 * @swagger
 * /api/comments/{id}/status:
 *   patch:
 *     summary: 更新评论状态 (管理员)
 *     tags: [评论]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, pending, spam]
 *                 description: 评论状态
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 评论不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/status',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  commentController.updateCommentStatus
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: 删除评论
 *     tags: [评论]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 评论不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authMiddleware.verifyToken, withUserContext, commentController.deleteComment);

module.exports = router;
