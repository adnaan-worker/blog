import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiMusic, FiPlay, FiPause } from 'react-icons/fi';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const MiniPlayerContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  width: 220px; /* 固定宽度 */
  padding: 4px 8px;
  height: 36px;
  background: rgba(var(--bg-primary-rgb), 0.5);
  border: 1px solid rgba(var(--border-rgb), 0.2);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  margin-right: 12px;
  justify-content: space-between; /* 确保内容分布 */

  @media (max-width: 768px) {
    width: 36px;
    padding: 0;
    justify-content: center;
    background: transparent;
    border: none;
    margin-right: 8px;
  }

  &:hover {
    background: rgba(var(--bg-primary-rgb), 0.8);
    border-color: rgba(var(--accent-rgb), 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(var(--accent-rgb), 0.4);
    }
  }
`;

const DiscIcon = styled(motion.div)<{ isPlaying: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.3);

  svg {
    width: 14px;
    height: 14px;
  }

  /* 旋转动画 */
  animation: spin 3s linear infinite;
  animation-play-state: ${(props) => (props.isPlaying ? 'running' : 'paused')};

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const InfoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  height: 100%;
  margin: 0 8px;
  width: 0; /* 关键：允许 flex item 收缩到小于内容宽度 */

  @media (max-width: 768px) {
    display: none;
  }
`;

// 外层包装用于处理切换时的竖向进出动画
const VerticalTransitionWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

// 内层用于处理横向滚动
const HorizontalScrollText = styled(motion.div)`
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 500;
  display: inline-block;
  width: max-content;
`;

const MiniControls = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  padding: 0;

  &:hover {
    color: var(--accent-color);
    background: rgba(var(--accent-rgb), 0.1);
  }
`;

// 自动滚动文本组件
const AutoScrollText: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        setShouldScroll(true);
        setScrollDistance(textWidth - containerWidth + 10); // 多滚一点点留白
      } else {
        setShouldScroll(false);
        setScrollDistance(0);
      }
    }
  }, [text]);

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
      <HorizontalScrollText
        ref={textRef}
        animate={
          shouldScroll
            ? {
                x: [0, -scrollDistance, 0],
              }
            : { x: 0 }
        }
        transition={
          shouldScroll
            ? {
                duration: Math.max(scrollDistance / 20, 5), // 根据长度动态计算时间，最少5秒
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
                repeatDelay: 2, // 滚动完停顿2秒
              }
            : {}
        }
      >
        {text}
      </HorizontalScrollText>
    </div>
  );
};

interface MiniPlayerProps {
  onClick: (e?: React.MouseEvent) => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onClick }) => {
  const { isPlaying, currentTrack, togglePlay, showNavbarLyrics, currentLyric } = useMusicPlayer();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [currentTrack.pic]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  // 显示内容：如果有歌词且正在播放，显示歌词；否则显示歌名
  const displayText =
    showNavbarLyrics && isPlaying && currentLyric
      ? currentLyric.text
      : `${currentTrack.title} - ${currentTrack.artist}`;

  return (
    <MiniPlayerContainer onClick={onClick} whileTap={{ scale: 0.98 }}>
      <DiscIcon isPlaying={isPlaying}>
        {!imgError && currentTrack.pic ? (
          <img
            src={currentTrack.pic}
            alt="cover"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <FiMusic />
        )}
      </DiscIcon>

      <InfoContainer>
        <AutoScrollText key={displayText} text={displayText} />
      </InfoContainer>

      <MiniControls>
        <IconButton onClick={handlePlayPause}>{isPlaying ? <FiPause size={12} /> : <FiPlay size={12} />}</IconButton>
      </MiniControls>
    </MiniPlayerContainer>
  );
};

export default MiniPlayer;
