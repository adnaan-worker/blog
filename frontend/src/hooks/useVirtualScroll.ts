/**
 * 智能虚拟滚动 Hook
 *
 * 使用方式：
 * const { visibleItems, topSpacer, bottomSpacer, handleScroll } = useVirtualScroll({
 *   items,
 *   threshold: 10,
 *   estimatedHeight: 200,
 * });
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

export interface UseVirtualScrollOptions<T> {
  items: T[];
  threshold?: number; // 启用虚拟滚动的阈值
  estimatedHeight?: number; // 估算的项目高度
  overscan?: number; // 预渲染数量
  getItemKey?: (item: T) => string | number; // 获取项目唯一键
}

export interface UseVirtualScrollReturn<T> {
  visibleItems: T[];
  visibleRange: { start: number; end: number };
  topSpacer: number;
  bottomSpacer: number;
  handleScroll: (scrollTop: number, clientHeight: number) => void;
  recordItemHeight: (key: string | number, height: number) => void;
  isVirtualEnabled: boolean;
}

export function useVirtualScroll<T>({
  items,
  threshold = 10,
  estimatedHeight = 200,
  overscan = 10, // 增加默认缓冲区，防止滚动过快出现空白
  getItemKey,
}: UseVirtualScrollOptions<T>): UseVirtualScrollReturn<T> {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(items.length, 20) });
  const itemHeightsRef = useRef<Map<string | number, number>>(new Map());
  const rafRef = useRef<number | null>(null);

  // 是否启用虚拟滚动
  const isVirtualEnabled = items.length > threshold;

  // 当 items 变化时，更新可见范围
  useEffect(() => {
    if (items.length > 0 && visibleRange.end === 0) {
      setVisibleRange({ start: 0, end: Math.min(items.length, 20) });
    }
  }, [items.length, visibleRange.end]);

  // 计算平均高度
  const avgHeight = useMemo(() => {
    if (itemHeightsRef.current.size === 0) return estimatedHeight;
    const heights = Array.from(itemHeightsRef.current.values());
    const total = heights.reduce((a, b) => a + b, 0);
    return total / heights.length || estimatedHeight;
  }, [estimatedHeight]);

  // 滚动处理
  const handleScroll = useCallback(
    (scrollTop: number, clientHeight: number) => {
      if (!isVirtualEnabled) {
        setVisibleRange({ start: 0, end: items.length });
        return;
      }

      // 使用 requestAnimationFrame 优化性能
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        // 计算可见范围
        const visibleStart = Math.floor(scrollTop / avgHeight);
        const visibleEnd = Math.ceil((scrollTop + clientHeight) / avgHeight);

        // 加上 overscan
        const start = Math.max(0, visibleStart - overscan);
        const end = Math.min(items.length, visibleEnd + overscan);

        // 只有范围真正变化时才更新状态
        setVisibleRange((prev) => {
          if (prev.start !== start || prev.end !== end) {
            return { start, end };
          }
          return prev;
        });
      });
    },
    [isVirtualEnabled, avgHeight, overscan, items.length],
  );

  // 组件卸载时清理 rAF
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 记录项目高度
  const recordItemHeight = useCallback((key: string | number, height: number) => {
    if (height > 0) {
      itemHeightsRef.current.set(key, height);
    }
  }, []);

  // 可见项目
  const visibleItems = isVirtualEnabled ? items.slice(visibleRange.start, visibleRange.end) : items;

  // 占位高度
  const topSpacer = isVirtualEnabled ? visibleRange.start * avgHeight : 0;
  const bottomSpacer = isVirtualEnabled ? (items.length - visibleRange.end) * avgHeight : 0;

  return {
    visibleItems,
    visibleRange,
    topSpacer,
    bottomSpacer,
    handleScroll,
    recordItemHeight,
    isVirtualEnabled,
  };
}
