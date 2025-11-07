/**
 * 关于此站点 - Mock 数据
 */

import type { TimelineItem } from '@/utils/helpers/timeline';

// 站点里程碑
export interface SiteMilestone extends TimelineItem {
  title: string;
  description: string;
  category: 'feature' | 'design' | 'tech' | 'milestone';
  icon?: string;
  tags?: string[];
  date: string; // 兼容字段，实际使用 createdAt
}

export const siteMilestones: SiteMilestone[] = [
  {
    id: '1',
    title: '站点初步搭建',
    description: '完成基础架构设计，博客系统正式启动',
    date: '2025-04-22T16:56:00.000Z',
    createdAt: '2025-04-22T16:56:00.000Z',
    category: 'milestone',
    tags: ['上线', 'v1.0'],
  },
  {
    id: '2',
    title: '主题切换功能',
    description: '优化样式，重构Header组件，添加主题切换功能，改进文章加载逻辑，增强用户体验',
    date: '2025-04-23T15:21:00.000Z',
    createdAt: '2025-04-23T15:21:00.000Z',
    category: 'feature',
    tags: ['主题', 'Header'],
  },
  {
    id: '3',
    title: '音乐播放器',
    description: '优化样式，重构Footer组件，添加开源项目展示，改进页面布局和滚动监听逻辑，新增音乐播放和返回顶部',
    date: '2025-04-23T17:12:00.000Z',
    createdAt: '2025-04-23T17:12:00.000Z',
    category: 'feature',
    tags: ['音乐', '播放器'],
  },
  {
    id: '4',
    title: '个人中心系统',
    description: '添加个人中心相关页面和路由，优化Header组件，增加用户头像和下拉菜单功能',
    date: '2025-04-23T23:32:00.000Z',
    createdAt: '2025-04-23T23:32:00.000Z',
    category: 'feature',
    tags: ['个人中心', '用户'],
  },
  {
    id: '5',
    title: '文章编辑功能',
    description: '添加创建文章页面及相关路由，更新依赖项以支持Tiptap编辑器功能',
    date: '2025-04-27T00:04:00.000Z',
    createdAt: '2025-04-27T00:04:00.000Z',
    category: 'feature',
    tags: ['编辑器', '文章'],
  },
  {
    id: '6',
    title: 'Redux 状态管理',
    description: '更新环境配置，修改代理目标端口，添加Redux相关依赖，重构TypeScript配置，优化主题管理和用户登录功能',
    date: '2025-04-30T15:44:00.000Z',
    createdAt: '2025-04-30T15:44:00.000Z',
    category: 'milestone',
    tags: ['Redux', '状态管理'],
  },
  {
    id: '7',
    title: '主题色系统',
    description: '添加colorjs.io库并优化初始化逻辑，增强主题样式支持，优化颜色生成逻辑',
    date: '2025-05-08T00:20:00.000Z',
    createdAt: '2025-05-08T00:20:00.000Z',
    category: 'design',
    tags: ['主题', '颜色'],
  },
  {
    id: '8',
    title: '手记功能',
    description: '新增手记页面及相关样式和路由配置，重构手记页面，整合无限滚动和时间线组件',
    date: '2025-08-31T14:22:00.000Z',
    createdAt: '2025-08-31T14:22:00.000Z',
    category: 'feature',
    tags: ['手记', '时间线'],
  },
  {
    id: '9',
    title: '路由系统重构',
    description: '从createBrowserRouter切换到createHashRouter，更新Header和移动菜单组件，添加用户注销功能',
    date: '2025-09-02T20:12:00.000Z',
    createdAt: '2025-09-02T20:12:00.000Z',
    category: 'milestone',
    tags: ['路由', 'HashRouter'],
  },
  {
    id: '10',
    title: '个人资料页面',
    description: '更新用户个人资料页面，添加标签页导航和设置面板',
    date: '2025-09-02T22:11:00.000Z',
    createdAt: '2025-09-02T22:11:00.000Z',
    category: 'feature',
    tags: ['个人资料', '设置'],
  },
  {
    id: '11',
    title: '文章详情与评论',
    description: '对接文章列表，修复文件大小写，文章详情及评论功能',
    date: '2025-09-14T20:53:00.000Z',
    createdAt: '2025-09-14T20:53:00.000Z',
    category: 'feature',
    tags: ['文章', '评论'],
  },
  {
    id: '12',
    title: '实时通信系统',
    description: '添加socket.io封装，实时状态显示，优化socket配置和连接管理',
    date: '2025-09-20T18:11:00.000Z',
    createdAt: '2025-09-20T18:11:00.000Z',
    category: 'milestone',
    tags: ['Socket.IO', '实时'],
  },
  {
    id: '13',
    title: 'AI 助手功能',
    description: '添加AI助手功能，优化文章和手记编辑页面，支持未保存更改提示，增强用户体验',
    date: '2025-10-04T14:41:00.000Z',
    createdAt: '2025-10-04T14:41:00.000Z',
    category: 'feature',
    tags: ['AI', '助手'],
  },
  {
    id: '14',
    title: 'adnaan-ui 组件库集成',
    description: '集成 adnaan-ui 组件库，替换原有 UI 组件，优化用户交互体验，更新相关文档',
    date: '2025-10-06T15:17:00.000Z',
    createdAt: '2025-10-06T15:17:00.000Z',
    category: 'milestone',
    tags: ['组件库', 'UI'],
  },
  {
    id: '15',
    title: '内容管理功能',
    description: '添加评论管理、书签管理和点赞管理功能，更新用户快捷操作和类型定义，优化用户体验',
    date: '2025-10-07T00:18:00.000Z',
    createdAt: '2025-10-07T00:18:00.000Z',
    category: 'feature',
    tags: ['管理', '内容'],
  },
  {
    id: '16',
    title: '富文本编辑器增强',
    description: '重构富文本编辑器，替换为新的 RichTextEditor 组件，支持动态高亮和图片上传功能',
    date: '2025-10-30T22:43:00.000Z',
    createdAt: '2025-10-30T22:43:00.000Z',
    category: 'feature',
    tags: ['编辑器', '富文本'],
  },
  {
    id: '17',
    title: 'SEO 优化',
    description: '添加SEO组件和自动骨架屏，优化页面加载体验和SEO配置',
    date: '2025-10-31T21:22:00.000Z',
    createdAt: '2025-10-31T21:22:00.000Z',
    category: 'tech',
    tags: ['SEO', '优化'],
  },
  {
    id: '18',
    title: '访客统计功能',
    description: '添加访客统计功能，包含 Tooltip 组件和访客活动追踪 Hook，支持实时在线人数和活动数据展示',
    date: '2025-10-29T23:50:00.000Z',
    createdAt: '2025-10-29T23:50:00.000Z',
    category: 'feature',
    tags: ['统计', '访客'],
  },
  {
    id: '19',
    title: '动画性能优化',
    description: '添加动画性能优化工具，整合统一动画配置，优化组件动画效果，采用Spring动画效果',
    date: '2025-10-15T20:52:00.000Z',
    createdAt: '2025-10-15T20:52:00.000Z',
    category: 'tech',
    tags: ['动画', '性能'],
  },
  {
    id: '20',
    title: '项目管理系统',
    description: '更新项目管理功能，添加项目相关API，优化项目展示和管理逻辑',
    date: '2025-10-12T01:06:00.000Z',
    createdAt: '2025-10-12T01:06:00.000Z',
    category: 'feature',
    tags: ['项目', '管理'],
  },
  {
    id: '21',
    title: '陪伴物组件',
    description: '添加陪伴物组件和相关逻辑，支持智能气泡和物理引擎，优化样式和动画效果',
    date: '2025-11-02T21:13:00.000Z',
    createdAt: '2025-11-02T21:13:00.000Z',
    category: 'feature',
    tags: ['组件', '互动'],
  },
  {
    id: '22',
    title: '评论系统重构',
    description: '更新评论组件，支持访客评论功能，优化评论展示样式，新增评论扁平化视图和树形视图切换',
    date: '2025-11-03T22:10:00.000Z',
    createdAt: '2025-11-03T22:10:00.000Z',
    category: 'feature',
    tags: ['评论', '访客'],
  },
  {
    id: '23',
    title: '骨架屏系统',
    description: '重构骨架屏组件，新增文章、评论、手记和项目的骨架屏，优化加载状态展示',
    date: '2025-11-03T23:53:00.000Z',
    createdAt: '2025-11-03T23:53:00.000Z',
    category: 'tech',
    tags: ['骨架屏', '加载'],
  },
];

// 技术栈
export interface TechStackItem {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'ai';
}

export const techStack: TechStackItem[] = [
  { id: '1', name: 'React', category: 'frontend' },
  { id: '2', name: 'TypeScript', category: 'frontend' },
  { id: '3', name: 'Vite', category: 'frontend' },
  { id: '4', name: 'Emotion', category: 'frontend' },
  { id: '5', name: 'Framer Motion', category: 'frontend' },
  { id: '6', name: 'Node.js', category: 'backend' },
  { id: '7', name: 'Express', category: 'backend' },
  { id: '8', name: 'Sequelize', category: 'backend' },
  { id: '9', name: 'Socket.IO', category: 'backend' },
  { id: '10', name: 'MySQL', category: 'database' },
  { id: '11', name: 'Redis', category: 'database' },
  { id: '12', name: 'LangChain', category: 'ai' },
  { id: '13', name: 'OpenAI', category: 'ai' },
  { id: '14', name: 'Docker', category: 'devops' },
  { id: '15', name: 'Nginx', category: 'devops' },
];

// 站点统计数据
export const siteStats = [
  {
    id: '1',
    label: '运行天数',
    value: 300,
    unit: '天',
  },
  {
    id: '2',
    label: '文章总数',
    value: 128,
    unit: '篇',
  },
  {
    id: '3',
    label: '访问量',
    value: 15600,
    unit: '次',
  },
  {
    id: '4',
    label: '代码量',
    value: 42,
    unit: 'K 行',
  },
  {
    id: '5',
    label: '组件数',
    value: 85,
    unit: '个',
  },
];
