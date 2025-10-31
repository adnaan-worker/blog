/**
 * HTTP 配置文件
 * 用于配置HTTP请求的全局行为
 */

import { HttpRequest } from './http';
import { AppDispatch } from '@/store';
import { logout } from '@/store/modules/userSlice';

/**
 * 配置未授权回调函数
 * 通常在应用初始化时调用，传入React Router的navigate函数和Redux dispatch
 *
 * @example
 * ```ts
 * import { useNavigate } from 'react-router-dom';
 * import { useDispatch } from 'react-redux';
 * import { setupHttpConfig } from '@/utils/http-config';
 *
 * function App() {
 *   const navigate = useNavigate();
 *   const dispatch = useDispatch();
 *
 *   useEffect(() => {
 *     setupHttpConfig(navigate, dispatch);
 *   }, [navigate, dispatch]);
 * }
 * ```
 */
export function setupHttpConfig(navigate: (path: string) => void, dispatch?: AppDispatch) {
  HttpRequest.setUnauthorizedCallback(() => {
    // 清除 Redux 状态（如果提供了 dispatch）
    if (dispatch) {
      dispatch(logout());
    }

    // 跳转到首页
    navigate('/');
  });
}
