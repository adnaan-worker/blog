/**
 * 富文本解析工具类
 * 提供统一的富文本处理、清理、样式化功能
 */
export class RichTextParser {
  /**
   * 清理HTML内容，移除危险标签和属性
   * @param html - 原始HTML字符串
   * @returns 清理后的安全HTML
   */
  static sanitizeHtml(html: string): string {
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
   * @param html - HTML字符串
   * @returns 纯文本内容
   */
  static extractText(html: string): string {
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }

    // 服务端环境的简单文本提取
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * 计算阅读时间
   * @param html - HTML内容
   * @param wordsPerMinute - 每分钟阅读字数，默认200
   * @returns 预估阅读时间（分钟）
   */
  static calculateReadingTime(html: string, wordsPerMinute: number = 200): number {
    const text = this.extractText(html);
    return Math.max(1, Math.ceil(text.length / wordsPerMinute));
  }

  /**
   * 获取内容摘要
   * @param html - HTML内容
   * @param maxLength - 最大长度，默认150字
   * @returns 内容摘要
   */
  static extractSummary(html: string, maxLength: number = 150): string {
    const text = this.extractText(html);
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * 为富文本内容添加统一的CSS类名和样式
   * @param html - 原始HTML
   * @returns 带有样式类的HTML
   */
  static addContentStyles(html: string): string {
    let styledHtml = html;

    // 为代码块添加特殊类名，以便后续替换为自定义组件
    styledHtml = styledHtml.replace(
      /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
      '<div class="rich-text-code-block" data-language="$1">$2</div>',
    );

    // 为内联代码添加类名
    styledHtml = styledHtml.replace(/<code([^>]*)>(.*?)<\/code>/gi, '<code class="rich-text-inline-code"$1>$2</code>');

    // 为引用块添加类名
    styledHtml = styledHtml.replace(
      /<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi,
      '<blockquote class="rich-text-quote"$1>$2</blockquote>',
    );

    // 为图片添加类名和懒加载
    styledHtml = styledHtml.replace(
      /<img([^>]*?)src="([^"]*)"([^>]*?)>/gi,
      '<img class="rich-text-image" loading="lazy" src="$2"$1$3>',
    );

    // 为链接添加安全属性
    styledHtml = styledHtml.replace(
      /<a([^>]*?)href="([^"]*)"([^>]*?)>/gi,
      '<a class="rich-text-link" href="$2" target="_blank" rel="noopener noreferrer"$1$3>',
    );

    // 为表格添加类名
    styledHtml = styledHtml.replace(
      /<table([^>]*)>/gi,
      '<div class="rich-text-table-wrapper"><table class="rich-text-table"$1>',
    );
    styledHtml = styledHtml.replace(/<\/table>/gi, '</table></div>');

    return `<div class="rich-text-content">${styledHtml}</div>`;
  }

  /**
   * 检查内容是否为空
   * @param html - HTML内容
   * @returns 是否为空内容
   */
  static isEmpty(html: string): boolean {
    const text = this.extractText(html);
    return text.length === 0;
  }

  /**
   * 获取内容中的所有图片URL
   * @param html - HTML内容
   * @returns 图片URL数组
   */
  static extractImages(html: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  /**
   * 获取内容中的所有链接
   * @param html - HTML内容
   * @returns 链接对象数组 {text, href}
   */
  static extractLinks(html: string): Array<{ text: string; href: string }> {
    const links: Array<{ text: string; href: string }> = [];
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
   * @param html - HTML内容
   * @returns 内容统计信息
   */
  static getContentStats(html: string) {
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
}

// 导出便捷方法
export const {
  sanitizeHtml,
  extractText,
  calculateReadingTime,
  extractSummary,
  addContentStyles,
  isEmpty,
  extractImages,
  extractLinks,
  getContentStats,
} = RichTextParser;
