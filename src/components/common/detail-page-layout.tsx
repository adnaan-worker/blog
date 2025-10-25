/**
 * 🎨 详情页通用布局组件
 * 统一的弹性动画和布局结构
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useAnimationEngine } from '@/utils/animation-engine';

// 页面头部渐变背景 - 诗意朦胧光晕
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 600px;
  width: 100%;
  overflow: hidden;
  z-index: 2;

  /* 多层光晕效果 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* 主要光晕层 - 从左侧渐变 */
  &::before {
    background: radial-gradient(
      ellipse 120% 80% at 10% 20%,
      rgba(var(--gradient-from), 0.5) 0%,
      rgba(var(--gradient-from), 0.2) 40%,
      transparent 70%
    );
  }

  /* 次要光晕层 - 从右侧渐变 */
  &::after {
    background: radial-gradient(
      ellipse 100% 60% at 90% 30%,
      rgba(var(--gradient-to), 0.4) 0%,
      rgba(var(--gradient-to), 0.18) 45%,
      transparent 75%
    );
  }

  /* 整体渐变遮罩 */
  mask-image: radial-gradient(ellipse 80% 100% at 50% 0%, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 100% at 50% 0%, black 0%, transparent 70%);

  /* 响应式调整 */
  @media (max-width: 768px) {
    height: 400px;

    &::before {
      background: radial-gradient(
        ellipse 150% 100% at 10% 20%,
        rgba(var(--gradient-from), 0.45) 0%,
        rgba(var(--gradient-from), 0.18) 50%,
        transparent 80%
      );
    }

    &::after {
      background: radial-gradient(
        ellipse 120% 80% at 90% 30%,
        rgba(var(--gradient-to), 0.35) 0%,
        rgba(var(--gradient-to), 0.15) 50%,
        transparent 80%
      );
    }
  }
`;

interface DetailPageLayoutProps {
  children: React.ReactNode;
  mainContent: React.ReactNode;
  sidebar?: React.ReactNode;
  showBackground?: boolean;
}

/**
 * 详情页通用布局组件
 * 提供统一的弹性动画和背景效果
 */
export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  children,
  mainContent,
  sidebar,
  showBackground = true,
}) => {
  const { springPresets } = useAnimationEngine();

  return (
    <>
      {showBackground && (
        <>
          {/* 背景装饰 - Spring 弹性淡入 */}
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2 }}
            initial={{ opacity: 0, y: -100, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springPresets.gentle}
          >
            <PageHeadGradient />
          </motion.div>
        </>
      )}

      {children}
    </>
  );
};

/**
 * 主内容区弹性动画包装器
 */
export const DetailMainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { springPresets } = useAnimationEngine();

  return (
    <motion.div
      style={{ width: '100%' }}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springPresets.bouncy, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 侧边栏快速滑入包装器
 */
export const DetailSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { springPresets } = useAnimationEngine();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={springPresets.snappy}>
      {children}
    </motion.div>
  );
};
