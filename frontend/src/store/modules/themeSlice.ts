import { storage } from '@/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { executeThemeTransition } from '@/utils/ui/theme';

type ThemeMode = 'light' | 'dark' | 'auto';
type Theme = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode; // 用户选择的模式
  theme: Theme; // 实际应用的主题
  colorIndex: number | null; // 主题色索引，null 表示随机
}

interface TransitionOptions {
  x?: number;
  y?: number;
  duration?: number;
}

const initialState: ThemeState = {
  mode: 'auto', // 默认自动模式
  theme: 'light',
  colorIndex: null, // 默认随机
};

// 获取系统主题偏好
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 获取保存的主题模式
const getSavedMode = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  const savedMode = storage.local.get('themeMode') as ThemeMode;
  return savedMode === 'dark' || savedMode === 'light' || savedMode === 'auto' ? savedMode : null;
};

// 获取保存的主题色索引
const getSavedColorIndex = (): number | null => {
  if (typeof window === 'undefined') return null;
  const saved = storage.local.get('themeColorIndex');
  return typeof saved === 'number' ? saved : null;
};

// 应用主题到 DOM
const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // 设置主题模式（light/dark/auto）- 内部使用，不包含动画
    _setModeInternal: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      storage.local.set('themeMode', action.payload);

      // 如果是 auto，使用系统主题；否则使用指定主题
      if (action.payload === 'auto') {
        state.theme = getSystemTheme();
      } else {
        state.theme = action.payload;
      }
      applyTheme(state.theme);
    },

    // 循环切换：light → dark → auto → light（内部使用，不包含动画）
    _cycleThemeInternal: (state) => {
      const cycle: ThemeMode[] = ['light', 'dark', 'auto'];
      const currentIndex = cycle.indexOf(state.mode);
      const nextMode = cycle[(currentIndex + 1) % cycle.length];

      state.mode = nextMode;
      storage.local.set('themeMode', nextMode);

      if (nextMode === 'auto') {
        state.theme = getSystemTheme();
      } else {
        state.theme = nextMode;
      }
      applyTheme(state.theme);
    },

    // 内部使用：仅更新实际主题（用于 auto 模式下系统主题变化）
    updateTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      applyTheme(action.payload);
    },

    // 设置固定主题色
    setColorIndex: (state, action: PayloadAction<number>) => {
      state.colorIndex = action.payload;
      storage.local.set('themeColorIndex', action.payload);
    },

    // 设置为随机主题色
    setRandomColor: (state) => {
      state.colorIndex = null;
      storage.local.remove('themeColorIndex');
    },
  },
});

export const { _setModeInternal, _cycleThemeInternal, updateTheme, setColorIndex, setRandomColor } = themeSlice.actions;

/**
 * 带动画的设置主题模式
 */
export const setMode = (mode: ThemeMode, options: TransitionOptions = {}) => {
  return async (dispatch: any) => {
    await executeThemeTransition(() => {
      dispatch(_setModeInternal(mode));
    }, options);
  };
};

/**
 * 带动画的循环切换主题
 */
export const cycleTheme = (options: TransitionOptions = {}) => {
  return async (dispatch: any) => {
    await executeThemeTransition(() => {
      dispatch(_cycleThemeInternal());
    }, options);
  };
};

/**
 * 初始化主题
 * 1. 优先使用保存的主题模式（light/dark/auto）
 * 2. 如果没有保存，默认使用 auto（跟随系统）
 *
 * 注意：系统主题变化监听已移到 useSystemTheme Hook 中管理
 */
/**
 * 初始化主题（不带动画，用于应用启动）
 */
export const initializeTheme = () => (dispatch: any) => {
  try {
    // 1. 主题模式初始化
    const savedMode = getSavedMode();
    if (savedMode) {
      dispatch(_setModeInternal(savedMode));
    } else {
      dispatch(_setModeInternal('auto'));
    }

    // 2. 主题色初始化
    const savedColorIndex = getSavedColorIndex();
    if (savedColorIndex !== null) {
      dispatch(setColorIndex(savedColorIndex));
    }

    return savedMode || 'auto';
  } catch (error) {
    console.error('Failed to initialize theme:', error);
    dispatch(_setModeInternal('auto'));
    return 'auto';
  }
};

export default themeSlice.reducer;
