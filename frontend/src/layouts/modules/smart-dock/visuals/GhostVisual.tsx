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

// ============================================================================
// 👻 幽灵 (Dark Mode) 纯视觉组件 - 去除了所有拖拽逻辑，仅保留动画
// ============================================================================

const GHOST_WIDTH = 36;
const GHOST_HEIGHT = 45;

// 幽灵容器 - 调整为相对定位，适应 Dock 内部
const GhostContainer = styled(motion.div)`
  width: ${GHOST_WIDTH}px;
  height: ${GHOST_HEIGHT}px;
  position: relative;
  pointer-events: none; /* 视觉层不拦截 */
  user-select: none;

  /* 在 Dock 中可能需要微调缩放 */
  /* transform: scale(0.8); 由父级控制 */
`;

// 幽灵身体
const GhostBody = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  border-top-right-radius: 18px;
  border-top-left-radius: 18px;
  overflow: visible;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb, 81, 131, 245), 0.85) 0%,
    rgba(var(--accent-rgb, 81, 131, 245), 0.7) 100%
  );

  /* 减少阴影范围，适应小尺寸 Dock */
  box-shadow:
    0 0 10px rgba(var(--accent-rgb, 81, 131, 245), 0.5),
    0 0 20px rgba(var(--accent-rgb, 81, 131, 245), 0.3);

  transition:
    background 0.5s ease,
    box-shadow 0.5s ease;
`;

// 脸部
const Face = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  top: 15.075px;
  left: 9px;
  width: 16.2px;
  height: 9.225px;
`;

const EyeContainer = styled.div`
  width: 5.4px;
  height: 5.4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &.left {
    margin-right: 5.4px;
  }
`;

const Eye = styled(motion.div)`
  width: 4.5px;
  height: 4.5px;
  background-color: rgba(var(--accent-rgb, 81, 131, 245), 0.9);
  border-radius: 100%;
  transition: all 0.2s ease;
`;

const Smile = styled.div`
  width: 7.2px;
  height: 3.6px;
  background-color: rgba(var(--accent-rgb, 81, 131, 245), 0.9);
  margin-top: 1.35px;
  margin-left: 4.5px;
  border-bottom-left-radius: 3.6px 2.7px;
  border-bottom-right-radius: 3.6px 2.7px;
  border-top-left-radius: 0.9px;
  border-top-right-radius: 0.9px;
`;

const Rosy = styled.div`
  position: absolute;
  top: 6.3px;
  width: 4.95px;
  height: 1.8px;
  background-color: #fb923c;
  border-radius: 100%;
  box-shadow: 0 0 6px rgba(251, 146, 60, 0.6);

  &.left {
    left: -1.35px;
    transform: rotate(-8deg);
  }

  &.right {
    right: -1.35px;
    transform: rotate(8deg);
  }
`;

// 手臂
const ArmLeft = styled(motion.div)`
  position: absolute;
  top: 30.6px;
  left: -0.9px;
  width: 13.5px;
  height: 9px;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb, 81, 131, 245), 0.85) 0%,
    rgba(var(--accent-rgb, 81, 131, 245), 0.7) 100%
  );
  border-radius: 60% 100%;
`;

const ArmRight = styled(motion.div)`
  position: absolute;
  top: 30.6px;
  right: -14.625px;
  width: 13.5px;
  height: 9px;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb, 81, 131, 245), 0.85) 0%,
    rgba(var(--accent-rgb, 81, 131, 245), 0.7) 100%
  );
  border-radius: 100% 60%;
`;

// 底部波浪
const Bottom = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0px;
  right: -0.225px;
`;

const BottomWave = styled.div<{ isOdd: boolean }>`
  flex-grow: 1;
  position: relative;
  top: ${(props) => (props.isOdd ? '-2.25px' : '-3.15px')};
  height: 6.3px;
  border-radius: 100%;

  background: ${(props) =>
    props.isOdd
      ? 'transparent'
      : 'linear-gradient(180deg, rgba(var(--accent-rgb, 81, 131, 245), 0.85) 0%, rgba(var(--accent-rgb, 81, 131, 245), 0.7) 100%)'};
  border-top: ${(props) => (props.isOdd ? '4.5px solid rgba(var(--accent-rgb, 81, 131, 245), 0.75)' : 'none')};
  margin: ${(props) => (props.isOdd ? '0 -0.45px' : '0')};
`;

// 手臂动画
const armLeftVariants = {
  animate: {
    x: '-50%',
    y: '-50%',
    rotate: [25, 20, 25],
    transition: {
      rotate: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as any,
        times: [0, 0.4, 1],
      },
    },
  },
};

const armRightVariants = {
  animate: {
    x: '-50%',
    y: '-50%',
    rotate: [-25, -20, -25],
    transition: {
      rotate: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as any,
        times: [0, 0.4, 1],
      },
    },
  },
};

// 定义 Props 接口
interface GhostVisualProps {
  clickCount: number;
  isHovered: boolean;
  isBlinking?: boolean;
  eyeOffset?: { x: number; y: number };
  particles?: Array<{ id: number; x: number; y: number; emoji: string }>;
}

export const GhostVisual: React.FC<GhostVisualProps> = ({
  clickCount,
  isHovered,
  isBlinking = false,
  eyeOffset = { x: 0, y: 0 },
  particles = [],
}) => {
  return (
    <GhostContainer>
      <GhostBody
        variants={clickCount > 0 ? jumpVariants : floatVariants}
        animate={clickCount > 0 ? (clickCount >= 5 ? 'jump5x' : 'jump') : 'animate'}
      >
        {/* 脸部 */}
        <Face>
          <EyeContainer className="left">
            <Eye
              animate={{
                x: eyeOffset.x,
                y: eyeOffset.y,
                scale: isHovered ? 1.3 : 1,
                scaleY: isBlinking ? 0.1 : isHovered ? 1.3 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          </EyeContainer>
          <EyeContainer className="right">
            <Eye
              animate={{
                x: eyeOffset.x,
                y: eyeOffset.y,
                scale: isHovered ? 1.3 : 1,
                scaleY: isBlinking ? 0.1 : isHovered ? 1.3 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          </EyeContainer>
          <Smile />
          <Rosy
            className="left"
            style={{
              opacity: isHovered ? 1 : 0.6,
              transform: isHovered ? 'rotate(-8deg) scale(1.2)' : 'rotate(-8deg)',
              transition: 'all 0.3s ease',
            }}
          />
          <Rosy
            className="right"
            style={{
              opacity: isHovered ? 1 : 0.6,
              transform: isHovered ? 'rotate(8deg) scale(1.2)' : 'rotate(8deg)',
              transition: 'all 0.3s ease',
            }}
          />
        </Face>

        {/* 手臂 */}
        <ArmLeft variants={armLeftVariants} animate="animate" />
        <ArmRight variants={armRightVariants} animate="animate" />

        {/* 底部波浪 */}
        <Bottom>
          {[0, 1, 2, 3, 4].map((i) => (
            <BottomWave key={i} isOdd={i % 2 === 1} />
          ))}
        </Bottom>

        {/* 粒子效果 */}
        <ParticlesContainer>
          {particles.map((particle) => (
            <StarParticle
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
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
