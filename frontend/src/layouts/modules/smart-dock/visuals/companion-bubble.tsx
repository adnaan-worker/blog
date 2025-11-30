import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 💭 智能陪伴气泡组件
// ============================================================================

const BubbleContainer = styled(motion.div)`
  position: absolute;
  // 位于幽灵上方
  bottom: 100%;
  // 改为右对齐，避免在屏幕右侧被遮挡（向左延伸）
  right: -10px;
  margin-bottom: 12px;
  width: max-content;
  max-width: 200px;
  z-index: 10;
  pointer-events: none; // 点击穿透
`;

const BubbleContent = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;

  font-size: 12px;
  line-height: 1.5;
  color: #333;
  text-align: center;
  position: relative;

  // 暗黑模式适配
  [data-theme='dark'] & {
    background: rgba(30, 30, 30, 0.85);
    color: #eee;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  // 小三角
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    // 指向幽灵中心 (Right Offset 10px + Ghost Width 46px / 2 = 33px) - Arrow Width 5px = 28px
    right: 28px;
    border-width: 5px 5px 0;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.85) transparent transparent transparent;

    [data-theme='dark'] & {
      border-color: rgba(30, 30, 30, 0.85) transparent transparent transparent;
    }
  }
`;

// 打字机效果文本
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // 使用 Array.from 将字符串转换为字符数组，正确处理 Emoji (Surrogate pairs)
    // 避免 charAt 将一个 Emoji 拆成两个乱码字符
    const characters = Array.from(text);
    setDisplayedText('');

    let index = 0;
    const timer = setInterval(() => {
      if (index < characters.length) {
        // 使用 slice 截取当前应显示的部分，比累加更稳定
        setDisplayedText(characters.slice(0, index + 1).join(''));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50); // 打字速度

    return () => clearInterval(timer);
  }, [text]);

  return <>{displayedText}</>;
};

interface CompanionBubbleProps {
  message: string | null;
  isVisible: boolean;
}

export const CompanionBubble: React.FC<CompanionBubbleProps> = ({ message, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <BubbleContainer
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <BubbleContent>
            <TypewriterText text={message} />
          </BubbleContent>
        </BubbleContainer>
      )}
    </AnimatePresence>
  );
};

export default CompanionBubble;
