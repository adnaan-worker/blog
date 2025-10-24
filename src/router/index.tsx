import { createHashRouter, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import RootLayout from '@/layouts';

/**
 * 滚动恢复组件
 * 监听路由变化，每次路径变化时自动滚动到页面顶部
 */
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // 使用三种方式确保跨浏览器兼容
    window.scrollTo(0, 0);
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
const Projects = lazy(() => import('@/pages/project'));
const ProjectDetail = lazy(() => import('@/pages/project/deatil'));

// 个人中心相关页面
const Profile = lazy(() => import('@/pages/user/Profile'));

// 编辑器页面
const ArticleEditor = lazy(() => import('@/pages/editor/article'));
const NoteEditor = lazy(() => import('@/pages/editor/note'));

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
        element: <Home />,
      },
      {
        path: '/code',
        element: <Code />,
      },
      {
        path: '/blog',
        element: <Blog />,
      },
      {
        path: '/blog/:id',
        element: <BlogDetail />,
      },
      {
        path: '/notes',
        element: <Notes />,
      },
      {
        path: '/notes/:id',
        element: <NoteDetail />,
      },
      {
        path: '/projects',
        element: <Projects />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetail />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
  // 编辑器独立页面路由（不继承主布局）
  {
    path: '/editor/article',
    element: (
      <Suspense fallback={null}>
        <ArticleEditor />
      </Suspense>
    ),
  },
  {
    path: '/editor/note',
    element: (
      <Suspense fallback={null}>
        <NoteEditor />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
