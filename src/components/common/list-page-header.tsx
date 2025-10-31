/**
 * 📋 列表页统一 Header 组件
 * 用于手记、文章、项目等列表页的头部
 */

import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SPRING_PRESETS } from '@/utils/ui/animation';

// Header 容器
const Header = styled(motion.div)`
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
`;

// 页面标题
const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

// 副标题/描述
const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--text-tertiary);
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

// 统计信息
const StatsInfo = styled.div`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;

  .count {
    color: var(--accent-color);
    font-weight: 600;
    font-family: var(--font-code, 'Consolas', 'Monaco', monospace);
    font-size: 0.9rem;
  }

  .text {
    opacity: 0.8;
  }
`;

interface ListPageHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  countUnit?: string; // 如：'篇文章'、'篇手记'、'个项目'
  showStats?: boolean;
  children?: React.ReactNode;
}

/**
 * 列表页统一 Header 组件
 */
export const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  title,
  subtitle,
  count,
  countUnit = '项',
  showStats = true,
  children,
}) => {
  return (
    <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_PRESETS.gentle}>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {showStats && count !== undefined && (
        <StatsInfo>
          <span className="text">共</span>
          <span className="count"> {count} </span>
          <span className="text">{countUnit}</span>
        </StatsInfo>
      )}
      {children}
    </Header>
  );
};

export default ListPageHeader;
