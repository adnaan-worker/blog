const express = require('express');
const router = express.Router();
const { healthCheckMiddleware, metricsMiddleware } = require('../utils/monitor');
const { monitorService } = require('../utils/monitor');
const { logger } = require('../utils/logger');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: 系统健康检查
 *     description: 检查系统运行状态，包括数据库连接、内存使用等
 *     tags: [系统]
 *     responses:
 *       200:
 *         description: 系统健康
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: 系统运行时间（秒）
 *                 memory:
 *                   type: object
 *                   properties:
 *                     heapUsed:
 *                       type: number
 *                     heapTotal:
 *                       type: number
 *                     external:
 *                       type: number
 *                     rss:
 *                       type: number
 *                 system:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                     arch:
 *                       type: string
 *                     nodeVersion:
 *                       type: string
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         cores:
 *                           type: number
 *                         loadAverage:
 *                           type: array
 *                           items:
 *                             type: number
 *       503:
 *         description: 系统不健康
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/health', healthCheckMiddleware);

/**
 * @swagger
 * /api/system/metrics:
 *   get:
 *     summary: 获取系统指标
 *     description: 获取详细的系统性能指标和统计信息
 *     tags: [系统]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 系统指标
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 system:
 *                   type: object
 *                   description: 系统信息
 *                 application:
 *                   type: object
 *                   description: 应用状态
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/metrics', authMiddleware.verifyToken, authMiddleware.isAdmin, metricsMiddleware);

/**
 * @swagger
 * /api/system/info:
 *   get:
 *     summary: 获取系统信息
 *     description: 获取系统基本信息，无需认证
 *     tags: [系统]
 *     responses:
 *       200:
 *         description: 系统信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "博客系统 API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 uptime:
 *                   type: number
 *                   description: 运行时间（秒）
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/info', (req, res) => {
  const info = {
    name: '博客系统 API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  res.json(info);
});

/**
 * @swagger
 * /api/system/logs:
 *   get:
 *     summary: 获取系统日志
 *     description: 获取最近的系统日志（仅管理员）
 *     tags: [系统]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: 日志级别过滤
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 返回日志条数限制
 *     responses:
 *       200:
 *         description: 系统日志
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                       level:
 *                         type: string
 *                       message:
 *                         type: string
 *                       meta:
 *                         type: object
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/logs', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res) => {
  try {
    const { level, limit = 50 } = req.query;

    // 这里应该实现从日志文件读取日志的逻辑
    // 由于 winston 不直接提供读取日志的 API，这里返回模拟数据
    const mockLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '系统启动成功',
        meta: { service: 'blog-api' },
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: '数据库连接成功',
        meta: { service: 'database' },
      },
    ];

    res.json({
      logs: mockLogs.slice(0, parseInt(limit)),
      total: mockLogs.length,
    });
  } catch (error) {
    logger.error('获取系统日志失败', { error: error.message });
    res.status(500).json({
      message: '获取系统日志失败',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/system/reset-metrics:
 *   post:
 *     summary: 重置监控指标
 *     description: 重置系统监控计数器（仅管理员）
 *     tags: [系统]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 重置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-metrics', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res) => {
  try {
    monitorService.resetCounters();

    res.json({
      success: true,
      message: '监控指标已重置',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('重置监控指标失败', { error: error.message });
    res.status(500).json({
      message: '重置监控指标失败',
      error: error.message,
    });
  }
});

module.exports = router;
