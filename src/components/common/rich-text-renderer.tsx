import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { createRoot, Root } from 'react-dom/client';
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

      &:first-child {
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
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--bg-secondary);
        }

        &:nth-of-type(even) {
          background: rgba(var(--accent-color-rgb), 0.05);
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
  mode?: 'article' | 'note' | 'comment'; // 不同模式有不同的渲染行为
  enableCodeHighlight?: boolean;
  enableImagePreview?: boolean;
  enableTableOfContents?: boolean;
  onImageClick?: (src: string) => void;
}

// React组件渲染管理器
class ComponentRenderer {
  private roots: Map<Element, Root> = new Map();

  renderCodeBlock(container: Element, code: string, language: string) {
    const root = createRoot(container);
    this.roots.set(container, root);

    root.render(
      React.createElement(CodeBlock, {
        code: code.trim(),
        language: language,
        showLineNumbers: true,
        allowCopy: true,
        allowFullscreen: true,
        title: language ? `${language.toUpperCase()} 代码` : undefined,
      }),
    );
  }

  renderImagePreview(container: Element, src: string, alt: string, onClick?: () => void) {
    const root = createRoot(container);
    this.roots.set(container, root);

    root.render(
      React.createElement(ImagePreview, {
        src,
        alt,
        onClick,
      }),
    );
  }

  cleanup() {
    this.roots.forEach((root) => {
      try {
        root.unmount();
      } catch (error) {
        console.warn('清理React组件时出错:', error);
      }
    });
    this.roots.clear();
  }
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
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ComponentRenderer>(new ComponentRenderer());

  // 处理内容样式化和安全清理
  const processedContent = useMemo(() => {
    const sanitized = RichTextParser.sanitizeHtml(content);
    return RichTextParser.addContentStyles(sanitized);
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

  // 组件渲染逻辑
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = rendererRef.current;

    // 清理之前的组件
    renderer.cleanup();

    // 延迟执行以确保DOM已经更新
    const timer = setTimeout(() => {
      // 渲染代码块
      if (enableCodeHighlight) {
        const codeBlocks = container.querySelectorAll('.rich-text-code-block');
        codeBlocks.forEach((block) => {
          const language = block.getAttribute('data-language') || '';
          const code = block.textContent || '';

          // 创建容器
          const codeContainer = document.createElement('div');
          codeContainer.style.margin = '1.5rem 0';

          // 渲染组件
          renderer.renderCodeBlock(codeContainer, code, language);

          // 替换原元素
          block.parentNode?.replaceChild(codeContainer, block);
        });
      }

      // 渲染图片预览
      if (enableImagePreview) {
        const images = container.querySelectorAll('.rich-text-image');
        images.forEach((img) => {
          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';

          // 创建容器
          const imageContainer = document.createElement('div');
          imageContainer.style.margin = '1.5rem 0';
          imageContainer.style.textAlign = 'center';

          // 渲染组件
          renderer.renderImagePreview(imageContainer, src, alt, onImageClick ? () => onImageClick(src) : undefined);

          // 替换原元素
          img.parentNode?.replaceChild(imageContainer, img);
        });
      }

      // 添加目录锚点
      if (enableTableOfContents && tableOfContents.length > 0) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, index) => {
          if (tableOfContents[index]) {
            heading.id = tableOfContents[index].id;
          }
        });
      }

      // 根据模式调整样式
      container.setAttribute('data-mode', mode);
    }, 0);

    return () => {
      clearTimeout(timer);
      renderer.cleanup();
    };
  }, [
    processedContent,
    enableCodeHighlight,
    enableImagePreview,
    enableTableOfContents,
    onImageClick,
    tableOfContents,
    mode,
  ]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      rendererRef.current.cleanup();
    };
  }, []);

  return (
    <RichTextContainer className={className} ref={containerRef}>
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
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </RichTextContainer>
  );
};

export default RichTextRenderer;
