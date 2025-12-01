import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 💭 智能陪伴气泡组件 (Creative Version)
// ============================================================================

// 边框流光动画
const shine = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 光标闪烁动画
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const BubbleContainer = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  right: -10px; // 保持原有位置逻辑
  margin-bottom: 16px;
  width: max-content;
  max-width: 220px;
  z-index: 20;
  pointer-events: none;
  perspective: 1000px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
`;

const BubbleContent = styled(motion.div)`
  position: relative;
  padding: 12px 16px;
  border-radius: 16px;
  border-bottom-right-radius: 4px; // 更有气泡感
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  overflow: hidden;

  /* 字体样式 */
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary, #333);
  text-align: left;
  font-weight: 500;

  /* 顶部流光边框 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent-color, #007aff), #ff6b6b, var(--accent-color, #007aff));
    background-size: 200% 100%;
    animation: ${shine} 3s linear infinite;
    opacity: 0.7;
  }

  /* 暗黑模式适配 */
  [data-theme='dark'] & {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #eee);
  }
`;

// 小三角 (SVG 实现更平滑)
const Arrow = styled.svg`
  position: absolute;
  bottom: -8px;
  right: 24px;
  width: 16px;
  height: 8px;
  fill: rgba(255, 255, 255, 0.8);
  filter: drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.4)); // 衔接边框

  [data-theme='dark'] & {
    fill: rgba(30, 30, 30, 0.8);
    filter: drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.1));
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: var(--accent-color, #007aff);
  margin-left: 2px;
  vertical-align: middle;
  animation: ${blink} 1s step-end infinite;
`;

// 打字机效果文本
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const characters = Array.from(text);
    setDisplayedText('');
    setIsTyping(true);

    let index = 0;
    const timer = setInterval(() => {
      if (index < characters.length) {
        setDisplayedText(characters.slice(0, index + 1).join(''));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <>
      {displayedText}
      {isTyping && <Cursor />}
    </>
  );
};

interface CompanionBubbleProps {
  message: string | null;
  isVisible: boolean;
}

export const CompanionBubble: React.FC<CompanionBubbleProps> = ({ message, isVisible }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && message && (
        <BubbleContainer
          initial={{ opacity: 0, scale: 0.5, y: 20, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            mass: 0.8,
          }}
        >
          <BubbleContent>
            <TypewriterText text={message} />
          </BubbleContent>
          <Arrow viewBox="0 0 16 8">
            <path d="M0 0 L8 8 L16 0" />
          </Arrow>
        </BubbleContainer>
      )}
    </AnimatePresence>
  );
};

export default CompanionBubble;
