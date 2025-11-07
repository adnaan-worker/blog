const authService = require('../services/auth.service');

/**
 * 验证令牌中间件
 * 用于验证用户是否已登录
 */
const verifyToken = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.apiUnauthorized('未提供认证令牌');
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.apiUnauthorized('未提供认证令牌');
    }

    try {
      // 验证令牌
      const decoded = await authService.verifyToken(token);

      // 将用户信息添加到请求对象
      req.user = decoded;

      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.apiUnauthorized('令牌已过期');
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.apiUnauthorized('无效的令牌');
      } else if (tokenError.message === '令牌已失效') {
        return res.apiUnauthorized('令牌已失效，请重新登录');
      }
      throw tokenError;
    }
  } catch (error) {
    console.error('令牌验证失败:', error);
    return res.apiUnauthorized('认证失败', { error: error.message });
  }
};

/**
 * 管理员权限验证中间件
 * 用于验证用户是否具有管理员权限
 */
const isAdmin = (req, res, next) => {
  // 确保用户已通过认证
  if (!req.user) {
    return res.apiUnauthorized('未认证的用户');
  }

  // 检查用户角色
  if (req.user.role !== 'admin') {
    return res.apiForbidden('需要管理员权限');
  }

  next();
};

/**
 * 资源所有者验证中间件
 * 用于验证当前用户是否为资源的所有者
 * @param {Function} getOwnerId - 从请求中获取资源所有者ID的函数
 */
const isResourceOwner = getOwnerId => {
  return async (req, res, next) => {
    try {
      // 确保用户已通过认证
      if (!req.user) {
        return res.apiUnauthorized('未认证的用户');
      }

      // 获取资源所有者ID
      const ownerId = await getOwnerId(req);

      // 检查当前用户是否为资源所有者或管理员
      if (req.user.id !== ownerId && req.user.role !== 'admin') {
        return res.apiForbidden('无权访问此资源');
      }

      next();
    } catch (error) {
      console.error('资源所有权验证失败:', error);
      next(error);
    }
  };
};

/**
 * 可选认证中间件
 * 如果提供了token则验证，没有token则继续执行
 */
const optionalAuth = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 没有提供令牌，继续执行
      return next();
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];

    if (!token) {
      // 没有提供令牌，继续执行
      return next();
    }

    try {
      // 验证令牌
      const decoded = await authService.verifyToken(token);
      // 将用户信息添加到请求对象
      req.user = decoded;
    } catch (tokenError) {
      // 令牌无效，但不阻止请求继续执行
      console.warn('可选认证令牌验证失败:', tokenError.message);
    }

    next();
  } catch (error) {
    console.error('可选认证处理失败:', error);
    // 发生错误时也继续执行，不阻止请求
    next();
  }
};

/**
 * 角色验证中间件
 * 用于验证用户是否具有特定角色
 * @param {Array|string} roles - 允许的角色
 */
const checkRole = roles => {
  return (req, res, next) => {
    // 确保用户已通过认证
    if (!req.user) {
      return res.apiUnauthorized('未认证的用户');
    }

    // 转换为数组
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // 检查用户角色
    if (!allowedRoles.includes(req.user.role)) {
      return res.apiForbidden('权限不足');
    }

    next();
  };
};

module.exports = {
  verifyToken,
  optionalAuth,
  isAdmin,
  isResourceOwner,
  checkRole,
};
