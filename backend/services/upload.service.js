const path = require('path');
const fs = require('fs');
const { uploadUtil, UploadPresets } = require('../utils/upload');
const { success, error } = require('../utils/response');

/**
 * 文件上传服务类
 */
class UploadService {
  constructor() {
    this.uploaders = new Map();
    this.initializeUploaders();
  }

  /**
   * 初始化上传器
   */
  initializeUploaders() {
    // 初始化各种类型的上传器
    this.uploaders.set('avatar', uploadUtil.createUploader(UploadPresets.AVATAR));
    this.uploaders.set('article', uploadUtil.createUploader(UploadPresets.ARTICLE_IMAGE));
    this.uploaders.set('editor', uploadUtil.createUploader(UploadPresets.ARTICLE_IMAGE)); // 编辑器图片，使用文章图片预设
    this.uploaders.set('document', uploadUtil.createUploader(UploadPresets.DOCUMENT));
    this.uploaders.set('general', uploadUtil.createUploader(UploadPresets.GENERAL));
  }

  /**
   * 获取上传器
   * @param {string} type 上传器类型
   * @returns {Object} 上传器对象
   */
  getUploader(type = 'general') {
    if (!this.uploaders.has(type)) {
      throw new Error(`不支持的上传器类型: ${type}`);
    }
    return this.uploaders.get(type);
  }

  /**
   * 创建自定义上传器
   * @param {Object} config 配置
   * @returns {Object} 上传器对象
   */
  createCustomUploader(config) {
    return uploadUtil.createUploader(config);
  }

  /**
   * 上传头像
   * @param {Object} file 文件对象
   * @param {Object} user 用户对象
   * @returns {Promise<Object>} 上传结果
   */
  async uploadAvatar(file, user) {
    try {
      const uploader = this.getUploader('avatar');

      // 验证文件
      if (!this.validateFile(file, UploadPresets.AVATAR)) {
        throw new Error('头像文件验证失败');
      }

      // 生成文件信息
      const fileInfo = this.generateFileInfo(file, user);

      return success(fileInfo, '头像上传成功');
    } catch (error) {
      // 清理上传的文件
      if (file && file.path) {
        await uploadUtil.deleteFile(file.path);
      }
      throw error;
    }
  }

  /**
   * 上传文章图片
   * @param {Array} files 文件数组
   * @param {Object} article 文章对象
   * @returns {Promise<Object>} 上传结果
   */
  async uploadArticleImages(files, article) {
    try {
      const uploader = this.getUploader('article');
      const uploadedFiles = [];

      for (const file of files) {
        // 验证文件
        if (!this.validateFile(file, UploadPresets.ARTICLE_IMAGE)) {
          throw new Error(`文件 ${file.originalname} 验证失败`);
        }

        // 生成文件信息
        const fileInfo = this.generateFileInfo(file, {
          type: 'article',
          articleId: article?.id,
        });

        uploadedFiles.push(fileInfo);
      }

      return success({
        message: '文章图片上传成功',
        data: uploadedFiles,
      });
    } catch (error) {
      // 清理上传的文件
      for (const file of files) {
        if (file && file.path) {
          await uploadUtil.deleteFile(file.path);
        }
      }
      throw error;
    }
  }

  /**
   * 上传文档
   * @param {Object} file 文件对象
   * @param {Object} options 选项
   * @returns {Promise<Object>} 上传结果
   */
  async uploadDocument(file, options = {}) {
    try {
      const uploader = this.getUploader('document');

      // 验证文件
      if (!this.validateFile(file, UploadPresets.DOCUMENT)) {
        throw new Error('文档文件验证失败');
      }

      // 生成文件信息
      const fileInfo = this.generateFileInfo(file, {
        type: 'document',
        ...options,
      });

      return success({
        message: '文档上传成功',
        data: fileInfo,
      });
    } catch (error) {
      // 清理上传的文件
      if (file && file.path) {
        await uploadUtil.deleteFile(file.path);
      }
      throw error;
    }
  }

  /**
   * 批量上传文件
   * @param {Array} files 文件数组
   * @param {Object} options 选项
   * @returns {Promise<Object>} 上传结果
   */
  async batchUpload(files, options = {}) {
    try {
      const { type = 'general', maxCount = 10 } = options;

      if (files.length > maxCount) {
        throw new Error(`最多只能上传 ${maxCount} 个文件`);
      }

      const uploader = this.getUploader(type);
      const uploadedFiles = [];

      for (const file of files) {
        // 验证文件
        if (!this.validateFile(file, uploader.config)) {
          throw new Error(`文件 ${file.originalname} 验证失败`);
        }

        // 生成文件信息
        const fileInfo = this.generateFileInfo(file, { type, ...options });
        uploadedFiles.push(fileInfo);
      }

      return success({
        message: '批量上传成功',
        data: uploadedFiles,
      });
    } catch (error) {
      // 清理上传的文件
      for (const file of files) {
        if (file && file.path) {
          await uploadUtil.deleteFile(file.path);
        }
      }
      throw error;
    }
  }

  /**
   * 验证文件
   * @param {Object} file 文件对象
   * @param {Object} config 配置
   * @returns {boolean} 是否有效
   */
  validateFile(file, config) {
    if (!file) return false;

    // 检查文件大小
    if (file.size > config.maxFileSize) {
      return false;
    }

    // 检查文件类型
    if (!config.allowedTypes.includes('*/*') && !config.allowedTypes.includes(file.mimetype)) {
      return false;
    }

    // 检查文件扩展名
    if (!config.allowedExtensions.includes('*')) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!config.allowedExtensions.includes(ext)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 生成文件信息
   * @param {Object} file 文件对象
   * @param {Object} metadata 元数据
   * @returns {Object} 文件信息
   */
  generateFileInfo(file, metadata = {}) {
    // 统一路径分隔符为正斜杠（兼容 Windows 和 Unix）
    const normalizedPath = file.path.replace(/\\/g, '/');
    const relativePath = normalizedPath.replace(/^uploads\//, '');

    return {
      id: this.generateFileId(),
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      relativePath,
      url: `/uploads/${relativePath}`,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      isImage: file.mimetype.startsWith('image/'),
      isDocument: file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/'),
      uploadedAt: new Date(),
      metadata,
    };
  }

  /**
   * 生成文件ID
   * @returns {string} 文件ID
   */
  generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 删除文件
   * @param {string} filePath 文件路径
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteFile(filePath) {
    try {
      const result = await uploadUtil.deleteFile(filePath);

      if (result) {
        // 这里可以添加删除数据库记录的逻辑
        // await this.deleteFileRecord(filePath);
      }

      return result;
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
    return uploadUtil.getFileInfo(filePath);
  }

  /**
   * 清理临时文件
   * @param {string} dirPath 目录路径
   * @param {number} maxAge 最大年龄（毫秒）
   */
  async cleanupTempFiles(dirPath, maxAge = 24 * 60 * 60 * 1000) {
    return await uploadUtil.cleanupTempFiles(dirPath, maxAge);
  }

  /**
   * 获取上传统计信息
   * @param {string} uploadDir 上传目录
   * @returns {Object} 统计信息
   */
  getUploadStats(uploadDir = 'uploads') {
    try {
      if (!fs.existsSync(uploadDir)) {
        return {
          totalFiles: 0,
          totalSize: 0,
          totalSizeMB: 0,
          directories: [],
        };
      }

      let totalFiles = 0;
      let totalSize = 0;
      const directories = [];

      const scanDirectory = dir => {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = fs.statSync(itemPath);

          if (stats.isDirectory()) {
            directories.push(itemPath);
            scanDirectory(itemPath);
          } else if (stats.isFile()) {
            totalFiles++;
            totalSize += stats.size;
          }
        }
      };

      scanDirectory(uploadDir);

      return {
        totalFiles,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        directories: directories.map(dir => dir.replace(uploadDir, '').replace(/^[\\/]/, '')),
      };
    } catch (error) {
      console.error('获取上传统计信息失败:', error);
      return null;
    }
  }
}

// 创建服务实例
const uploadService = new UploadService();

module.exports = {
  UploadService,
  uploadService,
};
