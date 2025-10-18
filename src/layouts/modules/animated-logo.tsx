import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// 字符划出动画
const charReveal = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10px) rotateX(90deg);
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
`;

// Logo 容器
const LogoContainer = styled(Link)`
  display: inline-flex;
  align-items: center;
  position: relative;
  text-decoration: none;
  padding: 0.6rem 1rem;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 1.5rem;
  line-height: 1.5;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.8rem;
    font-size: 1.2rem;
  }
`;

// 内容容器
const ContentWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.1em;
`;

// 单个字符容器
const CharContainer = styled.span<{ isRevealed: boolean; delay: number }>`
  display: inline-block;
  position: relative;
  min-width: 0.6em;
  text-align: center;
  perspective: 1000px;

  /* 字符划出动画 */
  animation: ${(props) => (props.isRevealed ? charReveal : 'none')} 0.5s ease-out ${(props) => props.delay}s forwards;
  transform-origin: center bottom;
`;

// 字符样式
const Character = styled.span<{ isPlaceholder: boolean }>`
  font-weight: 400;
  text-transform: lowercase;
  letter-spacing: 0.05em;

  /* 根据是否是占位符显示不同样式 */
  ${(props) =>
    props.isPlaceholder
      ? `
    /* 短横线 */
    color: var(--text-secondary);
    opacity: 0.4;
  `
      : `
    /* 真实字符 - 使用主题色渐变 */
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-color) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className }) => {
  const fullText = 'adnaan';
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // 延迟300ms开始动画
    const startDelay = setTimeout(() => {
      setAnimationStarted(true);
    }, 300);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (!animationStarted) return;

    // 生成随机顺序
    const indices = Array.from({ length: fullText.length }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);

    // 逐个随机显示字符
    shuffled.forEach((index, i) => {
      setTimeout(() => {
        setRevealedIndices((prev) => [...prev, index]);
      }, i * 200); // 每个字符间隔200ms
    });
  }, [animationStarted, fullText.length]);

  return (
    <LogoContainer to="/" className={className}>
      <ContentWrapper>
        {Array.from(fullText).map((char, index) => {
          const isRevealed = revealedIndices.includes(index);
          const revealIndex = revealedIndices.indexOf(index);
          const delay = revealIndex >= 0 ? revealIndex * 0.05 : 0;

          return (
            <CharContainer key={index} isRevealed={isRevealed} delay={delay}>
              <Character isPlaceholder={!isRevealed}>{isRevealed ? char : '-'}</Character>
            </CharContainer>
          );
        })}
      </ContentWrapper>
    </LogoContainer>
  );
};

export default AnimatedLogo;
