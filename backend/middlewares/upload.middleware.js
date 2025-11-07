const multer = require('multer');
const { uploadUtil } = require('../utils/upload');

/**
 * 文件上传错误处理中间件
 */
class UploadMiddleware {
  /**
   * 处理multer错误
   * @param {Error} error 错误对象
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @param {Function} next 下一个中间件
   */
  static handleMulterError(error, req, res, next) {
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return res.apiError('文件大小超过限制', 400);
        case 'LIMIT_FILE_COUNT':
          return res.apiError('文件数量超过限制', 400);
        case 'LIMIT_FIELD_KEY':
          return res.apiError('字段名过长', 400);
        case 'LIMIT_FIELD_VALUE':
          return res.apiError('字段值过长', 400);
        case 'LIMIT_FIELD_COUNT':
          return res.apiError('字段数量超过限制', 400);
        case 'LIMIT_UNEXPECTED_FILE':
          return res.apiError('意外的文件字段', 400);
        default:
          return res.apiError('文件上传失败', 400);
      }
    }

    // 处理其他类型的错误
    if (error.message) {
      return res.apiError(error.message, 400);
    }

    return res.apiError('文件上传失败', 400);
  }

  /**
   * 验证文件数量
   * @param {number} maxCount 最大文件数量
   * @returns {Function} 中间件函数
   */
  static validateFileCount(maxCount = 1) {
    return (req, res, next) => {
      if (req.files && req.files.length > maxCount) {
        return res.apiError(`最多只能上传 ${maxCount} 个文件`, 400);
      }
      next();
    };
  }

  /**
   * 验证文件字段
   * @param {Array} requiredFields 必需的文件字段
   * @returns {Function} 中间件函数
   */
  static validateFileFields(requiredFields = []) {
    return (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return res.apiError('请选择要上传的文件', 400);
      }

      for (const field of requiredFields) {
        if (!req.files.find(file => file.fieldname === field)) {
          return res.apiError(`缺少必需的文件字段: ${field}`, 400);
        }
      }

      next();
    };
  }

  /**
   * 清理上传失败的文件
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @param {Function} next 下一个中间件
   */
  static cleanupOnError(req, res, next) {
    // 保存原始的send方法
    const originalSend = res.send;

    // 重写send方法，在发送响应后清理文件
    res.send = function (data) {
      // 如果响应状态码表示错误，清理上传的文件
      if (res.statusCode >= 400 && req.files) {
        req.files.forEach(file => {
          uploadUtil.deleteFile(file.path).catch(err => {
            console.error('清理上传失败的文件时出错:', err);
          });
        });
      }

      // 调用原始的send方法
      originalSend.call(this, data);
    };

    next();
  }

  /**
   * 文件上传成功后的处理
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @param {Function} next 下一个中间件
   */
  static processUploadedFiles(req, res, next) {
    if (req.files && req.files.length > 0) {
      // 为每个文件添加额外的信息
      req.files.forEach(file => {
        // 添加相对路径
        file.relativePath = file.path.replace(/^uploads\//, '');

        // 添加访问URL
        file.url = `/uploads/${file.relativePath}`;

        // 添加文件大小（MB）
        file.sizeMB = (file.size / (1024 * 1024)).toFixed(2);

        // 添加文件类型信息
        file.isImage = file.mimetype.startsWith('image/');
        file.isDocument =
          file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/');
      });
    }

    next();
  }

  /**
   * 创建完整的文件上传中间件链
   * @param {Object} uploader 上传器对象
   * @param {Object} options 选项
   * @returns {Array} 中间件数组
   */
  static createUploadChain(uploader, options = {}) {
    const {
      maxCount = 1,
      requiredFields = [],
      enableCleanup = true,
      enableProcessing = true,
    } = options;

    // 确定字段名：如果有必需字段，使用第一个；否则使用默认的 "files"
    const fieldName = requiredFields.length > 0 ? requiredFields[0] : 'files';

    const middlewareChain = [
      // 文件上传中间件
      uploader.upload.array(fieldName, maxCount),

      // 错误处理
      UploadMiddleware.handleMulterError,

      // 文件数量验证
      UploadMiddleware.validateFileCount(maxCount),

      // 文件字段验证
      ...(requiredFields.length > 0 ? [UploadMiddleware.validateFileFields(requiredFields)] : []),

      // 文件处理
      ...(enableProcessing ? [UploadMiddleware.processUploadedFiles] : []),

      // 错误清理
      ...(enableCleanup ? [UploadMiddleware.cleanupOnError] : []),
    ];

    return middlewareChain;
  }
}

module.exports = UploadMiddleware;
