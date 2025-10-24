import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils';
import { useAnimationEngine } from '@/utils/animation-engine';
import { UserActivity } from '@/utils/api';

// Styled Components
const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1.25rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    border-radius: 3px;
  }
`;

const ActivityScrollContainer = styled.div`
  position: relative;
  max-height: 400px;
  overflow: hidden;
`;

const FadeMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 30px;
  pointer-events: none;
  z-index: 1;

  &.top {
    top: 0;
    background: linear-gradient(to bottom, var(--bg-primary), transparent);
  }

  &.bottom {
    bottom: 0;
    background: linear-gradient(to top, var(--bg-primary), transparent);
  }
`;

const ActivityGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 0;
  margin: -20px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }
`;

const ActivityLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ActivityItem = styled(motion.div)`
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 0 0.875rem 1.2rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  transition: all 0.2s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &:hover {
    background: rgba(var(--accent-rgb), 0.05);
    transform: translateX(2px);

    &::before {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  }

  &:last-child {
    border-bottom: none;
  }

  [data-theme='dark'] & {
    border-bottom-color: rgba(75, 85, 99, 0.3);
  }
`;

const ActivityIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 1.2rem;
`;

const ActivityTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0 0 0.3rem 0;
  transition: color 0.2s ease;

  ${ActivityLink}:hover & {
    color: var(--accent-color-hover);
  }
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ActivityAuthor = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;

  &::before {
    content: '·';
    margin-right: 0.5rem;
  }
`;

// 格式化活动文本
const formatActivityText = (activity: UserActivity) => {
  const username = activity.user?.username;
  const metadata = activity.metadata || {};

  switch (activity.type) {
    case 'post_created':
      return {
        primary: `${username}发布了文章`,
        secondary: metadata.postTitle || '无标题',
        emoji: '📝',
        color: 'var(--accent-color)',
      };
    case 'post_updated':
      return {
        primary: `${username}更新了文章`,
        secondary: metadata.postTitle || '无标题',
        emoji: '✏️',
        color: '#10b981',
      };
    case 'note_created':
      return {
        primary: `${username}发布了手记`,
        secondary: activity.title || '...',
        emoji: '📌',
        color: '#f59e0b',
      };
    case 'comment_created': {
      const targetAuthor = metadata.postAuthorUsername ? ` ${metadata.postAuthorUsername}` : '';
      const secondaryTitle = metadata.postTitle ? `《${metadata.postTitle}》` : '';
      return {
        primary: `${username}评论了${targetAuthor}的文章${secondaryTitle}`.trim(),
        secondary: activity.title || '',
        emoji: '💬',
        color: '#8b5cf6',
      };
    }
    case 'achievement_unlocked':
      return {
        primary: `${username}解锁了成就`,
        secondary: metadata.achievementName || activity.description || '',
        emoji: '🏆',
        color: '#f59e0b',
      };
    case 'post_trending':
      return {
        primary: `${username}的文章上热门了`,
        secondary: metadata.postTitle || '',
        emoji: '🔥',
        color: '#ef4444',
      };
    case 'post_featured':
      return {
        primary: `${username}的文章被精选了`,
        secondary: metadata.postTitle || '',
        emoji: '✨',
        color: '#06b6d4',
      };
    default: {
      // 尝试去掉“你的/你”以适配公开展示
      const neutralTitle = (activity.title || '进行了操作').replace(/你的/g, '其').replace(/你/g, '其');
      return {
        primary: neutralTitle,
        secondary: activity.description || '',
        emoji: '📍',
        color: 'var(--text-secondary)',
      };
    }
  }
};

// Props 接口
interface ActivitiesSectionProps {
  activities: UserActivity[];
  loading: boolean;
}

// 主组件
export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ activities, loading }) => {
  // 使用动画引擎 - Spring 系统
  const { variants, springPresets } = useAnimationEngine();
  const navigate = useNavigate();

  // 处理活动点击
  const handleActivityClick = (link: string | null | undefined) => {
    if (link && link !== '#') {
      navigate(link);
    }
  };

  return (
    <ContentSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants.fadeIn}
    >
      <SectionTitle>创作的「实时热搜」</SectionTitle>

      <ActivityScrollContainer>
        <FadeMask className="top" />
        <ActivityGrid
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={variants.listItem}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>加载中...</div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>暂无活动</div>
          ) : (
            activities.map((activity, index) => {
              const formatted = formatActivityText(activity);
              const activityTime = formatDate(activity.timestamp, 'MM-DD HH:mm');

              return (
                <ActivityItem
                  key={activity.id}
                  onClick={() => handleActivityClick(activity.link)}
                  variants={variants.listItem}
                  custom={index}
                  whileHover={{ x: 3, scale: 1.01 }}
                  transition={springPresets.gentle}
                >
                  <ActivityIcon>{formatted.emoji}</ActivityIcon>
                  <ActivityContent>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <ActivityAuthor style={{ color: formatted.color, fontWeight: 500 }}>
                        {formatted.primary}
                      </ActivityAuthor>
                    </div>
                    {formatted.secondary && (
                      <ActivityTitle
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 400,
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {formatted.secondary}
                      </ActivityTitle>
                    )}
                    <ActivityMeta style={{ marginTop: '0.5rem' }}>
                      <ActivityTime>{activityTime}</ActivityTime>
                    </ActivityMeta>
                  </ActivityContent>
                </ActivityItem>
              );
            })
          )}
        </ActivityGrid>
        <FadeMask className="bottom" />
      </ActivityScrollContainer>
    </ContentSection>
  );
};

export default ActivitiesSection;
