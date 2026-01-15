const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const OAuthAccount = sequelize.define(
    'oauth_account',
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
      provider: {
        type: DataTypes.ENUM('github', 'google', 'gitee'),
        allowNull: false,
        comment: '第三方平台',
      },
      providerId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'provider_id',
        comment: '第三方用户ID',
      },
      accessToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'access_token',
        comment: '访问令牌',
      },
      refreshToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'refresh_token',
        comment: '刷新令牌',
      },
      profile: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '第三方用户原始信息',
      },
    },
    {
      tableName: 'oauth_accounts',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['provider', 'provider_id'],
          name: 'uk_provider_providerId',
        },
        {
          fields: ['user_id'],
          name: 'idx_userId',
        },
      ],
    }
  );

  return OAuthAccount;
};
