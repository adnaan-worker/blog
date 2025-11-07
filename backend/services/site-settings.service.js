const { SiteSettings } = require('../models');
const { AppError } = require('../utils/response');

class SiteSettingsService {
  /**
   * 获取网站设置
   */
  async getSiteSettings() {
    const settings = await SiteSettings.findOne({
      order: [['id', 'DESC']],
    });

    if (!settings) {
      throw new AppError('网站设置不存在', 404);
    }

    return settings;
  }

  /**
   * 更新网站设置
   * @param {Number} userId - 用户ID
   * @param {Object} settingsData - 设置数据
   */
  async updateSiteSettings(userId, settingsData) {
    // 检查是否已存在设置
    let settings = await SiteSettings.findOne({
      where: { userId },
    });

    if (settings) {
      // 更新现有设置
      await settings.update(settingsData);
    } else {
      // 创建新设置
      settings = await SiteSettings.create({
        userId,
        ...settingsData,
      });
    }

    // 返回更新后的设置
    return settings;
  }
}

module.exports = new SiteSettingsService();
