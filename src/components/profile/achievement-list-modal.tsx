import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiCheck, FiLock } from 'react-icons/fi';
import type { Achievement } from './types';

interface AchievementListModalProps {
  achievements: Achievement[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.75rem;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.8) 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const AchievementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }
`;

const AchievementItem = styled(motion.div)<{ unlocked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: ${(props) => (props.unlocked ? 'rgba(var(--accent-rgb), 0.08)' : 'var(--bg-secondary)')};
  border: 1px solid ${(props) => (props.unlocked ? 'rgba(var(--accent-rgb), 0.3)' : 'var(--border-color)')};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.unlocked ? 'rgba(var(--accent-rgb), 0.12)' : 'var(--bg-tertiary)')};
    border-color: ${(props) => (props.unlocked ? 'rgba(var(--accent-rgb), 0.5)' : 'var(--accent-color-alpha)')};
    transform: translateX(2px);
  }
`;

const StatusIcon = styled.div<{ unlocked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => (props.unlocked ? 'var(--accent-color)' : 'var(--bg-tertiary)')};
  color: ${(props) => (props.unlocked ? 'white' : 'var(--text-tertiary)')};
  flex-shrink: 0;
  font-size: 0.875rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const AchievementContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AchievementName = styled.div<{ unlocked: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${(props) => (props.unlocked ? 'var(--accent-color)' : 'var(--text-primary)')};
  margin-bottom: 0.25rem;
`;

const AchievementDescription = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const AchievementProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
`;

const ProgressTextSmall = styled.span`
  font-weight: 500;
`;

const ItemProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
`;

const ItemProgressFill = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background: var(--accent-color);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

export const AchievementListModal: React.FC<AchievementListModalProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const getProgressPercentage = (achievement: Achievement): number => {
    if (!achievement.progress) return 0;
    return Math.min(100, (achievement.progress.current / achievement.progress.target) * 100);
  };

  return (
    <Container>
      <ProgressHeader>
        <ProgressText>
          已解锁 {unlockedCount}/{totalCount} 个成就 ({progress}%)
        </ProgressText>
      </ProgressHeader>
      <ProgressBar>
        <ProgressFill percentage={progress} />
      </ProgressBar>

      <AchievementList>
        {achievements.map((achievement, index) => {
          const progressPercentage = getProgressPercentage(achievement);
          return (
            <AchievementItem
              key={achievement.id}
              unlocked={achievement.unlocked}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <StatusIcon unlocked={achievement.unlocked}>{achievement.unlocked ? <FiCheck /> : <FiLock />}</StatusIcon>
              <AchievementContent>
                <AchievementName unlocked={achievement.unlocked}>{achievement.name}</AchievementName>
                <AchievementDescription>{achievement.description}</AchievementDescription>
                {!achievement.unlocked && achievement.progress && (
                  <AchievementProgress>
                    <ProgressTextSmall>
                      {achievement.progress.current}/{achievement.progress.target}
                    </ProgressTextSmall>
                    <ItemProgressBar>
                      <ItemProgressFill percentage={progressPercentage} />
                    </ItemProgressBar>
                  </AchievementProgress>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <AchievementProgress>
                    <ProgressTextSmall style={{ color: 'var(--accent-color)' }}>
                      解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                    </ProgressTextSmall>
                  </AchievementProgress>
                )}
              </AchievementContent>
            </AchievementItem>
          );
        })}
      </AchievementList>
    </Container>
  );
};
