/**
 * 统一响应格式工具
 * 提供标准化的API响应格式，包括成功响应、错误响应、分页响应等
 */

const { logger } = require('./logger');

/**
 * 基础响应类
 */
class BaseResponse {
  constructor(success, code, message, data = null, meta = {}) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
    this.meta = {
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  /**
   * 转换为JSON对象
   */
  toJSON() {
    return {
      success: this.success,
      code: this.code,
      message: this.message,
      data: this.data,
      meta: this.meta,
    };
  }
}

/**
 * 成功响应类
 */
class SuccessResponse extends BaseResponse {
  constructor(data = null, message = '操作成功', code = 200, meta = {}) {
    super(true, code, message, data, meta);
  }
}

/**
 * 错误响应类
 */
class ErrorResponse extends BaseResponse {
  constructor(message = '操作失败', code = 500, errors = null, meta = {}) {
    super(false, code, message, null, meta);
    if (errors) {
      this.errors = errors;
    }
  }

  toJSON() {
    const json = super.toJSON();
    if (this.errors) {
      json.errors = this.errors;
    }
    return json;
  }
}

/**
 * 分页响应类
 */
class PaginatedResponse extends SuccessResponse {
  constructor(data, pagination, message = '获取数据成功', code = 200, meta = {}) {
    super(data, message, code, {
      ...meta,
      pagination,
    });
  }
}

/**
 * 创建成功响应
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} code - 响应状态码
 * @param {Object} meta - 元数据
 * @returns {SuccessResponse}
 */
const success = (data = null, message = '操作成功', code = 200, meta = {}) => {
  return new SuccessResponse(data, message, code, meta);
};

/**
 * 创建错误响应
 * @param {string} message - 错误消息
 * @param {number} code - 错误状态码
 * @param {Array} errors - 详细错误信息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const error = (message = '操作失败', code = 500, errors = null, meta = {}) => {
  return new ErrorResponse(message, code, errors, meta);
};

/**
 * 创建分页响应
 * @param {Array} data - 数据列表
 * @param {Object} pagination - 分页信息
 * @param {string} message - 响应消息
 * @param {number} code - 响应状态码
 * @param {Object} meta - 元数据
 * @returns {PaginatedResponse}
 */
const paginated = (data, pagination, message = '获取数据成功', code = 200, meta = {}) => {
  return new PaginatedResponse(data, pagination, message, code, meta);
};

/**
 * 创建列表响应
 * @param {Array} data - 数据列表
 * @param {string} message - 响应消息
 * @param {number} code - 响应状态码
 * @param {Object} meta - 元数据
 * @returns {SuccessResponse}
 */
const list = (data = [], message = '获取列表成功', code = 200, meta = {}) => {
  return new SuccessResponse(data, message, code, {
    ...meta,
    count: data.length,
  });
};

/**
 * 创建单个对象响应
 * @param {Object} data - 单个对象数据
 * @param {string} message - 响应消息
 * @param {number} code - 响应状态码
 * @param {Object} meta - 元数据
 * @returns {SuccessResponse}
 */
const item = (data, message = '获取数据成功', code = 200, meta = {}) => {
  return new SuccessResponse(data, message, code, meta);
};

/**
 * 创建创建成功响应
 * @param {Object} data - 创建的数据
 * @param {string} message - 响应消息
 * @param {Object} meta - 元数据
 * @returns {SuccessResponse}
 */
const created = (data, message = '创建成功', meta = {}) => {
  return new SuccessResponse(data, message, 201, meta);
};

/**
 * 创建更新成功响应
 * @param {Object} data - 更新的数据
 * @param {string} message - 响应消息
 * @param {Object} meta - 元数据
 * @returns {SuccessResponse}
 */
const updated = (data, message = '更新成功', meta = {}) => {
  return new SuccessResponse(data, message, 200, meta);
};

/**
 * 创建删除成功响应
 * @param {string} message - 响应消息
 * @param {Object} meta - 元数据
 * @returns {SuccessResponse}
 */
const deleted = (message = '删除成功', meta = {}) => {
  return new SuccessResponse(null, message, 200, meta);
};

/**
 * 创建验证错误响应
 * @param {Array} errors - 验证错误列表
 * @param {string} message - 错误消息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const validationError = (errors, message = '数据验证失败', meta = {}) => {
  return new ErrorResponse(message, 400, errors, meta);
};

/**
 * 创建未授权错误响应
 * @param {string} message - 错误消息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const unauthorized = (message = '未授权访问', meta = {}) => {
  return new ErrorResponse(message, 401, null, meta);
};

/**
 * 创建禁止访问错误响应
 * @param {string} message - 错误消息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const forbidden = (message = '禁止访问', meta = {}) => {
  return new ErrorResponse(message, 403, null, meta);
};

/**
 * 创建未找到错误响应
 * @param {string} message - 错误消息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const notFound = (message = '资源未找到', meta = {}) => {
  return new ErrorResponse(message, 404, null, meta);
};

/**
 * 创建冲突错误响应
 * @param {string} message - 错误消息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const conflict = (message = '资源冲突', meta = {}) => {
  return new ErrorResponse(message, 409, null, meta);
};

/**
 * 创建服务器错误响应
 * @param {string} message - 错误消息
 * @param {Object} meta - 元数据
 * @returns {ErrorResponse}
 */
const serverError = (message = '服务器内部错误', meta = {}) => {
  return new ErrorResponse(message, 500, null, meta);
};

/**
 * 创建分页信息
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 * @param {number} total - 总数量
 * @param {number} totalPages - 总页数
 * @returns {Object}
 */
const createPagination = (page, limit, total, totalPages) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * 响应中间件 - 统一处理响应格式
 */
const responseMiddleware = (req, res, next) => {
  // 扩展 res 对象，添加响应方法
  res.apiSuccess = (data, message, code, meta) => {
    const response = success(data, message, code, meta);
    return res.status(code || 200).json(response.toJSON());
  };

  res.apiError = (message, code, errors, meta) => {
    const response = error(message, code, errors, meta);
    return res.status(code || 500).json(response.toJSON());
  };

  res.apiPaginated = (data, pagination, message, code, meta) => {
    const response = paginated(data, pagination, message, code, meta);
    return res.status(code || 200).json(response.toJSON());
  };

  res.apiList = (data, message, code, meta) => {
    const response = list(data, message, code, meta);
    return res.status(code || 200).json(response.toJSON());
  };

  res.apiItem = (data, message, code, meta) => {
    const response = item(data, message, code, meta);
    return res.status(code || 200).json(response.toJSON());
  };

  res.apiCreated = (data, message, meta) => {
    const response = created(data, message, meta);
    return res.status(201).json(response.toJSON());
  };

  res.apiUpdated = (data, message, meta) => {
    const response = updated(data, message, meta);
    return res.status(200).json(response.toJSON());
  };

  res.apiDeleted = (message, meta) => {
    const response = deleted(message, meta);
    return res.status(200).json(response.toJSON());
  };

  res.apiValidationError = (errors, message, meta) => {
    const response = validationError(errors, message, meta);
    return res.status(400).json(response.toJSON());
  };

  res.apiUnauthorized = (message, meta) => {
    const response = unauthorized(message, meta);
    return res.status(401).json(response.toJSON());
  };

  res.apiForbidden = (message, meta) => {
    const response = forbidden(message, meta);
    return res.status(403).json(response.toJSON());
  };

  res.apiNotFound = (message, meta) => {
    const response = notFound(message, meta);
    return res.status(404).json(response.toJSON());
  };

  res.apiConflict = (message, meta) => {
    const response = conflict(message, meta);
    return res.status(409).json(response.toJSON());
  };

  res.apiServerError = (message, meta) => {
    const response = serverError(message, meta);
    return res.status(500).json(response.toJSON());
  };

  next();
};

/**
 * 异步错误处理包装器
 * @param {Function} fn - 异步函数
 * @returns {Function}
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  // 响应类
  BaseResponse,
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,

  // 响应方法
  success,
  error,
  paginated,
  list,
  item,
  created,
  updated,
  deleted,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,

  // 工具方法
  createPagination,
  responseMiddleware,
  asyncHandler,
};
