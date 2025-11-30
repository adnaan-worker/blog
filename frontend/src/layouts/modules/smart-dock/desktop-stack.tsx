import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import GhostVisual from './visuals/ghost-visual';
import SheepVisual from './visuals/sheep-visual';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';
import { AIChatWindow } from '@/components/ai/chat-window';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';

// ============================================================================
// 样式定义
// ============================================================================

// 垂直功能栈容器
const StackContainer = styled(motion.div)`
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 900;
  pointer-events: none; /* 容器穿透 */
`;

const DockItem = styled(motion.div)`
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

// 极简玻璃态按钮 - 圆角矩形
const GlassButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 16px; /* Squircle */
  background: rgba(var(--bg-secondary-rgb), 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--border-rgb), 0.15);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(var(--bg-secondary-rgb), 0.9);
    color: var(--accent-color);
    border-color: rgba(var(--accent-rgb), 0.3);
    box-shadow:
      0 8px 20px rgba(var(--accent-rgb), 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

// 陪伴物容器 - 固定在右下角
const CompanionContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px; /* 在 StackContainer 上方 */
  right: 40px;
  width: 60px;
  height: 75px;
  z-index: 910;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  /* 居中对齐 StackContainer */
  transform: translateX(0);
`;

// 侧边栏容器 - 悬浮极光风格
const AISidebar = styled(motion.div)`
  position: fixed;
  top: 80px; /* 调整顶部位置 */
  right: 24px;
  bottom: 40px; /* 调整底部位置 */
  width: 420px;
  height: auto;
  background: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(30px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    -20px 0 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  z-index: 950;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* 内部极光光效 */
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%);
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(var(--text-rgb), 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  &:hover {
    background: rgba(var(--text-rgb), 0.1);
    color: var(--text-primary);
  }
`;

// ============================================================================
// 组件实现
// ============================================================================

const DesktopSmartDock: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [showBackTop, setShowBackTop] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);

  useModalScrollLock(isAIActive);

  // 陪伴物交互
  const companion = useCompanionWidget({
    width: 60,
    height: 75,
  });

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompanionClick = () => {
    setIsAIActive(true);
    companion.createParticles();
  };

  const handleClose = () => setIsAIActive(false);

  return (
    <>
      {/* 1. 陪伴物 (守护者) - AI 激活时隐藏 */}
      <AnimatePresence>
        {!isAIActive && (
          <CompanionContainer
            key="floater"
            ref={companion.widgetRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            onMouseEnter={() => companion.setIsHovered(true)}
            onMouseLeave={() => companion.setIsHovered(false)}
            onClick={handleCompanionClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* 视觉主体 */}
            {isDark ? (
              <GhostVisual
                clickCount={companion.clickCount}
                isHovered={companion.isHovered}
                isBlinking={companion.isBlinking}
                particles={companion.particles}
              />
            ) : (
              <SheepVisual
                clickCount={companion.clickCount}
                isHovered={companion.isHovered}
                isBlinking={companion.isBlinking}
                particles={companion.particles}
              />
            )}
          </CompanionContainer>
        )}
      </AnimatePresence>

      {/* 2. AI 助手面板 */}
      <AnimatePresence>
        {isAIActive && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(4px)',
                zIndex: 940,
              }}
            />

            <AISidebar
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <CloseButton onClick={handleClose}>
                <FiX />
              </CloseButton>

              {/* 集成新的 AI 聊天组件 */}
              <AIChatWindow onClose={handleClose} />
            </AISidebar>
          </>
        )}
      </AnimatePresence>

      {/* 3. 垂直功能栈 */}
      <StackContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AnimatePresence>
          {showBackTop && (
            <DockItem
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <GlassButton onClick={scrollToTop} title="回到顶部">
                <FiArrowUp />
              </GlassButton>
            </DockItem>
          )}
        </AnimatePresence>
      </StackContainer>
    </>
  );
};

export default DesktopSmartDock;
