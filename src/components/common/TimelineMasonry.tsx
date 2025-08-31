import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// 通用时间线项目接口
export interface TimelineItem {
  id: string;
  createdAt: string;
  [key: string]: any; // 允许其他自定义字段
}

// 年份分组数据结构
export interface YearGroup<T extends TimelineItem> {
  year: string;
  items: T[];
}

// 组件Props
interface TimelineMasonryProps<T extends TimelineItem> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderYearHeader?: (year: string, count: number) => React.ReactNode;
  className?: string;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyState?: React.ReactNode;
}

// 样式组件
const MasonryContainer = styled.div`
  columns: 2;
  column-gap: 3rem;
  column-fill: balance;

  @media (max-width: 768px) {
    columns: 1;
    column-gap: 0;
  }
`;

const YearTimeline = styled(motion.div)`
  break-inside: avoid;
  margin-bottom: 2rem;
  position: relative;
  background: var(--bg-primary);
`;

const DefaultYearHeader = styled.div`
  position: relative;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .year-badge {
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  .item-count {
    color: var(--text-tertiary);
    font-size: 0.75rem;
    font-weight: 400;
  }

  /* 年份前的竖线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 2px;
    transform: translateY(-50%);
    z-index: 2;
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 1.5rem;

  /* 时间线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--accent-color) 0%, var(--accent-color) 90%, transparent 100%);
  }
`;

const TimelineItemWrapper = styled(motion.div)`
  position: relative;
  margin-bottom: 1rem;

  /* 时间线节点 */
  &::before {
    content: '';
    position: absolute;
    left: -1.9rem;
    top: 0.3rem;
    width: 8px;
    height: 8px;
    background: var(--accent-color);
    border-radius: 50%;
    border: 2px solid var(--bg-primary);
    z-index: 2;
  }
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.8rem;

  .loading-text {
    opacity: 0.8;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(var(--accent-color-rgb), 0.2);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const NoMoreData = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  opacity: 0.6;
`;

// 按年份分组工具函数
export const groupItemsByYear = <T extends TimelineItem>(items: T[]): YearGroup<T>[] => {
  const grouped: Record<string, T[]> = {};

  items.forEach((item) => {
    const year = new Date(item.createdAt).getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(item);
  });

  // 按年份降序排列
  const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => ({
    year,
    items: grouped[year].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  }));
};

// 时间线瀑布流组件
function TimelineMasonry<T extends TimelineItem>({
  items,
  renderItem,
  renderYearHeader,
  className,
  loading = false,
  loadingMore = false,
  hasMore = true,
  onLoadMore,
  emptyState,
}: TimelineMasonryProps<T>) {
  const groupedItems = groupItemsByYear(items);

  // 默认年份头部渲染
  const defaultRenderYearHeader = (year: string, count: number) => (
    <DefaultYearHeader>
      <div className="year-badge">{year}</div>
      <div className="item-count">{count} 篇</div>
    </DefaultYearHeader>
  );

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--text-tertiary)',
          fontSize: '0.875rem',
        }}
      >
        加载中...
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <MasonryContainer className={className}>
        {groupedItems.map((yearGroup, yearIndex) => (
          <YearTimeline
            key={yearGroup.year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: yearIndex * 0.1 }}
          >
            {renderYearHeader
              ? renderYearHeader(yearGroup.year, yearGroup.items.length)
              : defaultRenderYearHeader(yearGroup.year, yearGroup.items.length)}

            <TimelineContainer>
              {yearGroup.items.map((item, itemIndex) => (
                <TimelineItemWrapper
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (yearIndex * 5 + itemIndex) * 0.05 }}
                >
                  {renderItem(item, itemIndex)}
                </TimelineItemWrapper>
              ))}
            </TimelineContainer>
          </YearTimeline>
        ))}
      </MasonryContainer>

      {/* 加载更多状态 */}
      {loadingMore && (
        <LoadingMore>
          <div className="spinner"></div>
          <span className="loading-text">加载更多...</span>
        </LoadingMore>
      )}

      {!hasMore && items.length > 10 && <NoMoreData>已加载全部内容</NoMoreData>}
    </>
  );
}

export default TimelineMasonry;
