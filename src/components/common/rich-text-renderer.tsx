import React, { useMemo, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import '@/styles/rich-text.css';
import { RichTextParser } from '@/utils/rich-text-parser';
import ImagePreview from './image-preview';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// 语法高亮颜色配置
const SYNTAX_COLORS = {
  dark: {
    default: '#abb2bf',
    keyword: '#c678dd',
    string: '#98c379',
    comment: '#7f848e',
    function: '#61afef',
    number: '#d19a66',
    builtin: '#e5c07b',
    variable: '#e06c75',
    literal: '#56b6c2',
    operator: '#56b6c2',
  },
  light: {
    default: '#24292e',
    keyword: '#d73a49',
    string: '#032f62',
    comment: '#6a737d',
    function: '#6f42c1',
    number: '#005cc5',
    builtin: '#005cc5',
    variable: '#e36209',
    literal: '#005cc5',
    operator: '#d73a49',
  },
};

// 代码块容器
const CodeBlockContainer = styled.div`
  position: relative;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);

  /* 深色模式优化 */
  [data-theme='dark'] & {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }
`;

// 代码块头部
const CodeBlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  opacity: 0;
  transition: opacity 0.2s;

  ${CodeBlockContainer}:hover & {
    opacity: 1;
  }

  /* 深色模式优化 */
  [data-theme='dark'] & {
    background: var(--bg-primary);
    border-bottom-color: var(--border-color);
  }
`;

// 语言标签
const LanguageLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: var(--font-code);
  text-transform: uppercase;
  font-weight: 600;
`;

// 复制按钮
const CopyButton = styled.button<{ copied: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: ${(props) => (props.copied ? 'var(--accent-color)' : 'var(--bg-primary)')};
  color: ${(props) => (props.copied ? 'white' : 'var(--text-secondary)')};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.copied ? 'var(--accent-color)' : 'var(--bg-tertiary)')};
  }
`;

// 代码内容区域
const CodeContent = styled.div<{ collapsed: boolean; maxHeight: number }>`
  position: relative;
  max-height: ${(props) => (props.collapsed ? `${props.maxHeight}px` : 'none')};
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }

  /* 深色模式滚动条 */
  [data-theme='dark'] &::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }

  [data-theme='dark'] &::-webkit-scrollbar-thumb {
    background: var(--border-color);
  }

  [data-theme='dark'] &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }

  pre {
    margin: 0 !important;
    padding: 1rem !important;
    background: var(--bg-secondary) !important;
    border: none !important;
    border-radius: 0 !important;
    overflow-x: auto;
    font-family: var(--font-code, 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace);
    font-size: 0.875rem;
    line-height: 1.6;

    /* 深色模式代码背景 */
    [data-theme='dark'] & {
      background: var(--rich-text-code-bg) !important;
    }

    /* 浅色模式代码背景 */
    [data-theme='light'] & {
      background: var(--rich-text-background-secondary) !important;
    }

    /* pre 内部的滚动条样式 */
    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--text-tertiary);
    }

    /* 深色模式横向滚动条 */
    [data-theme='dark'] &::-webkit-scrollbar-thumb {
      background: var(--border-color);
    }

    [data-theme='dark'] &::-webkit-scrollbar-thumb:hover {
      background: var(--text-tertiary);
    }

    code {
      background: transparent !important;
      padding: 0;
      border: none;
      font-family: inherit;
      font-size: inherit;
      display: block;
      white-space: pre;
      color: var(--rich-text-primary);

      /* 移除所有装饰 */
      * {
        text-decoration: none !important;
        border: none !important;
        background: transparent !important;
      }
    }
  }
`;

// 展开按钮
const ExpandButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  /* 深色模式优化 */
  [data-theme='dark'] & {
    background: #161616;
    border-top-color: #3e3e3e;
    color: #a0a0a0;

    &:hover {
      background: #252525;
      color: #d4d4d4;
    }
  }
`;

// 简化的代码块组件
interface SimpleCodeBlockProps {
  code: string;
  language?: string;
  highlightedCode: string;
}

const SimpleCodeBlock: React.FC<SimpleCodeBlockProps> = ({ code, language, highlightedCode }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 计算代码行数
  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const shouldShowExpand = lineCount > 20; // 超过20行显示展开按钮
  const maxCollapsedHeight = 400; // 折叠时的最大高度

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [code]);

  return (
    <CodeBlockContainer>
      <CodeBlockHeader>
        <LanguageLabel>{language || 'plaintext'}</LanguageLabel>
        <CopyButton copied={copied} onClick={handleCopy}>
          {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
          {copied ? '已复制' : '复制'}
        </CopyButton>
      </CodeBlockHeader>

      <CodeContent collapsed={!isExpanded && shouldShowExpand} maxHeight={maxCollapsedHeight}>
        <pre>
          <code
            className={language ? `language-${language} hljs` : 'hljs'}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </CodeContent>

      {shouldShowExpand && (
        <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          {isExpanded ? '收起代码' : `展开全部 (${lineCount} 行)`}
        </ExpandButton>
      )}
    </CodeBlockContainer>
  );
};

// 富文本内容容器
const RichTextContainer = styled.div`
  /* 内联代码样式 - 由 rich-text.css 处理 */
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
  // 处理内容：保护代码块不被破坏
  const processedContent = useMemo(() => {
    if (!content) return '';

    const extractedBlocks: Array<{ code: string; language: string }> = [];
    let processed = content;
    let index = 0;

    // 1. 提取所有代码块
    const codeBlockRegex = /<pre[^>]*>\s*<code(?:\s+class="language-(\w+)")?[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || '';
      let code = match[2];

      // 解码HTML实体
      code = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

      extractedBlocks.push({ code, language });
    }

    // 2. 用占位符替换代码块
    processed = processed.replace(
      /<pre[^>]*>\s*<code(?:\s+class="[^"]*")?[^>]*>[\s\S]*?<\/code>\s*<\/pre>/g,
      () => `%%%CODE_BLOCK_${index++}%%%`,
    );

    // 3. 对非代码块内容应用样式
    processed = RichTextParser.addContentStyles(processed);

    // 4. 将占位符替换回代码块HTML
    extractedBlocks.forEach((block, idx) => {
      const codeHtml = `<pre><code class="language-${block.language || 'plaintext'}">${block.code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</code></pre>`;
      processed = processed.replace(`%%%CODE_BLOCK_${idx}%%%`, codeHtml);
    });

    return processed;
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
  const parserOptions: HTMLReactParserOptions = useMemo(() => {
    return {
      replace: (domNode) => {
        if (!(domNode instanceof Element)) return;
        const element = domNode as Element;

        // 处理代码块 - 使用 SimpleCodeBlock 组件
        if (
          enableCodeHighlight &&
          element.name === 'pre' &&
          element.children?.some((child: any) => child.name === 'code')
        ) {
          const codeElement = element.children?.find((child: any) => child.name === 'code') as any;

          // 提取语言
          const language = codeElement?.attribs?.class?.match(/language-(\w+)/)?.[1] || '';

          // 提取代码文本（递归处理所有子节点）
          const extractText = (node: any): string => {
            if (node.type === 'text') return node.data || '';
            if (node.children) return node.children.map(extractText).join('');
            return '';
          };

          // 解码HTML实体
          const code = (codeElement?.children?.map(extractText).join('') || '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');

          // 应用语法高亮
          let highlightedCode = code;
          try {
            highlightedCode =
              language && hljs.getLanguage(language)
                ? hljs.highlight(code, { language }).value
                : hljs.highlightAuto(code).value;
          } catch (e) {
            console.warn('语法高亮失败:', e);
            highlightedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }

          return <SimpleCodeBlock code={code} language={language} highlightedCode={highlightedCode} />;
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

        // 处理 h2 标题（文章模式 - 添加锚点）
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
  }, [enableCodeHighlight, enableImagePreview, onImageClick, mode]);

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
