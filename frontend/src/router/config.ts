import { createHashRouter } from 'react-router-dom';
import { createRouteElements } from './routes';

// 获取路由元素
const elements = createRouteElements();

// 创建路由配置
export const router = createHashRouter([
  {
    path: '/',
    element: elements.rootElement,
    children: [
      {
        index: true,
        element: elements.home,
      },
      {
        path: '/blog',
        element: elements.blog,
      },
      {
        path: '/blog/:id',
        element: elements.blogDetail,
      },
      {
        path: '/notes',
        element: elements.notes,
      },
      {
        path: '/notes/:id',
        element: elements.noteDetail,
      },
      {
        path: '/projects',
        element: elements.projects,
      },
      {
        path: '/projects/:id',
        element: elements.projectDetail,
      },
      {
        path: '/friends',
        element: elements.friends,
      },
      {
        path: '/profile',
        element: elements.profile,
      },
      {
        path: '/about-site',
        element: elements.aboutSite,
      },
      {
        path: '/about-me',
        element: elements.aboutMe,
      },
      // 编辑器页面：现在也继承主布局（RootLayout），以便与个人中心共享整体框架
      {
        path: '/editor/article',
        element: elements.articleEditor,
      },
      {
        path: '/editor/note',
        element: elements.noteEditor,
      },
    ],
  },
  {
    path: '*',
    element: elements.notFound,
  },
]);
