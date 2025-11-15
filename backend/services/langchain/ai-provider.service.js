const { ChatOpenAI } = require('@langchain/openai');
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableWithMessageHistory } = require('@langchain/core/runnables');
const { ChatMessageHistory } = require('@langchain/core/chat_history');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { logger } = require('../../utils/logger');
const environment = require('../../config/environment');

/**
 * LangChain AI 提供商服务
 * 使用 RunnableWithMessageHistory 实现对话记忆
 */
class AIProviderService {
  constructor() {
    this.config = environment.get().ai;
    this.model = null;
    this.messageHistories = new Map(); // 用户消息历史
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
   * 创建 AI 模型
   */
  createModel() {
    const modelConfig = {
      temperature: this.config.temperature || 0.7,
      maxTokens: this.config.maxTokens || 2000,
      streaming: true,
      // 禁用自动 token 计算，避免连接 OpenAI 服务器
      cache: false,
    };

    switch (this.config.provider) {
      case 'openai':
        return new ChatOpenAI({
          openAIApiKey: this.config.openaiApiKey,
          modelName: this.config.modelName || 'gpt-3.5-turbo',
          ...modelConfig,
        });

      case 'zhipu':
      case 'glm':
        if (!this.config.zhipuApiKey) {
          throw new Error('智谱 API Key 未配置，请设置 ZHIPU_API_KEY 环境变量');
        }
        return new ChatOpenAI({
          apiKey: this.config.zhipuApiKey,
          modelName: this.config.modelName || 'glm-4',
          configuration: {
            baseURL: 'https://open.bigmodel.cn/api/paas/v4',
          },
          ...modelConfig,
        });

      default:
        throw new Error(`不支持的 AI 提供商: ${this.config.provider}`);
    }
  }

  /**
   * 获取用户消息历史
   */
  getMessageHistory(sessionId) {
    if (!this.messageHistories.has(sessionId)) {
      this.messageHistories.set(sessionId, new ChatMessageHistory());
    }
    return this.messageHistories.get(sessionId);
  }

  /**
   * 清除用户对话记忆
   */
  clearMemory(userId) {
    this.messageHistories.delete(userId);
    logger.info('清除用户对话记忆', { userId });
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
   * 对话聊天（带记忆）
   */
  async conversationChat(userId, message) {
    if (!this.isInitialized) {
      throw new Error('AI 服务未初始化');
    }

    // 创建带消息历史的 Prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', '你是一个智能写作助手，帮助用户创作和优化内容。'],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    // 创建链
    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    // 使用 RunnableWithMessageHistory 包装
    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: sessionId => this.getMessageHistory(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history',
    });

    // 调用
    const response = await withHistory.invoke(
      { input: message },
      { configurable: { sessionId: userId } }
    );

    return response;
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
