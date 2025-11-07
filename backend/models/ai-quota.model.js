const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const AIQuota = sequelize.define(
    'ai_quota',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id', // 映射到数据库的下划线字段
        comment: '用户ID',
      },
      dailyChatLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        field: 'daily_chat_limit', // 映射到数据库的下划线字段
        comment: '每日聊天次数限制',
      },
      dailyChatUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'daily_chat_used', // 映射到数据库的下划线字段
        comment: '每日聊天已使用次数',
      },
      dailyGenerateLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        field: 'daily_generate_limit', // 映射到数据库的下划线字段
        comment: '每日内容生成次数限制',
      },
      dailyGenerateUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'daily_generate_used', // 映射到数据库的下划线字段
        comment: '每日内容生成已使用次数',
      },
      monthlyTokenLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 100000,
        field: 'monthly_token_limit', // 映射到数据库的下划线字段
        comment: '每月token使用限制',
      },
      monthlyTokenUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'monthly_token_used', // 映射到数据库的下划线字段
        comment: '每月token已使用量',
      },
      lastResetDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_reset_date', // 映射到数据库的下划线字段
        comment: '上次重置日期',
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
      tableName: 'ai_quotas', // 明确指定表名
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return AIQuota;
};
