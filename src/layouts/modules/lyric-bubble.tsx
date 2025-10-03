import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

const BubbleContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 5%;
  transform: translateX(-50%);
  background: var(--accent-bg-color);
  backdrop-filter: blur(8px);
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  text-align: center;
  max-width: 80%;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    bottom: 80px;
    font-size: 0.8rem;
    padding: 0.6rem 1.2rem;
  }
`;

interface LyricBubbleProps {
  text: string;
  duration?: number;
  onComplete?: () => void;
}

const LyricBubble: React.FC<LyricBubbleProps> = ({ text, duration = 3000, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <BubbleContainer
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {text}
        </BubbleContainer>
      )}
    </AnimatePresence>
  );
};

export default LyricBubble;
