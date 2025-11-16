const aiProvider = require('../services/langchain/ai-provider.service');
const { logger } = require('../utils/logger');

/**
 * AI对话控制器
 * 支持多轮对话和会话管理
 */
class AIConversationController {
  /**
   * 对话聊天（带记忆）
   * POST /api/ai/conversation
   */
  chat = async (req, res) => {
    try {
      const { message, sessionId, chatType = 'chat' } = req.body;
      const userId = req.user.id;

      if (!message || !message.trim()) {
        return res.apiError('消息内容不能为空', 400);
      }

      logger.debug('开始AI对话', { userId, message, sessionId });
      const response = await aiProvider.conversationChat(userId, message, sessionId, chatType);
      logger.debug('AI对话完成', {
        responseLength: response?.length,
        responseType: typeof response,
      });

      const result = {
        message: response,
        sessionId: sessionId || `user_${userId}`,
        timestamp: new Date().toISOString(),
      };

      logger.debug('准备返回响应', {
        resultKeys: Object.keys(result),
        messageLength: result.message?.length,
      });

      // 使用响应中间件方法
      return res.apiSuccess(result, '对话成功');
    } catch (err) {
      logger.error('对话聊天失败', err);
      return res.apiError(err.message || '对话失败');
    }
  };

  /**
   * 获取会话历史
   * GET /api/ai/conversation/history/:sessionId
   */
  getHistory = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { limit = 50 } = req.query;

      const history = aiProvider.getMessageHistory(sessionId, userId);
      await history.loadMessages();
      const messages = await history.getMessages();

      // 转换为前端友好的格式
      const formattedMessages = messages.slice(-limit).map(msg => ({
        role: msg._getType(),
        content: msg.content,
        timestamp: msg.timestamp || null,
      }));

      return res.apiSuccess(
        {
          sessionId,
          messages: formattedMessages,
          total: formattedMessages.length,
        },
        '获取历史成功'
      );
    } catch (err) {
      logger.error('获取会话历史失败', err);
      return res.apiError(err.message || '获取历史失败');
    }
  };

  /**
   * 获取会话统计
   * GET /api/ai/conversation/stats/:sessionId
   */
  getStats = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const history = aiProvider.getMessageHistory(sessionId, userId);
      const stats = await history.getStats();

      return res.apiSuccess(stats, '获取统计成功');
    } catch (err) {
      logger.error('获取会话统计失败', err);
      return res.apiError(err.message || '获取统计失败');
    }
  };

  /**
   * 清除会话历史
   * DELETE /api/ai/conversation/:sessionId
   */
  clearSession = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      await aiProvider.clearMemory(userId, sessionId);

      return res.apiSuccess(
        {
          message: '会话历史已清除',
          sessionId,
        },
        '清除成功'
      );
    } catch (err) {
      logger.error('清除会话历史失败', err);
      return res.apiError(err.message || '清除失败');
    }
  };

  /**
   * 清除用户所有会话
   * DELETE /api/ai/conversation
   */
  clearAllSessions = async (req, res) => {
    try {
      const userId = req.user.id;

      await aiProvider.clearMemory(userId);

      return res.apiSuccess(
        {
          message: '所有会话历史已清除',
        },
        '清除成功'
      );
    } catch (err) {
      logger.error('清除所有会话失败', err);
      return res.apiError(err.message || '清除失败');
    }
  };

  /**
   * 获取用户所有会话列表
   * GET /api/ai/conversation/sessions
   */
  getSessions = async (req, res) => {
    try {
      const userId = req.user.id;
      const db = require('../models');

      // 查询用户所有会话
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

      return res.apiSuccess(
        {
          sessions,
          total: sessions.length,
        },
        '获取会话列表成功'
      );
    } catch (err) {
      logger.error('获取会话列表失败', err);
      return res.apiError(err.message || '获取列表失败');
    }
  };
}

module.exports = new AIConversationController();
