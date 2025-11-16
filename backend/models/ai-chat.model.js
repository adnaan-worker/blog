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
      role: {
        type: DataTypes.ENUM('human', 'ai', 'system'),
        allowNull: false,
        comment: '消息角色：human(用户), ai(AI回复), system(系统提示)',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '消息内容',
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
