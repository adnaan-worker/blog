import http from './http';
import { ApiResponse } from './types';

/**
 * API封装层
 * 所有的API请求都应该在这里定义
 */
export const API = {
  // 用户相关
  user: {
    /**
     * 获取用户信息
     */
    getUserInfo: (): Promise<ApiResponse<any>> => {
      return http.get('/user/info');
    },

    /**
     * 用户登录
     * @param data 登录参数
     */
    login: (data: { username: string; password: string }): Promise<ApiResponse<any>> => {
      return http.post('/user/login', data);
    },

    /**
     * 用户登出
     */
    logout: (): Promise<ApiResponse<any>> => {
      return http.post('/user/logout');
    },
  },

  // 博客文章相关
  article: {
    /**
     * 获取文章列表
     * @param params 查询参数
     */
    getArticles: (params?: {
      page?: number;
      pageSize?: number;
      categoryId?: number;
      tag?: string;
    }): Promise<ApiResponse<any>> => {
      return http.get('/articles', params);
    },

    /**
     * 获取文章详情
     * @param id 文章ID
     */
    getArticleDetail: (id: string | number): Promise<ApiResponse<any>> => {
      return http.get(`/articles/${id}`);
    },

    /**
     * 创建文章
     * @param data 文章数据
     */
    createArticle: (data: any): Promise<ApiResponse<any>> => {
      return http.post('/articles', data);
    },

    /**
     * 更新文章
     * @param id 文章ID
     * @param data 文章数据
     */
    updateArticle: (id: string | number, data: any): Promise<ApiResponse<any>> => {
      return http.put(`/articles/${id}`, data);
    },

    /**
     * 删除文章
     * @param id 文章ID
     */
    deleteArticle: (id: string | number): Promise<ApiResponse<any>> => {
      return http.delete(`/articles/${id}`);
    },
  },

  // 分类相关
  category: {
    /**
     * 获取所有分类
     */
    getCategories: (): Promise<ApiResponse<any>> => {
      return http.get('/categories');
    },
  },

  // 标签相关
  tag: {
    /**
     * 获取所有标签
     */
    getTags: (): Promise<ApiResponse<any>> => {
      return http.get('/tags');
    },
  },
};

export default API;
