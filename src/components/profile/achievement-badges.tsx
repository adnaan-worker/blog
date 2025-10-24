import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiLock, FiInfo } from 'react-icons/fi';
import type { Achievement } from './types';

interface AchievementBadgesProps {
  achievements: Achievement[];
  onBadgeClick?: (achievement: Achievement) => void;
  maxDisplay?: number;
}

// 内容容器（不包含外层卡片样式）
const Container = styled.div`
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '🏆';
    font-size: 1.2rem;
  }
`;

const BadgesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const BadgeCard = styled(motion.div)<{ unlocked: boolean; clickable?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  ${(props) =>
    props.unlocked
      ? `
    background: var(--accent-color-alpha);
    border: 1px solid var(--accent-color);
    color: var(--accent-color);
  `
      : `
    background: var(--bg-primary);
    border: 1px dashed var(--border-color);
    color: var(--text-tertiary);
  `}
`;

const BadgeIcon = styled.div<{ unlocked: boolean }>`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  position: relative;

  ${(props) =>
    !props.unlocked &&
    `
    filter: grayscale(100%);
    opacity: 0.5;
  `}
`;

const BadgeName = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  line-height: 1.2;
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

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ achievements, onBadgeClick, maxDisplay = 6 }) => {
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

  const displayedAchievements = achievements.slice(0, maxDisplay);
  const hasMore = achievements.length > maxDisplay;

  const handleBadgeClick = (achievement: Achievement) => {
    if (onBadgeClick) {
      onBadgeClick(achievement);
    }
  };

  const handleViewAll = () => {
    // 可以触发查看所有成就的模态框或页面
    console.log('查看所有成就');
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
