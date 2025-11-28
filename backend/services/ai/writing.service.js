const aiService = require('./ai.service');
const aiModel = require('./core/ai-model.service');
const { logger } = require('@/utils/logger');

/**
 * AI 写作服务
 * 提供各种写作相关的 AI 功能
 */
class AIWritingService {
  /**
   * 生成文章
   */
  async generateArticle(params, onChunk = null) {
    const { title, keywords = [], wordCount = 1500, style = '专业且易懂', taskId } = params;

    logger.info('生成文章', { title, wordCount, taskId });

    const variables = {
      title,
      keywords: keywords.join(', '),
      wordCount,
      style,
    };

    if (onChunk) {
      return await aiService.streamGenerate('article', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('article', variables);
    }
  }

  /**
   * 润色文本
   */
  async polish(content, style = '更加流畅和专业', onChunk = null, taskId = null) {
    logger.info('润色文本', { contentLength: content.length, taskId });

    const variables = { content, style };

    if (onChunk) {
      return await aiService.streamGenerate('polish', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('polish', variables);
    }
  }

  /**
   * 改进文本
   */
  async improve(content, improvements = '提高可读性和逻辑性', onChunk = null, taskId = null) {
    logger.info('改进文本', { contentLength: content.length, taskId });

    const variables = { content, improvements };

    if (onChunk) {
      return await aiService.streamGenerate('improve', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('improve', variables);
    }
  }

  /**
   * 扩展内容
   */
  async expand(content, length = 'medium', onChunk = null, taskId = null) {
    const lengthInstructions = {
      short: '适度扩展：增加 20%-50% 内容，补充必要的细节和说明',
      medium: '充分扩展：增加 100%-200% 内容，添加详细解释、实例和相关知识',
      long: '深度扩展：增加 200%-400% 内容，全面深入分析，包含丰富案例、背景知识和延伸思考',
    };

    logger.info('扩展内容', { contentLength: content.length, length, taskId });

    const variables = {
      content,
      lengthInstruction: lengthInstructions[length] || lengthInstructions.medium,
    };

    if (onChunk) {
      return await aiService.streamGenerate('expand', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('expand', variables);
    }
  }

  /**
   * 总结内容
   */
  async summarize(content, length = 'medium', onChunk = null, taskId = null) {
    const summaryInstructions = {
      short: '简洁摘要：1-2 个段落，80-150 字，提炼核心要点',
      medium: '标准摘要：3-5 个段落，200-400 字，涵盖主要内容和关键信息',
      long: '详细摘要：6-10 个段落，500-800 字，全面总结包含背景、要点、结论',
    };

    logger.info('总结内容', { contentLength: content.length, length, taskId });

    const variables = {
      content,
      summaryInstruction: summaryInstructions[length] || summaryInstructions.medium,
    };

    if (onChunk) {
      return await aiService.streamGenerate('summarize', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('summarize', variables);
    }
  }

  /**
   * 翻译内容
   */
  async translate(content, targetLang = '英文', onChunk = null, taskId = null) {
    logger.info('翻译内容', { contentLength: content.length, targetLang, taskId });

    const variables = { content, targetLang };

    if (onChunk) {
      return await aiService.streamGenerate('translate', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('translate', variables);
    }
  }

  /**
   * 生成标题
   */
  async generateTitle(content, keywords = []) {
    const variables = {
      content,
      keywords: keywords.join(', '),
    };
    const result = await aiService.generate('title', variables);
    return this._extractPlainText(result);
  }

  /**
   * 生成摘要
   */
  async generateSummary(content) {
    const variables = { content };
    const result = await aiService.generate('summary', variables);
    return this._extractPlainText(result);
  }

  /**
   * 生成大纲
   */
  async generateOutline(topic, keywords = [], onChunk = null, taskId = null) {
    logger.info('生成大纲', { topic, taskId });

    const variables = {
      topic,
      keywords: keywords.join(', '),
    };

    if (onChunk) {
      return await aiService.streamGenerate('outline', variables, onChunk, { taskId });
    } else {
      return await aiService.generate('outline', variables);
    }
  }

  /**
   * 提取纯文本（用于标题和摘要）
   */
  _extractPlainText(content) {
    if (!content || typeof content !== 'string') {
      return '';
    }

    let text = content.trim();

    // 移除 Markdown 代码块标记
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');

    // 移除 HTML 标签
    text = text.replace(/<[^>]+>/g, '');

    // 移除多余的空白
    text = text.replace(/\s+/g, ' ').trim();

    // 移除 Markdown 标记
    text = text.replace(/[#*_`~]/g, '');

    return text;
  }

  /**
   * 取消任务
   */
  cancelTask(taskId) {
    return aiService.cancelStream(taskId);
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId) {
    return aiService.getStreamStatus(taskId);
  }
}

module.exports = new AIWritingService();
