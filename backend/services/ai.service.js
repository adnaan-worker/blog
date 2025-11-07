const { aiConfig } = require('../config/ai.config');
const { AIChat } = require('../models');
const { aiQuotaService } = require('./ai-quota.service');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * AI服务类
 * 提供聊天、智能代理等功能
 */
class AIService {
  constructor() {
    this.isAvailable = aiConfig.isAvailable();
  }

  /**
   * 初始化AI服务
   */
  async init() {
    try {
      const success = aiConfig.init();
      this.isAvailable = success;
      return success;
    } catch (error) {
      logger.error('AI服务初始化失败', { error: error.message });
      return false;
    }
  }

  /**
   * 简单聊天功能
   * @param {string} message - 用户消息
   * @param {string} userId - 用户ID
   * @param {string} sessionId - 会话ID
   * @param {string} systemPrompt - 自定义系统提示词
   * @returns {Promise<string>} AI回复
   */
  async chat(message, userId = 'anonymous', sessionId = null, systemPrompt = null) {
    const startTime = Date.now();
    const chatId = uuidv4();
    sessionId = sessionId || uuidv4();

    try {
      if (!this.isAvailable) {
        throw new Error('AI服务不可用');
      }

      // 检查配额
      const quota = await aiQuotaService.checkChatQuota(userId);
      if (!quota.available) {
        throw new Error(`每日聊天次数已达上限(${quota.limit})`);
      }

      // 获取用户聊天历史
      const history = await this.getChatHistory(userId, sessionId);

      // 构建消息数组，使用自定义系统提示词或默认提示词
      const defaultSystemPrompt = '你是一个友好的AI助手，请用中文回答问题。';
      const messages = [
        { role: 'system', content: systemPrompt || defaultSystemPrompt },
        ...history,
        { role: 'user', content: message },
      ];

      // 调用AI服务
      const response = await aiConfig.chat(messages);

      const duration = Date.now() - startTime;

      // 保存到数据库
      await AIChat.create({
        userId,
        sessionId,
        message,
        response,
        type: 'chat',
        tokens: 0, // 这里可以添加token计算逻辑
        duration,
        status: 'success',
      });

      // 更新配额
      await aiQuotaService.incrementChatUsage(userId);

      logger.info('聊天功能执行成功', {
        chatId,
        userId,
        sessionId,
        duration,
        messageLength: message.length,
        responseLength: response.length,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 保存错误记录
      await AIChat.create({
        userId,
        sessionId,
        message,
        response: '',
        type: 'chat',
        duration,
        status: 'failed',
        error: error.message,
      });

      logger.error('聊天功能执行失败', {
        chatId,
        error: error.message,
        userId,
        sessionId,
        duration,
        message,
      });
      throw error;
    }
  }

  /**
   * 流式聊天功能
   * @param {string} message - 用户消息
   * @param {string} userId - 用户ID
   * @param {string} sessionId - 会话ID
   * @param {Function} onChunk - 流式数据回调
   * @returns {Promise<string>} 完整回复
   */
  async streamChat(message, userId = 'anonymous', sessionId = null, onChunk = null) {
    const startTime = Date.now();
    const chatId = uuidv4();
    sessionId = sessionId || uuidv4();
    let fullResponse = '';

    try {
      if (!this.isAvailable) {
        throw new Error('AI服务不可用');
      }

      // 检查配额
      const quota = await aiQuotaService.checkChatQuota(userId);
      if (!quota.available) {
        throw new Error(`每日聊天次数已达上限(${quota.limit})`);
      }

      // 获取用户聊天历史
      const history = await this.getChatHistory(userId, sessionId);

      // 构建消息数组
      const messages = [
        { role: 'system', content: '你是一个友好的AI助手，请用中文回答问题。' },
        ...history,
        { role: 'user', content: message },
      ];

      // 调用AI流式服务
      const response = await aiConfig.streamChat(messages, chunk => {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      });

      const duration = Date.now() - startTime;

      // 保存到数据库
      await AIChat.create({
        userId,
        sessionId,
        message,
        response: fullResponse,
        type: 'chat',
        tokens: 0,
        duration,
        status: 'success',
      });

      // 更新配额
      await aiQuotaService.incrementChatUsage(userId);

      logger.info('流式聊天功能执行成功', {
        chatId,
        userId,
        sessionId,
        duration,
        messageLength: message.length,
        responseLength: fullResponse.length,
      });

      return fullResponse;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 保存错误记录
      await AIChat.create({
        userId,
        sessionId,
        message,
        response: fullResponse,
        type: 'chat',
        duration,
        status: 'failed',
        error: error.message,
      });

      logger.error('流式聊天功能执行失败', {
        chatId,
        error: error.message,
        userId,
        sessionId,
        duration,
        message,
      });
      throw error;
    }
  }

  /**
   * 智能代理功能 - 博客助手
   * @param {string} query - 用户查询
   * @param {string} userId - 用户ID
   * @param {Object} context - 上下文信息（如博客数据）
   * @returns {Promise<string>} AI回复
   */
  async blogAssistant(query, userId = 'anonymous', context = {}) {
    try {
      if (!this.isAvailable) {
        throw new Error('AI服务不可用');
      }

      // 构建系统提示
      const systemPrompt = `你是一个专业的博客助手，具有以下能力：
1. 帮助用户写博客文章
2. 提供写作建议和技巧
3. 回答关于博客运营的问题
4. 提供SEO优化建议
5. 帮助分析博客数据

当前博客信息：
- 文章数量: ${context.postCount || 0}
- 用户数量: ${context.userCount || 0}
- 评论数量: ${context.commentCount || 0}

请用中文回答，保持专业、友好的态度。

注意：如果用户询问关于内容创作、文章写作等问题，请使用HTML格式回答，并添加必要的CSS类名以支持富文本渲染。`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ];

      const response = await aiConfig.chat(messages);

      // 保存聊天历史
      this.saveChatHistory(userId, query, response);

      return response;
    } catch (error) {
      logger.error('博客助手功能执行失败', {
        error: error.message,
        userId,
        query,
      });
      throw error;
    }
  }

  /**
   * 内容生成功能
   * @param {string} type - 内容类型 (article, summary, title, tags)
   * @param {Object} params - 生成参数
   * @returns {Promise<string>} 生成的内容
   */
  async generateContent(type, params = {}) {
    try {
      if (!this.isAvailable) {
        throw new Error('AI服务不可用');
      }

      let prompt = '';
      let systemPrompt = '';

      switch (type) {
        case 'article':
          systemPrompt = `你是一个专业的内容创作助手。请严格按照以下要求生成文章：

1. 输出格式要求 - 使用纯净的HTML格式（TipTap编辑器兼容）：
   - 标题：使用 <h2> <h3> <h4> 等标签（不要使用h1，从h2开始）
   - 段落：使用 <p> 标签包装段落内容
   - 强调：使用 <strong> 和 <em> 标签强调重点
   - 列表：使用 <ul> <ol> <li> 创建列表（支持嵌套）
   - 引用：使用 <blockquote> 引用重要观点（不要添加class属性）
   - 内联代码：使用 <code> 标签标记专业术语（不要添加class属性）
   - 代码块：使用 <pre><code class="language-语言">代码</code></pre> 格式
   - 链接：使用 <a href="URL">文本</a> 格式（编辑器会自动处理target和rel）
   - 分割线：使用 <hr> 分隔章节

2. 代码块示例（重要）：
   - JavaScript: <pre><code class="language-javascript">console.log('Hello');</code></pre>
   - Python: <pre><code class="language-python">print('Hello')</code></pre>
   - CSS: <pre><code class="language-css">body { margin: 0; }</code></pre>

3. 严格禁止：
   - 不要添加任何CSS类名（除了代码块的language-类名）
   - 不要使用 rich-text-* 类名
   - 不要包装在 <div class="rich-text-content"> 中
   - 不要添加额外的div容器
   - 代码块内的代码必须正确转义HTML字符（< > & " '）

4. 内容要求：
   - 文章结构完整：引言、主体、结论
   - 每个段落内容丰富，不少于100字
   - 语言生动、逻辑清晰
   - 适当使用实例和说明

5. 输出规则：
   - 只返回纯净的HTML内容，不要任何包装
   - 确保HTML语法正确
   - 代码块内容必须转义：& 转 &amp;, < 转 &lt;, > 转 &gt;
   - 保持内容的逻辑性和可读性`;

          prompt = `请根据以下信息生成一篇完整的HTML格式博客文章：

标题: ${params.title || '未指定'}
关键词: ${params.keywords || '未指定'}
字数要求: ${params.wordCount || 1500}字以上
风格: ${params.style || '专业且易懂'}

要求：
- 生成结构完整的长篇文章，包含多个章节
- 每个章节都要有详细的内容和说明
- 使用纯净HTML格式，不要添加额外的包装
- 内容要充实、有价值，不要泛泛而谈
- 代码示例必须转义HTML字符`;
          break;

        case 'summary':
          systemPrompt = `你是一个专业的内容创作助手。请使用纯净HTML格式生成摘要内容，使用 <strong> 强调要点。不要添加任何CSS类名。`;

          prompt = `请为以下文章生成一个详细的HTML格式摘要（200-300字）：

文章内容: ${params.content || '未提供内容'}

要求：
- 使用纯净HTML格式输出（<p> <strong> 等标签）
- 准确概括文章主要内容
- 结构清晰，要点突出
- 语言简洁但信息丰富
- 不要使用任何CSS类名
- 不要包装在div容器中`;

          break;

        case 'title':
          systemPrompt = `你是一个专业的内容创作助手。请生成吸引人的标题列表，使用纯净HTML列表格式输出。`;

          prompt = `请为以下文章生成5-8个吸引人的标题：

文章内容: ${params.content || '未提供内容'}
关键词: ${params.keywords || '未指定'}

要求：
- 使用纯净HTML列表格式输出：<ul><li>标题1</li><li>标题2</li></ul>
- 标题要SEO友好、吸引人
- 每个标题都要有所不同
- 标题要准确反映文章内容
- 不要添加任何CSS类名或额外包装`;

          break;

        case 'tags':
          systemPrompt = `你是一个专业的内容分析助手。请生成相关标签列表，使用纯净HTML列表格式输出。`;

          prompt = `请为以下文章生成8-12个相关标签：

文章标题: ${params.title || '未指定'}
文章内容: ${params.content || '未提供内容'}

要求：
- 使用纯净HTML列表格式输出：<ul><li>标签1</li><li>标签2</li></ul>
- 标签要准确、有用
- 包含主题标签、技术标签、分类标签
- 便于搜索和分类
- 不要添加任何CSS类名或额外包装`;

          break;

        case 'outline':
          systemPrompt = `你是一个专业的内容创作助手。请生成详细的文章大纲，使用纯净HTML格式。`;

          prompt = `请为以下主题生成详细的文章大纲：

主题: ${params.title || params.prompt || '未指定'}
关键词: ${params.keywords || '未指定'}

要求：
- 使用 <h2> <h3> 等标题标签组织大纲结构
- 每个章节都要有详细的要点说明
- 使用 <ul> <li> 列出子要点
- 大纲要完整、逻辑清晰
- 适合写作1500字以上的文章
- 不要添加任何CSS类名或额外包装
- 不要包装在div容器中`;

          break;

        default:
          throw new Error('不支持的内容类型');
      }

      const messages = [
        {
          role: 'system',
          content: systemPrompt || '你是一个专业的富文本内容创作助手，请用中文回答。',
        },
        { role: 'user', content: prompt },
      ];

      const response = await aiConfig.chat(messages);

      // 处理返回内容，确保符合富文本组件要求
      const processedResponse = this.processContentForRichText(response, type);

      return processedResponse;
    } catch (error) {
      logger.error('内容生成功能执行失败', {
        error: error.message,
        type,
        params,
      });
      throw error;
    }
  }

  /**
   * 处理内容格式，确保符合TipTap编辑器要求
   * @param {string} content - 原始内容
   * @param {string} type - 内容类型
   * @returns {string} 处理后的内容
   */
  processContentForRichText(content, type = 'article') {
    if (!content || typeof content !== 'string') {
      return '<p></p>';
    }

    let processedContent = content.trim();

    // 移除 rich-text-content 包装（如果AI错误地添加了）
    processedContent = processedContent.replace(
      /<div[^>]*class="rich-text-content"[^>]*>([\s\S]*)<\/div>$/i,
      '$1'
    );

    // 如果内容包含Markdown语法，转换为HTML
    if (this.isMarkdownContent(processedContent)) {
      processedContent = this.markdownToHtml(processedContent);
    }

    // 移除所有 rich-text-* 类名（TipTap不需要）
    processedContent = processedContent.replace(/class="rich-text-[^"]*"/gi, '');

    // 清理空的class属性
    processedContent = processedContent.replace(/\s*class=""\s*/gi, ' ');

    // 确保代码块格式正确
    processedContent = processedContent.replace(
      /<pre>\s*<code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (match, language, code) => {
        return `<pre><code class="language-${language}">${code}</code></pre>`;
      }
    );

    // 如果内容为空，返回空段落
    if (!processedContent.trim()) {
      return '<p></p>';
    }

    return processedContent;
  }

  /**
   * 判断内容是否为Markdown格式
   * @param {string} content - 内容
   * @returns {boolean}
   */
  isMarkdownContent(content) {
    const markdownPatterns = [
      /^#{1,6}\s+/m, // 标题
      /\*\*[^*]+\*\*/, // 粗体
      /\*[^*\n]+\*/, // 斜体
      /^[-*+]\s+/m, // 无序列表
      /^\d+\.\s+/m, // 有序列表
      /^>\s+/m, // 引用
      /```[\s\S]*?```/, // 代码块
      /`[^`\n]+`/, // 内联代码
      /\[.+?\]\(.+?\)/, // 链接
      /!\[.*?\]\(.+?\)/, // 图片
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 将Markdown转换为HTML（TipTap兼容）
   * @param {string} markdown - Markdown内容
   * @returns {string} HTML内容
   */
  markdownToHtml(markdown) {
    let html = markdown;

    // 处理代码块（优先处理）
    html = html.replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, language, code) => {
      const lang = language || 'text';
      const escapedCode = code
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
    });

    // 处理内联代码（不添加class）
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // 处理标题
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      return `<h${level}>${title.trim()}</h${level}>`;
    });

    // 处理粗体和斜体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // 处理链接（不添加class）
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      return `<a href="${url}">${text}</a>`;
    });

    // 处理图片（不添加class）
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      return `<img src="${src}" alt="${alt}">`;
    });

    // 处理引用（不添加class）
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // 处理列表
    const lines = html.split('\n');
    const processedLines = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 有序列表
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(`<li>${lines[i].trim().replace(/^\d+\.\s+/, '')}</li>`);
          i++;
        }
        processedLines.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      // 无序列表
      if (/^[-*+]\s+/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          items.push(`<li>${lines[i].trim().replace(/^[-*+]\s+/, '')}</li>`);
          i++;
        }
        processedLines.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      processedLines.push(line);
      i++;
    }

    html = processedLines.join('\n');

    // 处理段落
    const finalLines = html.split('\n');
    const result = [];
    let currentParagraph = [];

    for (const line of finalLines) {
      const trimmed = line.trim();

      if (!trimmed || /^<(div|h[1-6]|ul|ol|blockquote|hr|table|pre|img)/.test(trimmed)) {
        if (currentParagraph.length > 0) {
          result.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        if (trimmed) {
          result.push(trimmed);
        }
      } else {
        currentParagraph.push(trimmed);
      }
    }

    if (currentParagraph.length > 0) {
      result.push(`<p>${currentParagraph.join(' ')}</p>`);
    }

    return result.join('\n');
  }

  /**
   * 为HTML内容添加富文本CSS类名
   * @param {string} html - HTML内容
   * @returns {string} 添加类名后的HTML
   */
  addRichTextClasses(html) {
    let styledHtml = html;

    // 处理代码块
    styledHtml = styledHtml.replace(
      /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (match, preAttr, codeAttr, code) => {
        if (match.includes('language-')) {
          return match;
        }

        // 提取语言
        const langMatch = (preAttr + codeAttr).match(
          /(?:class|data-language)=["'](?:language-)?([^"']*)['"]/
        );
        const lang = langMatch ? langMatch[1] : 'text';

        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      }
    );

    // 处理内联代码
    styledHtml = styledHtml.replace(
      /<code(?![^>]*class="rich-text)([^>]*)>(.*?)<\/code>/gi,
      '<code class="rich-text-inline-code"$1>$2</code>'
    );

    // 处理引用
    styledHtml = styledHtml.replace(
      /<blockquote(?![^>]*class="rich-text-quote")([^>]*)>/gi,
      '<blockquote class="rich-text-quote"$1>'
    );

    // 处理图片
    styledHtml = styledHtml.replace(
      /<img(?![^>]*class="rich-text-image")([^>]*?)src="([^"]*)"([^>]*?)>/gi,
      (match, before, src, after) => {
        const loadingAttr = /loading\s*=/.test(before + after) ? '' : ' loading="lazy"';
        return `<img class="rich-text-image"${loadingAttr} src="${src}"${before}${after}>`;
      }
    );

    // 处理链接
    styledHtml = styledHtml.replace(
      /<a(?![^>]*class="rich-text-link")([^>]*?)href="([^"]*)"([^>]*?)>/gi,
      (match, before, href, after) => {
        const hasTarget = /target\s*=/.test(before + after);
        const hasRel = /rel\s*=/.test(before + after);
        const targetAttr = hasTarget ? '' : ' target="_blank"';
        const relAttr = hasRel ? '' : ' rel="noopener noreferrer"';
        return `<a class="rich-text-link" href="${href}"${targetAttr}${relAttr}${before}${after}>`;
      }
    );

    return styledHtml;
  }

  /**
   * 智能分析功能
   * @param {string} type - 分析类型
   * @param {Object} data - 要分析的数据
   * @returns {Promise<string>} 分析结果
   */
  async analyze(type, data = {}) {
    try {
      if (!this.isAvailable) {
        throw new Error('AI服务不可用');
      }

      let prompt = '';

      switch (type) {
        case 'blog_stats':
          prompt = `请分析以下博客数据并提供改进建议：
文章数量: ${data.postCount || 0}
用户数量: ${data.userCount || 0}
评论数量: ${data.commentCount || 0}
阅读量: ${data.viewCount || 0}
发布时间分布: ${JSON.stringify(data.timeDistribution || {})}

请提供详细的分析和改进建议。`;
          break;

        case 'content_quality':
          prompt = `请分析以下文章内容的质量：
标题: ${data.title || '未指定'}
内容: ${data.content || '未提供内容'}

请从以下方面进行分析：
1. 内容质量
2. 可读性
3. SEO优化
4. 改进建议`;
          break;

        default:
          throw new Error('不支持的分析类型');
      }

      const messages = [
        { role: 'system', content: '你是一个专业的数据分析师，请用中文回答。' },
        { role: 'user', content: prompt },
      ];

      const response = await aiConfig.chat(messages);

      return response;
    } catch (error) {
      logger.error('智能分析功能执行失败', {
        error: error.message,
        type,
        data,
      });
      throw error;
    }
  }

  /**
   * 获取用户聊天历史
   * @param {string} userId - 用户ID
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Array>} 聊天历史
   */
  async getChatHistory(userId, sessionId = null) {
    try {
      const where = { userId, status: 'success' };
      if (sessionId) {
        where.sessionId = sessionId;
      }

      const chats = await AIChat.findAll({
        where,
        order: [['createdAt', 'ASC']],
        limit: 10,
      });

      const history = [];
      chats.forEach(chat => {
        history.push({ role: 'user', content: chat.message });
        history.push({ role: 'assistant', content: chat.response });
      });

      return history;
    } catch (error) {
      logger.error('获取聊天历史失败', {
        userId,
        sessionId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * 清除用户聊天历史
   * @param {string} userId - 用户ID
   * @param {string} sessionId - 会话ID
   */
  async clearChatHistory(userId, sessionId = null) {
    try {
      const where = { userId };
      if (sessionId) {
        where.sessionId = sessionId;
      }

      await AIChat.destroy({ where });
      logger.info('清除聊天历史成功', { userId, sessionId });
    } catch (error) {
      logger.error('清除聊天历史失败', {
        userId,
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 检查AI服务是否可用
   * @returns {boolean}
   */
  isServiceAvailable() {
    return this.isAvailable;
  }
}

// 创建全局AI服务实例
const aiService = new AIService();

module.exports = {
  aiService,
  AIService,
};
