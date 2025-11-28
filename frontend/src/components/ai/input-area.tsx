import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Button } from 'adnaan-ui';
import { FiSend, FiStopCircle } from 'react-icons/fi';

interface InputAreaProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

const Container = styled.div`
  padding: 1.5rem;
  /* 移除背景色，让输入框悬浮 */
  background: transparent;
  position: relative;
  z-index: 20;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  /* 降低不透明度，增加模糊度 */
  background: rgba(var(--bg-secondary-rgb), 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  border-radius: 24px;
  padding: 0.75rem 0.75rem 0.75rem 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;

  &:focus-within {
    background: rgba(var(--bg-secondary-rgb), 0.8);
    border-color: var(--accent-color);
    box-shadow:
      0 12px 40px rgba(var(--accent-rgb), 0.2),
      0 0 0 1px var(--accent-color) inset;
    transform: translateY(-2px);
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  padding: 4px 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  max-height: 120px;
  min-height: 24px;
  font-family: inherit;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const ActionButton = styled.button<{ variant?: 'stop' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${(props) =>
    props.variant === 'stop'
      ? `
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    &:hover { background: #ef4444; color: white; transform: scale(1.05); }
  `
      : `
    background: var(--accent-color);
    color: #fff;
    box-shadow: 0 2px 10px rgba(var(--accent-rgb), 0.3);
    &:hover { 
      opacity: 0.9; 
      transform: scale(1.05); 
      box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.4);
    }
    &:disabled { 
      background: var(--bg-tertiary); 
      color: var(--text-tertiary); 
      cursor: not-allowed; 
      box-shadow: none;
      transform: none;
    }
  `}
`;

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onStop, disabled, isStreaming }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
  };

  return (
    <Container>
      <InputWrapper>
        <TextArea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Wayne 正在思考...' : '输入问题，Shift + Enter 换行'}
          disabled={disabled || isStreaming}
          rows={1}
        />
        {isStreaming ? (
          <ActionButton variant="stop" onClick={onStop} title="停止生成">
            <FiStopCircle />
          </ActionButton>
        ) : (
          <ActionButton onClick={handleSend} disabled={!text.trim() || disabled}>
            <FiSend />
          </ActionButton>
        )}
      </InputWrapper>
    </Container>
  );
};
