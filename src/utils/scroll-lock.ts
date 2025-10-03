/**
 * 滚动锁定管理工具
 * 统一管理页面滚动状态，避免多个组件同时修改 body 样式导致冲突
 */

class ScrollLockManager {
  private static instance: ScrollLockManager;
  private lockCount = 0;
  private originalStyle: Partial<CSSStyleDeclaration> = {};
  private scrollPosition = { x: 0, y: 0 };
  private locked = false;

  private constructor() {}

  public static getInstance(): ScrollLockManager {
    if (!ScrollLockManager.instance) {
      ScrollLockManager.instance = new ScrollLockManager();
    }
    return ScrollLockManager.instance;
  }

  /**
   * 锁定滚动
   */
  public lock(): void {
    this.lockCount++;

    // 如果已经锁定，直接返回
    if (this.locked) {
      return;
    }

    // 保存当前滚动位置
    this.scrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
    };

    // 计算滚动条宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 保存原始样式
    this.originalStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
      overflow: document.body.style.overflow,
    };

    // 应用锁定样式
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition.y}px`;
    document.body.style.left = `-${this.scrollPosition.x}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    this.locked = true;
  }

  /**
   * 解锁滚动
   */
  public unlock(): void {
    this.lockCount = Math.max(0, this.lockCount - 1);

    // 如果还有其他锁，不恢复
    if (this.lockCount > 0) {
      return;
    }

    // 如果没有锁定，直接返回
    if (!this.locked) {
      return;
    }

    // 恢复原始样式
    document.body.style.position = this.originalStyle.position || '';
    document.body.style.top = this.originalStyle.top || '';
    document.body.style.left = this.originalStyle.left || '';
    document.body.style.width = this.originalStyle.width || '';
    document.body.style.paddingRight = this.originalStyle.paddingRight || '';
    document.body.style.overflow = this.originalStyle.overflow || '';

    // 恢复滚动位置
    if (this.scrollPosition.y > 0) {
      window.scrollTo({
        left: this.scrollPosition.x,
        top: this.scrollPosition.y,
        behavior: 'instant',
      });
    }

    // 重置状态
    this.locked = false;
    this.originalStyle = {};
    this.scrollPosition = { x: 0, y: 0 };
  }

  /**
   * 强制解锁（用于清理）
   */
  public forceUnlock(): void {
    this.lockCount = 0;
    this.locked = false;

    // 立即恢复所有样式
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';

    // 重置状态
    this.originalStyle = {};
    this.scrollPosition = { x: 0, y: 0 };
  }

  /**
   * 获取当前锁定状态
   */
  public isLocked(): boolean {
    return this.locked;
  }

  /**
   * 获取调试信息
   */
  public getDebugInfo(): any {
    return {
      lockCount: this.lockCount,
      scrollPosition: this.scrollPosition,
      bodyStyle: {
        position: document.body.style.position,
        overflow: document.body.style.overflow,
        top: document.body.style.top,
        left: document.body.style.left,
      },
      originalStyle: this.originalStyle,
    };
  }
}

// 导出单例实例
export const scrollLock = ScrollLockManager.getInstance();

// 导出 React Hook
export const useScrollLock = (isLocked: boolean) => {
  const React = require('react');

  React.useEffect(() => {
    if (isLocked) {
      scrollLock.lock();
    } else {
      scrollLock.unlock();
    }

    // 组件卸载时确保解锁
    return () => {
      scrollLock.unlock();
    };
  }, [isLocked]);
};

// 页面卸载时强制解锁
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    scrollLock.forceUnlock();
  });

  // 页面隐藏时也强制解锁，防止状态不一致
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      scrollLock.forceUnlock();
    }
  });
  // 添加强制解锁方法，方便在控制台调试
  (window as any).forceUnlockScroll = () => {
    console.log('🚨 手动强制解锁滚动');
    scrollLock.forceUnlock();
  };
}
