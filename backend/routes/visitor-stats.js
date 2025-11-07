const express = require('express');
const router = express.Router();
const visitorStatsController = require('../controllers/visitor-stats.controller');

/**
 * @swagger
 * tags:
 *   name: 访客统计
 *   description: 访客统计相关API接口
 */

/**
 * @swagger
 * /api/visitor-stats:
 *   get:
 *     summary: 获取访客统计数据
 *     description: 获取当前在线访客的详细统计信息，包括地区、设备、页面等
 *     tags: [访客统计]
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取访客统计成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     onlineCount:
 *                       type: number
 *                       description: 在线人数
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           location:
 *                             type: string
 *                           device:
 *                             type: string
 *                           page:
 *                             type: string
 *                           pageTitle:
 *                             type: string
 *                           count:
 *                             type: number
 *                     timestamp:
 *                       type: number
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', visitorStatsController.getVisitorStats);

/**
 * @swagger
 * /api/visitor-stats/cleanup:
 *   post:
 *     summary: 清理过期访客活动
 *     description: 清理Redis中过期的访客活动记录
 *     tags: [访客统计]
 *     responses:
 *       200:
 *         description: 清理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "清理了 5 个过期访客活动"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cleaned:
 *                       type: number
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cleanup', visitorStatsController.cleanupExpiredActivities);

module.exports = router;
