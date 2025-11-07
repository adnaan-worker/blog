const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Status = sequelize.define(
  'Status',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active_app: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '当前活动应用',
    },
    music_info: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '音乐播放信息',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '客户端时间戳',
    },
    computer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '计算机名称',
    },
    app_icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      default: 'default',
      comment: '应用图标标识',
    },
    app_type: {
      type: DataTypes.ENUM('app', 'music'),
      allowNull: false,
      default: 'app',
      comment: '应用类型',
    },
    app_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '应用名称',
    },
    display_info: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '显示信息',
    },
    client_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: '客户端IP地址',
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '用户代理',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否为当前活动状态',
    },
  },
  {
    tableName: 'status_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['computer_name'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['app_type'],
      },
    ],
  }
);

module.exports = Status;
