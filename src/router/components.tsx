import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { scrollLock } from '@/utils/core/scroll-lock';

// 滚动位置存储 key
const SCROLL_POSITION_KEY = '__scroll_pos__';

// 恢复滚动的配置
const RESTORE_CONFIG = {
  INITIAL_DELAY: 100, // 初始延迟 (ms)
  RETRY_INTERVAL: 50, // 重试间隔 (ms)
  MAX_ATTEMPTS: 40, // 最大尝试次数 (总计 2 秒)
  HEIGHT_TOLERANCE: 50, // 高度容差 (px)
};

/**
 * 滚动恢复组件
 *
 * 功能：
 * - 页面刷新：恢复到之前的滚动位置
 * - 路由切换：滚动到页面顶部
 *
 * 实现原理：
 * 1. 页面卸载前保存滚动位置到 sessionStorage
 * 2. 页面加载后等待内容渲染完成，然后恢复滚动位置
 * 3. 路由切换时清除保存的位置，滚动到顶部
 *
 * 注意：通过智能延迟和重试机制，确保在页面高度足够时才恢复滚动，
 *       避免了浏览器默认滚动恢复在 fixed header 布局下的偏移问题
 */
export const ScrollToTop = () => {
  const location = useLocation();
  const prevLocationKeyRef = useRef<string | undefined>(undefined);
  const isMountedRef = useRef(true);
  const timersRef = useRef<{ rafId: number | null; timeoutId: number | null }>({
    rafId: null,
    timeoutId: null,
  });

  // 保存滚动位置（页面卸载前）
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
    };

    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  // 首次挂载时恢复滚动位置（只执行一次）
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);

    if (!savedPosition) return;

    const targetScrollY = parseInt(savedPosition, 10);
    if (isNaN(targetScrollY) || targetScrollY <= 0) return;

    let attempts = 0;
    let timeoutId: number | null = null;

    /**
     * 尝试恢复滚动位置
     * 等待页面内容渲染完成，确保页面高度足够后再恢复
     */
    const attemptRestore = () => {
      attempts++;

      const docHeight = document.documentElement.scrollHeight;
      const viewHeight = window.innerHeight;
      const maxScrollY = docHeight - viewHeight;

      // 检查页面高度是否足够
      if (maxScrollY >= targetScrollY - RESTORE_CONFIG.HEIGHT_TOLERANCE) {
        // 页面高度足够，恢复滚动
        window.scrollTo(0, targetScrollY);
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      } else if (attempts < RESTORE_CONFIG.MAX_ATTEMPTS) {
        // 页面高度不足，继续等待
        timeoutId = window.setTimeout(attemptRestore, RESTORE_CONFIG.RETRY_INTERVAL);
      } else {
        // 达到最大尝试次数，强制恢复
        window.scrollTo(0, targetScrollY);
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }
    };

    // 延迟开始第一次尝试，等待初始渲染
    timeoutId = window.setTimeout(attemptRestore, RESTORE_CONFIG.INITIAL_DELAY);

    // 清理函数
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // 空依赖，确保只在首次挂载时执行

  // 监听路由变化，切换路由时滚动到顶部
  useEffect(() => {
    isMountedRef.current = true;

    // 首次渲染，记录当前 location.key
    if (prevLocationKeyRef.current === undefined) {
      prevLocationKeyRef.current = location.key;
      return;
    }

    // location.key 未变化，不执行滚动
    if (prevLocationKeyRef.current === location.key) {
      return;
    }

    // 更新 location.key
    prevLocationKeyRef.current = location.key;

    // 清除保存的滚动位置（路由切换，不是刷新）
    sessionStorage.removeItem(SCROLL_POSITION_KEY);

    // 检查滚动锁定状态（模态框打开时不滚动）
    if (scrollLock.isLocked()) {
      return;
    }

    // 使用 RAF 确保在浏览器重绘前执行，性能最优
    timersRef.current.rafId = requestAnimationFrame(() => {
      if (!isMountedRef.current) return;

      // 延迟确保懒加载组件已渲染，同时等待 header 状态重置完成
      // header 使用 useLayoutEffect 在绘制前重置，这里延迟稍久一点确保不冲突
      timersRef.current.timeoutId = window.setTimeout(() => {
        if (isMountedRef.current && !scrollLock.isLocked()) {
          window.scrollTo(0, 0);
        }
        timersRef.current.timeoutId = null;
      }, 10); // 增加延迟，确保 header 的 useLayoutEffect 先执行
    });

    // 清理函数
    return () => {
      isMountedRef.current = false;

      if (timersRef.current.rafId !== null) {
        cancelAnimationFrame(timersRef.current.rafId);
        timersRef.current.rafId = null;
      }

      if (timersRef.current.timeoutId !== null) {
        clearTimeout(timersRef.current.timeoutId);
        timersRef.current.timeoutId = null;
      }
    };
  }, [location.key, location.pathname]);

  return null;
};
