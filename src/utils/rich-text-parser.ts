/**
 * 富文本解析工具类
 * 提供统一的富文本处理、清理、样式化功能
 */
export class RichTextParser {
  // 系统支持的HTML标签白名单
  private static readonly ALLOWED_TAGS = [
    'div',
    'p',
    'span',
    'br',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'blockquote',
    'code',
    'pre',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
  ];

  // 系统支持的CSS类名白名单
  private static readonly ALLOWED_CLASSES = [
    'rich-text-content',
    'rich-text-code-block',
    'rich-text-inline-code',
    'rich-text-quote',
    'rich-text-link',
    'rich-text-image',
    'rich-text-table-wrapper',
    'rich-text-table',
  ];

  /**
   * 验证URL是否安全
   */
  private static isValidUrl(url: string): boolean {
    if (!url) return false;

    const allowedProtocols = ['http:', 'https:', 'data:', '/'];

    try {
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return true;
      }

      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * 清理HTML属性，只保留安全的属性
   */
  private static cleanAttributes(attributes: string, tagName: string): string {
    if (!attributes) return '';

    const allowedAttributes: Record<string, string[]> = {
      div: ['class', 'data-language'],
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'loading', 'class'],
      code: ['class'],
      pre: ['class', 'data-language'],
      blockquote: ['class'],
      table: ['class'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    };

    const allowed = allowedAttributes[tagName] || ['class'];
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    const cleanAttrs: string[] = [];
    let match;

    while ((match = attrRegex.exec(attributes)) !== null) {
      const [, attrName, attrValue] = match;

      if (allowed.includes(attrName)) {
        if (attrName === 'class') {
          const cleanClasses = attrValue
            .split(' ')
            .filter((cls) => this.ALLOWED_CLASSES.includes(cls) || cls.startsWith('language-'))
            .join(' ');
          if (cleanClasses) {
            cleanAttrs.push(`class="${cleanClasses}"`);
          }
        } else if (attrName === 'href' && this.isValidUrl(attrValue)) {
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        } else if (attrName === 'src' && this.isValidUrl(attrValue)) {
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        } else if (['target', 'rel', 'alt', 'loading', 'data-language', 'colspan', 'rowspan'].includes(attrName)) {
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        }
      }
    }

    return cleanAttrs.length > 0 ? ' ' + cleanAttrs.join(' ') : '';
  }

  /**
   * 验证并清理HTML标签
   */
  static validateAndCleanHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    let cleanHtml = html;

    // 移除不支持的标签，保留内容
    const tagRegex = /<(\/?)([\w-]+)([^>]*)>/gi;
    cleanHtml = cleanHtml.replace(tagRegex, (match, closing, tagName, attributes) => {
      const tag = tagName.toLowerCase();

      if (this.ALLOWED_TAGS.includes(tag)) {
        const cleanAttributes = this.cleanAttributes(attributes, tag);
        return `<${closing}${tag}${cleanAttributes}>`;
      }

      return '';
    });

    return cleanHtml;
  }

  /**
   * 清理HTML内容，移除危险标签和属性
   */
  static sanitizeHtml(html: string): string {
    // 先进行基础安全清理
    let cleanHtml = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');

    return this.validateAndCleanHtml(cleanHtml);
  }

  /**
   * 从HTML中提取纯文本
   */
  static extractText(html: string | null | undefined): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }

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
   */
  static calculateReadingTime(html: string | null | undefined, wordsPerMinute: number = 200): number {
    if (!html || typeof html !== 'string') {
      return 0;
    }

    const text = this.extractText(html);
    return Math.max(1, Math.ceil(text.length / wordsPerMinute));
  }

  /**
   * 获取内容摘要
   */
  static extractSummary(html: string | null | undefined, maxLength: number = 150): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    const text = this.extractText(html);
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * 将Markdown内容转换为HTML
   */
  static markdownToHtml(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

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

    // 处理内联代码
    html = html.replace(/`([^`\n]+)`/g, '<code class="rich-text-inline-code">$1</code>');

    // 处理标题
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      return `<h${level}>${title.trim()}</h${level}>`;
    });

    // 处理粗体和斜体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (this.isValidUrl(url)) {
        return `<a class="rich-text-link" href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return text;
    });

    // 处理图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      if (this.isValidUrl(src)) {
        return `<img class="rich-text-image" src="${src}" alt="${alt}" loading="lazy">`;
      }
      return '';
    });

    // 处理引用
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="rich-text-quote">$1</blockquote>');

    // 处理列表
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 有序列表
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(`<li>${lines[i].trim().replace(/^\d+\.\s+/, '')}</li>`);
          i++;
        }
        processedLines.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      // 无序列表
      if (/^[-*+]\s+/.test(trimmed)) {
        const items: string[] = [];
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
    const result: string[] = [];
    let currentParagraph: string[] = [];

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
   * 判断内容是否为Markdown格式
   */
  private static isMarkdown(content: string): boolean {
    if (!content) return false;

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

    // 检查代码块特征
    if (/```[\s\S]*?```/.test(content)) {
      return true;
    }

    // 至少匹配1个特征就认为是Markdown
    return markdownPatterns.filter((pattern) => pattern.test(content)).length >= 1;
  }

  /**
   * 为富文本内容添加统一的CSS类名和样式
   */
  static addContentStyles(html: string): string {
    if (!html) return '<div class="rich-text-content"></div>';

    let styledHtml = html;

    // 如果是Markdown，先转换为HTML
    if (this.isMarkdown(html)) {
      styledHtml = this.markdownToHtml(html);
      return `<div class="rich-text-content">${this.validateAndCleanHtml(styledHtml)}</div>`;
    }

    // 处理已有的HTML内容，添加必要的类名
    // 处理代码块 - 保持原始格式，只添加必要的类名
    styledHtml = styledHtml.replace(
      /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (match, preAttr, codeAttr, code) => {
        if (match.includes('rich-text-code-block')) {
          return match;
        }

        // 保持原始格式，不包装
        return match;
      },
    );

    // 处理内联代码
    styledHtml = styledHtml.replace(
      /<code(?![^>]*class="rich-text)([^>]*)>(.*?)<\/code>/gi,
      '<code class="rich-text-inline-code"$1>$2</code>',
    );

    // 处理引用
    styledHtml = styledHtml.replace(
      /<blockquote(?![^>]*class="rich-text-quote")([^>]*)>/gi,
      '<blockquote class="rich-text-quote"$1>',
    );

    // 处理图片
    styledHtml = styledHtml.replace(
      /<img(?![^>]*class="rich-text-image")([^>]*?)src="([^"]*)"([^>]*?)>/gi,
      (match, before, src, after) => {
        if (this.isValidUrl(src)) {
          const loadingAttr = /loading\s*=/.test(before + after) ? '' : ' loading="lazy"';
          return `<img class="rich-text-image"${loadingAttr} src="${src}"${before}${after}>`;
        }
        return '';
      },
    );

    // 处理链接
    styledHtml = styledHtml.replace(
      /<a(?![^>]*class="rich-text-link")([^>]*?)href="([^"]*)"([^>]*?)>/gi,
      (match, before, href, after) => {
        if (this.isValidUrl(href)) {
          const hasTarget = /target\s*=/.test(before + after);
          const hasRel = /rel\s*=/.test(before + after);
          const targetAttr = hasTarget ? '' : ' target="_blank"';
          const relAttr = hasRel ? '' : ' rel="noopener noreferrer"';
          return `<a class="rich-text-link" href="${href}"${targetAttr}${relAttr}${before}${after}>`;
        }
        return '';
      },
    );

    // 处理表格
    if (!styledHtml.includes('rich-text-table-wrapper')) {
      styledHtml = styledHtml.replace(
        /<table([^>]*)>/gi,
        '<div class="rich-text-table-wrapper"><table class="rich-text-table"$1>',
      );
      styledHtml = styledHtml.replace(/<\/table>/gi, '</table></div>');
    }

    const finalHtml = this.validateAndCleanHtml(styledHtml);
    return `<div class="rich-text-content">${finalHtml}</div>`;
  }

  /**
   * 检查内容是否为空
   */
  static isEmpty(html: string | null | undefined): boolean {
    if (!html || typeof html !== 'string') {
      return true;
    }

    const text = this.extractText(html);
    return text.length === 0;
  }

  /**
   * 获取内容中的所有图片URL
   */
  static extractImages(html: string | null | undefined): string[] {
    if (!html || typeof html !== 'string') {
      return [];
    }

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
   */
  static extractLinks(html: string | null | undefined): Array<{ text: string; href: string }> {
    if (!html || typeof html !== 'string') {
      return [];
    }

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
   */
  static getContentStats(html: string | null | undefined) {
    if (!html || typeof html !== 'string') {
      return {
        textLength: 0,
        wordCount: 0,
        readingTime: 0,
        imageCount: 0,
        linkCount: 0,
        codeBlockCount: 0,
        summary: '',
      };
    }

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
