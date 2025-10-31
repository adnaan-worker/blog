import { lazy, Suspense } from 'react';
import RootLayout from '@/layouts';
import { ScrollToTop } from './components';

// 使用 React.lazy 懒加载组件
const Home = lazy(() => import('@/pages/index/home'));
const NotFound = lazy(() => import('@/pages/not-found/not-found'));
const Blog = lazy(() => import('@/pages/blog'));
const BlogDetail = lazy(() => import('@/pages/blog/detail'));
const Notes = lazy(() => import('@/pages/notes'));
const NoteDetail = lazy(() => import('@/pages/notes/detail'));
const Projects = lazy(() => import('@/pages/project'));
const ProjectDetail = lazy(() => import('@/pages/project/detail'));

// 个人中心相关页面
const Profile = lazy(() => import('@/pages/user/profile'));

// 编辑器页面
const ArticleEditor = lazy(() => import('@/pages/editor/article'));
const NoteEditor = lazy(() => import('@/pages/editor/note'));

// 关于页面
const AboutSite = lazy(() => import('@/pages/about/about-site'));
const AboutMe = lazy(() => import('@/pages/about/about-me'));

/**
 * 路由配置
 * 返回路由元素（JSX），用于在 config.ts 中创建 router
 */
export const createRouteElements = () => ({
  rootElement: (
    <>
      <ScrollToTop />
      <RootLayout />
    </>
  ),
  home: <Home />,
  blog: <Blog />,
  blogDetail: <BlogDetail />,
  notes: <Notes />,
  noteDetail: <NoteDetail />,
  projects: <Projects />,
  projectDetail: <ProjectDetail />,
  profile: <Profile />,
  articleEditor: (
    <Suspense fallback={null}>
      <ArticleEditor />
    </Suspense>
  ),
  noteEditor: (
    <Suspense fallback={null}>
      <NoteEditor />
    </Suspense>
  ),
  aboutSite: <AboutSite />,
  aboutMe: <AboutMe />,
  notFound: <NotFound />,
});
