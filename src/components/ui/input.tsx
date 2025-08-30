import React, { forwardRef, useState } from 'react';
import styled from '@emotion/styled';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

// 输入框尺寸类型
type InputSize = 'small' | 'medium' | 'large';
// 输入框变体类型
type InputVariant = 'default' | 'filled' | 'bordered' | 'flushed';

// 输入框容器
const InputWrapper = styled.div<{ size: InputSize; hasError?: boolean; disabled?: boolean }>`
  position: relative;
  width: 100%;

  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.6;
    pointer-events: none;
  `}
`;

// 输入框主体
const InputElement = styled.input<{
  variant: InputVariant;
  $size: InputSize;
  hasError?: boolean;
  hasIcon?: boolean;
  hasRightElement?: boolean;
}>`
  width: 100%;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
  outline: none;
  background-color: var(--bg-primary);
  color: var(--text-primary);

  // 尺寸样式
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          min-height: 2rem;
        `;
      case 'large':
        return `
          padding: 0.875rem 1rem;
          font-size: 1.125rem;
          min-height: 3rem;
        `;
      default: // medium
        return `
          padding: 0.6rem 0.875rem;
          font-size: 0.95rem;
          min-height: 2.5rem;
        `;
    }
  }}

  // 左侧图标间距
  ${({ hasIcon, $size }) =>
    hasIcon &&
    `
    padding-left: ${$size === 'small' ? '2.25rem' : $size === 'large' ? '3rem' : '2.5rem'};
  `}

  // 右侧元素间距
  ${({ hasRightElement, $size }) =>
    hasRightElement &&
    `
    padding-right: ${$size === 'small' ? '2.25rem' : $size === 'large' ? '3rem' : '2.5rem'};
  `}

  // 变体样式
  ${({ variant, hasError }) => {
    const borderColor = hasError ? 'var(--error-color)' : 'var(--border-color)';
    const focusBorderColor = hasError ? 'var(--error-color)' : 'var(--accent-color)';

    switch (variant) {
      case 'filled':
        return `
          background-color: var(--bg-secondary);
          border: 2px solid transparent;
          
          &:focus {
            background-color: var(--bg-primary);
            border-color: ${focusBorderColor};
            box-shadow: 0 0 0 3px ${hasError ? 'rgba(244, 67, 54, 0.1)' : 'var(--accent-color-alpha)'};
          }
          
          &:hover:not(:focus) {
            background-color: var(--bg-tertiary);
          }
        `;
      case 'bordered':
        return `
          background-color: transparent;
          border: 2px solid ${borderColor};
          
          &:focus {
            border-color: ${focusBorderColor};
            box-shadow: 0 0 0 3px ${hasError ? 'rgba(244, 67, 54, 0.1)' : 'var(--accent-color-alpha)'};
          }
          
          &:hover:not(:focus) {
            border-color: var(--text-secondary);
          }
        `;
      case 'flushed':
        return `
          background-color: transparent;
          border: none;
          border-bottom: 2px solid ${borderColor};
          border-radius: 0;
          padding-left: 0;
          padding-right: 0;
          
          &:focus {
            border-bottom-color: ${focusBorderColor};
            box-shadow: 0 2px 0 0 ${hasError ? 'var(--error-color)' : 'var(--accent-color)'};
          }
        `;
      default: // default
        return `
          background-color: var(--bg-primary);
          border: 1px solid ${borderColor};
          
          &:focus {
            border-color: ${focusBorderColor};
            box-shadow: 0 0 0 3px ${hasError ? 'rgba(244, 67, 54, 0.1)' : 'var(--accent-color-alpha)'};
          }
          
          &:hover:not(:focus) {
            border-color: var(--text-secondary);
          }
        `;
    }
  }}

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:disabled {
    cursor: not-allowed;
    background-color: var(--bg-secondary);
    color: var(--text-tertiary);
  }
`;

// 图标容器
const IconWrapper = styled.div<{ position: 'left' | 'right'; size: InputSize; clickable?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  pointer-events: ${({ clickable }) => (clickable ? 'auto' : 'none')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};

  ${({ position, size }) => {
    const spacing = size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem';
    return position === 'left' ? `left: ${spacing};` : `right: ${spacing};`;
  }}

  &:hover {
    color: ${({ clickable }) => (clickable ? 'var(--text-primary)' : 'var(--text-secondary)')};
  }
`;

// 标签样式
const Label = styled.label<{ required?: boolean; hasError?: boolean }>`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ hasError }) => (hasError ? 'var(--error-color)' : 'var(--text-primary)')};

  ${({ required }) =>
    required &&
    `
    &::after {
      content: ' *';
      color: var(--error-color);
    }
  `}
`;

// 帮助文本
const HelperText = styled.div<{ hasError?: boolean }>`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: ${({ hasError }) => (hasError ? 'var(--error-color)' : 'var(--text-secondary)')};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// 输入框属性接口
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  isRequired?: boolean;
  isInvalid?: boolean;
}

// 输入框组件
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightElement,
      isRequired = false,
      isInvalid = false,
      type = 'text',
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const hasError = isInvalid || !!errorMessage;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={className}>
        {label && (
          <Label required={isRequired} hasError={hasError}>
            {label}
          </Label>
        )}

        <InputWrapper size={size} hasError={hasError} disabled={disabled}>
          {leftIcon && (
            <IconWrapper position="left" size={size}>
              {leftIcon}
            </IconWrapper>
          )}

          <InputElement
            ref={ref}
            type={inputType}
            variant={variant}
            $size={size}
            hasError={hasError}
            hasIcon={!!leftIcon}
            hasRightElement={!!rightElement || isPassword}
            disabled={disabled}
            {...props}
          />

          {isPassword && (
            <IconWrapper position="right" size={size} clickable onClick={handleTogglePassword}>
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </IconWrapper>
          )}

          {rightElement && !isPassword && (
            <IconWrapper position="right" size={size}>
              {rightElement}
            </IconWrapper>
          )}
        </InputWrapper>

        {(errorMessage || helperText) && (
          <HelperText hasError={hasError}>
            {hasError && <FiAlertCircle size={12} />}
            {errorMessage || helperText}
          </HelperText>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
