import { createRoot } from 'react-dom/client';
import React from 'react';
import { Alert } from '@/components/ui/alert';
import { AlertOptions } from './common-types';

// 用于管理已创建的Alert元素
let alertContainer: HTMLDivElement | null = null;
const alertRoots: Map<string, { root: ReturnType<typeof createRoot>; element: HTMLDivElement }> = new Map();

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 创建或获取Alert容器
const getAlertContainer = (): HTMLDivElement => {
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'global-alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translateX(-50%)';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.display = 'flex';
    alertContainer.style.flexDirection = 'column';
    alertContainer.style.gap = '10px';
    alertContainer.style.width = '100%';
    alertContainer.style.maxWidth = '500px';
    alertContainer.style.pointerEvents = 'none';
    document.body.appendChild(alertContainer);
  }
  return alertContainer;
};

// 移除Alert
const removeAlert = (id: string) => {
  const alertInfo = alertRoots.get(id);
  if (alertInfo) {
    try {
      setTimeout(() => {
        alertInfo.root.unmount();
        alertContainer?.removeChild(alertInfo.element);
        alertRoots.delete(id);
        
        // 如果没有更多Alert，则移除容器
        if (alertRoots.size === 0 && alertContainer) {
          document.body.removeChild(alertContainer);
          alertContainer = null;
        }
      }, 300); // 给动画一些时间
    } catch (error) {
      console.error('Error removing alert:', error);
    }
  }
};

// 创建Alert
const createAlert = (options: AlertOptions) => {
  const { type, title, message, duration = 3000, closable = true } = options;
  
  const container = getAlertContainer();
  const alertElement = document.createElement('div');
  alertElement.style.pointerEvents = 'auto';
  container.appendChild(alertElement);
  
  const id = generateId();
  const root = createRoot(alertElement);
  
  alertRoots.set(id, { root, element: alertElement });
  
  const handleClose = () => removeAlert(id);
  
  root.render(
    React.createElement(Alert, {
      type: type,
      title: title,
      message: message,
      closable: closable,
      duration: duration,
      onClose: handleClose
    })
  );
  
  return id;
};

// 全局Alert API
const alert = {
  success: (message: string, title?: string, duration?: number) => {
    return createAlert({ type: 'success', message, title, duration });
  },
  
  error: (message: string, title?: string, duration?: number) => {
    return createAlert({ type: 'error', message, title, duration });
  },
  
  info: (message: string, title?: string, duration?: number) => {
    return createAlert({ type: 'info', message, title, duration });
  },
  
  warning: (message: string, title?: string, duration?: number) => {
    return createAlert({ type: 'warning', message, title, duration });
  },
  
  // 显示自定义配置的Alert
  show: (options: AlertOptions) => {
    return createAlert(options);
  },
  
  // 手动关闭某个Alert
  close: (id: string) => {
    removeAlert(id);
  }
};

export default alert; 