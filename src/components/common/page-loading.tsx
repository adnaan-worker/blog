import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// 加载容器 - 始终全屏覆盖
const LoadingContainer = styled(motion.div)<{ $fullScreen?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--bg-primary);
  z-index: ${(props) => (props.$fullScreen ? '9999' : '10000')};
  overflow: hidden;

  /* 确保完全覆盖所有内容 */
  pointer-events: all;

  /* 防止内容穿透 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg-primary);
    z-index: -1;
  }
`;

// 简约圆环容器
const SpinnerContainer = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
`;

// 简约圆环
const SimpleRing = styled(motion.div)`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--accent-color);
  border-right-color: var(--accent-color);
`;

// 加载文字
const LoadingText = styled(motion.div)`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.3px;
`;

// 简约点容器
const DotsContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

// 简约点
const Dot = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-color);
`;

// 简约加载文案
const loadingMessages = ['加载中', '请稍候', '马上就好', '加载中...'];

interface PageLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  variant?: 'ring' | 'dots' | 'pulse';
}

/**
 * 简约优雅的页面加载组件
 * 提供三种简约的加载动画效果
 */
const PageLoading: React.FC<PageLoadingProps> = ({
  message,
  size = 'medium',
  fullScreen = true,
  variant = 'pulse',
}) => {
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (message) {
      setLoadingMessage(message);
    } else {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingMessage(loadingMessages[randomIndex]);
    }
  }, [message]);

  // 根据尺寸调整大小
  const sizeMap = {
    small: { container: '40px', dot: '4px' },
    medium: { container: '60px', dot: '6px' },
    large: { container: '80px', dot: '8px' },
  };

  const currentSize = sizeMap[size];

  // 渲染圆环动画
  const renderRingAnimation = () => (
    <SpinnerContainer style={{ width: currentSize.container, height: currentSize.container }}>
      <SimpleRing
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      />
    </SpinnerContainer>
  );

  // 渲染点动画
  const renderDotsAnimation = () => (
    <DotsContainer>
      {[0, 1, 2].map((index) => (
        <Dot
          key={index}
          style={{ width: currentSize.dot, height: currentSize.dot }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </DotsContainer>
  );

  // 渲染脉动动画
  const renderPulseAnimation = () => (
    <SpinnerContainer style={{ width: currentSize.container, height: currentSize.container }}>
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'var(--accent-color)',
          opacity: 0.1,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </SpinnerContainer>
  );

  return (
    <LoadingContainer
      $fullScreen={fullScreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 根据变体渲染不同的动画 */}
      {variant === 'ring' && renderRingAnimation()}
      {variant === 'dots' && renderDotsAnimation()}
      {variant === 'pulse' && renderPulseAnimation()}

      {/* 加载文字 */}
      <LoadingText
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {loadingMessage}
      </LoadingText>
    </LoadingContainer>
  );
};

export default PageLoading;
