import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// 幽灵容器 - 缩小到原始的 45%
const GhostContainer = styled(motion.div)`
  position: fixed;
  left: 30px;
  bottom: 50px;
  z-index: 100;
  width: 36px;
  height: 45px;
  pointer-events: none;
  /* 确保光圈不被裁剪 */
  overflow: visible;

  @media (max-width: 768px) {
    left: 10px;
    bottom: 60px;
    transform: scale(0.7);
  }
`;

// 幽灵身体 - 使用主题色
const GhostBody = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  border-top-right-radius: 18px;
  border-top-left-radius: 18px;
  overflow: visible;

  /* 使用主题色的渐变 */
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-color) 70%, white) 0%,
    color-mix(in srgb, var(--accent-color) 50%, white) 100%
  );

  /* 主题色发光效果 */
  box-shadow:
    0 0 20px color-mix(in srgb, var(--accent-color) 50%, transparent),
    0 0 40px color-mix(in srgb, var(--accent-color) 30%, transparent);

  transition:
    background 0.5s ease,
    box-shadow 0.5s ease;
`;

// 脸部容器 - 缩小到 45%
const Face = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  top: 15.075px;
  left: 9px;
  width: 16.2px;
  height: 9.225px;
`;

// 眼睛
const Eye = styled.div`
  width: 4.5px;
  height: 4.5px;
  background-color: color-mix(in srgb, var(--accent-color) 80%, black);
  border-radius: 100%;

  &.left {
    margin-right: 7.2px;
  }
`;

// 微笑
const Smile = styled.div`
  width: 7.2px;
  height: 3.6px;
  background-color: color-mix(in srgb, var(--accent-color) 80%, black);
  margin-top: 1.35px;
  margin-left: 4.5px;
  border-bottom-left-radius: 3.6px 2.7px;
  border-bottom-right-radius: 3.6px 2.7px;
  border-top-left-radius: 0.9px;
  border-top-right-radius: 0.9px;
`;

// 腮红
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
    color-mix(in srgb, var(--accent-color) 70%, white) 0%,
    color-mix(in srgb, var(--accent-color) 50%, white) 100%
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
    color-mix(in srgb, var(--accent-color) 70%, white) 0%,
    color-mix(in srgb, var(--accent-color) 50%, white) 100%
  );
  border-radius: 100% 60%;
`;

// 底部波浪容器
const Bottom = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0px;
  right: -0.225px;
`;

// 底部波浪单元
const BottomWave = styled.div<{ isOdd: boolean }>`
  flex-grow: 1;
  position: relative;
  top: ${(props) => (props.isOdd ? '-2.25px' : '-3.15px')};
  height: 6.3px;
  border-radius: 100%;
  background: ${(props) =>
    props.isOdd
      ? 'transparent'
      : 'linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 70%, white) 0%, color-mix(in srgb, var(--accent-color) 50%, white) 100%)'};
  border-top: ${(props) => (props.isOdd ? '4.5px solid color-mix(in srgb, var(--accent-color) 60%, white)' : 'none')};
  margin: ${(props) => (props.isOdd ? '0 -0.45px' : '0')};
`;

// 影子
const Shadow = styled(motion.div)`
  position: absolute;
  bottom: -25px;
  left: 50%;
  width: 45px;
  height: 2.7px;
  border-radius: 100%;
  background-color: color-mix(in srgb, var(--accent-color) 40%, black);
`;

// 动画变体 - 按照原始 CSS keyframes
const floatVariants = {
  animate: {
    y: [0, -9, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as any,
    },
  },
};

// 手臂动画 - translate 固定，只有 rotate 在变化
const armLeftVariants = {
  animate: {
    x: '-50%', // 固定不变
    y: '-50%', // 固定不变
    rotate: [25, 20, 25], // 这个在动画
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
    x: '-50%', // 固定不变
    y: '-50%', // 固定不变
    rotate: [-25, -20, -25], // 这个在动画
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

const containerVariants = {
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

export const GhostWidget = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // 只在深色模式下显示
  if (!isDark) return null;

  return (
    <GhostContainer variants={containerVariants} initial="hidden" animate="visible">
      <GhostBody variants={floatVariants} animate="animate">
        {/* 脸部 */}
        <Face>
          <Eye className="left" />
          <Eye className="right" />
          <Smile />
          {/* 腮红 */}
          <Rosy className="left" />
          <Rosy className="right" />
        </Face>

        {/* 手臂 - 完全按照原始HTML结构 */}
        <ArmLeft variants={armLeftVariants} animate="animate" />

        <ArmRight variants={armRightVariants} animate="animate" />

        {/* 底部波浪 */}
        <Bottom>
          {[0, 1, 2, 3, 4].map((i) => (
            <BottomWave key={i} isOdd={i % 2 === 1} />
          ))}
        </Bottom>
      </GhostBody>

      {/* 影子 */}
      <Shadow variants={shadowVariants} animate="animate" />
    </GhostContainer>
  );
};

export default GhostWidget;
