const { Project, User } = require('../models');
const { AppError } = require('@/utils/response');
const { Op } = require('sequelize');

/**
 * 项目服务层
 */
class ProjectService {
  /**
   * 获取项目列表（支持分页和筛选）
   */
  async getProjects(options = {}) {
    const {
      page = 1,
      limit = 12, // 统一使用 limit 参数，与其他服务保持一致
      status,
      isFeatured,
      isOpenSource,
      keyword,
      language,
      visibility,
      includePrivate,
    } = options;

    const offset = (page - 1) * limit;
    const limitInt = parseInt(limit);

    // 构建查询条件
    const where = {};

    const includePrivateFlag = includePrivate === true || includePrivate === 'true';

    if (!includePrivateFlag) {
      // 默认仅返回公开项目（前台列表、未登录或非管理员用户）
      where.visibility = visibility || 'public';
    } else if (visibility && visibility !== '') {
      // 管理端可按需筛选可见性
      where.visibility = visibility;
    }

    if (status && status !== '') {
      where.status = status;
    }

    if (isFeatured !== undefined && isFeatured !== '') {
      where.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (isOpenSource !== undefined && isOpenSource !== '') {
      where.isOpenSource = isOpenSource === 'true' || isOpenSource === true;
    }

    if (language && language !== '') {
      where.language = language;
    }

    if (keyword && keyword.trim() !== '') {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatar'],
        },
      ],
      order: [
        ['displayOrder', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limitInt),
      },
    };
  }

  /**
   * 根据ID或slug获取项目详情
   */
  async getProjectByIdOrSlug(identifier) {
    const where = isNaN(identifier) ? { slug: identifier } : { id: identifier };

    const project = await Project.findOne({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatar'],
        },
      ],
    });

    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 增加浏览量
    await project.increment('viewCount');

    return project;
  }

  /**
   * 创建项目（仅管理员）
   */
  async createProject(userId, projectData) {
    // 检查slug是否已存在
    const existingProject = await Project.findOne({
      where: { slug: projectData.slug },
    });

    if (existingProject) {
      throw new AppError('项目标识(slug)已存在', 400);
    }

    const project = await Project.create({
      ...projectData,
      authorId: userId,
    });

    return project;
  }

  /**
   * 更新项目（仅管理员）
   */
  async updateProject(id, projectData) {
    const project = await Project.findByPk(id);

    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    // 如果更新slug，检查是否已存在
    if (projectData.slug && projectData.slug !== project.slug) {
      const existingProject = await Project.findOne({
        where: { slug: projectData.slug },
      });

      if (existingProject) {
        throw new AppError('项目标识(slug)已存在', 400);
      }
    }

    await project.update(projectData);

    return project;
  }

  /**
   * 删除项目（仅管理员）
   */
  async deleteProject(id) {
    const project = await Project.findByPk(id);

    if (!project) {
      throw new AppError('项目不存在', 404);
    }

    await project.destroy();

    return { message: '项目删除成功' };
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats() {
    const total = await Project.count();
    const active = await Project.count({ where: { status: 'active' } });
    const developing = await Project.count({ where: { status: 'developing' } });
    const featured = await Project.count({ where: { isFeatured: true } });

    // 统计语言分布
    const languages = await Project.findAll({
      attributes: ['language', [Project.sequelize.fn('COUNT', '*'), 'count']],
      where: {
        language: { [Op.not]: null },
      },
      group: ['language'],
      raw: true,
    });

    return {
      total,
      active,
      developing,
      featured,
      languages,
    };
  }

  /**
   * 获取精选项目（支持分页）
   */
  async getFeaturedProjects(options = {}) {
    const { page = 1, limit = 6 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where: {
        isFeatured: true,
        visibility: 'public',
        status: 'active',
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatar'],
        },
      ],
      order: [
        ['displayOrder', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
      offset,
    });

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

module.exports = new ProjectService();
