const express = require('express');
const router = express.Router();
const postController = require('@/controllers/post.controller');
const authMiddleware = require('@/middlewares/auth.middleware');
const { interactionLimiter, looseLimiter } = require('@/middlewares/rate-limit.middleware');
const { withPagination, withUserContext } = require('@/middlewares/request-context.middleware');

/**
 * @swagger
 * tags:
 *   name: 文章
 *   description: 文章管理相关接口
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 获取公开文章列表（前台展示）
 *     description: 返回所有已发布且审核通过的文章
 *     tags: [文章]
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
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /api/posts/years:
 *   get:
 *     summary: 获取所有年份列表
 *     description: 返回有文章的所有年份及文章数量
 *     tags: [文章]
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2025
 *                       count:
 *                         type: integer
 *                         example: 15
 */
router.get('/years', postController.getYears);

/**
 * @swagger
 * /api/posts/my:
 *   get:
 *     summary: 获取我的文章列表（个人中心管理）
 *     description: 普通用户返回自己的文章，管理员返回所有文章
 *     tags: [文章]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 文章状态筛选（管理员可用）
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get(
  '/my',
  authMiddleware.verifyToken,
  withUserContext,
  withPagination({ defaultLimit: 10, maxLimit: 50 }),
  postController.getMyPosts
);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: 根据ID获取文章详情
 *     tags: [文章]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 文章不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 创建新文章
 *     tags: [文章]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *               content:
 *                 type: string
 *                 description: 文章内容
 *               summary:
 *                 type: string
 *                 description: 文章摘要
 *               featuredImage:
 *                 type: string
 *                 description: 特色图片URL
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: 文章状态
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
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
 */
router.post('/', authMiddleware.verifyToken, postController.createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: 更新文章
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *               content:
 *                 type: string
 *                 description: 文章内容
 *               summary:
 *                 type: string
 *                 description: 文章摘要
 *               featuredImage:
 *                 type: string
 *                 description: 特色图片URL
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: 文章状态
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
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
 *       404:
 *         description: 文章不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authMiddleware.verifyToken, postController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: 删除文章
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
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
 *         description: 文章不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: 切换文章点赞状态
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                 likeCount:
 *                   type: integer
 *       401:
 *         description: 未授权
 *       404:
 *         description: 文章不存在
 */
router.post(
  '/:id/like',
  authMiddleware.optionalAuth,
  interactionLimiter,
  postController.togglePostLike
);

/**
 * @swagger
 * /api/posts/{id}/bookmark:
 *   post:
 *     summary: 切换文章收藏状态
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookmarked:
 *                   type: boolean
 *       401:
 *         description: 未授权
 *       404:
 *         description: 文章不存在
 */
router.post(
  '/:id/bookmark',
  authMiddleware.optionalAuth,
  interactionLimiter,
  postController.togglePostBookmark
);

/**
 * @swagger
 * /api/posts/{id}/status:
 *   get:
 *     summary: 获取用户对文章的点赞和收藏状态
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                 bookmarked:
 *                   type: boolean
 *                 likeCount:
 *                   type: integer
 *       401:
 *         description: 未授权
 *       404:
 *         description: 文章不存在
 */
router.get('/:id/status', authMiddleware.optionalAuth, postController.getPostUserStatus);

/**
 * @swagger
 * /api/posts/user/bookmarks:
 *   get:
 *     summary: 获取用户收藏列表
 *     tags: [文章]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/user/bookmarks', authMiddleware.verifyToken, postController.getUserBookmarks);

/**
 * @swagger
 * /api/posts/user/likes:
 *   get:
 *     summary: 获取用户点赞列表
 *     tags: [文章]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/user/likes', authMiddleware.verifyToken, postController.getUserLikes);

/**
 * @swagger
 * /api/posts/{id}/audit:
 *   patch:
 *     summary: 审核文章（管理员）
 *     tags: [文章]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auditStatus
 *             properties:
 *               auditStatus:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: 审核状态（1=通过，2=驳回）
 *     responses:
 *       200:
 *         description: 审核成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch(
  '/:id/audit',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  postController.auditPost
);

module.exports = router;
