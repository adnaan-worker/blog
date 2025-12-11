const db = require('../models');
const { Op } = require('sequelize');

const FriendLink = db.FriendLink;
const User = db.User;

/**
 * 友链服务层
 */
class FriendLinkService {
  /**
   * 获取公开友链列表（仅已通过的）
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=50]
   */
  async getPublicFriends(options = {}) {
    const { page = 1, limit = 50 } = options;

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 50;
    const offset = (pageInt - 1) * limitInt;

    const { count, rows } = await FriendLink.findAndCountAll({
      where: {
        status: 'approved',
      },
      attributes: [
        'id',
        'name',
        'url',
        'description',
        'avatar',
        'themeColor',
        'tags',
        'isFeatured',
        'order',
        'clickCount',
        'lastClickAt',
        'createdAt',
      ],
      order: [
        ['isFeatured', 'DESC'],
        ['order', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      offset,
      limit: limitInt,
    });

    const totalPages = Math.ceil(count / limitInt) || 1;

    return {
      data: rows,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: count,
        totalPages,
        hasNext: pageInt < totalPages,
        hasPrev: pageInt > 1,
      },
    };
  }

  /**
   * 提交友链申请
   * @param {Object} data
   */
  async applyFriendLink(data) {
    const link = await FriendLink.create({
      status: 'pending',
      isFeatured: false,
      order: data.order || 0,
      ...data,
    });

    return link;
  }

  /**
   * 管理端获取友链列表
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=10]
   * @param {string} [options.status]
   * @param {string} [options.search]
   */
  async getAdminFriends(options = {}) {
    const { page = 1, limit = 10, status, search } = options;

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.like]: keyword } },
        { url: { [Op.like]: keyword } },
        { ownerName: { [Op.like]: keyword } },
      ];
    }

    const { count, rows } = await FriendLink.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'avatar', 'email', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitInt,
    });

    const totalPages = Math.ceil(count / limitInt) || 1;

    return {
      data: rows,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: count,
        totalPages,
        hasNext: pageInt < totalPages,
        hasPrev: pageInt > 1,
      },
    };
  }

  /**
   * 根据 ID 获取友链
   * @param {number} id
   */
  async findById(id) {
    return FriendLink.findByPk(id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'avatar', 'email', 'role'],
        },
      ],
    });
  }

  /**
   * 更新友链
   * @param {number} id
   * @param {Object} data
   */
  async updateFriendLink(id, data) {
    const link = await FriendLink.findByPk(id);
    if (!link) {
      return null;
    }

    await link.update(data);
    return this.findById(id);
  }

  /**
   * 更新友链状态
   * @param {number} id
   * @param {string} status
   */
  async updateStatus(id, status) {
    const link = await FriendLink.findByPk(id);
    if (!link) {
      return null;
    }

    await link.update({ status });
    return this.findById(id);
  }

  /**
   * 删除友链
   * @param {number} id
   */
  async deleteFriendLink(id) {
    const deletedCount = await FriendLink.destroy({ where: { id } });
    return deletedCount > 0;
  }

  /**
   * 记录友链点击（可选）
   * @param {number} id
   */
  async recordClick(id) {
    const link = await FriendLink.findByPk(id);
    if (!link) {
      return null;
    }

    await link.increment('clickCount');
    await link.update({ lastClickAt: new Date() });

    return link;
  }
}

module.exports = new FriendLinkService();
