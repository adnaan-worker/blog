import { createHashRouter, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import RootLayout from '@/layouts';
import PageLoading from '@/components/common/page-loading';

/**
 * 滚动恢复组件
 * 监听路由变化，每次路径变化时自动滚动到页面顶部
 */
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // 使用三种方式确保跨浏览器兼容
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  return null;
};

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
    element: (
      <>
        <ScrollToTop />
        <RootLayout />
      </>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/code',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <Code />
          </Suspense>
        ),
      },
      {
        path: '/blog',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <Blog />
          </Suspense>
        ),
      },
      {
        path: '/blog/:id',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <BlogDetail />
          </Suspense>
        ),
      },
      {
        path: '/notes',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <Notes />
          </Suspense>
        ),
      },
      {
        path: '/notes/:id',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <NoteDetail />
          </Suspense>
        ),
      },
      // 项目页面路由
      {
        path: '/projects',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <Projects />
          </Suspense>
        ),
      },
      {
        path: '/projects/:id',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
            <ProjectDetail />
          </Suspense>
        ),
      },
      // 个人中心相关路由
      {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoading fullScreen />}>
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
      <Suspense fallback={<PageLoading fullScreen />}>
        <ArticleEditor />
      </Suspense>
    ),
  },
  {
    path: '/editor/note',
    element: (
      <Suspense fallback={<PageLoading fullScreen />}>
        <NoteEditor />
      </Suspense>
    ),
  },
  // UI文档独立页面路由（不继承主布局）
  {
    path: '/ui-docs',
    element: (
      <Suspense fallback={<PageLoading fullScreen />}>
        <UIDocsPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoading fullScreen />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

// 禁用浏览器的自动滚动恢复功能
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default router;
