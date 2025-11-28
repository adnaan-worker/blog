/**
 * 贡献统计路由
 */

const express = require('express');
const router = express.Router();
const contributionController = require('@/controllers/contribution.controller');

/**
 * @swagger
 * tags:
 *   name: 贡献
 *   description: 🎯 GitHub/Gitee贡献统计
 */

/**
 * @swagger
 * /api/contributions:
 *   get:
 *     summary: 获取 GitHub + Gitee 贡献统计
 *     description: 获取用户在 GitHub 和 Gitee 上的贡献数据
 *     tags: [贡献]
 *     parameters:
 *       - in: query
 *         name: githubUsername
 *         schema:
 *           type: string
 *         description: GitHub 用户名
 *         example: "octocat"
 *       - in: query
 *         name: giteeUsername
 *         schema:
 *           type: string
 *         description: Gitee 用户名
 *         example: "username"
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
 *                   type: object
 *                   properties:
 *                     github:
 *                       type: object
 *                       description: GitHub贡献数据
 *                     gitee:
 *                       type: object
 *                       description: Gitee贡献数据
 *       400:
 *         description: 参数错误
 */
router.get('/', contributionController.getContributions);

module.exports = router;
