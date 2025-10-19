import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTheme } from '@/store/modules/themeSlice';
import type { RootState } from '@/store';

/**
 * 监听系统主题变化的 Hook
 * 仅在 auto 模式下生效，当用户系统主题改变时自动更新应用主题
 */
export const useSystemTheme = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    // 只在 auto 模式下监听系统主题变化
    if (mode !== 'auto') return;

    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      // 使用 updateTheme 而不是 setMode，只更新实际主题
      dispatch(updateTheme(newTheme));
    };

    // 添加监听器
    mediaQuery.addEventListener('change', handleChange);

    // 清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode, dispatch]);
};
