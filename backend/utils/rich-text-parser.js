/**
 * 富文本解析工具类 - 后端版本
 * 提供统一的富文本处理、清理、样式化功能
 */
class RichTextParser {
  /**
   * 清理HTML内容，移除危险标签和属性
   * @param {string} html - 原始HTML字符串
   * @returns {string} 清理后的安全HTML
   */
  static sanitizeHtml(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // 简单的HTML清理，移除危险标签和属性
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  /**
   * 从HTML中提取纯文本
   * @param {string} html - HTML字符串
   * @returns {string} 纯文本内容
   */
  static extractText(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // 服务端环境的文本提取
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 计算阅读时间
   * @param {string} html - HTML内容
   * @param {number} wordsPerMinute - 每分钟阅读字数，默认200
   * @returns {number} 预估阅读时间（分钟）
   */
  static calculateReadingTime(html, wordsPerMinute = 200) {
    const text = this.extractText(html);
    return Math.max(1, Math.ceil(text.length / wordsPerMinute));
  }

  /**
   * 获取内容摘要
   * @param {string} html - HTML内容
   * @param {number} maxLength - 最大长度，默认150字
   * @returns {string} 内容摘要
   */
  static extractSummary(html, maxLength = 150) {
    const text = this.extractText(html);
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * 检查内容是否为空
   * @param {string} html - HTML内容
   * @returns {boolean} 是否为空内容
   */
  static isEmpty(html) {
    const text = this.extractText(html);
    return text.length === 0;
  }

  /**
   * 获取内容中的所有图片URL
   * @param {string} html - HTML内容
   * @returns {string[]} 图片URL数组
   */
  static extractImages(html) {
    if (!html || typeof html !== 'string') {
      return [];
    }

    const images = [];
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  /**
   * 获取内容中的所有链接
   * @param {string} html - HTML内容
   * @returns {Array<{text: string, href: string}>} 链接对象数组
   */
  static extractLinks(html) {
    if (!html || typeof html !== 'string') {
      return [];
    }

    const links = [];
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      links.push({
        href: match[1],
        text: this.extractText(match[2]),
      });
    }

    return links;
  }

  /**
   * 统计内容信息
   * @param {string} html - HTML内容
   * @returns {Object} 内容统计信息
   */
  static getContentStats(html) {
    const text = this.extractText(html);
    const images = this.extractImages(html);
    const links = this.extractLinks(html);
    const codeBlocks = (html.match(/<pre><code/gi) || []).length;

    return {
      textLength: text.length,
      wordCount: text.length, // 中文按字符计算
      readingTime: this.calculateReadingTime(html),
      imageCount: images.length,
      linkCount: links.length,
      codeBlockCount: codeBlocks,
      summary: this.extractSummary(html),
    };
  }

  /**
   * 验证HTML内容的有效性
   * @param {string} html - HTML内容
   * @param {Object} options - 验证选项
   * @returns {Object} 验证结果
   */
  static validateContent(html, options = {}) {
    const { maxLength = 10000, minLength = 1, requireText = true } = options;

    const errors = [];

    if (!html || typeof html !== 'string') {
      errors.push('内容不能为空');
      return { isValid: false, errors };
    }

    // 检查HTML长度
    if (html.length > maxLength) {
      errors.push(`内容长度不能超过 ${maxLength} 个字符`);
    }

    // 检查文本内容
    const text = this.extractText(html);
    if (requireText && text.length < minLength) {
      errors.push(`有效内容不能少于 ${minLength} 个字符`);
    }

    // 检查是否只包含空标签
    if (requireText && this.isEmpty(html)) {
      errors.push('内容不能为空');
    }

    return {
      isValid: errors.length === 0,
      errors,
      stats: this.getContentStats(html),
    };
  }
}

module.exports = RichTextParser;
