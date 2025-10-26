import { useSelector } from 'react-redux';
import { RootState } from '@/store';

/**
 * 获取当前主题的 Hook
 * @returns {Object} { theme: 'light' | 'dark', mode: 'light' | 'dark' | 'auto' }
 */
export const useTheme = () => {
  const { theme, mode } = useSelector((state: RootState) => state.theme);

  return {
    theme, // 实际应用的主题
    mode, // 用户选择的模式
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};
