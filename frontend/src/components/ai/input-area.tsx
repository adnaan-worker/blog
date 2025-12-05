import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { FiSend, FiSquare, FiPaperclip, FiMic, FiCommand, FiCpu, FiZap, FiDatabase, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';

interface InputAreaProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gentlePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.1); }
  50% { box-shadow: 0 0 20px 4px rgba(var(--accent-rgb), 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.1); }
`;

const Container = styled.div`
  padding: 0 1.5rem 1.5rem;
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;

  @media (max-width: 768px) {
    padding: 0 1rem 1rem;
  }
`;

const InputWrapper = styled(motion.div)<{ isFocused: boolean; isStreaming?: boolean }>`
  pointer-events: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  /* 高级毛玻璃质感 */
  background: rgba(var(--bg-secondary-rgb), 0.6);
  backdrop-filter: blur(24px) saturate(120%);
  border-radius: 20px;
  /* 极细的边框 */
  border: 1px solid rgba(var(--border-rgb), 0.1);

  /* 移除 CSS transition，完全交给 Framer Motion 的 layout 属性处理，避免冲突 */
  /* transition: background-color 0.3s ease, border-color 0.3s ease; */

  /* 使用伪元素实现阴影过渡 */
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 20px;
    z-index: -1;
    transition: opacity 0.3s ease;
    opacity: ${(props) => (props.isStreaming ? 1 : props.isFocused ? 1 : 0)};
    box-shadow: ${(props) =>
      props.isStreaming ? '0 12px 40px -8px rgba(0, 0, 0, 0.15)' : '0 8px 32px -8px rgba(0, 0, 0, 0.12)'};
  }

  /* 默认态的轻微阴影 */
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.05);

  /* 思考时的呼吸光效 */
  ${(props) =>
    props.isStreaming &&
    css`
      animation: ${gentlePulse} 3s infinite;
    `}

  /* 底部的高亮线条，暗示能量 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(var(--accent-rgb), 0.5) 50%, transparent 100%);
    opacity: ${(props) => (props.isStreaming ? 1 : 0)};
    transition: opacity 0.5s;
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-end;
  padding: 16px 16px 8px;
  gap: 12px;
  position: relative;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: 8px 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  max-height: 200px;
  min-height: 24px;
  font-family: inherit;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }

  &:disabled {
    color: var(--text-secondary);
    cursor: default;
  }
`;

const ToolBar = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 12px;
`;

const ToolButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(var(--text-rgb), 0.04);
    color: var(--text-secondary);
  }
`;

const SendButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: var(--accent-color); /* 使用主题强调色 */
  color: white;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    background: var(--accent-color);
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3); /* 使用主题色阴影 */
    filter: brightness(1.1);
  }

  &:disabled {
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: none;
  }
`;

const StopButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid rgba(var(--text-rgb), 0.1);
  border-radius: 16px;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(var(--text-rgb), 0.04);
    color: var(--text-primary);
    border-color: rgba(var(--text-rgb), 0.2);
  }

  /* 激活状态更加明显 */
  &:active {
    transform: scale(0.96);
  }
`;

// 流体文字效果
const FluidText = styled.span`
  background: linear-gradient(90deg, var(--text-secondary) 0%, var(--text-primary) 50%, var(--text-secondary) 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 3s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
`;

const StatusBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 4px 0;
`;

const STATUS_MESSAGES = [
  { text: '正在连接神经元...', icon: FiCpu },
  { text: '正在检索记忆碎片...', icon: FiDatabase },
  { text: '正在编织语言魔法...', icon: FiZap },
];

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onStop, disabled, isStreaming }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || disabled || isStreaming) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const CurrentStatusIcon = STATUS_MESSAGES[statusIndex].icon;

  return (
    <Container>
      <InputWrapper
        layout
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        isFocused={isFocused || text.length > 0}
        isStreaming={isStreaming}
      >
        <TopSection>
          <ToolButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isStreaming}>
            <FiPaperclip size={20} />
          </ToolButton>

          <TextArea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? '' : '与 Wayne 一起探索数字宇宙...'}
            disabled={disabled || isStreaming}
            rows={1}
          />

          {/* 思考状态展示 - 极简风格 */}
          {isStreaming && (
            <div
              style={{
                position: 'absolute',
                left: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <AnimatePresence mode="wait">
                <StatusBadge
                  key={statusIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <CurrentStatusIcon size={14} style={{ opacity: 0.7 }} />
                  </motion.div>
                  <FluidText>{STATUS_MESSAGES[statusIndex].text}</FluidText>
                </StatusBadge>
              </AnimatePresence>
            </div>
          )}

          {!text && !isStreaming && (
            <ToolButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FiMic size={20} />
            </ToolButton>
          )}
        </TopSection>

        <AnimatePresence>
          {(isFocused || text.length > 0 || isStreaming) && (
            <ToolBar
              layout
              /* 关键修复：Enter 时不要从 height: 0 开始，直接让它存在，靠父容器的 layout 属性去平滑过渡 */
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, padding: 0, marginBottom: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                /* 收缩时使用 spring，确保平滑 */
                height: { type: 'spring', bounce: 0, duration: 0.3 },
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
                {!isStreaming && (
                  <>
                    <ToolButton title="模型" style={{ width: 'auto', padding: '0 8px', gap: 6 }}>
                      <FiLayers size={14} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Doubao-Pro</span>
                    </ToolButton>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isStreaming ? (
                  <StopButton onClick={onStop} whileTap={{ scale: 0.95 }}>
                    <FiSquare size={10} fill="currentColor" />
                    <span>停止生成</span>
                  </StopButton>
                ) : (
                  <SendButton
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <FiSend size={16} style={{ marginLeft: text.trim() ? -2 : 0 }} />
                  </SendButton>
                )}
              </div>
            </ToolBar>
          )}
        </AnimatePresence>
      </InputWrapper>
    </Container>
  );
};
