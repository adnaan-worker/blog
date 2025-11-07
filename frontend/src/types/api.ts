/**
 * HTTP 和 API 基础类型定义
 */

/**
 * HTTP 请求方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * 请求配置接口
 */
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
}

/**
 * 后端统一分页信息格式
 */
export interface Pagination {
  page: number; // 当前页码
  limit: number; // 每页条数
  total: number; // 总条数
  totalPages: number; // 总页数
  hasNext: boolean; // 是否有下一页
  hasPrev: boolean; // 是否有上一页
}

/**
 * 后端统一响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    pagination?: Pagination; // 分页响应才有
    [key: string]: any;
  };
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  success: false;
  code: number;
  message: string;
  data: null;
  errors?: any[];
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * 分页请求参数接口
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

/**
 * 分页响应数据（后端统一格式）
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    timestamp: string;
    pagination: Pagination;
    [key: string]: any;
  };
}

/**
 * 分页结果类型别名
 * 注意：分页数据在 response.data 中直接是数组，分页信息在 response.meta.pagination 中
 */
export type PaginationResult<T> = T[];
