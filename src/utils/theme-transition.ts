/**
 * 主题切换动画工具
 * 使用 View Transitions API 实现丝滑的主题切换效果
 */

interface TransitionOptions {
  /**
   * 动画起始点的 x 坐标（相对于视口）
   */
  x?: number;
  /**
   * 动画起始点的 y 坐标（相对于视口）
   */
  y?: number;
  /**
   * 动画持续时间（毫秒）
   */
  duration?: number;
}

/**
 * 检查浏览器是否支持 View Transitions API
 */
export const supportsViewTransitions = (): boolean => {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
};

/**
 * 执行主题切换动画
 * @param updateFn 更新主题的回调函数
 * @param options 动画选项
 */
export const executeThemeTransition = async (updateFn: () => void, options: TransitionOptions = {}): Promise<void> => {
  const { x, y, duration = 800 } = options;

  // 如果浏览器不支持 View Transitions API，直接执行更新
  if (!supportsViewTransitions()) {
    updateFn();
    return;
  }

  // 计算动画的起始位置和半径
  const clipPath = calculateClipPath(x, y);

  // 设置 CSS 变量用于动画
  document.documentElement.style.setProperty('--theme-transition-duration', `${duration}ms`);
  if (x !== undefined && y !== undefined) {
    document.documentElement.style.setProperty('--theme-transition-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-transition-y', `${y}px`);
    document.documentElement.style.setProperty('--theme-transition-radius', `${clipPath.endRadius}px`);
  }

  // 使用 View Transitions API
  const transition = (document as any).startViewTransition(() => {
    updateFn();
  });

  try {
    await transition.ready;
  } catch (error) {
    // 如果过渡失败，确保主题仍然被更新
    console.warn('View transition failed, theme updated without animation', error);
  }
};

/**
 * 计算圆形裁剪路径的参数
 */
const calculateClipPath = (x?: number, y?: number) => {
  if (x === undefined || y === undefined) {
    // 如果没有提供坐标，从视口中心开始
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }

  // 计算到视口四个角的距离，取最大值作为动画半径
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  return { x, y, endRadius };
};

/**
 * 获取元素的中心点坐标（用于从按钮位置开始动画）
 */
export const getElementCenter = (element: HTMLElement): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

/**
 * 预加载动画相关的样式（可选的性能优化）
 */
export const preloadTransitionStyles = () => {
  if (!supportsViewTransitions()) return;

  // 触发一次空的 view transition 来预热 API
  requestAnimationFrame(() => {
    if ((document as any).startViewTransition) {
      const dummyTransition = (document as any).startViewTransition(() => {
        // 不做任何事，只是预热
      });
      dummyTransition.skipTransition?.();
    }
  });
};
