import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/layouts';
import PageLoading from '@/layouts/page-loading';

// 使用 React.lazy 懒加载组件
const Home = lazy(() => import('@/pages/index/home'));
const NotFound = lazy(() => import('@/pages/not-fund/not-fund'));
const Code = lazy(() => import('@/pages/examples/code'));
const Blog = lazy(() => import('@/pages/blog'));
const BlogDetail = lazy(() => import('@/pages/blog/detail'));
const Projects = lazy(() => import('@/pages/projects'));
const ProjectDetail = lazy(() => import('@/pages/projects/detail'));

// 个人中心相关页面
const Profile = lazy(() => import('@/pages/user/profile'));
const Dashboard = lazy(() => import('@/pages/user/dashboard'));
const Favorites = lazy(() => import('@/pages/user/favorites'));
const Settings = lazy(() => import('@/pages/user/settings'));
const CreateArticle = lazy(() => import('@/pages/user/create-article'));
const UIExamples = lazy(() => import('@/pages/examples/example-ui'));
const TestToast = lazy(() => import('@/pages/examples/toast'));
const TestUI = lazy(() => import('@/pages/examples/ui'));

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
      // 项目页面路由
      {
        path: '/projects',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Projects />
          </Suspense>
        ),
      },
      {
        path: '/projects/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProjectDetail />
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
        path: 'test-toast',
        element: (
          <Suspense fallback={<PageLoading />}>
            <TestToast />
          </Suspense>
        ),
      },
      {
        path: 'test-ui',
        element: (
          <Suspense fallback={<PageLoading />}>
            <TestUI />
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
