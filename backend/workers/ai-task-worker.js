const { aiTaskService } = require('../services/ai-task.service');
const { logger } = require('../utils/logger');
const redisManager = require('../utils/redis');
const { AITask } = require('../models');
const Redis = require('ioredis');
const redisConfig = require('../config/redis.config');

/**
 * AI任务处理器 - 优化版
 * 使用 Redis 队列 + 事件驱动，避免频繁轮询数据库
 *
 * 架构：
 * 1. Redis BLPOP 阻塞队列（主要机制）- 零CPU占用
 * 2. 定时轮询（兜底机制）- 每5分钟检查一次遗漏任务
 * 3. 事件通知（可选）- 通过 Socket.IO 实时通知
 */
class AITaskWorker {
  constructor() {
    this.isRunning = false;
    this.pollInterval = 300000; // 5分钟轮询一次（仅作为兜底）
    this.processingTasks = new Set(); // 正在处理的任务ID
    this.maxConcurrent = 3; // 最大并发处理数
    this.queueKey = 'ai:task:queue'; // Redis 队列 key
    this.workerClients = []; // 每个 worker 的独立 Redis 客户端
  }

  /**
   * 启动任务处理器
   */
  async start() {
    if (this.isRunning) {
      logger.warn('AI任务处理器已在运行');
      return;
    }

    // 检查 Redis 连接
    if (!redisManager.isReady()) {
      logger.warn('Redis 未连接，尝试连接...');
      try {
        await redisManager.connect();
      } catch (error) {
        logger.error('Redis 连接失败，将仅使用轮询模式', { error: error.message });
      }
    }

    this.isRunning = true;
    // 静默启动（日志由 app.js 统一输出）

    // 启动 Redis 队列消费者（主要机制）
    if (redisManager.isReady()) {
      this.startQueueConsumer();
    }

    // 启动定时轮询（兜底机制）
    this.startBackupPoller();
  }

  /**
   * 停止任务处理器
   */
  async stop() {
    this.isRunning = false;

    // 清理定时器
    if (this.backupPollerTimer) {
      clearInterval(this.backupPollerTimer);
    }

    // 关闭所有 Worker 的 Redis 客户端
    for (const client of this.workerClients) {
      try {
        await client.quit();
      } catch (error) {
        // 忽略关闭错误
      }
    }
    this.workerClients = [];

    logger.info('🛑 AI任务处理器已停止');
  }

  /**
   * 启动 Redis 队列消费者（主要机制）
   * 使用 BLPOP 阻塞式获取任务，零 CPU 占用
   * 每个 Worker 使用独立的 Redis 客户端，避免连接阻塞
   */
  async startQueueConsumer() {
    // 为每个 Worker 创建独立的 Redis 客户端
    const clientPromises = [];

    for (let i = 0; i < this.maxConcurrent; i++) {
      const clientPromise = new Promise((resolve, reject) => {
        try {
          const workerClient = new Redis(redisConfig);
          this.workerClients.push(workerClient);

          // 等待客户端就绪
          workerClient.once('ready', () => {
            resolve({ workerId: i + 1, client: workerClient });
          });

          workerClient.once('error', error => {
            reject(error);
          });
        } catch (error) {
          reject(error);
        }
      });

      clientPromises.push(clientPromise);
    }

    // 等待所有客户端就绪后再启动消费者
    try {
      const clients = await Promise.all(clientPromises);
      for (const { workerId, client } of clients) {
        this.consumeQueue(workerId, client);
      }
    } catch (error) {
      logger.error('启动 Worker Redis 客户端失败:', error.message);
    }
  }

  /**
   * 队列消费协程
   * @param {number} workerId - Worker ID
   * @param {Redis} workerClient - Worker 独立的 Redis 客户端
   */
  async consumeQueue(workerId, workerClient) {
    while (this.isRunning) {
      try {
        if (!workerClient || workerClient.status !== 'ready') {
          logger.warn(`Worker ${workerId}: Redis 未就绪，等待...`);
          await this.sleep(5000);
          continue;
        }

        // BLPOP 阻塞式获取任务（超时5秒）
        // 使用独立客户端，不会阻塞其他 Redis 操作
        const result = await workerClient.blpop(this.queueKey, 5);

        if (!result) {
          // 超时，继续下一轮（这是正常情况，不记录日志）
          continue;
        }

        const [, taskId] = result; // [queueKey, taskId]

        // 检查任务是否已在处理中（避免重复处理）
        if (this.processingTasks.has(taskId)) {
          logger.warn(`Worker ${workerId}: 任务 ${taskId} 已在处理中，跳过`);
          continue;
        }

        // 标记为处理中
        this.processingTasks.add(taskId);

        logger.info(`Worker ${workerId}: 从队列获取任务 ${taskId}`);

        // 处理任务（不阻塞队列消费）
        this.processTask(taskId).finally(() => {
          // 处理完成后移除标记
          this.processingTasks.delete(taskId);
        });
      } catch (error) {
        // 忽略超时错误（这是正常的）
        if (error.message && error.message.includes('timed out')) {
          continue;
        }

        logger.error(`Worker ${workerId}: 队列消费出错`, { error: error.message });
        await this.sleep(1000); // 出错后等待1秒再继续
      }
    }

    logger.info(`Worker ${workerId}: 已停止`);
  }

  /**
   * 启动兜底轮询器（降级机制）
   * 每5分钟检查一次数据库，防止任务遗漏
   */
  startBackupPoller() {
    // 立即执行一次（处理可能遗漏的任务）
    this.processPendingTasks();

    // 定时执行（每5分钟）
    this.backupPollerTimer = setInterval(() => {
      this.processPendingTasks();
    }, this.pollInterval);
  }

  /**
   * 处理待处理任务（兜底机制）
   * 只在有遗漏任务时执行
   */
  async processPendingTasks() {
    try {
      // 只查询pending任务的数量，避免加载全部数据
      const pendingCount = await AITask.count({
        where: { status: 'pending' },
      });

      if (pendingCount === 0) {
        // 没有待处理任务，直接返回
        return;
      }

      logger.warn(`⚠️ 兜底检查：发现 ${pendingCount} 个待处理任务`);

      // 查询任务ID（只查ID，不查全部字段）
      const pendingTasks = await AITask.findAll({
        where: { status: 'pending' },
        attributes: ['taskId'],
        order: [['createdAt', 'ASC']],
        limit: 20, // 限制数量
      });

      if (redisManager.isReady()) {
        // 将任务推送到 Redis 队列
        const client = redisManager.getClient();
        const taskIds = pendingTasks.map(task => task.taskId);

        if (taskIds.length > 0) {
          await client.lpush(this.queueKey, ...taskIds);
          logger.info(`✅ 已将 ${taskIds.length} 个任务推送到队列`);
        }
      } else {
        // Redis 不可用，直接处理
        logger.warn('Redis 不可用，直接处理任务');

        for (const task of pendingTasks) {
          // 跳过已在处理的任务
          if (this.processingTasks.has(task.taskId)) {
            continue;
          }

          // 检查并发限制
          if (this.processingTasks.size >= this.maxConcurrent) {
            logger.warn(`达到最大并发数 ${this.maxConcurrent}，等待下次轮询`);
            break;
          }

          // 标记并处理
          this.processingTasks.add(task.taskId);
          this.processTask(task.taskId).finally(() => {
            this.processingTasks.delete(task.taskId);
          });
        }
      }
    } catch (error) {
      logger.error('兜底检查失败', { error: error.message });
    }
  }

  /**
   * 处理指定任务
   */
  async processTask(taskId) {
    try {
      const taskStatus = await aiTaskService.getTaskStatus(taskId);

      if (taskStatus.status !== 'pending') {
        logger.warn('任务状态不是待处理', {
          taskId,
          status: taskStatus.status,
        });
        return;
      }

      logger.info('开始处理任务', { taskId, type: taskStatus.type });

      switch (taskStatus.type) {
        case 'generate_content':
          await aiTaskService.processGenerateContentTask(taskId);
          break;

        case 'batch_generate':
          await aiTaskService.processBatchGenerateTask(taskId);
          break;

        case 'analyze':
          await aiTaskService.processAnalyzeTask(taskId);
          break;

        case 'writing_assistant':
          await aiTaskService.processWritingAssistantTask(taskId);
          break;

        default:
          logger.error('不支持的任务类型', { taskId, type: taskStatus.type });
          await aiTaskService.updateTaskStatus(taskId, 'failed', {
            error: '不支持的任务类型',
          });
      }

      logger.info('任务处理完成', { taskId, type: taskStatus.type });
    } catch (error) {
      logger.error('处理任务失败', { taskId, error: error.message });

      try {
        await aiTaskService.updateTaskStatus(taskId, 'failed', {
          error: error.message,
        });
      } catch (updateError) {
        logger.error('更新任务状态失败', {
          taskId,
          error: updateError.message,
        });
      }
    }
  }

  /**
   * 推送任务到队列（供外部调用）
   * 创建AI任务时调用此方法，立即触发处理
   */
  async enqueueTask(taskId) {
    if (!this.isRunning) {
      logger.warn('任务处理器未运行，无法推送任务');
      return false;
    }

    try {
      if (redisManager.isReady()) {
        const client = redisManager.getClient();
        await client.lpush(this.queueKey, taskId);
        logger.info(`📤 任务 ${taskId} 已推送到队列`);
        return true;
      } else {
        logger.warn('Redis 不可用，任务将在下次轮询时处理');
        return false;
      }
    } catch (error) {
      logger.error('推送任务到队列失败', { taskId, error: error.message });
      return false;
    }
  }

  /**
   * 批量推送任务到队列
   */
  async enqueueTasks(taskIds) {
    if (!this.isRunning || !Array.isArray(taskIds) || taskIds.length === 0) {
      return false;
    }

    try {
      if (redisManager.isReady()) {
        const client = redisManager.getClient();
        await client.lpush(this.queueKey, ...taskIds);
        logger.info(`📤 ${taskIds.length} 个任务已推送到队列`);
        return true;
      } else {
        logger.warn('Redis 不可用，任务将在下次轮询时处理');
        return false;
      }
    } catch (error) {
      logger.error('批量推送任务失败', { error: error.message });
      return false;
    }
  }

  /**
   * 获取队列长度
   */
  async getQueueLength() {
    try {
      if (redisManager.isReady()) {
        const client = redisManager.getClient();
        return await client.llen(this.queueKey);
      }
      return 0;
    } catch (error) {
      logger.error('获取队列长度失败', { error: error.message });
      return 0;
    }
  }

  /**
   * 清理过期任务
   */
  async cleanupExpiredTasks(days = 30) {
    try {
      const deletedCount = await aiTaskService.cleanupExpiredTasks(days);
      logger.info('清理过期任务完成', { deletedCount, days });
      return deletedCount;
    } catch (error) {
      logger.error('清理过期任务失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取处理器状态（同步）
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      mode: redisManager.isReady() ? 'Redis队列 + 轮询兜底' : '仅轮询模式',
      processingCount: this.processingTasks.size,
      maxConcurrent: this.maxConcurrent,
      redisConnected: redisManager.isReady(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取详细状态（异步，包含队列长度）
   */
  async getDetailedStatus() {
    const queueLength = await this.getQueueLength();

    return {
      ...this.getStatus(),
      queueLength,
      processingTasks: Array.from(this.processingTasks),
      pollInterval: this.pollInterval,
    };
  }
}

// 创建全局任务处理器实例
const aiTaskWorker = new AITaskWorker();

module.exports = {
  aiTaskWorker,
  AITaskWorker,
};
