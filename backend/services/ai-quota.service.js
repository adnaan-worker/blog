const { AIQuota } = require('../models');
const { logger } = require('../utils/logger');

/**
 * AI配额管理服务
 */
class AIQuotaService {
  /**
   * 获取或创建用户配额
   */
  async getOrCreateQuota(userId) {
    try {
      let quota = await AIQuota.findOne({ where: { userId } });

      if (!quota) {
        quota = await AIQuota.create({
          userId,
          dailyChatLimit: 100,
          dailyGenerateLimit: 50,
          monthlyTokenLimit: 100000,
        });
      }

      // 检查是否需要重置每日配额
      await this.checkAndResetDailyQuota(quota);

      return quota;
    } catch (error) {
      logger.error('获取用户配额失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 检查并重置每日配额
   */
  async checkAndResetDailyQuota(quota) {
    const now = new Date();
    const lastReset = new Date(quota.lastResetDate);

    // 如果上次重置日期不是今天，则重置每日配额
    if (lastReset.toDateString() !== now.toDateString()) {
      await quota.update({
        dailyChatUsed: 0,
        dailyGenerateUsed: 0,
        lastResetDate: now,
      });
    }
  }

  /**
   * 检查聊天配额
   */
  async checkChatQuota(userId) {
    try {
      const quota = await this.getOrCreateQuota(userId);

      return {
        available: quota.dailyChatUsed < quota.dailyChatLimit,
        used: quota.dailyChatUsed,
        limit: quota.dailyChatLimit,
        remaining: quota.dailyChatLimit - quota.dailyChatUsed,
      };
    } catch (error) {
      logger.error('检查聊天配额失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 检查内容生成配额
   */
  async checkGenerateQuota(userId) {
    try {
      const quota = await this.getOrCreateQuota(userId);

      return {
        available: quota.dailyGenerateUsed < quota.dailyGenerateLimit,
        used: quota.dailyGenerateUsed,
        limit: quota.dailyGenerateLimit,
        remaining: quota.dailyGenerateLimit - quota.dailyGenerateUsed,
      };
    } catch (error) {
      logger.error('检查内容生成配额失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 检查Token配额
   */
  async checkTokenQuota(userId, requiredTokens = 0) {
    try {
      const quota = await this.getOrCreateQuota(userId);

      return {
        available: quota.monthlyTokenUsed + requiredTokens <= quota.monthlyTokenLimit,
        used: quota.monthlyTokenUsed,
        limit: quota.monthlyTokenLimit,
        remaining: quota.monthlyTokenLimit - quota.monthlyTokenUsed,
        required: requiredTokens,
      };
    } catch (error) {
      logger.error('检查Token配额失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 增加聊天使用次数
   */
  async incrementChatUsage(userId) {
    try {
      const quota = await this.getOrCreateQuota(userId);
      await quota.increment('dailyChatUsed');

      logger.info('增加聊天使用次数', {
        userId,
        newUsed: quota.dailyChatUsed + 1,
      });
    } catch (error) {
      logger.error('增加聊天使用次数失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 增加内容生成使用次数
   */
  async incrementGenerateUsage(userId) {
    try {
      const quota = await this.getOrCreateQuota(userId);
      await quota.increment('dailyGenerateUsed');

      logger.info('增加内容生成使用次数', {
        userId,
        newUsed: quota.dailyGenerateUsed + 1,
      });
    } catch (error) {
      logger.error('增加内容生成使用次数失败', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 增加Token使用量
   */
  async incrementTokenUsage(userId, tokens) {
    try {
      const quota = await this.getOrCreateQuota(userId);
      await quota.increment('monthlyTokenUsed', { by: tokens });

      logger.info('增加Token使用量', {
        userId,
        tokens,
        newUsed: quota.monthlyTokenUsed + tokens,
      });
    } catch (error) {
      logger.error('增加Token使用量失败', {
        userId,
        tokens,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 重置用户配额
   */
  async resetQuota(userId) {
    try {
      const quota = await this.getOrCreateQuota(userId);
      await quota.update({
        dailyChatUsed: 0,
        dailyGenerateUsed: 0,
        monthlyTokenUsed: 0,
        lastResetDate: new Date(),
      });

      logger.info('重置用户配额', { userId });
    } catch (error) {
      logger.error('重置用户配额失败', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * 获取用户配额统计
   */
  async getQuotaStats(userId) {
    try {
      const quota = await this.getOrCreateQuota(userId);

      return {
        daily: {
          chat: {
            used: quota.dailyChatUsed,
            limit: quota.dailyChatLimit,
            remaining: quota.dailyChatLimit - quota.dailyChatUsed,
          },
          generate: {
            used: quota.dailyGenerateUsed,
            limit: quota.dailyGenerateLimit,
            remaining: quota.dailyGenerateLimit - quota.dailyGenerateUsed,
          },
        },
        monthly: {
          tokens: {
            used: quota.monthlyTokenUsed,
            limit: quota.monthlyTokenLimit,
            remaining: quota.monthlyTokenLimit - quota.monthlyTokenUsed,
          },
        },
        lastResetDate: quota.lastResetDate,
      };
    } catch (error) {
      logger.error('获取配额统计失败', { userId, error: error.message });
      throw error;
    }
  }
}

const aiQuotaService = new AIQuotaService();

module.exports = {
  aiQuotaService,
  AIQuotaService,
};
