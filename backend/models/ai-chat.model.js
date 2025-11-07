const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const AIChat = sequelize.define(
    'ai_chat',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id', // 映射到数据库的下划线字段
        comment: '用户ID',
      },
      sessionId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'session_id', // 映射到数据库的下划线字段
        comment: '会话ID',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '用户消息',
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'AI回复',
      },
      type: {
        type: DataTypes.ENUM('chat', 'blog_assistant', 'writing_assistant'),
        defaultValue: 'chat',
        comment: '聊天类型',
      },
      context: {
        type: DataTypes.JSON,
        comment: '上下文信息',
      },
      tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '消耗的token数量',
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '响应时间(毫秒)',
      },
      status: {
        type: DataTypes.ENUM('success', 'failed', 'processing'),
        defaultValue: 'success',
        comment: '状态',
      },
      error: {
        type: DataTypes.TEXT,
        comment: '错误信息',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at', // 映射到数据库的下划线字段
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at', // 映射到数据库的下划线字段
      },
    },
    {
      tableName: 'ai_chats', // 明确指定表名
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return AIChat;
};
