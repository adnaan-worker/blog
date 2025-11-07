const tagService = require('../services/tag.service');
const cacheService = require('../services/cache.service');
const { asyncHandler } = require('../utils/response');

/**
 * 获取标签列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.getAllTags = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  // 构建缓存键
  const cacheKey = `tags:list:${page}:${limit}:${search || 'all'}`;

  // 尝试从缓存获取，如果没有则从数据库获取并缓存
  const result = await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await tagService.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });
    },
    600
  ); // 缓存10分钟

  return res.apiPaginated(result.data, result.pagination, '获取标签列表成功');
});

/**
 * 获取单个标签
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.getTagById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 构建缓存键
  const cacheKey = `tags:${id}`;

  // 尝试从缓存获取，如果没有则从数据库获取并缓存
  const tag = await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await tagService.findById(id);
    },
    600
  ); // 缓存10分钟

  if (!tag) {
    return res.apiNotFound('标签不存在');
  }

  return res.apiItem(tag, '获取标签成功');
});

/**
 * 创建标签（管理员功能）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.createTag = asyncHandler(async (req, res) => {
  const tagData = req.body;

  // 创建标签
  const tag = await tagService.create(tagData);

  // 清除标签列表缓存
  await cacheService.deletePattern('tags:list:*');

  return res.apiCreated(tag, '标签创建成功');
});

/**
 * 更新标签（管理员功能）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.updateTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tagData = req.body;

  // 检查标签是否存在
  const existingTag = await tagService.findById(id);

  if (!existingTag) {
    return res.apiNotFound('标签不存在');
  }

  // 更新标签
  const updatedTag = await tagService.update(id, tagData);

  // 清除相关缓存
  await cacheService.del(`tags:${id}`);
  await cacheService.del(`tags:slug:${existingTag.slug}`);
  if (tagData.slug && tagData.slug !== existingTag.slug) {
    await cacheService.del(`tags:slug:${tagData.slug}`);
  }
  await cacheService.deletePattern('tags:list:*');

  return res.apiUpdated(updatedTag, '标签更新成功');
});

/**
 * 删除标签（管理员功能）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.deleteTag = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 检查标签是否存在
  const existingTag = await tagService.findById(id);

  if (!existingTag) {
    return res.apiNotFound('标签不存在');
  }

  // 删除标签
  await tagService.delete(id);

  // 清除相关缓存
  await cacheService.del(`tags:${id}`);
  await cacheService.del(`tags:slug:${existingTag.slug}`);
  await cacheService.deletePattern('tags:list:*');

  return res.apiDeleted('标签删除成功', { deletedId: id });
});

/**
 * 获取文章的标签
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.getTagsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // 构建缓存键
  const cacheKey = `tags:post:${postId}`;

  // 尝试从缓存获取，如果没有则从数据库获取并缓存
  const tags = await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await tagService.getTagsByPostId(postId);
    },
    600
  ); // 缓存10分钟

  return res.apiList(tags, '获取文章标签成功');
});
