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
  userInfo: UserInfo;
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
  nickname?: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  lastLoginTime?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    weibo?: string;
    zhihu?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'zh-CN' | 'en-US';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
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
  nickname?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    weibo?: string;
    zhihu?: string;
  };
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserActivity {
  id: string | number;
  type: 'article_published' | 'like_received' | 'comment_received' | 'follow_received' | 'achievement_unlocked';
  title: string;
  description?: string;
  timestamp: string;
  link?: string;
  metadata?: any;
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
  description?: string;
  count?: number;
}

/**
 * 标签相关接口类型定义
 */
export interface Tag {
  id: number;
  name: string;
  count?: number;
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
  parentId?: string | number;
}

export interface CreateCommentData {
  content: string;
  postId: string | number;
  parentId?: string | number;
}

/**
 * API封装层
 * 所有的API请求都应该在这里定义
 */
export const API = {
  // 用户相关API
  user: {
    // 认证相关
    login: (data: LoginParams) => http.post<LoginResponse>('/users/login', data),
    register: (data: RegisterParams) => http.post<RegisterResponse>('/users/register', data),
    logout: () => http.post('/users/logout'),

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
    getActivities: (params?: { page?: number; pageSize?: number }) =>
      http.get<UserActivity[]>('/users/activities', params),
    getAchievements: () => http.get<UserAchievement[]>('/users/achievements'),
    getStats: () => http.get<UserStats>('/users/stats'),

    // 用户偏好设置
    updatePreferences: (data: Partial<UserProfile['preferences']>) => http.put('/users/preferences', data),

    // 数据管理
    exportData: () => http.post('/users/export'),
    deleteAccount: (data: { password: string }) => http.delete('/users/account', { data }),

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
  },

  // 博客文章相关
  article: {
    /**
     * 获取文章列表
     * @param params 查询参数
     * @returns Promise<ApiResponse<PaginationResult<Article>>>
     */
    getArticles: (params?: ArticleParams): Promise<ApiResponse<PaginationResult<Article>>> => {
      return http.get('/posts/page', params);
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
  },

  // 分类相关
  category: {
    /**
     * 获取所有分类
     * @returns Promise<ApiResponse<Category[]>>
     */
    getCategories: (): Promise<ApiResponse<Category[]>> => {
      return http.get('/categories');
    },
  },

  // 标签相关
  tag: {
    /**
     * 获取所有标签
     * @returns Promise<ApiResponse<Tag[]>>
     */
    getTags: (): Promise<ApiResponse<Tag[]>> => {
      return http.get('/tags');
    },
  },

  // 评论相关
  comment: {
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
      return http.get(`/posts/${postId}/comments`, params);
    },

    /**
     * 获取评论详情
     * @param id 评论ID
     * @returns Promise<ApiResponse<Comment>>
     */
    getCommentDetail: (id: string | number): Promise<ApiResponse<Comment>> => {
      return http.get(`/comments/${id}`);
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
};

export default API;
