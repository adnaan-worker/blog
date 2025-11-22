import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginatedApiResponse } from '@/types';

// 通用分页Hook
export interface UsePaginationOptions<T, P = any> {
  fetchFunction: (params: P) => Promise<PaginatedApiResponse<T>>;
  initialParams?: P;
  limit?: number;
}

export const usePagination = <T, P = any>({
  fetchFunction,
  initialParams = {} as P,
  limit = 10,
}: UsePaginationOptions<T, P>) => {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<P>(initialParams);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    try {
      setIsLoading(true);
      setError(null);

      const requestParams = {
        ...params,
        page: page + 1,
        limit,
      } as P;

      const response = await fetchFunction(requestParams);
      const newItems = response.data || [];
      const pagination = response.meta?.pagination || { totalPages: 1, total: 0 };

      setItems((prev) => [...prev, ...newItems]);
      setHasMore(page + 1 < pagination.totalPages);
      setPage(page + 1);
      setTotalItems(pagination.total);
    } catch (err: any) {
      console.error('加载更多数据失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, error, params, limit, fetchFunction]);

  // 重新加载数据（搜索/筛选时使用）
  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const requestParams = {
        ...params,
        page: 1,
        limit,
      } as P;

      const response = await fetchFunction(requestParams);
      const newItems = response.data || [];
      const pagination = response.meta?.pagination || { totalPages: 1, total: 0 };

      setItems(newItems);
      setHasMore(1 < pagination.totalPages);
      setTotalItems(pagination.total);
    } catch (err: any) {
      console.error('加载数据失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [params, limit, fetchFunction]);

  // 更新参数（搜索/筛选）
  const updateParams = useCallback((newParams: Partial<P>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // 重置参数
  const resetParams = useCallback(() => {
    setParams(initialParams);
  }, [initialParams]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    totalItems,
    loadMore,
    reload,
    updateParams,
    resetParams,
  };
};

// 通用搜索Hook
export const useSearch = (onSearch: (query: string) => void, delay = 300) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, delay]);

  return {
    searchQuery,
    setSearchQuery,
  };
};

// 通用筛选Hook
export const useFilter = (onFilterChange: (filter: string) => void) => {
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleFilterChange = useCallback(
    (filter: string) => {
      const newFilter = selectedFilter === filter ? '' : filter;
      setSelectedFilter(newFilter);
      onFilterChange(newFilter);
    },
    [selectedFilter, onFilterChange],
  );

  return {
    selectedFilter,
    handleFilterChange,
  };
};

// 通用管理页面Hook - 整合分页、搜索、筛选
export interface UseManagementPageOptions<
  T,
  P extends { page?: number; limit?: number; keyword?: string; status?: number | string; [key: string]: any } = any,
> {
  fetchFunction: (params: P) => Promise<PaginatedApiResponse<T>>;
  initialParams?: P;
  limit?: number;
  debounceTime?: number;
}

export const useManagementPage = <
  T,
  P extends { page?: number; limit?: number; keyword?: string; status?: number | string; [key: string]: any } = any,
>({
  fetchFunction,
  initialParams = {} as P,
  limit = 10,
  debounceTime = 300,
}: UseManagementPageOptions<T, P>) => {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 初始设置为 false，避免不必要的加载指示器
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialParams.keyword || '');

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState(String(initialParams.status || ''));

  // Use refs to store latest values and avoid dependency issues
  const isLoadingRef = useRef(false); // 初始设置为 false，与 isLoading 保持一致
  const isMountedRef = useRef(true); // 添加挂载标志
  const isFirstLoadRef = useRef(true); // 首次加载标志
  const fetchFunctionRef = useRef(fetchFunction);
  const initialParamsRef = useRef(initialParams);
  const limitRef = useRef(limit);

  // Update refs when values change
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    initialParamsRef.current = initialParams;
  }, [initialParams]);

  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  // 清理函数：组件卸载时设置标志
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchItems = useCallback(
    async (currentPage: number, append: boolean, currentSearchQuery: string, currentSelectedFilter: string) => {
      // Prevent multiple loads when appending
      if (isLoadingRef.current && append) return;

      isLoadingRef.current = true;
      
      // 批量更新状态，减少重渲染
      if (!append) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const params: P = {
          ...initialParamsRef.current,
          page: currentPage,
          limit: limitRef.current,
          keyword: currentSearchQuery || undefined,
          status: currentSelectedFilter !== '' ? currentSelectedFilter : undefined,
        } as P;

        const response = await fetchFunctionRef.current(params);
        
        // 只在组件仍然挂载时更新状态
        if (!isMountedRef.current) return;
        
        const newItems = response.data || [];
        const pagination = response.meta?.pagination || { totalPages: 1, total: 0 };

        // 批量更新所有状态
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(currentPage < pagination.totalPages);
        setPage(currentPage);
        setTotalItems(pagination.total);
      } catch (err: any) {
        console.error('Failed to fetch items:', err);
        
        // 只在组件仍然挂载时更新状态
        if (!isMountedRef.current) return;
        
        setError(new Error(err.message || '加载失败，请重试'));
        if (!append) setItems([]); // Clear items on initial load error
      } finally {
        isLoadingRef.current = false;
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [], // No dependencies - use refs instead
  );

  // Initial load and reload on search/filter change
  useEffect(() => {
    // 首次加载立即执行，不使用防抖
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      fetchItems(1, false, searchQuery, selectedFilter);
      return;
    }

    // 后续搜索/筛选使用防抖
    const handler = setTimeout(() => {
      fetchItems(1, false, searchQuery, selectedFilter);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedFilter, debounceTime, fetchItems]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingRef.current) {
      fetchItems(page + 1, true, searchQuery, selectedFilter);
    }
  }, [hasMore, page, searchQuery, selectedFilter, fetchItems]);

  const reload = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchItems(1, false, searchQuery, selectedFilter);
  }, [fetchItems, searchQuery, selectedFilter]);

  const handleFilterChange = useCallback((key: string) => {
    setSelectedFilter(key);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    error,
    totalItems,
    loadMore,
    reload,
    search: {
      searchQuery,
      setSearchQuery,
    },
    filter: {
      selectedFilter,
      handleFilterChange,
    },
  };
};
