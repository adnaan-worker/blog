/**
 * 业务实体类型定义
 * 包含用户、文章、手记、评论等业务相关的类型
 */

import { PaginationParams } from './api';

/**
 * 用户相关类型
 */
export interface UserInfo {
  id: string | number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  user: UserInfo;
}

/**
 * 个人中心相关类型
 */
export interface UserProfile {
  id: string | number;
  username: string;
  fullName?: string; // 对应数据库的 full_name 字段
  email: string;
  avatar?: string;
  bio?: string;
  role?: string;
  status?: string;
  joinDate: string;
  lastLoginTime?: string;
  stats?: {
    articleCount: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    followerCount: number;
    followingCount: number;
    bookmarkCount: number;
  };
}

export interface UpdateProfileParams {
  fullName?: string; // 对应数据库的 full_name 字段
  email?: string;
  bio?: string;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserActivity {
  id: string | number;
  type:
    | 'post_created'
    | 'post_updated'
    | 'post_deleted'
    | 'note_created'
    | 'note_updated'
    | 'note_deleted'
    | 'comment_created'
    | 'comment_updated'
    | 'comment_deleted'
    | 'post_liked'
    | 'post_unliked'
    | 'note_liked'
    | 'note_unliked'
    | 'post_bookmarked'
    | 'post_unbookmarked'
    | 'like_received'
    | 'comment_received'
    | 'bookmark_received'
    | 'achievement_unlocked'
    | 'level_up'
    | 'milestone_reached'
    | 'post_approved'
    | 'post_rejected'
    | 'comment_approved'
    | 'comment_rejected'
    | 'system_notice'
    | 'account_warning'
    | 'welcome'
    | 'post_trending'
    | 'post_featured';
  title: string;
  description?: string;
  timestamp: string;
  link?: string;
  metadata?: any;
  priority?: number;
  user?: {
    id: string | number;
    username: string;
    avatar?: string;
  };
}

export interface UserAchievement {
  id: string | number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
  category: 'content' | 'social' | 'engagement' | 'milestone';
}

export interface UserStats {
  [x: string]: any;
  label: string;
  value: string | number;
  // 注意：icon 字段已在组件特定的 types.ts 中定义，这里移除以避免 React 依赖
  highlight?: boolean;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  link?: string;
}

/**
 * 文章相关类型
 */
export interface Article {
  id: string | number;
  title: string;
  content: string;
  summary?: string;
  cover?: string;
  categoryId?: number;
  tags?: string[];
  author?: string | UserInfo;
  createTime?: string;
  updateTime?: string;
  viewCount?: number;
  lastReadAt?: string; // 最后阅读时间，用于显示"X分钟前阅读"
  [key: string]: any;
}

export interface ArticleParams extends PaginationParams {
  categoryId?: number;
  tag?: string;
  keyword?: string;
  authorId?: string | number;
  year?: number; // 按年份筛选
}

/**
 * 分类相关类型
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 标签相关类型
 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  count?: number;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 评论相关类型
 */
export interface Comment {
  id: string | number;
  content: string;
  targetType: 'post' | 'note' | 'project';
  targetId: string | number;
  parentId?: string | number;
  userId?: string | number;
  author?: UserInfo; // 用户信息对象（包含username, avatar, role等）
  status?: 'approved' | 'pending' | 'spam';
  createdAt?: string; // 数据库时间戳
  updatedAt?: string; // 数据库时间戳
  createTime?: string; // 兼容旧字段
  updateTime?: string; // 兼容旧字段
  replies?: Comment[]; // 回复列表
  // 访客评论字段
  isGuest?: boolean;
  guestName?: string;
  guestEmail?: string;
  guestWebsite?: string;
  // 访客信息
  ip?: string;
  userAgent?: string;
  location?: string;
  browser?: string;
  os?: string;
  device?: 'Desktop' | 'Mobile' | 'Tablet';
}

export interface CommentParams extends PaginationParams {
  targetType?: 'post' | 'note' | 'project';
  targetId?: string | number;
  status?: 'approved' | 'pending' | 'spam';
}

export interface CreateCommentData {
  content: string;
  targetType: 'post' | 'note' | 'project';
  targetId: string | number;
  parentId?: string | number;
  // 访客评论字段（未登录时必填）
  guestName?: string;
  guestEmail?: string;
  guestWebsite?: string;
}

/**
 * 留言板相关类型
 * 与后端 guestbook_messages 表结构对齐
 */
export interface GuestbookMessage {
  id: number;
  content: string;
  userId?: number | null;
  user?: UserInfo;
  isGuest?: boolean;
  guestName?: string;
  guestEmail?: string;
  guestWebsite?: string;
  status?: 'approved' | 'pending' | 'spam';
  isPinned?: boolean;
  replyContent?: string | null;
  replyUserId?: number | null;
  replyAt?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  location?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: 'Desktop' | 'Mobile' | 'Tablet' | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestbookMessageParams extends PaginationParams {
  status?: 'approved' | 'pending' | 'spam';
}

export interface CreateGuestbookMessageData {
  content: string;
  // 访客留言字段（未登录时使用）
  guestName?: string;
  guestEmail?: string;
  guestWebsite?: string;
}

/**
 * 手记相关类型
 */
export interface Note {
  id: string | number;
  title?: string;
  content: string;
  mood?: '开心' | '平静' | '思考' | '感慨' | '兴奋' | '忧郁' | '愤怒' | '恐惧' | '惊讶' | '厌恶';
  weather?: string;
  location?: string;
  tags?: string[];
  isPrivate?: boolean;
  readingTime?: number;
  viewCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  lastReadAt?: string; // 最后阅读时间，用于显示"X分钟前阅读"
  author?: {
    id: string | number;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteParams {
  title?: string;
  content: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
  isPrivate?: boolean;
}

export interface UpdateNoteParams {
  title?: string;
  content?: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
  isPrivate?: boolean;
}

export interface NoteParams extends PaginationParams {
  mood?: string;
  weather?: string;
  tags?: string[];
  search?: string;
  isPrivate?: boolean;
  userId?: string | number;
  year?: number; // 按年份筛选
  orderBy?: 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount';
  orderDirection?: 'ASC' | 'DESC';
}

export interface NoteStats {
  totalNotes: number;
  totalViews: number;
  totalLikes: number;
  privateNotes: number;
  publicNotes: number;
  moodDistribution: Record<string, number>;
}

export interface NoteMetadata {
  commonTags: string[];
  commonMoods: string[];
  commonWeathers: string[];
  commonLocations: string[];
  moodOptions: string[];
  parentId?: string | number;
}

/**
 * 网站设置相关类型
 */
export interface SiteSettings {
  id?: number;
  userId?: number;
  authorName?: string;
  authorTitle?: string;
  authorBio?: string;
  avatar?: string;
  mbti?: string;
  location?: string;
  occupation?: string;
  skills?: string[];
  socialLinks?: {
    email?: string;
    github?: string;
    bilibili?: string;
    twitter?: string;
    rss?: string;
  };
  quote?: string;
  quoteAuthor?: string;
  githubUsername?: string;
  giteeUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSiteSettingsParams {
  authorName?: string;
  authorTitle?: string;
  authorBio?: string;
  mbti?: string;
  location?: string;
  occupation?: string;
  skills?: string[];
  socialLinks?: {
    email?: string;
    github?: string;
    bilibili?: string;
    twitter?: string;
    rss?: string;
  };
  quote?: string;
  quoteAuthor?: string;
  githubUsername?: string;
  giteeUsername?: string;
}

/**
 * 友情链接相关类型
 */
export interface FriendLink {
  id: number;
  name: string;
  url: string;
  description?: string;
  avatar?: string;
  themeColor?: string | null;
  tags?: string[] | null;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  isFeatured: boolean;
  order: number;
  ownerName?: string | null;
  ownerEmail?: string | null;
  applyUserId?: number | null;
  clickCount: number;
  lastClickAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FriendLinkParams extends PaginationParams {
  status?: 'pending' | 'approved' | 'rejected' | 'blocked';
  search?: string;
}

export interface FriendLinkApplyData {
  name: string;
  url: string;
  description?: string;
  avatar?: string;
}

/**
 * 项目相关类型
 */
export interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
  status: 'active' | 'archived' | 'developing' | 'paused';
  visibility: 'public' | 'private';
  language?: string;
  languageColor?: string;
  tags: string[];
  techStack: string[];
  features: string[];
  githubUrl?: string;
  giteeUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  npmPackage?: string;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  downloads: number;
  isFeatured: boolean;
  isOpenSource: boolean;
  displayOrder: number;
  authorId: number;
  viewCount: number;
  startedAt?: string;
  lastUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    username: string;
    fullName?: string;
    avatar?: string;
  };
}

export interface ProjectParams extends PaginationParams {
  status?: 'active' | 'archived' | 'developing' | 'paused';
  isFeatured?: boolean;
  isOpenSource?: boolean;
  language?: string;
  keyword?: string;
  includePrivate?: boolean;
}

/**
 * 贡献统计相关类型
 */
export interface ContributionChartData {
  month: string;
  count: number;
  color: string;
}

/**
 * AI 相关类型
 */
export interface AIWritingParams {
  action: 'generate' | 'improve' | 'translate' | 'summarize' | 'expand' | 'polish' | 'continue' | 'rewrite';
  content?: string;
  params?: {
    targetLang?: string;
    style?: string;
    tone?: string;
    length?: 'short' | 'medium' | 'long';
    keywords?: string[];
    prompt?: string;
  };
}

export interface AIGenerateParams {
  type: 'article' | 'note' | 'title' | 'summary' | 'outline';
  params: {
    title?: string;
    keywords?: string[];
    wordCount?: number;
    style?: string;
    tone?: string;
    prompt?: string;
  };
}

export interface AITaskStatus {
  taskId: string;
  userId?: number;
  type: 'generate_content' | 'batch_generate' | 'analyze' | 'writing_assistant';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AIQuota {
  dailyChatlimit: number;
  dailyChatUsed: number;
  dailyGeneratelimit: number;
  dailyGenerateUsed: number;
  monthlyTokenlimit: number;
  monthlyTokenUsed: number;
  available: boolean;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

/**
 * 仪表盘统一数据类型
 */
export interface DashboardTodoItem {
  id: string;
  title: string;
  count: number;
  type?: string;
  priority?: 'high' | 'medium' | 'low';
  action?: string;
}

export interface DashboardData {
  user: UserProfile;
  stats: UserStats[];
  publishTrend: Array<{ month: string; value: number }>;
  activities: UserActivity[];
  achievements: UserAchievement[];
  categoryStats: Array<{ name: string; value: number }>;
  recentProjects: Project[];
  todoItems: DashboardTodoItem[];
}
