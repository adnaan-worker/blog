const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const UserActivity = sequelize.define(
    'UserActivity',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id', // 使用下划线命名
        references: {
          model: 'users',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM(
          // 内容创建类
          'post_created',
          'post_updated',
          'post_deleted',
          'note_created',
          'note_updated',
          'note_deleted',
          'comment_created',
          'comment_updated',
          'comment_deleted',
          // 互动类
          'post_liked',
          'post_unliked',
          'note_liked',
          'note_unliked',
          'post_bookmarked',
          'post_unbookmarked',
          // 收到反馈类
          'like_received',
          'comment_received',
          'bookmark_received',
          // 成就类
          'achievement_unlocked',
          'level_up',
          'milestone_reached',
          // 审核类
          'post_approved',
          'post_rejected',
          'comment_approved',
          'comment_rejected',
          // 系统通知类
          'system_notice',
          'account_warning',
          'welcome',
          // 热门趋势类
          'post_trending',
          'post_featured'
        ),
        allowNull: false,
        comment: '活动类型',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '活动标题',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动描述',
      },
      link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '相关链接',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '活动元数据',
        defaultValue: {},
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_read', // 使用下划线命名
        defaultValue: false,
        comment: '是否已读',
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '优先级',
      },
    },
    {
      tableName: 'user_activities',
      timestamps: true,
      comment: '用户活动表',
      indexes: [
        {
          fields: ['userId', 'createdAt'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['isRead'],
        },
        {
          fields: ['priority'],
        },
      ],
    }
  );

  // 定义关联关系
  UserActivity.associate = function (models) {
    UserActivity.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return UserActivity;
};
