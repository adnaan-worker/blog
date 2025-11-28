const { AIChat } = require('@/models');
const { logger } = require('@/utils/logger');

/**
 * AI 聊天记录服务
 * 管理聊天历史、会话上下文
 */
class ChatHistoryService {
  /**
   * 保存聊天消息
   */
  async saveMessage(userId, sessionId, role, content, type = 'chat') {
    try {
      const message = await AIChat.create({
        userId,
        sessionId,
        role, // 'user' | 'assistant' | 'system'
        content,
        type, // 'chat' | 'blog_assistant' | 'writing_assistant'
      });

      return message;
    } catch (error) {
      logger.error('保存聊天消息失败', { error: error.message, userId, sessionId });
      throw error;
    }
  }

  /**
   * 获取会话历史（用于构建上下文）
   */
  async getSessionHistory(userId, sessionId, limit = 20) {
    try {
      const messages = await AIChat.findAll({
        where: { userId, sessionId },
        order: [['createdAt', 'DESC']],
        limit,
        attributes: ['role', 'content', 'createdAt'],
      });

      // 反转顺序，最早的消息在前
      return messages.reverse().map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
    } catch (error) {
      logger.error('获取会话历史失败', { error: error.message, userId, sessionId });
      return [];
    }
  }

  /**
   * 获取会话历史（用于前端显示）
   */
  async getSessionMessages(userId, sessionId, limit = 50) {
    try {
      const messages = await AIChat.findAll({
        where: { userId, sessionId },
        order: [['createdAt', 'ASC']],
        limit,
        attributes: ['id', 'role', 'content', 'createdAt'],
      });

      return messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      }));
    } catch (error) {
      logger.error('获取会话消息失败', { error: error.message, userId, sessionId });
      throw error;
    }
  }

  /**
   * 获取用户所有会话列表
   */
  async getUserSessions(userId) {
    try {
      const db = require('@/models');
      const sessions = await db.sequelize.query(
        `
        SELECT 
          session_id,
          type,
          COUNT(*) as message_count,
          MAX(created_at) as last_message_at,
          MIN(created_at) as first_message_at
        FROM ai_chats
        WHERE user_id = :userId
        GROUP BY session_id, type
        ORDER BY last_message_at DESC
        `,
        {
          replacements: { userId },
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      return sessions;
    } catch (error) {
      logger.error('获取用户会话列表失败', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 获取会话统计
   */
  async getSessionStats(userId, sessionId) {
    try {
      const count = await AIChat.count({
        where: { userId, sessionId },
      });

      const firstMessage = await AIChat.findOne({
        where: { userId, sessionId },
        order: [['createdAt', 'ASC']],
        attributes: ['createdAt'],
      });

      const lastMessage = await AIChat.findOne({
        where: { userId, sessionId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt'],
      });

      return {
        messageCount: count,
        firstMessageAt: firstMessage?.createdAt,
        lastMessageAt: lastMessage?.createdAt,
      };
    } catch (error) {
      logger.error('获取会话统计失败', { error: error.message, userId, sessionId });
      throw error;
    }
  }

  /**
   * 清除指定会话
   */
  async clearSession(userId, sessionId) {
    try {
      const count = await AIChat.destroy({
        where: { userId, sessionId },
      });

      logger.info('清除会话成功', { userId, sessionId, count });
      return count;
    } catch (error) {
      logger.error('清除会话失败', { error: error.message, userId, sessionId });
      throw error;
    }
  }

  /**
   * 清除用户所有会话
   */
  async clearAllSessions(userId) {
    try {
      const count = await AIChat.destroy({
        where: { userId },
      });

      logger.info('清除所有会话成功', { userId, count });
      return count;
    } catch (error) {
      logger.error('清除所有会话失败', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 清理旧消息（保留最近N条）
   */
  async cleanOldMessages(userId, sessionId, keepCount = 50) {
    try {
      const messages = await AIChat.findAll({
        where: { userId, sessionId },
        order: [['createdAt', 'DESC']],
        limit: keepCount,
        attributes: ['id'],
      });

      if (messages.length < keepCount) {
        return 0; // 消息数量未超过限制
      }

      const keepIds = messages.map(m => m.id);
      const count = await AIChat.destroy({
        where: {
          userId,
          sessionId,
          id: { [require('sequelize').Op.notIn]: keepIds },
        },
      });

      logger.info('清理旧消息成功', { userId, sessionId, count });
      return count;
    } catch (error) {
      logger.error('清理旧消息失败', { error: error.message, userId, sessionId });
      throw error;
    }
  }
}

module.exports = new ChatHistoryService();
