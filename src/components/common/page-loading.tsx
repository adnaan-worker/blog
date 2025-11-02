import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_PRESETS, useAnimationEngine } from '@/utils/ui/animation';

const LoadingContainer = styled(motion.div)`
  width: 100%;
  min-height: calc(100vh - var(--header-height) - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1.5rem;
  background: transparent;
  overflow: hidden;
  padding: 2rem;
  position: relative;
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const OuterRing = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--accent-color);
  border-right-color: var(--accent-color);
  filter: blur(1px);
`;

const InnerRing = styled(motion.div)`
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-bottom-color: rgba(var(--accent-rgb), 0.6);
  border-left-color: rgba(var(--accent-rgb), 0.6);
`;

const CenterDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
  box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.8);
`;

const Glow = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%);
`;

const LoadingText = styled(motion.div)`
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  letter-spacing: 2px;
  font-family: 'Inter', system-ui, sans-serif;
  white-space: nowrap;
  z-index: 1;
`;

const SubText = styled(motion.div)`
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-align: center;
  letter-spacing: 1px;
  margin-top: 0.5rem;
  opacity: 0.7;
  white-space: nowrap;
  z-index: 1;
`;

const poeticMessages = [
  { main: '穿越时光', sub: '寻找那些被遗忘的故事' },
  { main: '整理思绪', sub: '让文字在指尖流淌' },
  { main: '编织梦想', sub: '用代码构建理想世界' },
  { main: '拾取碎片', sub: '拼凑完整的记忆' },
  { main: '等待花开', sub: '美好总会如约而至' },
];

interface PageLoadingProps {
  message?: string;
  subMessage?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ message, subMessage }) => {
  const { springPresets } = useAnimationEngine();
  const [messageKey, setMessageKey] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * poeticMessages.length);
    return poeticMessages[randomIndex];
  });

  useEffect(() => {
    if (message) {
      setDisplayMessage({ main: message, sub: subMessage || '' });
      setMessageKey((prev) => prev + 1);
      return;
    }

    const interval = setInterval(() => {
      setDisplayMessage((prev) => {
        const currentIndex = poeticMessages.findIndex((msg) => msg.main === prev.main);
        const nextIndex = (currentIndex + 1) % poeticMessages.length;
        return poeticMessages[nextIndex];
      });
      setMessageKey((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [message, subMessage]);

  return (
    <LoadingContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={springPresets.soft}
    >
      <SpinnerWrapper>
        {/* 光晕效果 */}
        <Glow
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 外圈 - 顺时针旋转 */}
        <OuterRing
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* 内圈 - 逆时针旋转 */}
        <InnerRing
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* 中心点 - 脉动 */}
        <CenterDot
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </SpinnerWrapper>

      {/* 诗意文案 - 渐变切换 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`loading-${messageKey}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={springPresets.gentle}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingText>{displayMessage.main}</LoadingText>
          {displayMessage.sub && <SubText>{displayMessage.sub}</SubText>}
        </motion.div>
      </AnimatePresence>
    </LoadingContainer>
  );
};

export default PageLoading;
