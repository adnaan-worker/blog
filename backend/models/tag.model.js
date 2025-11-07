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
      ],
    }
  );

  return Tag;
};
