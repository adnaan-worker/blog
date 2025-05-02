import { createRoot } from 'react-dom/client';
import React from 'react';
import { ConfirmDialog } from '@/components/ui/Confirm';
import { ConfirmOptions } from './common-types';

// 确认对话框函数
export const confirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    // 创建容器元素
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // 创建React根
    const root = createRoot(container);
    
    // 状态值
    let isOpen = true;
    
    // 处理确认
    const handleConfirm = () => {
      isOpen = false;
      root.render(
        React.createElement(ConfirmDialog, {
          ...options,
          open: false,
          onConfirm: handleConfirm,
          onCancel: handleCancel
        })
      );
      
      // 延迟移除DOM
      setTimeout(() => {
        root.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        resolve(true);
      }, 300);
    };
    
    // 处理取消
    const handleCancel = () => {
      isOpen = false;
      root.render(
        React.createElement(ConfirmDialog, {
          ...options,
          open: false,
          onConfirm: handleConfirm,
          onCancel: handleCancel
        })
      );
      
      // 延迟移除DOM
      setTimeout(() => {
        root.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        resolve(false);
      }, 300);
    };
    
    // 渲染确认对话框
    root.render(
      React.createElement(ConfirmDialog, {
        ...options,
        open: isOpen,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      })
    );
  });
};

// 常用确认对话框预设
export const confirmDialog = {
  // 基本确认
  confirm: (title: string, message: React.ReactNode, confirmText = '确认', cancelText = '取消') => {
    return confirm({
      title,
      message,
      confirmText,
      cancelText,
      confirmVariant: 'primary'
    });
  },
  
  // 删除确认
  delete: (message: React.ReactNode = '此操作将永久删除该数据，是否继续？', title = '确认删除') => {
    return confirm({
      title,
      message,
      confirmText: '删除',
      cancelText: '取消',
      confirmVariant: 'danger'
    });
  },
  
  // 保存确认
  save: (message: React.ReactNode = '确认保存更改？', title = '保存确认') => {
    return confirm({
      title,
      message,
      confirmText: '保存',
      cancelText: '取消',
      confirmVariant: 'primary'
    });
  },
  
  // 自定义确认对话框
  custom: (options: ConfirmOptions) => {
    return confirm(options);
  }
};

export default confirmDialog; 