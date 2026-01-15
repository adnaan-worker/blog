const express = require('express');
const router = express.Router();
const oauthController = require('@controllers/oauth.controller');
const authMiddleware = require('@middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: 🔐 第三方登录（GitHub、Google、Gitee）
 */

/**
 * @swagger
 * /api/auth/oauth/status:
 *   get:
 *     summary: 获取 OAuth 配置状态
 *     tags: [OAuth]
 *     responses:
 *       200:
 *         description: 返回各平台是否可用
 */
router.get('/status', oauthController.getOAuthStatus);

// ==================== GitHub OAuth ====================

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: GitHub 登录入口
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: 重定向到 GitHub 授权页面
 */
router.get('/github', oauthController.githubLogin);

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub 登录回调
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: 重定向到前端并携带 token
 */
router.get('/github/callback', oauthController.githubCallback);

// ==================== Google OAuth ====================

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google 登录入口
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: 重定向到 Google 授权页面
 */
router.get('/google', oauthController.googleLogin);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google 登录回调
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: 重定向到前端并携带 token
 */
router.get('/google/callback', oauthController.googleCallback);

// ==================== Gitee OAuth ====================

/**
 * @swagger
 * /api/auth/gitee:
 *   get:
 *     summary: Gitee 登录入口
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: 重定向到 Gitee 授权页面
 */
router.get('/gitee', oauthController.giteeLogin);

/**
 * @swagger
 * /api/auth/gitee/callback:
 *   get:
 *     summary: Gitee 登录回调
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: 重定向到前端并携带 token
 */
router.get('/gitee/callback', oauthController.giteeCallback);

// ==================== 账号绑定管理 ====================

/**
 * @swagger
 * /api/auth/oauth/bindings:
 *   get:
 *     summary: 获取用户绑定的 OAuth 账号
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 返回绑定的账号列表
 */
router.get('/bindings', authMiddleware.verifyToken, oauthController.getBindings);

/**
 * @swagger
 * /api/auth/oauth/unbind/{provider}:
 *   delete:
 *     summary: 解绑 OAuth 账号
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [github, google, gitee]
 *     responses:
 *       200:
 *         description: 解绑成功
 */
router.delete('/unbind/:provider', authMiddleware.verifyToken, oauthController.unbind);

// ==================== 已登录用户绑定第三方账号 ====================

/**
 * @swagger
 * /api/auth/bind/github:
 *   get:
 *     summary: 已登录用户绑定 GitHub
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/bind/github', authMiddleware.verifyToken, oauthController.bindGithub);
router.get('/bind/github/callback', oauthController.bindGithubCallback);

/**
 * @swagger
 * /api/auth/bind/google:
 *   get:
 *     summary: 已登录用户绑定 Google
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/bind/google', authMiddleware.verifyToken, oauthController.bindGoogle);
router.get('/bind/google/callback', oauthController.bindGoogleCallback);

/**
 * @swagger
 * /api/auth/bind/gitee:
 *   get:
 *     summary: 已登录用户绑定 Gitee
 *     tags: [OAuth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/bind/gitee', authMiddleware.verifyToken, oauthController.bindGitee);
router.get('/bind/gitee/callback', oauthController.bindGiteeCallback);

module.exports = router;
