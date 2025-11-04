import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from './useSocket';
import { getIPLocation, getBrowser, getDeviceType } from '@/utils/helpers/environment';

/**
 * 访客追踪 Hook
 * 自动检测并上报访客活动到后端
 */
export const useVisitorTracking = () => {
  const location = useLocation();
  const socket = useSocket();
  const hasReportedRef = useRef(false);
  const locationDataRef = useRef<{ city: string } | null>(null);
  const lastPathRef = useRef<string>(''); // 记录上次的路径

  // 获取页面标题
  const getPageTitle = (pathname: string): string => {
    if (pathname === '/' || pathname === '/home') return '首页';
    if (pathname.startsWith('/blog/')) return '博客详情';
    if (pathname === '/blog') return '博客';
    if (pathname.startsWith('/notes/')) return '手记详情';
    if (pathname === '/notes') return '手记';
    if (pathname.startsWith('/projects/')) return '项目详情';
    if (pathname === '/projects') return '项目';
    if (pathname === '/profile') return '个人中心';
    if (pathname === '/editor') return '编辑器';
    if (pathname === '/about') return '关于';
    return '页面';
  };

  // 获取地理位置（仅一次）- 使用统一的 environment 工具类
  useEffect(() => {
    if (!locationDataRef.current) {
      getIPLocation()
        .then((loc) => {
          if (loc.success) {
            locationDataRef.current = { city: loc.city };
          }
        })
        .catch((err) => {
          console.error('获取地理位置失败:', err);
        });
    }
  }, []);

  // Socket连接后首次上报
  useEffect(() => {
    if (!socket || hasReportedRef.current) return;

    const reportActivity = async () => {
      try {
        // 等待地理位置获取完成（最多等待2秒）
        let attempts = 0;
        while (!locationDataRef.current && attempts < 20) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        const deviceType = getDeviceType();
        const browser = getBrowser();
        const locationCity = locationDataRef.current?.city || '未知';
        const page = location.pathname;
        const pageTitle = getPageTitle(page);

        // 记录初始路径
        lastPathRef.current = page;

        // 发送访客活动数据
        // deviceId 通过 Socket 连接时的 auth.device_id 传递，后端会从 socket.clientInfo.deviceId 获取
        socket.emit('visitor_activity', {
          location: locationCity,
          device: deviceType,
          browser,
          page,
          pageTitle,
        });

        console.log('✅ 上报访客活动:', {
          location: locationCity,
          device: deviceType,
          browser,
          page: pageTitle,
        });

        hasReportedRef.current = true;
      } catch (error) {
        console.error('上报访客活动失败:', error);
      }
    };

    // 延迟上报，确保Socket连接稳定
    const timer = setTimeout(reportActivity, 500);

    return () => clearTimeout(timer);
  }, [socket]); // 移除 location.pathname 依赖，只依赖 socket

  // 页面切换时更新
  useEffect(() => {
    if (!socket || !hasReportedRef.current) return;

    const page = location.pathname;

    // 只在路径真正改变时才发送事件
    if (lastPathRef.current === page) {
      return;
    }

    lastPathRef.current = page;
    const pageTitle = getPageTitle(page);

    socket.emit('page_change', {
      page,
      pageTitle,
    });
  }, [socket, location.pathname]);
};

export default useVisitorTracking;
