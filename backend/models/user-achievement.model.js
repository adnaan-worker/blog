const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const UserAchievement = sequelize.define(
    'UserAchievement',
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
        references: {
          model: 'users',
          key: 'id',
        },
      },
      achievementId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'achievement_id',
        comment: '成就ID',
        references: {
          model: 'achievements',
          key: 'id',
        },
      },
      unlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已解锁',
      },
      unlockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'unlocked_at',
        comment: '解锁时间',
      },
      progress: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '进度信息',
        defaultValue: {},
      },
    },
    {
      tableName: 'user_achievements',
      timestamps: true,
      comment: '用户成就表',
      indexes: [
        {
          unique: true,
          name: 'uk_user_achievement',
          fields: ['userId', 'achievementId'],
        },
        {
          fields: ['userId', 'unlocked'],
        },
        {
          fields: ['achievementId'],
        },
      ],
    }
  );

  return UserAchievement;
};
