import { useEffect } from 'react';
import { useNetworkStatus, usePerformanceMonitor } from '@/hooks';
import adnaan from 'adnaan-ui';

/**
 * 全局监控组件
 * 监控网络状态和性能指标
 */
export const GlobalMonitors: React.FC = () => {
  const network = useNetworkStatus();
  const performance = usePerformanceMonitor();

  // 监控网络状态变化
  useEffect(() => {
    if (!network.online) {
      adnaan.toast.warning('网络连接已断开', '离线模式');
    }
  }, [network.online]);

  // 监控低网速
  useEffect(() => {
    if (network.online && network.effectiveType === 'slow-2g') {
      adnaan.toast.info('当前网络速度较慢', '网络提示');
    }
  }, [network.online, network.effectiveType]);

  // 监控性能问题（仅开发环境）- 优化版
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // 🔥 关键修复：只在组件挂载时创建一次定时器
    // 不依赖 performance 对象，避免频繁重新创建
    const interval = setInterval(() => {
      // 在定时器内部获取最新的性能数据
      // 这样不需要依赖 performance 对象
      console.group('📊 性能指标');
      console.log('FPS:', performance.fps);
      console.log('LCP:', performance.largestContentfulPaint?.toFixed(2), 'ms');
      console.log('FCP:', performance.firstContentfulPaint?.toFixed(2), 'ms');
      if (performance.memoryUsage) {
        console.log('内存:', performance.memoryUsage.toFixed(2), 'MB');
      }
      console.groupEnd();
    }, 30000); // 改为30秒，减少频率

    return () => clearInterval(interval);
  }, []); // 🔥 空依赖数组，只创建一次

  return null; // 不渲染任何内容
};

export default GlobalMonitors;
