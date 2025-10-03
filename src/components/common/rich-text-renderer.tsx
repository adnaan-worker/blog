import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // GitHub 风格的代码高亮主题
import '@/styles/rich-text.css'; // 导入您的富文本样式
import { RichTextParser } from '@/utils/rich-text-parser';
import ImagePreview from './image-preview';
import CodeBlock from './code-block';

// 富文本内容容器
const RichTextContainer = styled.div`
  /* 代码高亮样式覆盖，适配主题 */
  .hljs {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border-radius: 8px;
    padding: 1rem;
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
    overflow-x: auto;
    position: relative;
    font-family: var(--font-code, 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace);
    font-size: 0.9rem;
    line-height: 1.5;

    &[data-language]::before {
      content: attr(data-language);
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: var(--accent-color);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      z-index: 1;
    }

    &[data-language='']::before {
      display: none;
    }
  }

  /* 内联代码样式 */
  .hljs-inline {
    background: var(--bg-secondary);
    color: var(--accent-color);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    border: 1px solid var(--border-color);
    font-family: var(--font-code, 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace);
  }

  /* 代码块包装器 */
  .code-block-wrapper {
    position: relative;
    margin: 1.5rem 0;

    /* 复制按钮 */
    &:hover .copy-button {
      opacity: 1 !important;
    }

    /* 代码块样式 */
    pre {
      position: relative;
      background: var(--bg-secondary) !important;
      color: var(--text-primary) !important;
      border-radius: 8px;
      padding: 1rem;
      margin: 0;
      border: 1px solid var(--border-color);
      overflow-x: auto;
      font-family: var(--font-code, 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace);
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }

  .copy-button {
    position: absolute;
    top: 1rem;
    right: 3rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
    z-index: 2;
    color: var(--text-primary);

    &:hover {
      background: var(--bg-secondary);
      opacity: 1 !important;
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

    // 使用统一的富文本处理工具
    return RichTextParser.addContentStyles(content);
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

  // HTML 解析选项
  const parserOptions: HTMLReactParserOptions = useMemo(
    () => ({
      replace: (domNode) => {
        if (!(domNode instanceof Element)) return;
        const element = domNode as Element;

        // 处理代码块 - 使用新的 CodeBlock 组件
        if (
          enableCodeHighlight &&
          element.name === 'pre' &&
          element.children?.some((child: any) => child.name === 'code')
        ) {
          const codeElement = element.children?.find((child: any) => child.name === 'code') as any;
          let language = '';

          // 从 pre 标签的 data-language 属性获取
          if (element.attribs?.['data-language']) {
            language = element.attribs['data-language'];
          }

          // 从 pre 标签的 class 中提取语言
          if (!language && element.attribs?.class) {
            const classMatch = element.attribs.class.match(/language-(\w+)/);
            if (classMatch) {
              language = classMatch[1];
            }
          }

          // 从 code 标签的 class 中提取语言
          if (!language && codeElement?.attribs?.class) {
            const classMatch = codeElement.attribs.class.match(/language-(\w+)/);
            if (classMatch) {
              language = classMatch[1];
            }
          }

          if (codeElement?.children) {
            // 提取文本内容
            const extractTextFromNode = (node: any): string => {
              if (node.type === 'text') return node.data;
              if (node.children) {
                return node.children.map(extractTextFromNode).join('');
              }
              return '';
            };

            const code = codeElement.children.map(extractTextFromNode).join('');

            // 解码 HTML 实体
            const decodedCode = code
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");

            return (
              <CodeBlock
                code={decodedCode}
                language={language || undefined}
                showLineNumbers={true}
                allowCopy={true}
                allowFullscreen={true}
              />
            );
          }
        }

        // 处理图片
        if (enableImagePreview && element.name === 'img') {
          const src = element.attribs.src;
          const alt = element.attribs.alt || '';

          if (src) {
            // 返回一个 span 包装器，避免 div 嵌套在 p 内
            return (
              <span style={{ display: 'block', margin: '1.5rem 0', textAlign: 'center' }}>
                <ImagePreview src={src} alt={alt} onClick={onImageClick ? () => onImageClick(src) : undefined} />
              </span>
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

        // 处理内联代码
        if (element.name === 'code' && element.attribs?.class?.includes('rich-text-inline-code')) {
          const text = element.children?.map((child: any) => (child.type === 'text' ? child.data : '')).join('') || '';
          return <code className="hljs-inline">{text}</code>;
        }

        // 处理删除线
        if (element.name === 's' || element.name === 'del') {
          return <s>{domToReact(element.children as any, parserOptions)}</s>;
        }

        // 处理高亮
        if (element.name === 'mark') {
          return <mark>{domToReact(element.children as any, parserOptions)}</mark>;
        }

        // 默认返回 undefined，让解析器使用默认处理
        return undefined;
      },
    }),
    [enableCodeHighlight, enableImagePreview, onImageClick, mode],
  );

  // 解析 HTML 为 React 元素
  const parsedContent = useMemo(() => {
    if (!processedContent) return null;

    try {
      return parse(processedContent, parserOptions);
    } catch (error) {
      console.error('解析 HTML 失败:', error);
      return <div>内容解析失败</div>;
    }
  }, [processedContent, parserOptions]);

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
