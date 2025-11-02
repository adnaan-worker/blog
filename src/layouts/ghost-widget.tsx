import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '@/store';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';
import {
  CareBubble,
  ParticlesContainer,
  StarParticle,
  PullLineIndicator,
  containerVariants,
  floatVariants,
  jumpVariants,
  blinkVariants,
} from '@/components/companion/companion-shared';

// ============================================================================
// 👻 幽灵小部件 - Ghost Widget（暗黑模式陪伴物）
// ============================================================================

const GHOST_WIDTH = 36;
const GHOST_HEIGHT = 45;

// 幽灵容器
const GhostContainer = styled(motion.div)<{ isDragging?: boolean }>`
  position: fixed;
  z-index: 9999;
  width: ${GHOST_WIDTH}px;
  height: ${GHOST_HEIGHT}px;
  pointer-events: auto;
  cursor: ${(props) => (props.isDragging ? 'grabbing' : 'grab')};
  overflow: visible;
  user-select: none;
  will-change: left, top;

  @media (max-width: 768px) {
    transform: scale(0.7);
  }
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

  @supports (background: color-mix(in srgb, red 50%, white)) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 70%, white) 0%,
      color-mix(in srgb, var(--accent-color) 50%, white) 100%
    );
  }

  box-shadow:
    0 0 20px rgba(var(--accent-rgb, 81, 131, 245), 0.5),
    0 0 40px rgba(var(--accent-rgb, 81, 131, 245), 0.3);

  @supports (box-shadow: 0 0 10px color-mix(in srgb, red 50%, transparent)) {
    box-shadow:
      0 0 20px color-mix(in srgb, var(--accent-color) 50%, transparent),
      0 0 40px color-mix(in srgb, var(--accent-color) 30%, transparent);
  }

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

  @supports (background-color: color-mix(in srgb, red 80%, black)) {
    background-color: color-mix(in srgb, var(--accent-color) 80%, black);
  }

  border-radius: 100%;
  transition: all 0.2s ease;
`;

const Smile = styled.div`
  width: 7.2px;
  height: 3.6px;
  background-color: rgba(var(--accent-rgb, 81, 131, 245), 0.9);
  @supports (background-color: color-mix(in srgb, red 80%, black)) {
    background-color: color-mix(in srgb, var(--accent-color) 80%, black);
  }

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

  @supports (background: color-mix(in srgb, red 50%, white)) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 70%, white) 0%,
      color-mix(in srgb, var(--accent-color) 50%, white) 100%
    );
  }

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

  @supports (background: color-mix(in srgb, red 50%, white)) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 70%, white) 0%,
      color-mix(in srgb, var(--accent-color) 50%, white) 100%
    );
  }

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

  @supports (background: color-mix(in srgb, red 50%, white)) {
    background: ${(props) =>
      props.isOdd
        ? 'transparent'
        : 'linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 70%, white) 0%, color-mix(in srgb, var(--accent-color) 50%, white) 100%)'};
    border-top: ${(props) => (props.isOdd ? '4.5px solid color-mix(in srgb, var(--accent-color) 60%, white)' : 'none')};
  }

  margin: ${(props) => (props.isOdd ? '0 -0.45px' : '0')};
`;

const Shadow = styled(motion.div)`
  position: absolute;
  bottom: -25px;
  left: 50%;
  width: 45px;
  height: 2.7px;
  border-radius: 100%;
  background-color: rgba(var(--accent-rgb, 81, 131, 245), 0.5);

  @supports (background-color: color-mix(in srgb, red 40%, black)) {
    background-color: color-mix(in srgb, var(--accent-color) 40%, black);
  }
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

const shadowVariants = {
  animate: {
    scale: [1, 0.5, 1],
    x: ['-50%', '-50%', '-50%'],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as any,
    },
  },
};

// ============================================================================
// 主组件
// ============================================================================

export const GhostWidget = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // 使用公共 Hook
  const companion = useCompanionWidget({
    storageKey: 'ghost_position',
    width: GHOST_WIDTH,
    height: GHOST_HEIGHT,
    defaultPosition: { x: Math.min(100, window.innerWidth / 4), y: window.innerHeight / 2 },
    enablePhysics: true,
    enableSmartBubble: true,
    bubbleIdleTime: 10000,
    bubbleInterval: 20000,
    blinkInterval: 3000,
  });

  // 只在深色模式显示
  if (!isDark) return null;

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    companion.handlePullStart(e.clientX, e.clientY);
  };

  // 触摸事件处理
  useEffect(() => {
    const element = companion.widgetRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      companion.handlePullStart(touch.clientX, touch.clientY);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [companion.isFlying, companion.handlePullStart]);

  return (
    <>
      {/* 拉线指示器 */}
      <PullLineIndicator
        isPulling={companion.isPulling}
        pullStart={companion.pullStart}
        pullCurrent={companion.pullCurrent}
        pullDistance={companion.pullDistance}
        pullAngle={companion.pullAngle}
        isNearEdge={companion.isNearEdge}
      />

      <GhostContainer
        ref={companion.widgetRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => companion.setIsHovered(true)}
        onMouseLeave={() => companion.setIsHovered(false)}
        onClick={companion.handleClick}
        isDragging={companion.isPulling}
        style={{
          left: companion.position.x,
          top: companion.position.y,
          cursor: companion.isFlying ? 'default' : companion.isPulling ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        {/* 关心气泡 */}
        {companion.careBubble && !companion.isPulling && !companion.isFlying && (
          <CareBubble
            variant="dark"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
          >
            {companion.careBubble}
          </CareBubble>
        )}

        <GhostBody
          variants={companion.clickCount > 0 ? jumpVariants : floatVariants}
          animate={companion.clickCount > 0 ? (companion.clickCount >= 5 ? 'jump5x' : 'jump') : 'animate'}
          onAnimationComplete={() => companion.setIsDragging(false)}
          data-ghost-body
        >
          {/* 脸部 */}
          <Face>
            <EyeContainer className="left">
              <Eye
                animate={{
                  x: companion.eyeOffset.x,
                  y: companion.eyeOffset.y,
                  scale: companion.isHovered ? 1.3 : 1,
                  scaleY: companion.isBlinking ? 0.1 : companion.isHovered ? 1.3 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </EyeContainer>
            <EyeContainer className="right">
              <Eye
                animate={{
                  x: companion.eyeOffset.x,
                  y: companion.eyeOffset.y,
                  scale: companion.isHovered ? 1.3 : 1,
                  scaleY: companion.isBlinking ? 0.1 : companion.isHovered ? 1.3 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </EyeContainer>
            <Smile />
            <Rosy
              className="left"
              style={{
                opacity: companion.isHovered ? 1 : 0.6,
                transform: companion.isHovered ? 'rotate(-8deg) scale(1.2)' : 'rotate(-8deg)',
                transition: 'all 0.3s ease',
              }}
            />
            <Rosy
              className="right"
              style={{
                opacity: companion.isHovered ? 1 : 0.6,
                transform: companion.isHovered ? 'rotate(8deg) scale(1.2)' : 'rotate(8deg)',
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
            {companion.particles.map((particle) => (
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

        {/* 影子 */}
        <Shadow variants={shadowVariants} animate="animate" />
      </GhostContainer>
    </>
  );
};

export default GhostWidget;
