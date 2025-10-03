import React from 'react';
import styled from '@emotion/styled';
import { MessageType } from '@/ui/common-types';

// Badge样式
const BadgeContainer = styled.span<{ type: string; dot?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ dot }) => (dot ? '0' : '0.75rem')};
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  border-radius: ${({ dot }) => (dot ? '50%' : 'var(--radius-full)')};
  padding: ${({ dot }) => (dot ? '0' : '0.25rem 0.5rem')};
  min-width: ${({ dot }) => (dot ? '8px' : '20px')};
  height: ${({ dot }) => (dot ? '8px' : 'auto')};
  color: white;
  background-color: ${({ type }) =>
    type === 'success'
      ? 'var(--success-color)'
      : type === 'info'
        ? 'var(--accent-color)'
        : type === 'warning'
          ? '#FFA726'
          : type === 'error'
            ? 'var(--error-color)'
            : 'var(--text-tertiary)'};
`;

// 组件接口
export interface BadgeProps {
  count?: number;
  overflowCount?: number;
  dot?: boolean;
  type?: MessageType | 'default';
  className?: string;
  style?: React.CSSProperties;
}

// Badge组件
export const Badge: React.FC<BadgeProps> = ({
  count,
  overflowCount = 99,
  dot = false,
  type = 'default',
  className,
  style,
}) => {
  // 如果count为0且不是dot，则不显示
  if (count === 0 && !dot) return null;

  // 计算显示的文本
  const displayCount = count && count > overflowCount ? `${overflowCount}+` : count;

  return (
    <BadgeContainer className={className} style={style} type={type} dot={dot}>
      {!dot && displayCount}
    </BadgeContainer>
  );
};

export default Badge;
