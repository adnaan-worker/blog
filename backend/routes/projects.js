const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 项目
 *   description: 项目管理相关API
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: 获取项目列表
 *     tags: [项目]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, developing, paused]
 *         description: 项目状态
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: 是否精选
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: 编程语言
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', authMiddleware.optionalAuth, projectController.getProjects);

/**
 * @swagger
 * /api/projects/featured:
 *   get:
 *     summary: 获取精选项目
 *     tags: [项目]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: 返回数量
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/featured', projectController.getFeaturedProjects);

/**
 * @swagger
 * /api/projects/stats:
 *   get:
 *     summary: 获取项目统计信息
 *     tags: [项目]
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/stats', projectController.getProjectStats);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: 获取项目详情
 *     tags: [项目]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID或slug
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 项目不存在
 */
router.get('/:id', projectController.getProjectDetail);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: 创建项目（仅管理员）
 *     tags: [项目]
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
 *               - slug
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, archived, developing, paused]
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  projectController.createProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: 更新项目（仅管理员）
 *     tags: [项目]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 项目不存在
 */
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  projectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: 删除项目（仅管理员）
 *     tags: [项目]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 项目不存在
 */
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  projectController.deleteProject
);

module.exports = router;
