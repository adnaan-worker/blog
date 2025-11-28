const authService = require('@/services/auth.service');
const userService = require('@/services/user.service');
const { asyncHandler } = require('@/utils/response');

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // 验证请求数据
  if (!username || !password) {
    return res.apiValidationError(
      [
        { field: 'username', message: '用户名不能为空' },
        { field: 'password', message: '密码不能为空' },
      ],
      '用户名和密码不能为空'
    );
  }

  // 调用登录服务
  const result = await authService.login(username, password);

  return res.apiSuccess(result, '登录成功');
});

/**
 * 用户注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.register = asyncHandler(async (req, res) => {
  const userData = req.body;

  // 验证请求数据
  if (!userData.username || !userData.email || !userData.password) {
    return res.apiValidationError(
      [
        { field: 'username', message: '用户名不能为空' },
        { field: 'email', message: '邮箱不能为空' },
        { field: 'password', message: '密码不能为空' },
      ],
      '用户名、邮箱和密码不能为空'
    );
  }

  //用户名不能为中文
  const chineseRegex = /[\u4e00-\u9fa5]/;
  if (chineseRegex.test(userData.username)) {
    return res.apiValidationError(
      [{ field: 'username', message: '用户名字符非法' }],
      '参数验证失败'
    );
  }

  // 调用注册服务
  const result = await authService.register(userData);

  return res.apiCreated(result, '注册成功');
});

/**
 * 用户登出
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 调用登出服务
  await authService.logout(userId);

  return res.apiSuccess(null, '登出成功');
});

/**
 * 刷新令牌
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.apiValidationError([{ field: 'token', message: '令牌不能为空' }], '令牌不能为空');
  }

  // 调用刷新令牌服务
  const result = await authService.refreshToken(token);

  return res.apiSuccess(result, '刷新令牌成功');
});

/**
 * 验证令牌
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.apiValidationError([{ field: 'token', message: '令牌不能为空' }], '令牌不能为空');
  }

  // 调用验证令牌服务
  const decoded = await authService.verifyToken(token);

  return res.apiSuccess({ valid: true, user: decoded }, '令牌验证成功');
});
