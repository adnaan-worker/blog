import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义状态类型
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
  lastUpdated: string | null;
}

// 初始状态
const initialState: CounterState = {
  value: 0,
  status: 'idle',
  lastUpdated: null,
};

// 创建 slice
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 增加计数
    increment: (state) => {
      state.value += 1;
      state.lastUpdated = new Date().toISOString();
    },
    // 减少计数
    decrement: (state) => {
      state.value -= 1;
      state.lastUpdated = new Date().toISOString();
    },
    // 设置特定值
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    // 设置状态
    setStatus: (state, action: PayloadAction<CounterState['status']>) => {
      state.status = action.payload;
    },
  },
});

// 导出 actions
export const { increment, decrement, setValue, setStatus } = counterSlice.actions;

// 导出 reducer
export default counterSlice.reducer;

// 导出选择器
export const selectCount = (state: { counter: CounterState }) => state.counter.value;
export const selectStatus = (state: { counter: CounterState }) => state.counter.status;
export const selectLastUpdated = (state: { counter: CounterState }) => state.counter.lastUpdated;
