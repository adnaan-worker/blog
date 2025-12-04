// 注册路径别名（必须在最前面）
require('module-alias/register');

// 优先加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const { createServer } = require('http');

// 导入配置和工具
const environment = require('./config/environment');
const { requestLogger, errorLogger, logger } = require('./utils/logger');
const { monitorMiddleware } = require('./utils/monitor');
const { responseMiddleware } = require('./utils/response');
const { aiService } = require('./services/ai');
const { initializeQueues, shutdownQueues } = require('./queues');
const specs = require('./config/swagger.config');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { globalLimiter } = require('./middlewares/rate-limit.middleware');
const routes = require('./routes');
const socketManager = require('./utils/socket');

// 获取环境配置
const config = environment.get();

// 打印环境配置信息
environment.printConfig();

// 创建Express应用和HTTP服务器
const app = express();
const server = createServer(app);

// 配置 trust proxy（重要：用于正确识别客户端IP）
app.set('trust proxy', 1);

// 禁用X-Powered-By头部
app.disable('x-powered-by');

// 确保服务器支持WebSocket升级
server.on('upgrade', (request, socket, head) => {
  logger.info('WebSocket升级请求', {
    url: request.url,
    headers: request.headers,
  });
});

// 基础中间件配置
const setupMiddleware = () => {
  // 安全中间件
  app.use(
    helmet({
      contentSecurityPolicy: false, // 禁用CSP以允许Swagger UI正常工作
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );

  // 压缩中间件
  app.use(compression());

  // CORS 配置
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 全局速率限制（使用优化的限制器）
  app.use('/api/', globalLimiter);

  // 请求体解析
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 自定义中间件
  app.use(requestLogger);
  app.use(monitorMiddleware);
  app.use(responseMiddleware);
};

// 路由配置
const setupRoutes = () => {
  // API 路由
  app.use('/api', routes);

  // Swagger API 文档
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: `
      .swagger-ui .topbar { display: none !important; }
      .swagger-ui .info .title { color: #3b4151; }
      .swagger-ui .scheme-container { background: #f7f7f7; }
    `,
      customSiteTitle: '博客系统 API 文档',
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
        // 确保Swagger UI使用正确的URL
        url: '/api-docs/swagger.json',
        // 禁用HTTPS重定向
        validatorUrl: null,
        // 强制使用HTTP协议
        schemes: ['http'],
      },
    })
  );

  // 添加Swagger JSON端点
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(specs);
  });

  // 提供Swagger UI的静态资源
  const swaggerStaticPath = path.join(__dirname, 'node_modules', 'swagger-ui-dist');
  app.use('/api-docs', express.static(swaggerStaticPath));

  // 提供上传文件的静态资源服务
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // 根路由
  app.get('/', (req, res) => {
    res.json({
      message: '欢迎使用博客API服务',
      version: '1.0.0',
      author: 'adnaan',
      documentation: '/api-docs',
      health: '/api/system/health',
      info: '/api/system/info',
    });
  });

  // 404处理
  app.use(notFound);
};

// 错误处理配置
const setupErrorHandling = () => {
  app.use(errorLogger);
  app.use(errorHandler);
};

// 服务器启动
const startServer = async () => {
  const PORT = config.port;

  console.log('\n========================================');
  console.log('🚀 正在启动服务...');
  console.log('========================================\n');

  try {
    await aiService.initialize();
    console.log('✅ AI 服务初始化成功');
  } catch (error) {
    console.log('❌ AI 服务初始化失败:', error.message);
  }

  // 2. 初始化 Socket.IO
  socketManager.initialize(server);
  console.log('✅ Socket.IO 服务已启动');

  // 3. 配置服务器超时
  server.timeout = 30000; // 30秒超时
  server.keepAliveTimeout = 65000; // Keep-alive超时
  server.headersTimeout = 66000; // Headers超时

  // 4. 启动HTTP服务器
  server.listen(PORT, async () => {
    // 5. 启动队列系统
    try {
      await initializeQueues();
      console.log('✅ 队列系统启动成功');
    } catch (error) {
      console.log('❌ 队列系统启动失败:', error.message);
    }
    console.log('\n========================================');
    console.log('✅ 服务器启动完成');
    console.log('========================================\n');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
    console.log(`💚 健康检查: http://localhost:${PORT}/api/system/health`);
    console.log(`📊 系统监控: http://localhost:${PORT}/status`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`🤖 AI服务: ${aiService.isAvailable() ? '✅ 可用' : '❌ 不可用'}`);
    console.log(`🔄 队列系统: ✅ 运行中`);
    console.log('\n========================================\n');
  });
};

// 应用配置
setupMiddleware();
setupRoutes();
setupErrorHandling();

// 启动服务器
startServer();

// 优雅关闭处理
async function gracefulShutdown(signal) {
  logger.info(`\n========================================`);
  logger.info(`收到 ${signal} 信号，开始优雅关闭...`);
  logger.info(`========================================\n`);

  try {
    // 1. 停止接受新连接
    logger.info('1️⃣ 关闭 HTTP 服务器...');
    await new Promise(resolve => {
      server.close(() => {
        logger.info('✅ HTTP 服务器已关闭');
        resolve();
      });
    });

    // 2. 关闭 Socket.IO
    logger.info('2️⃣ 关闭 Socket.IO 服务...');
    await socketManager.shutdown();

    // 3. 关闭队列系统
    logger.info('3️⃣ 关闭队列系统...');
    await shutdownQueues();
    logger.info('✅ 队列系统已关闭');

    // 4. 关闭数据库连接
    logger.info('4️⃣ 关闭数据库连接...');
    const { sequelize } = require('./config/db.config');
    await sequelize.close();
    logger.info('✅ 数据库连接已关闭');

    // 5. 关闭 Redis
    logger.info('5️⃣ 关闭 Redis 连接...');
    const redisManager = require('./utils/redis');
    await redisManager.disconnect();
    logger.info('✅ Redis 连接已关闭');

    logger.info('\n========================================');
    logger.info('✅ 优雅关闭完成');
    logger.info('========================================\n');
    process.exit(0);
  } catch (error) {
    logger.error('❌ 优雅关闭失败:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 捕获未处理的异常
process.on('uncaughtException', error => {
  logger.error('❌ 未捕获的异常:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ 未处理的 Promise 拒绝:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
