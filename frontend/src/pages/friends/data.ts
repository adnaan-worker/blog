import { FiGithub, FiGlobe, FiTwitter } from 'react-icons/fi';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  desc: string;
  url: string;
  tags?: string[];
  color?: string; // 主题色
  cover?: string; // 封面图（用于大卡片）
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall'; // Bento布局尺寸
  social?: {
    github?: string;
    twitter?: string;
  };
}

export const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Adnaan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adnaan',
    desc: '热爱技术，热爱生活，全栈开发者。正在构建下一代 Web 应用，探索 AI 与设计的边界。',
    url: 'https://adnaan.cc',
    tags: ['全栈', 'React', 'Node.js'],
    color: '#3B82F6',
    size: 'large',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    social: {
      github: 'https://github.com/adnaan',
    },
  },
  {
    id: '2',
    name: 'Solo Design',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Solo',
    desc: '独立设计工作室，专注于用户体验与界面设计。Less is More.',
    url: 'https://solo.design',
    tags: ['Design', 'Figma', 'Minimal'],
    color: '#EC4899',
    size: 'wide',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    social: {
      twitter: 'https://twitter.com/solo',
    },
  },
  {
    id: '3',
    name: 'Inno Lab',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Inno',
    desc: '探索未知领域，分享 AI 前沿技术。',
    url: 'https://inno.tech',
    tags: ['AI', 'LLM', 'Python'],
    color: '#10B981',
    size: 'medium',
  },
  {
    id: '4',
    name: 'Neko',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neko',
    desc: '前端切图仔，猫咪铲屎官',
    url: 'https://neko.cat',
    tags: ['Vue', 'Cat'],
    color: '#F59E0B',
    size: 'small',
  },
  {
    id: '5',
    name: 'Sky Blog',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sky',
    desc: '仰望星空，脚踏实地。记录生活中的点滴美好。',
    url: 'https://sky.blog',
    tags: ['Life', 'Photo'],
    color: '#6366F1',
    size: 'tall',
    cover: 'https://images.unsplash.com/photo-1519681393798-3828fb409032?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '6',
    name: 'River',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=River',
    desc: '上善若水，水利万物而不争',
    url: 'https://river.io',
    tags: ['Backend', 'Go'],
    color: '#8B5CF6',
    size: 'small',
  },
  {
    id: '7',
    name: 'Tech Daily',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
    desc: '每日技术分享，不负好时光',
    url: 'https://tech.daily',
    tags: ['News', 'Tech'],
    color: '#EF4444',
    size: 'medium',
  },
  {
    id: '8',
    name: 'Pixel Art',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pixel',
    desc: '像素艺术爱好者',
    url: 'https://pixel.art',
    tags: ['Art', 'Pixel'],
    color: '#14B8A6',
    size: 'small',
  },
];

export const POETIC_TITLES = ['相识满天下', '知心能几人', '海内存知己', '天涯若比邻', '君子之交淡如水'];
