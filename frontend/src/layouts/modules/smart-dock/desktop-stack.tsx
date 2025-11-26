import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSimulatedAI } from './useSimulatedAI';
import GhostVisual from './visuals/GhostVisual';
import SheepVisual from './visuals/SheepVisual';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';

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
  top: 24px;
  right: 24px;
  bottom: 24px;
  width: 420px;
  height: auto;
  background: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(30px) saturate(180%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    -20px 0 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  z-index: 950;
  display: flex;
  flex-direction: column;
  padding: 24px;
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

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.1);
  z-index: 1;
`;

const SidebarTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled(motion.button)`
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

  &:hover {
    background: rgba(var(--text-rgb), 0.1);
    color: var(--text-primary);
  }
`;

// 侧边栏内的 Pet 容器 (缩小版)
const HeaderPetContainer = styled.div`
  width: 40px;
  height: 50px;
  position: relative;
`;

// 消息气泡
const MessageBubble = styled(motion.div)<{ isUser?: boolean }>`
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  background: ${(props) =>
    props.isUser
      ? 'linear-gradient(135deg, var(--accent-color), var(--accent-color-hover))'
      : 'rgba(var(--bg-primary-rgb), 0.6)'};
  color: ${(props) => (props.isUser ? '#fff' : 'var(--text-primary)')};
  padding: 12px 18px;
  border-radius: 20px;
  border-bottom-right-radius: ${(props) => (props.isUser ? '4px' : '20px')};
  border-bottom-left-radius: ${(props) => (props.isUser ? '20px' : '4px')};
  max-width: 85%;
  font-size: 0.95rem;
  line-height: 1.6;
  box-shadow: ${(props) => (props.isUser ? '0 8px 20px rgba(var(--accent-rgb), 0.2)' : '0 2px 10px rgba(0,0,0,0.02)')};
  border: 1px solid ${(props) => (props.isUser ? 'transparent' : 'rgba(var(--border-rgb), 0.1)')};
  backdrop-filter: blur(10px);
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-rgb), 0.1);
    border-radius: 2px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  background: rgba(var(--bg-primary-rgb), 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  border-radius: 24px;
  padding: 6px 6px 6px 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  z-index: 1;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

  &:focus-within {
    background: rgba(var(--bg-primary-rgb), 0.5);
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
  }
`;

const StyledInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-tertiary);
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
  const ai = useSimulatedAI();

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

      {/* 2. 右下角功能栈 */}
      <StackContainer>
        <AnimatePresence>
          {/* 返回顶部 */}
          {showBackTop && !isAIActive && (
            <DockItem
              key="backtop"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <GlassButton onClick={scrollToTop} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FiArrowUp size={22} />
              </GlassButton>
            </DockItem>
          )}
        </AnimatePresence>
      </StackContainer>

      {/* 3. AI 侧边栏 */}
      <AnimatePresence>
        {isAIActive && (
          <>
            {/* 遮罩层 (点击空白处关闭) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.2)',
                zIndex: 940,
              }}
              onClick={handleClose}
            />

            <AISidebar
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SidebarHeader>
                <SidebarTitle>
                  <HeaderPetContainer>
                    {isDark ? (
                      <GhostVisual clickCount={0} isHovered={false} isBlinking={true} particles={[]} />
                    ) : (
                      <SheepVisual clickCount={0} isHovered={false} isBlinking={true} particles={[]} />
                    )}
                  </HeaderPetContainer>
                  AI Assistant
                </SidebarTitle>
                <CloseButton onClick={handleClose}>
                  <FiArrowUp style={{ rotate: '90deg' }} />
                </CloseButton>
              </SidebarHeader>

              <ChatArea>
                {ai.reply ? (
                  <>
                    {ai.inputValue && <MessageBubble isUser>{ai.inputValue}</MessageBubble>}
                    <MessageBubble>{ai.reply}</MessageBubble>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: 100, color: 'var(--text-tertiary)' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>AI Assistant Ready</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Ask me anything about this page or code.</p>
                  </div>
                )}
              </ChatArea>

              <InputWrapper>
                <StyledInput
                  placeholder="输入问题..."
                  value={ai.inputValue}
                  onChange={(e) => ai.setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && ai.send(ai.inputValue)}
                  autoFocus
                />
              </InputWrapper>
            </AISidebar>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DesktopSmartDock;
