import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';

// 简单的抖动动画
const shake = keyframes`
  0% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0, 0); }
`;

// RGB 分离动画（通过 text-shadow 实现，兼容性更好）
const rgbSplit = keyframes`
  0% { text-shadow: none; }
  20% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; }
  40% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
  60% { text-shadow: -1px 0 #ff00ff, 1px 0 #00ffff; }
  80% { text-shadow: 1px 0 #ff00ff, -1px 0 #00ffff; }
  100% { text-shadow: none; }
`;

// 光标闪烁
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

// 律动跳跃动画
const jump = keyframes`
  0% { transform: translateY(0); }
  30% { transform: translateY(-30%); }
  50% { transform: translateY(10%); }
  70% { transform: translateY(-5%); }
  100% { transform: translateY(0); }
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem;
  z-index: 50;
  line-height: 1;
`;

// 文本容器 - 负责整体布局和悬停时的故障效果
const TextContainer = styled.div<{ isHovered: boolean }>`
  display: inline-flex;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.05em;
  text-transform: lowercase;
  position: relative;
  transition: color 0.2s;
  text-shadow: none;

  /* 悬停效果：整体抖动 + RGB分离 */
  ${(props) =>
    props.isHovered &&
    css`
      animation:
        ${shake} 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite,
        ${rgbSplit} 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;
      color: var(--text-primary);
    `}

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

// 单个字符 - 负责加载时的跳动动画
const Char = styled.span<{ delay: number; isPlaying: boolean }>`
  display: inline-block;
  transform-origin: bottom center;
  animation: ${(props) =>
    props.isPlaying
      ? css`
          ${jump} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${props.delay}s forwards
        `
      : 'none'};

  /* 避免动画结束后的闪烁 */
  will-change: transform;
`;

const Cursor = styled.span<{ isHovered: boolean }>`
  display: inline-block;
  width: 0.6em;
  height: 0.15em;
  background-color: ${(props) => (props.isHovered ? 'var(--accent-color)' : 'var(--text-primary)')};
  margin-left: 0.1em;
  animation: ${blink} 1s step-end infinite;
  margin-bottom: 0.15em;
  vertical-align: bottom;
`;

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const text = 'adnaan';

  // 控制开场动画状态
  React.useEffect(() => {
    // 动画总时长 = 延迟(最大0.5s) + 动画时长(0.8s)
    const timer = setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LogoLink
      to="/"
      className={className}
      onMouseEnter={() => !isPlaying && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TextContainer isHovered={isHovered}>
        {text.split('').map((char, index) => (
          <Char key={index} delay={index * 0.1} isPlaying={isPlaying}>
            {char}
          </Char>
        ))}
      </TextContainer>
      <Cursor isHovered={isHovered} />
    </LogoLink>
  );
};

export default AnimatedLogo;
