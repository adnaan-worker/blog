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
      if (!navigator?.clipboard) {
        const err = new Error('Clipboard API not supported');
        setError(err);
        onError?.(err);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        onSuccess?.();

        // 重置状态
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        const error = err as Error;
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
