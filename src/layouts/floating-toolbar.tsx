import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiArrowUp } from 'react-icons/fi';
import MusicPlayer from './modules/music-player';
import { SPRING_PRESETS } from '@/utils/ui/animation';

// GPU加速优化
const gpuAcceleration = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
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

// 歌词胶囊容器 - 高性能动画方案 - 使用 CSS 变量实现响应式
const LyricCapsule = styled(motion.div)<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.9) 100%);
  padding: 0;
  box-shadow:
    0 8px 24px rgba(var(--accent-rgb), 0.35),
    0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: visible;

  /* GPU加速 - 关键优化 */
  ${gpuAcceleration as any}
  will-change: transform;

  /* 悬停效果 */
  cursor: pointer;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow:
      0 12px 32px rgba(var(--accent-rgb), 0.45),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* 移动端响应式 - 通过 CSS 变量覆盖，避免 JS 计算 */
  @media (max-width: 768px) {
    height: 44px;
    --button-size: 44px !important;
    --expanded-width: 196px !important; /* 44 + 12 + 140 */
    --border-radius: 22px !important;
  }
`;

// 内容容器 - 控制 overflow
const CapsuleContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  overflow: hidden;
  padding: 0 16px 0 0;
  position: relative;
  z-index: 2;
`;

// 音乐按钮
const MusicButton = styled(motion.button)<{ $isPlaying?: boolean; $hasCover?: boolean }>`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  margin-left: -1px; /* 向左突出，避开外层容器边框 */
  border-radius: 50%;
  border: none;
  outline: none;
  box-shadow: none;
  background-color: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  /* 移除所有可能的边框效果 */
  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  /* 遮盖外层容器的边框 - 最底层 */
  &::after {
    content: '';
    position: absolute;
    inset: -2px; /* 向外扩展，覆盖外层边框 */
    border-radius: 50%;
    background: transparent;
    z-index: -1;
  }

  /* hover效果（仅在没有封面时显示） */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0);
    transition: background 0.2s ease;
    z-index: 0;
    /* 有封面时隐藏 hover 效果 */
    opacity: ${(props) => (props.$hasCover ? 0 : 1)};
    pointer-events: ${(props) => (props.$hasCover ? 'none' : 'auto')};
  }

  &:hover::before {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 22px;
    height: 22px;
    display: block;
    z-index: 1;
  }

  /* CD旋转动画 */
  @keyframes cd-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: none;
    outline: none;
    box-shadow: none;
    z-index: 1;
    display: block;

    /* 播放时应用旋转动画 */
    animation: ${(props) => (props.$isPlaying ? 'cd-rotate 3s linear infinite' : 'none')};
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

// 歌词文本容器 - 固定宽度避免抖动
const LyricTextWrapper = styled(motion.div)`
  width: 200px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 140px;
  }
`;

// 歌词文本
const LyricText = styled.div`
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

// 返回顶部按钮样式
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
    transition: opacity 0.25s ease;
  }

  &:hover {
    box-shadow:
      0 8px 24px rgba(var(--accent-rgb), 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }
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

interface FloatingToolbarProps {
  scrollPosition: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ scrollPosition }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    title: string;
    artist: string;
    pic: string;
    isPlaying: boolean;
  } | null>(null);
  const [coverImageError, setCoverImageError] = useState(false);
  const [currentLyric, setCurrentLyric] = useState<string | null>(null);
  const [isLyricBubbleEnabled, setIsLyricBubbleEnabled] = useState(true);
  const [isCapsuleExpanded, setIsCapsuleExpanded] = useState(false);

  useEffect(() => {
    setShowScrollTop(scrollPosition > 300);
  }, [scrollPosition]);

  // 监听歌词变化，控制胶囊展开 - 精确控制动画时序
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (currentLyric && isLyricBubbleEnabled) {
      // 立即展开
      setIsCapsuleExpanded(true);
    } else {
      // 延迟收缩，让文字淡出动画先完成
      timer = setTimeout(() => {
        setIsCapsuleExpanded(false);
      }, 120); // 与文字 exit 动画时长一致
    }

    // 总是返回 cleanup 函数
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
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

  const handleTrackChange = useCallback((track: { title: string; artist: string; pic: string; isPlaying: boolean }) => {
    setCurrentTrack(track);
    setCoverImageError(false); // 曲目变化时重置图片错误状态
  }, []);

  const handleLyricChange = useCallback(
    (lyric: string) => {
      setCurrentLyric((prevLyric) => {
        // 只在歌词气泡启用时更新
        if (isLyricBubbleEnabled) {
          return lyric;
        }
        return prevLyric;
      });
    },
    [isLyricBubbleEnabled],
  );

  const handleLyricBubbleToggle = useCallback((isEnabled: boolean) => {
    setIsLyricBubbleEnabled(isEnabled);
    if (!isEnabled) {
      setCurrentLyric(null);
    }
  }, []);

  return (
    <>
      <ToolbarContainer>
        {/* 音乐歌词胶囊 - 高性能弹簧动画 - 使用 CSS 变量实现响应式 */}
        <LyricCapsule
          isExpanded={isCapsuleExpanded}
          animate={{
            width: isCapsuleExpanded ? 'var(--expanded-width)' : 'var(--button-size)',
            borderRadius: 'var(--border-radius)',
          }}
          initial={{
            width: 'var(--button-size)',
            borderRadius: 'var(--border-radius)',
          }}
          transition={{
            type: 'spring',
            stiffness: 600, // 超高刚度，反应迅速
            damping: 40, // 超高阻尼，快速稳定，无震荡
            mass: 0.4, // 极轻质量，瞬间响应
            restDelta: 0.01, // 更早结束动画
            restSpeed: 0.01, // 更早结束动画
          }}
          style={
            {
              '--button-size': '48px',
              '--expanded-width': '264px',
              '--border-radius': '24px',
            } as React.CSSProperties
          }
        >
          <CapsuleContent>
            <MusicButton
              onClick={handleMusicPlayerToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              $isPlaying={currentTrack?.isPlaying}
              $hasCover={!!(currentTrack?.isPlaying && currentTrack.pic && !coverImageError)}
            >
              {currentTrack?.isPlaying && currentTrack.pic && !coverImageError ? (
                <img src={currentTrack.pic} alt="专辑封面" onError={() => setCoverImageError(true)} />
              ) : (
                <FiMusic />
              )}
            </MusicButton>

            {/* 歌词文本 - 快速淡入淡出，避免与容器动画冲突 */}
            <AnimatePresence mode="wait">
              {isCapsuleExpanded && currentLyric && (
                <LyricTextWrapper
                  key={currentLyric}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ ...SPRING_PRESETS.stiff, damping: 60 }}
                >
                  <LyricText>{currentLyric}</LyricText>
                </LyricTextWrapper>
              )}
            </AnimatePresence>
          </CapsuleContent>
        </LyricCapsule>

        {/* 返回顶部按钮 */}
        <AnimatePresence mode="wait">
          {showScrollTop && (
            <ToolbarButton
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
        onTrackChange={handleTrackChange}
      />
    </>
  );
};

export default FloatingToolbar;
