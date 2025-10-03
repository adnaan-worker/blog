import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { toastEventBus } from '@/ui/toast';

/**
 * 全局Toast监听器组件
 * 监听来自toastEventBus的事件，并通过Toast组件的useToast显示消息
 * 此组件应该放在应用的顶层，确保所有地方都能够使用toast功能
 */
const ToastListener: React.FC = () => {
  const toast = useToast();

  useEffect(() => {
    // 订阅Toast事件
    const unsubscribe = toastEventBus.subscribe(({ type, message, title, duration }) => {
      switch (type) {
        case 'success':
          toast.success(message, title, duration);
          break;
        case 'error':
          toast.error(message, title, duration);
          break;
        case 'info':
          toast.info(message, title, duration);
          break;
        case 'warning':
          toast.warning(message, title, duration);
          break;
        default:
          toast.info(message, title, duration);
      }
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, [toast]);

  // 此组件不渲染任何内容
  return null;
};

export default ToastListener;
