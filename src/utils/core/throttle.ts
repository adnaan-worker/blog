/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 节流间隔时间（毫秒），默认 300ms
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
};
