const activityService = require('@/services/activity.service');
const { asyncHandler } = require('@/utils/response');
const socketManager = require('@/utils/socket');
const { Post, Note } = require('../models');
const { logger } = require('@/utils/logger');

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

/**
 * 获取房间信息（包含文章/手记/页面的在线人数）
 * 优化：只返回有在线人数的房间，减少数据传输
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getRoomsInfo = asyncHandler(async (req, res) => {
  // 获取所有房间的在线人数
  const roomsInfo = socketManager.getRoomsInfo();

  // 只返回有在线人数的房间
  const activeRooms = Object.entries(roomsInfo)
    .filter(([, count]) => count > 0)
    .reduce((acc, [roomName, count]) => {
      acc[roomName] = count;
      return acc;
    }, {});

  return res.apiSuccess(
    {
      roomCount: activeRooms,
      totalRooms: Object.keys(roomsInfo).length,
      activeRooms: Object.keys(activeRooms).length,
    },
    '获取房间信息成功'
  );
});
