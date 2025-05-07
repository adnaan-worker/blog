import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import store, { AppDispatch } from './store';
import { initializeTheme } from './store/modules/themeSlice';
import './styles/index.css';

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

// 初始化过程
const init = async () => {
  // 初始化主题
  const dispatch = store.dispatch as AppDispatch;
  dispatch(initializeTheme());
  
  // 动态加载colorjs.io库，确保其在服务器端渲染时不会引起问题
  if (typeof window !== 'undefined') {
    try {
      await import('colorjs.io');
      console.log('Color.js库初始化成功');
    } catch (error) {
      console.warn('Color.js库加载失败，将使用替代方案', error);
    }
  }

  // 挂载应用
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>,
  );
};

// 启动应用
init();
