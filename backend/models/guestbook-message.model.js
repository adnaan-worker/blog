const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const GuestbookMessage = sequelize.define(
    'guestbook_message',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        comment: '留言内容',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '登录用户ID（可选）',
      },
      guestName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'guest_name',
        comment: '访客昵称（未登录用户）',
      },
      guestEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'guest_email',
        validate: {
          isEmail: true,
        },
        comment: '访客邮箱（仅博主可见）',
      },
      guestWebsite: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'guest_website',
        comment: '访客网站',
      },
      isGuest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_guest',
        comment: '是否为访客留言',
      },
      status: {
        type: DataTypes.ENUM('approved', 'pending', 'spam'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '留言状态',
      },
      isPinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_pinned',
        comment: '是否置顶',
      },
      replyContent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'reply_content',
        comment: '博主回复内容',
      },
      replyUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reply_user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '回复人用户ID（通常为博主）',
      },
      replyAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reply_at',
        comment: '回复时间',
      },
      ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip',
        comment: 'IP地址',
      },
      userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'user_agent',
        comment: '浏览器User-Agent信息',
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'location',
        comment: '地理位置（国家 · 省市）',
      },
      browser: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'browser',
        comment: '浏览器类型和版本',
      },
      os: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'os',
        comment: '操作系统类型和版本',
      },
      device: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'device',
        comment: '设备类型（Desktop、Mobile、Tablet）',
      },
    },
    {
      tableName: 'guestbook_messages',
      timestamps: true,
      underscored: true,
      paranoid: false,
      indexes: [
        {
          fields: ['status'],
        },
        {
          fields: ['userId', 'createdAt'],
        },
        {
          fields: ['isPinned', 'createdAt'],
        },
      ],
    }
  );

  return GuestbookMessage;
};
