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
        field: 'user_id',
        comment: '用户ID',
      },
      sessionId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'session_id',
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
      type: {
        type: DataTypes.ENUM('chat', 'blog_assistant', 'writing_assistant'),
        defaultValue: 'chat',
        comment: '聊天类型',
      },
      metadata: {
        type: DataTypes.JSON,
        comment: '消息元数据（tokens、duration等）',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      tableName: 'ai_chats',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['session_id'] },
        { fields: ['session_id', 'created_at'] }, // 用于按时间排序获取历史
      ],
    }
  );

  return AIChat;
};
