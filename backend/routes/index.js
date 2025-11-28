const express = require('express');
const router = express.Router();

/**
 * 光阴副本博客系统 - API 路由注册
 * 按功能模块分组，保持清晰的层次结构
 */

// ==================== 核心模块 ====================

// 🔐 认证模块
const authRoutes = require('./auth');

// 👤 用户模块
const userRoutes = require('./users');

// ==================== 内容模块 ====================

// 📝 文章模块
const postRoutes = require('./posts');

// 💬 评论模块
const commentRoutes = require('./comments');

// 🏷️ 标签模块
const tagRoutes = require('./tags');

// 📂 分类模块
const categoryRoutes = require('./categories');

// 📔 笔记模块
const noteRoutes = require('./notes');

// 🚀 项目模块
const projectRoutes = require('./projects');

// ==================== AI 模块 ====================

// 🤖 AI基础功能
const aiRoutes = require('./ai-langchain');

// 💭 AI会话管理
const aiSessionRoutes = require('./ai-conversation');

// ==================== 系统模块 ====================

// ⚙️ 系统监控
const systemRoutes = require('./system');

// 📊 状态统计
const statusRoutes = require('./status');

// 📈 活动记录
const activityRoutes = require('./activities');

// 🎯 贡献统计
const contributionRoutes = require('./contributions');

// ==================== 工具模块 ====================

// 🔄 代理服务
const proxyRoutes = require('./proxy');

// 🎨 站点设置
const siteSettingsRoutes = require('./site-settings');

// 📚 示例接口
const exampleRoutes = require('./example');

// ==================== 路由注册 ====================

// 核心模块
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// 内容模块
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/tags', tagRoutes);
router.use('/categories', categoryRoutes);
router.use('/notes', noteRoutes);
router.use('/projects', projectRoutes);

// AI模块
router.use('/ai', aiRoutes);
router.use('/ai/sessions', aiSessionRoutes);

// 系统模块
router.use('/system', systemRoutes);
router.use('/status', statusRoutes);
router.use('/activities', activityRoutes);
router.use('/contributions', contributionRoutes);

// 工具模块
router.use('/proxy', proxyRoutes);
router.use('/site-settings', siteSettingsRoutes);
router.use('/example', exampleRoutes);

module.exports = router;
