const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const FriendLink = sequelize.define(
    'friend_link',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '友链名称',
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isUrl: true,
        },
        comment: '友链地址',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '友链描述',
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true,
        },
        comment: '头像地址',
      },
      themeColor: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'theme_color',
        comment: '主题色（用于前端展示）',
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '标签数组',
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'blocked'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '审核状态',
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_featured',
        comment: '是否推荐展示',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序值（越大越靠前）',
      },
      ownerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'owner_name',
        comment: '站长昵称',
      },
      ownerEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'owner_email',
        validate: {
          isEmail: true,
        },
        comment: '站长邮箱（仅博主可见）',
      },
      applyUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'apply_user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '申请用户ID（登录申请时记录）',
      },
      clickCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'click_count',
        comment: '点击次数',
      },
      lastClickAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_click_at',
        comment: '最后点击时间',
      },
    },
    {
      tableName: 'friend_links',
      timestamps: true,
      underscored: true,
      paranoid: false,
      indexes: [
        {
          fields: ['status', 'isFeatured', 'order', 'createdAt'],
        },
      ],
    }
  );

  return FriendLink;
};
