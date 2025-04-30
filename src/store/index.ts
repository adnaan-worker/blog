import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './modules/userSlice';
import themeReducer from './modules/themeSlice';
import counterReducer from './modules/counterSlice';

// 配置 store
const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    counter: counterReducer,
  },
  // 添加中间件配置
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些不需要序列化检查的 action
        ignoredActions: ['user/setUserInfo'],
      },
    }),
});

// 从 store 中推断出 RootState 类型
export type RootState = ReturnType<typeof store.getState>;
// 从 store 中推断出 AppDispatch 类型
export type AppDispatch = typeof store.dispatch;

// 创建类型安全的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 导出 store 实例
export default store; 