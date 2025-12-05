const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const userService = require('./user.service');
const redisManager = require('../utils/redis');
const environment = require('../config/environment');

// 获取JWT配置
const config = environment.get();
const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;

/**
 * 认证服务层
 * 处理用户认证、令牌管理等功能
 */
class AuthService {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 包含用户信息和令牌的对象
   */
  async login(username, password) {
    // 查找用户
    const user = await userService.findByUsername(username);

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = userService.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new Error('账户已被禁用');
    }

    // 更新最后登录时间
    await userService.updateLastLogin(user.id);

    // 生成令牌
    const token = this.generateToken(user);

    // 存储令牌到Redis
    await this.storeToken(user.id, token);

    // 返回用户信息和令牌
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 包含用户信息和令牌的对象
   */
  async register(userData) {
    // 检查用户名是否已存在
    const existingUsername = await userService.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('用户名已被使用');
    }

    // 检查邮箱是否已存在
    const existingEmail = await userService.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('邮箱已被使用');
    }

    // 创建新用户
    const user = await userService.createUser(userData);

    // 生成令牌
    const token = this.generateToken(user);

    // 存储令牌到Redis
    await this.storeToken(user.id, token);

    // 返回用户信息和令牌
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * 用户登出
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 登出结果
   */
  async logout(userId) {
    try {
      // 从Redis中删除令牌
      await redisManager.del(`user:${userId}:token`);
      return true;
    } catch (error) {
      console.error('删除令牌失败:', error.message);
      return true; // 即使失败也返回成功，不影响用户体验
    }
  }

  /**
   * 验证令牌
   * @param {string} token - JWT令牌
   * @returns {Promise<Object>} 解码后的令牌数据
   */
  async verifyToken(token) {
    try {
      // 解码令牌
      const decoded = jwt.verify(token, JWT_SECRET);

      // 从Redis获取存储的令牌
      const storedToken = await redisManager.get(`user:${decoded.id}:token`);

      // 检查令牌是否存在于Redis中
      if (!storedToken || storedToken !== token) {
        // Token 不存在或不匹配，必须拒绝认证
        throw new Error('令牌已失效');
      }

      return decoded;
    } catch (error) {
      // 如果是 JWT 验证错误，抛出具体错误信息
      if (error.name === 'TokenExpiredError') {
        throw error;
      } else if (error.name === 'JsonWebTokenError') {
        throw error;
      }
      // 其他错误（包括 token 失效）
      throw error;
    }
  }

  /**
   * 刷新令牌
   * @param {string} token - 当前令牌
   * @returns {Promise<Object>} 包含新令牌的对象
   */
  async refreshToken(token) {
    try {
      // 验证当前令牌
      const decoded = await this.verifyToken(token);

      // 获取用户信息
      const user = await userService.findById(decoded.id);

      if (!user) {
        throw new Error('用户不存在');
      }

      // 生成新令牌
      const newToken = this.generateToken(user);

      // 更新Redis中的令牌
      await this.storeToken(user.id, newToken);

      return { token: newToken };
    } catch (error) {
      throw new Error('刷新令牌失败');
    }
  }

  /**
   * 生成JWT令牌
   * @param {Object} user - 用户对象
   * @returns {string} JWT令牌
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * 存储令牌到Redis
   * @param {number} userId - 用户ID
   * @param {string} token - JWT令牌
   * @returns {Promise<void>}
   */
  async storeToken(userId, token) {
    try {
      // 解析JWT过期时间
      const decoded = jwt.decode(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      // 存储令牌到Redis，设置相同的过期时间
      await redisManager.set(`user:${userId}:token`, token, expiresIn);
    } catch (error) {
      console.error('存储令牌到Redis失败:', error.message);
      // 错误不会影响主流程
    }
  }
}

module.exports = new AuthService();
