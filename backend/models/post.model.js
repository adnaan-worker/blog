const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const Post = sequelize.define(
    'post',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 200],
        },
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      coverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'cover_image',
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 0: 草稿, 1: 已发布, 2: 已归档
        validate: {
          isIn: [[0, 1, 2]],
        },
      },
      auditStatus: {
        type: DataTypes.TINYINT,
        defaultValue: 0, // 0: 待审核, 1: 审核通过, 2: 审核驳回
        validate: {
          isIn: [[0, 1, 2]],
        },
        field: 'audit_status',
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'view_count',
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'like_count',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'user_id',
      },
      typeId: {
        type: DataTypes.BIGINT,
        allowNull: false, // 必填项，与数据库定义一致
        references: {
          model: 'categroup',
          key: 'id',
        },
        field: 'type_id',
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at',
      },
      lastReadAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_read_at',
      },
    },
    {
      tableName: 'posts', // 明确指定表名
      timestamps: true,
      paranoid: false, // 禁用软删除
      underscored: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['audit_status'],
        },
        {
          fields: ['status', 'audit_status'],
        },
        {
          fields: ['type_id'],
        },
        {
          fields: ['published_at'],
        },
      ],
      // 添加虚拟字段
      getterMethods: {
        // 获取文章类型名称
        categoryName() {
          return this.category ? this.category.name : null;
        },
        // 获取标签名称列表
        tagNames() {
          return this.tags ? this.tags.map(tag => tag.name) : [];
        },
        // 获取标签ID列表
        tagIds() {
          return this.tags ? this.tags.map(tag => tag.id) : [];
        },
      },
    }
  );

  return Post;
};
