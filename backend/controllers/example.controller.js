/**
 * 示例控制器
 * 展示如何使用统一的响应格式
 */

const { asyncHandler, createPagination } = require('../utils/response');

/**
 * 获取单个数据示例
 */
exports.getItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 模拟数据
  const item = {
    id: parseInt(id),
    name: '示例项目',
    description: '这是一个示例项目',
    createdAt: new Date().toISOString(),
  };

  if (!item) {
    return res.apiNotFound('项目不存在');
  }

  return res.apiItem(item, '获取项目成功');
});

/**
 * 获取列表数据示例
 */
exports.getList = asyncHandler(async (req, res) => {
  // 模拟数据列表
  const items = [
    { id: 1, name: '项目1', status: 'active' },
    { id: 2, name: '项目2', status: 'inactive' },
    { id: 3, name: '项目3', status: 'active' },
  ];

  return res.apiList(items, '获取项目列表成功');
});

/**
 * 获取分页数据示例
 */
exports.getPaginated = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // 模拟分页数据
  const total = 100;
  const totalPages = Math.ceil(total / limit);
  const items = Array.from({ length: Math.min(limit, total - (page - 1) * limit) }, (_, i) => ({
    id: (page - 1) * limit + i + 1,
    name: `项目${(page - 1) * limit + i + 1}`,
    status: i % 2 === 0 ? 'active' : 'inactive',
  }));

  const pagination = createPagination(page, limit, total, totalPages);

  return res.apiPaginated(items, pagination, '获取分页数据成功');
});

/**
 * 创建数据示例
 */
exports.createItem = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // 验证数据
  if (!name) {
    return res.apiValidationError([{ field: 'name', message: '名称不能为空' }], '数据验证失败');
  }

  // 模拟创建数据
  const newItem = {
    id: Date.now(),
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
    createdBy: req.user?.id || 'anonymous',
  };

  return res.apiCreated(newItem, '项目创建成功');
});

/**
 * 更新数据示例
 */
exports.updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // 模拟更新数据
  const updatedItem = {
    id: parseInt(id),
    name: name || '更新后的项目',
    description: description || '',
    updatedAt: new Date().toISOString(),
    updatedBy: req.user?.id || 'anonymous',
  };

  return res.apiUpdated(updatedItem, '项目更新成功');
});

/**
 * 删除数据示例
 */
exports.deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 模拟删除操作
  // 删除示例项目

  return res.apiDeleted('项目删除成功', { deletedId: id });
});

/**
 * 错误处理示例
 */
exports.errorExample = asyncHandler(async (req, res) => {
  const { type } = req.query;

  switch (type) {
    case 'unauthorized':
      return res.apiUnauthorized('用户未登录');

    case 'forbidden':
      return res.apiForbidden('权限不足');

    case 'notfound':
      return res.apiNotFound('资源不存在');

    case 'conflict':
      return res.apiConflict('资源冲突');

    case 'validation':
      return res.apiValidationError(
        [
          { field: 'email', message: '邮箱格式不正确' },
          { field: 'password', message: '密码长度不能少于6位' },
        ],
        '数据验证失败'
      );

    case 'server':
      return res.apiServerError('服务器内部错误');

    default:
      return res.apiError('未知错误', 400);
  }
});

/**
 * 自定义元数据示例
 */
exports.customMeta = asyncHandler(async (req, res) => {
  const data = { message: 'Hello World' };

  const meta = {
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    requestId: req.headers['x-request-id'] || 'unknown',
    processingTime: '50ms',
  };

  return res.apiSuccess(data, '操作成功', 200, meta);
});

/**
 * 批量操作示例
 */
exports.batchOperation = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.apiValidationError(
      [{ field: 'items', message: 'items必须是非空数组' }],
      '数据验证失败'
    );
  }

  // 模拟批量处理
  const results = items.map((item, index) => ({
    id: index + 1,
    original: item,
    processed: true,
    timestamp: new Date().toISOString(),
  }));

  const meta = {
    totalProcessed: results.length,
    successCount: results.length,
    failureCount: 0,
  };

  return res.apiSuccess(results, '批量处理完成', 200, meta);
});
