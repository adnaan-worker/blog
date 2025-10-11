import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';

// 小鸟飞行动画（轻微上下浮动）
const birdFly = keyframes`
  0%, 100% {
    transform: translateY(0) scaleX(-1);
  }
  50% {
    transform: translateY(-4px) scaleX(-1);
  }
`;

// 小鸟飞到末尾并转身
const birdLand = keyframes`
  0% {
    transform: scaleX(-1);
  }
  50% {
    transform: scaleX(-1) translateY(-3px);
  }
  100% {
    transform: scaleX(1); /* 转身朝向左边 */
  }
`;

// 翅膀扇动动画
const wingFlap = keyframes`
  0%, 100% {
    transform: rotateY(0deg) rotateZ(-10deg);
  }
  50% {
    transform: rotateY(-30deg) rotateZ(-30deg);
  }
`;

// 尾巴摇动
const tailWag = keyframes`
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(15deg);
  }
`;

// 小鸟上下浮动
const birdFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
`;

// 小鸟容器
const BirdContainer = styled.div<{ isJumping: boolean; isFinished: boolean }>`
  position: absolute;
  top: -6px; /* 小鸟在文字旁边，而不是上方 */
  width: 28px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  animation: ${(props) => (props.isJumping ? birdFly : props.isFinished ? birdLand : 'none')} 0.4s ease;
  animation-fill-mode: forwards;
  transform: ${(props) => (props.isFinished ? 'scaleX(1)' : 'scaleX(-1)')};
  transition: left 0.3s ease;
  z-index: 10;

  /* 飞行时启动翅膀动画 */
  ${(props) =>
    props.isJumping &&
    css`
      animation: ${birdFly} 0.4s ease-in-out infinite;

      .bird-wing {
        animation: ${wingFlap} 0.2s ease-in-out infinite;
      }
    `}

  /* 完成后启动待机动画 */
  ${(props) =>
    props.isFinished &&
    css`
      animation:
        ${birdLand} 0.4s ease forwards,
        ${birdFloat} 1.5s ease-in-out 0.4s infinite;

      .bird-wing {
        animation: ${wingFlap} 0.6s ease-in-out infinite;
      }
      .bird-tail {
        animation: ${tailWag} 1s ease-in-out infinite;
      }
    `}

  @media (max-width: 480px) {
    width: 24px;
    height: 20px;
    top: -4px;
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

// 内容容器 - 用于测量宽度
const ContentWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  z-index: 100;
`;

// 文字内容
const Text = styled.span`
  font-weight: 400;
  position: relative;
  text-transform: lowercase;
  letter-spacing: 0.05em;

  /* 横向渐变色 - 使用主题色 */
  background: linear-gradient(90deg, var(--text-primary) 0%, var(--accent-color) 50%, var(--text-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;

  /* 渐变流动动画 */
  animation: gradientShift 4s ease-in-out infinite;

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

interface AnimatedLogoProps {
  className?: string;
}

// SVG 小鸟组件
const SvgBird: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 身体 */}
    <ellipse cx="14" cy="13" rx="7" ry="5.5" fill="var(--accent-color, #667eea)" />

    {/* 头部 */}
    <circle cx="7" cy="10" r="4.5" fill="var(--accent-color, #667eea)" />

    {/* 嘴巴 */}
    <path d="M 3 10 L 1 10.5 L 3 11 Z" fill="#ff9800" />

    {/* 眼睛 */}
    <circle cx="7" cy="9" r="1.2" fill="#fff" />
    <circle cx="7" cy="9" r="0.7" fill="#000" />

    {/* 翅膀（左） */}
    <ellipse
      className="bird-wing"
      cx="12"
      cy="13"
      rx="5"
      ry="7"
      fill="var(--accent-color, #667eea)"
      opacity="0.9"
      style={{ transformOrigin: '12px 13px' }}
    />

    {/* 翅膀装饰线 */}
    <path
      className="bird-wing"
      d="M 12 10 Q 14 13 12 16"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1"
      fill="none"
      style={{ transformOrigin: '12px 13px' }}
    />

    {/* 尾巴羽毛 */}
    <g className="bird-tail" style={{ transformOrigin: '20px 14px' }}>
      <ellipse cx="22" cy="12" rx="3" ry="1.5" fill="var(--accent-color, #667eea)" opacity="0.8" />
      <ellipse cx="22" cy="14" rx="3.5" ry="1.8" fill="var(--accent-color, #667eea)" opacity="0.8" />
      <ellipse cx="22" cy="16" rx="3" ry="1.5" fill="var(--accent-color, #667eea)" opacity="0.8" />
    </g>

    {/* 小脚 */}
    <line x1="12" y1="18" x2="12" y2="20" stroke="#ff9800" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="16" y1="18" x2="16" y2="20" stroke="#ff9800" strokeWidth="1.2" strokeLinecap="round" />

    {/* 脚趾 */}
    <path d="M 10.5 20 L 12 20 L 13.5 20" stroke="#ff9800" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    <path d="M 14.5 20 L 16 20 L 17.5 20" stroke="#ff9800" strokeWidth="0.8" strokeLinecap="round" fill="none" />
  </svg>
);

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className }) => {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [dogPosition, setDogPosition] = useState(0);

  // 只显示 adnaan
  const fullText = 'adnaan';

  // 小鸟飞行显示字符效果
  useEffect(() => {
    if (displayedChars < fullText.length) {
      const timeout = setTimeout(() => {
        // 开始飞行
        setIsJumping(true);

        // 飞行动画持续400ms，在150ms时显示字符
        setTimeout(() => {
          setDisplayedChars((prev) => prev + 1);
        }, 150);

        // 400ms后结束飞行状态
        setTimeout(() => {
          setIsJumping(false);
        }, 400);
      }, 400); // 每个字符间隔400ms，更快更流畅

      return () => clearTimeout(timeout);
    } else if (displayedChars === fullText.length && !isFinished) {
      // 所有字符显示完成后，延迟一下再触发降落的动画
      const finishTimeout = setTimeout(() => {
        setIsFinished(true);
      }, 200);

      return () => clearTimeout(finishTimeout);
    }
  }, [displayedChars, fullText.length, isFinished]);

  // 更新小鸟位置
  useEffect(() => {
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth;
      setDogPosition(width);
    }
  }, [displayedChars]);

  // 显示的文字内容
  const displayedText = fullText.substring(0, displayedChars);

  return (
    <LogoContainer to="/" className={className}>
      <ContentWrapper ref={contentRef}>
        <Text>{displayedText}</Text>
        <BirdContainer isJumping={isJumping} isFinished={isFinished} style={{ left: `${dogPosition}px` }}>
          <SvgBird />
        </BirdContainer>
      </ContentWrapper>
    </LogoContainer>
  );
};

export default AnimatedLogo;
