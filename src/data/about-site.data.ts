/**
 * 关于此站点 - Mock 数据
 */

import type { TimelineItem } from '@/components/common/time-line-masonry';

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
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'ai';
  icon?: string;
  version?: string;
  color?: string;
}

export const techStack: TechStackItem[] = [
  {
    id: '1',
    name: 'React 19',
    description: '现代化的前端框架',
    category: 'frontend',
    version: '19.0.0',
    color: '#61DAFB',
  },
  {
    id: '2',
    name: 'TypeScript',
    description: '类型安全的 JavaScript',
    category: 'frontend',
    version: '5.0+',
    color: '#3178C6',
  },
  {
    id: '3',
    name: 'Vite',
    description: '极速的构建工具',
    category: 'frontend',
    version: '5.0+',
    color: '#646CFF',
  },
  {
    id: '4',
    name: 'Emotion',
    description: 'CSS-in-JS 样式方案',
    category: 'frontend',
    color: '#D36AC2',
  },
  {
    id: '5',
    name: 'Framer Motion',
    description: '强大的动画库',
    category: 'frontend',
    color: '#FF0055',
  },
  {
    id: '6',
    name: 'Node.js',
    description: 'JavaScript 运行时',
    category: 'backend',
    version: '18+',
    color: '#339933',
  },
  {
    id: '7',
    name: 'Express',
    description: '轻量级 Web 框架',
    category: 'backend',
    version: '4.0+',
    color: '#000000',
  },
  {
    id: '8',
    name: 'MySQL',
    description: '关系型数据库',
    category: 'database',
    version: '8.0+',
    color: '#4479A1',
  },
  {
    id: '9',
    name: 'Redis',
    description: '内存数据库',
    category: 'database',
    version: '7.0+',
    color: '#DC382D',
  },
  {
    id: '10',
    name: 'Socket.IO',
    description: '实时通信引擎',
    category: 'backend',
    version: '4.0+',
    color: '#010101',
  },
  {
    id: '11',
    name: 'LangChain',
    description: 'AI 应用开发框架',
    category: 'ai',
    color: '#1C3C3C',
  },
  {
    id: '12',
    name: 'OpenAI API',
    description: '强大的 AI 能力',
    category: 'ai',
    color: '#10A37F',
  },
  {
    id: '13',
    name: 'Docker',
    description: '容器化部署',
    category: 'devops',
    color: '#2496ED',
  },
  {
    id: '14',
    name: 'Nginx',
    description: '高性能 Web 服务器',
    category: 'devops',
    color: '#009639',
  },
];

// 架构设计特点
export const architectureFeatures = [
  {
    id: '1',
    title: '分层架构',
    description: '前后端分离，清晰的 MVC 分层，职责明确',
    icon: '🏗️',
  },
  {
    id: '2',
    title: '组件化设计',
    description: '高度组件化，复用性强，维护成本低',
    icon: '🧩',
  },
  {
    id: '3',
    title: '性能优化',
    description: '懒加载、虚拟滚动、缓存策略，极致性能',
    icon: '⚡',
  },
  {
    id: '4',
    title: '响应式布局',
    description: '完美适配各种屏幕尺寸，优雅的移动端体验',
    icon: '📱',
  },
  {
    id: '5',
    title: 'TypeScript',
    description: '完整的类型定义，编译时错误检查',
    icon: '🔒',
  },
  {
    id: '6',
    title: 'RESTful API',
    description: '规范的 API 设计，易于扩展和维护',
    icon: '🔌',
  },
  {
    id: '7',
    title: 'AI 驱动',
    description: '集成 AI 能力，智能化的内容生成与推荐',
    icon: '🤖',
  },
  {
    id: '8',
    title: '实时通信',
    description: 'WebSocket 支持，实时消息推送',
    icon: '💬',
  },
];

// 设计理念
export const designPhilosophy = [
  {
    id: '1',
    title: '诗意简约',
    description: '追求简洁优雅，注重留白与呼吸感，让内容成为焦点',
  },
  {
    id: '2',
    title: '流畅动效',
    description: '自然的过渡动画，提升用户体验的细腻度',
  },
  {
    id: '3',
    title: '主题切换',
    description: '精心调校的深色/浅色主题，保护视觉健康',
  },
  {
    id: '4',
    title: '一致性',
    description: '统一的设计语言，保持视觉和交互的一致性',
  },
];

// 站点统计数据
export const siteStats = [
  {
    id: '1',
    label: '运行天数',
    value: 300,
    unit: '天',
    icon: '📅',
    trend: 'up' as const,
    change: '持续运行',
  },
  {
    id: '2',
    label: '文章总数',
    value: 128,
    unit: '篇',
    icon: '📝',
    trend: 'up' as const,
    change: '+12',
  },
  {
    id: '3',
    label: '访问量',
    value: 15600,
    unit: '次',
    icon: '👁️',
    trend: 'up' as const,
    change: '+23%',
  },
  {
    id: '4',
    label: '代码量',
    value: 42,
    unit: 'K 行',
    icon: '💻',
    trend: 'stable' as const,
    change: '持续迭代',
  },
  {
    id: '5',
    label: '组件数',
    value: 85,
    unit: '个',
    icon: '🧩',
    trend: 'up' as const,
    change: '+8',
  },
  {
    id: '6',
    label: '性能评分',
    value: 95,
    unit: '分',
    icon: '⚡',
    trend: 'stable' as const,
    change: '优秀',
  },
];
