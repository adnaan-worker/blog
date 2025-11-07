/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒），默认 300ms
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): ((...args: Parameters<T>) => void) => {
  let timer: number | null = null;

  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);

    timer = window.setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};
