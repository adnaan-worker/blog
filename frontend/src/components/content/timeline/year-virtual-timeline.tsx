import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import type { TimelineItem } from '@/utils/helpers/timeline';
import { FadeScrollContainer } from '@/components/common';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

// 年份容器Props
interface YearTimelineProps<T extends TimelineItem> {
  year: number;
  initialItems: T[];
  totalCount: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: (year: number, page: number) => Promise<T[]>;
  pageSize?: number;
  maxHeight?: number; // 容器最大高度，默认600px
}

// 样式组件
const YearContainer = styled(motion.div)`
  margin-bottom: 2rem;
`;

const YearHeader = styled.div`
  position: relative;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;

  h3 {
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .count {
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

const ScrollableContent = styled.div<{ maxHeight?: number }>`
  max-height: ${(props) => props.maxHeight || 600}px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0.5rem;

  /* 隐藏滚动条（保留滚动） */
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none; /* Chrome/Safari */
  }

  @media (max-width: 768px) {
    padding-right: 0.25rem;
  }
`;

const TimelineList = styled.div`
  position: relative;
  padding-left: 2rem;

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
    left: -2.25rem;
    top: 0.3rem;
    width: 10px;
    height: 10px;
    background: var(--accent-color);
    border-radius: 50%;
    border: 2px solid var(--bg-primary);
    z-index: 2;
  }
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.8rem;

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(var(--accent-rgb), 0.2);
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
  padding: 1rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  opacity: 0.6;
`;

// 单个年份时间线组件
function YearTimeline<T extends TimelineItem>({
  year,
  initialItems,
  totalCount,
  renderItem,
  onLoadMore,
  pageSize = 10,
  maxHeight,
}: YearTimelineProps<T>) {
  const { springPresets } = useAnimationEngine();
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < totalCount);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 当初始数据或总数变化时，更新状态
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length < totalCount);
  }, [initialItems, totalCount, year]);

  // 使用虚拟滚动 Hook
  const {
    visibleItems,
    visibleRange,
    topSpacer,
    bottomSpacer,
    handleScroll: handleVirtualScroll,
    recordItemHeight,
  } = useVirtualScroll({
    items,
    threshold: pageSize,
    estimatedHeight: 200,
    overscan: 5,
  });

  // 监听滚动加载更多
  const handleScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollEl;

    // 虚拟滚动计算
    handleVirtualScroll(scrollTop, clientHeight);

    // 距离底部200px时触发加载
    if (!isLoadingMore && hasMore && scrollTop + clientHeight >= scrollHeight - 200) {
      setIsLoadingMore(true);

      const loadMore = async () => {
        try {
          const nextPage = page + 1;
          const newItems = await onLoadMore(year, nextPage);

          if (newItems.length > 0) {
            setItems((prev) => {
              // 去重
              const existingIds = new Set(prev.map((item) => item.id));
              const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
              const updatedItems = [...prev, ...uniqueNewItems];

              // 更新 hasMore
              setHasMore(updatedItems.length < totalCount);

              return updatedItems;
            });
            setPage(nextPage);
          } else {
            setHasMore(false);
          }
        } catch (error) {
          console.error(`加载${year}年数据失败:`, error);
        } finally {
          setIsLoadingMore(false);
        }
      };

      loadMore();
    }
  }, [year, page, totalCount, isLoadingMore, hasMore, onLoadMore, handleVirtualScroll]);

  return (
    <YearContainer initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}>
      <YearHeader>
        <h3>{year}</h3>
        <span className="count">{totalCount} 篇</span>
      </YearHeader>

      <FadeScrollContainer dependencies={[items.length, isLoadingMore, hasMore]}>
        <ScrollableContent ref={scrollRef} onScroll={handleScroll} maxHeight={maxHeight}>
          <TimelineList>
            {/* 顶部占位 */}
            {topSpacer > 0 && <div style={{ height: topSpacer }} />}

            {/* 渲染可见项 */}
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.start + index;
              return (
                <TimelineItemWrapper
                  key={item.id}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={springPresets.snappy}
                  ref={(el) => {
                    if (el) {
                      recordItemHeight(item.id, el.offsetHeight);
                    }
                  }}
                >
                  {renderItem(item, actualIndex)}
                </TimelineItemWrapper>
              );
            })}

            {/* 底部占位 */}
            {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}
          </TimelineList>

          {isLoadingMore && (
            <LoadingMore>
              <div className="spinner"></div>
              <span>加载更多...</span>
            </LoadingMore>
          )}

          {!hasMore && items.length > 5 && <NoMoreData>已加载全部{year}年的内容</NoMoreData>}
        </ScrollableContent>
      </FadeScrollContainer>
    </YearContainer>
  );
}

export default YearTimeline;
