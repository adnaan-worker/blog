const db = require('../models');

const GuestbookMessage = db.GuestbookMessage;
const User = db.User;

/**
 * 留言板服务层
 * 处理与 Guestbook 留言相关的业务逻辑
 */
class GuestbookService {
  /**
   * 创建留言
   * @param {Object} messageData
   * @returns {Promise<Object>}
   */
  async createMessage(messageData) {
    const message = await GuestbookMessage.create({
      status: 'pending',
      ...messageData,
    });

    return this.findById(message.id);
  }

  /**
   * 根据 ID 获取单条留言
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return GuestbookMessage.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'role'],
        },
      ],
    });
  }

  /**
   * 获取留言列表（支持管理端和前台）
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=10]
   * @param {string} [options.status]
   * @param {boolean} [options.forAdmin=false]
   * @returns {Promise<{data: any[]; pagination: any}>}
   */
  async listMessages(options = {}) {
    const { page = 1, limit = 10, status, forAdmin = false } = options;

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    const where = {};

    // 前台仅返回已通过留言；管理端可按状态筛选
    if (!forAdmin) {
      where.status = 'approved';
    } else if (status) {
      where.status = status;
    }

    const { count, rows } = await GuestbookMessage.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'role'],
        },
      ],
      order: [
        ['isPinned', 'DESC'],
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
   * 更新留言状态
   * @param {number} id
   * @param {string} status
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, status) {
    const message = await GuestbookMessage.findByPk(id);
    if (!message) {
      return null;
    }

    await message.update({ status });
    return this.findById(id);
  }

  /**
   * 更新留言回复内容
   * @param {number} id
   * @param {Object} options
   * @param {string|null} options.replyContent
   * @param {number|null} options.replyUserId
   * @returns {Promise<Object|null>}
   */
  async updateReply(id, options = {}) {
    const { replyContent, replyUserId } = options;

    const message = await GuestbookMessage.findByPk(id);
    if (!message) {
      return null;
    }

    const updateData = {
      replyContent: replyContent || null,
      replyUserId: replyUserId || null,
      replyAt: replyContent ? new Date() : null,
    };

    await message.update(updateData);
    return this.findById(id);
  }

  /**
   * 删除留言
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteMessage(id) {
    const deletedCount = await GuestbookMessage.destroy({ where: { id } });
    return deletedCount > 0;
  }
}

module.exports = new GuestbookService();
