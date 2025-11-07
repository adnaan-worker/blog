const { Sequelize } = require('sequelize');
const environment = require('./environment');

// 获取数据库配置
const dbConfig = environment.get('database');

// 创建Sequelize实例
const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
  logging: dbConfig.logging,
  define: dbConfig.define,
});

module.exports = {
  sequelize,
  Sequelize,
  config: dbConfig,
};
