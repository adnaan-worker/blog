import { storage } from '@/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: 'light',
};

// 获取系统主题偏好
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 获取保存的主题
const getSavedTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  const savedTheme = storage.local.get('theme') as Theme;
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null;
};

// 应用主题到 DOM
const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  storage.local.set('theme', theme);
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      applyTheme(action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      applyTheme(newTheme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

// 初始化主题
export const initializeTheme = () => (dispatch: any) => {
  try {
    // 1. 首先尝试获取保存的主题
    const savedTheme = getSavedTheme();
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
      return;
    }

    // 2. 如果没有保存的主题，使用系统主题
    const systemTheme = getSystemTheme();
    dispatch(setTheme(systemTheme));

    // 3. 监听系统主题变化
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        dispatch(setTheme(newTheme));
      };

      // 添加监听器
      mediaQuery.addEventListener('change', handleChange);

      // 返回清理函数
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  } catch (error) {
    console.error('Failed to initialize theme:', error);
    // 如果出错，使用默认主题
    dispatch(setTheme('light'));
  }
};

export default themeSlice.reducer;
