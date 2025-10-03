import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import { RichTextParser } from '@/utils/rich-text-parser';
import CodeBlock from './code-block';
import ImagePreview from './image-preview';

// 富文本内容容器
const RichTextContainer = styled.div`
  /* 基础样式 */
  .rich-text-content {
    color: var(--text-primary);
    line-height: 1.8;
    word-wrap: break-word;

    /* 段落样式 */
    p {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    /* 标题样式 */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-weight: 600;
      line-height: 1.4;
      margin: 2rem 0 1rem;
      color: var(--text-primary);

      &:first-of-type {
        margin-top: 0;
      }
    }

    h1 {
      font-size: 2rem;
      border-bottom: 3px solid var(--accent-color);
      padding-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.6rem;
      position: relative;
      padding-bottom: 0.5rem;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 3px;
        background: var(--accent-color);
        border-radius: 2px;
      }
    }

    h3 {
      font-size: 1.3rem;
    }

    h4 {
      font-size: 1.1rem;
    }

    h5,
    h6 {
      font-size: 1rem;
    }

    /* 列表样式 */
    ul,
    ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;

      li {
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      /* 嵌套列表 */
      ul,
      ol {
        margin: 0.5rem 0;
      }
    }

    ul {
      list-style-type: disc;

      ul {
        list-style-type: circle;

        ul {
          list-style-type: square;
        }
      }
    }

    ol {
      list-style-type: decimal;

      ol {
        list-style-type: lower-alpha;

        ol {
          list-style-type: lower-roman;
        }
      }
    }

    /* 引用样式 */
    blockquote,
    .rich-text-quote {
      margin: 1.5rem 0;
      padding: 1rem 1.5rem;
      border-left: 4px solid var(--accent-color);
      background: var(--bg-secondary);
      border-radius: 0 8px 8px 0;
      position: relative;

      &::before {
        content: '"';
        position: absolute;
        top: -0.5rem;
        left: 1rem;
        font-size: 2rem;
        color: var(--accent-color);
        opacity: 0.3;
        font-family: serif;
      }

      p {
        margin-bottom: 0;
        font-style: italic;

        &:not(:last-child) {
          margin-bottom: 1rem;
        }
      }
    }

    /* 内联代码样式 */
    code,
    .rich-text-inline-code {
      font-family: var(--font-code);
      background: var(--bg-secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
      color: var(--accent-color);
      border: 1px solid var(--border-color);
    }

    /* 链接样式 */
    a,
    .rich-text-link {
      color: var(--accent-color);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s ease;

      &:hover {
        border-bottom-color: var(--accent-color);
        opacity: 0.8;
      }

      &:visited {
        color: var(--accent-color);
        opacity: 0.7;
      }
    }

    /* 表格样式 */
    .rich-text-table-wrapper {
      margin: 1.5rem 0;
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .rich-text-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;

      th,
      td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
      }

      th {
        background: var(--bg-secondary);
        font-weight: 600;
        color: var(--text-primary);
      }

      tbody tr {
        &:nth-of-type(even) {
          background: rgba(var(--accent-color-rgb), 0.05);
        }

        @media (hover: hover) {
          transition: background-color 0.2s ease;

          &:hover {
            background: var(--bg-secondary);
          }
        }
      }
    }

    /* 分割线样式 */
    hr {
      margin: 2rem 0;
      border: none;
      height: 2px;
      background: linear-gradient(to right, var(--accent-color), transparent);
      border-radius: 1px;
    }

    /* 强调样式 */
    strong,
    b {
      font-weight: 600;
      color: var(--text-primary);
    }

    em,
    i {
      font-style: italic;
    }

    u {
      text-decoration: underline;
      text-decoration-color: var(--accent-color);
    }

    /* 响应式调整 */
    @media (max-width: 768px) {
      h1 {
        font-size: 1.6rem;
      }

      h2 {
        font-size: 1.4rem;
      }

      h3 {
        font-size: 1.2rem;
      }

      ul,
      ol {
        padding-left: 1.5rem;
      }

      blockquote,
      .rich-text-quote {
        padding: 0.75rem 1rem;
        margin: 1rem 0;
      }

      .rich-text-table-wrapper {
        font-size: 0.8rem;
      }
    }
  }
`;

// 组件接口
interface RichTextRendererProps {
  content: string;
  className?: string;
  mode?: 'article' | 'note' | 'comment';
  enableCodeHighlight?: boolean;
  enableImagePreview?: boolean;
  enableTableOfContents?: boolean;
  onImageClick?: (src: string) => void;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className,
  mode = 'article',
  enableCodeHighlight = true,
  enableImagePreview = true,
  enableTableOfContents = false,
  onImageClick,
}) => {
  // 处理内容样式化和安全清理
  const processedContent = useMemo(() => {
    if (!content) return '';
    const sanitized = RichTextParser.sanitizeHtml(content);
    const styled = RichTextParser.addContentStyles(sanitized);
    return styled;
  }, [content]);

  // 提取目录
  const tableOfContents = useMemo(() => {
    if (!enableTableOfContents) return [];

    const headings: Array<{ level: number; text: string; id: string }> = [];
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    let match;

    while ((match = headingRegex.exec(processedContent)) !== null) {
      const level = parseInt(match[1]);
      const text = RichTextParser.extractText(match[2]);
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-');
      headings.push({ level, text, id });
    }

    return headings;
  }, [processedContent, enableTableOfContents]);

  // 解析 HTML 为 React 元素（使用 useMemo 缓存整个解析结果）
  const parsedContent = useMemo(() => {
    if (!processedContent) return null;

    // 计数器，用于生成唯一的 key
    let codeBlockCounter = 0;
    let imageCounter = 0;

    // HTML 解析选项
    const parserOptions: HTMLReactParserOptions = {
      replace: (domNode) => {
        if (!(domNode instanceof Element)) return;

        const element = domNode as Element;

        // 处理代码块
        if (enableCodeHighlight && element.attribs?.class?.includes('rich-text-code-block')) {
          const language = element.attribs['data-language'] || 'text';

          // 从 pre > code 中提取代码内容
          const preElement = element.children?.find((child: any) => child.name === 'pre') as any;
          const codeElement = preElement?.children?.find((child: any) => child.name === 'code') as any;

          if (codeElement?.children) {
            // 提取文本内容
            const extractText = (node: any): string => {
              if (node.type === 'text') return node.data;
              if (node.children) {
                return node.children.map(extractText).join('');
              }
              return '';
            };

            const code = codeElement.children.map(extractText).join('');

            // 解码 HTML 实体
            const decodedCode = code
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");

            return (
              <CodeBlock
                key={`code-${codeBlockCounter++}`}
                code={decodedCode}
                language={language}
                showLineNumbers={true}
                allowCopy={true}
                allowFullscreen={true}
              />
            );
          }
        }

        // 处理图片
        if (enableImagePreview && element.name === 'img' && element.attribs?.class?.includes('rich-text-image')) {
          const src = element.attribs.src;
          const alt = element.attribs.alt || '';

          if (src) {
            return (
              <div key={`image-${imageCounter++}`} style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                <ImagePreview src={src} alt={alt} onClick={onImageClick ? () => onImageClick(src) : undefined} />
              </div>
            );
          }
        }

        // 处理 h2 标题（文章模式）
        if (mode === 'article' && element.name === 'h2' && element.children) {
          const text = element.children.map((child: any) => (child.type === 'text' ? child.data : '')).join('');
          const id = `heading-${text
            ?.toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
            .substring(0, 50)}`;

          return (
            <h2 id={id} className="article-heading">
              {domToReact(element.children as any, parserOptions)}
            </h2>
          );
        }

        // 默认返回 undefined，让解析器使用默认处理
        return undefined;
      },
    };

    try {
      return parse(processedContent, parserOptions);
    } catch (error) {
      console.error('解析 HTML 失败:', error);
      return <div>内容解析失败</div>;
    }
  }, [processedContent, enableCodeHighlight, enableImagePreview, onImageClick, mode]);

  return (
    <RichTextContainer className={className} data-mode={mode}>
      {/* 目录 */}
      {enableTableOfContents && tableOfContents.length > 0 && (
        <div
          className="table-of-contents"
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}
        >
          <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>目录</h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {tableOfContents.map((item, index) => (
              <li
                key={index}
                style={{
                  marginLeft: `${(item.level - 1) * 1}rem`,
                  marginBottom: '0.5rem',
                }}
              >
                <a
                  href={`#${item.id}`}
                  style={{
                    color: 'var(--accent-color)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 主要内容 */}
      {parsedContent}
    </RichTextContainer>
  );
};

export default RichTextRenderer;
