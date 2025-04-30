import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import API from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
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
      state.isLoggedIn = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;

// 异步 action creators
export const checkLoginStatus = () => async (dispatch: any) => {
  try {
    const response = await API.user.getUserInfo();
    if (response.code === 200) {
      dispatch(setUser(response.data));
    }
  } catch (error) {
    console.error('Failed to check login status:', error);
  }
};

export const login = (username: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    const response = await API.user.login({ username, password });
    if (response.code === 200) {
      dispatch(setUser(response.data));
    } else {
      dispatch(setError(response.message || '登录失败'));
    }
  } catch (error) {
    dispatch(setError('登录失败，请稍后重试'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = () => async (dispatch: any) => {
  try {
    await API.user.logout();
    dispatch(logout());
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

export const register = (username: string, email: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    const response = await API.user.register({ username, email, password });
    if (response.code === 200) {
      // 注册成功后自动登录
      await dispatch(login(username, password));
    } else {
      dispatch(setError(response.message || '注册失败'));
    }
  } catch (error) {
    dispatch(setError('注册失败，请稍后重试'));
  } finally {
    dispatch(setLoading(false));
  }
};

export default userSlice.reducer; 