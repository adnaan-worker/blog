import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const InputPanelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 90;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
    }
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: var(--accent-color);
    color: var(--text-on-accent);
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }

    &:last-child {
      background: var(--bg-tertiary);
      color: var(--text-primary);

      &:hover {
        background: var(--bg-secondary);
      }
    }
  }
`;

interface InputPanelProps {
  type: 'link' | 'image';
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ type, value, onChange, onConfirm, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 自动聚焦输入框
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <InputPanelContainer>
      <input
        ref={inputRef}
        type="url"
        placeholder={type === 'link' ? '输入链接地址 (https://...)' : '输入图片地址 (https://...)'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={onConfirm}>插入</button>
      <button onClick={onCancel}>取消</button>
    </InputPanelContainer>
  );
};
