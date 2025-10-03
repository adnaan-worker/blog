import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HttpMethod, RequestConfig, ApiResponse, ErrorResponse } from './types';
import config from './config';
import { storage } from './index';

class HttpRequest {
  private instance: AxiosInstance;
  private baseConfig: AxiosRequestConfig;

  constructor(axiosConfig: AxiosRequestConfig = {}) {
    // 基础配置，根据环境变量设置
    this.baseConfig = {
      baseURL: config.apiBaseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // 创建axios实例
    this.instance = axios.create({
      ...this.baseConfig,
      ...axiosConfig,
    });

    // 添加拦截器
    this.setupInterceptors();

    // 开发环境下输出配置信息
    if (config.isDev) {
      console.log('HTTP请求配置:', {
        baseURL: this.baseConfig.baseURL,
        timeout: this.baseConfig.timeout,
      });
    }
  }

  // 配置拦截器
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // 从 localStorage 获取用户信息和token
        const userInfo = storage.local.get('user') as any;
        const token = userInfo?.token;
        if (token) {
          reqConfig.headers.set('Authorization', `Bearer ${token}`);
        }

        // 根据全局配置判断环境，添加环境标识
        if (config.isDev) {
          reqConfig.headers.set('X-Environment', 'development');
        }

        // 统一分页参数：将前端的pageSize转换为后端的limit
        if (reqConfig.params && reqConfig.params.pageSize) {
          reqConfig.params.limit = reqConfig.params.pageSize;
          delete reqConfig.params.pageSize;
        }

        // 处理GET请求的查询参数
        if (reqConfig.method === 'get' && reqConfig.data && reqConfig.data.pageSize) {
          reqConfig.data.limit = reqConfig.data.pageSize;
          delete reqConfig.data.pageSize;
        }

        return reqConfig;
      },
      (error: AxiosError): Promise<AxiosError> => {
        console.error('请求错误:', error);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        // 统一处理响应数据
        const { data } = response;

        // 如果后端接口规范，统一处理响应状态
        // 后端成功响应：success: true, code: 200/201 等
        // 后端失败响应：success: false, code: 400/401/500 等
        if (data.success === false || (data.code && data.code >= 400)) {
          // 开发环境输出详细错误信息
          if (config.isDev) {
            console.error('API错误响应:', {
              url: response.config.url,
              status: response.status,
              data,
            });
          }

          return Promise.reject({
            success: false,
            code: data.code,
            message: data.message || '服务器响应异常',
            data: null,
            errors: data.errors,
            meta: data.meta,
          } as ErrorResponse) as any;
        }

        // 转换分页参数：将后端的limit转换回前端的pageSize
        if (data.data && typeof data.data === 'object') {
          const convertPaginationParams = (obj: any) => {
            if (obj && typeof obj === 'object') {
              if (obj.limit !== undefined) {
                obj.pageSize = obj.limit;
                delete obj.limit;
              }
              // 递归处理嵌套对象
              Object.keys(obj).forEach((key) => {
                if (obj[key] && typeof obj[key] === 'object') {
                  convertPaginationParams(obj[key]);
                }
              });
            }
          };
          convertPaginationParams(data.data);
        }

        return response;
      },
      (error: AxiosError): Promise<AxiosError> => {
        const { response } = error;

        // 开发环境输出详细错误日志
        if (config.isDev) {
          console.group('API请求错误');
          console.error('错误信息:', error.message);
          console.error('请求配置:', error.config);
          console.error('响应详情:', response);
          console.groupEnd();
        }

        // 根据状态码处理不同的错误
        if (response) {
          const status = response.status;

          switch (status) {
            case 401:
              // 未授权，清除token并跳转到登录页
              storage.local.remove('user');
              window.location.href = '/';
              break;
            case 403:
              // 禁止访问
              console.error('访问被禁止');
              break;
            case 404:
              // 资源不存在
              console.error('请求的资源不存在');
              break;
            case 500:
              // 服务器错误
              console.error('服务器错误');
              break;
            default:
              console.error(`未预期的错误: ${status}`);
          }
        } else {
          // 网络错误或请求被取消
          console.error('网络错误或请求被取消');
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * 创建请求
   * @param config 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  public async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request({
        ...config,
        method: config.method,
      });
      return response.data;
    } catch (error) {
      // 统一处理错误，确保返回标准的错误格式
      const err = error as ErrorResponse;
      throw err;
    }
  }

  /**
   * 文件上传请求
   * @param url - 请求URL
   * @param formData - FormData对象
   * @param config - 请求配置
   * @returns Promise<AxiosResponse>
   */
  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  /**
   * 下载文件
   * @param url - 请求URL
   * @param config - 请求配置
   * @returns Promise<AxiosResponse>
   */
  download<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });
  }

  // GET请求
  public get<T = any>(
    url: string,
    params?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: HttpMethod.GET,
      params,
      ...config,
    });
  }

  // POST请求
  public post<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: HttpMethod.POST,
      data,
      ...config,
    });
  }

  // PUT请求
  public put<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: HttpMethod.PUT,
      data,
      ...config,
    });
  }

  // DELETE请求
  public delete<T = any>(
    url: string,
    params?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: HttpMethod.DELETE,
      params,
      ...config,
    });
  }

  // PATCH请求
  public patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: HttpMethod.PATCH,
      data,
      ...config,
    });
  }

  /**
   * 流式POST请求 (Server-Sent Events)
   * @param url - 请求URL
   * @param data - 请求数据
   * @param onChunk - 流数据回调
   * @returns Promise<string> - 完整响应内容
   */
  public async streamPost(url: string, data?: any, onChunk?: (chunk: string) => void): Promise<string> {
    // 获取token
    const userInfo = storage.local.get('user') as any;
    const token = userInfo?.token;

    const response = await fetch(`${this.baseConfig.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (!reader) {
      throw new Error('无法获取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'chunk') {
              result += data.chunk;
              onChunk?.(data.chunk);
            } else if (data.type === 'done') {
              return result;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return result;
  }
}

// 创建默认的请求实例
const http = new HttpRequest();

export default http;
export { HttpRequest };
