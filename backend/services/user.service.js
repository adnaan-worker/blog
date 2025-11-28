const bcrypt = require('bcryptjs');
const db = require('../models');
const {
  User,
  UserActivity,
  UserAchievement,
  Achievement,
  Post,
  Note,
  Comment,
  PostBookmark,
  sequelize,
} = db;
const { Op } = require('sequelize');
const { error } = require('@/utils/response');
const achievementHelper = require('@/utils/achievement');

/**
 * 用户服务层
 * 处理用户相关的业务逻辑
 */
class UserService {
  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {Promise<Object|null>} 用户对象
   */
  async findByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  /**
   * 根据邮箱查找用户
   * @param {string} email - 邮箱
   * @returns {Promise<Object|null>} 用户对象
   */
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  /**
   * 根据ID查找用户
   * @param {string|number} id - 用户ID
   * @returns {Promise<Object|null>} 用户对象
   */
  async findById(id) {
    return await User.findByPk(id);
  }

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {boolean} 是否匹配
   */
  verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  /**
   * 更新用户最后登录时间
   * @param {string|number} id - 用户ID
   * @returns {Promise<Object>} 更新结果
   */
  async updateLastLogin(id) {
    return await User.update({ lastLogin: new Date() }, { where: { id } });
  }

  /**
   * 获取用户资料
   * @param {string|number} userId - 用户ID
   * @returns {Promise<Object>} 用户资料
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取用户统计数据
    const stats = await this.getUserStats(userId);

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName, // 使用Sequelize模型字段名
      email: user.email,
      avatar: user.avatar,
      bio: user.bio || '',
      role: user.role,
      status: user.status,
      joinDate: user.createdAt,
      lastLoginTime: user.lastLogin,
      stats,
    };
  }

  /**
   * 更新用户资料
   * @param {string|number} userId - 用户ID
   * @param {Object} profileData - 资料数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateProfile(userId, profileData) {
    const { fullName, email, bio } = profileData;

    // 验证邮箱格式
    if (email && !this.isValidEmail(email)) {
      throw new Error('邮箱格式不正确');
    }

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = await User.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existingUser) {
        throw new Error('该邮箱已被其他用户使用');
      }
    }

    // 准备更新数据 - 使用Sequelize模型字段名
    const updateData = {};
    if (fullName !== undefined && fullName !== null) updateData.fullName = fullName; // 使用模型字段名
    if (bio !== undefined && bio !== null) updateData.bio = bio;
    if (email && email.trim()) updateData.email = email;

    // 更新用户表
    await User.update(updateData, { where: { id: userId } });

    return { message: '资料更新成功' };
  }

  /**
   * 修改密码
   * @param {string|number} userId - 用户ID
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('当前密码错误');
    }

    // 检查新密码是否与当前密码相同
    if (currentPassword === newPassword) {
      throw new Error('新密码不能与当前密码相同');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 更新密码
    await User.update({ password: hashedPassword }, { where: { id: userId } });
  }

  /**
   * 更新用户头像
   * @param {string|number} userId - 用户ID
   * @param {string} avatarUrl - 头像URL
   * @returns {Promise<void>}
   */
  async updateAvatar(userId, avatarUrl) {
    await User.update({ avatar: avatarUrl }, { where: { id: userId } });
  }

  /**
   * 获取用户活动记录
   * @param {string|number} userId - 用户ID
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 活动记录和分页信息
   */
  async getActivities(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    // 确保 page 和 limit 是整数
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await UserActivity.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const activities = rows.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.createdAt,
      link: activity.link,
      metadata: activity.metadata,
    }));

    return {
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  /**
   * 获取用户成就
   * @param {string|number} userId - 用户ID
   * @returns {Promise<Array>} 成就列表
   */
  async getAchievements(userId) {
    const allAchievements = await Achievement.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']],
    });

    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [
        {
          model: Achievement,
          as: 'achievement',
          required: false,
        },
      ],
    });

    const userAchievementMap = new Map();
    userAchievements.forEach(ua => {
      userAchievementMap.set(ua.achievementId, ua);
    });

    const stats = await achievementHelper.getUserStatsForAchievements(userId);

    const result = allAchievements.map(achievement => {
      const userAchievement = userAchievementMap.get(achievement.id);
      const criteria = achievement.criteria || {};
      const target = criteria.target || 1;

      if (userAchievement) {
        return {
          id: achievement.id,
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          points: achievement.points,
          rarity: achievement.rarity,
          unlocked: userAchievement.unlocked,
          unlockedAt: userAchievement.unlockedAt,
          progress: userAchievement.progress || {
            current: 0,
            target: target,
          },
        };
      } else {
        const currentProgress = achievementHelper.calculateProgressFromStats(criteria.type, stats);

        return {
          id: achievement.id,
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          points: achievement.points,
          rarity: achievement.rarity,
          unlocked: false,
          unlockedAt: null,
          progress: {
            current: currentProgress,
            target: target,
          },
        };
      }
    });

    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
    result.sort((a, b) => {
      if (a.unlocked !== b.unlocked) {
        return b.unlocked ? 1 : -1;
      }
      const aRarity = rarityOrder[a.rarity] || 0;
      const bRarity = rarityOrder[b.rarity] || 0;
      if (aRarity !== bRarity) {
        return bRarity - aRarity;
      }
      return a.id - b.id;
    });

    return result;
  }

  /**
   * 获取用户统计数据
   * @param {string|number} userId - 用户ID
   * @returns {Promise<Array>} 统计数据
   */
  async getUserStats(userId) {
    try {
      // 并行获取所有统计数据
      const [
        articleCount,
        totalViews,
        articleLikes,
        noteLikes,
        commentCount,
        bookmarkCount,
        noteCount,
        // 获取上个月的数据用于计算趋势
        lastMonthArticles,
        lastMonthComments,
      ] = await Promise.all([
        // 发布文章数量
        Post.count({ where: { userId, status: 1 } }),

        // 总阅读量（文章 + 手记）
        Post.sum('viewCount', { where: { userId, status: 1 } })
          .then(sum => sum || 0)
          .then(async postViews => {
            const noteViews =
              (await Note.sum('viewCount', { where: { userId, isPrivate: 0 } })) || 0;
            return postViews + noteViews;
          }),

        // 文章点赞数
        Post.sum('likeCount', { where: { userId, status: 1 } }).then(sum => sum || 0),

        // 手记点赞数
        Note.sum('likeCount', { where: { userId, isPrivate: 0 } }).then(sum => sum || 0),

        // 评论回复数
        Comment.count({ where: { userId } }),

        // 收藏数
        PostBookmark.count({ where: { userId } }),

        // 手记数量
        Note.count({ where: { userId } }),

        // 上个月文章数（用于趋势）
        Post.count({
          where: {
            userId,
            status: 1,
            createdAt: {
              [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 2)),
              [Op.lt]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        }),

        // 上个月评论数（用于趋势）
        Comment.count({
          where: {
            userId,
            createdAt: {
              [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 2)),
              [Op.lt]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        }),
      ]);

      const totalLikes = articleLikes + noteLikes;

      // 计算趋势
      const articleTrend =
        lastMonthArticles > 0
          ? Math.round(((articleCount - lastMonthArticles) / lastMonthArticles) * 100)
          : articleCount > 0
            ? 100
            : 0;

      const commentTrend =
        lastMonthComments > 0
          ? Math.round(((commentCount - lastMonthComments) / lastMonthComments) * 100)
          : commentCount > 0
            ? 100
            : 0;

      // 格式化阅读量
      const formatNumber = num => {
        if (num >= 10000) return `${(num / 10000).toFixed(1)}W`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num;
      };

      return [
        {
          label: '发布文章',
          value: articleCount,
          icon: '📝',
          highlight: true,
          trend: {
            direction: articleTrend >= 0 ? 'up' : 'down',
            percentage: Math.abs(articleTrend),
          },
          link: '/user/articles',
        },
        {
          label: '发布手记',
          value: noteCount,
          icon: '📔',
          link: '/notes',
        },
        {
          label: '总阅读量',
          value: formatNumber(totalViews),
          icon: '👁️',
        },
        {
          label: '获得点赞',
          value: totalLikes,
          icon: '❤️',
        },
        {
          label: '评论回复',
          value: commentCount,
          icon: '💬',
          trend: {
            direction: commentTrend >= 0 ? 'up' : 'down',
            percentage: Math.abs(commentTrend),
          },
        },
        {
          label: '收藏数',
          value: bookmarkCount,
          icon: '🔖',
        },
      ];
    } catch (error) {
      console.error('获取用户统计失败:', error);
      throw new Error('获取用户统计失败');
    }
  }

  /**
   * 导出用户数据
   * @param {string|number} userId - 用户ID
   * @returns {Promise<Object>} 导出结果
   */
  async exportData(userId) {
    try {
      // 这里应该实现数据导出逻辑
      // 可以生成包含用户所有数据的ZIP文件
      // 暂时返回模拟的下载链接
      const downloadUrl = `/api/user/export/download/${userId}`;

      return { downloadUrl };
    } catch (error) {
      throw new Error('导出用户数据失败');
    }
  }

  /**
   * 删除账户
   * @param {string|number} userId - 用户ID
   * @param {string} password - 密码
   * @returns {Promise<void>}
   */
  async deleteAccount(userId, password) {
    // 验证密码
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('密码错误');
    }

    // 删除用户相关数据
    await UserActivity.destroy({ where: { userId } });
    await UserAchievement.destroy({ where: { userId } });

    // 最后删除用户
    await User.destroy({ where: { id: userId } });
  }

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱
   * @returns {boolean} 是否有效
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证密码格式
   * @param {string} password - 密码
   * @returns {boolean} 是否有效
   */
  isValidPassword(password) {
    return password && password.length >= 6;
  }

  /**
   * 加密密码
   * @param {string} password - 明文密码
   * @returns {string} 加密后的密码
   */
  hashPassword(password) {
    return bcrypt.hashSync(password, 12);
  }

  /**
   * 获取所有用户（管理员）
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 用户列表和分页信息
   */
  async getAllUsers(params) {
    const { page = 1, limit = 10, search = '' } = params;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { fullName: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 创建用户（管理员）
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 创建的用户
   */
  async createUser(userData) {
    const { username, email, password, fullName, role = 'user', status = 'active' } = userData;

    // 检查用户名是否存在
    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否存在
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new Error('邮箱已被使用');
    }

    // 加密密码
    const hashedPassword = this.hashPassword(password);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      status,
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user.toJSON();
    return userInfo;
  }

  /**
   * 更新用户（管理员）
   * @param {string|number} userId - 用户ID
   * @param {Object} userData - 更新数据
   * @returns {Promise<Object>} 更新后的用户
   */
  async updateUser(userId, userData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const { username, email, fullName, role, status } = userData;

    // 如果更新用户名，检查是否已存在
    if (username && username !== user.username) {
      const existingUsername = await this.findByUsername(username);
      if (existingUsername) {
        throw new Error('用户名已存在');
      }
    }

    // 如果更新邮箱，检查是否已存在
    if (email && email !== user.email) {
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new Error('邮箱已被使用');
      }
    }

    // 更新用户
    await user.update({
      ...(username && { username }),
      ...(email && { email }),
      ...(fullName !== undefined && { fullName }),
      ...(role && { role }),
      ...(status && { status }),
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user.toJSON();
    return userInfo;
  }

  /**
   * 删除用户（管理员）
   * @param {string|number} userId - 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 删除用户相关数据
    await UserActivity.destroy({ where: { userId } });
    await UserAchievement.destroy({ where: { userId } });

    // 删除用户
    await user.destroy();
    return { message: '用户删除成功' };
  }

  /**
   * 获取用户内容发布趋势（最近6个月）
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 发布趋势数据
   */
  async getPublishTrend(userId) {
    // 获取最近6个月的数据
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 查询文章和手记的月度统计
    const [articleStats, noteStats] = await Promise.all([
      Post.findAll({
        where: {
          userId,
          createdAt: { [Op.gte]: sixMonthsAgo },
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('COUNT', '*'), 'count'],
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        raw: true,
      }),
      Note.findAll({
        where: {
          userId,
          createdAt: { [Op.gte]: sixMonthsAgo },
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('COUNT', '*'), 'count'],
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        raw: true,
      }),
    ]);

    // 合并统计数据
    const monthMap = {};
    [...articleStats, ...noteStats].forEach(stat => {
      const month = stat.month;
      monthMap[month] = (monthMap[month] || 0) + parseInt(stat.count);
    });

    // 生成最近6个月的数据
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthLabel = `${String(date.getMonth() + 1).padStart(2, '0')}月`;
      trend.push({
        month: monthLabel,
        value: monthMap[monthKey] || 0,
      });
    }

    return trend;
  }

  /**
   * 获取管理员待办事项
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 待办事项列表
   */
  async getAdminTodoItems(userId) {
    const [pendingPosts, pendingComments] = await Promise.all([
      // 待审核文章
      Post.count({
        where: {
          status: 0, // 草稿状态
        },
      }),
      // 待审核评论
      Comment.count({
        where: {
          status: 'pending',
        },
      }),
    ]);

    const todoItems = [];

    if (pendingPosts > 0) {
      todoItems.push({
        id: 'pending-posts',
        title: '待审核文章',
        count: pendingPosts,
        type: 'warning',
      });
    }

    if (pendingComments > 0) {
      todoItems.push({
        id: 'pending-comments',
        title: '待处理评论',
        count: pendingComments,
        type: 'primary',
      });
    }

    return todoItems;
  }
}

// 创建服务实例
const userService = new UserService();

module.exports = userService;
