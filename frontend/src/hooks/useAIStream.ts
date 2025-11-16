import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket, useSocketEvent } from './useSocket';

/**
 * AI 流式输出 Hook
 * 用于实时接收 AI 生成的内容
 */

interface AIStreamState {
  isStreaming: boolean;
  streamContent: string;
  currentTaskId: string | null;
  error: string | null;
}

export const useAIStream = () => {
  const { isConnected, emit } = useSocket();
  const [state, setState] = useState<AIStreamState>({
    isStreaming: false,
    streamContent: '',
    currentTaskId: null,
    error: null,
  });

  const callbackRef = useRef<((content: string) => void) | null>(null);

  // 监听流式数据块
  useSocketEvent('ai:chunk', (data: { chunk: string; taskId: string; action?: string }) => {
    setState((prev) => {
      // 检查 taskId 是否匹配，防止多任务混淆
      if (data.taskId && prev.currentTaskId && data.taskId !== prev.currentTaskId) {
        return prev; // 忽略不匹配的数据
      }
      const newContent = prev.streamContent + data.chunk;
      return {
        ...prev,
        streamContent: newContent,
      };
    });

    // 调用回调函数
    if (callbackRef.current) {
      callbackRef.current(data.chunk);
    }
  });

  // 监听生成完成
  useSocketEvent('ai:done', (data: { taskId: string; action?: string }) => {
    setState((prev) => {
      // 检查 taskId 是否匹配
      if (data.taskId && prev.currentTaskId && data.taskId !== prev.currentTaskId) {
        return prev;
      }
      return {
        ...prev,
        isStreaming: false,
      };
    });
  });

  // 监听错误
  useSocketEvent('ai:error', (data: { taskId: string; error: string }) => {
    if (data.taskId === state.currentTaskId) {
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: data.error,
      }));
    }
  });

  // 监听取消
  useSocketEvent('ai:cancelled', (data: { taskId: string }) => {
    setState((prev) => {
      // 检查 taskId 是否匹配
      if (data.taskId && prev.currentTaskId && data.taskId !== prev.currentTaskId) {
        return prev;
      }
      return {
        ...prev,
        isStreaming: false,
      };
    });
  });

  /**
   * 流式聊天
   */
  const streamChat = useCallback(
    (message: string, sessionId?: string, onChunk?: (chunk: string) => void) => {
      if (!isConnected) {
        setState((prev) => ({ ...prev, error: 'Socket 未连接' }));
        return null;
      }

      const taskId = `chat_${Date.now()}`;
      setState({
        isStreaming: true,
        streamContent: '',
        currentTaskId: taskId,
        error: null,
      });

      callbackRef.current = onChunk || null;

      emit('ai:stream_chat', { message, sessionId });
      return taskId;
    },
    [isConnected, emit],
  );

  /**
   * 流式润色
   */
  const streamPolish = useCallback(
    (content: string, style: string = '更加流畅和专业', onChunk?: (chunk: string) => void) => {
      if (!isConnected) {
        setState((prev) => ({ ...prev, error: 'Socket 未连接' }));
        return null;
      }

      const taskId = `polish_${Date.now()}`;
      setState({
        isStreaming: true,
        streamContent: '',
        currentTaskId: taskId,
        error: null,
      });

      callbackRef.current = onChunk || null;

      emit('ai:stream_polish', { content, style, taskId });
      return taskId;
    },
    [isConnected, emit],
  );

  /**
   * 流式改进
   */
  const streamImprove = useCallback(
    (content: string, improvements: string = '提高可读性和逻辑性', onChunk?: (chunk: string) => void) => {
      if (!isConnected) {
        setState((prev) => ({ ...prev, error: 'Socket 未连接' }));
        return null;
      }

      const taskId = `improve_${Date.now()}`;
      setState({
        isStreaming: true,
        streamContent: '',
        currentTaskId: taskId,
        error: null,
      });

      callbackRef.current = onChunk || null;

      emit('ai:stream_improve', { content, improvements, taskId });
      return taskId;
    },
    [isConnected, emit],
  );

  /**
   * 流式扩展
   */
  const streamExpand = useCallback(
    (content: string, length: 'short' | 'medium' | 'long' = 'medium', onChunk?: (chunk: string) => void) => {
      if (!isConnected) {
        setState((prev) => ({ ...prev, error: 'Socket 未连接' }));
        return null;
      }

      const taskId = `expand_${Date.now()}`;
      setState({
        isStreaming: true,
        streamContent: '',
        currentTaskId: taskId,
        error: null,
      });

      callbackRef.current = onChunk || null;

      emit('ai:stream_expand', { content, length, taskId });
      return taskId;
    },
    [isConnected, emit],
  );

  /**
   * 取消任务
   */
  const cancelTask = useCallback(
    (taskId?: string) => {
      const targetTaskId = taskId || state.currentTaskId;
      if (!targetTaskId) return;

      emit('ai:cancel', { taskId: targetTaskId });
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        currentTaskId: null,
      }));
    },
    [emit, state.currentTaskId],
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      streamContent: '',
      currentTaskId: null,
      error: null,
    });
    callbackRef.current = null;
  }, []);

  /**
   * 流式总结
   */
  const streamSummarize = useCallback(
    (content: string, length: 'short' | 'medium' | 'long' = 'medium', onChunk?: (chunk: string) => void) => {
      if (!isConnected) {
        setState((prev) => ({ ...prev, error: 'Socket 未连接' }));
        return null;
      }

      const taskId = `summarize_${Date.now()}`;
      setState({
        isStreaming: true,
        streamContent: '',
        currentTaskId: taskId,
        error: null,
      });

      callbackRef.current = onChunk || null;

      emit('ai:stream_summarize', { content, length, taskId });
      return taskId;
    },
    [isConnected, emit],
  );

  /**
   * 流式翻译
   */
  const streamTranslate = useCallback(
    (content: string, targetLang: string = '英文', onChunk?: (chunk: string) => void) => {
      if (!isConnected) {
        setState((prev) => ({ ...prev, error: 'Socket 未连接' }));
        return null;
      }

      const taskId = `translate_${Date.now()}`;
      setState({
        isStreaming: true,
        streamContent: '',
        currentTaskId: taskId,
        error: null,
      });

      callbackRef.current = onChunk || null;

      emit('ai:stream_translate', { content, targetLang, taskId });
      return taskId;
    },
    [isConnected, emit],
  );

  return {
    // 状态
    isConnected,
    isStreaming: state.isStreaming,
    streamContent: state.streamContent,
    currentTaskId: state.currentTaskId,
    error: state.error,

    // 方法
    streamChat,
    streamPolish,
    streamImprove,
    streamExpand,
    streamSummarize,
    streamTranslate,
    cancelTask,
    reset,
  };
};

export default useAIStream;
