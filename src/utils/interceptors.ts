import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from './config';
import { storage } from './index';

// 请求拦截器
export const requestInterceptor = (reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // 可以在这里添加token到请求头
  const userInfo = storage.local.remove('user');
  const token = userInfo?.token;
  if (token) {
    reqConfig.headers.set('Authorization', `Bearer ${token}`);
  }

  // 根据全局配置判断环境，不使用请求配置中的属性
  if (config.isDev) {
    reqConfig.headers.set('X-Environment', 'development');
  }

  return reqConfig;
};

// 请求错误拦截器
export const requestErrorInterceptor = (error: AxiosError): Promise<AxiosError> => {
  console.error('Request Error:', error);
  return Promise.reject(error);
};

// 响应拦截器
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // 可以在这里统一处理响应数据
  const { data } = response;

  // 如果后端接口规范，可以统一在这里处理响应状态
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
    }) as any;
  }

  return response;
};

// 响应错误拦截器
export const responseErrorInterceptor = (error: AxiosError): Promise<AxiosError> => {
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
        console.error('Access forbidden');
        break;
      case 404:
        // 资源不存在
        console.error('Resource not found');
        break;
      case 500:
        // 服务器错误
        console.error('Server error');
        break;
      default:
        console.error(`Unexpected error: ${status}`);
    }
  } else {
    // 网络错误或请求被取消
    console.error('Network error or request cancelled');
  }

  return Promise.reject(error);
};
