const { UserActivity, User } = require('../models');
const { Op } = require('sequelize');

/**
 * 活动服务层
 * 处理活动相关的业务逻辑
 */
class ActivityService {
  /**
   * 获取全站最新活动（公开接口，不需要登录）
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 活动列表和分页信息
   */
  async getRecentActivities(options = {}) {
    const { page = 1, limit = 10, type } = options;
    const offset = (page - 1) * limit;

    const where = {};

    // 仅对公开首页展示：过滤仅适合全站展示的活动类型
    // 排除带有“你的/你”主谓结构的私有通知类事件
    const publicTypes = [
      'post_created',
      'post_updated',
      'post_deleted',
      'note_created',
      'note_updated',
      'note_deleted',
      'comment_created',
      'comment_updated',
      'comment_deleted',
      'post_liked',
      'post_unliked',
      'note_liked',
      'note_unliked',
      'post_bookmarked',
      'post_unbookmarked',
      'post_trending',
      'post_featured',
      // 成就、等级、里程碑面向全站也可展示
      'achievement_unlocked',
      'level_up',
      'milestone_reached',
    ];

    // 如果指定了类型，则在公开类型集合内筛选；否则默认使用公开集合
    if (type) {
      where.type = type;
    } else {
      where.type = { [Op.in]: publicTypes };
    }

    const { count, rows } = await UserActivity.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
      ],
      order: [
        ['createdAt', 'DESC'], // 时间倒序
      ],
      limit,
      offset,
    });

    const activities = rows.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.createdAt,
      link: activity.link,
      // 确保metadata是对象而不是字符串
      metadata:
        typeof activity.metadata === 'string'
          ? JSON.parse(activity.metadata)
          : activity.metadata || {},
      priority: activity.priority,
      user: activity.user
        ? {
            id: activity.user.id,
            username: activity.user.username,
            avatar: activity.user.avatar,
          }
        : null,
    }));

    return {
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

module.exports = new ActivityService();
