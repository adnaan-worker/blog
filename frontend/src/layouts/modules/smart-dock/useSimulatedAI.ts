import { useState, useCallback, useRef, useEffect } from 'react';
import { useAI } from '@/hooks/useSocket';

export type AIState = 'idle' | 'thinking' | 'streaming' | 'done';

/**
 * 真实的 AI 流式对话 Hook
 * 使用 Socket.IO 与 Wayne (#89757) 机器人对话
 */
export function useSimulatedAI() {
  const [aiState, setAiState] = useState<AIState>('idle');
  const [reply, setReply] = useState('');
  const [inputValue, setInputValue] = useState('');
  const sessionIdRef = useRef<string | null>(null);

  const ai = useAI();

  // 监听 AI 流式响应
  useEffect(() => {
    const unsubChunk = ai.onChunk((data) => {
      const id = data.taskId || data.sessionId;
      if (id === sessionIdRef.current) {
        setReply((prev) => prev + data.chunk);
        if (aiState === 'thinking') {
          setAiState('streaming');
        }
      }
    });

    const unsubDone = ai.onDone((data) => {
      const id = data.taskId || data.sessionId;
      if (id === sessionIdRef.current) {
        setAiState('done');
        // 3秒后自动重置为 idle
        setTimeout(() => {
          setAiState('idle');
        }, 3000);
      }
    });

    const unsubError = ai.onError((data) => {
      const id = data.taskId || data.sessionId;
      if (id === sessionIdRef.current) {
        setAiState('idle');
        setReply('抱歉，我遇到了一些问题。请稍后再试。');
      }
    });

    return () => {
      unsubChunk();
      unsubDone();
      unsubError();
    };
  }, [ai, aiState]);

  const stop = useCallback(() => {
    if (sessionIdRef.current) {
      ai.cancel(sessionIdRef.current);
      sessionIdRef.current = null;
    }
    setAiState('idle');
  }, [ai]);

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (!ai.isConnected) {
        setReply('连接已断开，请刷新页面重试。');
        return;
      }

      // 重置状态
      stop();
      setInputValue('');
      setAiState('thinking');
      setReply('');

      // 生成会话 ID
      const sessionId = `chat_${Date.now()}`;
      sessionIdRef.current = sessionId;

      // 发送消息到 Wayne 机器人
      ai.chat(text, sessionId);
    },
    [ai, stop],
  );

  // 组件卸载时清理
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    aiState,
    reply,
    inputValue,
    setInputValue,
    send,
    stop,
    isConnected: ai.isConnected,
  };
}
