import React, { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import hljs from 'highlight.js';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// 代码块容器
const Container = styled.div`
  position: relative;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);

  [data-theme='dark'] & {
    background: #1e1e1e;
    border-color: #3e3e3e;
  }
`;

// 代码块头部
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);

  [data-theme='dark'] & {
    background: #161616;
    border-bottom-color: #3e3e3e;
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

// 代码内容
const Content = styled.div<{ collapsed: boolean; maxHeight: number }>`
  max-height: ${(props) => (props.collapsed ? `${props.maxHeight}px` : 'none')};
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease;

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

  [data-theme='dark'] &::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }

  [data-theme='dark'] &::-webkit-scrollbar-thumb {
    background: var(--border-color);
  }

  pre {
    margin: 0;
    padding: 1rem;
    background: var(--bg-secondary);
    overflow-x: auto;
    font-family: var(--font-code);
    font-size: 0.875rem;
    line-height: 1.6;

    [data-theme='dark'] & {
      background: var(--rich-text-code-bg);
    }

    code {
      background: transparent;
      color: var(--text-primary);
      white-space: pre;
      display: block;

      [data-theme='dark'] & {
        color: var(--text-secondary);
      }

      * {
        text-decoration: none !important;
        border: none !important;
        background: transparent !important;
      }

      [data-theme='dark'] & * {
        color: inherit;
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

  [data-theme='dark'] & {
    background: var(--bg-primary);
    border-top-color: var(--border-color);

    &:hover {
      background: var(--bg-tertiary);
    }
  }
`;

// 组件接口
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  allowExpand?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'plaintext',
  showLineNumbers = true,
  allowCopy = true,
  allowExpand = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const shouldShowExpand = allowExpand && lineCount > 20;

  // 语法高亮
  const highlightedCode = useMemo(() => {
    try {
      return language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;
    } catch (e) {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [code, language]);

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
    <Container>
      <Header>
        <LanguageLabel>{language}</LanguageLabel>
        {allowCopy && (
          <CopyButton copied={copied} onClick={handleCopy}>
            {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
            {copied ? '已复制' : '复制'}
          </CopyButton>
        )}
      </Header>

      <Content collapsed={!isExpanded && shouldShowExpand} maxHeight={400}>
        <pre>
          <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </Content>

      {shouldShowExpand && (
        <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          {isExpanded ? '收起代码' : `展开全部 (${lineCount} 行)`}
        </ExpandButton>
      )}
    </Container>
  );
};

export default CodeBlock;
