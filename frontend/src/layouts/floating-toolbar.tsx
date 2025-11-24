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
  width: 44px;
  height: 44px;
  border-radius: 12px; /* 方圆形更现代 */
  border: 1px solid rgba(var(--border-rgb), 0.1);
  background: rgba(var(--bg-secondary-rgb), 0.6);
  backdrop-filter: blur(12px);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* GPU加速 */
  ${gpuAcceleration as any}

  &:hover {
    background: rgba(var(--accent-rgb), 0.1);
    color: var(--accent-color);
    border-color: rgba(var(--accent-rgb), 0.2);
    box-shadow:
      0 8px 24px rgba(var(--accent-rgb), 0.15),
      0 0 0 1px rgba(var(--accent-rgb), 0.1) inset;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
    position: relative;
    z-index: 1;
    stroke-width: 2.5;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;

    svg {
      width: 18px;
      height: 18px;
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
