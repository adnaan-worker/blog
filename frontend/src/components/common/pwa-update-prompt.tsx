/**
 * PWA 更新提示组件
 * 当有新版本时自动提示用户刷新
 */
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiX } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateBanner = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 90%;
  width: 400px;

  @media (max-width: 768px) {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    width: auto;
    transform: none;
  }
`;

const UpdateContent = styled.div`
  flex: 1;

  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
  }
`;

const UpdateActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  button {
    min-width: auto !important;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

export const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('[PWA] Service Worker 已注册');
    },
    onRegisterError(error: any) {
      console.error('[PWA] Service Worker 注册失败:', error);
    },
  });

  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    await updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <UpdateBanner
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <UpdateContent>
            <h4>🎉 发现新版本</h4>
            <p>点击更新以获取最新功能和修复</p>
          </UpdateContent>
          <UpdateActions>
            <Button variant="primary" size="small" onClick={handleUpdate} disabled={updating}>
              {updating ? (
                <>
                  <FiRefreshCw className="spin" /> 更新中...
                </>
              ) : (
                <>
                  <FiRefreshCw /> 立即更新
                </>
              )}
            </Button>
            <CloseButton onClick={handleDismiss} title="稍后提醒">
              <FiX size={18} />
            </CloseButton>
          </UpdateActions>
        </UpdateBanner>
      )}
    </AnimatePresence>
  );
};
