const { DataTypes } = require('sequelize');

/**
 * 项目模型
 */
module.exports = sequelize => {
  const Project = sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '项目ID',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '项目标题',
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        comment: 'URL友好标识',
      },
      description: {
        type: DataTypes.TEXT,
        comment: '项目简介',
      },
      content: {
        type: DataTypes.TEXT('long'),
        comment: '项目详细介绍(支持Markdown)',
      },
      coverImage: {
        type: DataTypes.STRING(500),
        field: 'cover_image',
        comment: '项目封面图',
      },
      icon: {
        type: DataTypes.STRING(500),
        comment: '项目图标',
      },
      status: {
        type: DataTypes.ENUM('active', 'archived', 'developing', 'paused'),
        allowNull: false,
        defaultValue: 'developing',
        comment: '项目状态',
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
        comment: '可见性',
      },
      // 项目信息
      language: {
        type: DataTypes.STRING(100),
        comment: '主要编程语言',
      },
      languageColor: {
        type: DataTypes.STRING(20),
        field: 'language_color',
        comment: '语言颜色(十六进制)',
      },
      tags: {
        type: DataTypes.JSON,
        comment: '项目标签数组',
        get() {
          const value = this.getDataValue('tags');
          return value || [];
        },
      },
      techStack: {
        type: DataTypes.JSON,
        field: 'tech_stack',
        comment: '技术栈数组',
        get() {
          const value = this.getDataValue('techStack');
          return value || [];
        },
      },
      features: {
        type: DataTypes.JSON,
        comment: '项目特性数组',
        get() {
          const value = this.getDataValue('features');
          return value || [];
        },
      },
      // 仓库信息
      githubUrl: {
        type: DataTypes.STRING(500),
        field: 'github_url',
        comment: 'GitHub仓库地址',
      },
      giteeUrl: {
        type: DataTypes.STRING(500),
        field: 'gitee_url',
        comment: 'Gitee仓库地址',
      },
      demoUrl: {
        type: DataTypes.STRING(500),
        field: 'demo_url',
        comment: '在线演示地址',
      },
      docsUrl: {
        type: DataTypes.STRING(500),
        field: 'docs_url',
        comment: '文档地址',
      },
      npmPackage: {
        type: DataTypes.STRING(200),
        field: 'npm_package',
        comment: 'NPM包名',
      },
      // 统计信息
      stars: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Star数量',
      },
      forks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Fork数量',
      },
      watchers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Watch数量',
      },
      issues: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '问题数量',
      },
      downloads: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '下载量',
      },
      // 展示控制
      isFeatured: {
        type: DataTypes.BOOLEAN,
        field: 'is_featured',
        defaultValue: false,
        comment: '是否精选展示',
      },
      isOpenSource: {
        type: DataTypes.BOOLEAN,
        field: 'is_open_source',
        defaultValue: true,
        comment: '是否开源',
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        field: 'display_order',
        defaultValue: 0,
        comment: '显示排序',
      },
      // 元数据
      authorId: {
        type: DataTypes.INTEGER,
        field: 'author_id',
        allowNull: false,
        comment: '创建者ID',
      },
      viewCount: {
        type: DataTypes.INTEGER,
        field: 'view_count',
        defaultValue: 0,
        comment: '浏览次数',
      },
      startedAt: {
        type: DataTypes.DATEONLY,
        field: 'started_at',
        comment: '项目开始日期',
      },
      lastUpdatedAt: {
        type: DataTypes.DATE,
        field: 'last_updated_at',
        comment: '最后更新时间',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间',
      },
    },
    {
      tableName: 'projects',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['status'] },
        { fields: ['visibility'] },
        { fields: ['is_featured'] },
        { fields: [{ name: 'display_order', order: 'DESC' }] },
        { fields: [{ name: 'created_at', order: 'DESC' }] },
        { fields: ['author_id'] },
      ],
    }
  );

  /**
   * 关联关系
   */
  Project.associate = models => {
    // 项目属于用户(作者)
    Project.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author',
    });
  };

  return Project;
};
