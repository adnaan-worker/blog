import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// ============================================================================
// 🎨 陪伴物公共样式组件
// ============================================================================

// 关心气泡（通用）
export const CareBubble = styled(motion.div)<{ variant?: 'light' | 'dark' }>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  pointer-events: none;
  min-width: 120px;
  max-width: 280px;
  text-align: center;
  z-index: 10;

  /* 主题样式 */
  ${(props) =>
    props.variant === 'dark'
      ? `
    background: linear-gradient(
      135deg,
      rgba(var(--accent-rgb, 81, 131, 245), 0.9) 0%,
      rgba(var(--accent-rgb, 81, 131, 245), 0.8) 100%
    );
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 182, 193, 0.4);

    @supports (background: color-mix(in srgb, red 50%, white)) {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--accent-color) 70%, white) 0%,
        color-mix(in srgb, var(--accent-color) 50%, white) 100%
      );
    }

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: var(--accent-color, #5183f5);
    }
  `
      : `
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid #fb923c;
    color: #1c1917;
    box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid #fb923c;
    }

    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid rgba(255, 255, 255, 0.95);
      z-index: 1;
      margin-top: -1px;
    }
  `}

  @media (max-width: 768px) {
    max-width: 220px;
    font-size: 12px;
    padding: 8px 12px;
  }
`;

// 粒子容器
export const ParticlesContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
`;

// 星星粒子
export const StarParticle = styled(motion.div)`
  position: absolute;
  font-size: 16px;
  pointer-events: none;
`;

// 拉线指示器
export const PullLine = styled.svg`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
`;

// ============================================================================
// 🎬 通用动画变体
// ============================================================================

// 容器出现动画
export const containerVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1] as any,
    },
  },
};

// 浮动动画
export const floatVariants = {
  animate: {
    y: [0, -9, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as any,
    },
  },
};

// 点击跳跃动画
export const jumpVariants = {
  jump: {
    y: [-40, 0],
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 0.6,
      ease: 'easeOut' as any,
    },
  },
  jump5x: {
    // 5连击特效
    y: [-40, 0],
    rotate: [0, 360],
    transition: {
      duration: 0.6,
      ease: 'easeOut' as any,
    },
  },
};

// 眨眼动画
export const blinkVariants = {
  blink: {
    scaleY: [1, 0.1, 1],
    transition: { duration: 0.2 },
  },
};

// 粒子动画变体
export const particleVariants = {
  initial: { x: 0, y: 0, opacity: 1, scale: 0 },
  animate: (custom: { x: number; y: number }) => ({
    x: custom.x,
    y: custom.y,
    opacity: 0,
    scale: 1.2,
    rotate: 360,
  }),
  transition: { duration: 0.8, ease: 'easeOut' as any },
};

// ============================================================================
// 🎮 拉线指示器组件
// ============================================================================

interface PullLineIndicatorProps {
  isPulling: boolean;
  pullStart: { x: number; y: number };
  pullCurrent: { x: number; y: number };
  pullDistance: number;
  pullAngle: number;
  isNearEdge: boolean;
  maxPullDisplay?: number;
  accentColor?: string;
}

export const PullLineIndicator: React.FC<PullLineIndicatorProps> = ({
  isPulling,
  pullStart,
  pullCurrent,
  pullDistance,
  pullAngle,
  isNearEdge,
  maxPullDisplay = 150,
  accentColor = 'rgba(var(--accent-rgb, 81, 131, 245), 0.6)',
}) => {
  if (!isPulling) return null;

  const edgeColor = 'rgba(251, 146, 60, 0.8)';
  const lineColor = isNearEdge ? edgeColor : accentColor;

  return (
    <PullLine>
      {/* 主拉线 */}
      <line
        x1={pullStart.x}
        y1={pullStart.y}
        x2={pullCurrent.x}
        y2={pullCurrent.y}
        stroke={lineColor}
        strokeWidth={isNearEdge ? '4' : '3'}
        strokeDasharray="5,5"
      />

      {/* 力度指示圆圈 */}
      <circle
        cx={pullStart.x}
        cy={pullStart.y}
        r={Math.min(pullDistance, maxPullDisplay) / 2.5}
        fill="none"
        stroke={isNearEdge ? 'rgba(251, 146, 60, 0.5)' : 'rgba(var(--accent-rgb, 81, 131, 245), 0.3)'}
        strokeWidth="2"
      />

      {/* 边界增强光圈 */}
      {isNearEdge && (
        <circle
          cx={pullStart.x}
          cy={pullStart.y}
          r={Math.min(pullDistance, maxPullDisplay) / 2.5 + 10}
          fill="none"
          stroke="rgba(251, 146, 60, 0.2)"
          strokeWidth="3"
        />
      )}

      {/* 方向箭头 */}
      <polygon
        points={`
          ${pullStart.x + Math.cos(pullAngle + Math.PI) * 20},${pullStart.y + Math.sin(pullAngle + Math.PI) * 20}
          ${pullStart.x + Math.cos(pullAngle + Math.PI) * 40 + Math.cos(pullAngle + Math.PI - 0.5) * 10},${pullStart.y + Math.sin(pullAngle + Math.PI) * 40 + Math.sin(pullAngle + Math.PI - 0.5) * 10}
          ${pullStart.x + Math.cos(pullAngle + Math.PI) * 40 + Math.cos(pullAngle + Math.PI + 0.5) * 10},${pullStart.y + Math.sin(pullAngle + Math.PI) * 40 + Math.sin(pullAngle + Math.PI + 0.5) * 10}
        `}
        fill={isNearEdge ? 'rgba(251, 146, 60, 0.9)' : 'rgba(var(--accent-rgb, 81, 131, 245), 0.8)'}
      />

      {/* 力度文字提示 */}
      <text
        x={pullCurrent.x}
        y={pullCurrent.y - 15}
        fill={isNearEdge ? 'rgba(251, 146, 60, 1)' : 'rgba(var(--accent-rgb, 81, 131, 245), 0.9)'}
        fontSize="14"
        fontWeight="600"
        textAnchor="middle"
      >
        {Math.round((Math.min(pullDistance, maxPullDisplay) / maxPullDisplay) * 100)}%{isNearEdge && ' 🚀'}
      </text>
    </PullLine>
  );
};
