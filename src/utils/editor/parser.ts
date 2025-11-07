/**
 * 富文本解析工具类
 * 提供统一的富文本处理、清理、样式化功能
 */
export class RichTextParser {
  // LRU缓存，存储解析结果（最多缓存50个结果）
  private static cache = new Map<string, { result: string; timestamp: number }>();
  private static readonly CACHE_MAX_SIZE = 50;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟过期

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
    's', // 删除线
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
    'mark', // 高亮
    'sub', // 下标
    'sup', // 上标
    'label', // 任务列表用
    'input', // 任务列表复选框
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
   * 从缓存获取结果
   */
  private static getCached(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * 存入缓存（LRU策略）
   */
  private static setCache(key: string, result: string): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除所有缓存
   */
  static clearCache(): void {
    this.cache.clear();
  }

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
   * 清理并验证 style 属性，只保留安全的 CSS 属性
   */
  private static cleanStyleAttribute(style: string): string {
    if (!style) return '';

    // 安全的 CSS 属性白名单
    const allowedStyles = [
      'color',
      'background-color',
      'font-size',
      'font-weight',
      'font-style',
      'text-decoration',
      'text-align',
      'width',
      'height',
      'max-width',
      'max-height',
      'margin',
      'padding',
      'display',
      'float',
    ];

    // 解析 style 字符串
    const styleRules = style.split(';').filter((rule) => rule.trim());
    const cleanRules: string[] = [];

    for (const rule of styleRules) {
      const [property, value] = rule.split(':').map((s) => s.trim());

      if (!property || !value) continue;

      // 检查是否为允许的属性
      if (allowedStyles.includes(property.toLowerCase())) {
        // 防止 CSS 注入（禁止 url()、expression() 等）
        if (
          !value.toLowerCase().includes('url(') &&
          !value.toLowerCase().includes('expression') &&
          !value.toLowerCase().includes('javascript:') &&
          !value.toLowerCase().includes('import')
        ) {
          cleanRules.push(`${property}: ${value}`);
        }
      }
    }

    return cleanRules.length > 0 ? cleanRules.join('; ') : '';
  }

  /**
   * 清理HTML属性，只保留安全的属性
   */
  private static cleanAttributes(attributes: string, tagName: string): string {
    if (!attributes) return '';

    const allowedAttributes: Record<string, string[]> = {
      div: ['class', 'data-language'],
      p: ['class', 'style'], // 段落支持样式
      span: ['class', 'style'], // span 支持样式（文字颜色等）
      h1: ['class', 'style', 'id'],
      h2: ['class', 'style', 'id'],
      h3: ['class', 'style', 'id'],
      h4: ['class', 'style', 'id'],
      h5: ['class', 'style', 'id'],
      h6: ['class', 'style', 'id'],
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'loading', 'class', 'width', 'height', 'style', 'data-align'],
      code: ['class'],
      pre: ['class', 'data-language'],
      blockquote: ['class'],
      table: ['class'],
      th: ['colspan', 'rowspan', 'class'],
      td: ['colspan', 'rowspan', 'class'],
      mark: ['class', 'style', 'data-color'], // 高亮支持样式和颜色标记
      ul: ['class', 'data-type'], // 任务列表需要 data-type
      li: ['class', 'data-type', 'data-checked'], // 任务项需要 data-type 和 data-checked
      input: ['type', 'checked', 'disabled'], // 任务列表复选框
      label: ['class'],
    };

    const allowed = allowedAttributes[tagName] || ['class'];

    // 匹配两种格式：attr="value" 和 attr (布尔属性)
    const attrWithValueRegex = /([\w-]+)=["']([^"']*)["']/g;
    const attrBooleanRegex = /\s([\w-]+)(?=\s|$|>)/g;
    const cleanAttrs: string[] = [];
    const processedAttrs = new Set<string>();

    let match;

    // 处理有值的属性
    while ((match = attrWithValueRegex.exec(attributes)) !== null) {
      const [, attrName, attrValue] = match;

      if (allowed.includes(attrName)) {
        processedAttrs.add(attrName);

        if (attrName === 'class') {
          const cleanClasses = attrValue
            .split(' ')
            .filter((cls) => this.ALLOWED_CLASSES.includes(cls) || cls.startsWith('language-'))
            .join(' ');
          if (cleanClasses) {
            cleanAttrs.push(`class="${cleanClasses}"`);
          }
        } else if (attrName === 'style') {
          // 清理并验证 style 属性
          const cleanStyle = this.cleanStyleAttribute(attrValue);
          if (cleanStyle) {
            cleanAttrs.push(`style="${cleanStyle}"`);
          }
        } else if (attrName === 'href' && this.isValidUrl(attrValue)) {
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        } else if (attrName === 'src' && this.isValidUrl(attrValue)) {
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        } else if (
          [
            'target',
            'rel',
            'alt',
            'loading',
            'data-language',
            'colspan',
            'rowspan',
            'width',
            'height',
            'data-align',
            'data-color',
            'data-type',
            'data-checked',
            'type',
            'id',
          ].includes(attrName)
        ) {
          cleanAttrs.push(`${attrName}="${attrValue}"`);
        }
      }
    }

    // 处理布尔属性（checked、disabled 等）
    while ((match = attrBooleanRegex.exec(attributes)) !== null) {
      const attrName = match[1];

      if (allowed.includes(attrName) && !processedAttrs.has(attrName)) {
        if (['checked', 'disabled'].includes(attrName)) {
          cleanAttrs.push(attrName);
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

    // 清理空标签（包括只包含空白的标签）
    cleanHtml = this.removeEmptyTags(cleanHtml);

    return cleanHtml;
  }

  /**
   * 移除空标签和只包含空白的标签
   */
  private static removeEmptyTags(html: string): string {
    let cleaned = html;
    let previousLength;

    // 多次迭代，直到没有更多的空标签被移除
    do {
      previousLength = cleaned.length;

      // 移除空的标签（包括只包含空白、换行、&nbsp; 的标签）
      cleaned = cleaned.replace(/<(\w+)([^>]*)>\s*<\/\1>/gi, '');
      cleaned = cleaned.replace(/<(\w+)([^>]*)>(&nbsp;|\s)*<\/\1>/gi, '');

      // 移除多余的连续空白
      cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    } while (cleaned.length < previousLength);

    return cleaned;
  }

  /**
   * 清理标签之间的多余空白和换行符（保留pre/code标签内的内容）
   */
  private static cleanWhitespaceBetweenTags(html: string): string {
    // 1. 先提取并保护 pre/code 标签的内容
    const protectedBlocks: string[] = [];
    let processed = html;

    // 提取 pre>code 块
    processed = processed.replace(/<pre[^>]*>\s*<code[^>]*>[\s\S]*?<\/code>\s*<\/pre>/gi, (match) => {
      protectedBlocks.push(match);
      return `%%%PROTECTED_BLOCK_${protectedBlocks.length - 1}%%%`;
    });

    // 2. 清理标签之间的空白
    processed = processed
      // 移除 > 和 < 之间的所有空白和换行（包括 \n, \r, \t, 空格）
      .replace(/>\s+</g, '><')
      // 移除标签内部的多余空白（但保留单个空格）
      .replace(/\s{2,}/g, ' ')
      // 移除开头和结尾的空白
      .trim();

    // 3. 恢复被保护的代码块
    protectedBlocks.forEach((block, index) => {
      processed = processed.replace(`%%%PROTECTED_BLOCK_${index}%%%`, block);
    });

    return processed;
  }

  /**
   * 清理HTML内容，移除危险标签和属性
   */
  static sanitizeHtml(html: string): string {
    if (!html) return '';

    // 尝试从缓存获取
    const cacheKey = `sanitize:${html}`;
    const cached = this.getCached(cacheKey);
    if (cached !== null) return cached;

    // 先进行基础安全清理
    const cleanHtml = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');

    const result = this.validateAndCleanHtml(cleanHtml);

    // 存入缓存
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * 从HTML中提取纯文本
   * 注意：为了避免浏览器自动加载图片，会先移除所有图片标签
   */
  static extractText(html: string | null | undefined): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // 移除所有图片标签，避免浏览器解析 HTML 时自动加载图片
    const htmlWithoutImages = html.replace(/<img[^>]*>/gi, '');

    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = htmlWithoutImages;
      return div.textContent || div.innerText || '';
    }

    return htmlWithoutImages
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
      // 注意：不要 trim()，保留原始的空白和换行
      const escapedCode = code
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

    // 尝试从缓存获取
    const cacheKey = `styles:${html}`;
    const cached = this.getCached(cacheKey);
    if (cached !== null) return cached;

    let styledHtml = html;

    // 如果是Markdown，先转换为HTML
    if (this.isMarkdown(html)) {
      styledHtml = this.markdownToHtml(html);
      return `<div class="rich-text-content">${this.validateAndCleanHtml(styledHtml)}</div>`;
    }

    // 清理标签之间的多余换行和空白（但保留pre/code标签内的空白）
    styledHtml = this.cleanWhitespaceBetweenTags(styledHtml);

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
    const result = `<div class="rich-text-content">${finalHtml}</div>`;

    // 存入缓存
    this.setCache(cacheKey, result);

    return result;
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
