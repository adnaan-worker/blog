const noteService = require('@/services/note.service');
const { asyncHandler } = require('@/utils/response');
const ReadingTracker = require('@/utils/reading-tracker');
const { Note } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('@/utils/logger');
const RichTextParser = require('@/utils/rich-text-parser');

/**
 * 创建手记
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.createNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, content, mood, weather, location, tags, isPrivate } = req.body;

  // 使用富文本解析工具验证内容
  const validation = RichTextParser.validateContent(content, {
    maxLength: 10000,
    minLength: 1,
    requireText: true,
  });

  if (!validation.isValid) {
    return res.apiValidationError(
      validation.errors.map(error => ({ field: 'content', message: error })),
      '内容验证失败'
    );
  }

  // 清理HTML内容
  const sanitizedContent = RichTextParser.sanitizeHtml(content);

  if (title && title.length > 200) {
    return res.apiValidationError([{ field: 'title', message: '标题不能超过200字' }], '标题过长');
  }

  const noteData = {
    title: title?.trim() || null,
    content: sanitizedContent,
    mood,
    weather,
    location,
    tags: Array.isArray(tags) ? tags : [],
    isPrivate: Boolean(isPrivate),
  };

  const note = await noteService.createNote(userId, noteData);
  return res.apiCreated(note, '手记创建成功');
});

/**
 * 获取公开手记列表（前台展示）
 * 返回所有公开手记，支持筛选和搜索
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getNotesList = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    mood,
    weather,
    tags,
    search,
    year,
    orderBy = 'createdAt',
    orderDirection = 'DESC',
  } = req.query;

  // 解析标签参数
  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
    } catch (error) {
      parsedTags = typeof tags === 'string' ? tags.split(',') : [];
    }
  }

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50),
    mood,
    weather,
    tags: parsedTags,
    search,
    year,
    orderBy,
    orderDirection,
    onlyPublic: true, // 只返回公开手记
  };

  const result = await noteService.getNotesList(options);
  return res.apiPaginated(result.data, result.pagination, '获取手记列表成功');
});

/**
 * 获取我的手记列表（个人中心管理）
 * 普通用户：返回自己的所有手记（包括私密）
 * 管理员：返回所有手记（支持筛选）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getMyNotes = asyncHandler(async (req, res) => {
  const {
    mood,
    weather,
    tags,
    search,
    isPrivate,
    orderBy = 'createdAt',
    orderDirection = 'DESC',
  } = req.query;

  const { page = 1, limit = 10 } = req.pagination || {};

  // 解析标签参数
  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
    } catch (error) {
      parsedTags = typeof tags === 'string' ? tags.split(',') : [];
    }
  }

  const options = {
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50),
    mood,
    weather,
    tags: parsedTags,
    search,
    isPrivate: isPrivate === 'true' ? true : isPrivate === 'false' ? false : undefined, // 默认不传为 undefined，表示不筛选私密性
    orderBy,
    orderDirection,
  };

  const { isPrivileged = false, userId } = req.context || {};
  if (isPrivileged) {
    options.isAdmin = true;
  } else {
    options.userId = userId;
  }

  const result = await noteService.getNotesList(options);
  return res.apiPaginated(result.data, result.pagination, '获取我的手记列表成功');
});

/**
 * 获取手记详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的手记ID');
  }

  const note = await noteService.getNoteById(parseInt(id), currentUserId);

  if (!note) {
    return res.apiNotFound('手记不存在或无权访问');
  }

  // 获取手记模型实例用于更新阅读时间
  const noteModel = await Note.findByPk(parseInt(id));

  // 使用节流机制更新最后阅读时间（避免频繁写数据库）
  if (noteModel) {
    await ReadingTracker.trackNoteReading(parseInt(id), noteModel);
  }

  // 获取相关手记
  const relatedNotes = await noteService.getRelatedNotes(parseInt(id), 3);

  return res.apiSuccess(
    {
      ...note,
      relatedNotes,
    },
    '获取手记详情成功'
  );
});

/**
 * 更新手记
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, content, mood, weather, location, tags, isPrivate } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的手记ID');
  }

  // 验证内容
  let sanitizedContent = content;
  if (content !== undefined) {
    const validation = RichTextParser.validateContent(content, {
      maxLength: 10000,
      minLength: 1,
      requireText: true,
    });

    if (!validation.isValid) {
      return res.apiValidationError(
        validation.errors.map(error => ({
          field: 'content',
          message: error,
        })),
        '内容验证失败'
      );
    }

    // 清理HTML内容
    sanitizedContent = RichTextParser.sanitizeHtml(content);
  }

  if (title && title.length > 200) {
    return res.apiValidationError([{ field: 'title', message: '标题不能超过200字' }], '标题过长');
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title?.trim() || null;
  if (content !== undefined) updateData.content = sanitizedContent;
  if (mood !== undefined) updateData.mood = mood;
  if (weather !== undefined) updateData.weather = weather;
  if (location !== undefined) updateData.location = location;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
  if (isPrivate !== undefined) updateData.isPrivate = Boolean(isPrivate);

  const note = await noteService.updateNote(parseInt(id), userId, updateData);

  if (!note) {
    return res.apiNotFound('手记不存在或无权修改');
  }

  return res.apiSuccess(note, '手记更新成功');
});

/**
 * 删除手记
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的手记ID');
  }

  const success = await noteService.deleteNote(parseInt(id), userId);

  if (!success) {
    return res.apiNotFound('手记不存在或无权删除');
  }

  return res.apiDeleted('手记删除成功');
});

/**
 * 切换手记点赞状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.toggleNoteLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.apiBadRequest('无效的手记ID');
  }

  // 检查是否登录
  if (!req.user) {
    return res.apiError('请先登录后再点赞', 200);
  }

  const userId = req.user.id;

  try {
    const result = await noteService.toggleNoteLike(parseInt(id), userId);
    return res.apiSuccess(result, result.liked ? '点赞成功' : '取消点赞成功');
  } catch (error) {
    logger.error('切换点赞状态失败:', error);
    return res.apiNotFound(error.message);
  }
});

/**
 * 获取用户手记统计
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getNoteStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await noteService.getUserNoteStats(userId);
  return res.apiSuccess(stats, '获取手记统计成功');
});

/**
 * 获取手记相关信息（用于编辑器）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getNoteMetadata = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 获取用户常用的标签、心情、天气、地点

  const [tags, moods, weathers, locations] = await Promise.all([
    // 常用标签
    Note.findAll({
      where: { userId, tags: { [Op.ne]: null } },
      attributes: ['tags'],
      limit: 50,
      order: [['createdAt', 'DESC']],
    }).then(notes => {
      const tagMap = {};
      notes.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      });
      return Object.entries(tagMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([tag]) => tag);
    }),

    // 常用心情
    Note.findAll({
      where: { userId, mood: { [Op.ne]: null } },
      attributes: ['mood', [Note.sequelize.fn('COUNT', '*'), 'count']],
      group: ['mood'],
      order: [[Note.sequelize.fn('COUNT', '*'), 'DESC']],
      raw: true,
    }).then(results => results.map(item => item.mood)),

    // 常用天气
    Note.findAll({
      where: { userId, weather: { [Op.ne]: null } },
      attributes: ['weather', [Note.sequelize.fn('COUNT', '*'), 'count']],
      group: ['weather'],
      order: [[Note.sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10,
      raw: true,
    }).then(results => results.map(item => item.weather)),

    // 常用地点
    Note.findAll({
      where: { userId, location: { [Op.ne]: null } },
      attributes: ['location', [Note.sequelize.fn('COUNT', '*'), 'count']],
      group: ['location'],
      order: [[Note.sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10,
      raw: true,
    }).then(results => results.map(item => item.location)),
  ]);

  return res.apiSuccess(
    {
      commonTags: tags,
      commonMoods: moods,
      commonWeathers: weathers,
      commonLocations: locations,
      moodOptions: ['开心', '平静', '思考', '感慨', '兴奋', '忧郁', '愤怒', '恐惧', '惊讶', '厌恶'],
    },
    '获取手记元数据成功'
  );
});

/**
 * 获取用户手记点赞列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUserNoteLikes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search } = req.query;

  const result = await noteService.getUserNoteLikes(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
  });

  return res.apiPaginated(result.data, result.meta.pagination, '获取手记点赞列表成功');
});

/**
 * 获取手记的年份列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getYears = asyncHandler(async (req, res) => {
  const years = await noteService.getYears();
  return res.apiSuccess(years, '获取年份列表成功');
});
