import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '../layouts/RootLayout';
import pageLoadingGif from '@/assets/images/page-loading.gif';

// 使用 React.lazy 懒加载组件
const Home = lazy(() => import('../pages/Home'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Code = lazy(() => import('../pages/Code'));
const Blog = lazy(() => import('../pages/Blog'));
const BlogDetail = lazy(() => import('../pages/BlogDetail'));

// 个人中心相关页面
const Profile = lazy(() => import('../pages/Profile'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Settings = lazy(() => import('../pages/Settings'));
const CreateArticle = lazy(() => import('../pages/CreateArticle'));
const UIExamples = lazy(() => import('../pages/UIExamples'));

// 页面加载组件
const PageLoading = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      height: '100vh',
    }}
  >
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
    <p
      style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
      }}
    >
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
      {
        path: '/blog',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Blog />
          </Suspense>
        ),
      },
      {
        path: '/blog/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <BlogDetail />
          </Suspense>
        ),
      },
      // 个人中心相关路由
      {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: '/create-article',
        element: (
          <Suspense fallback={<PageLoading />}>
            <CreateArticle />
          </Suspense>
        ),
      },
      {
        path: '/favorites',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Favorites />
          </Suspense>
        ),
      },
      {
        path: '/settings',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: 'ui-examples',
        element: (
          <Suspense fallback={<PageLoading />}>
            <UIExamples />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoading />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
