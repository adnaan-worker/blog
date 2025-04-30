import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from './interceptors';
import { HttpMethod, RequestConfig, ApiResponse } from './types';
import config from './config';

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
    this.instance.interceptors.request.use(
      (config) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      requestErrorInterceptor
    );

    this.instance.interceptors.response.use(
      (response) => {
        // 如果响应中包含 token，保存到 localStorage
        const token = response.data?.data?.token;
        if (token) {
          localStorage.setItem('token', token);
        }
        return response;
      },
      responseErrorInterceptor
    );
  }

  // 创建请求
  public request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance
      .request({
        ...config,
        method: config.method,
      })
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data);
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
