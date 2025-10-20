import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useAnimationEngine } from '@/utils/animation-engine';
import type { UserStats } from './types';

interface DataStatsGridProps {
  stats: UserStats[];
  onStatClick?: (stat: UserStats) => void;
  isLoading?: boolean;
}

// 卡片基础样式
const Card = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }
`;

const StatCard = styled(motion.div)<{ highlight?: boolean; clickable?: boolean }>`
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  position: relative;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  ${(props) =>
    props.highlight &&
    `
    border-color: var(--accent-color);
    background: var(--accent-color-alpha);
  `}
`;

const StatIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: var(--accent-color);
  opacity: 0.7;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const StatTrend = styled.div<{ direction: 'up' | 'down' | 'stable' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${(props) =>
    props.direction === 'up'
      ? 'var(--success-color)'
      : props.direction === 'down'
        ? 'var(--error-color)'
        : 'var(--text-secondary)'};

  svg {
    font-size: 0.875rem;
  }
`;

const LoadingSkeleton = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.25rem;
  height: 1rem;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const formatNumber = (num: number | string): string => {
  if (typeof num === 'string') return num;

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }

  return num.toLocaleString();
};

export const DataStatsGrid: React.FC<DataStatsGridProps> = ({ stats, onStatClick, isLoading = false }) => {
  const { variants, springPresets } = useAnimationEngine();

  const handleStatClick = (stat: UserStats) => {
    if (onStatClick) {
      onStatClick(stat);
    }
  };

  if (isLoading) {
    return (
      <Card variants={variants.fadeIn} initial="hidden" animate="visible">
        <SectionTitle>数据概览</SectionTitle>
        <StatsGrid>
          {Array.from({ length: 6 }).map((_, index) => (
            <StatCard key={index}>
              <StatHeader>
                <div>
                  <LoadingSkeleton style={{ width: '60px', marginBottom: '0.5rem' }} />
                  <LoadingSkeleton style={{ width: '80px', height: '1.5rem' }} />
                </div>
              </StatHeader>
            </StatCard>
          ))}
        </StatsGrid>
      </Card>
    );
  }

  return (
    <Card variants={variants.card} initial="hidden" animate="visible">
      <SectionTitle>📊 数据概览</SectionTitle>
      <StatsGrid variants={variants.stagger} initial="hidden" animate="visible">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            highlight={stat.highlight}
            clickable={!!onStatClick}
            onClick={() => handleStatClick(stat)}
            variants={variants.listItem}
            whileHover={onStatClick ? { y: -4, scale: 1.02 } : undefined}
            whileTap={onStatClick ? { scale: 0.98 } : undefined}
            transition={springPresets.bouncy}
          >
            <StatHeader>
              <div style={{ flex: 1 }}>
                <StatLabel>{stat.label}</StatLabel>
                <StatValue>{formatNumber(stat.value)}</StatValue>
                {stat.trend && (
                  <StatTrend direction={stat.trend.direction}>
                    {stat.trend.direction === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                    <span>{stat.trend.percentage}%</span>
                  </StatTrend>
                )}
              </div>
            </StatHeader>
            <StatIcon>{stat.icon}</StatIcon>
          </StatCard>
        ))}
      </StatsGrid>
    </Card>
  );
};
