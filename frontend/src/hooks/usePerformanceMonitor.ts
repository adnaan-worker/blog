import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  // 页面加载性能
  loadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;

  // 运行时性能
  fps: number;
  memoryUsage?: number;

  // 网络性能
  navigationTiming?: PerformanceNavigationTiming;
}

/**
 * 性能监控 Hook
 * 监控页面加载和运行时性能指标
 *
 * @example
 * ```typescript
 * const metrics = usePerformanceMonitor();
 *
 * console.log('FPS:', metrics.fps);
 * console.log('LCP:', metrics.largestContentfulPaint);
 * ```
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ fps: 60 });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // 1. 收集页面加载性能指标
    const collectLoadMetrics = () => {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const loadMetrics: Partial<PerformanceMetrics> = {
        navigationTiming: navigation,
        loadTime: navigation?.loadEventEnd - navigation?.fetchStart,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
      };

      // First Paint & First Contentful Paint
      paint.forEach((entry) => {
        if (entry.name === 'first-paint') {
          loadMetrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          loadMetrics.firstContentfulPaint = entry.startTime;
        }
      });

      setMetrics((prev) => ({ ...prev, ...loadMetrics }));
    };

    // 2. 监听 Largest Contentful Paint
    const observeLCP = () => {
      if (!('PerformanceObserver' in window)) return;

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;

          setMetrics((prev) => ({
            ...prev,
            largestContentfulPaint: lastEntry.startTime,
          }));
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        return () => observer.disconnect();
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    };

    // 3. 监控 FPS - 优化版：降低频率
    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      // 🔥 改为每3秒更新一次，减少状态更新频率
      if (now >= lastTimeRef.current + 3000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));

        // 只在 FPS 变化较大时才更新状态
        setMetrics((prev) => {
          if (Math.abs(prev.fps - fps) > 5) {
            return { ...prev, fps };
          }
          return prev;
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    // 4. 监控内存使用（如果支持）- 优化版
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const newMemoryUsage = memory.usedJSHeapSize / 1048576; // 转换为 MB

        // 🔥 只在内存变化超过10MB时才更新，避免频繁重渲染
        setMetrics((prev) => {
          if (!prev.memoryUsage || Math.abs(prev.memoryUsage - newMemoryUsage) > 10) {
            return { ...prev, memoryUsage: newMemoryUsage };
          }
          return prev;
        });
      }
    };

    // 页面加载完成后收集指标
    if (document.readyState === 'complete') {
      collectLoadMetrics();
    } else {
      window.addEventListener('load', collectLoadMetrics);
    }

    // 启动 LCP 观察
    const lcpCleanup = observeLCP();

    // 🔥 仅在开发环境启动 FPS 监控，生产环境不监控
    if (process.env.NODE_ENV === 'development') {
      rafIdRef.current = requestAnimationFrame(measureFPS);
    }

    // 🔥 改为每30秒测量一次内存，减少频率
    const memoryInterval = setInterval(measureMemory, 30000);
    measureMemory(); // 立即测量一次

    // 清理
    return () => {
      window.removeEventListener('load', collectLoadMetrics);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      clearInterval(memoryInterval);
      lcpCleanup?.();
    };
  }, []);

  return metrics;
};

/**
 * 性能调试 Hook
 * 在开发环境显示性能指标
 */
export const usePerformanceDebug = (enabled = process.env.NODE_ENV === 'development') => {
  const metrics = usePerformanceMonitor();

  useEffect(() => {
    if (!enabled) return;

    // 在控制台显示性能指标
    console.group('📊 Performance Metrics');
    console.log('FPS:', metrics.fps);
    console.log('Load Time:', metrics.loadTime?.toFixed(2), 'ms');
    console.log('FCP:', metrics.firstContentfulPaint?.toFixed(2), 'ms');
    console.log('LCP:', metrics.largestContentfulPaint?.toFixed(2), 'ms');
    if (metrics.memoryUsage) {
      console.log('Memory:', metrics.memoryUsage.toFixed(2), 'MB');
    }
    console.groupEnd();
  }, [metrics, enabled]);

  return metrics;
};

export default usePerformanceMonitor;
