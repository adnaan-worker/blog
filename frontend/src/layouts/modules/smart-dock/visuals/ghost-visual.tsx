import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  ParticlesContainer,
  StarParticle,
  containerVariants,
  floatVariants,
  jumpVariants,
} from '@/components/companion/companion-shared';
import CompanionBubble from './companion-bubble';

// ============================================================================
// 👻 幽灵 (Dark Mode) 纯视觉组件 - 去除了所有拖拽逻辑，仅保留动画
// ============================================================================

const GHOST_WIDTH = 46; // 加宽
const GHOST_HEIGHT = 60; // 加高，拉长身体比例

// 幽灵容器
const GhostContainer = styled(motion.div)`
  width: ${GHOST_WIDTH}px;
  height: ${GHOST_HEIGHT}px;
  position: relative;
  pointer-events: none;
  user-select: none;
`;

// 幽灵身体容器
const GhostBody = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
`;

// SVG 背景组件 - 身体拉长，不再是扁扁的
const GHOST_PATH_NORMAL = 'M0,23 A23,23 0 0,1 46,23 V58 Q35,64 23,58 Q11,52 0,58 Z';
const GHOST_PATH_WAVE = 'M0,23 A23,23 0 0,1 46,23 V58 Q35,52 23,58 Q11,64 0,58 Z';

const GhostBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 46 72"
    style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
  >
    <defs>
      <linearGradient id="ghost-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor="rgba(81, 131, 245, 0.9)"
          style={{ stopColor: 'rgba(var(--accent-rgb, 81, 131, 245), 0.9)' }}
        />
        <stop
          offset="100%"
          stopColor="rgba(81, 131, 245, 0.6)"
          style={{ stopColor: 'rgba(var(--accent-rgb, 81, 131, 245), 0.6)' }}
        />
      </linearGradient>
      <filter id="ghost-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feComposite in="coloredBlur" in2="SourceGraphic" operator="out" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <motion.path
      initial={{ d: GHOST_PATH_NORMAL }}
      d={GHOST_PATH_NORMAL}
      animate={{
        d: [GHOST_PATH_NORMAL, GHOST_PATH_WAVE, GHOST_PATH_NORMAL],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      fill="url(#ghost-gradient)"
      filter="url(#ghost-glow)"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="0.5"
    />
  </svg>
);

// 底部光圈 - 悬浮阴影光晕
const GlowRing = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 32px;
  height: 8px;
  transform-origin: center;
  background: radial-gradient(
    ellipse at center,
    rgba(var(--accent-rgb, 81, 131, 245), 0.6) 0%,
    rgba(var(--accent-rgb, 81, 131, 245), 0.2) 60%,
    transparent 80%
  );
  border-radius: 50%;
  filter: blur(3px);
  z-index: 1; // 在身体下方 (GhostBody 是 2)
  opacity: 0.8;
`;

// 脸部容器 - 位置微调
const Face = styled.div`
  position: absolute;
  top: 20px;
  width: 26px;
  height: 14px;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 眼睛
const Eye = styled(motion.div)`
  width: 6px; // 稍微变大
  height: 8px;
  background-color: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.95);
  border-radius: 10px;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
`;

// 嘴巴
const Mouth = styled.div`
  position: absolute;
  top: 9px;
  left: 50%;
  transform: translateX(-50%);
  width: 7px;
  height: 3.5px;
  background-color: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.8);
  border-radius: 0 0 10px 10px;
`;

// 腮红
const Blush = styled(motion.div)`
  position: absolute;
  top: 7px;
  width: 6px;
  height: 3.5px;
  background-color: #ff8f8f;
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(1px);

  &.left {
    left: -2px;
  }
  &.right {
    right: -2px;
  }
`;

// 手臂 - 重新设计为可爱的小圆手
const Hand = styled(motion.div)`
  position: absolute;
  top: 30px; // 随身体拉长下移
  width: 11px;
  height: 11px;
  background: rgba(var(--accent-rgb, 81, 131, 245), 0.95);
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 3;

  &.left {
    left: -3px;
  }

  &.right {
    right: -3px;
  }
`;

// 定义 Props 接口
interface GhostVisualProps {
  clickCount: number;
  isHovered: boolean;
  isBlinking?: boolean;
  eyeOffset?: { x: number; y: number };
  particles?: Array<{ id: number; x: number; y: number; emoji: string }>;
  message?: string | null;
  isMessageVisible?: boolean;
}

export const GhostVisual: React.FC<GhostVisualProps> = ({
  clickCount,
  isHovered,
  isBlinking = false,
  eyeOffset = { x: 0, y: 0 },
  particles = [],
  message = null,
  isMessageVisible = false,
}) => {
  return (
    <GhostContainer>
      <GlowRing
        style={{ x: '-50%' }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <GhostBody
        variants={clickCount > 0 ? jumpVariants : floatVariants}
        animate={clickCount > 0 ? (clickCount >= 5 ? 'jump5x' : 'jump') : 'animate'}
      >
        <CompanionBubble message={message} isVisible={isMessageVisible} />
        <GhostBackground />

        <Face>
          <div style={{ position: 'relative' }}>
            <Eye
              animate={{
                scaleY: isBlinking ? 0.1 : 1,
                y: eyeOffset.y,
                x: eyeOffset.x,
              }}
            />
            <Blush className="left" animate={{ opacity: isHovered ? 0.8 : 0.5, scale: isHovered ? 1.2 : 1 }} />
          </div>

          <Mouth />

          <div style={{ position: 'relative' }}>
            <Eye
              animate={{
                scaleY: isBlinking ? 0.1 : 1,
                y: eyeOffset.y,
                x: eyeOffset.x,
              }}
            />
            <Blush className="right" animate={{ opacity: isHovered ? 0.8 : 0.5, scale: isHovered ? 1.2 : 1 }} />
          </div>
        </Face>

        {/* 左手 - 轻轻摆动 */}
        <Hand
          className="left"
          animate={{
            y: [-1, 1, -1],
            rotate: [-5, 5, -5],
            x: isHovered ? -4 : 0, // hover时张开手
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 右手 - 轻轻摆动 */}
        <Hand
          className="right"
          animate={{
            y: [1, -1, 1],
            rotate: [5, -5, 5],
            x: isHovered ? 4 : 0, // hover时张开手
          }}
          transition={{
            duration: 2.2, // 稍微错开时间，看起来更自然
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 粒子效果 */}
        <ParticlesContainer>
          {particles.map((particle) => (
            <StarParticle
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: particle.x * 1.2,
                y: particle.y * 1.2,
                opacity: 0,
                scale: 1.2,
                rotate: 360,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {particle.emoji}
            </StarParticle>
          ))}
        </ParticlesContainer>
      </GhostBody>
    </GhostContainer>
  );
};

export default GhostVisual;
