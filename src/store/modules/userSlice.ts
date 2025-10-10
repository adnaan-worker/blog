import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import API from '@/utils/api';
import { storage } from '@/utils';

export interface User {
  id: string | number;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// 从本地存储获取用户信息初始化状态
const getUserFromStorage = () => {
  const userData = storage.local.get('user');
  const tokenData = storage.local.get('token');
  if (userData && tokenData) {
    return {
      user: userData as any,
      token: tokenData as string,
      isLoggedIn: true,
      loading: false,
      error: null,
    };
  }
  return {
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,
    error: null,
  };
};

const initialState: UserState = getUserFromStorage();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;

export const login = (username: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await API.user.login({ username, password });
    if (response.code === 200) {
      dispatch(setUser({ user: response.data.user, token: response.data.token }));
      storage.local.set('user', response.data.user);
      storage.local.set('token', response.data.token);
      adnaan.toast.success('登录成功', '欢迎回来');
    } else {
      dispatch(setError(response.message || '登录失败'));
      // 使用全局Toast显示登录失败
      adnaan.toast.error(response.message || '登录失败', '出错了');
    }
  } catch (error) {
    const errorMessage = '登录失败，请稍后重试';
    dispatch(setError(errorMessage));
    // 使用全局Toast显示登录异常
    adnaan.toast.error(errorMessage, '出错了');
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = () => async (dispatch: any) => {
  try {
    await API.user.logout();
    // 清除本地存储中的用户信息
    storage.local.remove('user');
    storage.local.remove('token');
    // 清除个人中心相关缓存
    storage.local.remove('profile_active_tab');
    storage.local.remove('profile_open_tabs');
    dispatch(logout());
    // 使用全局Toast显示登出成功
    adnaan.toast.info('您已成功退出登录', '再见');
    // 跳转到首页
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    // 即使登出失败，也清除本地数据并跳转
    storage.local.remove('user');
    storage.local.remove('token');
    storage.local.remove('profile_active_tab');
    storage.local.remove('profile_open_tabs');
    dispatch(logout());
    // 使用全局Toast显示登出失败
    adnaan.toast.error('退出登录失败，但已清除本地数据', '出错了');
    // 跳转到首页
    window.location.href = '/';
  }
};

// 临时添加注册API方法，后续应该添加到API中
const registerApi = (data: { username: string; email: string; password: string }): Promise<any> => {
  // 这里应该调用实际的注册API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '注册成功',
        data: {
          user: {
            id: Math.floor(Math.random() * 1000),
            username: data.username,
            email: data.email,
            role: 'user',
            status: 'active',
          },
          token: 'dummy-token-' + Math.random(),
        },
      });
    }, 500);
  });
};

export const register = (username: string, email: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // 使用临时的注册API方法，实际项目中应该替换为真实API
    const response = await registerApi({ username, email, password });

    if (response.code === 200) {
      // 使用全局Toast显示注册成功
      adnaan.toast.success('注册成功，正在为您登录', '恭喜');
      // 注册成功后自动登录
      await dispatch(login(username, password));
    } else {
      dispatch(setError(response.message || '注册失败'));
      // 使用全局Toast显示注册失败
      adnaan.toast.error(response.message || '注册失败', '出错了');
    }
  } catch (error) {
    const errorMessage = '注册失败，请稍后重试';
    dispatch(setError(errorMessage));
    // 使用全局Toast显示注册异常
    adnaan.toast.error(errorMessage, '出错了');
  } finally {
    dispatch(setLoading(false));
  }
};

export default userSlice.reducer;
