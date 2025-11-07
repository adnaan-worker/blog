const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const PostLike = sequelize.define(
    'PostLike',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键id',
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'post_id',
        comment: '文章ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: '创建时间',
      },
    },
    {
      tableName: 'post_likes',
      timestamps: false,
      comment: '文章点赞表',
      indexes: [
        {
          name: 'uk_post_user',
          fields: ['post_id', 'user_id'],
          unique: true,
        },
        {
          name: 'idx_post_id',
          fields: ['post_id'],
        },
        {
          name: 'idx_user_id',
          fields: ['user_id'],
        },
      ],
    }
  );

  return PostLike;
};
