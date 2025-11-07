const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 博客系统
 *   description: 博客系统API接口
 */

// 导入模块化路由
const authRoutes = require('./auth');
const userRoutes = require('./users');
const postRoutes = require('./posts');
const commentRoutes = require('./comments');
const tagRoutes = require('./tags');
const categoryRoutes = require('./categories');
const systemRoutes = require('./system');
const exampleRoutes = require('./example');
const aiRoutes = require('./ai');
const statusRoutes = require('./status');
const noteRoutes = require('./notes');
const siteSettingsRoutes = require('./site-settings');
const activityRoutes = require('./activities');
const projectRoutes = require('./projects');
const contributionRoutes = require('./contributions');
const proxyRoutes = require('./proxy');
const visitorStatsRoutes = require('./visitor-stats');

// 注册模块化路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes); // 统一用户路由
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/tags', tagRoutes);
router.use('/categories', categoryRoutes);
router.use('/system', systemRoutes);
router.use('/example', exampleRoutes);
router.use('/ai', aiRoutes);
router.use('/status', statusRoutes);
router.use('/notes', noteRoutes);
router.use('/site-settings', siteSettingsRoutes);
router.use('/activities', activityRoutes); // 全站活动路由（公开接口）
router.use('/projects', projectRoutes); // 项目路由
router.use('/contributions', contributionRoutes); // GitHub + Gitee 贡献统计路由
router.use('/proxy', proxyRoutes); // 代理服务路由（解决CORS跨域问题）
router.use('/visitor-stats', visitorStatsRoutes); // 访客统计路由

module.exports = router;
