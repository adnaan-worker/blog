// 导出HTTP请求工具
export { default as http } from './http';
export { HttpRequest } from './http';
export { setupHttpConfig } from './http-config';

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

// 导出日期格式化工具
export {
  formatDate,
  getTimeAgo,
  formatDateShort,
  formatDateFull,
  formatTime,
  formatDateChinese,
  isToday,
  isYesterday,
  getTimestamp,
  getDaysDiff,
} from './format-date';

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
