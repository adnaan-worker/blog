const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * 文件上传配置类
 */
class UploadConfig {
  constructor() {
    this.defaultConfig = {
      // 默认上传目录
      uploadDir: 'uploads',
      // 默认文件大小限制 (5MB)
      maxFileSize: 5 * 1024 * 1024,
      // 默认允许的文件类型
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      // 默认文件扩展名
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
      // 是否保留原始文件名
      preserveOriginalName: false,
      // 文件名生成策略: 'hash', 'timestamp', 'original'
      filenameStrategy: 'hash',
      // 是否创建子目录
      createSubdirs: true,
      // 子目录命名策略: 'date', 'type', 'user'
      subdirStrategy: 'date',
    };
  }

  /**
   * 获取配置
   * @param {Object} customConfig 自定义配置
   * @returns {Object} 合并后的配置
   */
  getConfig(customConfig = {}) {
    return { ...this.defaultConfig, ...customConfig };
  }

  /**
   * 验证文件类型
   * @param {string} mimetype MIME类型
   * @param {Array} allowedTypes 允许的类型
   * @returns {boolean} 是否允许
   */
  validateMimeType(mimetype, allowedTypes) {
    // 支持通配符 */*
    if (allowedTypes.includes('*/*')) {
      return true;
    }
    return allowedTypes.includes(mimetype);
  }

  /**
   * 验证文件扩展名
   * @param {string} filename 文件名
   * @param {Array} allowedExtensions 允许的扩展名
   * @returns {boolean} 是否允许
   */
  validateExtension(filename, allowedExtensions) {
    // 支持通配符 *
    if (allowedExtensions.includes('*')) {
      return true;
    }
    const ext = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  /**
   * 生成文件名
   * @param {string} originalname 原始文件名
   * @param {string} strategy 策略
   * @returns {string} 新文件名
   */
  generateFilename(originalname, strategy = 'hash') {
    const ext = path.extname(originalname);

    switch (strategy) {
      case 'hash':
        const hash = crypto
          .createHash('md5')
          .update(originalname + Date.now())
          .digest('hex');
        return `${hash}${ext}`;
      case 'timestamp':
        const timestamp = Date.now();
        return `${timestamp}${ext}`;
      case 'original':
        return originalname;
      default:
        const hash2 = crypto
          .createHash('md5')
          .update(originalname + Date.now())
          .digest('hex');
        return `${hash2}${ext}`;
    }
  }

  /**
   * 生成子目录路径
   * @param {string} strategy 策略
   * @param {Object} options 选项
   * @returns {string} 子目录路径
   */
  generateSubdir(strategy = 'date', options = {}) {
    switch (strategy) {
      case 'date':
        const now = new Date();
        return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
      case 'type':
        return options.fileType || 'files';
      case 'user':
        return options.userId ? `users/${options.userId}` : 'users';
      default:
        return '';
    }
  }
}

/**
 * 文件上传工具类
 */
class UploadUtil {
  constructor() {
    this.config = new UploadConfig();
    this.uploaders = new Map();
  }

  /**
   * 创建上传中间件
   * @param {Object} options 配置选项
   * @returns {Object} multer中间件和配置信息
   */
  createUploader(options = {}) {
    const config = this.config.getConfig(options);
    const uploaderKey = this.generateUploaderKey(config);

    // 如果已存在相同的上传器，直接返回
    if (this.uploaders.has(uploaderKey)) {
      return this.uploaders.get(uploaderKey);
    }

    // 创建存储配置
    const storage = this.createStorage(config);

    // 创建文件过滤器
    const fileFilter = this.createFileFilter(config);

    // 创建multer实例
    const upload = multer({
      storage,
      limits: {
        fileSize: config.maxFileSize,
      },
      fileFilter,
    });

    const uploader = {
      upload,
      config,
      uploaderKey,
    };

    // 缓存上传器
    this.uploaders.set(uploaderKey, uploader);

    return uploader;
  }

  /**
   * 创建存储配置
   * @param {Object} config 配置
   * @returns {Object} multer存储配置
   */
  createStorage(config) {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const subdir = config.createSubdirs
          ? this.config.generateSubdir(config.subdirStrategy, {
              fileType: path.dirname(file.fieldname),
              userId: req.user?.id,
            })
          : '';

        const uploadPath = path.join(config.uploadDir, subdir);

        // 确保目录存在
        this.ensureDirectoryExists(uploadPath);

        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        let filename;

        if (config.preserveOriginalName) {
          filename = file.originalname;
        } else {
          filename = this.config.generateFilename(file.originalname, config.filenameStrategy);
        }

        cb(null, filename);
      },
    });
  }

  /**
   * 创建文件过滤器
   * @param {Object} config 配置
   * @returns {Function} 文件过滤函数
   */
  createFileFilter(config) {
    return (req, file, cb) => {
      // 验证MIME类型
      if (!this.config.validateMimeType(file.mimetype, config.allowedTypes)) {
        return cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
      }

      // 验证文件扩展名
      if (!this.config.validateExtension(file.originalname, config.allowedExtensions)) {
        return cb(new Error(`不支持的文件扩展名: ${path.extname(file.originalname)}`), false);
      }

      cb(null, true);
    };
  }

  /**
   * 确保目录存在
   * @param {string} dirPath 目录路径
   */
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 生成上传器键
   * @param {Object} config 配置
   * @returns {string} 上传器键
   */
  generateUploaderKey(config) {
    const key = JSON.stringify({
      uploadDir: config.uploadDir,
      maxFileSize: config.maxFileSize,
      allowedTypes: config.allowedTypes,
      allowedExtensions: config.allowedExtensions,
      preserveOriginalName: config.preserveOriginalName,
      filenameStrategy: config.filenameStrategy,
      createSubdirs: config.createSubdirs,
      subdirStrategy: config.subdirStrategy,
    });

    return crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * 删除文件
   * @param {string} filePath 文件路径
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 获取文件信息
   * @param {string} filePath 文件路径
   * @returns {Object|null} 文件信息
   */
  getFileInfo(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      return {
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }

  /**
   * 清理临时文件
   * @param {string} dirPath 目录路径
   * @param {number} maxAge 最大年龄（毫秒）
   */
  async cleanupTempFiles(dirPath, maxAge = 24 * 60 * 60 * 1000) {
    try {
      if (!fs.existsSync(dirPath)) {
        return;
      }

      const files = fs.readdirSync(dirPath);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}

/**
 * 预定义的上传配置
 */
const UploadPresets = {
  // 头像上传配置
  AVATAR: {
    uploadDir: 'uploads/avatars',
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
    filenameStrategy: 'hash',
    createSubdirs: true,
    subdirStrategy: 'date',
  },

  // 文章图片上传配置
  ARTICLE_IMAGE: {
    uploadDir: 'uploads/articles',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    filenameStrategy: 'hash',
    createSubdirs: true,
    subdirStrategy: 'date',
  },

  // 文档上传配置
  DOCUMENT: {
    uploadDir: 'uploads/documents',
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
    filenameStrategy: 'hash',
    createSubdirs: true,
    subdirStrategy: 'type',
  },

  // 通用文件上传配置
  GENERAL: {
    uploadDir: 'uploads/general',
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['*/*'],
    allowedExtensions: ['*'],
    filenameStrategy: 'hash',
    createSubdirs: true,
    subdirStrategy: 'date',
  },
};

// 创建实例
const uploadUtil = new UploadUtil();

module.exports = {
  UploadUtil,
  UploadConfig,
  UploadPresets,
  uploadUtil,
};
