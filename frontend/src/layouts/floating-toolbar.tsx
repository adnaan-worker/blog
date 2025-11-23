import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

// GPU加速优化
const gpuAcceleration = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
};

// 统一的浮动工具栏容器
const ToolbarContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse; /* 从下往上排列 */
  align-items: flex-end;
  gap: 12px;
  z-index: 100;
  pointer-events: none;

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    gap: 10px;
  }

  /* 子元素恢复pointer-events */
  > * {
    pointer-events: auto;
  }
`;

// 返回顶部按钮样式
const ToolbarButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.9) 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 16px rgba(var(--accent-rgb), 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  /* GPU加速 */
  ${gpuAcceleration as any}

  /* 光晕效果 */
  &::before {
    content: '';
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    box-shadow:
      0 8px 24px rgba(var(--accent-rgb), 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }
  }

  svg {
    width: 22px;
    height: 22px;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

interface FloatingToolbarProps {
  scrollPosition: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ scrollPosition }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setShowScrollTop(scrollPosition > 300);
  }, [scrollPosition]);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <ToolbarContainer>
      {/* 返回顶部按钮 */}
      <AnimatePresence mode="wait">
        {showScrollTop && (
          <ToolbarButton
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScrollTop}
          >
            <FiArrowUp />
          </ToolbarButton>
        )}
      </AnimatePresence>
    </ToolbarContainer>
  );
};

export default FloatingToolbar;
