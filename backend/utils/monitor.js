const os = require('os');
const { logger } = require('./logger');
const environment = require('@/config/environment');

const config = environment.get();

/**
 * 系统监控服务
 */
class MonitorService {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2),
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      network: {
        interfaces: Object.keys(os.networkInterfaces()),
      },
    };
  }

  /**
   * 获取应用状态
   */
  getAppStatus() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    return {
      status: 'healthy',
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / 60000),
        hours: Math.floor(uptime / 3600000),
      },
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        successRate:
          this.requestCount > 0
            ? (((this.requestCount - this.errorCount) / this.requestCount) * 100).toFixed(2)
            : 100,
      },
      performance: {
        averageResponseTime: avgResponseTime.toFixed(2),
        responseTimeHistory: this.responseTimes.slice(-10), // 最近10次响应时间
      },
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 记录请求
   */
  recordRequest(duration, isError = false) {
    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }

    this.responseTimes.push(duration);

    // 保持响应时间历史记录在合理范围内
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-50);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: this.getSystemInfo(),
      app: this.getAppStatus(),
    };

    // 检查内存使用情况
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 90) {
      health.status = 'warning';
      health.warnings = ['内存使用率过高'];
    }

    // 检查错误率
    if (this.requestCount > 0 && this.errorCount / this.requestCount > 0.1) {
      health.status = 'warning';
      health.warnings = health.warnings || [];
      health.warnings.push('错误率过高');
    }

    return health;
  }

  /**
   * 获取性能指标
   */
  getMetrics() {
    return {
      system: this.getSystemInfo(),
      application: this.getAppStatus(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 重置计数器
   */
  resetCounters() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    logger.info('监控计数器已重置');
  }
}

// 创建全局监控实例
const monitorService = new MonitorService();

/**
 * 监控中间件
 */
const monitorMiddleware = (req, res, next) => {
  const start = Date.now();

  // 记录请求开始
  res.on('finish', () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;

    monitorService.recordRequest(duration, isError);

    // 记录慢请求
    if (duration > 1000) {
      logger.warn('慢请求检测', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

/**
 * 健康检查中间件
 */
const healthCheckMiddleware = async (req, res) => {
  try {
    const health = await monitorService.healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('健康检查失败', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 指标端点中间件
 */
const metricsMiddleware = (req, res) => {
  try {
    const metrics = monitorService.getMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('获取指标失败', { error: error.message });
    res.status(500).json({
      error: '获取指标失败',
      message: error.message,
    });
  }
};

module.exports = {
  monitorService,
  monitorMiddleware,
  healthCheckMiddleware,
  metricsMiddleware,
};
