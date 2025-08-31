import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { Button } from '@/components/ui';
import type { Activity } from './types';

interface ActivityFeedProps {
  activities: Activity[];
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onActivityClick?: (activity: Activity) => void;
  hasMore?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

// 卡片基础样式
const Card = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled.button<{ isRefreshing?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.3s ease;
    ${(props) => props.isRefreshing && 'animation: spin 1s linear infinite;'}
  }

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;

    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const ActivityItem = styled.div<{ clickable?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  &:hover {
    ${(props) =>
      props.clickable &&
      `
      background: var(--bg-secondary);
      border-color: var(--accent-color);
      transform: translateX(4px);
    `}
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-color-alpha);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  flex-shrink: 0;
  font-size: 1rem;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.4;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActivityDescription = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.5rem;

  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoadMoreButton = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

const LoadingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
`;

const LoadingSkeleton = styled.div<{ width?: string; height?: string }>`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.25rem;
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '1rem'};

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);

  svg {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onLoadMore,
  onRefresh,
  onActivityClick,
  hasMore = false,
  isLoading = false,
  isRefreshing = false,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // 格式化时间
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN');
  };

  // 监听滚动事件，实现无限滚动
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      const isNear = scrollTop + clientHeight >= scrollHeight - 100;
      setIsNearBottom(isNear);

      if (isNear && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    };

    listElement.addEventListener('scroll', handleScroll);
    return () => listElement.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore]);

  const handleActivityClick = (activity: Activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else if (activity.link) {
      window.open(activity.link, '_blank');
    }
  };

  const renderLoadingItems = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <LoadingItem key={index}>
        <LoadingSkeleton width="40px" height="40px" style={{ borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <LoadingSkeleton width="80%" height="0.875rem" style={{ marginBottom: '0.5rem' }} />
          <LoadingSkeleton width="60%" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <LoadingSkeleton width="40%" height="0.75rem" />
        </div>
      </LoadingItem>
    ));

  return (
    <Card>
      <SectionHeader>
        <SectionTitle>📈 最近活动</SectionTitle>
        {onRefresh && (
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} disabled={isRefreshing}>
            <FiRefreshCw size={14} />
            刷新
          </RefreshButton>
        )}
      </SectionHeader>

      <ActivityList ref={listRef}>
        {activities.length === 0 && !isLoading ? (
          <EmptyState>
            <div>📭</div>
            <div>暂无活动记录</div>
          </EmptyState>
        ) : (
          <>
            {activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                clickable={!!(onActivityClick || activity.link)}
                onClick={() => handleActivityClick(activity)}
              >
                <ActivityIcon>{activity.icon}</ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  {activity.description && <ActivityDescription>{activity.description}</ActivityDescription>}
                  <ActivityTime>
                    <span>{formatTime(activity.timestamp)}</span>
                    {activity.link && <FiExternalLink size={12} />}
                  </ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}

            {isLoading && renderLoadingItems()}
          </>
        )}
      </ActivityList>

      {hasMore && !isLoading && (
        <LoadMoreButton>
          <Button variant="outline" size="small" onClick={onLoadMore}>
            加载更多
          </Button>
        </LoadMoreButton>
      )}
    </Card>
  );
};
