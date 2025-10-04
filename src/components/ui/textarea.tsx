import React, { forwardRef } from 'react';
import styled from '@emotion/styled';

// Textarea尺寸类型
type TextareaSize = 'small' | 'medium' | 'large';

// Textarea组件样式
const TextareaElement = styled.textarea<{
  size: TextareaSize;
  fullWidth?: boolean;
  error?: boolean;
}>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '0.5rem 0.75rem';
      case 'medium':
        return '0.75rem 1rem';
      case 'large':
        return '1rem 1.25rem';
      default:
        return '0.75rem 1rem';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '0.875rem';
      case 'medium':
        return '0.95rem';
      case 'large':
        return '1rem';
      default:
        return '0.95rem';
    }
  }};
  line-height: 1.5;
  border: 1px solid ${({ error }) => (error ? 'var(--error-color)' : 'var(--border-color)')};
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-alpha);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--bg-secondary);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }

  // 错误状态
  ${({ error }) =>
    error &&
    `
    &:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgba(var(--error-rgb), 0.1);
    }
  `}
`;

// Textarea组件接口
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
}

// Textarea组件
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'medium',
      fullWidth = true,
      error = false,
      helperText,
      label,
      required = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <TextareaContainer className={className} style={style}>
        {label && (
          <Label>
            {label}
            {required && <RequiredMark>*</RequiredMark>}
          </Label>
        )}
        <TextareaElement ref={ref} size={size} fullWidth={fullWidth} error={error} {...props} />
        {helperText && <HelperText error={error}>{helperText}</HelperText>}
      </TextareaContainer>
    );
  },
);

// 容器样式
const TextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// 标签样式
const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// 必填标记
const RequiredMark = styled.span`
  color: var(--error-color);
  font-weight: 600;
`;

// 帮助文本样式
const HelperText = styled.span<{ error?: boolean }>`
  font-size: 0.75rem;
  color: ${({ error }) => (error ? 'var(--error-color)' : 'var(--text-tertiary)')};
  margin-top: 0.25rem;
`;

// 设置显示名称
Textarea.displayName = 'Textarea';

export default Textarea;
