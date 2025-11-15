import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

const TypingContainer = styled(motion.div)`
  position: fixed;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  pointer-events: none;
`;

const IconWrapper = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb, 99, 102, 241), 0.15) 0%,
    rgba(var(--accent-rgb, 99, 102, 241), 0.05) 100%
  );
  border-radius: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: var(--accent-color);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(0.95);
    }
  }
`;

const Content = styled.div`
  flex: 1;

  .title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subtitle {
    font-size: 0.75rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TypingDots = styled.span`
  display: inline-flex;
  gap: 0.25rem;

  span {
    width: 4px;
    height: 4px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;

    &:nth-of-type(2) {
      animation-delay: 0.2s;
    }

    &:nth-of-type(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 2px;
  background: var(--bg-secondary);
  border-radius: 1px;
  overflow: hidden;
  margin-top: 0.5rem;

  .bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-color) 0%, rgba(var(--accent-rgb, 99, 102, 241), 0.5) 100%);
    animation: progress 2s ease-in-out infinite;
  }

  @keyframes progress {
    0% {
      width: 0%;
      opacity: 0.5;
    }
    50% {
      width: 70%;
      opacity: 1;
    }
    100% {
      width: 100%;
      opacity: 0.5;
    }
  }
`;

const CharCount = styled.span`
  font-variant-numeric: tabular-nums;
  color: var(--accent-color);
  font-weight: 600;
`;

interface AITypingIndicatorProps {
  isVisible: boolean;
  charCount: number;
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

export const AITypingIndicator: React.FC<AITypingIndicatorProps> = ({ isVisible, charCount, editorRef }) => {
  const [position, setPosition] = useState({ bottom: 0, left: 0 });

  useEffect(() => {
    if (!isVisible || !editorRef?.current) return;

    const updatePosition = () => {
      const rect = editorRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          bottom: window.innerHeight - rect.bottom + 32, // 距离编辑器底部2rem
          left: rect.left + rect.width / 2 - 140, // 居中，140是宽度280的一半
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, editorRef]);

  if (!isVisible) return null;

  return (
    <TypingContainer
      style={{
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <IconWrapper>
        <FiZap />
      </IconWrapper>
      <Content>
        <div className="title">
          AI 正在创作
          <TypingDots>
            <span />
            <span />
            <span />
          </TypingDots>
        </div>
        <div className="subtitle">
          已生成 <CharCount>{charCount}</CharCount> 字
        </div>
        <ProgressBar>
          <div className="bar" />
        </ProgressBar>
      </Content>
    </TypingContainer>
  );
};

export default AITypingIndicator;
