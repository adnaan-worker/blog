import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// 加载容器
const LoadingContainer = styled(motion.div)<{ $fullScreen?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;

  /* 全屏模式 - 固定定位覆盖整个页面 */
  ${(props) =>
    props.$fullScreen
      ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: var(--bg-primary);
    z-index: 9999;
    overflow: hidden;
  `
      : `
    /* 非全屏模式 - 固定定位但在页面内 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: var(--bg-primary);
    z-index: 1000;
    overflow: hidden;
  `}

  /* 防止滚动条导致的跳动 */
  body:has(&) {
    overflow: hidden;
  }
`;

// 加载动画容器
const SpinnerContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

// 外圈旋转环
const OuterRing = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent-color);
  border-right-color: var(--accent-color);
  will-change: transform;
  backface-visibility: hidden;
`;

// 中圈旋转环
const MiddleRing = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent-color-hover);
  border-left-color: var(--accent-color-hover);
  will-change: transform;
  backface-visibility: hidden;
`;

// 内圈旋转环
const InnerRing = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent-color-alpha);
  border-bottom-color: var(--accent-color-alpha);
  will-change: transform;
  backface-visibility: hidden;
`;

// 中心点
const CenterDot = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-color);
  box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.5);
`;

// 加载文字
const LoadingText = styled(motion.div)`
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.5px;
`;

// 进度点容器
const DotsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

// 进度点
const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
`;

// 随机加载文案
const loadingMessages = [
  '正在加载精彩内容',
  '马上就好',
  '正在准备数据',
  '请稍候片刻',
  '内容马上呈现',
  '正在努力加载中',
  '精彩内容即将呈现',
  '加载中请稍候',
];

interface PageLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

/**
 * 页面加载组件
 * 高颜值的旋转环加载动画，完全基于主题系统
 */
const PageLoading: React.FC<PageLoadingProps> = ({ message, size = 'medium', fullScreen = false }) => {
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (message) {
      setLoadingMessage(message);
    } else {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingMessage(loadingMessages[randomIndex]);
    }

    // 禁止页面滚动
    document.body.style.overflow = 'hidden';

    // 清理函数：恢复滚动
    return () => {
      document.body.style.overflow = '';
    };
  }, [message]);

  // 根据尺寸调整大小
  const sizeMap = {
    small: { container: '60px', outer: '60px', middle: '45px', inner: '30px', dot: '10px' },
    medium: { container: '80px', outer: '80px', middle: '60px', inner: '40px', dot: '12px' },
    large: { container: '100px', outer: '100px', middle: '75px', inner: '50px', dot: '14px' },
  };

  const currentSize = sizeMap[size];

  return (
    <LoadingContainer
      $fullScreen={fullScreen}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1], // easeInOut 缓动
      }}
    >
      <SpinnerContainer style={{ width: currentSize.container, height: currentSize.container }}>
        {/* 外圈 - 顺时针旋转 */}
        <OuterRing
          style={{ width: currentSize.outer, height: currentSize.outer }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        />

        {/* 中圈 - 逆时针旋转 */}
        <MiddleRing
          style={{ width: currentSize.middle, height: currentSize.middle }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        />

        {/* 内圈 - 顺时针旋转 */}
        <InnerRing
          style={{ width: currentSize.inner, height: currentSize.inner }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        />

        {/* 中心点 - 脉动效果 */}
        <CenterDot
          style={{ width: currentSize.dot, height: currentSize.dot }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </SpinnerContainer>

      {/* 加载文字 */}
      <LoadingText
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.15,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {loadingMessage}
      </LoadingText>

      {/* 进度点动画 - 快速跳动 */}
      <DotsContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {[0, 1, 2].map((index) => (
          <Dot
            key={index}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        ))}
      </DotsContainer>
    </LoadingContainer>
  );
};

export default PageLoading;
