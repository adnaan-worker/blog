/**
 * 🎨 详情页通用布局组件
 * 统一的弹性动画和布局结构
 */

import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useAnimationEngine } from '@/utils/ui/animation';

// 页面头部渐变背景 - 流光溢彩诗意光晕 ✨
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 700px;
  width: 100%;
  overflow: hidden;
  z-index: 2;

  /* 毛玻璃质感（可选） */
  /* backdrop-filter: blur(80px); */

  /* 三层光晕效果叠加 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    will-change: transform;
  }

  /* 第一层：主光晕 - 从左上方扩散，如晨曦 */
  &::before {
    background: radial-gradient(
      ellipse 160% 110% at 15% 10%,
      rgba(var(--gradient-from), 0.38) 0%,
      rgba(var(--gradient-from), 0.22) 25%,
      rgba(var(--gradient-from), 0.08) 50%,
      transparent 75%
    );
    transform-origin: 15% 10%;
    animation: breatheGlow1 25s ease-in-out infinite;
  }

  /* 第二层：次光晕 - 从右上方流动，如晚霞 */
  &::after {
    background: radial-gradient(
      ellipse 140% 95% at 85% 15%,
      rgba(var(--gradient-to), 0.32) 0%,
      rgba(var(--gradient-to), 0.18) 30%,
      rgba(var(--gradient-to), 0.06) 55%,
      transparent 80%
    );
    transform-origin: 85% 15%;
    animation: breatheGlow2 30s ease-in-out infinite;
    animation-delay: 8s;
  }

  /* 第三层：中央光晕（使用子元素） */
  & > div {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse 110% 80% at 50% 20%,
      rgba(var(--accent-rgb), 0.15) 0%,
      rgba(var(--accent-rgb), 0.08) 35%,
      transparent 65%
    );
    mix-blend-mode: screen;
    transform-origin: 50% 20%;
    animation: pulseGlow 20s ease-in-out infinite;
    animation-delay: 4s;
  }

  /* 整体渐变遮罩 - 更柔和的过渡 */
  mask-image: radial-gradient(
    ellipse 90% 100% at 50% 0%,
    black 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 80%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 90% 100% at 50% 0%,
    black 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 80%
  );

  /* 呼吸动画 - 左侧光晕（缩放+微旋转+透明度） */
  @keyframes breatheGlow1 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    33% {
      transform: scale(1.08) rotate(1deg);
      opacity: 0.92;
    }
    66% {
      transform: scale(0.96) rotate(-0.5deg);
      opacity: 0.96;
    }
  }

  /* 呼吸动画 - 右侧光晕（错落节奏） */
  @keyframes breatheGlow2 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    40% {
      transform: scale(1.06) rotate(-1deg);
      opacity: 0.88;
    }
    75% {
      transform: scale(0.98) rotate(0.8deg);
      opacity: 0.94;
    }
  }

  /* 脉动动画 - 中央光晕（柔和呼吸） */
  @keyframes pulseGlow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.65;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.35;
    }
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    height: 500px;

    &::before {
      background: radial-gradient(
        ellipse 200% 130% at 15% 10%,
        rgba(var(--gradient-from), 0.35) 0%,
        rgba(var(--gradient-from), 0.18) 30%,
        rgba(var(--gradient-from), 0.06) 55%,
        transparent 80%
      );
    }

    &::after {
      background: radial-gradient(
        ellipse 170% 115% at 85% 15%,
        rgba(var(--gradient-to), 0.28) 0%,
        rgba(var(--gradient-to), 0.15) 35%,
        rgba(var(--gradient-to), 0.05) 60%,
        transparent 85%
      );
    }

    & > div {
      background: radial-gradient(
        ellipse 140% 100% at 50% 20%,
        rgba(var(--accent-rgb), 0.12) 0%,
        rgba(var(--accent-rgb), 0.06) 40%,
        transparent 70%
      );
    }
  }

  /* 性能优化 */
  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    & > div {
      animation: none;
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
          {/* 流光溢彩背景 - Spring 弹性淡入 ✨ */}
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 2 }}
            initial={{ opacity: 0, y: -100, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springPresets.gentle}
          >
            <PageHeadGradient>
              {/* 第三层中央光晕 */}
              <div />
            </PageHeadGradient>
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
