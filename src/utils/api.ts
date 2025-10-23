import http from './http';
import { ApiResponse, PaginationParams, PaginationResult } from './types';

/**
 * 用户相关接口类型定义
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
 * 个人中心相关接口类型定义
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

/**
 * 网站设置相关接口类型定义（介绍卡片 + 社交链接）
 */
export interface SiteSettings {
  id?: number;
  userId?: number;
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
  // GitHub 和 Gitee 用户名（用于贡献统计）
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
  // GitHub 和 Gitee 用户名（用于贡献统计）
  githubUsername?: string;
  giteeUsername?: string;
}

export interface UserActivity {
  id: string | number;
  type: // 内容创建类
  | 'post_created'
    | 'post_updated'
    | 'post_deleted'
    | 'note_created'
    | 'note_updated'
    | 'note_deleted'
    | 'comment_created'
    | 'comment_updated'
    | 'comment_deleted'
    // 互动类
    | 'post_liked'
    | 'post_unliked'
    | 'note_liked'
    | 'note_unliked'
    | 'post_bookmarked'
    | 'post_unbookmarked'
    // 收到反馈类
    | 'like_received'
    | 'comment_received'
    | 'bookmark_received'
    // 成就类
    | 'achievement_unlocked'
    | 'level_up'
    | 'milestone_reached'
    // 审核类
    | 'post_approved'
    | 'post_rejected'
    | 'comment_approved'
    | 'comment_rejected'
    // 系统通知类
    | 'system_notice'
    | 'account_warning'
    | 'welcome'
    // 热门趋势类
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
  icon?: React.ReactNode;
  highlight?: boolean;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  link?: string;
}

/**
 * 文章相关接口类型定义
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
  [key: string]: any;
}

export interface ArticleParams extends PaginationParams {
  categoryId?: number;
  tag?: string;
  keyword?: string;
  authorId?: string | number;
}

/**
 * 分类相关接口类型定义
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
 * 标签相关接口类型定义
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
 * 评论相关接口类型定义
 */
export interface Comment {
  id: string | number;
  content: string;
  postId: string | number;
  parentId?: string | number;
  userId?: string | number;
  author?: string | UserInfo;
  status?: 'approved' | 'pending' | 'spam';
  createTime?: string;
  updateTime?: string;
  replies?: Comment[];
  [key: string]: any;
}

export interface CommentParams extends PaginationParams {
  postId?: string | number;
  status?: 'approved' | 'pending' | 'spam';
}

/**
 * 手记相关接口类型定义
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

export interface CreateCommentData {
  content: string;
  postId: string | number;
  parentId?: string | number;
}

/**
 * AI写作助手相关接口类型定义
 */
export interface AIWritingParams {
  action: 'generate' | 'improve' | 'translate' | 'summarize' | 'expand' | 'polish';
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
 * API封装层
 * 所有的API请求都应该在这里定义
 */
// 项目相关类型
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
}

// 贡献统计数据类型
export interface ContributionChartData {
  month: string;
  count: number;
  color: string;
}

export const API = {
  // 活动相关（公开接口）
  activity: {
    // 获取全站最新活动（无需登录）
    getRecentActivities: (params?: PaginationParams & { type?: string }) =>
      http.get<UserActivity[]>('/activities/recent', params),
  },

  // 贡献统计相关API（公开接口）
  contribution: {
    // 获取 GitHub + Gitee 贡献统计
    getContributions: (params?: { githubUsername?: string; giteeUsername?: string }) =>
      http.get<ContributionChartData[]>('/contributions', params),
  },

  // 项目相关API
  project: {
    // 获取项目列表
    getProjects: (params?: ProjectParams) => http.get<Project[]>('/projects', params),
    // 获取项目详情
    getProjectDetail: (id: string | number) => http.get<Project>(`/projects/${id}`),
    // 获取精选项目（支持分页）
    getFeaturedProjects: (params?: { page?: number; limit?: number }) =>
      http.get<Project[]>('/projects/featured', params),
    // 获取项目统计
    getProjectStats: () =>
      http.get<{
        total: number;
        active: number;
        developing: number;
        featured: number;
        languages: Array<{ language: string; count: number }>;
      }>('/projects/stats'),
    // 创建项目（管理员）
    createProject: (data: Partial<Project>) => http.post<Project>('/projects', data),
    // 更新项目（管理员）
    updateProject: (id: number, data: Partial<Project>) => http.put<Project>(`/projects/${id}`, data),
    // 删除项目（管理员）
    deleteProject: (id: number) => http.delete(`/projects/${id}`),
  },

  // 用户相关API
  user: {
    // 认证相关
    login: (data: LoginParams) => http.post<LoginResponse>('/auth/login', data),
    register: (data: RegisterParams) => http.post<RegisterResponse>('/auth/register', data),
    logout: () => http.post('/auth/logout'),

    // 用户中心相关
    getProfile: () => http.get<UserProfile>('/users/profile'),
    updateProfile: (data: UpdateProfileParams) => http.put<UserProfile>('/users/profile', data),
    changePassword: (data: ChangePasswordParams) => http.put('/users/password', data),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return http.upload('/users/avatar', formData);
    },

    // 用户活动、成就、统计
    getActivities: (params?: { page?: number; limit?: number }) =>
      http.get<UserActivity[]>('/users/activities', params),
    getAchievements: () => http.get<UserAchievement[]>('/users/achievements'),
    getStats: () => http.get<UserStats>('/users/stats'),

    // 数据管理
    exportData: () => http.post('/users/export'),
    deleteAccount: (data: { password: string }) => http.delete('/users/account', { data }),

    // 仪表盘数据
    getPublishTrend: () => http.get<{ month: string; value: number }[]>('/users/publish-trend'),
    getAdminTodoItems: () =>
      http.get<{ id: string; title: string; count: number; type: string }[]>('/users/todo-items'),

    // 文件上传
    batchUpload: (files: File[], type?: string, maxCount?: number) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      return http.upload('/users/upload', formData, {
        params: { type, maxCount },
      });
    },
    deleteFile: (filePath: string) =>
      http.delete('/users/file', {
        data: { filePath },
      }),
    getUploadStats: (uploadDir?: string) => http.get('/users/upload-stats', { uploadDir }),

    // 用户管理（管理员）
    getAllUsers: (params?: { page?: number; limit?: number; search?: string }) =>
      http.get<PaginationResult<UserProfile>>('/users', params),
    getUserById: (id: string | number) => http.get<UserProfile>(`/users/${id}`),
    createUser: (data: {
      username: string;
      email: string;
      password: string;
      fullName?: string;
      role?: 'user' | 'admin';
      status?: 'active' | 'inactive' | 'banned';
    }) => http.post<UserProfile>('/users', data),
    updateUser: (
      id: string | number,
      data: {
        username?: string;
        email?: string;
        fullName?: string;
        role?: 'user' | 'admin';
        status?: 'active' | 'inactive' | 'banned';
      },
    ) => http.put<UserProfile>(`/users/${id}`, data),
    deleteUser: (id: string | number) => http.delete(`/users/${id}`),
  },

  // 手记相关
  note: {
    /**
     * 获取公开手记列表（前台展示）
     * 返回所有公开手记，不需要登录
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Note>>>
     */
    getNotes: (params?: NoteParams): Promise<ApiResponse<PaginationResult<Note>>> => {
      return http.get('/notes', params);
    },

    /**
     * 获取我的手记列表（个人中心管理）
     * 普通用户：返回自己的所有手记（包括私密）
     * 管理员：返回所有手记
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Note>>>
     */
    getMyNotes: (params?: NoteParams): Promise<ApiResponse<PaginationResult<Note>>> => {
      return http.get('/notes/my', params);
    },

    /**
     * 获取手记详情
     * @param id 手记ID
     * @returns Promise<ApiResponse<Note>>
     */
    getNoteDetail: (id: string | number): Promise<ApiResponse<Note & { relatedNotes?: Note[] }>> => {
      return http.get(`/notes/${id}`);
    },

    /**
     * 创建手记
     * @param data 手记数据
     * @returns Promise<ApiResponse<Note>>
     */
    createNote: (data: CreateNoteParams): Promise<ApiResponse<Note>> => {
      return http.post('/notes', data);
    },

    /**
     * 更新手记
     * @param id 手记ID
     * @param data 手记数据
     * @returns Promise<ApiResponse<Note>>
     */
    updateNote: (id: string | number, data: UpdateNoteParams): Promise<ApiResponse<Note>> => {
      return http.put(`/notes/${id}`, data);
    },

    /**
     * 删除手记
     * @param id 手记ID
     * @returns Promise<ApiResponse<null>>
     */
    deleteNote: (id: string | number): Promise<ApiResponse<null>> => {
      return http.delete(`/notes/${id}`);
    },

    /**
     * 切换手记点赞状态
     * @param id 手记ID
     * @returns Promise<ApiResponse<{ liked: boolean; likeCount: number }>>
     */
    toggleLike: (id: string | number): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
      return http.post(`/notes/${id}/like`);
    },

    /**
     * 获取手记统计
     * @returns Promise<ApiResponse<NoteStats>>
     */
    getStats: (): Promise<ApiResponse<NoteStats>> => {
      return http.get('/notes/stats');
    },

    /**
     * 获取手记元数据
     * @returns Promise<ApiResponse<NoteMetadata>>
     */
    getMetadata: (): Promise<ApiResponse<NoteMetadata>> => {
      return http.get('/notes/metadata');
    },

    /**
     * 获取用户手记点赞列表
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<any>>>
     */
    getUserLikes: (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<ApiResponse<PaginationResult<any>>> => {
      return http.get('/notes/user/likes', params);
    },
  },

  // 博客文章相关
  article: {
    /**
     * 获取公开文章列表（前台展示）
     * 返回所有已发布且审核通过的文章
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Article>>>
     */
    getArticles: (params?: ArticleParams): Promise<ApiResponse<PaginationResult<Article>>> => {
      return http.get('/posts', params);
    },

    /**
     * 获取我的文章列表（个人中心管理）
     * 普通用户：返回自己的所有文章
     * 管理员：返回所有文章（支持状态筛选）
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Article>>>
     */
    getMyArticles: (params?: ArticleParams): Promise<ApiResponse<PaginationResult<Article>>> => {
      return http.get('/posts/my', params);
    },

    /**
     * 获取文章详情
     * @param id 文章ID
     * @returns Promise<ApiResponse<Article>>
     */
    getArticleDetail: (id: string | number): Promise<ApiResponse<Article>> => {
      return http.get(`/posts/${id}`);
    },

    /**
     * 创建文章
     * @param data 文章数据
     * @returns Promise<ApiResponse<Article>>
     */
    createArticle: (data: Omit<Article, 'id'>): Promise<ApiResponse<Article>> => {
      return http.post('/posts', data);
    },

    /**
     * 更新文章
     * @param id 文章ID
     * @param data 文章数据
     * @returns Promise<ApiResponse<Article>>
     */
    updateArticle: (id: string | number, data: Partial<Article>): Promise<ApiResponse<Article>> => {
      return http.put(`/posts/${id}`, data);
    },

    /**
     * 删除文章
     * @param id 文章ID
     * @returns Promise<ApiResponse<null>>
     */
    deleteArticle: (id: string | number): Promise<ApiResponse<null>> => {
      return http.delete(`/posts/${id}`);
    },

    /**
     * 切换文章点赞状态
     * @param id 文章ID
     * @returns Promise<ApiResponse<{ liked: boolean; likeCount: number }>>
     */
    toggleLike: (id: string | number): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
      return http.post(`/posts/${id}/like`);
    },

    /**
     * 切换文章收藏状态
     * @param id 文章ID
     * @returns Promise<ApiResponse<{ bookmarked: boolean }>>
     */
    toggleBookmark: (id: string | number): Promise<ApiResponse<{ bookmarked: boolean }>> => {
      return http.post(`/posts/${id}/bookmark`);
    },

    /**
     * 获取用户对文章的点赞和收藏状态
     * @param id 文章ID
     * @returns Promise<ApiResponse<{ liked: boolean; bookmarked: boolean; likeCount: number }>>
     */
    getUserStatus: (
      id: string | number,
    ): Promise<ApiResponse<{ liked: boolean; bookmarked: boolean; likeCount: number }>> => {
      return http.get(`/posts/${id}/status`);
    },

    /**
     * 获取用户收藏列表
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Bookmark>>>
     */
    getUserBookmarks: (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<ApiResponse<PaginationResult<any>>> => {
      return http.get('/posts/user/bookmarks', params);
    },

    /**
     * 获取用户点赞列表
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Like>>>
     */
    getUserLikes: (params?: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<ApiResponse<PaginationResult<any>>> => {
      return http.get('/posts/user/likes', params);
    },
  },

  // 分类相关
  category: {
    /**
     * 获取所有分类
     * @returns Promise<ApiResponse<Category[]>>
     */
    getCategories: (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Category[]>> => {
      return http.get('/categories', params);
    },

    /**
     * 创建分类（管理员）
     * @param data 分类数据
     * @returns Promise<ApiResponse<Category>>
     */
    createCategory: (data: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
      return http.post('/categories', data);
    },

    /**
     * 更新分类（管理员）
     * @param id 分类ID
     * @param data 分类数据
     * @returns Promise<ApiResponse<Category>>
     */
    updateCategory: (id: number, data: { name?: string; description?: string }): Promise<ApiResponse<Category>> => {
      return http.put(`/categories/${id}`, data);
    },

    /**
     * 删除分类（管理员）
     * @param id 分类ID
     * @returns Promise<ApiResponse<null>>
     */
    deleteCategory: (id: number): Promise<ApiResponse<null>> => {
      return http.delete(`/categories/${id}`);
    },
  },

  // 标签相关
  tag: {
    /**
     * 获取所有标签
     * @returns Promise<ApiResponse<Tag[]>>
     */
    getTags: (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Tag[]>> => {
      return http.get('/tags', params);
    },

    /**
     * 创建标签（管理员）
     * @param data 标签数据
     * @returns Promise<ApiResponse<Tag>>
     */
    createTag: (data: { name: string; description?: string }): Promise<ApiResponse<Tag>> => {
      return http.post('/tags', data);
    },

    /**
     * 更新标签（管理员）
     * @param id 标签ID
     * @param data 标签数据
     * @returns Promise<ApiResponse<Tag>>
     */
    updateTag: (id: number, data: { name?: string; description?: string }): Promise<ApiResponse<Tag>> => {
      return http.put(`/tags/${id}`, data);
    },

    /**
     * 删除标签（管理员）
     * @param id 标签ID
     * @returns Promise<ApiResponse<null>>
     */
    deleteTag: (id: number): Promise<ApiResponse<null>> => {
      return http.delete(`/tags/${id}`);
    },
  },

  // 评论相关
  comment: {
    /**
     * 获取评论列表（统一接口）
     * 管理员：返回所有评论
     * 普通用户：返回自己的评论
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Comment>>>
     */
    getUserComments: (params?: CommentParams): Promise<ApiResponse<PaginationResult<Comment>>> => {
      return http.get('/comments', params);
    },

    /**
     * 获取文章的所有评论
     * @param postId 文章ID
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Comment>>>
     */
    getCommentsByPost: (
      postId: string | number,
      params?: CommentParams,
    ): Promise<ApiResponse<PaginationResult<Comment>>> => {
      return http.get(`/comments/${postId}`, params);
    },

    /**
     * 获取评论详情
     * @param id 评论ID
     * @returns Promise<ApiResponse<Comment>>
     */
    getCommentDetail: (id: string | number): Promise<ApiResponse<Comment>> => {
      return http.get(`/comments/${id}/detail`);
    },

    /**
     * 创建评论
     * @param data 评论数据
     * @returns Promise<ApiResponse<Comment>>
     */
    createComment: (data: CreateCommentData): Promise<ApiResponse<Comment>> => {
      return http.post('/comments', data);
    },

    /**
     * 删除评论
     * @param id 评论ID
     * @returns Promise<ApiResponse<null>>
     */
    deleteComment: (id: string | number): Promise<ApiResponse<null>> => {
      return http.delete(`/comments/${id}`);
    },

    /**
     * 更新评论状态（管理员）
     * @param id 评论ID
     * @param status 评论状态
     * @returns Promise<ApiResponse<Comment>>
     */
    updateCommentStatus: (
      id: string | number,
      status: 'approved' | 'pending' | 'spam',
    ): Promise<ApiResponse<Comment>> => {
      return http.patch(`/comments/${id}/status`, { status });
    },
  },

  // 网站设置相关
  siteSettings: {
    /**
     * 获取网站设置（公开）
     * @returns Promise<ApiResponse<SiteSettings>>
     */
    getSiteSettings: (): Promise<ApiResponse<SiteSettings>> => {
      return http.get('/site-settings');
    },

    /**
     * 更新网站设置（仅管理员）
     * @param data 网站设置数据
     * @returns Promise<ApiResponse<SiteSettings>>
     */
    updateSiteSettings: (data: UpdateSiteSettingsParams): Promise<ApiResponse<SiteSettings>> => {
      return http.put('/site-settings', data);
    },
  },

  // AI写作助手相关
  ai: {
    /**
     * 简单聊天
     * @param message 消息内容
     * @param sessionId 会话ID
     * @returns Promise<ApiResponse<{ message: string; sessionId: string; timestamp: string }>>
     */
    chat: (
      message: string,
      sessionId?: string,
    ): Promise<ApiResponse<{ message: string; sessionId: string; timestamp: string }>> => {
      return http.post('/ai/chat', { message, sessionId });
    },

    /**
     * 流式聊天
     * @param message 消息内容
     * @param sessionId 会话ID
     * @param onChunk 流式数据回调
     * @returns Promise<string>
     */
    streamChat: async (message: string, sessionId?: string, onChunk?: (chunk: string) => void): Promise<string> => {
      return await http.streamPost('/ai/stream-chat', { message, sessionId }, onChunk);
    },

    /**
     * 内容生成
     * @param params 生成参数
     * @returns Promise<ApiResponse<{ type: string; content: string; timestamp: string }>>
     */
    generate: (
      params: AIGenerateParams,
    ): Promise<ApiResponse<{ type: string; content: string; timestamp: string }>> => {
      return http.post('/ai/generate', params);
    },

    /**
     * 智能写作助手（异步）
     * @param params 写作助手参数
     * @returns Promise<ApiResponse<{ taskId: string; status: string; message: string }>>
     */
    writingAssistant: (
      params: AIWritingParams,
    ): Promise<ApiResponse<{ taskId: string; status: string; message: string }>> => {
      return http.post('/ai/writing-assistant', params);
    },

    /**
     * 批量内容生成（异步）
     * @param tasks 任务列表
     * @returns Promise<ApiResponse<{ taskId: string; status: string; message: string }>>
     */
    batchGenerate: (
      tasks: AIGenerateParams[],
    ): Promise<ApiResponse<{ taskId: string; status: string; message: string }>> => {
      return http.post('/ai/batch-generate', { tasks });
    },

    /**
     * 获取任务状态
     * @param taskId 任务ID
     * @returns Promise<ApiResponse<AITaskStatus>>
     */
    getTaskStatus: (taskId: string): Promise<ApiResponse<AITaskStatus>> => {
      return http.get(`/ai/task/${taskId}`);
    },

    /**
     * 获取用户任务列表
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<AITaskStatus>>>
     */
    getUserTasks: (params?: {
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<PaginationResult<AITaskStatus>>> => {
      return http.get('/ai/tasks', params);
    },

    /**
     * 获取用户配额
     * @returns Promise<ApiResponse<AIQuota>>
     */
    getQuota: (): Promise<ApiResponse<AIQuota>> => {
      return http.get('/ai/quota');
    },

    /**
     * 获取聊天历史
     * @returns Promise<ApiResponse<{ history: AIChatMessage[]; count: number }>>
     */
    getChatHistory: (): Promise<ApiResponse<{ history: AIChatMessage[]; count: number }>> => {
      return http.get('/ai/history');
    },

    /**
     * 清除聊天历史
     * @returns Promise<ApiResponse<null>>
     */
    clearChatHistory: (): Promise<ApiResponse<null>> => {
      return http.delete('/ai/history');
    },

    /**
     * 获取AI服务状态
     * @returns Promise<ApiResponse<{ provider: string; available: boolean; timestamp: string }>>
     */
    getStatus: (): Promise<ApiResponse<{ provider: string; available: boolean; timestamp: string }>> => {
      return http.get('/ai/status');
    },

    /**
     * 删除AI任务
     * @param taskId 任务ID
     * @returns Promise<ApiResponse<null>>
     */
    deleteTask: (taskId: string): Promise<ApiResponse<null>> => {
      return http.delete(`/ai/task/${taskId}`);
    },
  },
};

export default API;
