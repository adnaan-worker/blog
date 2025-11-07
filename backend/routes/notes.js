const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const noteController = require('../controllers/note.controller');

/**
 * @swagger
 * tags:
 *   name: 手记
 *   description: 手记管理相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 手记ID
 *         title:
 *           type: string
 *           description: 手记标题
 *         content:
 *           type: string
 *           description: 手记内容
 *         mood:
 *           type: string
 *           enum: [开心, 平静, 思考, 感慨, 兴奋, 忧郁, 愤怒, 恐惧, 惊讶, 厌恶]
 *           description: 心情
 *         weather:
 *           type: string
 *           description: 天气
 *         location:
 *           type: string
 *           description: 地点
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 标签数组
 *         isPrivate:
 *           type: boolean
 *           description: 是否私密
 *         readingTime:
 *           type: integer
 *           description: 预估阅读时间（分钟）
 *         viewCount:
 *           type: integer
 *           description: 查看次数
 *         likeCount:
 *           type: integer
 *           description: 点赞次数
 *         isLiked:
 *           type: boolean
 *           description: 当前用户是否已点赞
 *         author:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             fullName:
 *               type: string
 *             avatar:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: 获取公开手记列表（前台展示）
 *     description: 返回所有公开手记，不需要登录
 *     tags: [手记]
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
 *         name: mood
 *         schema:
 *           type: string
 *         description: 心情筛选
 *       - in: query
 *         name: weather
 *         schema:
 *           type: string
 *         description: 天气筛选
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 标签筛选（JSON字符串或逗号分隔）
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
router.get('/', noteController.getNotesList);

/**
 * @swagger
 * /api/notes/my:
 *   get:
 *     summary: 获取我的手记列表（个人中心管理）
 *     description: 普通用户返回自己的所有手记（包括私密），管理员返回所有手记
 *     tags: [手记]
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
 *         name: mood
 *         schema:
 *           type: string
 *         description: 心情筛选
 *       - in: query
 *         name: weather
 *         schema:
 *           type: string
 *         description: 天气筛选
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 标签筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: isPrivate
 *         schema:
 *           type: boolean
 *         description: 私密性筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/my', authMiddleware.verifyToken, noteController.getMyNotes);

/**
 * @swagger
 * /api/notes/stats:
 *   get:
 *     summary: 获取用户手记统计
 *     tags: [手记]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/stats', authMiddleware.verifyToken, noteController.getNoteStats);

/**
 * @swagger
 * /api/notes/metadata:
 *   get:
 *     summary: 获取手记元数据（常用标签、心情等）
 *     tags: [手记]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/metadata', authMiddleware.verifyToken, noteController.getNoteMetadata);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: 获取手记详情
 *     tags: [手记]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 手记ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 手记不存在
 */
// 获取手记年份列表（必须在 /:id 之前）
router.get('/years', noteController.getYears);

router.get('/:id', authMiddleware.optionalAuth, noteController.getNoteById);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: 创建手记
 *     tags: [手记]
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
 *               title:
 *                 type: string
 *                 description: 手记标题
 *               content:
 *                 type: string
 *                 description: 手记内容
 *               mood:
 *                 type: string
 *                 description: 心情
 *               weather:
 *                 type: string
 *                 description: 天气
 *               location:
 *                 type: string
 *                 description: 地点
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签数组
 *               isPrivate:
 *                 type: boolean
 *                 description: 是否私密
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 */
router.post('/', authMiddleware.verifyToken, noteController.createNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: 更新手记
 *     tags: [手记]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 手记ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               mood:
 *                 type: string
 *               weather:
 *                 type: string
 *               location:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 手记不存在或无权修改
 */
router.put('/:id', authMiddleware.verifyToken, noteController.updateNote);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: 删除手记
 *     tags: [手记]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 手记ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 手记不存在或无权删除
 */
router.delete('/:id', authMiddleware.verifyToken, noteController.deleteNote);

/**
 * @swagger
 * /api/notes/{id}/like:
 *   post:
 *     summary: 切换手记点赞状态
 *     tags: [手记]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 手记ID
 *     responses:
 *       200:
 *         description: 操作成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 手记不存在
 */
router.post('/:id/like', authMiddleware.optionalAuth, noteController.toggleNoteLike);

/**
 * @swagger
 * /api/notes/user/likes:
 *   get:
 *     summary: 获取用户手记点赞列表
 *     tags: [手记]
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
router.get('/user/likes', authMiddleware.verifyToken, noteController.getUserNoteLikes);

module.exports = router;
