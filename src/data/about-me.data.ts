/**
 * 关于我 - Mock 数据
 */

import type { TimelineItem } from '@/utils/helpers/timeline';

// 个人信息
export const personalInfo = {
  name: 'adnaan',
  title: '全栈开发工程师',
  avatar: 'https://foruda.gitee.com/avatar/1745582574310382271/5352827_adnaan_1745582574.png!avatar100', // 头像路径
  slogan: '用代码书写诗意，以技术创造价值',
  github: 'https://github.com/adnaan-worker',
  email: 'adnaan@gmail.com',
  website: 'http://www.adnaan.cn',
  bio: '热爱编程，追求代码的优雅与高效。相信技术能够改变世界，也相信设计能够打动人心。在全栈开发的道路上持续探索，用心创造有温度的产品。',
};

// 技能标签
export const skillTags = [
  { name: 'React', level: 'expert' as const },
  { name: 'TypeScript', level: 'expert' as const },
  { name: 'Node.js', level: 'advanced' as const },
  { name: 'Vue.js', level: 'advanced' as const },
  { name: 'Python', level: 'intermediate' as const },
  { name: 'Docker', level: 'advanced' as const },
  { name: 'MySQL', level: 'advanced' as const },
  { name: 'Redis', level: 'advanced' as const },
  { name: 'Nginx', level: 'intermediate' as const },
  { name: 'AI/ML', level: 'intermediate' as const },
  { name: 'UI/UX', level: 'advanced' as const },
  { name: 'Git', level: 'expert' as const },
];

// 工作/学习经历
export interface ExperienceItem extends TimelineItem {
  company?: string;
  position?: string;
  institution?: string;
  degree?: string;
  description: string;
  achievements?: string[];
  tags?: string[];
  type: 'work' | 'education' | 'project';
}

export const experiences: ExperienceItem[] = [
  {
    id: 'exp-1',
    type: 'work',
    company: 'Tech Company A',
    position: '高级全栈工程师',
    description: '负责公司核心产品的开发与维护，主导多个重要项目的技术选型和架构设计',
    date: '2023-01-01T00:00:00.000Z',
    createdAt: '2023-01-01T00:00:00.000Z',
    achievements: [
      '主导重构核心业务模块，性能提升 60%',
      '搭建前端工程化体系，提升团队开发效率',
      '引入 AI 功能，优化用户体验',
    ],
    tags: ['React', 'Node.js', 'Microservices'],
  },
  {
    id: 'exp-2',
    type: 'work',
    company: 'Startup Company B',
    position: '全栈开发工程师',
    description: '参与产品从 0 到 1 的全流程开发，负责前后端架构设计与实现',
    date: '2021-06-01T00:00:00.000Z',
    createdAt: '2021-06-01T00:00:00.000Z',
    achievements: ['独立完成产品核心功能开发', '优化系统架构，支持高并发场景', '建立 CI/CD 流程，提升发布效率'],
    tags: ['Vue.js', 'Express', 'Docker'],
  },
  {
    id: 'exp-3',
    type: 'education',
    institution: 'University Name',
    degree: '计算机科学与技术 · 本科',
    description: '系统学习计算机基础知识，培养扎实的编程能力和工程素养',
    date: '2017-09-01T00:00:00.000Z',
    createdAt: '2017-09-01T00:00:00.000Z',
    achievements: ['获得国家奖学金', '多次参加编程竞赛获奖', '主导开发多个校园项目'],
    tags: ['算法', '数据结构', '软件工程'],
  },
  {
    id: 'exp-4',
    type: 'project',
    company: '个人项目',
    position: '独立开发者',
    description: '光阴副本博客系统 - 现代化的全栈博客系统',
    date: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    achievements: ['设计并实现完整的博客系统', '集成 AI 功能，提供智能推荐', '性能优化，达到 95+ 评分'],
    tags: ['React', 'Node.js', 'AI', 'Full Stack'],
  },
];

// 项目作品集
export const projects = [
  {
    id: '1',
    title: '光阴副本博客系统',
    description: '现代化的全栈博客系统，支持 Markdown 编辑、AI 功能、实时通信',
    image: '/image1.png',
    tags: ['React', 'Node.js', 'Socket.IO', 'AI'],
    link: 'https://your-blog.com',
    github: 'https://github.com/yourusername/blog',
    featured: true,
  },
  {
    id: '2',
    title: 'UI Component Library',
    description: '轻量级的 React 组件库，专注于诗意简约的设计风格',
    image: '/image2.png',
    tags: ['React', 'TypeScript', 'Storybook'],
    github: 'https://github.com/yourusername/ui-lib',
    featured: true,
  },
  {
    id: '3',
    title: 'Task Management System',
    description: '团队协作工具，支持项目管理、任务分配、进度追踪',
    image: '/image3.png',
    tags: ['Vue.js', 'Express', 'MongoDB'],
    link: 'https://task-system.com',
    featured: false,
  },
  {
    id: '4',
    title: 'E-commerce Platform',
    description: '电商系统，包含商品管理、订单处理、支付集成',
    image: '/image4.png',
    tags: ['React', 'Nest.js', 'PostgreSQL'],
    featured: false,
  },
];

// 联系方式
export const contactInfo = [
  {
    id: '1',
    label: 'Email',
    value: 'your.email@example.com',
  },
  {
    id: '2',
    label: 'GitHub',
    value: '@yourusername',
  },
  {
    id: '3',
    label: 'WeChat',
    value: 'your_wechat_id',
  },
  {
    id: '4',
    label: 'Location',
    value: '中国',
  },
];
