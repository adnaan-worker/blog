const projectService = require('@/services/project.service');
const { asyncHandler } = require('@/utils/response');

/**
 * 获取项目列表
 */
exports.getProjects = asyncHandler(async (req, res) => {
  const { includePrivate, ...restQuery } = req.query;
  const { isAdmin = false } = req.context || {};
  const pagination = req.pagination || {};

  const options = {
    ...restQuery,
  };

  if (pagination.page) {
    options.page = pagination.page;
  }
  if (pagination.limit) {
    options.limit = pagination.limit;
  }

  // 仅当为管理员且显式请求 includePrivate 时，才允许查询包含私有项目
  const wantIncludePrivate =
    includePrivate === 'true' || includePrivate === '1' || includePrivate === true;

  if (isAdmin && wantIncludePrivate) {
    options.includePrivate = true;
  }

  const result = await projectService.getProjects(options);
  return res.apiPaginated(result.data, result.pagination, '获取项目列表成功');
});

/**
 * 获取项目详情
 */
exports.getProjectDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await projectService.getProjectByIdOrSlug(id);
  return res.apiSuccess(project, '获取项目详情成功');
});

/**
 * 创建项目（仅管理员）
 */
exports.createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.body);
  return res.apiSuccess(project, '项目创建成功', 201);
});

/**
 * 更新项目（仅管理员）
 */
exports.updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await projectService.updateProject(id, req.body);
  return res.apiSuccess(project, '项目更新成功');
});

/**
 * 删除项目（仅管理员）
 */
exports.deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await projectService.deleteProject(id);
  return res.apiSuccess(result, '项目删除成功');
});

/**
 * 获取项目统计信息
 */
exports.getProjectStats = asyncHandler(async (req, res) => {
  const stats = await projectService.getProjectStats();
  return res.apiSuccess(stats, '获取项目统计成功');
});

/**
 * 获取精选项目（支持分页）
 */
exports.getFeaturedProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 6 } = req.query;
  const result = await projectService.getFeaturedProjects({
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return res.apiPaginated(result.data, result.pagination, '获取精选项目成功');
});
