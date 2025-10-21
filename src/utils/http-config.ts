/**
 * HTTP 配置文件
 * 用于配置HTTP请求的全局行为
 */

import { HttpRequest } from './http';

/**
 * 配置未授权回调函数
 * 通常在应用初始化时调用，传入React Router的navigate函数
 *
 * @example
 * ```ts
 * import { useNavigate } from 'react-router-dom';
 * import { setupHttpConfig } from '@/utils/http-config';
 *
 * function App() {
 *   const navigate = useNavigate();
 *
 *   useEffect(() => {
 *     setupHttpConfig(navigate);
 *   }, [navigate]);
 * }
 * ```
 */
export function setupHttpConfig(navigate: (path: string) => void) {
  HttpRequest.setUnauthorizedCallback(() => {
    navigate('/');
  });
}
