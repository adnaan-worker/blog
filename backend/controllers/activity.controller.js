const activityService = require('../services/activity.service');
const { asyncHandler } = require('../utils/response');

/**
 * 获取全站最新活动（公开接口）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getRecentActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;

  const result = await activityService.getRecentActivities({
    page: parseInt(page),
    limit: parseInt(limit),
    type,
  });

  // 使用分页格式返回
  return res.apiPaginated(result.data, result.pagination, '获取全站活动成功');
});
