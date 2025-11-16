const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const siteSettingsController = require('../controllers/site-settings.controller');

/**
 * @swagger
 * tags:
 *   name: 站点设置
 *   description: 🎨 站点配置、主题设置、SEO配置
 */

/**
 * @swagger
 * /api/site-settings:
 *   get:
 *     summary: 获取网站设置（公开）
 *     tags: [站点设置]
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
 *     tags: [站点设置]
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
