const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { logger } = require('../../utils/logger');
const environment = require('../../config/environment');
const { getProviderConfig, isProviderSupported } = require('../../config/ai-providers.config');
const { getSystemPrompt } = require('./prompt-templates');
const DatabaseChatMessageHistory = require('./database-chat-history');
const db = require('../../models');

/**
 * LangChain AI 提供商服务
 * 使用数据库持久化对话记忆
 */
class AIProviderService {
  constructor() {
    this.config = environment.get().ai;
    this.model = null;
    this.messageHistories = new Map(); // 缓存消息历史实例

    // 请求配置（从环境变量读取）
    this.requestConfig = {
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay,
    };

    // 并发控制（从环境变量读取）
    this.userRequestCounts = new Map(); // 用户并发请求计数
    this.maxConcurrentPerUser = this.config.maxConcurrentPerUser;
  }

  /**
   * 初始化 AI 服务
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // 根据配置创建模型
      this.model = this.createModel();
      this.isInitialized = true;

      logger.info('✅ LangChain AI 服务初始化成功', {
        provider: this.config.provider,
        model: this.config.modelName,
      });

      return true;
    } catch (error) {
      logger.error('❌ LangChain AI 服务初始化失败', error);
      return false;
    }
  }

  /**
   * 创建 AI 模型（统一的、可扩展的实现）
   */
  createModel() {
    const provider = this.config.provider;

    // 检查提供商是否支持
    if (!isProviderSupported(provider)) {
      throw new Error(
        `不支持的 AI 提供商: ${provider}。` +
          `支持的提供商: ${require('../../config/ai-providers.config').getSupportedProviders().join(', ')}`
      );
    }

    // 获取提供商配置
    const providerConfig = getProviderConfig(provider);

    // 检查 API Key
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error(
        `${providerConfig.description} 的 API Key 未配置。` + `请设置环境变量: AI_API_KEY`
      );
    }

    // 确定使用的模型
    const modelName = this.config.model || providerConfig.defaultModel;

    // 基础模型配置
    const modelConfig = {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      streaming: true,
    };

    logger.info(`初始化 AI 模型`, {
      provider: providerConfig.description,
      model: modelName,
      package: providerConfig.package,
    });

    try {
      // 动态加载提供商的类
      const ProviderClass = require(providerConfig.package)[providerConfig.className];

      // 构建特定提供商的配置
      const providerSpecificConfig = this.buildProviderConfig(
        provider,
        providerConfig,
        apiKey,
        modelName,
        modelConfig
      );

      // 创建并返回模型实例
      return new ProviderClass(providerSpecificConfig);
    } catch (error) {
      logger.error(`加载 AI 提供商失败`, {
        provider,
        package: providerConfig.package,
        error: error.message,
      });
      throw new Error(
        `无法加载 ${providerConfig.description}。` +
          `请确保已安装: npm install ${providerConfig.package}`
      );
    }
  }

  /**
   * 构建特定提供商的配置
   */
  buildProviderConfig(provider, providerConfig, apiKey, modelName, baseConfig) {
    // 根据不同提供商的 API Key 参数名称映射
    const configKeyMap = {
      openai: 'openAIApiKey',
      zhipu: 'zhipuAIApiKey',
      anthropic: 'anthropicApiKey',
      google: 'apiKey',
      baidu: 'baiduApiKey',
      aliyun: 'alibabaApiKey',
      moonshot: 'moonshotApiKey',
      deepseek: 'apiKey',
    };

    // 构建配置对象
    const config = {
      [configKeyMap[provider] || 'apiKey']: apiKey,
      modelName,
      ...baseConfig,
    };

    // 如果配置了自定义 Base URL（用于网关、代理或自定义端点）
    if (this.config.baseURL) {
      config.configuration = {
        baseURL: this.config.baseURL,
      };

      logger.info('使用自定义 Base URL', {
        provider,
        baseURL: this.config.baseURL,
      });
    }

    return config;
  }

  /**
   * 获取用户消息历史（数据库持久化）
   * @param {string} sessionId - 会话ID
   * @param {number} userId - 用户ID
   * @param {string} chatType - 聊天类型
   */
  getMessageHistory(sessionId, userId, chatType = 'chat') {
    const cacheKey = `${userId}_${sessionId}`;

    if (!this.messageHistories.has(cacheKey)) {
      const history = new DatabaseChatMessageHistory(sessionId, userId, db, chatType);
      this.messageHistories.set(cacheKey, history);
    }

    return this.messageHistories.get(cacheKey);
  }

  /**
   * 清除用户对话记忆
   * @param {number} userId - 用户ID
   * @param {string} sessionId - 会话ID（可选，不传则清除该用户所有会话）
   */
  async clearMemory(userId, sessionId = null) {
    try {
      if (sessionId) {
        // 清除特定会话
        const cacheKey = `${userId}_${sessionId}`;
        const history = this.messageHistories.get(cacheKey);

        if (history) {
          await history.clear();
          this.messageHistories.delete(cacheKey);
        }

        logger.info('清除用户会话记忆', { userId, sessionId });
      } else {
        // 清除用户所有会话
        await db.AIChat.destroy({
          where: { userId },
        });

        // 清除缓存
        for (const [key, _] of this.messageHistories) {
          if (key.startsWith(`${userId}_`)) {
            this.messageHistories.delete(key);
          }
        }

        logger.info('清除用户所有对话记忆', { userId });
      }
    } catch (error) {
      logger.error('清除对话记忆失败', error);
      throw error;
    }
  }

  /**
   * 简单聊天（无记忆）
   */
  async chat(message, systemPrompt = null) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    const response = await this.model.invoke(messages);
    return response.content;
  }

  /**
   * 获取用户请求许可（并发控制）
   * @private
   */
  async acquireUserLock(userId) {
    const count = this.userRequestCounts.get(userId) || 0;

    if (count >= this.maxConcurrentPerUser) {
      throw new Error('请求过于频繁，请稍后再试');
    }

    this.userRequestCounts.set(userId, count + 1);

    logger.debug('获取用户请求许可', {
      userId,
      currentCount: count + 1,
      maxConcurrent: this.maxConcurrentPerUser,
    });
  }

  /**
   * 释放用户请求许可
   * @private
   */
  releaseUserLock(userId) {
    const count = this.userRequestCounts.get(userId) || 0;
    if (count > 0) {
      this.userRequestCounts.set(userId, count - 1);

      logger.debug('释放用户请求许可', {
        userId,
        remainingCount: count - 1,
      });
    }
  }

  /**
   * 带超时和重试的请求包装器
   * @private
   */
  async invokeWithRetry(messages, options = {}) {
    const {
      timeout = this.requestConfig.timeout,
      maxRetries = this.requestConfig.maxRetries,
      retryDelay = this.requestConfig.retryDelay,
    } = options;

    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // 使用 Promise.race 实现超时
        const result = await Promise.race([
          this.model.invoke(messages),
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI请求超时')), timeout)),
        ]);

        return result;
      } catch (error) {
        lastError = error;

        // 如果是最后一次尝试，直接抛出错误
        if (attempt >= maxRetries - 1) {
          break;
        }

        // 计算退避延迟（指数退避）
        const delay = retryDelay * Math.pow(2, attempt);

        logger.warn(`AI请求失败，${delay}ms后重试`, {
          attempt: attempt + 1,
          maxRetries,
          error: error.message,
        });

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    logger.error('AI请求失败，已达最大重试次数', {
      maxRetries,
      error: lastError.message,
    });

    throw lastError;
  }

  /**
   * 构建对话消息列表（公共方法）
   * @private
   */
  async buildConversationMessages(userId, message, sessionId, chatType, systemPrompt) {
    const actualSessionId = sessionId || `user_${userId}`;
    const history = this.getMessageHistory(actualSessionId, userId, chatType);

    // 加载历史消息（限制数量，提高性能）
    const messages = await history.getMessages();
    const recentMessages = messages.slice(-this.config.maxHistoryMessages);

    // 使用配置化的 system prompt
    const prompt = systemPrompt || getSystemPrompt(this.config.defaultPromptType);

    return {
      history,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        ...recentMessages.map(msg => ({
          role: msg._getType() === 'human' ? 'user' : 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
    };
  }

  /**
   * 异步保存对话历史（公共方法）
   * @private
   */
  saveConversationHistory(history, userMessage, aiResponse) {
    setImmediate(async () => {
      try {
        await history.addUserMessage(userMessage);
        await history.addAIChatMessage(aiResponse);
      } catch (error) {
        logger.error('保存对话历史失败', error);
      }
    });
  }

  /**
   * 对话聊天（带记忆）
   * @param {number} userId - 用户ID
   * @param {string} message - 用户消息
   * @param {string} sessionId - 会话ID（可选，默认使用userId）
   * @param {string} chatType - 聊天类型
   * @param {string} systemPrompt - 系统提示（可选）
   */
  async conversationChat(
    userId,
    message,
    sessionId = null,
    chatType = 'chat',
    systemPrompt = null
  ) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    // 并发控制：获取请求许可
    await this.acquireUserLock(userId);

    try {
      const { history, messages } = await this.buildConversationMessages(
        userId,
        message,
        sessionId,
        chatType,
        systemPrompt
      );

      // 调用模型（带超时和重试）
      const response = await this.invokeWithRetry(messages);

      // 只在开发环境记录详细日志
      if (process.env.NODE_ENV === 'development') {
        logger.debug('AI响应详情', {
          contentLength: response?.content?.length,
          hasContent: !!response?.content,
        });
      }

      // 异步保存消息到历史
      this.saveConversationHistory(history, message, response.content);

      return response.content;
    } finally {
      // 释放请求许可
      this.releaseUserLock(userId);
    }
  }

  /**
   * 流式对话聊天（带记忆）
   * @param {number} userId - 用户ID
   * @param {string} message - 用户消息
   * @param {function} onChunk - 流式回调
   * @param {string} sessionId - 会话ID（可选）
   * @param {string} chatType - 聊天类型
   * @param {string} systemPrompt - 系统提示（可选）
   */
  async streamConversationChat(
    userId,
    message,
    onChunk,
    sessionId = null,
    chatType = 'chat',
    systemPrompt = null
  ) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    // 并发控制：获取请求许可
    await this.acquireUserLock(userId);

    try {
      const { history, messages } = await this.buildConversationMessages(
        userId,
        message,
        sessionId,
        chatType,
        systemPrompt
      );

      // 流式生成
      let fullResponse = '';
      const stream = await this.model.stream(messages);

      for await (const chunk of stream) {
        const content = chunk.content;
        if (content) {
          fullResponse += content;
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      // 异步保存消息到历史
      this.saveConversationHistory(history, message, fullResponse);

      return fullResponse;
    } finally {
      // 释放请求许可
      this.releaseUserLock(userId);
    }
  }

  /**
   * 流式聊天
   */
  async streamChat(message, systemPrompt = null, onChunk) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    let fullResponse = '';

    const stream = await this.model.stream(messages);

    for await (const chunk of stream) {
      const content = chunk.content;
      if (content) {
        fullResponse += content;
        if (onChunk) {
          onChunk(content);
        }
      }
    }

    return fullResponse;
  }

  /**
   * 使用 Prompt 模板生成内容
   */
  async generateWithTemplate(templateString, variables) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    const prompt = PromptTemplate.fromTemplate(templateString);
    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const response = await chain.invoke(variables);
    return response;
  }

  /**
   * 流式生成（使用模板）
   */
  async streamGenerateWithTemplate(templateString, variables, onChunk) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    const prompt = PromptTemplate.fromTemplate(templateString);
    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    let fullResponse = '';
    const stream = await chain.stream(variables);

    for await (const chunk of stream) {
      fullResponse += chunk;
      if (onChunk) {
        onChunk(chunk);
      }
    }

    return fullResponse;
  }

  /**
   * 检查服务状态
   */
  isAvailable() {
    return this.isInitialized;
  }

  /**
   * 获取服务信息
   */
  getInfo() {
    return {
      provider: this.config.provider,
      model: this.config.modelName,
      available: this.isInitialized,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    };
  }
}

module.exports = new AIProviderService();
