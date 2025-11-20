import { useState, useEffect } from 'react';

interface NetworkStatus {
  online: boolean;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * 网络状态监控 Hook
 * 监控网络连接状态和网络质量
 *
 * @example
 * ```typescript
 * const network = useNetworkStatus();
 *
 * if (!network.online) {
 *   return <OfflineMessage />;
 * }
 *
 * if (network.effectiveType === '2g') {
 *   // 降低图片质量或禁用动画
 * }
 * ```
 */
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setStatus((prev) => ({ ...prev, online: navigator.onLine }));
    };

    const updateConnectionStatus = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      if (connection) {
        setStatus((prev) => ({
          ...prev,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }));
      }
    };

    // 监听在线/离线状态
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // 监听网络质量变化
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionStatus);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return status;
};

/**
 * 网络状态提示 Hook
 * 当网络状态变化时显示提示
 */
export const useNetworkStatusNotification = () => {
  const status = useNetworkStatus();

  useEffect(() => {
    if (!status.online) {
      // 使用全局 toast 显示离线提示
      if (typeof window !== 'undefined' && (window as any).adnaan) {
        (window as any).adnaan.toast.warning('网络连接已断开', '离线模式');
      }
    }
  }, [status.online]);

  return status;
};

export default useNetworkStatus;
