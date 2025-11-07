import { useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // 距离底部多少像素时触发加载，默认200px
}

export const useInfiniteScroll = ({ hasMore, isLoading, onLoadMore, threshold = 200 }: UseInfiniteScrollOptions) => {
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // 当滚动到距离底部threshold像素时开始加载
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
};

export default useInfiniteScroll;
