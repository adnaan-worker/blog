import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 剪贴板 Hook
 * 提供复制文本到剪贴板的功能
 *
 * @example
 * ```typescript
 * const { copy, copied, error } = useClipboard({ timeout: 2000 });
 *
 * <button onClick={() => copy('Hello World')}>
 *   {copied ? '已复制' : '复制'}
 * </button>
 * ```
 */
export const useClipboard = (options: UseClipboardOptions = {}) => {
  const { timeout = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        // 优先尝试使用现代 Clipboard API
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // 降级策略：使用 execCommand
          const textArea = document.createElement('textarea');
          textArea.value = text;

          // 确保 textarea 不可见但可选中
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          textArea.style.top = '0';
          textArea.style.opacity = '0';

          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            const successful = document.execCommand('copy');
            if (!successful) {
              throw new Error('Copy command failed');
            }
          } finally {
            document.body.removeChild(textArea);
          }
        }

        setCopied(true);
        setError(null);
        onSuccess?.();

        // 重置状态
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        console.warn('Copy failed:', error);
        setError(error);
        onError?.(error);
        return false;
      }
    },
    [timeout, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { copy, copied, error, reset };
};

export default useClipboard;
