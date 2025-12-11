const friendLinkService = require('@/services/friend-link.service');
const cacheService = require('@/services/cache.service');
const { asyncHandler } = require('@/utils/response');

/**
 * 获取公开友链列表
 */
exports.getPublicFriends = asyncHandler(async (req, res) => {
  const pagination = req.pagination || {};
  const page = pagination.page || parseInt(req.query.page || '1', 10) || 1;
  const limit = pagination.limit || parseInt(req.query.limit || '50', 10) || 50;

  const cacheKey = `friend-links:public:${page}:${limit}`;

  const result = await cacheService.getOrSet(
    cacheKey,
    async () => {
      return friendLinkService.getPublicFriends({ page, limit });
    },
    300
  );

  return res.apiPaginated(result.data, result.pagination, '获取友链列表成功');
});

/**
 * 提交友链申请
 */
exports.applyFriendLink = asyncHandler(async (req, res) => {
  const { name, url, description, avatar } = req.body;

  if (!name || !name.trim()) {
    return res.apiBadRequest('网站名称不能为空');
  }

  if (!url || !url.trim()) {
    return res.apiBadRequest('网站地址不能为空');
  }

  const trimmedUrl = url.trim();
  const urlRegex = /^(https?:\/\/).+/i;
  if (!urlRegex.test(trimmedUrl)) {
    return res.apiBadRequest('网站地址必须以 http:// 或 https:// 开头');
  }

  const data = {
    name: name.trim(),
    url: trimmedUrl,
    description: description ? description.trim() : '',
    avatar: avatar ? avatar.trim() : null,
  };

  if (req.user) {
    data.applyUserId = req.user.id;
    data.ownerName = req.user.fullName || req.user.username || data.name;
    data.ownerEmail = req.user.email || null;
  }

  const link = await friendLinkService.applyFriendLink(data);

  // 新申请不直接影响公开列表（待审核），此处不清理公开缓存

  return res.apiCreated(link, '友链申请已提交，等待审核');
});

/**
 * 管理端：获取友链列表
 */
exports.getAdminFriends = asyncHandler(async (req, res) => {
  const pagination = req.pagination || {};
  const page = pagination.page || parseInt(req.query.page || '1', 10) || 1;
  const limit = pagination.limit || parseInt(req.query.limit || '10', 10) || 10;

  const status = req.filters?.status;
  const keyword = req.query.keyword || req.query.search;

  const result = await friendLinkService.getAdminFriends({
    page,
    limit,
    status,
    search: keyword,
  });

  return res.apiPaginated(result.data, result.pagination, '获取友链列表成功');
});

/**
 * 管理端：更新友链
 */
exports.updateFriendLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || Number.isNaN(Number(id))) {
    return res.apiBadRequest('无效的友链ID');
  }

  const link = await friendLinkService.updateFriendLink(Number(id), req.body);

  if (!link) {
    return res.apiNotFound('友链不存在');
  }

  await cacheService.deletePattern('friend-links:public:*');

  return res.apiUpdated(link, '友链更新成功');
});

/**
 * 管理端：更新友链状态
 */
exports.updateFriendLinkStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || Number.isNaN(Number(id))) {
    return res.apiBadRequest('无效的友链ID');
  }

  const allowedStatus = ['pending', 'approved', 'rejected', 'blocked'];
  if (!allowedStatus.includes(status)) {
    return res.apiBadRequest('无效的友链状态');
  }

  const link = await friendLinkService.updateStatus(Number(id), status);

  if (!link) {
    return res.apiNotFound('友链不存在');
  }

  await cacheService.deletePattern('friend-links:public:*');

  return res.apiUpdated(link, '友链状态更新成功');
});

/**
 * 管理端：删除友链
 */
exports.deleteFriendLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || Number.isNaN(Number(id))) {
    return res.apiBadRequest('无效的友链ID');
  }

  const success = await friendLinkService.deleteFriendLink(Number(id));

  if (!success) {
    return res.apiNotFound('友链不存在');
  }

  await cacheService.deletePattern('friend-links:public:*');

  return res.apiDeleted('友链删除成功', { deletedId: id });
});
