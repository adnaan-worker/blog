import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket, useSocketEvent } from './useSocket';
import { getIPLocation, getBrowser, getDeviceType } from '@/utils/helpers/environment';
import { getRoomName } from './useRoomCount';

/**
 * 访客追踪 Hook
 * 自动检测并上报访客活动到后端，使用房间系统进行精确的在线人数统计
 */
export const useVisitorTracking = () => {
  const location = useLocation();
  const { isConnected, emit } = useSocket();
  const hasReportedRef = useRef(false);
  const locationDataRef = useRef<{ city: string } | null>(null);
  const currentRoomRef = useRef<string | null>(null); // 当前所在的房间
  const lastPathRef = useRef<string>(''); // 记录上次的路径

  // 获取页面标题（使用 useMemo 缓存，避免每次渲染都重新计算）
  const getPageTitle = useCallback((pathname: string): string => {
    if (pathname === '/' || pathname === '/home') return '首页';
    if (pathname.startsWith('/blog/')) return '文章详情';
    if (pathname === '/blog') return '文章';
    if (pathname.startsWith('/notes/')) return '手记详情';
    if (pathname === '/notes') return '手记';
    if (pathname.startsWith('/projects/')) return '项目详情';
    if (pathname === '/projects') return '项目';
    if (pathname === '/profile') return '个人中心';
    if (pathname === '/editor') return '编辑器';
    if (pathname === '/about') return '关于';
    return '页面';
  }, []);

  // 监听 Socket 断开连接，重置状态
  useSocketEvent('disconnect', () => {
    hasReportedRef.current = false;
    currentRoomRef.current = null;
  });

  // 获取地理位置（仅一次）- 使用统一的 environment 工具类
  useEffect(() => {
    if (!locationDataRef.current) {
      getIPLocation()
        .then((loc) => {
          if (loc.success) {
            locationDataRef.current = { city: loc.city };
          }
        })
        .catch(() => {
          // 地理位置获取失败时使用默认值，静默处理
        });
    }
  }, []);

  // 统一的页面处理和房间管理逻辑
  useEffect(() => {
    if (!isConnected) return;

    const handlePageChange = async () => {
      try {
        const page = location.pathname;
        const pageTitle = getPageTitle(page);
        const newRoomName = getRoomName(page);
        const oldRoomName = currentRoomRef.current;
        const isPathChanged = lastPathRef.current !== page;

        // 如果是首次上报，等待地理位置获取（最多等待2秒）
        if (!hasReportedRef.current) {
          let attempts = 0;
          const maxAttempts = 20; // 最多尝试20次，即2秒
          while (!locationDataRef.current && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
        }

        const deviceType = getDeviceType();
        const browser = getBrowser();
        const locationCity = locationDataRef.current?.city || '未知';

        // 1. 首次上报或路径改变时，发送访客活动数据
        if (!hasReportedRef.current || isPathChanged) {
          emit('visitor_activity', {
            location: locationCity,
            device: deviceType,
            browser,
            page,
            pageTitle,
          });

          // 更新访客页面信息（仅在路径改变时）
          if (isPathChanged && hasReportedRef.current) {
            emit('page_change', {
              page,
              pageTitle,
            });
          }
        }

        // 2. 房间管理（每次路径改变或首次连接时）
        if (isPathChanged || !hasReportedRef.current) {
          // 离开旧房间（仅在路径改变时）
          if (isPathChanged && oldRoomName && oldRoomName !== newRoomName) {
            emit('leave', { room: oldRoomName });
          }

          // 加入新房间（如果有且与旧房间不同）
          if (newRoomName && newRoomName !== oldRoomName) {
            if (emit('join', { room: newRoomName })) {
              currentRoomRef.current = newRoomName;
            }
          } else if (isPathChanged && !newRoomName && oldRoomName) {
            // 如果新页面没有房间，离开所有房间
            emit('leave', {});
            currentRoomRef.current = null;
          }
        }

        // 标记已上报
        hasReportedRef.current = true;
        lastPathRef.current = page;
      } catch (error) {
        // 静默处理错误，避免影响用户体验
        if (process.env.NODE_ENV === 'development') {
          console.error('处理页面变化失败:', error);
        }
      }
    };

    // 延迟处理，确保Socket连接稳定
    const delay = hasReportedRef.current ? 100 : 500;
    const timer = setTimeout(handlePageChange, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isConnected, location.pathname, emit, getPageTitle]);

  // 组件卸载时离开房间（使用 cleanup 函数确保资源释放）
  useEffect(() => {
    return () => {
      // 在组件卸载时离开房间
      const roomToLeave = currentRoomRef.current;
      if (roomToLeave) {
        // 使用 emit 的稳定引用，确保在卸载时也能执行
        try {
          emit('leave', { room: roomToLeave });
        } catch {
          // 静默处理，避免卸载时出错
        }
      }
    };
  }, [emit]);
};
export default useVisitorTracking;
