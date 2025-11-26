import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import YearTimeline from './year-virtual-timeline';
import type { TimelineItem } from '@/utils/helpers/timeline';
import { TimelineSkeleton } from '@/components/common';

// 年份数据结构
interface YearData {
  year: number;
  count: number;
}

// 年份内容数据
interface YearContent<T> {
  year: number;
  items: T[];
  totalCount: number;
  loaded: boolean;
}

// Props
interface MultiYearTimelineProps<T extends TimelineItem> {
  years: YearData[]; // 所有年份列表
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadYearItems: (year: number, page: number) => Promise<{ items: T[]; total: number }>;
  initialYearsToLoad?: number; // 初始加载几个年份，默认2
  pageSize?: number; // 每页数量，默认10
  loading?: boolean;
  emptyState?: React.ReactNode;
  maxHeight?: number; // 容器最大高度，默认600px（文章卡片），手记建议300px
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0; /* 防止内容超出容器 */
`;

const LoadMoreYearsButton = styled.button`
  padding: 1rem 2rem;
  margin: 2rem auto;
  display: block;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.1) 0%, rgba(var(--accent-rgb), 0.05) 100%);
  color: var(--accent-color);
  border: 1px solid rgba(var(--accent-rgb), 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, rgba(var(--accent-rgb), 0.08) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-tertiary);
  grid-column: 1 / -1;

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  p {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

function MultiYearTimeline<T extends TimelineItem>({
  years,
  renderItem,
  onLoadYearItems,
  initialYearsToLoad = 2,
  pageSize = 10,
  loading = false,
  emptyState,
  maxHeight,
}: MultiYearTimelineProps<T>) {
  const [loadedYears, setLoadedYears] = useState<YearContent<T>[]>([]);
  const [displayedYearsCount, setDisplayedYearsCount] = useState(initialYearsToLoad);
  const [isLoadingYear, setIsLoadingYear] = useState(false);

  // 初始加载前N个年份的数据
  useEffect(() => {
    if (years.length === 0) return;

    const loadInitialYears = async () => {
      const yearsToLoad = years.slice(0, initialYearsToLoad);
      const promises = yearsToLoad.map(async (yearData) => {
        const { items, total } = await onLoadYearItems(yearData.year, 1);
        return {
          year: yearData.year,
          items,
          totalCount: total,
          loaded: true,
        };
      });

      const loadedData = await Promise.all(promises);
      setLoadedYears(loadedData);
    };

    loadInitialYears();
  }, [years, initialYearsToLoad, onLoadYearItems]);

  // 加载更多年份
  const loadMoreYears = useCallback(async () => {
    if (isLoadingYear) return;

    setIsLoadingYear(true);
    try {
      const nextYears = years.slice(displayedYearsCount, displayedYearsCount + 4);
      if (nextYears.length === 0) return;

      const promises = nextYears.map(async (yearData) => {
        const { items, total } = await onLoadYearItems(yearData.year, 1);
        return {
          year: yearData.year,
          items,
          totalCount: total, // 使用实际筛选后的total，而不是yearData.count
          loaded: true,
        };
      });

      const newLoadedData = await Promise.all(promises);
      setLoadedYears((prev) => [...prev, ...newLoadedData]);
      setDisplayedYearsCount((prev) => prev + 4);
    } catch (error) {
      console.error('加载更多年份失败:', error);
    } finally {
      setIsLoadingYear(false);
    }
  }, [years, displayedYearsCount, isLoadingYear, onLoadYearItems]);

  // 单个年份加载更多数据
  const handleLoadMoreInYear = useCallback(
    async (year: number, page: number): Promise<T[]> => {
      const { items } = await onLoadYearItems(year, page);
      return items;
    },
    [onLoadYearItems],
  );

  // 瀑布流分配算法：根据内容数量动态分配到两列，保持平衡
  const { leftColumnYears, rightColumnYears } = useMemo(() => {
    const left: YearContent<T>[] = [];
    const right: YearContent<T>[] = [];
    let leftCount = 0;
    let rightCount = 0;

    // 根据每个年份的内容数量来决定分配到哪一列
    loadedYears.forEach((yearContent) => {
      // 选择当前内容数量较少的列
      if (leftCount <= rightCount) {
        left.push(yearContent);
        leftCount += yearContent.items.length;
      } else {
        right.push(yearContent);
        rightCount += yearContent.items.length;
      }
    });

    return { leftColumnYears: left, rightColumnYears: right };
  }, [loadedYears]);

  const hasMoreYears = displayedYearsCount < years.length;

  // 条件渲染必须在所有 hooks 之后
  if (loading && loadedYears.length === 0) {
    // 根据 maxHeight 判断是文章列表还是手记列表
    const isNoteStyle = Boolean(maxHeight && maxHeight < 400);
    return <TimelineSkeleton yearCount={4} itemsPerYear={5} noteStyle={isNoteStyle} />;
  }

  if (years.length === 0 && emptyState) {
    return <EmptyState>{emptyState}</EmptyState>;
  }

  return (
    <>
      <Container>
        {/* 左列 */}
        <Column>
          {leftColumnYears.map((yearContent) => (
            <YearTimeline
              key={yearContent.year}
              year={yearContent.year}
              initialItems={yearContent.items}
              totalCount={yearContent.totalCount}
              renderItem={renderItem}
              onLoadMore={handleLoadMoreInYear}
              pageSize={pageSize}
              maxHeight={maxHeight}
            />
          ))}
        </Column>

        {/* 右列 */}
        <Column>
          {rightColumnYears.map((yearContent) => (
            <YearTimeline
              key={yearContent.year}
              year={yearContent.year}
              initialItems={yearContent.items}
              totalCount={yearContent.totalCount}
              renderItem={renderItem}
              onLoadMore={handleLoadMoreInYear}
              pageSize={pageSize}
              maxHeight={maxHeight}
            />
          ))}
        </Column>
      </Container>

      {/* 加载更多年份按钮 */}
      {hasMoreYears && (
        <LoadMoreYearsButton onClick={loadMoreYears} disabled={isLoadingYear}>
          {isLoadingYear ? '加载中...' : `加载更多年份 (剩余 ${years.length - displayedYearsCount} 个)`}
        </LoadMoreYearsButton>
      )}
    </>
  );
}

export default MultiYearTimeline;
