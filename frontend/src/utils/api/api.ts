import http from './http';
import type { ApiResponse, PaginationParams, PaginationResult } from '@/types/api';

import type {
  UserInfo,
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
  UserProfile,
  UpdateProfileParams,
  ChangePasswordParams,
  UserActivity,
  UserAchievement,
  UserStats,
  Article,
  ArticleParams,
  Category,
  Tag,
  Comment,
  CommentParams,
  CreateCommentData,
  Note,
  CreateNoteParams,
  UpdateNoteParams,
  NoteParams,
  NoteStats,
  NoteMetadata,
  SiteSettings,
  UpdateSiteSettingsParams,
  Project,
  ProjectParams,
  ContributionChartData,
  AIWritingParams,
  AIGenerateParams,
  AITaskStatus,
  AIQuota,
  AIChatMessage,
} from '@/types/entities';

/**
 * API封装层
 * 所有的API请求都应该在这里定义
 *
 * 注意：
 * - 所有业务实体类型已移至 @/types/entities
 * - API基础类型（ApiResponse、Pagination等）在 @/types/api
 * - 类型导入已在上方完成
 */
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

  // 代理服务相关API（解决CORS跨域问题）
  proxy: {
    /**
     * IP地理位置代理
     * @param ip IP地址（可选，不传则使用请求者IP）
     * @returns Promise<ApiResponse<{success: boolean, city: string, region: string, country: string, latitude: number, longitude: number, timezone: string, location: string}>>
     */
    getIPLocation: (ip?: string) =>
      http.get<{
        success: boolean;
        city: string;
        region: string;
        country: string;
        latitude: number;
        longitude: number;
        timezone: string;
        location: string;
      }>(ip ? `/proxy/ip-location/${ip}` : '/proxy/ip-location'),

    /**
     * 天气API代理（山河天气API）
     * @param city 城市名称
     * @param format 返回类型 (json|text)
     * @returns Promise<ApiResponse<{code: 1, text: "获取成功", data: {...}}>>
     * @description 返回格式：{ code: 1表示成功, text: 状态文本, data: {city, current, living, ...} }
     */
    getWeather: (city: string, format: 'json' | 'text' = 'json') =>
      http.get<any>(`/proxy/weather/${encodeURIComponent(city)}`, { format }),

    /**
     * 音乐URL代理
     * @param server 音乐平台 (tencent|netease|kugou)
     * @param id 歌曲ID
     * @returns Promise<ApiResponse<any>>
     */
    getMusicUrl: (server: 'tencent' | 'netease' | 'kugou' = 'tencent', id: string) =>
      http.get<any>('/proxy/music', { server, id }),

    /**
     * 清除代理缓存
     * @param type 缓存类型 (ip|weather|music|all)
     * @returns Promise<ApiResponse<{success: boolean, deletedCount: number}>>
     */
    clearCache: (type: 'ip' | 'weather' | 'music' | 'all' = 'all') =>
      http.post<{ success: boolean; deletedCount: number }>('/proxy/cache/clear', { type }),
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

    // 获取手记年份列表
    getYears: (): Promise<ApiResponse<Array<{ year: number; count: number }>>> => {
      return http.get('/notes/years');
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

    // 获取年份列表
    getYears: (): Promise<ApiResponse<Array<{ year: number; count: number }>>> => {
      return http.get('/posts/years');
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

  // AI写作助手相关 (基于 LangChain)
  ai: {
    /**
     * 简单聊天
     * @param message 消息内容
     * @returns Promise<ApiResponse<{ message: string; timestamp: string }>>
     */
    chat: (message: string): Promise<ApiResponse<{ message: string; timestamp: string }>> => {
      return http.post('/ai/chat', { message });
    },

    /**
     * 对话聊天（带记忆）
     * @param message 消息内容
     * @returns Promise<ApiResponse<{ message: string; timestamp: string }>>
     */
    conversation: (message: string): Promise<ApiResponse<{ message: string; timestamp: string }>> => {
      return http.post('/ai/conversation', { message });
    },

    /**
     * 生成文章
     * @param params 生成参数
     * @returns Promise<ApiResponse<{ content: string; timestamp: string }>>
     */
    generateArticle: (params: {
      title: string;
      keywords?: string[];
      wordCount?: number;
      style?: string;
    }): Promise<ApiResponse<{ content: string; timestamp: string }>> => {
      return http.post('/ai/generate/article', params);
    },

    // 队列相关 API 已删除，改用 Socket.IO 流式输出
    // 使用 useAIStream Hook 进行流式 AI 交互

    /**
     * 获取用户配额
     * @returns Promise<ApiResponse<AIQuota>>
     */
    getQuota: (): Promise<ApiResponse<AIQuota>> => {
      return http.get('/ai/quota');
    },

    /**
     * 清除对话记忆
     * @returns Promise<ApiResponse<null>>
     */
    clearMemory: (): Promise<ApiResponse<null>> => {
      return http.delete('/ai/memory');
    },

    /**
     * 获取AI服务状态
     * @returns Promise<ApiResponse<{ provider: string; model: string; available: boolean }>>
     */
    getStatus: (): Promise<ApiResponse<{ provider: string; model: string; available: boolean }>> => {
      return http.get('/ai/status');
    },

    /**
     * 获取队列统计
     * @returns Promise<ApiResponse<Record<string, any>>>
     */
    getQueueStats: (): Promise<ApiResponse<Record<string, any>>> => {
      return http.get('/ai/queue/stats');
    },
  },
};

export default API;

/**
 * 类型重新导出（保持向后兼容）
 * 建议：新代码请使用 import type { ... } from '@/types' 导入类型
 */
export type {
  // API 基础类型
  ApiResponse,
  PaginationParams,
  PaginationResult,
  PaginatedApiResponse,
  // 业务实体类型
  UserInfo,
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
  UserProfile,
  UpdateProfileParams,
  ChangePasswordParams,
  UserActivity,
  UserAchievement,
  UserStats,
  Article,
  ArticleParams,
  Category,
  Tag,
  Comment,
  CommentParams,
  CreateCommentData,
  Note,
  CreateNoteParams,
  UpdateNoteParams,
  NoteParams,
  NoteStats,
  NoteMetadata,
  SiteSettings,
  UpdateSiteSettingsParams,
  Project,
  ProjectParams,
  ContributionChartData,
  AIWritingParams,
  AIGenerateParams,
  AITaskStatus,
  AIQuota,
  AIChatMessage,
} from '@/types';
