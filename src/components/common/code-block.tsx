import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { FiCopy, FiCheck, FiCode, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

// 语言检测函数
const detectLanguage = (code: string): string => {
  const trimmed = code.trim();

  // React/JSX 检测
  if (/import\s+React|from\s+['"]react['"]|<[A-Z][a-zA-Z]*/.test(trimmed)) {
    return /\.tsx|interface\s+\w+|type\s+\w+\s*=/.test(trimmed) ? 'tsx' : 'jsx';
  }

  // TypeScript 检测
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)|<T>|<T\s+extends/.test(trimmed)) {
    return 'typescript';
  }

  // JavaScript 检测
  if (/function\s+\w+|const\s+\w+\s*=|=>\s*{|export\s+(default\s+)?|require\(/.test(trimmed)) {
    return 'javascript';
  }

  // CSS 检测
  if (/\{[^}]*:[^}]*\}|@media|@keyframes|@import|\.[\w-]+\s*\{/.test(trimmed)) {
    return 'css';
  }

  // HTML 检测
  if (/<html|<head|<body|<div|<span|<p|<!DOCTYPE|<meta|<link/.test(trimmed)) {
    return 'html';
  }

  // JSON 检测
  if (/^\s*[\{\[]/.test(trimmed) && /[\}\]]\s*$/.test(trimmed) && /"[^"]*"\s*:/.test(trimmed)) {
    return 'json';
  }

  // Python 检测
  if (/def\s+\w+|import\s+\w+|from\s+\w+\s+import|if\s+__name__\s*==/.test(trimmed)) {
    return 'python';
  }

  // Bash/Shell 检测
  if (/^#!/.test(trimmed) || /\$\s*\w+|echo\s+|cd\s+|ls\s+|mkdir\s+/.test(trimmed)) {
    return 'bash';
  }

  // SQL 检测
  if (/SELECT\s+|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM|CREATE\s+TABLE/i.test(trimmed)) {
    return 'sql';
  }

  // Markdown 检测
  if (/^#{1,6}\s+|^\*\*[^*]+\*\*|^\*[^*]+\*|^[-*+]\s+|^\d+\.\s+|^>\s+/.test(trimmed)) {
    return 'markdown';
  }

  return 'text';
};

// 获取语言显示名称和图标
const getLanguageInfo = (lang: string) => {
  const langMap: Record<string, { name: string; icon: string }> = {
    javascript: { name: 'JavaScript', icon: '🟨' },
    typescript: { name: 'TypeScript', icon: '🔷' },
    jsx: { name: 'React JSX', icon: '⚛️' },
    tsx: { name: 'React TSX', icon: '⚛️' },
    html: { name: 'HTML', icon: '🌐' },
    css: { name: 'CSS', icon: '🎨' },
    json: { name: 'JSON', icon: '📄' },
    python: { name: 'Python', icon: '🐍' },
    bash: { name: 'Bash', icon: '💻' },
    text: { name: 'Text', icon: '📝' },
  };

  return langMap[lang] || { name: lang.toUpperCase(), icon: '📄' };
};

// 样式组件
const Container = styled.div<{ isFullscreen: boolean }>`
  position: ${(props) => (props.isFullscreen ? 'fixed' : 'relative')};
  top: ${(props) => (props.isFullscreen ? '0' : 'auto')};
  left: ${(props) => (props.isFullscreen ? '0' : 'auto')};
  right: ${(props) => (props.isFullscreen ? '0' : 'auto')};
  bottom: ${(props) => (props.isFullscreen ? '0' : 'auto')};
  z-index: ${(props) => (props.isFullscreen ? '9999' : '1')};
  margin: ${(props) => (props.isFullscreen ? '0' : '1.5rem 0')};
  border-radius: ${(props) => (props.isFullscreen ? '0' : '12px')};
  overflow: hidden;
  background: var(--bg-secondary, #f8f9fa);
  border: 1px solid var(--border-color, #e9ecef);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: ${(props) => (props.isFullscreen ? 'none' : 'translateY(-2px)')};
  }

  [data-theme='dark'] & {
    background: #1e1e1e;
    border-color: #333;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-primary, #ffffff);
  border-bottom: 1px solid var(--border-color, #e9ecef);

  [data-theme='dark'] & {
    background: #2d2d2d;
    border-color: #404040;
  }
`;

const LanguageTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary, #6c757d);

  .icon {
    font-size: 1rem;
  }

  .auto-detected {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-left: 0.25rem;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${(props) => (props.active ? 'var(--accent-color, #007bff)' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary, #6c757d)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color, #007bff)' : 'rgba(0, 123, 255, 0.1)')};
    color: ${(props) => (props.active ? 'white' : 'var(--accent-color, #007bff)')};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Content = styled.div<{ showLineNumbers: boolean; isFullscreen: boolean }>`
  position: relative;
  overflow: auto;
  max-height: ${(props) => (props.isFullscreen ? 'calc(100vh - 60px)' : '500px')};

  pre {
    margin: 0;
    padding-left: ${(props) => (props.showLineNumbers ? '0' : '1rem')};
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--text-primary, #212529);
    background: transparent;
    overflow-x: auto;
    white-space: pre;
    display: flex;

    code {
      flex: 1;
      padding-left: ${(props) => (props.showLineNumbers ? '1rem' : '0')};
      line-height: inherit;
      white-space: pre;

      .code-line {
        line-height: 1.6;
        min-height: 1.44em;
        display: flex;
        align-items: center;

        &.highlight {
          background: rgba(255, 193, 7, 0.1);
        }
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color, #e9ecef);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary, #6c757d);
    }
  }

  [data-theme='dark'] & pre {
    color: #e9ecef;
  }
`;

const LineNumbers = styled.div`
  width: 2.5rem;
  background: var(--bg-tertiary, #f1f3f4);
  border-right: 1px solid var(--border-color, #e9ecef);
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-tertiary, #adb5bd);
  text-align: right;
  user-select: none;
  pointer-events: none;
  flex-shrink: 0;

  .line {
    padding: 0 0.5rem;
    line-height: 1.6;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    min-height: 1.44em;
    background: inherit;

    &.highlight {
      background: rgba(255, 193, 7, 0.2);
    }
  }

  [data-theme='dark'] & {
    background: #252526;
    border-color: #404040;
    color: #858585;
  }
`;

// 组件接口
interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  allowFullscreen?: boolean;
  highlightLines?: number[];
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language: providedLanguage,
  title,
  showLineNumbers: initialShowLineNumbers = true,
  allowCopy = true,
  allowFullscreen = true,
  highlightLines = [],
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(initialShowLineNumbers);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 检测语言 - 使用useMemo缓存
  const detectedLanguage = useMemo(() => providedLanguage || detectLanguage(code), [providedLanguage, code]);
  const languageInfo = useMemo(() => getLanguageInfo(detectedLanguage), [detectedLanguage]);
  const lines = useMemo(() => code.split('\n'), [code]);

  // 复制功能
  const handleCopy = useCallback(async () => {
    if (!allowCopy || copied) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // 清除之前的定时器
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [code, allowCopy, copied]);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!allowFullscreen) return;
    setIsFullscreen((prev) => !prev);
  }, [allowFullscreen]);

  // ESC键退出全屏
  useEffect(() => {
    if (!isFullscreen) {
      // 确保非全屏时不会影响 body overflow
      return;
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    // 保存原始的 overflow 值
    const originalOverflow = document.body.style.overflow;

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // 恢复原始值，而不是直接设置为空字符串
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreen]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  return (
    <Container isFullscreen={isFullscreen} className={className}>
      <Header>
        <LanguageTag>
          <span className="icon">{languageInfo.icon}</span>
          <span>{title || languageInfo.name}</span>
          {!providedLanguage && <span className="auto-detected">(自动检测)</span>}
        </LanguageTag>

        <Actions>
          <ActionButton onClick={() => setShowLineNumbers(!showLineNumbers)} active={showLineNumbers} title="切换行号">
            <FiCode size={14} />
          </ActionButton>

          {allowCopy && (
            <ActionButton onClick={handleCopy} title={copied ? '已复制!' : '复制代码'} active={copied}>
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            </ActionButton>
          )}

          {allowFullscreen && (
            <ActionButton onClick={toggleFullscreen} title={isFullscreen ? '退出全屏' : '全屏查看'}>
              {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
            </ActionButton>
          )}
        </Actions>
      </Header>

      <Content showLineNumbers={showLineNumbers} isFullscreen={isFullscreen}>
        <pre>
          {showLineNumbers && (
            <LineNumbers>
              {lines.map((_, index) => (
                <div key={index} className={`line ${highlightLines.includes(index + 1) ? 'highlight' : ''}`}>
                  {index + 1}
                </div>
              ))}
            </LineNumbers>
          )}
          <code>
            {lines.map((line, index) => (
              <div key={index} className={`code-line ${highlightLines.includes(index + 1) ? 'highlight' : ''}`}>
                {line || ' '}
              </div>
            ))}
          </code>
        </pre>
      </Content>
    </Container>
  );
};

export default CodeBlock;
