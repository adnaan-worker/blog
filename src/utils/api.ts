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
  // 用户相关
  user: {
    /**
     * 获取用户信息
     * @returns Promise<ApiResponse<UserInfo>>
     */
    getUserInfo: (): Promise<ApiResponse<UserInfo>> => {
      return http.get('/user/info');
    },

    /**
     * 用户登录
     * @param data 登录参数
     * @returns Promise<ApiResponse<{token: string; userInfo: UserInfo}>>
     */
    login: (data: LoginParams): Promise<ApiResponse<{ token: string; userInfo: UserInfo }>> => {
      return http.post('/auth/login', data);
    },

    /**
     * 用户登出
     * @returns Promise<ApiResponse<null>>
     */
    logout: (): Promise<ApiResponse<null>> => {
      return http.post('/auth/logout');
    },
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
