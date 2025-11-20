import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import store, { AppDispatch } from './store';
import { initializeTheme } from './store/modules/themeSlice';
import { preloadTransitionStyles } from './utils/ui/theme';
import { getRandomPoeticTitle } from './config/seo.config';
import './styles/index.css';
import AccentColorStyleInjector from './theme/theme-color';
import { ToastProvider, ToastListener, initAdnaanUI } from 'adnaan-ui';
import { ErrorBoundary, GlobalMonitors } from './components/common';

// 初始化UI组件库
initAdnaanUI();

// 预加载主题切换动画样式（性能优化）
preloadTransitionStyles();

// 设置随机诗意标题
document.title = getRandomPoeticTitle();

// 初始化过程
const init = async () => {
  // 初始化主题
  const dispatch = store.dispatch as AppDispatch;
  dispatch(initializeTheme());

  // 挂载应用
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <AccentColorStyleInjector />
          <GlobalMonitors />
          <ToastProvider>
            <ToastListener />
            <RouterProvider router={router} />
          </ToastProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
};

// 启动应用
init();
