const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const NoteLike = sequelize.define(
    'NoteLike',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键id',
      },
      noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'note_id',
        comment: '手记ID',
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
      tableName: 'note_likes',
      timestamps: false,
      comment: '手记点赞表',
      indexes: [
        {
          name: 'uk_note_user',
          fields: ['note_id', 'user_id'],
          unique: true,
        },
        {
          name: 'idx_note_id',
          fields: ['note_id'],
        },
        {
          name: 'idx_user_id',
          fields: ['user_id'],
        },
      ],
    }
  );

  return NoteLike;
};
