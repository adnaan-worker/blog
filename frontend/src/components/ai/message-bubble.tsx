import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import RichTextRenderer from '../rich-text/rich-text-renderer';
import { FiUser, FiCpu } from 'react-icons/fi';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

const BubbleContainer = styled(motion.div)<{ isUser: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  padding: 0 0.5rem;
`;

const Avatar = styled.div<{ isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 10px; /* Squircle */
  background: ${(props) => (props.isUser ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'white')};
  color: ${(props) => (props.isUser ? '#fff' : '#4f46e5')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: ${(props) => (props.isUser ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)')};
  flex-shrink: 0;
  order: ${(props) => (props.isUser ? 2 : 0)}; /* 用户头像在右，AI 在左 */
`;

const ContentWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  order: 1;
`;

const Name = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  margin-left: 2px;
`;

const Content = styled.div<{ isUser: boolean }>`
  position: relative;
  font-size: 0.95rem;
  line-height: 1.6;
  width: 100%; /* 确保宽度受控 */
  min-width: 0; /* 防止 Flex 溢出 */

  /* 用户消息：胶囊气泡 */
  ${(props) =>
    props.isUser &&
    `
    padding: 0.875rem 1.25rem;
    background: linear-gradient(135deg, rgba(var(--bg-secondary-rgb), 0.8) 0%, rgba(var(--bg-secondary-rgb), 0.6) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--border-rgb), 0.1);
    border-radius: 20px;
    border-bottom-right-radius: 4px;
    color: var(--text-primary);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  `}

  /* AI 消息：无背景，直接渲染 */
  ${(props) =>
    !props.isUser &&
    `
    padding: 0;
    background: transparent;
    color: var(--text-primary);
    
    /* 优化 Markdown 样式 */
    p { margin-bottom: 0.75rem; }
    h1, h2, h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; }
    ul, ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
    li { margin-bottom: 0.25rem; }
    pre { 
      background: rgba(var(--bg-tertiary-rgb), 0.5) !important; 
      border: 1px solid rgba(var(--border-rgb), 0.1);
      border-radius: 12px;
      margin: 1rem 0;
      padding: 1rem;
      overflow-x: auto; /* 允许横向滚动 */
      max-width: 100%; /* 限制最大宽度 */
    }
    code { 
      font-family: 'JetBrains Mono', monospace; 
      font-size: 0.85em; 
    }
    a { 
      color: var(--accent-color); 
      text-decoration: none; 
      border-bottom: 1px dashed var(--accent-color);
      &:hover { border-bottom-style: solid; }
    }
    /* 确保图片也不溢出 */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  `}
`;

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <BubbleContainer
      isUser={isUser}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <Avatar isUser={isUser}>{isUser ? <FiUser size={16} /> : <FiCpu size={18} />}</Avatar>

      <ContentWrapper isUser={isUser}>
        <Name>{isUser ? 'You' : 'Wayne'}</Name>
        <Content isUser={isUser}>{isUser ? content : <RichTextRenderer content={content} />}</Content>
      </ContentWrapper>
    </BubbleContainer>
  );
};
