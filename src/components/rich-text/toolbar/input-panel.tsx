import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Input, Button } from 'adnaan-ui';

const InputPanelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 90;
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
      <Input
        ref={inputRef}
        type="url"
        placeholder={type === 'link' ? '输入链接地址 (https://...)' : '输入图片地址 (https://...)'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        size="small"
        style={{ flex: 1 }}
      />
      <Button variant="primary" size="small" onClick={onConfirm}>
        插入
      </Button>
      <Button variant="secondary" size="small" onClick={onCancel}>
        取消
      </Button>
    </InputPanelContainer>
  );
};
