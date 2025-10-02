/**
 * 富文本解析工具类
 * 提供统一的富文本处理、清理、样式化功能
 */
export class RichTextParser {
  // 系统支持的HTML标签白名单
  private static readonly ALLOWED_TAGS = [
    // 基础结构标签
    'div', 'p', 'span', 'br',
    // 标题标签
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // 列表标签
    'ul', 'ol', 'li',
    // 文本格式标签
    'strong', 'b', 'em', 'i', 'u',
    // 引用和代码标签
    'blockquote', 'code', 'pre',
    // 链接和图片标签
    'a', 'img',
    // 表格标签
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // 分割线
    'hr'
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
    'rich-text-table'
  ];

  /**
   * 验证并清理HTML标签，确保只包含系统支持的标签
   * @param html - 原始HTML字符串
   * @returns 清理后的安全HTML
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
      
      // 如果是支持的标签，保留
      if (this.ALLOWED_TAGS.includes(tag)) {
        // 清理属性，只保留安全的属性
        const cleanAttributes = this.cleanAttributes(attributes, tag);
        return `<${closing}${tag}${cleanAttributes}>`;
      }
      
      // 不支持的标签，移除标签但保留内容
      return '';
    });

    return cleanHtml;
  }

  /**
   * 清理HTML属性，只保留安全的属性
   * @param attributes - 属性字符串
   * @param tagName - 标签名
   * @returns 清理后的属性字符串
   */
  private static cleanAttributes(attributes: string, tagName: string): string {
    if (!attributes) return '';

    const allowedAttributes: Record<string, string[]> = {
      'div': ['class', 'data-language'],
      'a': ['href', 'target', 'rel', 'class'],
      'img': ['src', 'alt', 'loading', 'class'],
      'code': ['class'],
      'pre': ['class'],
      'blockquote': ['class'],
      'table': ['class'],
      'th': ['colspan', 'rowspan'],
      'td': ['colspan', 'rowspan']
    };

    const allowed = allowedAttributes[tagName] || ['class'];
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    const cleanAttrs: string[] = [];
    let match;

    while ((match = attrRegex.exec(attributes)) !== null) {
      const [, attrName, attrValue] = match;
      
      if (allowed.includes(attrName)) {
        // 特殊处理class属性
        if (attrName === 'class') {
          const cleanClasses = attrValue
            .split(' ')
            .filter(cls => this.ALLOWED_CLASSES.includes(cls) || cls.startsWith('language-'))
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
   * 验证URL是否安全
   * @param url - URL字符串
   * @returns 是否为安全URL
   */
  private static isValidUrl(url: string): boolean {
    if (!url) return false;
    
    // 允许的协议
    const allowedProtocols = ['http:', 'https:', 'data:', '/'];
    
    try {
      // 相对路径
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return true;
      }
      
      // 绝对URL
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * 清理HTML内容，移除危险标签和属性
   * @param html - 原始HTML字符串
   * @returns 清理后的安全HTML
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

    // 然后进行标签验证和清理
    return this.validateAndCleanHtml(cleanHtml);
  }

  /**
   * 从HTML中提取纯文本
   * @param html - HTML字符串
   * @returns 纯文本内容
   */
  static extractText(html: string | null | undefined): string {
    // 类型安全检查
    if (!html || typeof html !== 'string') {
      return '';
    }

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
  static calculateReadingTime(html: string | null | undefined, wordsPerMinute: number = 200): number {
    // 类型安全检查
    if (!html || typeof html !== 'string') {
      return 0;
    }

    const text = this.extractText(html);
    return Math.max(1, Math.ceil(text.length / wordsPerMinute));
  }

  /**
   * 获取内容摘要
   * @param html - HTML内容
   * @param maxLength - 最大长度，默认150字
   * @returns 内容摘要
   */
  static extractSummary(html: string | null | undefined, maxLength: number = 150): string {
    // 类型安全检查
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
   * @param markdown - Markdown字符串
   * @returns 转换后的HTML字符串
   */
  static markdownToHtml(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    let html = markdown;

    // 处理代码块（优先处理，避免与其他语法冲突）
    html = html.replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, language, code) => {
      const lang = language || 'text';
      // 确保代码内容被正确转义并包装在pre>code结构中
      const escapedCode = code.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return `<div class="rich-text-code-block" data-language="${lang}"><pre><code>${escapedCode}</code></pre></div>`;
    });

    // 处理标题 (# ## ### ####)
    html = html.replace(/^(#{1,4})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      return `<h${level}>${title.trim()}</h${level}>`;
    });

    // 处理分割线
    html = html.replace(/^(---|\*\*\*)\s*$/gm, '<hr>');

    // 处理引用
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="rich-text-quote">$1</blockquote>');

    // 处理有序列表
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // 将连续的<li>包装在<ol>中
    html = html.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, (match) => {
      // 避免重复包装
      if (match.includes('<ol>') || match.includes('<ul>')) return match;
      return `<ol>${match}</ol>`;
    });

    // 处理无序列表
    html = html.replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>');
    // 将剩余的连续<li>包装在<ul>中
    html = html.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, (match) => {
      // 避免重复包装已经在ol中的li
      if (match.includes('<ol>') || match.includes('<ul>')) return match;
      return `<ul>${match}</ul>`;
    });

    // 处理内联代码
    html = html.replace(/`([^`]+)`/g, '<code class="rich-text-inline-code">$1</code>');

    // 处理粗体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 处理斜体
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (this.isValidUrl(url)) {
        return `<a class="rich-text-link" href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return text; // 如果URL无效，只保留文本
    });

    // 处理图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      if (this.isValidUrl(src)) {
        return `<img class="rich-text-image" src="${src}" alt="${alt}" loading="lazy">`;
      }
      return ''; // 如果URL无效，移除图片
    });

    // 处理表格（简单的表格支持）
    const tableRegex = /^\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm;
    html = html.replace(tableRegex, (match, header, rows) => {
      const headerCells = header.split('|').map((cell: string) => `<th>${cell.trim()}</th>`).join('');
      const bodyRows = rows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').slice(1, -1).map((cell: string) => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      
      return `<div class="rich-text-table-wrapper">
        <table class="rich-text-table">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
    });

    // 处理段落（将连续的非HTML行包装为段落）
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let currentParagraph: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 如果是空行或HTML标签行，结束当前段落
      if (!trimmedLine || trimmedLine.startsWith('<')) {
        if (currentParagraph.length > 0) {
          processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        if (trimmedLine) {
          processedLines.push(trimmedLine);
        }
      } else {
        // 普通文本行，添加到当前段落
        currentParagraph.push(trimmedLine);
      }
    }

    // 处理最后一个段落
    if (currentParagraph.length > 0) {
      processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
    }

    return processedLines.join('\n');
  }

  /**
   * 为富文本内容添加统一的CSS类名和样式
   * @param html - 原始HTML
   * @returns 带有样式类的HTML
   */
  static addContentStyles(html: string): string {
    let styledHtml = html;

    // 如果输入看起来像Markdown，先转换为HTML
    if (this.isMarkdown(html)) {
      styledHtml = this.markdownToHtml(html);
    }

    // 检查是否已经有处理过的代码块（避免重复处理）
    const existingCodeBlocks = styledHtml.match(/<div class="rich-text-code-block"[^>]*>/g);

    // 只有在没有已处理的代码块时，才处理Markdown风格的代码块
    if (!existingCodeBlocks || existingCodeBlocks.length === 0) {
      styledHtml = styledHtml.replace(
        /```(\w+)?\s*\n([\s\S]*?)\n```/g,
        (match, language, code) => {
          const lang = language || 'text';
          // 确保代码内容被正确转义
          const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          return `<div class="rich-text-code-block" data-language="${lang}"><pre><code>${escapedCode}</code></pre></div>`;
        }
      );
    }

    // 为代码块添加特殊类名，支持语言检测 (先处理嵌套的pre+code)
    styledHtml = styledHtml.replace(
      /<pre[^>]*>\s*<code(?:\s+class="language-([^"]*)")?[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (match, language, code) => {
        // 跳过已经被处理过的内容
        if (match.includes('rich-text-code-block')) {
          return match;
        }
        
        // 解码HTML实体
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        const lang = language || 'text';
        return `<div class="rich-text-code-block" data-language="${lang}"><pre><code>${code}</code></pre></div>`;
      }
    );

    // 处理没有嵌套code标签的pre标签 (确保不会重复处理已经转换的内容)
    styledHtml = styledHtml.replace(
      /<pre(?:\s+class="language-([^"]*)")?(?:\s+[^>]*)?>(?!\s*<code)([\s\S]*?)<\/pre>/gi,
      (match, language, code) => {
        // 跳过已经被处理过的内容
        if (match.includes('rich-text-code-block')) {
          return match;
        }
        
        // 解码HTML实体
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        const lang = language || 'text';
        return `<div class="rich-text-code-block" data-language="${lang}"><pre><code>${code}</code></pre></div>`;
      }
    );

    // 为内联代码添加类名（排除已经处理的代码块）
    styledHtml = styledHtml.replace(
      /<code(?![^>]*class="rich-text-code-block")([^>]*)>(.*?)<\/code>/gi, 
      '<code class="rich-text-inline-code"$1>$2</code>'
    );

    // 为引用块添加类名
    styledHtml = styledHtml.replace(
      /<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi,
      '<blockquote class="rich-text-quote"$1>$2</blockquote>',
    );

    // 为图片添加类名和懒加载
    styledHtml = styledHtml.replace(
      /<img([^>]*?)src="([^"]*)"([^>]*?)>/gi,
      (match, before, src, after) => {
        if (this.isValidUrl(src)) {
          // 检查是否已经有class属性
          const hasClass = /class\s*=/.test(before + after);
          const classAttr = hasClass ? '' : ' class="rich-text-image"';
          const loadingAttr = /loading\s*=/.test(before + after) ? '' : ' loading="lazy"';
          return `<img${classAttr}${loadingAttr} src="${src}"${before}${after}>`;
        }
        return ''; // 移除无效的图片标签
      }
    );

    // 为链接添加安全属性
    styledHtml = styledHtml.replace(
      /<a([^>]*?)href="([^"]*)"([^>]*?)>/gi,
      (match, before, href, after) => {
        if (this.isValidUrl(href)) {
          // 检查是否已经有必要的属性
          const hasClass = /class\s*=/.test(before + after);
          const hasTarget = /target\s*=/.test(before + after);
          const hasRel = /rel\s*=/.test(before + after);
          
          const classAttr = hasClass ? '' : ' class="rich-text-link"';
          const targetAttr = hasTarget ? '' : ' target="_blank"';
          const relAttr = hasRel ? '' : ' rel="noopener noreferrer"';
          
          return `<a${classAttr} href="${href}"${targetAttr}${relAttr}${before}${after}>`;
        }
        return ''; // 移除无效的链接标签
      }
    );

    // 为表格添加类名
    styledHtml = styledHtml.replace(
      /<table([^>]*)>/gi,
      '<div class="rich-text-table-wrapper"><table class="rich-text-table"$1>',
    );
    styledHtml = styledHtml.replace(/<\/table>/gi, '</table></div>');

    // 最后进行完整的安全验证和清理
    const finalHtml = this.validateAndCleanHtml(styledHtml);
    
    return `<div class="rich-text-content">${finalHtml}</div>`;
  }

  /**
   * 判断内容是否为Markdown格式
   * @param content - 内容字符串
   * @returns 是否为Markdown格式
   */
  private static isMarkdown(content: string): boolean {
    if (!content) return false;
    
    // 检查Markdown特征
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // 标题
      /\*\*[^*]+\*\*/,         // 粗体 (移除行首限制)
      /\*[^*\n]+\*/,           // 斜体 (移除行首限制，避免与列表冲突)
      /^[-*+]\s+/m,            // 无序列表
      /^\d+\.\s+/m,            // 有序列表
      /^>\s+/m,                // 引用
      /```[\s\S]*?```/,        // 代码块
      /`[^`\n]+`/,             // 内联代码
      /\[.+?\]\(.+?\)/,        // 链接 (使用非贪婪匹配)
      /!\[.*?\]\(.+?\)/,       // 图片 (使用非贪婪匹配)
    ];
    
    // 检查匹配的特征
    const matches = markdownPatterns.filter(pattern => pattern.test(content));
    
    // 如果包含代码块，直接认为是Markdown
    if (/```[\s\S]*?```/.test(content)) {
      return true;
    }
    
    // 至少匹配1个特征就认为是Markdown (降低阈值)
    return matches.length >= 1;
  }

  /**
   * 检查内容是否为空
   * @param html - HTML内容
   * @returns 是否为空内容
   */
  static isEmpty(html: string | null | undefined): boolean {
    // 类型安全检查
    if (!html || typeof html !== 'string') {
      return true;
    }

    const text = this.extractText(html);
    return text.length === 0;
  }

  /**
   * 获取内容中的所有图片URL
   * @param html - HTML内容
   * @returns 图片URL数组
   */
  static extractImages(html: string | null | undefined): string[] {
    // 类型安全检查
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
   * @param html - HTML内容
   * @returns 链接对象数组 {text, href}
   */
  static extractLinks(html: string | null | undefined): Array<{ text: string; href: string }> {
    // 类型安全检查
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
   * @param html - HTML内容
   * @returns 内容统计信息
   */
  static getContentStats(html: string | null | undefined) {
    // 类型安全检查
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

// 调试和测试函数
export const testRichTextParser = (content: string) => {
  console.log('=== 富文本解析器测试 ===');
  console.log('原始内容:', content);
  console.log('是否为Markdown:', RichTextParser['isMarkdown'](content));
  
  const processed = RichTextParser.addContentStyles(content);
  console.log('处理后的HTML:', processed);
  
  return processed;
};
