const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const Tag = sequelize.define(
    'tag',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      slug: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'URL 标识（可选）',
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '标签颜色（如 #3B82F6）',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'tags', // 明确指定表名
      timestamps: true,
      paranoid: false, // 禁用软删除
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
        {
          unique: false,
          fields: ['slug'],
        },
      ],
    }
  );

  return Tag;
};
