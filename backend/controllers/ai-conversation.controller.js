const { aiService } = require('@/services/ai');
const chatHistoryService = require('@/services/ai/chat-history.service');
const { logger } = require('@/utils/logger');

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
      // TODO: 需要实现带记忆的对话功能
      const response = await aiService.chat(message, { systemPrompt: null });
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
   * GET /api/ai/sessions/:sessionId/history
   */
  getHistory = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { limit = 50 } = req.query;

      const messages = await chatHistoryService.getSessionMessages(
        userId,
        sessionId,
        parseInt(limit)
      );

      return res.apiSuccess(
        {
          sessionId,
          messages,
          total: messages.length,
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
   * GET /api/ai/sessions/:sessionId/stats
   */
  getStats = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const stats = await chatHistoryService.getSessionStats(userId, sessionId);

      return res.apiSuccess(stats, '获取统计成功');
    } catch (err) {
      logger.error('获取会话统计失败', err);
      return res.apiError(err.message || '获取统计失败');
    }
  };

  /**
   * 清除会话历史
   * DELETE /api/ai/sessions/:sessionId
   */
  clearSession = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const count = await chatHistoryService.clearSession(userId, sessionId);

      return res.apiSuccess(
        {
          message: '会话历史已清除',
          sessionId,
          deletedCount: count,
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
   * DELETE /api/ai/sessions
   */
  clearAllSessions = async (req, res) => {
    try {
      const userId = req.user.id;

      const count = await chatHistoryService.clearAllSessions(userId);

      return res.apiSuccess(
        {
          message: '所有会话历史已清除',
          deletedCount: count,
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
   * GET /api/ai/sessions
   */
  getSessions = async (req, res) => {
    try {
      const userId = req.user.id;

      const sessions = await chatHistoryService.getUserSessions(userId);

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
