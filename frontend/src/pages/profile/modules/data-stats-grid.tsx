import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useAnimationEngine } from '@/utils/ui/animation';
import type { UserStats } from './types';

interface DataStatsGridProps {
  stats: UserStats[];
  onStatClick?: (stat: UserStats) => void;
  isLoading?: boolean;
}

// 高级卡片容器
const Card = styled(motion.div)`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb), 0.06) 0%,
    rgba(var(--accent-rgb), 0.02) 50%,
    var(--bg-primary) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(var(--accent-rgb), 0.12);
  padding: 2rem 1.5rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(var(--accent-rgb), 0.1);

  [data-theme='dark'] & {
    background: linear-gradient(
      135deg,
      rgba(var(--accent-rgb), 0.1) 0%,
      rgba(var(--accent-rgb), 0.04) 50%,
      var(--bg-secondary) 100%
    );
    border-color: rgba(var(--accent-rgb), 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(motion.div)<{ highlight?: boolean; clickable?: boolean }>`
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(var(--accent-rgb), 0.03) 100%);
  border-radius: 18px;
  border: 1.5px solid rgba(var(--accent-rgb), 0.15);
  position: relative;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 16px rgba(var(--accent-rgb), 0.08);

  /* 动态光效 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle at center, rgba(var(--accent-rgb), 0.15) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.03);
    border-color: rgba(var(--accent-rgb), 0.3);
    box-shadow: 0 12px 32px rgba(var(--accent-rgb), 0.18);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
  }

  ${(props) =>
    props.highlight &&
    `
    border-color: rgba(var(--accent-rgb), 0.4);
    background: linear-gradient(135deg,
      rgba(var(--accent-rgb), 0.15) 0%,
      rgba(var(--accent-rgb), 0.08) 100%
    );
    box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.2);
  `}

  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(var(--accent-rgb), 0.05) 100%);
    border-color: rgba(var(--accent-rgb), 0.25);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    &:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }
  }
`;

const StatIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: var(--accent-color);
  opacity: 0.25;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  filter: drop-shadow(0 2px 8px rgba(var(--accent-rgb), 0.3));

  ${StatCard}:hover & {
    opacity: 0.4;
    transform: translateY(-50%) scale(1.1) rotate(5deg);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;

  /* 数字动画 */
  @keyframes countUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  animation: countUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
`;

const StatTrend = styled.div<{ direction: 'up' | 'down' | 'stable' }>`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
  color: ${(props) =>
    props.direction === 'up'
      ? 'var(--success-color)'
      : props.direction === 'down'
        ? 'var(--error-color)'
        : 'var(--text-secondary)'};

  svg {
    font-size: 1rem;
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
