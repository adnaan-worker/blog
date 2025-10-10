// 导出HTTP请求工具
export { default as http } from './http';
export { HttpRequest } from './http';

// 导出API封装
export { default as API } from './api';

// 导出富文本解析工具
export { RichTextParser } from './rich-text-parser';

// 导出AI写作助手工具
export { aiWritingHelper, AIWritingHelper, AI_WRITING_TEMPLATES } from './ai-writing-helper';

// 导出类型定义
export * from './types';

// 导出调试工具
export { useDebugTool, DebugTool, initialViewportInfo } from './debug';
export type { ViewportInfo, HeadingInfo } from './debug';

// 导出Sticky调试工具
export { StickyDebugger, useStickyDebug } from './sticky-debug';

// 导出滚动锁定工具
export { default as scrollLock } from './scroll-lock';

// 导出一些常用的工具函数
export const formatDate = (
  date: Date | string | number | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string => {
  // 处理空值
  if (!date) return '-';

  const d = new Date(date);

  // 检查日期是否有效
  if (isNaN(d.getTime())) return '-';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): ((...args: Parameters<T>) => void) => {
  let timer: number | null = null;

  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);

    timer = window.setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
};

// 本地存储封装
export const storage = {
  // localStorage
  local: {
    get<T>(key: string): T | null {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value as unknown as T;
        }
      }
      return null;
    },
    set(key: string, value: any): void {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    },
    remove(key: string): void {
      localStorage.removeItem(key);
    },
    clear(): void {
      localStorage.clear();
    },
  },

  // sessionStorage
  session: {
    get<T>(key: string): T | null {
      const value = sessionStorage.getItem(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value as unknown as T;
        }
      }
      return null;
    },
    set(key: string, value: any): void {
      if (typeof value === 'object') {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        sessionStorage.setItem(key, value);
      }
    },
    remove(key: string): void {
      sessionStorage.removeItem(key);
    },
    clear(): void {
      sessionStorage.clear();
    },
  },
};
