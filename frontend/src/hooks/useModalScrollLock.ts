import { useEffect, useRef } from 'react';
import { scrollLock } from '@/utils';

/**
 * 模态框滚动锁定 Hook
 *
 * 功能：
 * - 自动管理模态框打开/关闭时的滚动锁定
 * - 保持页面滚动条可见，避免页面抖动
 * - 支持多个模态框同时打开（引用计数）
 * - 关闭时延迟解锁，等待退出动画完成
 *
 * @param isOpen - 模态框是否打开
 * @param animationDuration - 关闭动画时长（ms），默认 300ms
 *
 * @example 单个模态框
 * ```tsx
 * const [modalOpen, setModalOpen] = useState(false);
 * useModalScrollLock(modalOpen);
 *
 * return <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
 * ```
 *
 * @example 多个模态框
 * ```tsx
 * const [loginOpen, setLoginOpen] = useState(false);
 * const [registerOpen, setRegisterOpen] = useState(false);
 *
 * // 任意一个打开时锁定滚动
 * useModalScrollLock(loginOpen || registerOpen);
 * ```
 *
 * @example 自定义动画时长
 * ```tsx
 * useModalScrollLock(isOpen, 500); // 500ms 动画
 * ```
 */
export const useModalScrollLock = (isOpen: boolean, animationDuration: number = 300): void => {
  const unlockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLockedRef = useRef(false);

  useEffect(() => {
    // 清除之前的解锁定时器
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }

    if (isOpen) {
      // 模态框打开，立即锁定滚动
      scrollLock.lock();
      hasLockedRef.current = true;
    } else if (hasLockedRef.current) {
      // 模态框关闭，延迟解锁（等待退出动画完成）
      unlockTimerRef.current = setTimeout(() => {
        scrollLock.unlock();
        hasLockedRef.current = false;
      }, animationDuration + 50); // 动画时长 + 50ms 缓冲
    }

    // 组件卸载时确保解锁
    return () => {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
      // 如果曾经锁定过，立即解锁
      if (hasLockedRef.current) {
        scrollLock.unlock();
        hasLockedRef.current = false;
      }
    };
  }, [isOpen, animationDuration]);
};
