import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store, { AppDispatch } from './store';
import { initializeTheme } from './store/modules/themeSlice';
import './styles/index.css';
import router from './router';

// 定义标题数组
const titles = [
  '星河代码匣 📦｜光阴副本里的技术拾荒集',
  '🌌数字琥珀馆｜光阴副本中的代码考古手记',
  '时光编译机 ⏳｜在光阴副本里敲开技术的年轮',
  '记忆存储栈 📁｜解码光阴副本的科技絮语',
  '像素漂流瓶 🚀｜打捞光阴副本里的技术备忘录',
  '算法时光机 ⏱️｜穿梭光阴副本的技术遗迹探险',
  '字节沙漏站 ⏳｜记录光阴副本的开发碎片集',
  '虚拟灯塔所 ⚓｜在光阴副本中点亮技术星光',
  '数据云影阁 ☁️｜收藏光阴副本的代码剪影',
];

// 随机选择一个标题
const randomIndex = Math.floor(Math.random() * titles.length);
const randomTitle = titles[randomIndex];

// 设置网页标题
document.title = randomTitle;

// 初始化主题
const dispatch = store.dispatch as AppDispatch;
dispatch(initializeTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
