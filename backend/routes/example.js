const express = require('express');
const router = express.Router();
const exampleController = require('@/controllers/example.controller');
const authMiddleware = require('@/middlewares/auth.middleware');

/**
 * @swagger
 * /api/example/item/{id}:
 *   get:
 *     summary: 获取单个项目
 *     description: 根据ID获取单个项目信息
 *     tags: [示例]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 成功获取项目
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: 项目不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/item/:id', exampleController.getItem);

/**
 * @swagger
 * /api/example/list:
 *   get:
 *     summary: 获取项目列表
 *     description: 获取所有项目列表
 *     tags: [示例]
 *     responses:
 *       200:
 *         description: 成功获取项目列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/list', exampleController.getList);

/**
 * @swagger
 * /api/example/paginated:
 *   get:
 *     summary: 获取分页项目列表
 *     description: 获取分页的项目列表
 *     tags: [示例]
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
 *     responses:
 *       200:
 *         description: 成功获取分页数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/paginated', exampleController.getPaginated);

/**
 * @swagger
 * /api/example/item:
 *   post:
 *     summary: 创建新项目
 *     description: 创建新的项目
 *     tags: [示例]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 项目名称
 *               description:
 *                 type: string
 *                 description: 项目描述
 *     responses:
 *       201:
 *         description: 项目创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/item', authMiddleware.verifyToken, exampleController.createItem);

/**
 * @swagger
 * /api/example/item/{id}:
 *   put:
 *     summary: 更新项目
 *     description: 更新指定ID的项目
 *     tags: [示例]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: 项目名称
 *               description:
 *                 type: string
 *                 description: 项目描述
 *     responses:
 *       200:
 *         description: 项目更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.put('/item/:id', authMiddleware.verifyToken, exampleController.updateItem);

/**
 * @swagger
 * /api/example/item/{id}:
 *   delete:
 *     summary: 删除项目
 *     description: 删除指定ID的项目
 *     tags: [示例]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 项目删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.delete('/item/:id', authMiddleware.verifyToken, exampleController.deleteItem);

/**
 * @swagger
 * /api/example/error:
 *   get:
 *     summary: 错误处理示例
 *     description: 展示不同类型的错误响应
 *     tags: [示例]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [unauthorized, forbidden, notfound, conflict, validation, server]
 *         description: 错误类型
 *     responses:
 *       400:
 *         description: 验证错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 禁止访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 冲突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/error', exampleController.errorExample);

/**
 * @swagger
 * /api/example/meta:
 *   get:
 *     summary: 自定义元数据示例
 *     description: 展示如何添加自定义元数据到响应中
 *     tags: [示例]
 *     responses:
 *       200:
 *         description: 成功响应
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                     environment:
 *                       type: string
 *                     requestId:
 *                       type: string
 *                     processingTime:
 *                       type: string
 */
router.get('/meta', exampleController.customMeta);

/**
 * @swagger
 * /api/example/batch:
 *   post:
 *     summary: 批量操作示例
 *     description: 展示批量处理操作
 *     tags: [示例]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 要处理的项目列表
 *     responses:
 *       200:
 *         description: 批量处理成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: 数据验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/batch',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  exampleController.batchOperation
);

module.exports = router;
