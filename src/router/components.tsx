import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { scrollLock } from '@/utils/core/scroll-lock';

/**
 * 滚动恢复组件
 * 监听路由变化，每次路径变化时自动滚动到页面顶部
 *
 * 设计要点：
 * 1. 使用 location.key 确保每次导航都会触发（包括同一路径的不同导航）
 * 2. 使用 requestAnimationFrame 确保在浏览器重绘前执行，性能更优
 * 3. 检查滚动锁定状态，避免在模态框打开时强制滚动
 * 4. 使用 setTimeout 确保 DOM 更新完成后再滚动
 * 5. 完整清理所有异步操作，防止内存泄漏
 */
export const ScrollToTop = () => {
  const location = useLocation();
  const prevLocationKeyRef = useRef<string | undefined>(undefined);
  // 用于跟踪组件是否已卸载，防止内存泄漏
  const isMountedRef = useRef(true);
  // 保存所有需要清理的定时器 ID
  const timersRef = useRef<{
    rafId: number | null;
    timeoutId: number | null; // 浏览器环境中 setTimeout 返回 number
  }>({ rafId: null, timeoutId: null });

  useEffect(() => {
    // 标记组件已挂载
    isMountedRef.current = true;

    // 清理之前的异步操作（防止快速路由切换时产生多个滚动操作）
    if (timersRef.current.rafId !== null) {
      cancelAnimationFrame(timersRef.current.rafId);
      timersRef.current.rafId = null;
    }
    if (timersRef.current.timeoutId !== null) {
      clearTimeout(timersRef.current.timeoutId);
      timersRef.current.timeoutId = null;
    }

    // 检查是否为首次渲染（避免不必要的滚动）
    if (prevLocationKeyRef.current === undefined) {
      prevLocationKeyRef.current = location.key;
      // 首次渲染时也滚动到顶部，确保页面从顶部开始
      window.scrollTo(0, 0);
      return;
    }

    // 如果位置没有变化，不执行滚动
    if (prevLocationKeyRef.current === location.key) {
      return;
    }

    // 更新上一次的 location key
    prevLocationKeyRef.current = location.key;

    // 如果滚动被锁定（比如模态框打开），不执行滚动恢复
    if (scrollLock.isScrollLocked()) {
      return;
    }

    // 使用 requestAnimationFrame + setTimeout 确保：
    // 1. DOM 更新完成
    // 2. 在浏览器重绘前执行，性能最优
    // 3. 新页面内容已经渲染
    timersRef.current.rafId = requestAnimationFrame(() => {
      // 检查组件是否仍然挂载
      if (!isMountedRef.current) {
        return;
      }

      // 延迟一小段时间确保页面内容已渲染（特别是懒加载的组件）
      timersRef.current.timeoutId = window.setTimeout(() => {
        // 再次检查组件是否仍然挂载和滚动锁定状态
        if (!isMountedRef.current) {
          return;
        }

        // 再次检查滚动锁定状态（可能在延迟期间状态改变）
        if (!scrollLock.isScrollLocked()) {
          // 页面跳转时立即滚动到顶部，不使用平滑滚动
          window.scrollTo(0, 0);
        }

        // 清理引用
        timersRef.current.timeoutId = null;
      }, 0);
    });

    // 清理函数：确保在组件卸载或依赖变化时清理所有异步操作
    return () => {
      // 标记组件已卸载
      isMountedRef.current = false;

      // 清理 requestAnimationFrame
      if (timersRef.current.rafId !== null) {
        cancelAnimationFrame(timersRef.current.rafId);
        timersRef.current.rafId = null;
      }

      // 清理 setTimeout
      if (timersRef.current.timeoutId !== null) {
        window.clearTimeout(timersRef.current.timeoutId);
        timersRef.current.timeoutId = null;
      }
    };
  }, [location.key, location.pathname]); // 同时依赖 key 和 pathname 确保准确

  return null;
};
