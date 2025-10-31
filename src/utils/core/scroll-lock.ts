/**
 * 滚动条锁定工具类 - 简约版本
 */
class ScrollLock {
  private isLocked: boolean = false;
  private scrollbarWidth: number = 0;

  /**
   * 计算滚动条宽度
   */
  private getScrollbarWidth(): number {
    if (this.scrollbarWidth > 0) return this.scrollbarWidth;

    this.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    return this.scrollbarWidth;
  }

  /**
   * 锁定滚动条
   */
  lock(): void {
    if (this.isLocked) return;

    this.isLocked = true;
    const scrollbarWidth = this.getScrollbarWidth();

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.classList.add('scroll-locked');
  }

  /**
   * 解锁滚动条
   */
  unlock(): void {
    if (!this.isLocked) return;

    this.isLocked = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('scroll-locked');
  }

  /**
   * 检查是否已锁定
   */
  isScrollLocked(): boolean {
    return this.isLocked;
  }
}

// 创建单例实例
const scrollLock = new ScrollLock();

// 同时提供默认导出和命名导出
export default scrollLock;
export { scrollLock };
