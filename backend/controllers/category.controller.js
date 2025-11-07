const categoryService = require('../services/category.service');
const cacheService = require('../services/cache.service');
const { asyncHandler, createPagination } = require('../utils/response');

/**
 * 分类控制器
 * 处理分类相关的API请求
 */
class CategoryController {
  /**
   * 获取所有分类
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, includePostCount } = req.query;

    // 构建缓存键
    const cacheKey = `categories:list:${page}:${limit}:${search || 'all'}:${
      includePostCount || 'false'
    }`;

    // 尝试从缓存获取
    const result = await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await categoryService.findAll({
          page: parseInt(page),
          limit: parseInt(limit),
          search,
          includePostCount: includePostCount === 'true',
        });
      },
      600
    ); // 缓存10分钟

    return res.apiPaginated(result.data, result.pagination, '获取分类列表成功');
  });

  /**
   * 根据ID获取分类详情
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cacheKey = `category:${id}`;
    const category = await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await categoryService.findById(id);
      },
      300
    );

    if (!category) {
      return res.apiNotFound('分类不存在');
    }

    res.apiItem(category, '获取分类详情成功');
  });

  /**
   * 创建新分类（管理员）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  async createCategory(req, res, next) {
    try {
      const { name, description } = req.body;

      // 验证必填字段
      if (!name) {
        return res.apiValidationError([{ field: 'name', message: '分类名称不能为空' }]);
      }

      // 检查分类名称是否已存在
      const existingCategory = await categoryService.findByName(name);
      if (existingCategory) {
        return res.apiConflict('分类名称已存在');
      }

      const category = await categoryService.create({ name, description });

      // 清除相关缓存
      await cacheService.deletePattern('categories:*');

      res.apiCreated(category, '分类创建成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 更新分类（管理员）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // 如果更新名称，检查是否与其他分类重复
      if (name) {
        const existingCategory = await categoryService.findByName(name);
        if (existingCategory && existingCategory.id !== parseInt(id)) {
          return res.apiConflict('分类名称已存在');
        }
      }

      const category = await categoryService.update(id, { name, description });

      // 清除相关缓存
      await cacheService.deletePattern('categories:*');
      await cacheService.delete(`category:${id}`);

      res.apiUpdated(category, '分类更新成功');
    } catch (err) {
      if (err.message === '分类不存在') {
        return res.apiNotFound('分类不存在');
      }
      next(err);
    }
  }

  /**
   * 删除分类（管理员）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      await categoryService.delete(id);

      // 清除相关缓存
      await cacheService.deletePattern('categories:*');
      await cacheService.delete(`category:${id}`);

      res.apiDeleted('分类删除成功');
    } catch (err) {
      if (err.message === '分类不存在') {
        return res.apiNotFound('分类不存在');
      }
      if (err.message === '该分类下还有文章，无法删除') {
        return res.apiValidationError([
          { field: 'category', message: '该分类下还有文章，无法删除' },
        ]);
      }
      next(err);
    }
  }

  /**
   * 获取分类统计信息（管理员）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  async getCategoryStats(req, res, next) {
    try {
      const cacheKey = 'categories:stats';
      const stats = await cacheService.getOrSet(
        cacheKey,
        async () => {
          return await categoryService.getStats();
        },
        300
      );

      res.apiItem(stats, '获取分类统计成功');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
