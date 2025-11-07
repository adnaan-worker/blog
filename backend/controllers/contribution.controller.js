/**
 * 贡献统计控制器
 */

const contributionService = require('../services/contribution.service');
const { asyncHandler } = require('../utils/response');

/**
 * 获取贡献统计数据
 */
exports.getContributions = asyncHandler(async (req, res) => {
  const { githubUsername, giteeUsername } = req.query;

  // 至少需要一个用户名
  if (!githubUsername && !giteeUsername) {
    return res.apiError('请提供 GitHub 或 Gitee 用户名', 400);
  }

  const chartData = await contributionService.getRecentContributions(
    githubUsername || '',
    giteeUsername || ''
  );

  return res.apiSuccess(chartData, '获取贡献数据成功');
});
