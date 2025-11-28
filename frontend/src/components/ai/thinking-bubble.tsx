import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

const Container = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
  width: 100%;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: white;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

const Bubble = styled.div`
  padding: 0.5rem 0; /* 移除左右 padding */
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px; /* 与头像对齐 */
  background: transparent; /* 移除背景 */
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  opacity: 0.6;
`;

export const ThinkingBubble: React.FC = () => {
  return (
    <Container
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Avatar>
        <FiCpu size={18} />
      </Avatar>
      <Bubble>
        {[0, 1, 2].map((i) => (
          <Dot
            key={i}
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </Bubble>
    </Container>
  );
};
