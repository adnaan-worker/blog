import React, { useState, useCallback, createContext, useContext } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiInfo, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { MessageType } from '@/ui/common-types';

// 样式定义
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
`;

const ToastItem = styled(motion.div)<{ type: string }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--radius-medium);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-xl);
  color: var(--text-primary);
  border-left: 4px solid
    ${({ type }) =>
      type === 'success'
        ? 'var(--success-border)'
        : type === 'info'
          ? 'var(--info-border)'
          : type === 'warning'
            ? 'var(--warning-border)'
            : 'var(--error-border)'};
  width: 100%;

  [data-theme='dark'] & {
    box-shadow: var(--shadow-lg);
  }
`;

const ToastIconWrapper = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: ${({ type }) =>
    type === 'success'
      ? 'var(--success-color)'
      : type === 'info'
        ? 'var(--info-color)'
        : type === 'warning'
          ? 'var(--warning-color)'
          : 'var(--error-color)'};
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;

const ToastMessage = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

// 组件接口
export interface ToastProps {
  id: string;
  type: MessageType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastContextType =
  | {
      addToast: (toast: Omit<ToastProps, 'id'>) => void;
      removeToast: (id: string) => void;
    }
  | undefined;

// Toast上下文
export const ToastContext = createContext<ToastContextType>(undefined);

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Toast提供者组件
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // 自动移除
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              type={toast.type}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2 }}
            >
              <ToastIconWrapper type={toast.type}>
                {toast.type === 'success' && <FiCheck size={20} />}
                {toast.type === 'info' && <FiInfo size={20} />}
                {toast.type === 'warning' && <FiAlertTriangle size={20} />}
                {toast.type === 'error' && <FiAlertCircle size={20} />}
              </ToastIconWrapper>

              <ToastContent>
                {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                <ToastMessage>{toast.message}</ToastMessage>
              </ToastContent>

              <CloseButton onClick={() => removeToast(toast.id)} aria-label="关闭通知">
                <FiX size={18} />
              </CloseButton>
            </ToastItem>
          ))}
        </AnimatePresence>
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// 自定义Hook - 用于组件中使用Toast
export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    toast: (props: Omit<ToastProps, 'id'>) => context.addToast(props),
    success: (message: string, title?: string, duration?: number) =>
      context.addToast({ type: 'success', message, title, duration }),
    info: (message: string, title?: string, duration?: number) =>
      context.addToast({ type: 'info', message, title, duration }),
    warning: (message: string, title?: string, duration?: number) =>
      context.addToast({ type: 'warning', message, title, duration }),
    error: (message: string, title?: string, duration?: number) =>
      context.addToast({ type: 'error', message, title, duration }),
  };
};

export default { ToastProvider, useToast };
