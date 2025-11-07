/**
 * 贡献统计路由
 */

const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contribution.controller');

/**
 * @route   GET /api/contributions
 * @desc    获取 GitHub + Gitee 贡献统计
 * @query   githubUsername - GitHub 用户名
 * @query   giteeUsername - Gitee 用户名
 * @access  Public
 */
router.get('/', contributionController.getContributions);

module.exports = router;
