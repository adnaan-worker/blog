const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');
const { logger } = require('../../utils/logger');

/**
 * 基于数据库的聊天历史管理
 * 实现LangChain的消息历史接口，将消息存储到MySQL
 */
class DatabaseChatMessageHistory {
  constructor(sessionId, userId, db, chatType = 'chat') {
    this.sessionId = sessionId;
    this.userId = userId;
    this.db = db;
    this.chatType = chatType;
    this.messages = []; // 缓存消息
    this.loaded = false; // 是否已加载历史
  }

  /**
   * 从数据库加载历史消息
   */
  async loadMessages() {
    if (this.loaded) return;

    try {
      // 优化查询：只选择必要的字段，添加索引提示
      const records = await this.db.AIChat.findAll({
        attributes: ['role', 'content', 'createdAt'], // 只选择需要的字段
        where: {
          sessionId: this.sessionId,
          userId: this.userId,
        },
        order: [['createdAt', 'ASC']],
        limit: 20, // 减少到20条，提高性能
        raw: true, // 返回原始数据，避免 Sequelize 实例化开销
      });

      this.messages = records.map(record => {
        switch (record.role) {
          case 'human':
            return new HumanMessage(record.content);
          case 'ai':
            return new AIMessage(record.content);
          case 'system':
            return new SystemMessage(record.content);
          default:
            return new HumanMessage(record.content);
        }
      });

      this.loaded = true;
      logger.debug('加载聊天历史', {
        sessionId: this.sessionId,
        userId: this.userId,
        messageCount: this.messages.length,
      });
    } catch (error) {
      logger.error('加载聊天历史失败', error);
      this.messages = [];
      this.loaded = true;
    }
  }

  /**
   * 获取所有消息（LangChain接口）
   */
  async getMessages() {
    if (!this.loaded) {
      await this.loadMessages();
    }
    return this.messages;
  }

  /**
   * 添加消息（LangChain接口）
   */
  async addMessage(message) {
    try {
      // 确定消息角色
      const messageType = message._getType();
      let role;
      switch (messageType) {
        case 'human':
          role = 'human';
          break;
        case 'ai':
          role = 'ai';
          break;
        case 'system':
          role = 'system';
          break;
        default:
          role = 'human';
      }

      // 保存到数据库
      await this.db.AIChat.create({
        userId: this.userId,
        sessionId: this.sessionId,
        role,
        content: message.content,
        type: this.chatType,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });

      // 添加到缓存
      this.messages.push(message);

      logger.debug('添加消息到历史', {
        sessionId: this.sessionId,
        role,
        contentLength: message.content.length,
      });
    } catch (error) {
      logger.error('保存消息失败', error);
      throw error;
    }
  }

  /**
   * 添加用户消息
   */
  async addUserMessage(message) {
    await this.addMessage(new HumanMessage(message));
  }

  /**
   * 添加AI消息
   */
  async addAIChatMessage(message) {
    await this.addMessage(new AIMessage(message));
  }

  /**
   * 清除历史（LangChain接口）
   */
  async clear() {
    try {
      await this.db.AIChat.destroy({
        where: {
          sessionId: this.sessionId,
          userId: this.userId,
        },
      });

      this.messages = [];
      this.loaded = true;

      logger.info('清除聊天历史', {
        sessionId: this.sessionId,
        userId: this.userId,
      });
    } catch (error) {
      logger.error('清除聊天历史失败', error);
      throw error;
    }
  }

  /**
   * 获取最近N条消息
   */
  async getRecentMessages(limit = 10) {
    if (!this.loaded) {
      await this.loadMessages();
    }
    return this.messages.slice(-limit);
  }

  /**
   * 获取会话统计信息
   */
  async getStats() {
    try {
      const count = await this.db.AIChat.count({
        where: {
          sessionId: this.sessionId,
          userId: this.userId,
        },
      });

      return {
        sessionId: this.sessionId,
        userId: this.userId,
        messageCount: count,
        type: this.chatType,
      };
    } catch (error) {
      logger.error('获取会话统计失败', error);
      return null;
    }
  }
}

module.exports = DatabaseChatMessageHistory;
