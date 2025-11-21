import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiLock, FiInfo } from 'react-icons/fi';
import type { Achievement } from './types';
import { useAnimationEngine } from '@/utils/ui/animation';

interface AchievementBadgesProps {
  achievements: Achievement[];
  onBadgeClick?: (achievement: Achievement) => void;
  onViewAll?: () => void;
  maxDisplay?: number; // 如果为0或undefined，显示所有成就
}

// 内容容器
const Container = styled.div`
  padding: 1.5rem;
  position: relative;
  z-index: 1;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.01em;

  &::before {
    content: '🏆';
    font-size: 1.4rem;
    filter: drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.5));
  }
`;

const BadgesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const BadgeCard = styled(motion.div)<{ unlocked: boolean; clickable?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.75rem;
  border-radius: 16px;
  text-align: center;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 100px;

  ${(props) =>
    props.unlocked
      ? `
    background: linear-gradient(135deg,
      rgba(var(--accent-rgb), 0.12) 0%,
      rgba(var(--accent-rgb), 0.06) 100%
    );
    border: 1.5px solid rgba(var(--accent-rgb), 0.3);
    color: var(--accent-color);
    box-shadow: 0 4px 16px rgba(var(--accent-rgb), 0.15);
    
    /* 3D光效 */
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at center,
        rgba(var(--accent-rgb), 0.2) 0%,
        transparent 60%
      );
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    
    &:hover {
      transform: translateY(-4px) scale(1.05);
      border-color: rgba(var(--accent-rgb), 0.5);
      box-shadow: 0 12px 32px rgba(var(--accent-rgb), 0.25);
      
      &::before {
        opacity: 1;
      }
    }
  `
      : `
    background: linear-gradient(135deg,
      rgba(var(--text-tertiary-rgb, 118, 118, 118), 0.03) 0%,
      rgba(var(--text-tertiary-rgb, 118, 118, 118), 0.01) 100%
    );
    border: 1.5px dashed rgba(var(--border-rgb, 0, 0, 0), 0.15);
    color: var(--text-tertiary);
    
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(var(--border-rgb, 0, 0, 0), 0.25);
    }
  `}

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const BadgeIcon = styled.div<{ unlocked: boolean }>`
  font-size: 2rem;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  ${(props) =>
    props.unlocked
      ? `
    filter: drop-shadow(0 4px 12px rgba(var(--accent-rgb), 0.4));
    
    ${BadgeCard}:hover & {
      transform: scale(1.15) rotate(5deg);
    }
  `
      : `
    filter: grayscale(100%);
    opacity: 0.4;
  `}
`;

const BadgeName = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.3;
  position: relative;
  z-index: 1;
`;

const BadgeProgress = styled.div<{ unlocked: boolean }>`
  font-size: 0.625rem;
  opacity: 0.8;

  ${(props) =>
    props.unlocked &&
    `
    display: none;
  `}
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background: var(--border-color);
  border-radius: 1.5px;
  margin-top: 0.25rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
`;

const UnlockedDate = styled.div`
  font-size: 0.625rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.75rem;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-primary);
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
`;

const LockIcon = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--text-tertiary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
`;

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  achievements,
  onBadgeClick,
  onViewAll,
  maxDisplay = 6,
}) => {
  const { variants } = useAnimationEngine();
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressPercentage = (achievement: Achievement): number => {
    if (!achievement.progress) return 0;
    return Math.min(100, (achievement.progress.current / achievement.progress.target) * 100);
  };

  const displayedAchievements = maxDisplay && maxDisplay > 0 ? achievements.slice(0, maxDisplay) : achievements;
  const hasMore = maxDisplay && maxDisplay > 0 && achievements.length > maxDisplay;

  const handleBadgeClick = (achievement: Achievement) => {
    if (onBadgeClick) {
      onBadgeClick(achievement);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('查看所有成就');
    }
  };

  return (
    <Container>
      <SectionTitle>成就徽章</SectionTitle>

      <BadgesGrid>
        {displayedAchievements.map((achievement) => (
          <BadgeCard
            key={achievement.id}
            unlocked={achievement.unlocked}
            clickable={!!onBadgeClick}
            onClick={() => handleBadgeClick(achievement)}
            title={achievement.description}
          >
            <BadgeIcon unlocked={achievement.unlocked}>
              {achievement.icon}
              {!achievement.unlocked && (
                <LockIcon>
                  <FiLock size={8} />
                </LockIcon>
              )}
            </BadgeIcon>

            <BadgeName>{achievement.name}</BadgeName>

            {achievement.unlocked ? (
              achievement.unlockedAt && <UnlockedDate>{formatDate(achievement.unlockedAt)}</UnlockedDate>
            ) : (
              <>
                {achievement.progress && (
                  <BadgeProgress unlocked={achievement.unlocked}>
                    {achievement.progress.current}/{achievement.progress.target}
                    <ProgressBar>
                      <ProgressFill percentage={getProgressPercentage(achievement)} />
                    </ProgressBar>
                  </BadgeProgress>
                )}
              </>
            )}
          </BadgeCard>
        ))}
      </BadgesGrid>

      {hasMore && <ViewAllButton onClick={handleViewAll}>查看所有成就 ({achievements.length})</ViewAllButton>}
    </Container>
  );
};
