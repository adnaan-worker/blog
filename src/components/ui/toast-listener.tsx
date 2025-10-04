import React, { useEffect, useContext } from 'react';
import { ToastContext } from './toast';
import { toastEventBus } from '@/ui/toast';

/**
 * 全局Toast监听器组件
 * 监听来自toastEventBus的事件，并通过Toast组件的addToast显示消息
 * 此组件应该放在应用的顶层，确保所有地方都能够使用toast功能
 */
const ToastListener: React.FC = () => {
  const context = useContext(ToastContext);

  useEffect(() => {
    if (!context) {
      console.error('ToastListener: ToastContext 未找到，请确保组件在 ToastProvider 内部');
      return;
    }

    // 订阅Toast事件
    const unsubscribe = toastEventBus.subscribe(({ type, message, title, duration }) => {
      // 直接使用 addToast 方法
      context.addToast({
        type,
        message,
        title,
        duration,
      });
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, [context]);

  // 此组件不渲染任何内容
  return null;
};

export default ToastListener;
