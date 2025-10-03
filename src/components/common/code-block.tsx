import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { FiCopy, FiCheck, FiMaximize2, FiMinimize2, FiCode } from 'react-icons/fi';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { scrollLock } from '@/utils/scroll-lock';

// 语言检测函数 - 优化版本
const detectLanguage = (code: string): string => {
  const trimmed = code.trim();

  // 语言检测规则，按优先级排序
  const languagePatterns = [
    { pattern: /import\s+React|from\s+['"]react['"]|<[A-Z][a-zA-Z]*/, languages: ['tsx', 'jsx'] },
    {
      pattern: /interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)|<T>|<T\s+extends/,
      languages: ['typescript'],
    },
    { pattern: /function\s+\w+|const\s+\w+\s*=|=>\s*{|export\s+(default\s+)?|require\(/, languages: ['javascript'] },
    { pattern: /\{[^}]*:[^}]*\}|@media|@keyframes|@import|\.[\w-]+\s*\{/, languages: ['css'] },
    { pattern: /<html|<head|<body|<div|<span|<p|<!DOCTYPE|<meta|<link/, languages: ['html'] },
    {
      pattern: /^\s*[\{\[]/,
      languages: ['json'],
      test: () => /^\s*[\{\[]/.test(trimmed) && /[\}\]]\s*$/.test(trimmed) && /"[^"]*"\s*:/.test(trimmed),
    },
    { pattern: /def\s+\w+|import\s+\w+|from\s+\w+\s+import|if\s+__name__\s*==/, languages: ['python'] },
    {
      pattern: /^#!|\$\s*\w+|echo\s+|cd\s+|ls\s+|mkdir\s+/,
      languages: ['bash'],
      test: () => /^#!/.test(trimmed) || /\$\s*\w+|echo\s+|cd\s+|ls\s+|mkdir\s+/.test(trimmed),
    },
    { pattern: /SELECT\s+|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM|CREATE\s+TABLE/i, languages: ['sql'] },
    { pattern: /^#{1,6}\s+|^\*\*[^*]+\*\*|^\*[^*]+\*|^[-*+]\s+|^\d+\.\s+|^>\s+/, languages: ['markdown'] },
  ];

  for (const { pattern, languages, test } of languagePatterns) {
    // 如果有自定义测试函数，使用它；否则使用正则表达式测试
    const matches = test ? test() : pattern.test(trimmed);

    if (matches) {
      // 对于 React 相关，进一步判断是 TSX 还是 JSX
      if (languages.includes('tsx') && languages.includes('jsx')) {
        return /\.tsx|interface\s+\w+|type\s+\w+\s*=/.test(trimmed) ? 'tsx' : 'jsx';
      }
      return languages[0];
    }
  }

  return 'text';
};

// 语言信息映射 - 优化版本
const LANGUAGE_INFO_MAP: Record<string, { name: string; icon: string; color: string }> = {
  javascript: { name: 'JavaScript', icon: '🟨', color: '#f7df1e' },
  typescript: { name: 'TypeScript', icon: '🔷', color: '#3178c6' },
  jsx: { name: 'React JSX', icon: '⚛️', color: '#61dafb' },
  tsx: { name: 'React TSX', icon: '⚛️', color: '#61dafb' },
  html: { name: 'HTML', icon: '🌐', color: '#e34f26' },
  css: { name: 'CSS', icon: '🎨', color: '#1572b6' },
  json: { name: 'JSON', icon: '📄', color: '#000000' },
  python: { name: 'Python', icon: '🐍', color: '#3776ab' },
  bash: { name: 'Bash', icon: '💻', color: '#4eaa25' },
  sql: { name: 'SQL', icon: '🗄️', color: '#336791' },
  markdown: { name: 'Markdown', icon: '📝', color: '#083fa1' },
  text: { name: 'Text', icon: '📄', color: '#6b7280' },
};

const getLanguageInfo = (lang: string) => {
  return (
    LANGUAGE_INFO_MAP[lang] || {
      name: lang.toUpperCase(),
      icon: '📄',
      color: '#6b7280',
    }
  );
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-family: var(--font-code);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: ${(props) => (props.isFullscreen ? 'none' : 'translateY(-1px)')};
  }

  /* 深色模式悬停效果 */
  [data-theme='dark'] &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border-color);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--accent-color) 50%, transparent 100%);
  }
`;

const LanguageTag = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  position: relative;

  .icon {
    font-size: 1rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .language-name {
    background: linear-gradient(135deg, ${(props) => props.color} 0%, ${(props) => props.color}dd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  .auto-detected {
    font-size: 0.75rem;
    opacity: 0.6;
    margin-left: 0.25rem;
    font-weight: 400;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButton = styled.button<{ active?: boolean; variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: ${(props) => {
    if (props.active) return 'var(--accent-color)';
    if (props.variant === 'primary') return 'var(--accent-color-alpha)';
    return 'transparent';
  }};
  color: ${(props) => {
    if (props.active) return 'white';
    if (props.variant === 'primary') return 'var(--accent-color)';
    return 'var(--text-secondary)';
  }};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: ${(props) => {
      if (props.active) return 'var(--accent-color)';
      return 'var(--accent-color-alpha)';
    }};
    color: ${(props) => {
      if (props.active) return 'white';
      return 'var(--accent-color)';
    }};
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--accent-color-alpha);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Content = styled.div<{ showLineNumbers: boolean; isFullscreen: boolean }>`
  position: relative;
  overflow: auto;
  max-height: ${(props) => (props.isFullscreen ? 'calc(100vh - 60px)' : '500px')};
  background: var(--bg-primary);

  pre {
    margin: 0;
    padding: 1rem;
    padding-left: ${(props) => (props.showLineNumbers ? '4rem' : '1rem')};
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.7;
    color: var(--text-primary);
    background: transparent;
    overflow-x: auto;
    white-space: pre;
    position: relative;
    min-height: 100%; /* 确保 pre 元素填满容器 */

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }
  }
`;

const LineNumbers = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 3rem;
  height: 100%;
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-color);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--text-tertiary);
  text-align: right;
  user-select: none;
  pointer-events: none;
  padding: 1rem 0.5rem;
  box-sizing: border-box;
  min-height: calc(100% - 2rem); /* 减去上下 padding，确保背景铺满 */

  .line {
    line-height: 1.7;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 1.7em; /* 固定每行高度，确保对齐 */
    margin: 0; /* 移除默认边距 */
    padding: 0; /* 移除默认内边距 */
  }
`;

const CopyFeedback = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--accent-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: ${(props) => (props.visible ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 12px var(--accent-color-alpha);
`;

// 组件接口
interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  allowFullscreen?: boolean;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language: providedLanguage,
  title,
  showLineNumbers: initialShowLineNumbers = true,
  allowCopy = true,
  allowFullscreen = true,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(initialShowLineNumbers);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 检测语言
  const detectedLanguage = providedLanguage || detectLanguage(code);

  // 语法高亮 - 优化版本
  const highlightedCode = useMemo(() => {
    try {
      if (detectedLanguage && hljs.getLanguage(detectedLanguage)) {
        const result = hljs.highlight(code, { language: detectedLanguage });
        return result.value;
      } else {
        const result = hljs.highlightAuto(code);
        return result.value;
      }
    } catch (error) {
      console.warn('代码高亮失败:', error);
      return code;
    }
  }, [code, detectedLanguage]);

  // 语言信息 - 缓存
  const languageInfo = useMemo(() => getLanguageInfo(detectedLanguage), [detectedLanguage]);

  // 代码行数 - 缓存
  const lines = useMemo(() => code.split('\n'), [code]);

  // 复制功能
  const handleCopy = useCallback(async () => {
    if (!allowCopy || copied) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

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

  // ESC键退出全屏和滚动锁定管理
  useEffect(() => {
    if (isFullscreen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsFullscreen(false);
        }
      };

      document.addEventListener('keydown', handleEsc);
      scrollLock.lock();

      return () => {
        document.removeEventListener('keydown', handleEsc);
        scrollLock.unlock();
      };
    }
  }, [isFullscreen]);

  // 组件卸载时确保解锁滚动
  useEffect(() => {
    return () => {
      scrollLock.unlock();
    };
  }, []);

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
        <LanguageTag color={languageInfo.color}>
          <span className="icon">{languageInfo.icon}</span>
          <span className="language-name">{title || languageInfo.name}</span>
          {!providedLanguage && <span className="auto-detected">(自动检测)</span>}
        </LanguageTag>

        <Actions>
          <ActionButton onClick={() => setShowLineNumbers(!showLineNumbers)} active={showLineNumbers} title="切换行号">
            <FiCode size={14} />
          </ActionButton>

          {allowCopy && (
            <ActionButton
              onClick={handleCopy}
              title={copied ? '已复制!' : '复制代码'}
              active={copied}
              variant="primary"
            >
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
        {showLineNumbers && (
          <LineNumbers>
            {lines.map((_, index) => (
              <div key={index} className="line" style={{ height: '1.7em' }}>
                {index + 1}
              </div>
            ))}
          </LineNumbers>
        )}
        <pre>
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </Content>

      <CopyFeedback visible={copied}>
        <FiCheck size={12} style={{ marginRight: '0.25rem' }} />
        已复制到剪贴板
      </CopyFeedback>
    </Container>
  );
};

export default CodeBlock;
