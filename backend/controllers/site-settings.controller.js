const siteSettingsService = require('@/services/site-settings.service');
const { asyncHandler } = require('@/utils/response');

/**
 * 获取网站设置（公开）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getSiteSettings = asyncHandler(async (req, res) => {
  const result = await siteSettingsService.getSiteSettings();
  return res.apiSuccess(result, '获取网站设置成功');
});

/**
 * 更新网站设置（仅管理员）
 * 注意：此方法需要配合 authMiddleware.isAdmin 中间件使用
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateSiteSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const settingsData = req.body;

  // 验证至少有一个字段需要更新
  if (!settingsData || Object.keys(settingsData).length === 0) {
    return res.apiValidationError(
      [{ field: 'settings', message: '至少需要提供一个要更新的字段' }],
      '请提供要更新的信息'
    );
  }

  const result = await siteSettingsService.updateSiteSettings(userId, settingsData);
  return res.apiSuccess(result, '网站设置更新成功');
});
