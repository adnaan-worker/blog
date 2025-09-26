import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

// 样式定义
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
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'default' }>`
  padding: 0.5rem 1rem;
  border-radius: var(--radius-small);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant }) => {
    if (variant === 'primary') {
      return `
        background-color: var(--accent-color);
        color: white;
        border: none;
        
        &:hover {
          background-color: var(--accent-color-hover);
        }
      `;
    } else if (variant === 'danger') {
      return `
        background-color: var(--error-color);
        color: white;
        border: none;
        
        &:hover {
          background-color: var(--error-hover);
        }
      `;
    } else {
      return `
        background-color: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        
        &:hover {
          background-color: var(--bg-secondary);
        }
      `;
    }
  }}
`;

const CloseButton = styled.button`
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

// 组件接口
export interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  open: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

// 确认对话框组件
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  open,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 监听ESC键
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onCancel]);

  // 处理点击背景
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <ModalBackdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <ModalContent
            ref={modalRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              <CloseButton onClick={onCancel} aria-label="关闭">
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>{message}</ModalBody>
            <ModalFooter>
              <Button onClick={onCancel}>{cancelText}</Button>
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

export default ConfirmDialog;
