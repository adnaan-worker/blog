import { createHashRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/layouts';
import PageLoading from '@/layouts/page-loading';

// 使用 React.lazy 懒加载组件
const Home = lazy(() => import('@/pages/index/home'));
const NotFound = lazy(() => import('@/pages/not-fund/not-fund'));
const Code = lazy(() => import('@/pages/examples/code'));
const Blog = lazy(() => import('@/pages/blog'));
const BlogDetail = lazy(() => import('@/pages/blog/detail'));
const Notes = lazy(() => import('@/pages/notes'));
const NoteDetail = lazy(() => import('@/pages/notes/detail'));
const Projects = lazy(() => import('@/pages/projects'));
const ProjectDetail = lazy(() => import('@/pages/projects/detail'));

// 个人中心相关页面
const Profile = lazy(() => import('@/pages/user/Profile'));

// 编辑器页面
const ArticleEditor = lazy(() => import('@/pages/editor/article'));
const NoteEditor = lazy(() => import('@/pages/editor/note'));

// UI文档独立页面
const UIDocsPage = lazy(() => import('@/pages/ui-docs'));

// 创建路由配置
const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
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
      {
        path: '/notes',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Notes />
          </Suspense>
        ),
      },
      {
        path: '/notes/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <NoteDetail />
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
    ],
  },
  // 编辑器独立页面路由（不继承主布局）
  {
    path: '/editor/article',
    element: (
      <Suspense fallback={<PageLoading />}>
        <ArticleEditor />
      </Suspense>
    ),
  },
  {
    path: '/editor/note',
    element: (
      <Suspense fallback={<PageLoading />}>
        <NoteEditor />
      </Suspense>
    ),
  },
  // UI文档独立页面路由（不继承主布局）
  {
    path: '/ui-docs',
    element: (
      <Suspense fallback={<PageLoading />}>
        <UIDocsPage />
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
]);

export default router;
