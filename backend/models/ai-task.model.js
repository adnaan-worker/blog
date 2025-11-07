const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const AITask = sequelize.define(
    'ai_task',
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
      taskId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'task_id', // 映射到数据库的下划线字段
        comment: '任务ID',
      },
      type: {
        type: DataTypes.ENUM('generate_content', 'batch_generate', 'analyze', 'writing_assistant'),
        allowNull: false,
        comment: '任务类型',
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
        comment: '任务状态',
      },
      params: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '任务参数',
      },
      result: {
        type: DataTypes.JSON,
        comment: '任务结果',
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '进度百分比',
      },
      error: {
        type: DataTypes.TEXT,
        comment: '错误信息',
      },
      startedAt: {
        type: DataTypes.DATE,
        field: 'started_at', // 映射到数据库的下划线字段
        comment: '开始时间',
      },
      completedAt: {
        type: DataTypes.DATE,
        field: 'completed_at', // 映射到数据库的下划线字段
        comment: '完成时间',
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
      tableName: 'ai_tasks', // 明确指定表名
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return AITask;
};
