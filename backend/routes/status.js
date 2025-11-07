const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');

/**
 * @swagger
 * tags:
 *   name: 状态管理
 *   description: 系统状态推送和管理
 */

/**
 * @swagger
 * /api/status:
 *   post:
 *     summary: 接收状态推送
 *     tags: [状态管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timestamp
 *               - computer_name
 *             properties:
 *               active_app:
 *                 type: string
 *                 description: 当前活跃应用
 *                 example: "chrome.exe - Google Chrome"
 *               computer_name:
 *                 type: string
 *                 description: 计算机名称
 *                 example: "DESKTOP-ABC123"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: 时间戳
 *                 example: "2025-01-01T12:00:00.000Z"
 *     responses:
 *       200:
 *         description: 状态接收成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     changed:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     data:
 *                       type: object
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/', statusController.receiveStatus);

/**
 * @swagger
 * /api/status/cache:
 *   get:
 *     summary: 获取缓存状态信息
 *     tags: [状态管理]
 *     responses:
 *       200:
 *         description: 获取缓存状态成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     lastPushTime:
 *                       type: string
 *                       format: date-time
 *                       description: 最后推送时间
 *                     timeSinceLastPush:
 *                       type: integer
 *                       description: 距离最后推送的秒数
 *                     hasCurrentStatus:
 *                       type: boolean
 *                       description: 是否有当前状态
 *                     historyCount:
 *                       type: integer
 *                       description: 历史记录数量
 *                     isInactive:
 *                       type: boolean
 *                       description: 系统是否处于不活跃状态
 *                     willCleanupIn:
 *                       type: integer
 *                       description: 多少秒后将清理缓存
 *   delete:
 *     summary: 手动清理缓存
 *     tags: [状态管理]
 *     responses:
 *       200:
 *         description: 缓存清理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cleared:
 *                       type: boolean
 */
router.get('/cache', statusController.getCacheStatus);
router.delete('/cache', statusController.clearCache);

module.exports = router;
