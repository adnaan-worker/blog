import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { MessageList } from './message-list';
import { InputArea } from './input-area';
import { useAI, useMessageQueue } from '@/hooks/useSocket';
import { FiRefreshCw, FiTrash2, FiAlertCircle, FiClock } from 'react-icons/fi';

interface ChatWindowProps {
  onClose?: () => void;
  headerMode?: 'default' | 'simple' | 'none';
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  status?: 'sending' | 'sent' | 'failed'; // 消息发送状态
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 更柔和的背景，消除断层感 */
  background: linear-gradient(to bottom, rgba(var(--bg-secondary-rgb), 0.3) 0%, rgba(var(--bg-primary-rgb), 0.5) 100%);
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem; /* Remove vertical padding to rely on height for centering */
  padding-right: 60px; /* Adjust space for close button */
  /* 完全透明，移除断层 */
  background: transparent;
  z-index: 30;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px; /* Reduced height for better alignment with standard close buttons */
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  z-index: 1;
  padding-top: 56px; /* Match Header height */
  /* 双向遮罩：顶部渐隐（防止与Header文字重叠），底部渐隐（输入框后方） */
  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%);
`;

const InputContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  pointer-events: none; /* Allow clicks to pass through to messages */

  /* Re-enable pointer events for the input component */
  & > * {
    pointer-events: auto;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
`;

const QueueIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  color: #ff9800;
  font-weight: 500;

  svg {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const StatusBadge = styled.div<{ status: 'online' | 'offline' | 'thinking' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(var(--bg-tertiary-rgb), 0.5);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(var(--border-rgb), 0.1);

  span {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) => {
      switch (props.status) {
        case 'online':
          return '#10b981';
        case 'offline':
          return '#ef4444';
        case 'thinking':
          return '#f59e0b';
        default:
          return '#d1d5db';
      }
    }};
    box-shadow: ${(props) => (props.status === 'thinking' ? '0 0 8px #f59e0b' : 'none')};
    animation: ${(props) => (props.status === 'thinking' ? 'pulse 1.5s infinite' : 'none')};
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: rgba(var(--bg-tertiary-rgb), 0.4);
    color: var(--text-secondary);
    border-radius: 10px; /* 更圆润 */
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(4px);

    &:hover {
      background: rgba(var(--text-rgb), 0.08);
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0) scale(0.95);
    }
  }
`;

export const AIChatWindow: React.FC<ChatWindowProps> = ({ onClose, headerMode = 'default' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const ai = useAI();
  const messageQueue = useMessageQueue();
  const sessionIdRef = useRef<string | null>(null);

  // 初始化会话
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `chat_${Date.now()}`;
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;
    }
  }, []);

  // 优化：使用 ref 存储 content 避免依赖闭包问题
  const contentRef = useRef('');
  useEffect(() => {
    contentRef.current = streamingContent;
  }, [streamingContent]);

  // 用于追踪已完整处理的消息ID（防止重复添加到列表）
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // 监听 AI 事件
  useEffect(() => {
    const unsubChunk = ai.onChunk((data) => {
      const id = data.taskId || data.sessionId;
      if (id !== sessionIdRef.current) return;

      // 如果这条消息已经完整处理并添加到列表了，完全忽略
      if (data.messageId && processedMessagesRef.current.has(data.messageId)) {
        console.log('[AI] 忽略已完成消息的chunk:', data.messageId);
        return;
      }

      // 正常追加内容
      setStreamingContent((prev) => prev + data.chunk);
      setIsStreaming(true);
    });

    const unsubDone = ai.onDone((data) => {
      const id = data.taskId || data.sessionId;
      if (id !== sessionIdRef.current) return;

      // 🎯 如果是缓存的done（重连场景），直接忽略
      // 原因：内容已经在streamingContent里了，不需要再添加
      if (data.cached) {
        console.log('[AI] 收到缓存done，内容已在气泡中，停止流式状态');
        setIsStreaming(false);
        return;
      }

      // 如果这条消息已经完整处理过，也忽略
      if (data.messageId && processedMessagesRef.current.has(data.messageId)) {
        console.log('[AI] 忽略已完成消息的done:', data.messageId);
        return;
      }

      // 使用 contentRef 获取完整的流式内容
      const finalContent = contentRef.current;

      if (finalContent) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: finalContent,
            timestamp: new Date().toISOString(),
          },
        ]);

        // 标记消息已处理（这是关键！）
        if (data.messageId) {
          processedMessagesRef.current.add(data.messageId);
          console.log('[AI] 消息已标记为完成:', data.messageId);
        }
      }

      setStreamingContent('');
      setIsStreaming(false);
      contentRef.current = ''; // 重置 ref
    });

    const unsubError = ai.onError((data) => {
      const id = data.taskId || data.sessionId;
      if (id === sessionIdRef.current) {
        setIsStreaming(false);
        adnaan.toast.error(data.error);
        setStreamingContent('');
        contentRef.current = '';
      }
    });

    return () => {
      unsubChunk();
      unsubDone();
      unsubError();
    };
  }, [ai]); // 只依赖 ai，不依赖 streamingContent

  const handleSend = (text: string) => {
    const msgId = `msg_${Date.now()}`;

    // 添加用户消息（初始状态为 sending）
    const userMsg: Message = {
      id: msgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, userMsg]);

    // 开始流式请求
    setIsStreaming(true);
    setStreamingContent('');
    contentRef.current = '';

    if (sessionIdRef.current) {
      // 使用可靠发送，带回调
      ai.chat(
        text,
        sessionIdRef.current,
        // 成功回调
        () => {
          setMessages((prev) => prev.map((msg) => (msg.id === msgId ? { ...msg, status: 'sent' } : msg)));
        },
        // 失败回调
        (error) => {
          setMessages((prev) => prev.map((msg) => (msg.id === msgId ? { ...msg, status: 'failed' } : msg)));
          adnaan.toast.error(error.error || '消息发送失败，将自动重试');
        },
      );
    }
  };

  const handleStop = () => {
    if (sessionIdRef.current) {
      ai.cancel(sessionIdRef.current);
      setIsStreaming(false);

      // 如果有部分内容，保存它
      if (contentRef.current) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: contentRef.current + ' [已停止]',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
      setStreamingContent('');
    }
  };

  const handleClear = () => {
    setMessages([]);
    const newSessionId = `chat_${Date.now()}`;
    setSessionId(newSessionId);
    sessionIdRef.current = newSessionId;
    adnaan.toast.success('会话已重置');
  };

  return (
    <Container>
      {headerMode !== 'none' && (
        <Header style={headerMode === 'simple' ? { background: 'transparent', padding: '1rem' } : {}}>
          <Title>
            {headerMode === 'default' && <h3>Wayne AI</h3>}
            {/* 消息队列状态提示 */}
            {messageQueue.pendingCount > 0 && (
              <QueueIndicator title="有消息正在发送或等待重试">
                <FiClock size={12} />
                <span>{messageQueue.pendingCount} 条待发送</span>
              </QueueIndicator>
            )}
            {/* 离线提示 */}
            {!ai.isConnected && (
              <QueueIndicator
                style={{
                  background: 'rgba(244, 67, 54, 0.1)',
                  borderColor: 'rgba(244, 67, 54, 0.3)',
                  color: '#f44336',
                }}
              >
                <FiAlertCircle size={12} />
                <span>连接断开</span>
              </QueueIndicator>
            )}
          </Title>
          <Actions>
            <button onClick={handleClear} title="清空历史">
              <FiTrash2 />
            </button>
          </Actions>
        </Header>
      )}

      <ContentArea style={{ paddingTop: headerMode === 'none' ? 0 : '60px' }}>
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onSuggestionClick={handleSend} // 传递发送函数
        />
      </ContentArea>

      <InputContainer>
        <InputArea onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} disabled={!ai.isConnected} />
      </InputContainer>
    </Container>
  );
};
