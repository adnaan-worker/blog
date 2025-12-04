import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiSend, FiStopCircle, FiPaperclip, FiMic, FiCommand } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface InputAreaProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

const Container = styled.div`
  padding: 0 1.5rem 1.5rem;
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none; /* Allow clicks to pass through the container padding */

  @media (max-width: 768px) {
    padding: 0 1rem 1rem;
  }
`;

const InputWrapper = styled(motion.div)<{ isFocused: boolean }>`
  pointer-events: auto; /* Re-enable clicks for the input */
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  background: rgba(var(--bg-secondary-rgb), 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  box-shadow:
    0 4px 24px -1px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  overflow: hidden;
  transition: background 0.3s ease;

  /* 动态边框效果 */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 26px;
    padding: 2px;
    background: linear-gradient(135deg, var(--accent-color), #a855f7, var(--accent-color));
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: ${(props) => (props.isFocused ? 0.5 : 0)};
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  /* 光晕效果 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    box-shadow: ${(props) => (props.isFocused ? '0 0 30px rgba(var(--accent-rgb), 0.15)' : 'none')};
    transition: box-shadow 0.3s ease;
    pointer-events: none;
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-end;
  padding: 12px;
  gap: 8px;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: 8px 4px;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  max-height: 200px;
  min-height: 24px;
  font-family: inherit;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-tertiary);
    transition: color 0.2s;
  }
`;

const ToolBar = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 12px;
  border-top: 1px solid rgba(var(--border-rgb), 0.05);
`;

const ToolsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(var(--text-rgb), 0.05);
    color: var(--text-secondary);
  }
`;

const SendButton = styled(motion.button)<{ variant?: 'stop' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 18px; /* Capsule shape */
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;

  ${(props) =>
    props.variant === 'stop'
      ? `
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    &:hover { background: rgba(239, 68, 68, 0.2); }
  `
      : `
    background: var(--accent-color);
    color: white;
    box-shadow: 0 2px 10px rgba(var(--accent-rgb), 0.3);
    &:hover { filter: brightness(1.1); }
    &:disabled { 
      background: var(--bg-tertiary); 
      color: var(--text-tertiary);
      box-shadow: none;
      cursor: not-allowed;
    }
  `}
`;

const ShortcutHint = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;

  kbd {
    background: rgba(var(--text-rgb), 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: inherit;
    min-width: 16px;
    text-align: center;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onStop, disabled, isStreaming }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
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
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <Container>
      <InputWrapper
        isFocused={isFocused || text.length > 0}
        animate={{
          boxShadow: isFocused
            ? '0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            : '0 4px 24px -1px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        }}
      >
        <TopSection>
          <ToolButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FiPaperclip size={18} />
          </ToolButton>

          <TextArea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Wayne 正在思考...' : '有什么可以帮你的吗？'}
            disabled={disabled || isStreaming}
            rows={1}
          />

          {!text && !isStreaming && (
            <ToolButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FiMic size={18} />
            </ToolButton>
          )}
        </TopSection>

        {/* 工具栏 - 当有内容或 Focus 时显示 */}
        <AnimatePresence>
          {(isFocused || text.length > 0 || isStreaming) && (
            <ToolBar
              initial={{ height: 0, opacity: 0, padding: 0 }}
              animate={{ height: 'auto', opacity: 1, padding: '8px 12px 12px' }}
              exit={{ height: 0, opacity: 0, padding: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ToolsLeft>
                <ToolButton title="模型设置" whileHover={{ scale: 1.05 }}>
                  <FiCommand size={14} />
                </ToolButton>
                <ShortcutHint>使用模型: Doubao</ShortcutHint>
              </ToolsLeft>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ShortcutHint>
                  <kbd>↵</kbd> 发送 <kbd>⇧</kbd>
                  <kbd>↵</kbd> 换行
                </ShortcutHint>

                {isStreaming ? (
                  <SendButton variant="stop" onClick={onStop} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FiStopCircle size={16} />
                    <span>停止</span>
                  </SendButton>
                ) : (
                  <SendButton
                    onClick={handleSend}
                    disabled={!text.trim() || disabled}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span>发送</span>
                    <FiSend size={14} />
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
