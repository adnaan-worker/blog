/**
 * 并发控制器
 * 限制每个用户的并发请求数量
 */
class ConcurrencyLimiter {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 5; // 每用户最大并发数
    this.queueSize = options.queueSize || 10; // 队列最大长度
    this.running = new Map(); // userId -> count
    this.queues = new Map(); // userId -> queue[]
    this.timeout = options.timeout || 60000; // 请求超时时间 60秒
  }

  /**
   * 获取用户当前并发数
   */
  getRunningCount(userId) {
    return this.running.get(userId) || 0;
  }

  /**
   * 获取用户队列长度
   */
  getQueueLength(userId) {
    const queue = this.queues.get(userId);
    return queue ? queue.length : 0;
  }

  /**
   * 尝试获取执行权限
   */
  async acquire(userId) {
    const runningCount = this.getRunningCount(userId);

    // 检查是否超过并发限制
    if (runningCount >= this.maxConcurrent) {
      const queueLength = this.getQueueLength(userId);

      // 检查队列是否已满
      if (queueLength >= this.queueSize) {
        throw new Error(`并发请求过多，队列已满 (${this.queueSize})，请稍后重试`);
      }

      // 加入等待队列
      return new Promise((resolve, reject) => {
        if (!this.queues.has(userId)) {
          this.queues.set(userId, []);
        }

        const queue = this.queues.get(userId);

        // 设置超时
        const timeoutId = setTimeout(() => {
          // 从队列中移除
          const index = queue.findIndex(item => item.timeoutId === timeoutId);
          if (index !== -1) {
            queue.splice(index, 1);
          }
          reject(new Error('请求超时，请重试'));
        }, this.timeout);

        queue.push({ resolve, reject, timeoutId });
      });
    }

    // 直接执行
    this.running.set(userId, runningCount + 1);
    return Promise.resolve();
  }

  /**
   * 释放执行权限
   */
  release(userId) {
    const runningCount = this.getRunningCount(userId);
    this.running.set(userId, Math.max(0, runningCount - 1));

    // 检查是否有等待的请求
    const queue = this.queues.get(userId);
    if (queue && queue.length > 0) {
      const { resolve, timeoutId } = queue.shift();

      // 清除超时定时器
      clearTimeout(timeoutId);

      // 增加运行计数
      this.running.set(userId, this.getRunningCount(userId) + 1);

      // 允许下一个请求执行
      resolve();
    }

    // 清理空队列
    if (queue && queue.length === 0) {
      this.queues.delete(userId);
    }

    // 清理计数为0的用户
    if (this.getRunningCount(userId) === 0) {
      this.running.delete(userId);
    }
  }

  /**
   * 包装异步函数，自动管理并发
   */
  wrap(userId, fn) {
    return async (...args) => {
      await this.acquire(userId);
      try {
        return await fn(...args);
      } finally {
        this.release(userId);
      }
    };
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalRunning: Array.from(this.running.values()).reduce((sum, count) => sum + count, 0),
      totalQueued: Array.from(this.queues.values()).reduce((sum, queue) => sum + queue.length, 0),
      users: this.running.size,
      details: Array.from(this.running.entries()).map(([userId, count]) => ({
        userId,
        running: count,
        queued: this.getQueueLength(userId),
      })),
    };
  }

  /**
   * 清理所有等待的请求
   */
  clear(userId) {
    if (userId) {
      // 清理特定用户
      const queue = this.queues.get(userId);
      if (queue) {
        queue.forEach(({ reject, timeoutId }) => {
          clearTimeout(timeoutId);
          reject(new Error('请求已取消'));
        });
        this.queues.delete(userId);
      }
      this.running.delete(userId);
    } else {
      // 清理所有用户
      this.queues.forEach(queue => {
        queue.forEach(({ reject, timeoutId }) => {
          clearTimeout(timeoutId);
          reject(new Error('服务重启，请求已取消'));
        });
      });
      this.queues.clear();
      this.running.clear();
    }
  }
}

module.exports = ConcurrencyLimiter;
