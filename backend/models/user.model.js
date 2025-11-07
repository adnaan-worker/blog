const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 50],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        field: 'email',
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'full_name',
      },
      avatar: {
        type: DataTypes.STRING(255),
        defaultValue: 'default-avatar.png',
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active',
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login',
      },
    },
    {
      tableName: 'users', // 明确指定表名
      timestamps: true,
      paranoid: false, // 禁用软删除
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          unique: true,
          fields: ['username'],
        },
      ],
    }
  );

  return User;
};
