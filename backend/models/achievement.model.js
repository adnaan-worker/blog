const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const Achievement = sequelize.define(
    'Achievement',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '成就名称',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '成就描述',
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '成就图标',
      },
      category: {
        type: DataTypes.ENUM('content', 'social', 'engagement', 'milestone'),
        allowNull: false,
        defaultValue: 'milestone',
        comment: '成就分类',
      },
      criteria: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '解锁条件',
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '成就点数',
      },
      rarity: {
        type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
        allowNull: false,
        defaultValue: 'common',
        comment: '稀有度',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: '是否启用',
      },
    },
    {
      tableName: 'achievements',
      timestamps: true,
      comment: '成就定义表',
      indexes: [
        {
          fields: ['category'],
        },
        {
          fields: ['rarity'],
        },
        {
          fields: ['isActive'],
        },
      ],
    }
  );

  return Achievement;
};
