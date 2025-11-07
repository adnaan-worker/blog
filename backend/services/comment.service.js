const db = require('../models');
const Comment = db.Comment;
const User = db.User;
const Post = db.Post;
const achievementHelper = require('../utils/achievement');
const activityHelper = require('../utils/activity');

/**
 * 评论服务层
 * 处理与评论相关的业务逻辑
 */
class CommentService {
  /**
   * 创建新评论
   * @param {Object} commentData - 评论数据
   * @returns {Promise<Object>} 创建的评论对象
   */
  async create(commentData) {
    // 如果没有指定状态，默认为待审核状态
    // 管理员在控制器层会设置status为approved
    const comment = await Comment.create({
      status: 'pending', // 默认状态
      ...commentData, // 允许控制器覆盖status
    });

    // 获取文章信息
    const post = await Post.findByPk(commentData.postId);

    // 记录活动
    if (post) {
      const postAuthor = await User.findByPk(post.userId, { attributes: ['id', 'username'] });
      await activityHelper.recordCommentCreated(
        commentData.userId,
        comment,
        post,
        postAuthor?.username
      );

      // 通知文章作者收到评论
      const user = await User.findByPk(commentData.userId, { attributes: ['id', 'username'] });
      await activityHelper.recordCommentReceived(
        post.userId,
        commentData.userId,
        comment,
        post,
        user
      );
    }

    // 如果评论创建时就是审核通过状态，检查成就
    if (comment.status === 'approved') {
      await achievementHelper.checkCommentAchievements(commentData.userId);
    }

    return comment;
  }

  /**
   * 根据ID查找评论
   * @param {number} id - 评论ID
   * @returns {Promise<Object>} 评论对象
   */
  async findById(id) {
    return await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'role'],
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar', 'role'],
            },
          ],
        },
      ],
    });
  }

  /**
   * 获取文章的评论列表
   * @param {number} postId - 文章ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 包含评论列表和总数的对象
   */
  async findByPostId(postId, options = {}) {
    const { page = 1, limit = 10, status } = options;

    const query = {
      where: {
        postId,
        parentId: null, // 只获取顶级评论
        status: 'approved', // 前端只显示审核通过的评论
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'role'],
        },
        {
          model: Comment,
          as: 'replies',
          where: { status: 'approved' }, // 回复也只显示审核通过的
          required: false, // 左连接，即使没有回复也显示父评论
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar', 'role'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    };

    // 管理员可以根据状态筛选
    if (status) {
      query.where.status = status;
      // 如果指定了状态，回复也要匹配相同状态
      if (query.include[1].where) {
        query.include[1].where.status = status;
      }
    }

    // 获取总数和数据
    const { count, rows } = await Comment.findAndCountAll(query);

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
   * 获取用户的评论列表
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 包含评论列表和总数的对象
   */
  async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;

    const query = {
      where: { userId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'role'],
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    };

    // 根据状态筛选
    if (status) {
      query.where.status = status;
    }

    // 获取总数和数据
    const { count, rows } = await Comment.findAndCountAll(query);

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
   * 更新评论
   * @param {number} id - 评论ID
   * @param {Object} commentData - 更新的评论数据
   * @returns {Promise<Object>} 更新结果
   */
  async update(id, commentData) {
    await Comment.update(commentData, {
      where: { id },
    });

    return this.findById(id);
  }

  /**
   * 删除评论（软删除）
   * @param {number} id - 评论ID
   * @returns {Promise<number>} 删除的记录数
   */
  async delete(id) {
    return await Comment.destroy({
      where: { id },
    });
  }

  /**
   * 更新评论状态
   * @param {number} id - 评论ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} 更新结果
   */
  async updateStatus(id, status) {
    const comment = await Comment.findByPk(id);

    if (!comment) {
      throw new Error('评论不存在');
    }

    // 更新状态
    await comment.update({ status });

    // 审核通过后检查成就
    if (status === 'approved') {
      await achievementHelper.checkCommentAchievements(comment.userId);
    }

    return comment;
  }

  /**
   * 获取待审核的评论列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 包含评论列表和总数的对象
   */
  async getPendingComments(options = {}) {
    const { page = 1, limit = 10 } = options;

    const query = {
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'role'],
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title'],
        },
      ],
      order: [['createdAt', 'ASC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    };

    // 获取总数和数据
    const { count, rows } = await Comment.findAndCountAll(query);

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      comments: rows,
    };
  }
}

module.exports = new CommentService();
