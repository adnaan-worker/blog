import { useState, useCallback, useRef, useEffect } from 'react';

export type AIState = 'idle' | 'thinking' | 'streaming' | 'done';

const MOCK_RESPONSES: Record<string, string> = {
  default:
    '这是一个模拟的 AI 回复。既然您还没有准备好后端流式接口，我先在这里陪您聊聊天。您可以问我关于前端开发、设计模式或者天气的问题。',
  summary:
    '这篇文章主要讲述了 React 19 的新特性，包括 Server Components、Actions 以及对 Hooks 的改进。它还深入探讨了并发模式下的性能优化技巧。',
  music: '为您推荐一首轻音乐：《River Flows In You》。希望这首曲子能让您在忙碌的编码工作中感到一丝轻松。',
  news: '今日科技新闻：OpenAI 发布了新的模型；React 团队更新了文档；TypeScript 5.4 正式版发布，带来了更强大的类型推导能力。',
};

export function useSimulatedAI() {
  const [aiState, setAiState] = useState<AIState>('idle');
  const [reply, setReply] = useState('');
  const [inputValue, setInputValue] = useState('');
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setAiState('idle');
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      // 重置状态
      stop();
      setInputValue(''); // 清空输入框（如果是通过输入框发送）
      setAiState('thinking');
      setReply('');

      // 模拟思考延迟
      setTimeout(() => {
        setAiState('streaming');

        // 选择回复内容
        let targetText = MOCK_RESPONSES.default;
        if (text.includes('总结') || text.includes('文章')) targetText = MOCK_RESPONSES.summary;
        else if (text.includes('音乐') || text.includes('歌')) targetText = MOCK_RESPONSES.music;
        else if (text.includes('新闻')) targetText = MOCK_RESPONSES.news;

        let i = 0;
        streamTimerRef.current = setInterval(() => {
          setReply((prev) => targetText.substring(0, i + 1));
          i++;
          if (i >= targetText.length) {
            if (streamTimerRef.current) clearInterval(streamTimerRef.current);
            setAiState('done');
          }
        }, 30); // 打字机速度
      }, 1500);
    },
    [stop],
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
  };
}
