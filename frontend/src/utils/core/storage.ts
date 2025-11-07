/**
 * 本地存储封装工具
 * 支持 localStorage 和 sessionStorage
 * 自动处理 JSON 序列化/反序列化
 */
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
