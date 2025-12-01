const aiModel = require('./core/ai-model.service');
const streamManager = require('./core/stream-manager');
const promptManager = require('./prompts');
const { logger } = require('@/utils/logger');
const { tools: defaultTools } = require('./tools');
let ToolMessage; // 动态导入

let StringOutputParser;

const getStringOutputParser = async () => {
  if (!StringOutputParser) {
    const mod = await import('@langchain/core/output_parsers');
    StringOutputParser = mod.StringOutputParser;
  }
  return StringOutputParser;
};

const getToolMessageClass = async () => {
  if (!ToolMessage) {
    const mod = await import('@langchain/core/messages');
    ToolMessage = mod.ToolMessage;
  }
  return ToolMessage;
};

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
   * 简单聊天（支持工具调用）
   * @param {string} message - 用户消息
   * @param {Object} options - 配置选项
   */
  async chat(message, options = {}) {
    this._ensureInitialized();

    const { systemPrompt = null, enableTools = false } = options;
    const modelInfo = aiModel.getCurrentModel();

    logger.info('🤖 调用 LLM', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      type: 'chat',
      enableTools,
      messageLength: message.length,
    });

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    let model = aiModel.getModel();
    const toolsMap = {};

    // 绑定工具
    if (enableTools) {
      model = model.bindTools(defaultTools);
      defaultTools.forEach(t => (toolsMap[t.name] = t));
    }

    // 工具调用循环
    const ToolMessageClass = await getToolMessageClass();
    let finalResponse;
    let turn = 0;
    const maxTurns = 5; // 防止死循环

    while (turn < maxTurns) {
      const response = await model.invoke(messages);
      messages.push(response); // 将 AI 回复加入历史

      // 检查是否有工具调用
      if (response.tool_calls && response.tool_calls.length > 0) {
        logger.info(`🛠️ AI 请求调用工具: ${response.tool_calls.length} 个`, {
          tools: response.tool_calls.map(t => t.name),
        });

        // 并行执行所有工具调用
        await Promise.all(
          response.tool_calls.map(async toolCall => {
            const tool = toolsMap[toolCall.name];
            if (tool) {
              try {
                logger.info(`🔧 执行工具: ${toolCall.name}`, toolCall.args);
                const result = await tool.invoke(toolCall.args);

                messages.push(
                  new ToolMessageClass({
                    tool_call_id: toolCall.id,
                    content: result,
                    name: toolCall.name,
                  })
                );
              } catch (e) {
                logger.error(`❌ 工具执行失败: ${toolCall.name}`, e);
                messages.push(
                  new ToolMessageClass({
                    tool_call_id: toolCall.id,
                    content: `Error executing tool: ${e.message}`,
                    name: toolCall.name,
                  })
                );
              }
            }
          })
        );

        turn++;
      } else {
        // 没有工具调用，直接返回结果
        finalResponse = response;
        break;
      }
    }

    if (!finalResponse) {
      return '抱歉，我处理这个请求时遇到了一些困难（工具调用循环次数超限）。';
    }

    logger.info('✅ LLM 响应完成', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      responseLength: finalResponse.content.length,
      turns: turn,
    });

    return finalResponse.content;
  }

  /**
   * 流式聊天（支持工具调用）
   * @param {string} message - 用户消息
   * @param {Function} onChunk - chunk 回调
   * @param {Object} options - 配置选项
   */
  async streamChat(message, onChunk, options = {}) {
    this._ensureInitialized();

    const {
      systemPrompt = null,
      taskId = `chat_${Date.now()}`,
      messages: customMessages,
      enableTools = true, // 是否启用工具
    } = options;

    const modelInfo = aiModel.getCurrentModel();

    logger.info('🤖 调用 LLM (流式)', {
      provider: modelInfo.provider,
      model: modelInfo.model,
      type: 'stream_chat',
      taskId,
      enableTools,
      messageLength: message.length,
      hasHistory: !!customMessages,
    });

    // 构建消息历史
    let messages;
    if (customMessages && Array.isArray(customMessages)) {
      messages = customMessages;
    } else {
      messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: message });
    }

    let model = aiModel.getStreamingModel();
    const toolsMap = {};

    // 绑定工具
    if (enableTools) {
      model = model.bindTools(defaultTools);
      defaultTools.forEach(t => (toolsMap[t.name] = t));
    }

    // 使用 StreamManager 创建控制器（用于状态管理和取消）
    // 这里我们需要自定义流的执行逻辑，所以传入一个空的生成器占位，后续手动控制
    async function* emptyGenerator() {}
    const controller = streamManager.createStream(taskId, emptyGenerator(), options);

    // 手动设置状态为 running
    controller.status = 'running';
    controller.startTime = Date.now();
    controller.emit('start', { taskId });

    const ToolMessageClass = await getToolMessageClass();
    let turn = 0;
    const maxTurns = 5;
    let fullContent = '';

    try {
      while (turn < maxTurns) {
        // 检查取消状态
        if (controller.isCancelled) {
          controller.emit('cancelled', { taskId });
          return fullContent;
        }

        // 开始流式生成
        const stream = await model.stream(messages);

        let aggregatedChunk = null;

        // 消费流
        for await (const chunk of stream) {
          if (controller.isCancelled) break;

          // 累积 chunk (LangChain 自动处理合并)
          aggregatedChunk = aggregatedChunk ? aggregatedChunk.concat(chunk) : chunk;

          // 1. 处理文本内容并实时推送
          const content = chunk.content;
          if (content && typeof content === 'string' && content.length > 0) {
            fullContent += content;

            if (onChunk) {
              await onChunk(content, {
                taskId,
                totalLength: fullContent.length,
                chunkCount: 0,
              });
            }
          }
        }

        if (controller.isCancelled) break;
        if (!aggregatedChunk) break; // 没有任何输出

        // 将这一轮的完整回复加入历史
        messages.push(aggregatedChunk);

        // 检查是否有工具调用
        if (aggregatedChunk.tool_calls && aggregatedChunk.tool_calls.length > 0) {
          logger.info(`🛠️ AI 请求调用工具 (流式): ${aggregatedChunk.tool_calls.length} 个`);

          // 提示前端正在调用工具（可选，可以通过发送特殊文本或事件，这里简单处理）
          // if (onChunk) await onChunk('\n*(正在搜索信息...)*\n', ...);

          // 并行执行工具
          await Promise.all(
            aggregatedChunk.tool_calls.map(async toolCall => {
              const tool = toolsMap[toolCall.name];
              if (tool) {
                try {
                  logger.info(`🔧 执行工具: ${toolCall.name}`, toolCall.args);
                  const result = await tool.invoke(toolCall.args);

                  messages.push(
                    new ToolMessageClass({
                      tool_call_id: toolCall.id,
                      content: result,
                      name: toolCall.name,
                    })
                  );
                } catch (e) {
                  logger.error(`❌ 工具执行失败: ${toolCall.name}`, e);
                  messages.push(
                    new ToolMessageClass({
                      tool_call_id: toolCall.id,
                      content: `Error: ${e.message}`,
                      name: toolCall.name,
                    })
                  );
                }
              }
            })
          );

          // 工具执行完，进入下一轮循环（LLM 会看到工具结果并生成回答）
          turn++;
        } else {
          // 没有工具调用，说明是最终回复，结束循环
          break;
        }
      }

      // 完成
      controller.status = 'done';
      controller.endTime = Date.now();
      controller.emit('done', { taskId, content: fullContent });
    } catch (error) {
      controller.status = 'error';
      controller.emit('error', { taskId, error: error.message });
      throw error;
    }

    return fullContent;
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
    const Parser = await getStringOutputParser();
    const chain = template.pipe(model).pipe(new Parser());

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
    const Parser = await getStringOutputParser();
    const chain = template.pipe(streamingModel).pipe(new Parser());

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
