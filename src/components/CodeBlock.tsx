import styled from '@emotion/styled';
import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const Container = styled.div`
  position: relative;
  margin: 1.5rem 0;
  border-radius: 10px;
  overflow: hidden;
  font-family: var(--font-code);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  
  pre {
    margin: 0;
    padding: 1.25rem 1.5rem;
    overflow-x: auto;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text-primary);
    
    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(81, 131, 245, 0.2);
    }
  }
  
  [data-theme='dark'] & {
    pre::-webkit-scrollbar-thumb {
      background: rgba(81, 131, 245, 0.3);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid var(--border-color);
  
  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const Language = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 5px;
  transition: all 0.25s ease;
  
  &:hover {
    color: var(--accent-color);
    background: rgba(81, 131, 245, 0.08);
  }
`;

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 2.15rem;
  bottom: 0;
  padding: 1.25rem 0.5rem;
  text-align: right;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  opacity: 0.6;
  font-size: 0.9rem;
  user-select: none;
  border-right: 1px solid var(--border-color);
`;

interface CodeBlockProps {
  language?: string;
  showLineNumbers?: boolean;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language = 'javascript', 
  showLineNumbers = true, 
  code 
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const lines = code.split('\n');
  
  return (
    <Container>
      <Header>
        <Language>{language}</Language>
        <CopyButton onClick={handleCopy}>
          {copied ? <FiCheck size={16} color="var(--accent-color)" /> : <FiCopy size={16} />}
        </CopyButton>
      </Header>
      
      {showLineNumbers && (
        <LineNumbers>
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </LineNumbers>
      )}
      
      <pre style={{ paddingLeft: showLineNumbers ? '2.5rem' : '1.5rem' }}>
        <code>{code}</code>
      </pre>
    </Container>
  );
};

export default CodeBlock; 