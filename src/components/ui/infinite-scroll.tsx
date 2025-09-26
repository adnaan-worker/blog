import React, { useEffect, useRef, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { FiLoader, FiAlertCircle, FiChevronUp } from 'react-icons/fi';

// 样式组件
const ScrollContainer = styled.div<{ maxHeight?: string }>`
  position: relative;
  overflow-y: auto;
  ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--text-tertiary);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  gap: 0.5rem;

  .spinner {
    animation: spin 1s linear infinite;
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

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 2rem;
  color: var(--error-color);
  text-align: center;
  gap: 1rem;

  .error-text {
    font-size: 0.9rem;
  }

  .retry-button {
    padding: 0.5rem 1rem;
    background: var(--error-color);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.2s ease;

    &:hover {
      background: #d32f2f;
    }
  }
`;

const EndMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
`;

const ScrollToTopButton = styled.button<{ visible: boolean }>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;

  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transform: ${({ visible }) => (visible ? 'translateY(0)' : 'translateY(20px)')};
  pointer-events: ${({ visible }) => (visible ? 'auto' : 'none')};

  &:hover {
    background: var(--accent-color-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  text-align: center;
  gap: 1rem;

  .empty-icon {
    font-size: 3rem;
    color: var(--text-tertiary);
  }

  .empty-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .empty-description {
    font-size: 0.9rem;
    max-width: 300px;
    line-height: 1.5;
  }
`;

// 加载骨架屏组件
const SkeletonItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);

  .skeleton-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .skeleton-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  .skeleton-info {
    flex: 1;
  }

  .skeleton-line {
    height: 0.75rem;
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 0.5rem;

    &.short {
      width: 60%;
    }
    &.medium {
      width: 80%;
    }
    &.long {
      width: 100%;
    }
  }

  .skeleton-content {
    .skeleton-line {
      height: 0.875rem;
      margin-bottom: 0.75rem;
    }
  }

  @keyframes skeleton-loading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// 组件接口
export interface InfiniteScrollProps<T = any> {
  children: React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  error?: Error | null;
  onLoadMore: () => void;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  threshold?: number; // 触发加载的距离阈值
  maxHeight?: string;
  showScrollToTop?: boolean;
  scrollTopThreshold?: number;
  className?: string;
  itemCount?: number; // 当前已加载的项目数量
  skeletonCount?: number; // 骨架屏显示数量
  enableSkeleton?: boolean; // 是否启用骨架屏
}

// 默认组件
const DefaultLoadingComponent = () => (
  <LoadingIndicator>
    <FiLoader className="spinner" size={16} />
    <span>加载中...</span>
  </LoadingIndicator>
);

const DefaultErrorComponent: React.FC<{ onRetry?: () => void; error?: Error }> = ({ onRetry, error }) => (
  <ErrorMessage>
    <FiAlertCircle size={24} />
    <div className="error-text">{error?.message || '加载失败，请重试'}</div>
    {onRetry && (
      <button className="retry-button" onClick={onRetry}>
        重试
      </button>
    )}
  </ErrorMessage>
);

const DefaultEndMessage = () => <EndMessage>— 没有更多内容了 —</EndMessage>;

const DefaultEmptyComponent = () => (
  <EmptyState>
    <div className="empty-icon">📝</div>
    <div className="empty-title">暂无内容</div>
    <div className="empty-description">这里还没有任何内容，快来创建第一条记录吧！</div>
  </EmptyState>
);

const DefaultSkeletonComponent: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonItem key={index}>
        <div className="skeleton-header">
          <div className="skeleton-avatar" />
          <div className="skeleton-info">
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
          </div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
      </SkeletonItem>
    ))}
  </>
);

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  loading,
  error,
  onLoadMore,
  onRetry,
  loadingComponent,
  errorComponent,
  endMessage,
  emptyComponent,
  threshold = 100,
  maxHeight,
  showScrollToTop = true,
  scrollTopThreshold = 400,
  className,
  itemCount = 0,
  skeletonCount = 3,
  enableSkeleton = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  // 检查是否需要显示"回到顶部"按钮
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop } = containerRef.current;
    setShowScrollTop(scrollTop > scrollTopThreshold);
  }, [scrollTopThreshold]);

  // 使用 Intersection Observer 检测是否需要加载更多
  useEffect(() => {
    if (!loadingRef.current || loading || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: containerRef.current,
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      },
    );

    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore, error, onLoadMore, threshold]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 检测是否是初始加载
  useEffect(() => {
    if (itemCount > 0) {
      setIsInitialLoad(false);
    }
  }, [itemCount]);

  // 渲染内容
  const renderContent = () => {
    // 空状态
    if (!loading && !error && itemCount === 0 && !isInitialLoad) {
      return emptyComponent || <DefaultEmptyComponent />;
    }

    return (
      <>
        {children}

        {/* 加载指示器 */}
        {loading && (
          <div ref={loadingRef}>
            {isInitialLoad && enableSkeleton ? (
              <DefaultSkeletonComponent count={skeletonCount} />
            ) : (
              loadingComponent || <DefaultLoadingComponent />
            )}
          </div>
        )}

        {/* 错误状态 */}
        {error &&
          !loading &&
          (errorComponent || <DefaultErrorComponent error={error} onRetry={onRetry || onLoadMore} />)}

        {/* 结束消息 */}
        {!hasMore && !loading && !error && itemCount > 0 && (endMessage || <DefaultEndMessage />)}

        {/* 哨兵元素 - 用于触发加载 */}
        {hasMore && !loading && !error && <div ref={loadingRef} style={{ height: '1px' }} />}
      </>
    );
  };

  return (
    <>
      <ScrollContainer ref={containerRef} maxHeight={maxHeight} className={className}>
        {renderContent()}
      </ScrollContainer>

      {/* 回到顶部按钮 */}
      {showScrollToTop && (
        <ScrollToTopButton visible={showScrollTop} onClick={scrollToTop} title="回到顶部" aria-label="回到顶部">
          <FiChevronUp size={20} />
        </ScrollToTopButton>
      )}
    </>
  );
};

export default InfiniteScroll;
