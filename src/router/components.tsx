import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * 滚动恢复组件
 * 监听路由变化，每次路径变化时自动滚动到页面顶部
 */
export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};
