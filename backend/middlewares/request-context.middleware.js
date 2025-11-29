/**
 * 请求上下文相关的通用中间件集合
 *
 * 设计目标：
 * - 把分页、用户角色、筛选条件、数据作用域等“横切逻辑”集中到中间件里
 * - 控制器只关心业务参数，从 req.pagination / req.context / req.filters / req.scope 读取即可
 * - 统一给个人中心、管理后台等接口复用
 */

/**
 * 分页中间件
 *
 * 从 query 中解析 page / limit，注入到 req.pagination 上：
 *   req.pagination = { page, limit }
 *
 * 典型用法（路由）：
 *   router.get(
 *     '/',
 *     withPagination({ defaultLimit: 10, maxLimit: 50 }),
 *     controller.list,
 *   );
 *
 * @param {Object} options
 * @param {number} [options.defaultPage=1]   默认页码
 * @param {number} [options.defaultLimit=10] 默认每页数量
 * @param {number} [options.maxLimit=100]    每页上限，防止一次拉太多
 */
const withPagination = (options = {}) => {
  const { defaultPage = 1, defaultLimit = 10, maxLimit = 100 } = options;

  return (req, res, next) => {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (Number.isNaN(page) || page <= 0) page = defaultPage;
    if (Number.isNaN(limit) || limit <= 0) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    req.pagination = { page, limit };
    next();
  };
};

/**
 * 用户上下文中间件
 *
 * 依赖：
 *   - 需要在 authMiddleware.verifyToken / optionalAuth 之后使用
 *   - 基于 req.user 计算出常用的角色信息，挂到 req.context 上：
 *     req.context = {
 *       userId,
 *       role,
 *       isAdmin,      // 仅 admin
 *       isModerator,  // 协管 / 版主
 *       isPrivileged, // admin 或 moderator
 *     }
 *
 * 典型用法（路由）：
 *   router.get('/my', verifyToken, withUserContext, controller.getMyResources);
 */
const withUserContext = (req, res, next) => {
  const user = req.user || null;
  req.context = req.context || {};
  req.context.userId = user ? user.id : null;
  req.context.role = user ? user.role : null;
  req.context.isAdmin = !!user && user.role === 'admin';
  req.context.isModerator = !!user && user.role === 'moderator';
  req.context.isPrivileged = !!user && (user.role === 'admin' || user.role === 'moderator');
  next();
};

/**
 * 枚举型筛选中间件
 *
 * 作用：
 *   - 从 query 中读取单个枚举字段（如 status=pending）
 *   - 仅当值在允许列表内时，写入 req.filters 上，避免非法值直接进入查询
 *   - 控制器/服务层统一从 req.filters 读取过滤条件
 *
 * 典型用法（路由）：
 *   router.get(
 *     '/',
 *     withEnumFilter('status', ['approved', 'pending', 'spam'], 'status'),
 *     controller.list,
 *   );
 *
 * @param {string} queryKey          query 参数名，如 'status'
 * @param {string[]} allowedValues   允许的取值列表
 * @param {string} [targetKey]       写入到 req.filters 时使用的 key，默认等于 queryKey
 */
const withEnumFilter = (queryKey, allowedValues, targetKey) => {
  return (req, res, next) => {
    const raw = req.query[queryKey];
    const filters = (req.filters ||= {});

    if (raw && allowedValues.includes(raw)) {
      filters[targetKey || queryKey] = raw;
    }

    next();
  };
};

/**
 * 数据作用域中间件
 *
 * 作用：
 *   - 基于 req.context 中的角色信息（isAdmin / isPrivileged）来决定当前请求的数据范围
 *   - 在 req.scope 上挂一个字符串标识，用于 service 层或控制器内部做分支处理
 *
 * 例如评论管理：
 *   withScope({ adminScope: 'all-comments', userScope: 'own-comments' })
 *   - 管理员：req.scope = 'all-comments'
 *   - 普通用户：req.scope = 'own-comments'
 *
 * @param {Object} scopes
 * @param {string} scopes.adminScope  管理员/特权用户使用的作用域标识
 * @param {string} scopes.userScope   普通用户使用的作用域标识
 * @param {Object} [options]
 * @param {boolean} [options.usePrivileged=false]
 *        - false：仅 admin 走 adminScope
 *        - true：admin + moderator 都走 adminScope（用于“协管也算后台权限”的场景）
 */
const withScope = (scopes, options = {}) => {
  return (req, res, next) => {
    const ctx = req.context || {};
    const usePrivileged = options.usePrivileged || false;
    const isAdminLike = usePrivileged ? ctx.isPrivileged : ctx.isAdmin;
    req.scope = isAdminLike ? scopes.adminScope : scopes.userScope;
    next();
  };
};

module.exports = {
  withPagination,
  withUserContext,
  withEnumFilter,
  withScope,
};
