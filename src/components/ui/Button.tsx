import React from 'react';
import styled from '@emotion/styled';

// 按钮组件样式
const ButtonElement = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: var(--accent-color);
          color: white;
          border: none;
          
          &:hover {
            background-color: var(--accent-color-hover);
            transform: translateY(-2px);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error-color);
          color: white;
          border: none;
          
          &:hover {
            background-color: #d32f2f;
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          
          &:hover {
            background-color: var(--bg-tertiary);
            transform: translateY(-2px);
          }
        `;
    }
  }}
`;

// 按钮属性接口
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

// 按钮组件
export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', children, ...props }) => {
  return (
    <ButtonElement variant={variant} {...props}>
      {children}
    </ButtonElement>
  );
};

export default Button; 