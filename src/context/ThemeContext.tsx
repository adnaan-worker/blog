import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // 从本地存储中获取主题，如果没有则使用系统偏好
  const [theme, setTheme] = useState<Theme>(() => {
    // 客户端渲染时，从localStorage获取主题配置
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) return savedTheme;
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return 'light'; // 默认浅色主题
  });

  // 计算是否为暗色模式
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // 保存主题到本地存储
    localStorage.setItem('theme', theme);
    
    // 更新 document 的 data-theme 属性，触发CSS变量变化
    document.documentElement.setAttribute('data-theme', theme);
    
    // 添加过渡类，使颜色变化更平滑
    document.documentElement.classList.add('theme-transition');
    
    // 300ms后移除过渡类，避免其他操作时的过渡效果
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [theme]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有当用户没有手动设置主题时，才跟随系统主题
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};