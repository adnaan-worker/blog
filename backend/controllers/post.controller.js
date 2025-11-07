const db = require('../models');
const Post = db.Post;
const User = db.User;
const Tag = db.Tag;
const Categroup = db.Categroup;
const PostLike = db.PostLike;
const PostBookmark = db.PostBookmark;
const { Op } = require('sequelize');
const { asyncHandler, createPagination } = require('../utils/response');
const postService = require('../services/post.service');
const ReadingTracker = require('../utils/reading-tracker');
const activityHelper = require('../utils/activity');
const achievementHelper = require('../utils/achievement');
const { logger } = require('../utils/logger');

/**
 * 获取公开文章列表（前台展示）
 * 返回所有已发布且审核通过的文章
 */
exports.getAllPosts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search, tagId, categoryId, tag, year } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const where = {};

  // 前台只显示已发布且审核通过的文章
  where.status = 1;
  where.auditStatus = 1;

  // 搜索功能
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }

  // 标签过滤（支持两种参数名）
  const tagFilter = tagId || tag;
  let tagInclude = null;
  if (tagFilter) {
    if (isNaN(tagFilter)) {
      // 如果是标签名，通过关联查询
      tagInclude = {
        model: Tag,
        as: 'tags',
        where: { name: { [Op.like]: `%${tagFilter}%` } },
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      };
    } else {
      // 如果是标签ID
      tagInclude = {
        model: Tag,
        as: 'tags',
        where: { id: parseInt(tagFilter) },
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      };
    }
  }

  // 分类过滤
  if (categoryId) {
    where.typeId = parseInt(categoryId);
  }

  // 按年份筛选
  if (year) {
    const yearInt = parseInt(year);
    const startDate = new Date(yearInt, 0, 1); // 1月1日
    const endDate = new Date(yearInt + 1, 0, 1); // 下一年1月1日
    where.publishedAt = {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    };
  }

  // 完整的关联查询：作者、分类、标签
  const include = [
    {
      model: User,
      as: 'author',
      attributes: ['id', 'username', 'email', 'fullName', 'avatar'],
    },
    {
      model: Categroup,
      as: 'category',
      attributes: ['id', 'name', 'description'],
    },
    // 如果有标签筛选，使用带条件的 include，否则使用普通 include
    tagInclude || {
      model: Tag,
      as: 'tags',
      through: { attributes: [] },
      attributes: ['id', 'name', 'description'],
    },
  ];

  const { count, rows } = await Post.findAndCountAll({
    where,
    include,
    order: [
      ['publishedAt', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  const totalPages = Math.ceil(count / limit);
  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: count,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return res.apiPaginated(rows, pagination, '获取文章列表成功');
});

/**
 * 获取所有年份列表
 */
exports.getYears = asyncHandler(async (req, res) => {
  const years = await postService.getYears();
  return res.apiSuccess(years, '获取年份列表成功');
});

/**
 * 获取我的文章列表（个人中心管理）
 * 普通用户：返回自己的所有文章
 * 管理员/协管：返回所有文章（支持状态筛选）
 */
exports.getMyPosts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, status, search, tagId, categoryId, tag } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const where = {};
  const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

  // 权限控制
  if (isAdmin) {
    // 管理员：可以查看所有文章，支持状态筛选
    if (status !== undefined) {
      where.status = parseInt(status);
    }
  } else {
    // 普通用户：只能查看自己的文章
    where.userId = req.user.id;
  }

  // 搜索功能
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }

  // 标签过滤
  const tagFilter = tagId || tag;
  let myPostTagInclude = null;
  if (tagFilter) {
    if (isNaN(tagFilter)) {
      // 如果是标签名，通过关联查询
      myPostTagInclude = {
        model: Tag,
        as: 'tags',
        where: { name: { [Op.like]: `%${tagFilter}%` } },
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      };
    } else {
      // 如果是标签ID
      myPostTagInclude = {
        model: Tag,
        as: 'tags',
        where: { id: parseInt(tagFilter) },
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      };
    }
  }

  // 分类过滤
  if (categoryId) {
    where.typeId = parseInt(categoryId);
  }

  const include = [
    {
      model: User,
      as: 'author',
      attributes: ['id', 'username', 'email', 'fullName', 'avatar'],
    },
    {
      model: Categroup,
      as: 'category',
      attributes: ['id', 'name', 'description'],
    },
    // 如果有标签筛选，使用带条件的 include，否则使用普通 include
    myPostTagInclude || {
      model: Tag,
      as: 'tags',
      through: { attributes: [] },
      attributes: ['id', 'name', 'description'],
    },
  ];

  const { count, rows } = await Post.findAndCountAll({
    where,
    include,
    order: [
      ['publishedAt', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  const totalPages = Math.ceil(count / limit);
  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: count,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return res.apiPaginated(rows, pagination, '获取我的文章列表成功');
});

// 通过ID获取文章
exports.getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findByPk(id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email', 'fullName', 'avatar'],
      },
      {
        model: Categroup,
        as: 'category',
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Tag,
        as: 'tags',
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      },
    ],
  });

  if (!post) {
    return res.apiNotFound('文章不存在');
  }

  // 使用节流机制更新最后阅读时间（避免频繁写数据库）
  await ReadingTracker.trackPostReading(id, post);

  // 增加浏览量
  await post.increment('viewCount');

  // 检查作者的阅读数成就（异步执行，不阻塞响应）
  if (post.auditStatus === 1 && post.userId) {
    achievementHelper.checkArticleAchievements(post.userId).catch(err => {
      logger.error('检查阅读数成就失败:', err);
    });
  }

  return res.apiItem(post, '获取文章成功');
});

// 创建文章
exports.createPost = asyncHandler(async (req, res) => {
  const postData = req.body;
  const tagIds = postData.tagIds || [];
  delete postData.tagIds; // 从 postData 中移除，由 service 处理

  postData.userId = req.user.id;

  // 使用 service 层创建文章（包含审核逻辑）
  const post = await postService.create(postData, tagIds, req.user);

  // 返回创建后的完整文章信息（包含分类）
  const createdPost = await Post.findByPk(post.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email', 'fullName', 'avatar'],
      },
      {
        model: Categroup,
        as: 'category',
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Tag,
        as: 'tags',
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      },
    ],
  });

  return res.apiCreated(createdPost, '文章创建成功');
});

// 更新文章
exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const postData = req.body;
  const tagIds = postData.tagIds;
  delete postData.tagIds; // 从 postData 中移除，由 service 处理

  const post = await Post.findByPk(id);

  if (!post) {
    return res.apiNotFound('文章不存在');
  }

  // 检查权限
  if (post.userId !== req.user.id && req.user.role !== 'admin') {
    return res.apiForbidden('无权更新此文章');
  }

  // 如果状态从未发布变为已发布，设置发布时间
  if (post.status !== 1 && postData.status === 1) {
    postData.publishedAt = new Date();
  }

  // 使用 service 层更新文章（包含审核逻辑）
  const updatedPost = await postService.update(id, postData, tagIds, req.user);

  return res.apiSuccess(updatedPost, '文章更新成功');
});

// 删除文章
exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findByPk(id);

  if (!post) {
    return res.apiNotFound('文章不存在');
  }

  // 检查是否有权限删除文章（作者或管理员）
  if (post.userId !== req.user.id && req.user.role !== 'admin') {
    return res.apiForbidden('无权删除此文章');
  }

  // 使用 service 层删除文章（包含活动记录）
  await postService.delete(id, req.user);

  return res.apiDeleted('文章删除成功');
});

/**
 * 切换文章点赞状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.togglePostLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的文章ID');
  }

  // 检查是否登录
  if (!req.user) {
    return res.apiError('请先登录后再点赞', 200);
  }

  const userId = req.user.id;

  const post = await Post.findByPk(id);
  if (!post) {
    return res.apiNotFound('文章不存在');
  }

  // 检查是否已点赞
  const existingLike = await PostLike.findOne({
    where: { postId: parseInt(id), userId },
  });

  if (existingLike) {
    // 取消点赞
    await existingLike.destroy();
    await post.decrement('likeCount');

    // 记录取消点赞活动
    await activityHelper.recordUnlike(userId, 'post', post);

    return res.apiSuccess(
      { liked: false, likeCount: Math.max(0, post.likeCount - 1) },
      '取消点赞成功'
    );
  } else {
    // 添加点赞
    await PostLike.create({ postId: parseInt(id), userId });
    await post.increment('likeCount');

    // 记录点赞活动
    await activityHelper.recordLike(userId, 'post', post);

    // 通知作者收到点赞
    const user = await User.findByPk(userId, { attributes: ['id', 'username'] });
    await activityHelper.recordLikeReceived(post.userId, userId, 'post', post, user);

    // 检查作者的点赞数成就（重新加载文章以获取最新点赞数）
    const updatedPost = await Post.findByPk(id);
    if (updatedPost && updatedPost.auditStatus === 1) {
      await achievementHelper.checkArticleAchievements(post.userId);
    }

    return res.apiSuccess({ liked: true, likeCount: post.likeCount + 1 }, '点赞成功');
  }
});

/**
 * 切换文章收藏状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.togglePostBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的文章ID');
  }

  // 检查是否登录
  if (!req.user) {
    return res.apiError('请先登录后再收藏', 200);
  }

  const userId = req.user.id;

  const post = await Post.findByPk(id);
  if (!post) {
    return res.apiNotFound('文章不存在');
  }

  // 检查是否已收藏
  const existingBookmark = await PostBookmark.findOne({
    where: { postId: parseInt(id), userId },
  });

  if (existingBookmark) {
    // 取消收藏
    await existingBookmark.destroy();

    // 记录取消收藏活动
    await activityHelper.recordUnbookmark(userId, post);

    return res.apiSuccess({ bookmarked: false }, '取消收藏成功');
  } else {
    // 添加收藏
    await PostBookmark.create({ postId: parseInt(id), userId });

    // 记录收藏活动
    await activityHelper.recordBookmark(userId, post);

    // 通知作者收到收藏
    const user = await User.findByPk(userId, { attributes: ['id', 'username'] });
    await activityHelper.recordBookmarkReceived(post.userId, userId, post, user);

    return res.apiSuccess({ bookmarked: true }, '收藏成功');
  }
});

/**
 * 获取用户对文章的点赞和收藏状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getPostUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的文章ID');
  }

  const post = await Post.findByPk(id);
  if (!post) {
    return res.apiNotFound('文章不存在');
  }

  // 如果未登录，返回默认状态
  if (!req.user) {
    return res.apiSuccess(
      {
        liked: false,
        bookmarked: false,
        likeCount: post.likeCount,
      },
      '获取状态成功'
    );
  }

  const userId = req.user.id;

  // 检查点赞状态
  const likeStatus = await PostLike.findOne({
    where: { postId: parseInt(id), userId },
  });

  // 检查收藏状态
  const bookmarkStatus = await PostBookmark.findOne({
    where: { postId: parseInt(id), userId },
  });

  return res.apiSuccess(
    {
      liked: !!likeStatus,
      bookmarked: !!bookmarkStatus,
      likeCount: post.likeCount,
    },
    '获取状态成功'
  );
});

/**
 * 获取用户收藏列表
 */
exports.getUserBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let { page = 1, limit = 10, search } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const offset = (page - 1) * limit;

  // 构建查询条件
  const where = { userId };
  const postWhere = {};

  // 搜索功能
  if (search) {
    postWhere[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { summary: { [Op.like]: `%${search}%` } },
    ];
  }

  // 查询收藏列表
  const { count, rows } = await PostBookmark.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Post,
        as: 'post',
        where: postWhere,
        attributes: ['id', 'title', 'summary', 'viewCount', 'likeCount', 'createdAt', 'status'],
        required: true, // 内连接，只返回文章存在的收藏
      },
    ],
    order: [['createdAt', 'DESC']], // 按收藏时间倒序
  });

  // 构建分页对象
  const pagination = createPagination(count, page, limit);

  return res.apiPaginated(rows, pagination, '获取收藏列表成功');
});

/**
 * 获取用户点赞列表
 */
exports.getUserLikes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let { page = 1, limit = 10, search } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const offset = (page - 1) * limit;

  // 构建查询条件
  const where = { userId };
  const postWhere = {};

  // 搜索功能
  if (search) {
    postWhere[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { summary: { [Op.like]: `%${search}%` } },
    ];
  }

  // 查询点赞列表
  const { count, rows } = await PostLike.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Post,
        as: 'post',
        where: postWhere,
        attributes: ['id', 'title', 'summary', 'viewCount', 'likeCount', 'createdAt', 'status'],
        required: true, // 内连接，只返回文章存在的点赞
      },
    ],
    order: [['createdAt', 'DESC']], // 按点赞时间倒序
  });

  // 构建分页对象
  const pagination = createPagination(count, page, limit);

  return res.apiPaginated(rows, pagination, '获取点赞列表成功');
});

/**
 * 审核文章（管理员）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.auditPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { auditStatus } = req.body;

  if (![1, 2].includes(auditStatus)) {
    return res.apiBadRequest('审核状态无效，必须为 1(通过) 或 2(驳回)');
  }

  const post = await postService.auditPost(id, auditStatus, req.user.id);

  const message = auditStatus === 1 ? '文章审核通过' : '文章已驳回';
  return res.apiSuccess(post, message);
});
