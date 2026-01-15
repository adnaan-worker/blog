const db = require('@models');
const { User, OAuthAccount, AIQuota } = db;
const authService = require('./auth.service');
const { Op } = require('sequelize');

/**
 * OAuth 服务层
 * 处理第三方登录的用户查找、创建和绑定
 */
class OAuthService {
  /**
   * 根据 ID 查找用户
   * @param {number} id - 用户ID
   * @returns {Promise<Object|null>}
   */
  async findUserById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  }

  /**
   * 查找或创建 OAuth 用户
   * @param {string} provider - 提供商 (github/google/gitee)
   * @param {Object} profile - OAuth 返回的用户信息
   * @param {Object} tokens - 访问令牌信息
   * @returns {Promise<Object>} 用户对象
   */
  async findOrCreateUser(provider, profile, tokens = {}) {
    const providerId = profile.id.toString();
    
    // 1. 查找是否已绑定该 OAuth 账号
    const existingOAuth = await OAuthAccount.findOne({
      where: { provider, providerId },
      include: [{ model: User, as: 'user' }],
    });

    if (existingOAuth && existingOAuth.user) {
      // 更新 token
      await existingOAuth.update({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        profile: profile._raw || profile,
      });
      
      // 更新用户最后登录时间
      await User.update(
        { lastLogin: new Date() },
        { where: { id: existingOAuth.userId } }
      );
      
      return existingOAuth.user;
    }

    // 2. 提取用户信息
    const userInfo = this.extractUserInfo(provider, profile);

    // 3. 检查邮箱是否已注册（可选：自动关联）
    if (userInfo.email) {
      const userByEmail = await User.findOne({
        where: { email: userInfo.email },
      });
      
      if (userByEmail) {
        // 邮箱已存在，绑定 OAuth 账号到现有用户
        await this.bindOAuthAccount(userByEmail.id, provider, profile, tokens);
        
        // 如果现有用户没有头像，更新头像
        if (!userByEmail.avatar || userByEmail.avatar === 'default-avatar.png') {
          await userByEmail.update({ avatar: userInfo.avatar });
        }
        
        await User.update(
          { lastLogin: new Date() },
          { where: { id: userByEmail.id } }
        );
        
        return userByEmail;
      }
    }

    // 4. 创建新用户
    const newUser = await this.createOAuthUser(provider, userInfo, profile, tokens);
    
    return newUser;
  }

  /**
   * 从 OAuth profile 提取用户信息
   * @param {string} provider - 提供商
   * @param {Object} profile - OAuth profile
   * @returns {Object} 标准化的用户信息
   */
  extractUserInfo(provider, profile) {
    const info = {
      username: null,
      email: null,
      fullName: null,
      avatar: null,
      bio: null,
    };

    switch (provider) {
      case 'github':
        info.username = profile.username || profile._json?.login;
        info.email = profile.emails?.[0]?.value || profile._json?.email;
        info.fullName = profile.displayName || profile._json?.name;
        info.avatar = profile.photos?.[0]?.value || profile._json?.avatar_url;
        info.bio = profile._json?.bio;
        break;

      case 'google':
        info.username = profile.emails?.[0]?.value?.split('@')[0];
        info.email = profile.emails?.[0]?.value;
        info.fullName = profile.displayName;
        info.avatar = profile.photos?.[0]?.value;
        break;

      case 'gitee':
        info.username = profile.username || profile._raw?.login;
        info.email = profile.emails?.[0]?.value || profile._raw?.email;
        info.fullName = profile.displayName || profile._raw?.name;
        info.avatar = profile.photos?.[0]?.value || profile._raw?.avatar_url;
        info.bio = profile._raw?.bio;
        break;
    }

    return info;
  }

  /**
   * 创建 OAuth 用户
   * @param {string} provider - 提供商
   * @param {Object} userInfo - 用户信息
   * @param {Object} profile - 原始 profile
   * @param {Object} tokens - 令牌
   * @returns {Promise<Object>} 新用户
   */
  async createOAuthUser(provider, userInfo, profile, tokens) {
    const transaction = await db.sequelize.transaction();

    try {
      // 生成唯一用户名
      let username = userInfo.username || `${provider}_${profile.id}`;
      username = await this.ensureUniqueUsername(username);

      // 创建用户（OAuth 用户不需要密码，设置随机密码）
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const hashedPassword = require('bcryptjs').hashSync(randomPassword, 12);

      const newUser = await User.create(
        {
          username,
          email: userInfo.email || `${username}@oauth.local`, // 如果没有邮箱，生成占位邮箱
          password: hashedPassword,
          fullName: userInfo.fullName,
          avatar: userInfo.avatar || 'default-avatar.png',
          bio: userInfo.bio,
          status: 'active',
          role: 'user',
          lastLogin: new Date(),
        },
        { transaction }
      );

      // 绑定 OAuth 账号
      await OAuthAccount.create(
        {
          userId: newUser.id,
          provider,
          providerId: profile.id.toString(),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          profile: profile._raw || profile,
        },
        { transaction }
      );

      // 创建 AI 配额
      await AIQuota.create(
        {
          userId: newUser.id,
          dailyChatLimit: 100,
          dailyChatUsed: 0,
          dailyGenerateLimit: 50,
          dailyGenerateUsed: 0,
          monthlyTokenLimit: 100000,
          monthlyTokenUsed: 0,
        },
        { transaction }
      );

      await transaction.commit();

      return newUser;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 绑定 OAuth 账号到现有用户
   * @param {number} userId - 用户ID
   * @param {string} provider - 提供商
   * @param {Object} profile - OAuth profile
   * @param {Object} tokens - 令牌
   */
  async bindOAuthAccount(userId, provider, profile, tokens) {
    await OAuthAccount.create({
      userId,
      provider,
      providerId: profile.id.toString(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      profile: profile._raw || profile,
    });
  }

  /**
   * 确保用户名唯一
   * @param {string} baseUsername - 基础用户名
   * @returns {Promise<string>} 唯一用户名
   */
  async ensureUniqueUsername(baseUsername) {
    // 清理用户名，只保留字母数字和下划线
    let username = baseUsername.replace(/[^a-zA-Z0-9_]/g, '');
    
    // 确保用户名长度在 3-50 之间
    if (username.length < 3) {
      username = username + '_user';
    }
    if (username.length > 50) {
      username = username.substring(0, 50);
    }

    // 检查是否存在
    const existing = await User.findOne({ where: { username } });
    if (!existing) {
      return username;
    }

    // 添加随机后缀
    let suffix = 1;
    let newUsername = `${username}_${suffix}`;
    
    while (await User.findOne({ where: { username: newUsername } })) {
      suffix++;
      newUsername = `${username}_${suffix}`;
    }

    return newUsername;
  }

  /**
   * 获取用户绑定的 OAuth 账号列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>}
   */
  async getUserOAuthAccounts(userId) {
    const accounts = await OAuthAccount.findAll({
      where: { userId },
      attributes: ['id', 'provider', 'providerId', 'createdAt'],
    });

    return accounts.map(account => ({
      id: account.id,
      provider: account.provider,
      providerId: account.providerId,
      bindTime: account.createdAt,
    }));
  }

  /**
   * 解绑 OAuth 账号
   * @param {number} userId - 用户ID
   * @param {string} provider - 提供商
   */
  async unbindOAuthAccount(userId, provider) {
    // 检查用户是否有密码（防止解绑后无法登录）
    const user = await User.findByPk(userId);
    const oauthCount = await OAuthAccount.count({ where: { userId } });

    // 如果用户是 OAuth 创建的（邮箱以 @oauth.local 结尾）且只有一个绑定，不允许解绑
    if (user.email.endsWith('@oauth.local') && oauthCount <= 1) {
      throw new Error('无法解绑唯一的登录方式，请先绑定邮箱或其他登录方式');
    }

    await OAuthAccount.destroy({
      where: { userId, provider },
    });
  }

  /**
   * 绑定 OAuth 账号到已登录用户
   * @param {number} userId - 当前登录用户ID
   * @param {string} provider - 提供商
   * @param {Object} profile - OAuth profile
   * @param {Object} tokens - 令牌
   * @returns {Promise<Object>} 绑定结果
   */
  async bindToExistingUser(userId, provider, profile, tokens = {}) {
    const providerId = profile.id.toString();

    // 1. 检查该 OAuth 账号是否已被其他用户绑定
    const existingOAuth = await OAuthAccount.findOne({
      where: { provider, providerId },
    });

    if (existingOAuth) {
      if (existingOAuth.userId === userId) {
        throw new Error('该账号已绑定到您的账户');
      } else {
        throw new Error('该第三方账号已被其他用户绑定');
      }
    }

    // 2. 检查当前用户是否已绑定该平台
    const userExistingBind = await OAuthAccount.findOne({
      where: { userId, provider },
    });

    if (userExistingBind) {
      throw new Error(`您已绑定过 ${provider} 账号，请先解绑后再绑定新账号`);
    }

    // 3. 创建绑定
    await OAuthAccount.create({
      userId,
      provider,
      providerId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      profile: profile._raw || profile,
    });

    // 4. 提取用户信息，更新头像等（如果用户没有设置）
    const user = await User.findByPk(userId);
    const userInfo = this.extractUserInfo(provider, profile);

    const updateData = {};
    
    // 如果用户没有头像或使用默认头像，更新为第三方头像
    if ((!user.avatar || user.avatar === 'default-avatar.png') && userInfo.avatar) {
      updateData.avatar = userInfo.avatar;
    }
    
    // 如果用户没有昵称，更新为第三方昵称
    if (!user.fullName && userInfo.fullName) {
      updateData.fullName = userInfo.fullName;
    }
    
    // 如果用户没有简介，更新为第三方简介
    if (!user.bio && userInfo.bio) {
      updateData.bio = userInfo.bio;
    }

    if (Object.keys(updateData).length > 0) {
      await user.update(updateData);
    }

    return {
      provider,
      providerId,
      username: userInfo.username || profile.username,
    };
  }

  /**
   * 检查 OAuth 账号是否可绑定
   * @param {string} provider - 提供商
   * @param {string} providerId - 第三方用户ID
   * @returns {Promise<Object>} 检查结果
   */
  async checkBindable(provider, providerId) {
    const existing = await OAuthAccount.findOne({
      where: { provider, providerId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
    });

    if (existing) {
      return {
        bindable: false,
        reason: '该第三方账号已被绑定',
        boundTo: existing.user?.username,
      };
    }

    return { bindable: true };
  }

  /**
   * 为 OAuth 用户生成 JWT Token
   * @param {Object} user - 用户对象
   * @returns {Promise<string>} JWT Token
   */
  async generateTokenForUser(user) {
    const token = authService.generateToken(user);
    await authService.storeToken(user.id, token);
    return token;
  }
}

module.exports = new OAuthService();
