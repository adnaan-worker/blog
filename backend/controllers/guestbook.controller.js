const guestbookService = require('@/services/guestbook.service');
const cacheService = require('@/services/cache.service');
const { asyncHandler } = require('@/utils/response');
const { collectVisitorInfo } = require('@/utils/visitor-info');

/**
 * 获取前台留言列表
 */
exports.getPublicMessages = asyncHandler(async (req, res) => {
  const pagination = req.pagination || {};
  const page = pagination.page || parseInt(req.query.page || '1', 10) || 1;
  const limit = pagination.limit || parseInt(req.query.limit || '10', 10) || 10;

  const cacheKey = `guestbook:messages:${page}:${limit}`;

  const result = await cacheService.getOrSet(
    cacheKey,
    async () => {
      return guestbookService.listMessages({ page, limit, forAdmin: false });
    },
    300
  );

  return res.apiPaginated(result.data, result.pagination, '获取留言列表成功');
});

/**
 * 创建留言（支持登录用户和访客）
 */
exports.createMessage = asyncHandler(async (req, res) => {
  const { content, guestName, guestEmail, guestWebsite } = req.body;

  if (!content || !content.trim()) {
    return res.apiBadRequest('留言内容不能为空');
  }

  const isLoggedIn = req.user && req.user.id;

  const messageData = {
    content: content.trim(),
  };

  if (isLoggedIn) {
    // 登录用户留言：自动记录 userId，视为非访客
    messageData.userId = req.user.id;
    messageData.isGuest = false;
    messageData.status = 'approved';
  } else {
    // 访客留言
    if (!guestName || !guestName.trim()) {
      return res.apiBadRequest('访客留言需要提供昵称');
    }

    messageData.userId = null;
    messageData.isGuest = true;
    messageData.guestName = guestName.trim();

    if (guestEmail && guestEmail.trim()) {
      const email = guestEmail.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.apiBadRequest('邮箱格式不正确');
      }
      messageData.guestEmail = email.toLowerCase();
    }

    if (guestWebsite && guestWebsite.trim()) {
      messageData.guestWebsite = guestWebsite.trim();
    }

    // 访客留言默认待审核
    messageData.status = messageData.status || 'pending';
  }

  // 收集访客信息（IP、UA、地理位置等），失败不影响主流程
  try {
    const visitorInfo = await collectVisitorInfo(req);
    messageData.ip = visitorInfo.ip;
    messageData.userAgent = visitorInfo.userAgent;
    messageData.location = visitorInfo.location;
    messageData.browser = visitorInfo.browser;
    messageData.os = visitorInfo.os;
    messageData.device = visitorInfo.device;
  } catch (error) {
    // 仅记录错误日志，不中断创建
    // eslint-disable-next-line no-console
    console.error('收集访客信息失败:', error);
  }

  const message = await guestbookService.createMessage(messageData);

  // 清理相关缓存
  await cacheService.deletePattern('guestbook:messages:*');

  return res.apiCreated(message, '留言创建成功');
});

/**
 * 管理端：获取留言列表
 */
exports.getAdminMessages = asyncHandler(async (req, res) => {
  const pagination = req.pagination || {};
  const page = pagination.page || parseInt(req.query.page || '1', 10) || 1;
  const limit = pagination.limit || parseInt(req.query.limit || '10', 10) || 10;

  const status = req.filters?.status;

  const result = await guestbookService.listMessages({
    page,
    limit,
    status,
    forAdmin: true,
  });

  return res.apiPaginated(result.data, result.pagination, '获取留言列表成功');
});

/**
 * 更新留言状态
 */
exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || Number.isNaN(Number(id))) {
    return res.apiBadRequest('无效的留言ID');
  }

  const allowedStatus = ['approved', 'pending', 'spam'];
  if (!allowedStatus.includes(status)) {
    return res.apiBadRequest('无效的留言状态');
  }

  const message = await guestbookService.updateStatus(Number(id), status);

  if (!message) {
    return res.apiNotFound('留言不存在');
  }

  await cacheService.deletePattern('guestbook:messages:*');

  return res.apiUpdated(message, '留言状态更新成功');
});

/**
 * 更新留言回复内容
 */
exports.updateMessageReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyContent } = req.body;

  if (!id || Number.isNaN(Number(id))) {
    return res.apiBadRequest('无效的留言ID');
  }

  if (typeof replyContent !== 'string') {
    return res.apiBadRequest('回复内容不能为空');
  }

  const replyUserId = req.user?.id || null;

  const message = await guestbookService.updateReply(Number(id), {
    replyContent: replyContent.trim(),
    replyUserId,
  });

  if (!message) {
    return res.apiNotFound('留言不存在');
  }

  await cacheService.deletePattern('guestbook:messages:*');

  return res.apiUpdated(message, '留言回复更新成功');
});

/**
 * 删除留言
 */
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || Number.isNaN(Number(id))) {
    return res.apiBadRequest('无效的留言ID');
  }

  const success = await guestbookService.deleteMessage(Number(id));

  if (!success) {
    return res.apiNotFound('留言不存在');
  }

  await cacheService.deletePattern('guestbook:messages:*');

  return res.apiDeleted('留言删除成功', { deletedId: id });
});
