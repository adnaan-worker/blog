/**
 * SEO配置文件
 * 集中管理所有SEO相关的配置信息
 */

import { storage } from '@/utils';

// ========== 网站基本信息 ==========

export const SITE_CONFIG = {
  /** 网站名称 */
  name: '光阴副本博客系统',
  /** 网站URL */
  url: 'http://www.adnaan.com',
  /** 网站描述 */
  description: '记录技术成长，分享开发经验，探索编程世界',
  /** 网站关键词 */
  keywords: 'React, TypeScript, Node.js, 前端开发, 后端开发, 技术博客, Web开发',
  /** 作者信息 */
  author: {
    name: 'adnaan',
    email: '1662877157@qq.com',
    url: 'https://gitee.com/adnaan',
  },
  /** 网站Logo */
  logo: '/logo.png',
  /** 默认分享图片 */
  defaultImage: '/logo.png',
  /** 网站主题色 */
  themeColor: '#6366f1',
  /** 语言 */
  language: 'zh-CN',
};

// ========== 页面标题配置 ==========

/** 网站标题模板 */
export const TITLE_TEMPLATE = '%s - 光阴副本博客系统';

/** 默认标题 */
export const DEFAULT_TITLE = '光阴副本博客系统 - 技术博客与学习笔记';

/** 随机诗意标题（用于首页随机显示） */
export const POETIC_TITLES = [
  '星河代码匣 📦｜光阴副本里的技术拾荒集',
  '🌌数字琥珀馆｜光阴副本中的代码考古手记',
  '时光编译机 ⏳｜在光阴副本里敲开技术的年轮',
  '记忆存储栈 📁｜解码光阴副本的科技絮语',
  '像素漂流瓶 🚀｜打捞光阴副本里的技术备忘录',
  '算法时光机 ⏱️｜穿梭光阴副本的技术遗迹探险',
  '字节沙漏站 ⏳｜记录光阴副本的开发碎片集',
  '虚拟灯塔所 ⚓｜在光阴副本中点亮技术星光',
  '数据云影阁 ☁️｜收藏光阴副本的代码剪影',
];

/** 获取随机诗意标题（带缓存，24小时有效） */
export const getRandomPoeticTitle = (): string => {
  try {
    // 检查缓存
    const cached = storage.local.get<string>('poetic_title');
    const cacheTime = storage.local.get<number>('poetic_title_time');

    // 缓存有效期：24小时
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 如果缓存有效，直接返回
    if (cached && cacheTime && now - cacheTime < CACHE_DURATION) {
      return cached;
    }

    // 生成新标题
    const randomIndex = Math.floor(Math.random() * POETIC_TITLES.length);
    const title = POETIC_TITLES[randomIndex];

    // 缓存标题
    storage.local.set('poetic_title', title);
    storage.local.set('poetic_title_time', now);

    return title;
  } catch (error) {
    // storage 不可用时的降级处理
    console.warn('localStorage not available:', error);
    const randomIndex = Math.floor(Math.random() * POETIC_TITLES.length);
    return POETIC_TITLES[randomIndex];
  }
};

// ========== SEO 默认配置 ==========

export const DEFAULT_SEO_CONFIG = {
  title: DEFAULT_TITLE,
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  image: SITE_CONFIG.defaultImage,
  type: 'website' as const,
  index: true,
  follow: true,
};

// ========== 页面专属 SEO 配置 ==========

export const PAGE_SEO_CONFIG = {
  /** 首页 */
  home: {
    title: DEFAULT_TITLE,
    description: '探索代码世界，记录技术成长。包含React、TypeScript、Node.js等前后端技术文章、学习笔记和项目分享。',
    keywords: '光阴副本博客系统, 技术博客, 编程笔记, React教程, TypeScript, Node.js, 全栈开发',
  },

  /** 文章列表 */
  articleList: {
    title: '技术文章',
    description: '探索代码世界，分享技术思考。包含React、TypeScript、Node.js等前后端开发技术文章。',
    keywords: '技术博客, React教程, TypeScript, Node.js, 前端开发, 后端开发',
  },

  /** 手记列表 */
  noteList: {
    title: '技术手记',
    description: '记录技术学习过程中的思考与感悟，分享开发经验和心得体会。',
    keywords: '技术笔记, 学习笔记, 开发心得, 编程感悟',
  },

  /** 项目展示 */
  projectList: {
    title: '项目展示',
    description: '分享个人开发的开源项目和技术实践，包含源码、文档和技术解析。',
    keywords: '开源项目, GitHub, 项目展示, 技术实践, 代码分享',
  },

  /** 个人中心 */
  profile: {
    title: '个人中心',
    description: '管理文章、手记、收藏等个人内容，查看统计数据和活动记录。',
    keywords: '个人中心, 内容管理, 数据统计',
  },

  /** 文章编辑器 */
  articleEditor: {
    title: '撰写文章',
    description: '使用富文本编辑器创作技术文章，支持Markdown、代码高亮、图片上传等功能。',
    keywords: '文章编辑, 富文本编辑器, Markdown, 代码编辑',
  },

  /** 手记编辑器 */
  noteEditor: {
    title: '撰写手记',
    description: '记录技术学习过程，快速记录想法和灵感。',
    keywords: '手记编辑, 笔记编辑, 学习记录',
  },

  /** 404页面 */
  notFound: {
    title: '页面未找到',
    description: '抱歉，您访问的页面不存在。',
    keywords: '',
    index: false,
    follow: false,
  },
};

// ========== Open Graph 配置 ==========

export const OG_CONFIG = {
  siteName: SITE_CONFIG.name,
  locale: SITE_CONFIG.language,
  imageWidth: 1200,
  imageHeight: 630,
};

// ========== Twitter Card 配置 ==========

export const TWITTER_CONFIG = {
  card: 'summary_large_image' as const,
  site: 'http://www.adnaan.com', // 你的Twitter账号
  creator: '@adnaan_blog',
};

// ========== 结构化数据配置 ==========

export const STRUCTURED_DATA_CONFIG = {
  /** 组织信息 */
  organization: {
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    },
    sameAs: [
      'https://github.com/adnaan',
      // 添加其他社交媒体链接
    ],
  },

  /** 作者信息 */
  person: {
    '@type': 'Person',
    name: SITE_CONFIG.author.name,
    url: SITE_CONFIG.author.url,
    email: SITE_CONFIG.author.email,
  },

  /** 网站搜索功能 */
  searchAction: {
    '@type': 'SearchAction',
    target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// ========== Robots 配置 ==========

export const ROBOTS_CONFIG = {
  /** 默认允许索引和跟踪 */
  default: {
    index: true,
    follow: true,
  },
  /** 不允许索引（如编辑页面） */
  noIndex: {
    index: false,
    follow: false,
  },
  /** 允许索引但不跟踪链接 */
  indexNoFollow: {
    index: true,
    follow: false,
  },
};

// ========== 辅助函数 ==========

/**
 * 生成完整的页面标题
 * @param title 页面标题
 * @param useTemplate 是否使用模板（默认true）
 */
export const generatePageTitle = (title: string, useTemplate: boolean = true): string => {
  if (!useTemplate || title.includes(SITE_CONFIG.name)) {
    return title;
  }
  return TITLE_TEMPLATE.replace('%s', title);
};

/**
 * 生成完整的图片URL
 * @param imagePath 图片路径
 */
export const generateImageUrl = (imagePath?: string): string => {
  if (!imagePath) return `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`;
  if (imagePath.startsWith('http')) return imagePath;
  return `${SITE_CONFIG.url}${imagePath}`;
};

/**
 * 生成完整的页面URL
 * @param path 页面路径
 */
export const generatePageUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
};

export default {
  SITE_CONFIG,
  DEFAULT_SEO_CONFIG,
  PAGE_SEO_CONFIG,
  OG_CONFIG,
  TWITTER_CONFIG,
  STRUCTURED_DATA_CONFIG,
  ROBOTS_CONFIG,
};
