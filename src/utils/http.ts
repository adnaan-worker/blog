import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HttpMethod, RequestConfig, ApiResponse, ErrorResponse } from './types';
import config from './config';
import { storage } from './index';

class HttpRequest {
  private instance: AxiosInstance;
  private baseConfig: AxiosRequestConfig;
  private isRefreshing: boolean = false; // 是否正在刷新token
  private hasShownUnauthorizedError: boolean = false; // 是否已显示401错误
  private errorToastTimers: Map<string, number> = new Map(); // 错误提示防抖计时器

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
  }

  /**
   * 防抖显示错误提示
   * @param key 错误类型的唯一键
   * @param message 错误消息
   * @param title 错误标题
   * @param duration 防抖时长（毫秒）
   */
  private showErrorToast(key: string, message: string, title: string, duration: number = 3000): void {
    // 如果该类型错误已经显示过，则跳过
    if (this.errorToastTimers.has(key)) {
      return;
    }

    // 显示错误提示
    if (typeof window !== 'undefined' && (window as any).adnaan) {
      (window as any).adnaan.toast.error(message, title);
    }

    // 设置防抖计时器
    const timer = window.setTimeout(() => {
      this.errorToastTimers.delete(key);
    }, duration);
    this.errorToastTimers.set(key, timer);
  }

  /**
   * 清理所有错误提示计时器
   */
  public clearErrorToasts(): void {
    this.errorToastTimers.forEach((timer) => {
      window.clearTimeout(timer);
    });
    this.errorToastTimers.clear();
  }

  // 配置拦截器
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // 从 localStorage 获取token
        const token = storage.local.get('token');
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

          // 特殊处理 401 错误，避免在这里和拦截器中重复提示
          if (data.code === 401) {
            if (!this.hasShownUnauthorizedError) {
              this.hasShownUnauthorizedError = true;

              if (typeof window !== 'undefined' && (window as any).adnaan) {
                (window as any).adnaan.toast.error('登录已过期，请重新登录', '身份验证失败');
              }

              storage.local.remove('user');
              storage.local.remove('token');

              setTimeout(() => {
                window.location.href = '/';
                this.hasShownUnauthorizedError = false;
              }, 1500);
            }
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
              // 只显示一次提示，避免多个请求同时失败导致多次弹窗
              if (!this.hasShownUnauthorizedError) {
                this.hasShownUnauthorizedError = true;

                // 使用全局 toast 显示错误
                if (typeof window !== 'undefined' && (window as any).adnaan) {
                  (window as any).adnaan.toast.error('登录已过期，请重新登录', '身份验证失败');
                }

                // 清除用户信息
                storage.local.remove('user');
                storage.local.remove('token');

                // 延迟跳转，让用户看到提示
                setTimeout(() => {
                  window.location.href = '/';
                  // 重置标志，允许下次再显示
                  this.hasShownUnauthorizedError = false;
                }, 1500);
              }
              break;
            case 403:
              // 禁止访问
              if (config.isDev) {
                console.error('访问被禁止');
              }
              this.showErrorToast('403', '您没有权限访问此资源', '访问被拒绝');
              break;
            case 404:
              // 资源不存在
              if (config.isDev) {
                console.error('请求的资源不存在');
              }
              // 404 通常不需要全局提示，由业务层处理
              break;
            case 500:
              // 服务器错误
              if (config.isDev) {
                console.error('服务器错误');
              }
              this.showErrorToast('500', '服务器出现错误，请稍后重试', '服务器错误', 5000);
              break;
            case 502:
            case 503:
            case 504:
              // 网关错误或服务不可用
              if (config.isDev) {
                console.error('服务不可用');
              }
              this.showErrorToast('5xx', '服务暂时不可用，请稍后重试', '服务异常', 5000);
              break;
            default:
              if (config.isDev) {
                console.error(`未预期的错误: ${status}`);
              }
          }
        } else {
          // 网络错误或请求被取消
          if (config.isDev) {
            console.error('网络错误或请求被取消');
          }
          // 只在非取消请求时显示网络错误提示
          if (!axios.isCancel(error)) {
            this.showErrorToast('network', '网络连接失败，请检查网络设置', '网络错误', 5000);
          }
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
    const token = storage.local.get('token');

    const response = await fetch(`${this.baseConfig.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // 特殊处理 401 错误
      if (response.status === 401) {
        if (!this.hasShownUnauthorizedError) {
          this.hasShownUnauthorizedError = true;

          if (typeof window !== 'undefined' && (window as any).adnaan) {
            (window as any).adnaan.toast.error('登录已过期，请重新登录', '身份验证失败');
          }

          storage.local.remove('user');
          storage.local.remove('token');

          setTimeout(() => {
            window.location.href = '/';
            this.hasShownUnauthorizedError = false;
          }, 1500);
        }
      }
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
