import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API } from '@/utils';
import { storage } from '@/utils';

export interface User {
  id: string | number;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: string;
  fullName?: string;
  bio?: string;
  joinDate?: string;
  lastLoginTime?: string;
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
  const userData = storage.local.get<User>('user');
  const tokenData = storage.local.get('token');
  if (userData && tokenData) {
    return {
      user: userData,
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
      storage.local.set('user', action.payload.user);
      storage.local.set('token', action.payload.token);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      const updates = action.payload;
      const hasAvatarUpdate = Object.prototype.hasOwnProperty.call(updates, 'avatar');
      if (!state.user) {
        state.user = {
          ...(updates as User),
        };
      } else {
        const nextUser: User = {
          ...state.user,
          ...updates,
        };
        state.user = nextUser;
      }

      if (state.user) {
        storage.local.set('user', state.user);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, updateUser, logout } = userSlice.actions;

export const login = (username: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await API.user.login({ username, password });
    if (response.code === 200) {
      dispatch(setUser({ user: response.data.user, token: response.data.token }));
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

export const register =
  (username: string, email: string, password: string, confirmPassword: string, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 使用真实的API进行注册
      const response = await API.user.register({ username, email, password, confirmPassword });

      if (response.code === 201) {
        // 使用全局Toast显示注册成功
        adnaan.toast.success('注册成功，正在为您登录...', '恭喜');

        // 注册成功后自动登录
        await dispatch(login(username, password));

        // 调用成功回调（关闭模态框）
        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(setError(response.message || '注册失败'));
        // 使用全局Toast显示注册失败
        adnaan.toast.error(response.message || '注册失败', '出错了');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '注册失败，请稍后重试';
      dispatch(setError(errorMessage));
      // 使用全局Toast显示注册异常
      adnaan.toast.error(errorMessage, '出错了');
    } finally {
      dispatch(setLoading(false));
    }
  };

export default userSlice.reducer;
