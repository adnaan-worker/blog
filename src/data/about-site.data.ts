/**
 * 关于此站点 - Mock 数据
 */

import type { TimelineItem } from '@/components/blog/time-line-masonry';

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
    title: '站点上线',
    description: '完成基础架构设计，博客系统正式上线运行',
    date: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-15T00:00:00.000Z',
    category: 'milestone',
    tags: ['上线', 'v1.0'],
  },
  {
    id: '2',
    title: '引入诗意简约设计',
    description: '重新设计 UI 风格，采用诗意简约的设计语言，注重留白与呼吸感',
    date: '2024-02-20T00:00:00.000Z',
    createdAt: '2024-02-20T00:00:00.000Z',
    category: 'design',
    tags: ['设计', 'UI'],
  },
  {
    id: '3',
    title: '实时通信系统',
    description: '集成 Socket.IO，支持实时评论、在线状态展示',
    date: '2024-03-10T00:00:00.000Z',
    createdAt: '2024-03-10T00:00:00.000Z',
    category: 'feature',
    tags: ['实时', 'WebSocket'],
  },
  {
    id: '4',
    title: 'AI 功能集成',
    description: '引入 AI 助手，支持文章摘要生成、智能推荐等功能',
    date: '2024-04-05T00:00:00.000Z',
    createdAt: '2024-04-05T00:00:00.000Z',
    category: 'feature',
    tags: ['AI', 'LangChain'],
  },
  {
    id: '5',
    title: '性能优化升级',
    description: '实现智能骨架屏、虚拟滚动、组件懒加载，大幅提升加载速度',
    date: '2024-05-12T00:00:00.000Z',
    createdAt: '2024-05-12T00:00:00.000Z',
    category: 'tech',
    tags: ['性能', '优化'],
  },
  {
    id: '6',
    title: '个人中心系统',
    description: '完善用户个人中心，支持内容管理、数据统计、权限控制',
    date: '2024-06-18T00:00:00.000Z',
    createdAt: '2024-06-18T00:00:00.000Z',
    category: 'feature',
    tags: ['功能', '管理'],
  },
  {
    id: '7',
    title: '富文本编辑器',
    description: '开发强大的 Markdown 编辑器，支持实时预览、代码高亮、图片上传',
    date: '2024-07-25T00:00:00.000Z',
    createdAt: '2024-07-25T00:00:00.000Z',
    category: 'feature',
    tags: ['编辑器', 'Markdown'],
  },
  {
    id: '8',
    title: '主题系统优化',
    description: '完善深色/浅色主题切换，优化配色方案和过渡动画',
    date: '2024-08-30T00:00:00.000Z',
    createdAt: '2024-08-30T00:00:00.000Z',
    category: 'design',
    tags: ['主题', '体验'],
  },
  {
    id: '9',
    title: '响应式设计重构',
    description: '全面优化移动端体验，支持手势操作、自适应布局',
    date: '2024-09-14T00:00:00.000Z',
    createdAt: '2024-09-14T00:00:00.000Z',
    category: 'design',
    tags: ['响应式', '移动端'],
  },
  {
    id: '10',
    title: '站点达到 v2.0',
    description: '功能完善，性能优化，用户体验持续提升',
    date: '2024-10-20T00:00:00.000Z',
    createdAt: '2024-10-20T00:00:00.000Z',
    category: 'milestone',
    tags: ['里程碑', 'v2.0'],
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
