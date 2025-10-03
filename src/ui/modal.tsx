import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { scrollLock } from '@/utils/scroll-lock';

// 滚动锁定 Hook - 使用统一的滚动锁定管理器
const useScrollLock = (isLocked: boolean) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // 清理之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLocked) {
      scrollLock.lock();
    } else {
      // 延迟解锁，等待Modal动画完成
      timeoutRef.current = setTimeout(() => {
        scrollLock.unlock();
        timeoutRef.current = null;
      }, 250); // 略长于动画时间(200ms)
    }

    // 组件卸载时确保解锁
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // 如果当前是锁定状态，立即解锁
      if (isLocked) {
        scrollLock.unlock();
      }
    };
  }, [isLocked]);
};

// 模态框尺寸类型
type ModalSize = 'small' | 'medium' | 'large' | 'full';

// 弹窗背景遮罩
const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999; /* 提高z-index确保覆盖所有内容 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

// 弹窗容器
const ModalContainer = styled(motion.div)<{ $size: ModalSize; centerContent?: boolean }>`
  background: var(--bg-primary);
  border-radius: 16px;
  position: relative;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  margin: auto;
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  [data-theme='dark'] & {
    background: var(--bg-secondary);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.3),
      0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          width: 90%;
          max-width: 320px;
        `;
      case 'large':
        return `
          width: 95%;
          max-width: 800px;
        `;
      case 'full':
        return `
          width: 95%;
          max-width: 1200px;
          height: 90vh;
        `;
      default: // medium
        return `
          width: 90%;
          max-width: 500px;
        `;
    }
  }}

  ${({ centerContent }) =>
    centerContent &&
    `
    align-items: center;
    justify-content: center;
    text-align: center;
  `}
`;

// 弹窗头部
const ModalHeader = styled.div`
  position: relative;
  padding: 1.5rem 2rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  flex-shrink: 0;
`;

// 弹窗标题
const ModalTitle = styled.h2`
  margin: 0;
  padding-right: 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
`;

// 弹窗内容
const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--text-tertiary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
`;

// 弹窗底部
const ModalFooter = styled.div`
  padding: 1.5rem 2rem 2rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1.5rem;
  flex-shrink: 0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

// 关闭按钮
const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  width: 2rem;
  height: 2rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 按钮样式
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
  outline: none;
  font-family: inherit;
  min-height: 2.5rem;

  ${({ variant = 'secondary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: var(--accent-color);
          color: white;
          border: 2px solid var(--accent-color);
          
          &:hover:not(:disabled) {
            background-color: var(--accent-color-hover);
            border-color: var(--accent-color-hover);
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error-color);
          color: white;
          border: 2px solid var(--error-color);
          
          &:hover:not(:disabled) {
            background-color: #d32f2f;
            border-color: #d32f2f;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
          
          &:hover:not(:disabled) {
            background-color: var(--bg-tertiary);
            border-color: var(--accent-color-alpha);
            transform: translateY(-1px);
          }
        `;
    }
  }}

  &:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

// Modal 选项接口
interface ModalOptions {
  title?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  centerContent?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

// Modal 组件
interface ModalComponentProps extends ModalOptions {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  usePortal?: boolean; // 新增：是否使用Portal
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  centerContent = false,
  footer,
  className,
  usePortal = true, // 默认使用Portal
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // 处理键盘事件
  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [onClose, closeOnEsc],
  );

  // 处理焦点陷阱
  const handleFocusTrap = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    }
  }, []);

  // 使用滚动锁定 hook
  useScrollLock(isOpen);

  // 处理键盘事件和焦点
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [isOpen, handleKeyDown, handleFocusTrap]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
        >
          <ModalContainer
            ref={modalRef}
            className={className}
            $size={size}
            centerContent={centerContent}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="关闭模态框">
                <FiX size={20} />
              </CloseButton>
            )}

            {title && (
              <ModalHeader>
                <ModalTitle id="modal-title">{title}</ModalTitle>
              </ModalHeader>
            )}

            <ModalBody>{children}</ModalBody>

            {footer && <ModalFooter>{footer}</ModalFooter>}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );

  // 根据usePortal决定是否使用Portal
  return usePortal ? createPortal(modalContent, document.body) : modalContent;
};

// Modal 函数式API
interface ModalAPI {
  show: (content: React.ReactNode, options?: ModalOptions) => Promise<void>;
  confirm: (options: {
    title?: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger';
    size?: ModalSize;
  }) => Promise<boolean>;
  info: (content: React.ReactNode, title?: string, options?: ModalOptions) => Promise<void>;
  success: (content: React.ReactNode, title?: string, options?: ModalOptions) => Promise<void>;
  warning: (content: React.ReactNode, title?: string, options?: ModalOptions) => Promise<void>;
  error: (content: React.ReactNode, title?: string, options?: ModalOptions) => Promise<void>;
}

let modalContainer: HTMLElement | null = null;
let modalRoot: any = null;

const getModalContainer = () => {
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modal-root';
    document.body.appendChild(modalContainer);
    modalRoot = createRoot(modalContainer);
  }
  return { container: modalContainer, root: modalRoot };
};

const showModal = (content: React.ReactNode, options: ModalOptions = {}): Promise<void> => {
  return new Promise((resolve) => {
    const { root } = getModalContainer();

    const handleClose = () => {
      root.render(
        React.createElement(ModalComponent, {
          isOpen: false,
          onClose: () => {},
          children: content,
          ...options,
        }),
      );

      setTimeout(() => {
        resolve();
      }, 200);
    };

    root.render(
      React.createElement(ModalComponent, {
        isOpen: true,
        onClose: handleClose,
        children: content,
        ...options,
      }),
    );
  });
};

const showConfirm = (options: {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  size?: ModalSize;
}): Promise<boolean> => {
  return new Promise((resolve) => {
    const { root } = getModalContainer();

    const handleClose = (result: boolean) => {
      root.render(
        React.createElement(ModalComponent, {
          isOpen: false,
          onClose: () => {},
          children: null,
        }),
      );

      setTimeout(() => {
        resolve(result);
      }, 200);
    };

    const footer = React.createElement(
      'div',
      { style: { display: 'flex', gap: '0.75rem' } },
      React.createElement(Button, {
        onClick: () => handleClose(false),
        children: options.cancelText || '取消',
      }),
      React.createElement(Button, {
        variant: options.confirmVariant || 'primary',
        onClick: () => handleClose(true),
        children: options.confirmText || '确定',
      }),
    );

    root.render(
      React.createElement(ModalComponent, {
        isOpen: true,
        onClose: () => handleClose(false),
        title: options.title,
        size: options.size,
        footer,
        children: React.createElement(
          'p',
          {
            style: { margin: '1rem 0', color: 'var(--text-primary)' },
          },
          options.message,
        ),
      }),
    );
  });
};

const modal: ModalAPI = {
  show: showModal,
  confirm: showConfirm,
  info: (content, title, options) => showModal(content, { ...options, title }),
  success: (content, title, options) => showModal(content, { ...options, title }),
  warning: (content, title, options) => showModal(content, { ...options, title }),
  error: (content, title, options) => showModal(content, { ...options, title }),
};

export default modal;
export { ModalComponent as Modal };
export type { ModalOptions, ModalSize };
