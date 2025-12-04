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
  border-radius: 50%; /* Circle */
  background: ${(props) => (props.isUser ? 'var(--accent-color)' : 'rgba(var(--bg-tertiary-rgb), 0.8)')};
  color: ${(props) => (props.isUser ? '#fff' : 'var(--text-primary)')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: ${(props) => (props.isUser ? '0 4px 12px rgba(var(--accent-rgb), 0.3)' : 'none')};
  border: 1px solid rgba(var(--border-rgb), 0.1);
  flex-shrink: 0;
  order: ${(props) => (props.isUser ? 2 : 0)};
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
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
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  margin-left: 2px;
  opacity: 0.8;
`;

const Content = styled.div<{ isUser: boolean }>`
  position: relative;
  font-size: 0.95rem;
  line-height: 1.6;
  width: 100%;
  min-width: 0;

  ${(props) =>
    props.isUser &&
    `
    padding: 0.875rem 1.25rem;
    background: rgba(var(--bg-secondary-rgb), 0.7);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--border-rgb), 0.1);
    border-radius: 20px;
    border-bottom-right-radius: 4px;
    color: var(--text-primary);
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  `}

  ${(props) =>
    !props.isUser &&
    `
    padding: 0;
    background: transparent;
    color: var(--text-primary);
    
    p { margin-bottom: 0.75rem; }
    p:last-child { margin-bottom: 0; }
    h1, h2, h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; letter-spacing: -0.02em; }
    ul, ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
    li { margin-bottom: 0.25rem; }
    blockquote {
      border-left: 3px solid var(--accent-color);
      padding-left: 1rem;
      margin: 1rem 0;
      color: var(--text-secondary);
      font-style: italic;
    }
    pre { 
      background: rgba(var(--bg-tertiary-rgb), 0.4) !important; 
      border: 1px solid rgba(var(--border-rgb), 0.1);
      border-radius: 12px;
      margin: 1rem 0;
      padding: 1rem;
      overflow-x: auto;
    }
    code { 
      font-family: 'JetBrains Mono', monospace; 
      font-size: 0.85em; 
      background: rgba(var(--bg-tertiary-rgb), 0.5);
      padding: 2px 4px;
      border-radius: 4px;
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    a { 
      color: var(--accent-color); 
      text-decoration: none; 
      &:hover { text-decoration: underline; }
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 0.5rem 0;
      border: 1px solid rgba(var(--border-rgb), 0.1);
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
