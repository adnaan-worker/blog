/**
 * 滚动锁定工具类
 *
 * 设计理念：
 * - 弹窗是独立层，不改变底部页面的任何视觉状态（滚动条始终可见）
 * - 通过事件阻止来防止穿透滚动，而非隐藏滚动条
 * - 支持多个弹窗同时打开（引用计数）
 *
 * 使用方式：
 * ```typescript
 * import { useModalScrollLock } from '@/hooks';
 *
 * // 在组件中使用
 * useModalScrollLock(isOpen);
 * ```
 */

class ScrollLock {
  private lockCount: number = 0;
  private scrollTop: number = 0;

  /**
   * 阻止滚轮滚动
   * 智能识别：允许弹窗内部可滚动元素滚动，阻止页面滚动
   */
  private preventScroll = (e: Event): boolean => {
    const target = e.target as HTMLElement;

    // 检查是否在弹窗内部（支持 data-modal-body 和 data-modal-content）
    const modalBody = target.closest('[data-modal-body]') || target.closest('[data-modal-content]');
    if (modalBody instanceof HTMLElement) {
      // 在弹窗内，检查是否有可滚动的祖先元素（包括 modalBody 本身）
      let scrollableParent = target;
      while (scrollableParent) {
        const { overflowY, overflow } = window.getComputedStyle(scrollableParent);
        const isScrollable =
          (overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll') &&
          scrollableParent.scrollHeight > scrollableParent.clientHeight;

        if (isScrollable) {
          // 找到可滚动元素，检查是否滚到边界
          const wheelEvent = e as WheelEvent;
          const isScrollingDown = wheelEvent.deltaY > 0;
          const isAtTop = scrollableParent.scrollTop === 0;
          const isAtBottom =
            scrollableParent.scrollTop + scrollableParent.clientHeight >= scrollableParent.scrollHeight - 1;

          // 如果没到边界，允许滚动
          if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) {
            return true; // 允许滚动
          }

          // 滚到边界了，阻止继续滚动（防止穿透到页面）
          break;
        }

        // 到达 modalBody，停止查找
        if (scrollableParent === modalBody) {
          break;
        }

        scrollableParent = scrollableParent.parentElement as HTMLElement;
      }
    }

    // 其他情况：阻止滚动
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  /**
   * 阻止键盘滚动
   * 智能识别：在输入框中允许正常输入，其他地方阻止滚动按键
   */
  private preventKeyScroll = (e: KeyboardEvent): void => {
    const scrollKeys = ['Space', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'];

    if (scrollKeys.includes(e.code)) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (!isInput) {
        e.preventDefault();
      }
    }
  };

  /**
   * 阻止触摸滚动
   * 智能识别：允许弹窗内部滚动，只阻止页面滚动
   */
  private preventTouchMove = (e: TouchEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-modal-body]') && !target.closest('[data-modal-content]')) {
      e.preventDefault();
    }
  };

  /**
   * 锁定滚动
   */
  lock(): void {
    this.lockCount++;

    // 支持多个弹窗，只在首次锁定时添加监听器
    if (this.lockCount > 1) return;

    // 保存当前滚动位置（防止意外变化）
    this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 阻止所有滚动方式
    window.addEventListener('wheel', this.preventScroll, { passive: false });
    window.addEventListener('touchmove', this.preventTouchMove, { passive: false });
    window.addEventListener('keydown', this.preventKeyScroll, { passive: false });
  }

  /**
   * 解锁滚动
   */
  unlock(): void {
    this.lockCount = Math.max(0, this.lockCount - 1);

    // 支持多个弹窗，只在全部关闭时移除监听器
    if (this.lockCount > 0) return;

    // 移除所有事件监听器
    window.removeEventListener('wheel', this.preventScroll);
    window.removeEventListener('touchmove', this.preventTouchMove);
    window.removeEventListener('keydown', this.preventKeyScroll);

    // 恢复滚动位置（确保位置没有被意外改变）
    if (this.scrollTop > 0) {
      window.scrollTo(0, this.scrollTop);
    }

    this.scrollTop = 0;
  }

  /**
   * 强制解锁（用于错误恢复）
   */
  forceUnlock(): void {
    this.lockCount = 0;
    this.unlock();
  }

  /**
   * 检查是否已锁定
   */
  isLocked(): boolean {
    return this.lockCount > 0;
  }

  /**
   * 获取当前锁定计数
   */
  getLockCount(): number {
    return this.lockCount;
  }
}

// 创建单例
const scrollLock = new ScrollLock();

// 页面卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scrollLock.forceUnlock();
  });
}

export default scrollLock;
export { scrollLock };
