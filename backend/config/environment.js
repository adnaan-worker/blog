const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * 环境配置管理类
 */
class EnvironmentManager {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.config = {};
    this.loadEnvironmentConfig();
  }

  /**
   * 加载环境配置
   */
  loadEnvironmentConfig() {
    // 确定环境配置文件路径
    const envFile = path.join(process.cwd(), `env.${this.env}`);

    if (fs.existsSync(envFile)) {
      // 加载对应的环境配置文件
      dotenv.config({ path: envFile });
      console.log(`✅ 已加载环境配置: ${envFile}`);
    } else {
      console.warn(`⚠️  环境配置文件不存在: ${envFile}`);
      // 如果没有找到配置文件，尝试加载默认的.env文件
      dotenv.config();
    }

    // 验证并设置配置
    this.validateAndSetConfig();
  }

  /**
   * 验证并设置配置
   */
  validateAndSetConfig() {
    this.config = {
      // 基础配置
      nodeEnv: this.env,
      port: parseInt(process.env.PORT) || 8200,

      // 数据库配置
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        name: process.env.DB_NAME || 'blog_dev',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        dialect: 'mysql',
        pool: this.getDatabasePool(),
        logging: this.env === 'development' ? console.log : false,
        define: {
          underscored: true,
          underscoredAll: true,
        },
      },

      // Redis配置
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || null,
        db: parseInt(process.env.REDIS_DB) || 1,
        url: process.env.REDIS_PASSWORD
          ? `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`
          : `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
      },

      // JWT配置
      jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },

      // CORS配置
      cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
          : ['http://localhost:3000'],
      },

      // 日志配置
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs',
      },

      // 监控配置
      monitoring: {
        enabled: process.env.ENABLE_MONITORING === 'true',
      },

      // AI配置 - 统一配置格式
      ai: {
        // 当前使用的提供商
        provider: process.env.AI_PROVIDER,

        // 当前使用的模型（如果不指定，使用提供商的默认模型）
        model: process.env.AI_MODEL,

        // 统一的 API Key
        apiKey: process.env.AI_API_KEY,

        // 自定义 Base URL（可选，用于网关或自定义端点）
        baseURL: process.env.AI_BASE_URL,

        // 模型参数
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,

        // 请求配置
        timeout: parseInt(process.env.AI_TIMEOUT) || 30000, // 请求超时时间（毫秒）
        maxRetries: parseInt(process.env.AI_MAX_RETRIES) || 3, // 最大重试次数
        retryDelay: parseInt(process.env.AI_RETRY_DELAY) || 1000, // 重试延迟（毫秒）

        // 并发控制
        maxConcurrentPerUser: parseInt(process.env.AI_MAX_CONCURRENT_PER_USER) || 3, // 每用户最大并发请求数

        // 历史消息配置
        maxHistoryMessages: parseInt(process.env.AI_MAX_HISTORY_MESSAGES) || 20, // 最大历史消息数量

        // 默认 System Prompt 类型
        defaultPromptType: process.env.AI_DEFAULT_PROMPT_TYPE || 'WRITING',
      },
    };

    // 验证必需配置
    this.validateRequiredConfig();
  }

  /**
   * 获取数据库连接池配置
   */
  getDatabasePool() {
    // 从环境变量读取，或使用默认值
    const acquire = parseInt(process.env.DB_POOL_ACQUIRE) || 30000;
    const idle = parseInt(process.env.DB_POOL_IDLE) || 10000;

    // 根据环境设置连接池大小
    let max, min;
    if (process.env.DB_POOL_MAX && process.env.DB_POOL_MIN) {
      // 如果环境变量指定了，使用环境变量
      max = parseInt(process.env.DB_POOL_MAX);
      min = parseInt(process.env.DB_POOL_MIN);
    } else {
      // 否则根据环境使用默认值
      switch (this.env) {
        case 'development':
          max = 10;
          min = 0;
          break;
        case 'test':
          max = 5;
          min = 0;
          break;
        case 'production':
          max = 20;
          min = 5;
          break;
        default:
          max = 10;
          min = 0;
      }
    }

    return { acquire, idle, max, min };
  }

  /**
   * 验证必需配置
   */
  validateRequiredConfig() {
    const required = [
      { key: 'JWT_SECRET', value: this.config.jwt.secret },
      { key: 'DB_HOST', value: this.config.database.host },
      { key: 'DB_USER', value: this.config.database.user },
      { key: 'DB_PASSWORD', value: this.config.database.password },
      { key: 'DB_NAME', value: this.config.database.name },
    ];

    const missing = required.filter(item => !item.value);

    if (missing.length > 0) {
      console.error('❌ 缺少必需的环境变量:');
      missing.forEach(item => console.error(`  - ${item.key}`));
      process.exit(1);
    }
  }

  /**
   * 获取配置
   */
  get() {
    return this.config;
  }

  /**
   * 获取特定配置项
   */
  get(key) {
    return key ? this.config[key] : this.config;
  }

  /**
   * 获取当前环境
   */
  getEnvironment() {
    return this.env;
  }

  /**
   * 是否为开发环境
   */
  isDevelopment() {
    return this.env === 'development';
  }

  /**
   * 是否为测试环境
   */
  isTest() {
    return this.env === 'test';
  }

  /**
   * 是否为生产环境
   */
  isProduction() {
    return this.env === 'production';
  }

  /**
   * 打印当前配置信息
   */
  printConfig() {
    console.log(`\n🌍 当前环境: ${this.env}`);
    console.log(`🚀 服务端口: ${this.config.port}`);
    console.log(
      `🗄️  数据库: ${this.config.database.host}:${this.config.database.port}/${this.config.database.name}`
    );
    console.log(`📝 日志级别: ${this.config.logging.level}`);
    console.log(`🤖 AI提供商: ${this.config.ai.provider}`);
    console.log(`📊 监控: ${this.config.monitoring.enabled ? '启用' : '禁用'}\n`);
  }
}

// 创建单例实例
const environmentManager = new EnvironmentManager();

module.exports = environmentManager;
