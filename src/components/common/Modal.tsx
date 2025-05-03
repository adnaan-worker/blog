import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

// 弹窗背景遮罩
const ModalOverlay = styled(motion.div)`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
  /* 允许内容滚动但保持背景固定 */
  overscroll-behavior: contain;
`;

// 弹窗容器
const ModalContainer = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin: auto;
  
  [data-theme='dark'] & {
    background: var(--bg-secondary);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
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
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // 不再需要存储滚动位置，因为我们不再移动页面
  
  // 处理滚动锁定 - 优化版本，避免页面跳动和卡屏
  useEffect(() => {
    // 计算滚动条宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    if (isOpen) {
      // 只添加overflow: hidden来阻止滚动，而不改变页面位置
      document.body.style.overflow = 'hidden';
      // 添加padding-right来补偿滚动条消失的空间，防止页面内容位移
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // 恢复滚动
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      // 如果组件卸载时模态框是打开的，需要恢复滚动
      if (isOpen) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FiX size={20} />
            </CloseButton>
            {children}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default Modal;