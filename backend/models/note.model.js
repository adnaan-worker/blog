const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const Note = sequelize.define(
    'Note',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键id',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '手记标题（可选）',
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        comment: '手记内容',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
      },
      mood: {
        type: DataTypes.ENUM(
          '开心',
          '平静',
          '思考',
          '感慨',
          '兴奋',
          '忧郁',
          '愤怒',
          '恐惧',
          '惊讶',
          '厌恶'
        ),
        allowNull: true,
        comment: '心情',
      },
      weather: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '天气',
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '地点',
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '标签数组',
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_private',
        comment: '是否私密',
      },
      readingTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reading_time',
        comment: '预估阅读时间（分钟）',
      },
      viewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'view_count',
        comment: '查看次数',
      },
      likeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'like_count',
        comment: '点赞次数',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: '更新时间',
      },
      lastReadAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_read_at',
        comment: '最后阅读时间',
      },
    },
    {
      tableName: 'notes',
      timestamps: true,
      paranoid: false, // 禁用软删除
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      comment: '手记表',
      indexes: [
        {
          name: 'idx_user_id',
          fields: ['user_id'],
        },
        {
          name: 'idx_created_at',
          fields: ['created_at'],
        },
        {
          name: 'idx_is_private',
          fields: ['is_private'],
        },
        {
          name: 'idx_mood',
          fields: ['mood'],
        },
      ],
    }
  );

  return Note;
};
