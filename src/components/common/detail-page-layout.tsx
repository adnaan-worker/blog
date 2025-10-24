/**
 * 🎨 详情页通用布局组件
 * 统一的弹性动画和布局结构
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useAnimationEngine } from '@/utils/animation-engine';

// 页面头部渐变背景
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 500px;
  width: 100%;
  background: linear-gradient(to right, rgba(var(--gradient-from), 0.3) 0%, rgba(var(--gradient-to), 0.3) 100%);
  mask-image: linear-gradient(var(--mask-gradient-start), var(--mask-gradient-end) 70%);
  z-index: 2;
`;

// 纸张背景容器
const PaperBackground = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;

  /* 亮色模式：羊皮纸效果 */
  [data-theme='light'] & {
    background: linear-gradient(
      180deg,
      var(--paper-bg-light-start) 0%,
      var(--paper-bg-light-mid) 50%,
      var(--paper-bg-light-end) 100%
    );

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px);
      opacity: 0.3;
    }
  }

  /* 暗色模式：深色纸张质感 */
  [data-theme='dark'] & {
    background:
      radial-gradient(ellipse 1000px 800px at 50% 0%, rgba(var(--gradient-from), 0.06), transparent 60%),
      linear-gradient(
        180deg,
        var(--paper-bg-dark-start) 0%,
        var(--paper-bg-dark-mid) 50%,
        var(--paper-bg-dark-end) 100%
      );

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(var(--gradient-from), 0.02) 3px,
          rgba(var(--gradient-from), 0.02) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          rgba(var(--gradient-to), 0.02) 3px,
          rgba(var(--gradient-to), 0.02) 4px
        );
      opacity: 0.4;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 30%, rgba(var(--gradient-from), 0.03), transparent 40%),
        radial-gradient(circle at 80% 60%, rgba(var(--gradient-to), 0.03), transparent 40%);
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
          {/* 背景装饰 - 轻盈淡入 */}
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2 }}
          >
            <PageHeadGradient />
          </motion.div>

          {/* 纸张背景 - 温柔淡入 */}
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={springPresets.gentle}
          >
            <PaperBackground />
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
