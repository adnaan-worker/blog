import React, { forwardRef } from 'react';
import styled from '@emotion/styled';

// 按钮尺寸类型
type ButtonSize = 'small' | 'medium' | 'large';
// 按钮变体类型
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'outline';

// 按钮组件样式
const ButtonElement = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  outline: none;
  font-family: inherit;
  text-decoration: none;
  white-space: nowrap;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  // 禁用状态
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  // 加载状态
  ${({ isLoading }) =>
    isLoading &&
    `
    pointer-events: none;
    
    & > *:not(.loading-spinner) {
      opacity: 0.7;
    }
  `}

  // 尺寸样式
  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 2rem;
        `;
      case 'large':
        return `
          padding: 0.875rem 1.75rem;
          font-size: 1.125rem;
          min-height: 3rem;
        `;
      default: // medium
        return `
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          min-height: 2.5rem;
        `;
    }
  }}

  // 变体样式
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: var(--accent-color);
          color: white;
          border: 2px solid var(--accent-color);
          
          &:hover:not(:disabled) {
            background-color: var(--accent-color-hover);
            border-color: var(--accent-color-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px var(--accent-color-alpha);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
          
          &:hover:not(:disabled) {
            background-color: var(--bg-tertiary);
            border-color: var(--accent-color-alpha);
            transform: translateY(-1px);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error-color);
          color: white;
          border: 2px solid var(--error-border);
          
          &:hover:not(:disabled) {
            background-color: var(--error-hover);
            border-color: var(--error-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px var(--error-bg);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'success':
        return `
          background-color: var(--success-color);
          color: white;
          border: 2px solid var(--success-border);
          
          &:hover:not(:disabled) {
            background-color: var(--success-hover);
            border-color: var(--success-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px var(--success-bg);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'warning':
        return `
          background-color: var(--warning-color);
          color: white;
          border: 2px solid var(--warning-border);
          
          &:hover:not(:disabled) {
            background-color: var(--warning-hover);
            border-color: var(--warning-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px var(--warning-bg);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'info':
        return `
          background-color: var(--info-color);
          color: white;
          border: 2px solid var(--info-border);
          
          &:hover:not(:disabled) {
            background-color: var(--info-hover);
            border-color: var(--info-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px var(--info-bg);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: var(--text-primary);
          border: 2px solid transparent;
          
          &:hover:not(:disabled) {
            background-color: var(--bg-secondary);
            color: var(--accent-color);
            transform: translateY(-1px);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: var(--accent-color);
          border: 2px solid var(--accent-color);
          
          &:hover:not(:disabled) {
            background-color: var(--accent-color);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px var(--accent-color-alpha);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      default:
        return '';
    }
  }}

  // 聚焦样式
  &:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

// 加载旋转器
const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// 按钮属性接口
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

// 按钮组件
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'medium',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <ButtonElement
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner className="loading-spinner" />}
        {leftIcon && !isLoading && leftIcon}
        {children}
        {rightIcon && !isLoading && rightIcon}
      </ButtonElement>
    );
  },
);

Button.displayName = 'Button';

export default Button;
