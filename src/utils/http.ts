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
        const userInfo = storage.local.get('user');
        const token = userInfo?.token;
        if (token) {
          reqConfig.headers.set('Authorization', `Bearer ${token}`);
        }

        // 根据全局配置判断环境，添加环境标识
        if (config.isDev) {
          reqConfig.headers.set('X-Environment', 'development');
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
        if (data.code !== 200 && data.code !== 0) {
          // 开发环境输出详细错误信息
          if (config.isDev) {
            console.error('API错误响应:', {
              url: response.config.url,
              status: response.status,
              data,
            });
          }

          return Promise.reject({
            code: data.code,
            message: data.message || '服务器响应异常',
          } as ErrorResponse) as any;
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
}

// 创建默认的请求实例
const http = new HttpRequest();

export default http;
export { HttpRequest };
