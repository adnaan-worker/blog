import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  position: relative;
  margin: 32px 0;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  pre {
    margin: 0;
    padding: 20px 24px;
    overflow-x: auto;
    font-size: 15px;
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
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid var(--border-color);

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Language = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
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
  border-radius: 8px;
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
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(81, 131, 245, 0.2) 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.4s, opacity 0.8s;
  }
  
  &:active::after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
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
  opacity: 0.6;
  font-size: 14px;
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
  padding: 6px 12px;
  background: var(--accent-color);
  color: white;
  border-radius: 8px;
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
  bash: 'Bash',
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Language>
          <FiCode className="icon" size={16} />
          {displayLanguage}
        </Language>
        <Actions>
          <CopyButton onClick={handleCopy} title="复制代码">
            {copied ? <FiCheck size={18} color="var(--accent-color)" /> : <FiCopy size={18} />}
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          已复制到剪贴板
        </CopiedToast>
      )}
    </Container>
  );
};

export default CodeBlock;
