const db = require('../models');
const Tag = db.Tag;
const Post = db.Post;
const { Op } = require('sequelize');

/**
 * 标签服务层
 * 处理与标签相关的业务逻辑
 */
class TagService {
  /**
   * 创建新标签
   * @param {Object} tagData - 标签数据
   * @returns {Promise<Object>} 创建的标签对象
   */
  async create(tagData) {
    return await Tag.create(tagData);
  }

  /**
   * 根据ID查找标签
   * @param {number} id - 标签ID
   * @returns {Promise<Object>} 标签对象
   */
  async findById(id) {
    return await Tag.findByPk(id);
  }

  /**
   * 根据slug查找标签
   * @param {string} slug - 标签slug
   * @returns {Promise<Object>} 标签对象
   */
  async findBySlug(slug) {
    return await Tag.findOne({ where: { slug } });
  }

  /**
   * 获取所有标签列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 标签列表和分页信息
   */
  async findAll(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const query = {};

    // 搜索功能
    if (search) {
      query.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const result = await Tag.findAndCountAll({
      ...query,
      order: [['name', 'ASC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    return {
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
        hasNext: page < Math.ceil(result.count / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 更新标签
   * @param {number} id - 标签ID
   * @param {Object} tagData - 更新的标签数据
   * @returns {Promise<Object>} 更新结果
   */
  async update(id, tagData) {
    await Tag.update(tagData, {
      where: { id },
    });

    return this.findById(id);
  }

  /**
   * 删除标签（软删除）
   * @param {number} id - 标签ID
   * @returns {Promise<number>} 删除的记录数
   */
  async delete(id) {
    return await Tag.destroy({
      where: { id },
    });
  }

  /**
   * 获取文章的标签
   * @param {number} postId - 文章ID
   * @returns {Promise<Array>} 标签列表
   */
  async getTagsByPostId(postId) {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
        },
      ],
    });

    return post ? post.tags : [];
  }

  /**
   * 获取热门标签
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 热门标签列表
   */
  async getPopularTags(limit = 10) {
    // 通过关联表查询标签使用频率
    const [results] = await db.sequelize.query(`
      SELECT tagId, COUNT(tagId) as postCount 
      FROM Post_Tags 
      GROUP BY tagId 
      ORDER BY postCount DESC 
      LIMIT ${limit}
    `);

    // 如果没有结果，返回空数组
    if (!results || results.length === 0) {
      return [];
    }

    // 获取标签ID列表
    const tagIds = results.map(result => result.tagId);

    // 查询标签详情
    const tags = await Tag.findAll({
      where: { id: tagIds },
      order: [[db.sequelize.literal(`FIELD(id, ${tagIds.join(',')})`)]],
    });

    // 添加文章计数
    return tags.map((tag, index) => {
      tag.dataValues.postCount = results[index].postCount;
      return tag;
    });
  }
}

module.exports = new TagService();
