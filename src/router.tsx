import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from './layouts/RootLayout';
import pageLoadingGif from '@/assets/images/page-loading.gif';

// 使用 React.lazy 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Code = lazy(() => import('./pages/Code'));

// 页面加载组件
const PageLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
  }}>
    <img
      src={pageLoadingGif}
      alt="加载中..."
      style={{
        width: '200px',
        objectFit: 'contain',
        borderRadius: '10px',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    />
    <p style={{
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
    }}>
      加载中...
    </p>
  </div>
);

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <Suspense fallback={<PageLoading />}>
        <NotFound />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/code',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Code />
          </Suspense>
        ),
      },
      // 未来可以在这里添加更多路由
    ],
  },
]);

export default router;