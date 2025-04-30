import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
  },
});

// 从 store 中推断出 RootState 类型
export type RootState = ReturnType<typeof store.getState>;
// 从 store 中推断出 AppDispatch 类型
export type AppDispatch = typeof store.dispatch;

export default store; 