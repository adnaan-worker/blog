import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiInfo, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { MessageType } from '@/ui/common-types';

// 样式定义
const AlertContainer = styled(motion.div)<{ type: string }>`
  width: 100%;
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-medium);
  margin-bottom: 1rem;
  background-color: ${({ type }) =>
    type === 'success'
      ? 'var(--success-bg)'
      : type === 'info'
        ? 'var(--info-bg)'
        : type === 'warning'
          ? 'var(--warning-bg)'
          : 'var(--error-bg)'};
  border-left: 4px solid
    ${({ type }) =>
      type === 'success'
        ? 'var(--success-border)'
        : type === 'info'
          ? 'var(--info-border)'
          : type === 'warning'
            ? 'var(--warning-border)'
            : 'var(--error-border)'};
  color: var(--text-primary);
`;

const AlertIconWrapper = styled.div<{ type: string }>`
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
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

// 组件接口
export interface AlertProps {
  type: MessageType;
  title?: string;
  message: string;
  closable?: boolean;
  duration?: number | null;
  onClose?: () => void;
}

// Alert组件
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  closable = true,
  duration = null,
  onClose,
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
          <AlertIconWrapper type={type}>{getIcon()}</AlertIconWrapper>

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

export default Alert;
