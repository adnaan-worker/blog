const commentService = require('@/services/comment.service');
const cacheService = require('@/services/cache.service');
const { asyncHandler } = require('@/utils/response');
const { collectVisitorInfo, getLocationFromIP } = require('@/utils/visitor-info');
const { Comment, User, Post } = require('../models');

/**
 * 转换评论数据为前端期望的格式
 * @param {Object} comment - 数据库评论对象
 * @returns {Object} 前端格式的评论对象
 */
const transformCommentForFrontend = comment => {
  if (!comment) return null;

  const commentData = comment.toJSON ? comment.toJSON() : comment;

  // 递归处理回复数据
  const replies = commentData.replies ? commentData.replies.map(transformCommentForFrontend) : [];

  // 返回扁平化的完整数据，不冗余
  return {
    ...commentData,
    replies,
  };
};

/**
 * 获取文章的评论列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.getCommentsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  // 构建缓存键
  const cacheKey = `comments:post:${postId}:${page}:${limit}:${status || 'all'}`;

  // 尝试从缓存获取，如果没有则从数据库获取并缓存
  const result = await cacheService.getOrSet(
    cacheKey,
    async () => {
      const options = { page, limit };

      // 如果是管理员请求，可以根据状态筛选
      if (req.user && req.user.role === 'admin' && status) {
        options.status = status;
      } else {
        // 非管理员只能看到已批准的评论
        options.status = 'approved';
      }

      return await commentService.findByPostId(postId, options);
    },
    300
  ); // 缓存5分钟

  // 转换数据格式为前端期望的格式
  const transformedData = result.data.map(transformCommentForFrontend);

  return res.apiPaginated(transformedData, result.pagination, '获取评论列表成功');
});

/**
 * 获取评论列表（统一接口）
 * 管理员：返回所有评论
 * 普通用户：返回自己的评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUserComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const isAdmin = req.user.role === 'admin';

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  // 如果指定了状态，添加状态过滤
  if (status) {
    options.status = status;
  }

  let result;

  if (isAdmin) {
    // 管理员：查询所有评论（包含回复树）

    const where = { parentId: null }; // 只查询顶级评论
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Comment.findAndCountAll({
      where,
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
        {
          model: Comment,
          as: 'replies',
          where: status ? { status } : undefined,
          required: false,
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
    });

    const totalPages = Math.ceil(count / limit);

    result = {
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
  } else {
    // 普通用户：只查询自己的评论
    result = await commentService.findByUserId(req.user.id, options);
  }

  return res.apiPaginated(result.data, result.pagination, '获取评论列表成功');
});

/**
 * 获取单个评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.getCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 构建缓存键
  const cacheKey = `comments:${id}`;

  // 尝试从缓存获取，如果没有则从数据库获取并缓存
  const comment = await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await commentService.findById(id);
    },
    600
  ); // 缓存10分钟

  if (!comment) {
    return res.apiNotFound('评论不存在');
  }

  // 非管理员只能看到已批准的评论
  if (comment.status !== 'approved' && (!req.user || req.user.role !== 'admin')) {
    return res.apiForbidden('无权访问此评论');
  }

  // 转换数据格式为前端期望的格式
  const transformedComment = transformCommentForFrontend(comment);

  return res.apiItem(transformedComment, '获取评论成功');
});

/**
 * 创建评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.createComment = asyncHandler(async (req, res) => {
  const commentData = req.body;

  // 判断是登录用户还是访客
  const isLoggedIn = req.user && req.user.id;

  if (isLoggedIn) {
    // 登录用户评论 - 自动批准
    commentData.userId = req.user.id;
    commentData.isGuest = false;
    commentData.status = 'approved'; // 登录用户评论自动批准
  } else {
    // 访客评论
    const { guestName, guestEmail, guestWebsite } = req.body;

    // 验证访客必填信息
    if (!guestName || !guestName.trim()) {
      return res.apiBadRequest('访客评论需要提供姓名');
    }

    if (!guestEmail || !guestEmail.trim()) {
      return res.apiBadRequest('访客评论需要提供邮箱');
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return res.apiBadRequest('邮箱格式不正确');
    }

    commentData.userId = null;
    commentData.isGuest = true;
    commentData.guestName = guestName.trim();
    commentData.guestEmail = guestEmail.trim().toLowerCase();
    commentData.guestWebsite = guestWebsite?.trim() || null;

    // 访客评论默认需要审核（除非配置为自动批准）
    commentData.status = commentData.status || 'pending';
  }

  // 收集访客信息
  try {
    const visitorInfo = await collectVisitorInfo(req);

    // 将访客信息添加到评论数据
    commentData.ip = visitorInfo.ip;
    commentData.userAgent = visitorInfo.userAgent;
    commentData.location = visitorInfo.location;
    commentData.browser = visitorInfo.browser;
    commentData.os = visitorInfo.os;
    commentData.device = visitorInfo.device;
  } catch (error) {
    // 如果收集访客信息失败，记录错误但不影响评论创建
    console.error('收集访客信息失败:', error);
  }

  // 创建评论
  const comment = await commentService.create(commentData);

  // 清除相关缓存
  await cacheService.deletePattern(`comments:post:${commentData.postId}:*`);

  return res.apiCreated(comment, '评论创建成功');
});

/**
 * 更新评论状态（管理员功能）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.updateCommentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // 检查评论是否存在
  const existingComment = await commentService.findById(id);

  if (!existingComment) {
    return res.apiNotFound('评论不存在');
  }

  // 更新评论状态
  await commentService.updateStatus(id, status);

  // 清除相关缓存
  await cacheService.del(`comments:${id}`);
  await cacheService.deletePattern(`comments:post:${existingComment.postId}:*`);

  // 获取更新后的评论
  const updatedComment = await commentService.findById(id);

  return res.apiUpdated(updatedComment, '评论状态更新成功');
});

/**
 * 删除评论
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 检查评论是否存在
  const existingComment = await commentService.findById(id);

  if (!existingComment) {
    return res.apiNotFound('评论不存在');
  }

  // 检查权限：只有评论作者或管理员可以删除评论
  if (existingComment.userId !== req.user.id && req.user.role !== 'admin') {
    return res.apiForbidden('无权删除此评论');
  }

  // 删除评论
  await commentService.delete(id);

  // 清除相关缓存
  await cacheService.del(`comments:${id}`);
  await cacheService.deletePattern(`comments:post:${existingComment.postId}:*`);

  return res.apiDeleted('评论删除成功', { deletedId: id });
});
