import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiArrowUp } from 'react-icons/fi';
import MusicPlayer from './modules/music-player';
import LyricBubble from './modules/lyric-bubble';

// 动画配置常量
const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
};

const EASING = {
  ease: [0.4, 0, 0.2, 1] as any,
  easeIn: [0.4, 0, 1, 1] as any,
  easeOut: [0, 0, 0.2, 1] as any,
};

const gpuAcceleration = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
};

const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

// 统一的浮动工具栏容器
const ToolbarContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse; /* 从下往上排列 */
  align-items: flex-end;
  gap: 12px;
  z-index: 100;
  pointer-events: none;

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    gap: 10px;
  }

  /* 子元素恢复pointer-events */
  > * {
    pointer-events: auto;
  }
`;

// 歌词胶囊容器 - 始终在最底部
const LyricCapsule = styled(motion.div)<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.9) 100%);
  padding: ${(props) => (props.isExpanded ? '0 16px 0 0' : '0')}; /* 移除上下padding确保按钮居中 */
  box-shadow:
    0 8px 24px rgba(var(--accent-rgb), 0.35),
    0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  gap: 8px; /* 按钮和文字间距 */

  /* GPU加速 */
  ${gpuAcceleration as any}

  /* 悬停效果 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow:
      0 12px 32px rgba(var(--accent-rgb), 0.45),
      0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px) translateZ(0);
  }

  @media (max-width: 768px) {
    height: 44px;
    padding: ${(props) => (props.isExpanded ? '0 12px 0 0' : '0')}; /* 移动端也移除上下padding */

    /* 移动端收起时的宽度 */
    &[data-expanded='false'] {
      width: 44px !important;
    }

    /* 移动端展开时的固定宽度，覆盖动画变体 */
    &[data-expanded='true'] {
      width: 184px !important; /* 44px按钮 + 8px间距 + 120px文字 + 12px右padding */
    }
  }
`;

// 音乐按钮
const MusicButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  min-width: 48px; /* 确保不会被压缩 */
  min-height: 48px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* 移除默认padding */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover::before {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 22px;
    height: 22px;
    display: block; /* 移除inline默认间距 */
    z-index: 1;
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

// 歌词文本
const LyricText = styled(motion.div)`
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px; /* 固定宽度 */
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    width: 120px; /* 移动端固定宽度 */
  }
`;

// 歌词胶囊动画变体 - 固定展开宽度，避免文字变化导致胶囊抖动
const capsuleVariants = {
  collapsed: {
    width: 48,
    borderRadius: '50%', // 收起时完全圆形
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.ease,
    },
  },
  expanded: {
    width: 252, // 固定展开宽度 (48px按钮 + 8px间距 + 180px文字 + 16px右padding)
    borderRadius: '24px', // 展开时圆角矩形
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.ease,
    },
  },
};

// 歌词文本动画变体 - 淡入效果，不改变宽度
const lyricTextVariants = {
  hidden: {
    opacity: 0,
    x: 10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.ease,
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      delay: 0.1,
      ease: EASING.easeIn,
    },
  },
};

// 返回顶部按钮样式 - 增强视觉效果
const ToolbarButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.9) 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 16px rgba(var(--accent-rgb), 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* GPU加速 */
  ${gpuAcceleration as any}

  /* 光晕效果 */
  &::before {
    content: '';
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    box-shadow:
      0 8px 24px rgba(var(--accent-rgb), 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px) translateZ(0);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0) translateZ(0);
  }

  svg {
    width: 22px;
    height: 22px;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

// 返回顶部按钮的动画变体 - 使用统一配置
const scrollTopVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.ease,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeIn,
    },
  },
};

interface FloatingToolbarProps {
  scrollPosition: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ scrollPosition }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [currentLyric, setCurrentLyric] = useState<string | null>(null);
  const [isLyricBubbleEnabled, setIsLyricBubbleEnabled] = useState(true);
  const [isCapsuleExpanded, setIsCapsuleExpanded] = useState(false);

  useEffect(() => {
    setShowScrollTop(scrollPosition > 300);
  }, [scrollPosition]);

  // 监听歌词变化，控制胶囊展开
  useEffect(() => {
    if (currentLyric && isLyricBubbleEnabled) {
      setIsCapsuleExpanded(true);
    } else {
      setIsCapsuleExpanded(false);
    }
  }, [currentLyric, isLyricBubbleEnabled]);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleMusicPlayerToggle = () => {
    setIsMusicPlayerOpen(!isMusicPlayerOpen);
  };

  const handleLyricChange = (lyric: string) => {
    if (isLyricBubbleEnabled) {
      setCurrentLyric(lyric);
    }
  };

  const handleLyricComplete = () => {
    setCurrentLyric(null);
  };

  const handleLyricBubbleToggle = (isEnabled: boolean) => {
    setIsLyricBubbleEnabled(isEnabled);
    if (!isEnabled) {
      setCurrentLyric(null);
    }
  };

  return (
    <>
      <ToolbarContainer>
        {/* 音乐歌词胶囊 - 始终在最底部 */}
        <LyricCapsule
          isExpanded={isCapsuleExpanded}
          data-expanded={isCapsuleExpanded}
          variants={capsuleVariants}
          animate={isCapsuleExpanded ? 'expanded' : 'collapsed'}
          initial="collapsed"
        >
          <MusicButton onClick={handleMusicPlayerToggle} {...hoverScale}>
            <FiMusic />
          </MusicButton>

          <AnimatePresence mode="wait">
            {isCapsuleExpanded && currentLyric && (
              <LyricText
                variants={lyricTextVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                key={currentLyric}
              >
                {currentLyric}
              </LyricText>
            )}
          </AnimatePresence>
        </LyricCapsule>

        {/* 返回顶部按钮 - 出现时会自动把音乐按钮推上去 */}
        <AnimatePresence mode="wait">
          {showScrollTop && (
            <ToolbarButton
              variants={scrollTopVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              {...hoverScale}
              onClick={handleScrollTop}
            >
              <FiArrowUp />
            </ToolbarButton>
          )}
        </AnimatePresence>
      </ToolbarContainer>

      <MusicPlayer
        isOpen={isMusicPlayerOpen}
        onClose={() => setIsMusicPlayerOpen(false)}
        onLyricChange={handleLyricChange}
        onLyricBubbleToggle={handleLyricBubbleToggle}
      />
    </>
  );
};

export default FloatingToolbar;
