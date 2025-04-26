import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiInfo, FiCheck, FiAlertTriangle, FiHelpCircle } from 'react-icons/fi';

// ============ 提示框组件 ============
const AlertContainer = styled(motion.div)<{ type: string }>`
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-medium);
  margin-bottom: 1rem;
  background-color: ${({ type }) => 
    type === 'success' ? 'rgba(67, 160, 71, 0.1)' :
    type === 'info' ? 'rgba(81, 131, 245, 0.1)' :
    type === 'warning' ? 'rgba(255, 167, 38, 0.1)' : 
    'rgba(229, 57, 53, 0.1)'
  };
  border-left: 4px solid ${({ type }) => 
    type === 'success' ? 'var(--success-color)' :
    type === 'info' ? 'var(--accent-color)' :
    type === 'warning' ? '#FFA726' : 
    'var(--error-color)'
  };
  color: var(--text-primary);
`;

const AlertIconWrapper = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: ${({ type }) => 
    type === 'success' ? 'var(--success-color)' :
    type === 'info' ? 'var(--accent-color)' :
    type === 'warning' ? '#FFA726' : 
    'var(--error-color)'
  };
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
`;

const AlertMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
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
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }
  
  [data-theme='dark'] &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

interface AlertProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  closable?: boolean;
  duration?: number | null;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  closable = true,
  duration = null,
  onClose
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (duration) {
      timer = setTimeout(() => {
        setVisible(false);
        onClose && onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    onClose && onClose();
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck size={22} />;
      case 'info':
        return <FiInfo size={22} />;
      case 'warning':
        return <FiAlertTriangle size={22} />;
      case 'error':
        return <FiAlertCircle size={22} />;
      default:
        return <FiInfo size={22} />;
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <AlertContainer
          type={type}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
          transition={{ duration: 0.2 }}
        >
          <AlertIconWrapper type={type}>
            {getIcon()}
          </AlertIconWrapper>
          
          <AlertContent>
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertMessage>{message}</AlertMessage>
          </AlertContent>
          
          {closable && (
            <CloseButton onClick={handleClose} aria-label="关闭提示">
              <FiX size={18} />
            </CloseButton>
          )}
        </AlertContainer>
      )}
    </AnimatePresence>
  );
};

// ============ 确认框组件 ============
const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  [data-theme='dark'] & {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }
  
  [data-theme='dark'] &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
  gap: 0.75rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: var(--accent-color);
          color: white;
          border: none;
          
          &:hover {
            background-color: var(--accent-color-hover);
            transform: translateY(-2px);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error-color);
          color: white;
          border: none;
          
          &:hover {
            background-color: #d32f2f;
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          
          &:hover {
            background-color: var(--bg-tertiary);
            transform: translateY(-2px);
          }
        `;
    }
  }}
`;

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  open: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  open,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
  onConfirm,
  onCancel
}) => {
  // 处理Esc键关闭
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onCancel();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onCancel]);
  
  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };
  
  // 动画变量
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const contentVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };
  
  return (
    <AnimatePresence>
      {open && (
        <ModalBackdrop
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <ModalContent
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              <ModalCloseButton onClick={onCancel} aria-label="关闭">
                <FiX size={22} />
              </ModalCloseButton>
            </ModalHeader>
            
            <ModalBody>
              {typeof message === 'string' ? <p>{message}</p> : message}
            </ModalBody>
            
            <ModalFooter>
              <Button variant="secondary" onClick={onCancel}>
                {cancelText}
              </Button>
              <Button variant={confirmVariant} onClick={onConfirm}>
                {confirmText}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

// ============ Toast通知组件 ============
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
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
  border-left: 4px solid ${({ type }) => 
    type === 'success' ? 'var(--success-color)' :
    type === 'info' ? 'var(--accent-color)' :
    type === 'warning' ? '#FFA726' : 
    'var(--error-color)'
  };
  width: 100%;
  
  [data-theme='dark'] & {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

const ToastIconWrapper = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: ${({ type }) => 
    type === 'success' ? 'var(--success-color)' :
    type === 'info' ? 'var(--accent-color)' :
    type === 'warning' ? '#FFA726' : 
    'var(--error-color)'
  };
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

// 定义Toast的类型和接口
export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

// Toast上下文
const ToastContext = React.createContext<{
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
} | undefined>(undefined);

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Toast提供者组件
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = generateId();
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // 自动移除
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer>
        <AnimatePresence>
          {toasts.map(toast => (
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
  const context = React.useContext(ToastContext);
  
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

// ============ Tooltip提示组件 ============
const TooltipContainer = styled(motion.div)`
  position: absolute;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-small);
  font-size: 0.85rem;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  white-space: nowrap;
  pointer-events: none;
  
  [data-theme='dark'] & {
    background-color: var(--bg-secondary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
`;

const TooltipArrow = styled.div<{ placement: string }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--bg-primary);
  transform: rotate(45deg);
  
  ${({ placement }) => {
    switch (placement) {
      case 'top':
        return `
          bottom: -4px;
          left: 50%;
          margin-left: -4px;
        `;
      case 'bottom':
        return `
          top: -4px;
          left: 50%;
          margin-left: -4px;
        `;
      case 'left':
        return `
          right: -4px;
          top: 50%;
          margin-top: -4px;
        `;
      case 'right':
        return `
          left: -4px;
          top: 50%;
          margin-top: -4px;
        `;
      default:
        return '';
    }
  }}
  
  [data-theme='dark'] & {
    background-color: var(--bg-secondary);
  }
`;

interface TooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  delay?: number;
}

export const Tooltip = React.forwardRef<HTMLElement, TooltipProps>(({
  content,
  placement = 'top',
  children,
  delay = 0
}, forwardedRef) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 计算位置
  const updatePosition = useCallback(() => {
    if (!childRef.current || !tooltipRef.current) return;
    
    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;
    
    // 计算考虑滚动位置的绝对坐标
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    switch (placement) {
      case 'top':
        x = scrollLeft + childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
        y = scrollTop + childRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = scrollLeft + childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
        y = scrollTop + childRect.bottom + 8;
        break;
      case 'left':
        x = scrollLeft + childRect.left - tooltipRect.width - 8;
        y = scrollTop + childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = scrollLeft + childRect.right + 8;
        y = scrollTop + childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
        break;
    }
    
    // 确保提示框不会超出可视区域
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxX = scrollLeft + viewportWidth - tooltipRect.width - 8;
    const maxY = scrollTop + viewportHeight - tooltipRect.height - 8;
    
    x = Math.max(scrollLeft + 8, Math.min(x, maxX));
    y = Math.max(scrollTop + 8, Math.min(y, maxY));
    
    setPosition({ x, y });
  }, [placement]);
  
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  }, [delay]);
  
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
    }
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible, updatePosition]);
  
  // 处理鼠标移入事件
  const handleMouseEnterWithOriginal = useCallback((e: React.MouseEvent) => {
    handleMouseEnter();
    // 安全地调用原始onMouseEnter
    const originalHandler = (children.props as any).onMouseEnter;
    if (typeof originalHandler === 'function') {
      originalHandler(e);
    }
  }, [children, handleMouseEnter]);

  // 处理鼠标移出事件
  const handleMouseLeaveWithOriginal = useCallback((e: React.MouseEvent) => {
    handleMouseLeave();
    // 安全地调用原始onMouseLeave
    const originalHandler = (children.props as any).onMouseLeave;
    if (typeof originalHandler === 'function') {
      originalHandler(e);
    }
  }, [children, handleMouseLeave]);

  // 处理点击事件
  const handleClickWithOriginal = useCallback((e: React.MouseEvent) => {
    // 点击时显示tooltip
    handleMouseEnter();
    
    // 安全地调用原始onClick
    const originalHandler = (children.props as any).onClick;
    if (typeof originalHandler === 'function') {
      originalHandler(e);
    }
  }, [children, handleMouseEnter]);

  // 处理ref回调
  const handleRefCallback = useCallback((node: any) => {
    // 设置内部引用
    childRef.current = node;
    
    // 处理原始子元素的ref
    const childrenRef = (children as any).ref;
    if (childrenRef) {
      if (typeof childrenRef === 'function') {
        childrenRef(node);
      } else if (childrenRef.hasOwnProperty('current')) {
        childrenRef.current = node;
      }
    }
    
    // 处理forwardedRef
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else {
        forwardedRef.current = node;
      }
    }
  }, [children, forwardedRef]);
  
  // 创建带有事件处理的子元素
  const clonedChild = React.isValidElement(children) 
    ? React.cloneElement(children, {
        ...(children.props as any),
        onMouseEnter: handleMouseEnterWithOriginal,
        onMouseLeave: handleMouseLeaveWithOriginal,
        onClick: handleClickWithOriginal,
        ref: handleRefCallback
      })
    : children;
  
  return (
    <>
      {clonedChild}
      
      {isVisible && (
        <TooltipContainer
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{ 
            left: position.x, 
            top: position.y, 
            transformOrigin: placement === 'top' ? 'bottom' : 
                             placement === 'bottom' ? 'top' : 
                             placement === 'left' ? 'right' : 'left' 
          }}
        >
          {content}
        </TooltipContainer>
      )}
    </>
  );
});

// ============ Badge徽章组件 ============
const BadgeContainer = styled.span<{ type: string; dot?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ dot }) => dot ? '0' : '0.75rem'};
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  border-radius: ${({ dot }) => dot ? '50%' : 'var(--radius-full)'};
  padding: ${({ dot }) => dot ? '0' : '0.25rem 0.5rem'};
  min-width: ${({ dot }) => dot ? '8px' : '20px'};
  height: ${({ dot }) => dot ? '8px' : 'auto'};
  color: white;
  background-color: ${({ type }) => 
    type === 'success' ? 'var(--success-color)' :
    type === 'info' ? 'var(--accent-color)' :
    type === 'warning' ? '#FFA726' : 
    type === 'error' ? 'var(--error-color)' : 
    'var(--text-tertiary)'
  };
`;

interface BadgeProps {
  count?: number;
  overflowCount?: number;
  dot?: boolean;
  type?: 'success' | 'info' | 'warning' | 'error' | 'default';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  overflowCount = 99,
  dot = false,
  type = 'default',
  className,
  style
}) => {
  // 如果count为0且不是dot，则不显示
  if (count === 0 && !dot) return null;
  
  // 计算显示的文本
  const displayCount = (count && count > overflowCount) ? `${overflowCount}+` : count;
  
  return (
    <BadgeContainer 
      className={className}
      style={style}
      type={type}
      dot={dot}
    >
      {!dot && displayCount}
    </BadgeContainer>
  );
};

// ============ Tabs标签组件 ============
const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TabsHeader = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--border-color);
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabItem = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-primary)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--accent-color);
    transform: ${props => props.active ? 'scaleX(1)' : 'scaleX(0)'};
    transition: transform 0.2s ease;
    transform-origin: center;
  }
`;

const TabContent = styled.div`
  padding: 1.25rem 0;
`;

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  onChange,
  className,
  style
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || (items.length > 0 ? items[0].key : ''));
  
  useEffect(() => {
    if (defaultActiveKey && defaultActiveKey !== activeKey) {
      setActiveKey(defaultActiveKey);
    }
  }, [defaultActiveKey]);
  
  const handleTabClick = (key: string) => {
    setActiveKey(key);
    if (onChange) {
      onChange(key);
    }
  };
  
  const activeTab = items.find(item => item.key === activeKey);
  
  return (
    <TabsContainer className={className} style={style}>
      <TabsHeader>
        {items.map(item => (
          <TabItem
            key={item.key}
            active={item.key === activeKey}
            onClick={() => !item.disabled && handleTabClick(item.key)}
            disabled={item.disabled}
            style={{ opacity: item.disabled ? 0.5 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer' }}
          >
            {item.label}
          </TabItem>
        ))}
      </TabsHeader>
      
      <TabContent>
        {activeTab && activeTab.content}
      </TabContent>
    </TabsContainer>
  );
};

// ============ 导出所有组件 ============
export { Button }; 