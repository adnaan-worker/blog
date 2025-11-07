const db = require('../models');
const Categroup = db.Categroup;
const Post = db.Post;

/**
 * 分类服务层
 * 处理与分类相关的业务逻辑
 */
class CategoryService {
  /**
   * 创建新分类
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<Object>} 创建的分类对象
   */
  async create(categoryData) {
    return await Categroup.create(categoryData);
  }

  /**
   * 根据ID查找分类
   * @param {number} id - 分类ID
   * @returns {Promise<Object>} 分类对象
   */
  async findById(id) {
    return await Categroup.findByPk(id, {
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'title', 'status'],
          where: { status: 'published' },
          required: false,
        },
      ],
    });
  }

  /**
   * 根据名称查找分类
   * @param {string} name - 分类名称
   * @returns {Promise<Object>} 分类对象
   */
  async findByName(name) {
    return await Categroup.findOne({ where: { name } });
  }

  /**
   * 获取所有分类列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 分类列表和分页信息
   */
  async findAll(options = {}) {
    const { page = 1, limit = 10, search, includePostCount = false } = options;

    const where = {};

    // 搜索条件
    if (search) {
      where.name = {
        [db.Sequelize.Op.like]: `%${search}%`,
      };
    }

    const queryOptions = {
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    };

    // 是否包含文章数量统计
    if (includePostCount) {
      queryOptions.include = [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          required: false,
        },
      ];
      queryOptions.attributes = {
        include: [[db.sequelize.fn('COUNT', db.sequelize.col('posts.id')), 'postCount']],
      };
      queryOptions.group = ['Categroup.id'];
    }

    const result = await Categroup.findAndCountAll(queryOptions);

    const totalCount = includePostCount ? result.count.length : result.count;

    return {
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 更新分类
   * @param {number} id - 分类ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的分类对象
   */
  async update(id, updateData) {
    const category = await Categroup.findByPk(id);
    if (!category) {
      throw new Error('分类不存在');
    }

    return await category.update(updateData);
  }

  /**
   * 删除分类（软删除）
   * @param {number} id - 分类ID
   * @returns {Promise<boolean>} 删除结果
   */
  async delete(id) {
    const category = await Categroup.findByPk(id);
    if (!category) {
      throw new Error('分类不存在');
    }

    // 检查是否有文章使用此分类
    const postCount = await Post.count({ where: { typeId: id } });
    if (postCount > 0) {
      throw new Error('该分类下还有文章，无法删除');
    }

    await category.destroy();
    return true;
  }

  /**
   * 获取分类统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStats() {
    const totalCategories = await Categroup.count();
    const categoriesWithPosts = await Categroup.count({
      include: [
        {
          model: Post,
          as: 'posts',
          where: { status: 'published' },
          required: true,
        },
      ],
    });

    return {
      total: totalCategories,
      withPosts: categoriesWithPosts,
      empty: totalCategories - categoriesWithPosts,
    };
  }
}

module.exports = new CategoryService();
