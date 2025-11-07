const visitorStatsService = require('../services/visitor-stats.service');
const { asyncHandler } = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * 访客统计控制器
 */
class VisitorStatsController {
  /**
   * 获取访客统计数据
   * GET /api/visitor-stats
   */
  getVisitorStats = asyncHandler(async (req, res) => {
    try {
      const stats = await visitorStatsService.getStats();

      logger.debug('📊 获取访客统计数据', { count: stats.onlineCount });

      return res.apiSuccess(stats, '获取访客统计成功');
    } catch (error) {
      logger.error('获取访客统计失败:', error);
      return res.apiServerError('获取访客统计失败', { error: error.message });
    }
  });

  /**
   * 清理过期访客活动
   * POST /api/visitor-stats/cleanup
   */
  cleanupExpiredActivities = asyncHandler(async (req, res) => {
    try {
      const cleaned = await visitorStatsService.cleanExpiredActivities();

      logger.info(`🧹 清理过期访客活动: ${cleaned} 条`);

      return res.apiSuccess({ cleaned }, `清理了 ${cleaned} 个过期访客活动`);
    } catch (error) {
      logger.error('清理过期活动失败:', error);
      return res.apiServerError('清理过期活动失败', { error: error.message });
    }
  });
}

module.exports = new VisitorStatsController();
