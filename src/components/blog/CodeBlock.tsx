import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  position: relative;
  margin: 32px 0;
  border-radius: 12px;
  overflow: hidden;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  pre {
    margin: 0;
    padding: 20px 24px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-primary);
    scrollbar-width: thin;
    scrollbar-color: rgba(81, 131, 245, 0.3) transparent;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(81, 131, 245, 0.3);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(81, 131, 245, 0.5);
    }
  }

  [data-theme='dark'] & {
    pre::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--border-color);

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Language = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  
  .icon {
    color: var(--accent-color);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    color: var(--accent-color);
    background: rgba(81, 131, 245, 0.08);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 46px;
  bottom: 0;
  padding: 20px 0;
  text-align: right;
  min-width: 40px;
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  opacity: 0.5;
  font-size: 13px;
  user-select: none;
  counter-reset: line;
  border-right: 1px solid var(--border-color);
  
  div {
    counter-increment: line;
    padding: 0 12px 0 16px;
    height: 1.6em;
    position: relative;
    
    &::before {
      content: counter(line);
    }
    
    &.highlight {
      background: rgba(81, 131, 245, 0.1);
      color: var(--accent-color);
    }
  }
`;

const CopiedToast = styled(motion.div)`
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 4px 10px;
  background: var(--accent-color);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(81, 131, 245, 0.3);
`;

const languageDisplayNames: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'React JSX',
  tsx: 'React TSX',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  bash: '命令行',
  sh: 'Shell',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  swift: 'Swift',
  kotlin: 'Kotlin',
  php: 'PHP',
  ruby: 'Ruby',
  sql: 'SQL',
};

interface CodeBlockProps {
  language?: string;
  showLineNumbers?: boolean;
  code: string;
  highlightLines?: number[];
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language = 'javascript', 
  showLineNumbers = true, 
  code,
  highlightLines = []
}) => {
  const [copied, setCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const displayLanguage = languageDisplayNames[language.toLowerCase()] || language;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setShowCopiedMessage(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1800);
  };

  const lines = code.split('\n');

  return (
    <Container
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Language>
          <FiCode className="icon" size={14} />
          {displayLanguage}
        </Language>
        <Actions>
          <CopyButton onClick={handleCopy} title="复制代码">
            {copied ? <FiCheck size={16} color="var(--accent-color)" /> : <FiCopy size={16} />}
          </CopyButton>
        </Actions>
      </Header>

      {showLineNumbers && (
        <LineNumbers>
          {lines.map((_, i) => (
            <div key={i} className={highlightLines.includes(i + 1) ? 'highlight' : ''} />
          ))}
        </LineNumbers>
      )}

      <pre style={{ paddingLeft: showLineNumbers ? '56px' : '24px' }}>
        <code>{code}</code>
      </pre>
      
      {showCopiedMessage && (
        <CopiedToast
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          已复制到剪贴板
        </CopiedToast>
      )}
    </Container>
  );
};

export default CodeBlock;
