const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const siteSettingsController = require('../controllers/site-settings.controller');

/**
 * @swagger
 * tags:
 *   name: 网站设置
 *   description: 网站设置相关接口
 */

/**
 * @swagger
 * /api/site-settings:
 *   get:
 *     summary: 获取网站设置（公开）
 *     tags: [网站设置]
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', siteSettingsController.getSiteSettings);

/**
 * @swagger
 * /api/site-settings:
 *   put:
 *     summary: 更新网站设置（仅管理员）
 *     tags: [网站设置]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *       403:
 *         description: 权限不足
 */
router.put(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  siteSettingsController.updateSiteSettings
);

module.exports = router;
