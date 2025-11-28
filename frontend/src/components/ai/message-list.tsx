import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { MessageBubble } from './message-bubble';
import { ThinkingBubble } from './thinking-bubble';
import { AnimatePresence, motion } from 'framer-motion';
import FadeScrollContainer from '../common/fade-scroll-container';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  streamingContent?: string;
  onSuggestionClick?: (text: string) => void;
}

// 使用 styled 包装 FadeScrollContainer 以适应 Flex 布局
const StyledFadeScroll = styled(FadeScrollContainer)`
  flex: 1;
  position: relative;
  height: 100%;
`;

// 实际滚动的容器
const Container = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scroll-behavior: smooth;
  padding-bottom: 120px;
  padding-top: 20px;

  /* 移动端滚动优化 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;

  /* 隐藏滚动条 */
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const WelcomeContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(var(--bg-tertiary-rgb), 0.5), rgba(var(--bg-secondary-rgb), 0.8));
  border: 1px solid rgba(var(--border-rgb), 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  font-size: 2rem;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
`;

const Description = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 280px;
  margin: 0 auto 2rem;
  opacity: 0.8;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
`;

const SuggestionChip = styled(motion.button)`
  padding: 0.75rem 1rem;
  background: rgba(var(--bg-tertiary-rgb), 0.4);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  border-radius: 16px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: rgba(var(--bg-tertiary-rgb), 0.8);
    color: var(--text-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  span {
    opacity: 0;
    transform: translateX(-5px);
    transition: all 0.2s;
  }

  &:hover span {
    opacity: 1;
    transform: translateX(0);
  }
`;

const SUGGESTIONS = [
  '介绍一下 React 19 的新特性',
  '如何优化 Node.js 服务性能？',
  '帮我写一段 Python 爬虫代码',
  '解释一下什么是 RAG',
];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  streamingContent,
  onSuggestionClick,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, isStreaming]);

  return (
    <StyledFadeScroll fadeHeight={60} dependencies={[messages, streamingContent]} data-modal-body="true">
      <Container>
        {messages.length === 0 && !isStreaming && (
          <WelcomeContainer
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <IconWrapper>👋</IconWrapper>
            <Title>Hi, I'm Wayne</Title>
            <Description>我是光阴副本的 AI 助手。我可以帮你解答技术问题、寻找文章，或者只是陪你聊聊天。</Description>

            <SuggestionsGrid>
              {SUGGESTIONS.map((text, index) => (
                <SuggestionChip
                  key={index}
                  onClick={() => onSuggestionClick?.(text)}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                >
                  {text}
                  <span>→</span>
                </SuggestionChip>
              ))}
            </SuggestionsGrid>
          </WelcomeContainer>
        )}

        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          ))}
        </AnimatePresence>

        {isStreaming && !streamingContent && <ThinkingBubble />}

        {isStreaming && streamingContent && (
          <MessageBubble role="assistant" content={streamingContent + '<span class="rich-text-cursor"></span>'} />
        )}

        <div ref={bottomRef} style={{ height: 0, width: '100%', flexShrink: 0 }} />
      </Container>
    </StyledFadeScroll>
  );
};
