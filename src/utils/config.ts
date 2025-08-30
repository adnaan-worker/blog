/**
 * 全局配置文件
 */
interface Config {
  // 环境标识
  env: 'development' | 'production';
  // API基础URL
  apiBaseUrl: string;
  // 请求超时时间
  timeout: number;
  // 是否为开发环境
  isDev: boolean;
  // 应用标题
  appTitle: string;
  // 其他配置...
}

// 获取环境变量
const env = import.meta.env;

// 判断当前环境
const isDev = env.MODE === 'development';

const config: Config = {
  // 环境标识
  env: env.MODE as 'development' | 'production',
  // 是否为开发环境
  isDev,
  // API基础URL
  apiBaseUrl: env.VITE_API_BASE_URL || '/api',
  // 请求超时时间
  timeout: Number(env.VITE_REQUEST_TIMEOUT) || (isDev ? 30000 : 10000),
  // 应用标题
  appTitle: env.VITE_APP_TITLE || '博客系统',
};

// 开发环境下输出配置信息
if (isDev) {
  console.log('当前应用配置:', config);
}

export default config;
