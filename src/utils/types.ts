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
 * 扩展自 Axios 的请求配置，添加了自定义属性
 */
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  data?: any; // 请求体数据
  params?: Record<string, any>; // URL 参数
  headers?: Record<string, string>; // 请求头
  timeout?: number; // 超时时间（毫秒）
  withCredentials?: boolean; // 是否携带凭证
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
}

/**
 * 标准 API 响应结构接口
 * @template T 响应数据类型
 */
export interface ApiResponse<T = any> {
  code: number; // 业务状态码
  data: T; // 响应数据
  message: string; // 响应消息
  success: boolean; // 请求是否成功
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  code: number; // 错误码
  message: string; // 错误信息
  data?: any; // 可能的错误详情数据
}

/**
 * 分页请求参数接口
 */
export interface PaginationParams {
  page?: number; // 页码
  pageSize?: number; // 每页条数
  [key: string]: any; // 其他可能的查询参数
}

/**
 * 分页响应数据接口
 * @template T 列表项数据类型
 */
export interface PaginationResult<T = any> {
  list: T[]; // 数据列表
  total: number; // 总条数
  page: number; // 当前页码
  pageSize: number; // 每页条数
  totalPages: number; // 总页数
}
