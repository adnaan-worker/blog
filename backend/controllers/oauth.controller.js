const passport = require('passport');
const oauthService = require('@services/oauth.service');
const { asyncHandler } = require('@utils/response');
const environment = require('@config/environment');

/**
 * OAuth 控制器
 * 处理第三方登录的路由回调
 */

// 获取前端回调地址
const getFrontendCallbackUrl = () => {
  const config = environment.get();
  return config.oauth?.frontendCallbackUrl || 'http://localhost:3000/#/oauth/callback';
};

/**
 * 构建带参数的前端回调 URL（支持 hash 路由）
 */
const buildCallbackUrl = (params = {}) => {
  const baseUrl = getFrontendCallbackUrl();

  if (Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryParts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  const queryString = queryParts.join('&');

  // 对于 hash 路由，参数放在 hash 路径后面
  const finalUrl = `${baseUrl}?${queryString}`;
  console.log('OAuth redirect URL:', finalUrl);
  return finalUrl;
};

/**
 * GitHub 登录入口
 */
exports.githubLogin = (req, res, next) => {
  // 检查是否是绑定操作（已登录用户）
  const state = req.query.bind === 'true' ? 'bind' : 'login';
  
  passport.authenticate('github', {
    scope: ['user:email'],
    state,
  })(req, res, next);
};

/**
 * GitHub 登录回调
 */
exports.githubCallback = [
  (req, res, next) => {
    passport.authenticate('github', { session: false }, async (err, user, info) => {
      if (err) {
        return res.redirect(buildCallbackUrl({ error: err.message, provider: 'github' }));
      }
      
      // 检查是否是绑定操作
      const state = req.query.state;
      
      if (state === 'bind') {
        req.oauthProfile = info?.profile || req.authInfo?.profile;
        req.oauthTokens = { accessToken: info?.accessToken, refreshToken: info?.refreshToken };
        req.oauthProvider = 'github';
      }
      
      req.user = user;
      next();
    })(req, res, next);
  },
  asyncHandler(async (req, res) => {
    const user = req.user;
    const state = req.query.state;
    
    if (!user) {
      return res.redirect(buildCallbackUrl({ error: '认证失败', provider: 'github' }));
    }
    
    const token = await oauthService.generateTokenForUser(user);
    res.redirect(buildCallbackUrl({ token, provider: 'github', action: state || 'login' }));
  }),
];

/**
 * Google 登录入口
 */
exports.googleLogin = (req, res, next) => {
  const state = req.query.bind === 'true' ? 'bind' : 'login';
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
};

/**
 * Google 登录回调
 */
exports.googleCallback = [
  (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) {
        return res.redirect(buildCallbackUrl({ error: err.message, provider: 'google' }));
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  asyncHandler(async (req, res) => {
    const user = req.user;
    const state = req.query.state;
    
    if (!user) {
      return res.redirect(buildCallbackUrl({ error: '认证失败', provider: 'google' }));
    }
    
    const token = await oauthService.generateTokenForUser(user);
    res.redirect(buildCallbackUrl({ token, provider: 'google', action: state || 'login' }));
  }),
];

/**
 * Gitee 登录入口
 */
exports.giteeLogin = (req, res, next) => {
  const state = req.query.bind === 'true' ? 'bind' : 'login';
  
  passport.authenticate('gitee', { state })(req, res, next);
};

/**
 * Gitee 登录回调
 */
exports.giteeCallback = [
  (req, res, next) => {
    passport.authenticate('gitee', { session: false }, async (err, user) => {
      if (err) {
        return res.redirect(buildCallbackUrl({ error: err.message, provider: 'gitee' }));
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  asyncHandler(async (req, res) => {
    const user = req.user;
    const state = req.query.state;
    
    if (!user) {
      return res.redirect(buildCallbackUrl({ error: '认证失败', provider: 'gitee' }));
    }
    
    const token = await oauthService.generateTokenForUser(user);
    res.redirect(buildCallbackUrl({ token, provider: 'gitee', action: state || 'login' }));
  }),
];

/**
 * 获取 OAuth 配置状态（前端用于显示可用的登录方式）
 */
exports.getOAuthStatus = asyncHandler(async (req, res) => {
  const config = environment.get();
  const oauth = config.oauth || {};

  const status = {
    github: !!(oauth.github?.clientId && oauth.github?.clientSecret),
    google: !!(oauth.google?.clientId && oauth.google?.clientSecret),
    gitee: !!(oauth.gitee?.clientId && oauth.gitee?.clientSecret),
  };

  return res.apiSuccess(status, '获取 OAuth 状态成功');
});

/**
 * 获取用户绑定的 OAuth 账号
 */
exports.getBindings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const accounts = await oauthService.getUserOAuthAccounts(userId);
  
  return res.apiSuccess(accounts, '获取绑定账号成功');
});

/**
 * 解绑 OAuth 账号
 */
exports.unbind = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { provider } = req.params;

  if (!['github', 'google', 'gitee'].includes(provider)) {
    return res.apiValidationError([{ field: 'provider', message: '无效的提供商' }]);
  }

  await oauthService.unbindOAuthAccount(userId, provider);
  
  return res.apiSuccess(null, '解绑成功');
});

/**
 * 已登录用户绑定 GitHub
 */
exports.bindGithub = (req, res, next) => {
  // 将用户ID存入 session state，回调时使用
  const userId = req.user.id;
  passport.authenticate('github', {
    scope: ['user:email'],
    state: `bind_${userId}`,
  })(req, res, next);
};

/**
 * 已登录用户绑定 GitHub 回调
 */
exports.bindGithubCallback = asyncHandler(async (req, res) => {
  const state = req.query.state || '';
  
  if (!state.startsWith('bind_')) {
    return res.redirect(buildCallbackUrl({ error: '无效的绑定请求', provider: 'github' }));
  }
  
  const userId = parseInt(state.replace('bind_', ''), 10);
  
  // 手动处理 OAuth 认证获取 profile
  const code = req.query.code;
  if (!code) {
    return res.redirect(buildCallbackUrl({ error: '授权失败', provider: 'github' }));
  }
  
  try {
    const config = environment.get();
    const axios = require('axios');
    
    // 获取 access_token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.oauth.github.clientId,
        client_secret: config.oauth.github.clientSecret,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );
    
    const { access_token } = tokenRes.data;
    if (!access_token) {
      return res.redirect(buildCallbackUrl({ error: '获取令牌失败', provider: 'github' }));
    }
    
    // 获取用户信息
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const profile = {
      id: userRes.data.id.toString(),
      username: userRes.data.login,
      displayName: userRes.data.name,
      emails: userRes.data.email ? [{ value: userRes.data.email }] : [],
      photos: [{ value: userRes.data.avatar_url }],
      _raw: userRes.data,
    };
    
    // 绑定到用户
    await oauthService.bindToExistingUser(userId, 'github', profile, {
      accessToken: access_token,
    });
    
    return res.redirect(buildCallbackUrl({ success: 'true', provider: 'github', action: 'bind' }));
  } catch (error) {
    const errorMsg = error.message || '绑定失败';
    return res.redirect(buildCallbackUrl({ error: errorMsg, provider: 'github', action: 'bind' }));
  }
});

/**
 * 已登录用户绑定 Google
 */
exports.bindGoogle = (req, res, next) => {
  const userId = req.user.id;
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: `bind_${userId}`,
  })(req, res, next);
};

/**
 * 已登录用户绑定 Google 回调
 */
exports.bindGoogleCallback = asyncHandler(async (req, res) => {
  const state = req.query.state || '';
  
  if (!state.startsWith('bind_')) {
    return res.redirect(buildCallbackUrl({ error: '无效的绑定请求', provider: 'google' }));
  }
  
  const userId = parseInt(state.replace('bind_', ''), 10);
  const code = req.query.code;
  
  if (!code) {
    return res.redirect(buildCallbackUrl({ error: '授权失败', provider: 'google' }));
  }
  
  try {
    const config = environment.get();
    const axios = require('axios');
    
    // 获取 access_token
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.oauth.google.callbackURL.startsWith('http')
        ? config.oauth.google.callbackURL
        : `${req.protocol}://${req.get('host')}${config.oauth.google.callbackURL}`.replace('/bindcallback', '/bind/callback'),
    });
    
    const { access_token } = tokenRes.data;
    
    // 获取用户信息
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const profile = {
      id: userRes.data.id,
      displayName: userRes.data.name,
      emails: [{ value: userRes.data.email }],
      photos: [{ value: userRes.data.picture }],
      _raw: userRes.data,
    };
    
    await oauthService.bindToExistingUser(userId, 'google', profile, {
      accessToken: access_token,
    });
    
    return res.redirect(buildCallbackUrl({ success: 'true', provider: 'google', action: 'bind' }));
  } catch (error) {
    const errorMsg = error.message || '绑定失败';
    return res.redirect(buildCallbackUrl({ error: errorMsg, provider: 'google', action: 'bind' }));
  }
});

/**
 * 已登录用户绑定 Gitee
 */
exports.bindGitee = (req, res, next) => {
  const userId = req.user.id;
  passport.authenticate('gitee', {
    state: `bind_${userId}`,
  })(req, res, next);
};

/**
 * 已登录用户绑定 Gitee 回调
 */
exports.bindGiteeCallback = asyncHandler(async (req, res) => {
  const state = req.query.state || '';
  
  if (!state.startsWith('bind_')) {
    return res.redirect(buildCallbackUrl({ error: '无效的绑定请求', provider: 'gitee' }));
  }
  
  const userId = parseInt(state.replace('bind_', ''), 10);
  const code = req.query.code;
  
  if (!code) {
    return res.redirect(buildCallbackUrl({ error: '授权失败', provider: 'gitee' }));
  }
  
  try {
    const config = environment.get();
    const axios = require('axios');
    
    // 获取 access_token
    const tokenRes = await axios.post(
      'https://gitee.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: config.oauth.gitee.clientId,
          client_secret: config.oauth.gitee.clientSecret,
          code,
          redirect_uri: config.oauth.gitee.callbackURL.startsWith('http')
            ? config.oauth.gitee.callbackURL
            : `${req.protocol}://${req.get('host')}${config.oauth.gitee.callbackURL}`.replace('/bindcallback', '/bind/callback'),
        },
      }
    );
    
    const { access_token } = tokenRes.data;
    
    // 获取用户信息
    const userRes = await axios.get(`https://gitee.com/api/v5/user?access_token=${access_token}`);
    
    const profile = {
      id: userRes.data.id.toString(),
      username: userRes.data.login,
      displayName: userRes.data.name,
      emails: userRes.data.email ? [{ value: userRes.data.email }] : [],
      photos: [{ value: userRes.data.avatar_url }],
      _raw: userRes.data,
    };
    
    await oauthService.bindToExistingUser(userId, 'gitee', profile, {
      accessToken: access_token,
    });
    
    return res.redirect(buildCallbackUrl({ success: 'true', provider: 'gitee', action: 'bind' }));
  } catch (error) {
    const errorMsg = error.message || '绑定失败';
    return res.redirect(buildCallbackUrl({ error: errorMsg, provider: 'gitee', action: 'bind' }));
  }
});
