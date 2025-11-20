import { useEffect, RefObject } from 'react';

export interface ClickOutsideOptions {
  /** 是否启用 */
  enabled?: boolean;
  /** 排除的元素（点击这些元素不会触发回调） */
  excludeRefs?: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[];
  /** 排除的选择器（点击匹配这些选择器的元素不会触发回调） */
  excludeSelectors?: string[];
  /** 是否使用捕获阶段 */
  useCapture?: boolean;
  /** 延迟添加监听器的时间（ms），避免立即触发 */
  delay?: number;
}

/**
 * 点击外部检测 Hook（增强版）
 * 当用户点击指定元素外部时触发回调
 *
 * @example
 * ```typescript
 * // 基础用法
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 *
 * // 排除特定元素
 * const menuRef = useRef(null);
 * const triggerRef = useRef(null);
 * useClickOutside(menuRef, () => setIsOpen(false), {
 *   excludeRefs: triggerRef,
 *   excludeSelectors: ['[data-tooltip]']
 * });
 *
 * // 使用捕获阶段
 * useClickOutside(ref, () => setIsOpen(false), {
 *   useCapture: true,
 *   delay: 100
 * });
 * ```
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null> | RefObject<T | null>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  options?: boolean | ClickOutsideOptions,
) => {
  // 兼容旧的 API：useClickOutside(ref, handler, true)
  const config: ClickOutsideOptions =
    typeof options === 'boolean' ? { enabled: options } : { enabled: true, ...options };

  useEffect(() => {
    const { enabled = true, excludeRefs, excludeSelectors, useCapture = false, delay = 0 } = config;

    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      const target = event.target as HTMLElement;

      // 检查点击是否在主要 ref 内部
      const isInsideMain = refs.some((r) => {
        const element = r.current;
        return element && element.contains(target);
      });

      if (isInsideMain) return;

      // 检查点击是否在排除的 ref 内部
      if (excludeRefs) {
        const excludes = Array.isArray(excludeRefs) ? excludeRefs : [excludeRefs];
        const isInsideExclude = excludes.some((r) => {
          const element = r.current;
          return element && element.contains(target);
        });

        if (isInsideExclude) return;
      }

      // 检查点击是否匹配排除的选择器
      if (excludeSelectors && excludeSelectors.length > 0) {
        const matchesExcludeSelector = excludeSelectors.some((selector) => {
          return target.closest(selector) !== null;
        });

        if (matchesExcludeSelector) return;
      }

      // 如果点击在外部且不在排除列表中，触发回调
      handler(event);
    };

    // 延迟添加监听器，避免立即触发
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', listener, useCapture);
      document.addEventListener('touchstart', listener, useCapture);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', listener, useCapture);
      document.removeEventListener('touchstart', listener, useCapture);
    };
  }, [ref, handler, config]);
};

export default useClickOutside;
