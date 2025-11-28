const aiModel = require('./core/ai-model.service');
const streamManager = require('./core/stream-manager');
const promptManager = require('./prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { logger } = require('@/utils/logger');

/**
 * AI 服务 - 统一的 AI 调用接口
 * 基于 LangChain.js 的现代化封装
 */
class AIService {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化服务
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      await aiModel.initialize();
      this.initialized = true;
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 确保服务已初始化
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('AI 服务未初始化，请先调用 initialize()');
    }
  }

  /**
   * 简单聊天（非流式）
   * @param {string} message - 用户消息
   * @param {Object} options - 配置选项
   */
  async chat(message, options = {}) {
    this._ensureInitialized();

    const { systemPrompt = null } = options;
    const modelInfo = aiModel.getCurrentModel();

    logger.info('🤖 调用 LLM', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      type: 'chat',
      messageLength: message.length,
    });

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    const model = aiModel.getModel();
    const response = await model.invoke(messages);

    logger.info('✅ LLM 响应完成', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      responseLength: response.content.length,
    });

    return response.content;
  }

  /**
   * 流式聊天
   * @param {string} message - 用户消息
   * @param {Function} onChunk - chunk 回调
   * @param {Object} options - 配置选项
   */
  async streamChat(message, onChunk, options = {}) {
    this._ensureInitialized();

    const { systemPrompt = null, taskId = `chat_${Date.now()}` } = options;
    const modelInfo = aiModel.getCurrentModel();

    logger.info('🤖 调用 LLM (流式)', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      type: 'stream_chat',
      taskId,
      messageLength: message.length,
    });

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    const streamingModel = aiModel.getStreamingModel(); // 使用流式模型
    const stream = await streamingModel.stream(messages);

    const controller = streamManager.createStream(taskId, stream, options);

    const result = await controller.start(onChunk);

    logger.info('✅ LLM 流式响应完成', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      taskId,
      contentLength: result.length,
    });

    return result;
  }

  /**
   * 使用模板生成内容（非流式）
   * @param {string} templateName - 模板名称
   * @param {Object} variables - 模板变量
   */
  async generate(templateName, variables) {
    this._ensureInitialized();

    const modelInfo = aiModel.getCurrentModel();
    const template = promptManager.getTemplate(templateName);
    const model = aiModel.getModel();
    const chain = template.pipe(model).pipe(new StringOutputParser());

    logger.info('🤖 调用 LLM', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      template: templateName,
    });

    try {
      const response = await Promise.race([
        chain.invoke(variables),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('LLM 调用超时（180秒）')), 180000)
        ),
      ]);

      logger.info('✅ LLM 生成完成', {
        provider: modelInfo.provider,
        model: modelInfo.model,
        template: templateName,
      });

      return response;
    } catch (error) {
      logger.error('❌ LLM 调用失败', {
        provider: modelInfo.provider,
        model: modelInfo.model,
        template: templateName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 使用模板生成内容（流式）
   * @param {string} templateName - 模板名称
   * @param {Object} variables - 模板变量
   * @param {Function} onChunk - chunk 回调
   * @param {Object} options - 配置选项
   */
  async streamGenerate(templateName, variables, onChunk, options = {}) {
    this._ensureInitialized();

    const { taskId = `${templateName}_${Date.now()}` } = options;
    const modelInfo = aiModel.getCurrentModel();

    logger.info('🤖 调用 LLM (流式模板)', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      type: 'stream_generate',
      template: templateName,
      taskId,
    });

    const template = promptManager.getTemplate(templateName);
    const streamingModel = aiModel.getStreamingModel(); // 使用流式模型
    const chain = template.pipe(streamingModel).pipe(new StringOutputParser());

    const stream = await chain.stream(variables);

    const controller = streamManager.createStream(taskId, stream, options);

    const result = await controller.start(onChunk);

    logger.info('✅ LLM 流式模板生成完成', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      template: templateName,
      taskId,
      contentLength: result.length,
    });

    return result;
  }

  /**
   * 取消流式任务
   * @param {string} taskId - 任务ID
   */
  cancelStream(taskId) {
    return streamManager.cancelStream(taskId);
  }

  /**
   * 获取流式任务状态
   * @param {string} taskId - 任务ID
   */
  getStreamStatus(taskId) {
    const controller = streamManager.getStream(taskId);
    return controller ? controller.getStatus() : null;
  }

  /**
   * 获取服务信息
   */
  getInfo() {
    return {
      ...aiModel.getInfo(),
      activeStreams: streamManager.getActiveCount(),
      availableTemplates: promptManager.getAvailableTemplates(),
    };
  }

  /**
   * 检查服务是否可用
   */
  isAvailable() {
    return this.initialized && aiModel.isAvailable();
  }
}

module.exports = new AIService();
