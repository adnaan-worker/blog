const aiProvider = require('./ai-provider.service');
const prompts = require('./prompt-templates');
const { logger } = require('../../utils/logger');

/**
 * AI 写作服务
 * 基于 LangChain 的智能写作助手
 */
class AIWritingService {
  /**
   * 生成文章
   */
  async generateArticle(params) {
    const { title, keywords = [], wordCount = 1500, style = '专业且易懂' } = params;

    logger.info('生成文章', { title, wordCount });

    const content = await aiProvider.generateWithTemplate(prompts.ARTICLE_TEMPLATE, {
      title,
      keywords: keywords.join(', '),
      wordCount,
      style,
    });

    return this.processContent(content);
  }

  /**
   * 润色文本
   */
  async polishText(content, style = '更加流畅和专业') {
    logger.info('润色文本', { contentLength: content.length });

    const result = await aiProvider.generateWithTemplate(prompts.POLISH_TEMPLATE, {
      content,
      style,
    });

    return this.processContent(result);
  }

  /**
   * 改进文本
   */
  async improveText(content, improvements = '提高可读性和逻辑性') {
    logger.info('改进文本', { contentLength: content.length });

    const result = await aiProvider.generateWithTemplate(prompts.IMPROVE_TEMPLATE, {
      content,
      improvements,
    });

    return this.processContent(result);
  }

  /**
   * 扩展内容
   */
  async expandContent(content, length = 'medium') {
    const lengthInstruction =
      prompts.LENGTH_INSTRUCTIONS[length] || prompts.LENGTH_INSTRUCTIONS.medium;

    logger.info('扩展内容', { contentLength: content.length, length });

    const result = await aiProvider.generateWithTemplate(prompts.EXPAND_TEMPLATE, {
      content,
      lengthInstruction,
    });

    return this.processContent(result);
  }

  /**
   * 总结内容
   */
  async summarizeContent(content, length = 'medium') {
    const summaryInstruction =
      prompts.SUMMARY_LENGTH_INSTRUCTIONS[length] || prompts.SUMMARY_LENGTH_INSTRUCTIONS.medium;

    logger.info('总结内容', { contentLength: content.length, length });

    const result = await aiProvider.generateWithTemplate(prompts.SUMMARIZE_TEMPLATE, {
      content,
      summaryInstruction,
    });

    return this.processContent(result);
  }

  // 续写和改写风格功能已废弃（使用频率低，可通过扩写和自定义提示词实现）

  /**
   * 翻译内容
   */
  async translateContent(content, targetLang = '英文') {
    logger.info('翻译内容', { contentLength: content.length, targetLang });

    const result = await aiProvider.generateWithTemplate(prompts.TRANSLATE_TEMPLATE, {
      content,
      targetLang,
    });

    return this.processContent(result);
  }

  /**
   * 生成标题（返回纯文本）
   */
  async generateTitle(content, keywords = []) {
    logger.info('生成标题', { contentLength: content.length });

    const result = await aiProvider.generateWithTemplate(prompts.TITLE_TEMPLATE, {
      content,
      keywords: keywords.join(', '),
    });

    // 返回纯文本，去除HTML标签
    return this.extractPlainText(result);
  }

  /**
   * 生成摘要（返回纯文本）
   */
  async generateSummary(content) {
    logger.info('生成摘要', { contentLength: content.length });

    const result = await aiProvider.generateWithTemplate(prompts.SUMMARY_TEMPLATE, {
      content,
    });

    // 返回纯文本，去除HTML标签
    return this.extractPlainText(result);
  }

  /**
   * 生成大纲
   */
  async generateOutline(topic, keywords = []) {
    logger.info('生成大纲', { topic });

    const result = await aiProvider.generateWithTemplate(prompts.OUTLINE_TEMPLATE, {
      topic,
      keywords: keywords.join(', '),
    });

    return this.processContent(result);
  }

  /**
   * 流式润色文本
   */
  async streamPolishText(content, style, onChunk) {
    logger.info('流式润色文本', { contentLength: content.length });

    const result = await aiProvider.streamGenerateWithTemplate(
      prompts.POLISH_TEMPLATE,
      { content, style },
      onChunk
    );

    return this.processContent(result);
  }

  /**
   * 流式改进文本
   */
  async streamImproveText(content, improvements, onChunk) {
    logger.info('流式改进文本', { contentLength: content.length });

    const result = await aiProvider.streamGenerateWithTemplate(
      prompts.IMPROVE_TEMPLATE,
      { content, improvements },
      onChunk
    );

    return this.processContent(result);
  }

  /**
   * 流式扩展内容
   */
  async streamExpandContent(content, length, onChunk) {
    const lengthInstruction =
      prompts.LENGTH_INSTRUCTIONS[length] || prompts.LENGTH_INSTRUCTIONS.medium;

    logger.info('流式扩展内容', { contentLength: content.length, length });

    const result = await aiProvider.streamGenerateWithTemplate(
      prompts.EXPAND_TEMPLATE,
      { content, lengthInstruction },
      onChunk
    );

    return this.processContent(result);
  }

  /**
   * 流式总结内容
   */
  async streamSummarizeContent(content, length, onChunk) {
    const summaryInstruction =
      prompts.SUMMARY_LENGTH_INSTRUCTIONS[length] || prompts.SUMMARY_LENGTH_INSTRUCTIONS.medium;

    logger.info('流式总结内容', { contentLength: content.length, length });

    const result = await aiProvider.streamGenerateWithTemplate(
      prompts.SUMMARIZE_TEMPLATE,
      { content, summaryInstruction },
      onChunk
    );

    return this.processContent(result);
  }

  /**
   * 流式翻译内容
   */
  async streamTranslateContent(content, targetLang, onChunk) {
    logger.info('流式翻译内容', { contentLength: content.length, targetLang });

    const result = await aiProvider.streamGenerateWithTemplate(
      prompts.TRANSLATE_TEMPLATE,
      { content, targetLang },
      onChunk
    );

    return this.processContent(result);
  }

  /**
   * 处理生成的内容
   */
  processContent(content) {
    if (!content || typeof content !== 'string') {
      return '<p></p>';
    }

    let processed = content.trim();

    // 移除可能的 Markdown 代码块标记
    processed = processed.replace(/^```html\n?/i, '').replace(/\n?```$/i, '');

    // 移除多余的包装
    processed = processed.replace(
      /<div[^>]*class="rich-text-content"[^>]*>([\s\S]*)<\/div>$/i,
      '$1'
    );

    // 清理空的 class 属性
    processed = processed.replace(/\s*class=""\s*/gi, ' ');

    return processed.trim() || '<p></p>';
  }

  /**
   * 提取纯文本（用于标题和摘要）
   */
  extractPlainText(content) {
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
}

module.exports = new AIWritingService();
