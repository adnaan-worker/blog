import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolume1,
  FiVolumeX,
  FiList,
  FiMusic,
  FiX,
  FiMessageSquare,
  FiRepeat,
  FiShuffle,
  FiRefreshCw,
} from 'react-icons/fi';
import { useMusicPlayer, SongInfo } from '@/contexts/MusicPlayerContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const MobileBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
`;

const DragHandle = styled.div`
  width: 40px;
  height: 5px;
  background: var(--text-secondary); /* 使用更明显的颜色 */
  opacity: 0.4;
  border-radius: 3px;
  margin: 8px auto 20px; /* 增加顶部间距 */
  cursor: grab;
  position: relative;
  z-index: 10; /* 确保在上层 */
`;

const PlayerDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: rgba(var(--bg-secondary-rgb), 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(var(--border-rgb), 0.2);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  z-index: 100;
  transform-origin: top right;
  overflow: hidden;

  @media (max-width: 768px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 85vh; /* 底部弹窗高度 */
    border-radius: 20px 20px 0 0;
    border: none;
    border-top: 1px solid rgba(var(--border-rgb), 0.2);
    padding: 24px;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* 确保在最上层 */
    display: flex;
    flex-direction: column;
    /* 覆盖背景色，确保不透明 */
    background: var(--bg-secondary);
  }

  /* 暗色模式优化 */
  [data-theme='dark'] & {
    background: rgba(30, 30, 35, 0.85);
    border-color: rgba(255, 255, 255, 0.08);

    @media (max-width: 768px) {
      background: #1e1e23;
    }
  }
`;

const CoverArea = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

const CoverImage = styled(motion.div)<{ isPlaying: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    transform: scale(${(props) => (props.isPlaying ? 1.1 : 1)});
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
  }
`;

const TrackInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const Title = styled.h3`
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Artist = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
`;

const ControlButton = styled.button<{ size?: 'small' | 'medium' | 'large'; isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.isActive ? 'rgba(var(--accent-rgb), 0.15)' : 'transparent')};
  color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'var(--text-primary)')};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  width: ${(props) => (props.size === 'large' ? '48px' : props.size === 'medium' ? '36px' : '32px')};
  height: ${(props) => (props.size === 'large' ? '48px' : props.size === 'medium' ? '36px' : '32px')};

  &:hover {
    background: rgba(var(--accent-rgb), 0.1);
    color: var(--accent-color);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: ${(props) => (props.size === 'large' ? '24px' : '18px')};
    height: ${(props) => (props.size === 'large' ? '24px' : '18px')};
    fill: ${(props) => (props.size === 'large' ? 'currentColor' : 'none')};
  }
`;

const PlayButton = styled(ControlButton)`
  background: var(--accent-color);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);

  &:hover {
    background: var(--accent-color-hover);
    color: white;
    box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.4);
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(var(--text-rgb), 0.1);
  border-radius: 2px;
  margin: 16px 0 8px;
  cursor: pointer;
  position: relative;

  &:hover {
    height: 6px;
  }
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background: var(--accent-color);
  border-radius: 2px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.2s;
  }

  ${ProgressBarContainer}:hover &::after {
    opacity: 1;
  }
`;

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 8px;
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(var(--text-rgb), 0.1);
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent-color);
    cursor: pointer;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(var(--text-rgb), 0.05);
  border-radius: 12px;
  margin-top: 16px;
`;

const Tab = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 6px;
  border: none;
  background: ${(props) => (props.isActive ? 'var(--bg-primary)' : 'transparent')};
  color: ${(props) => (props.isActive ? 'var(--text-primary)' : 'var(--text-secondary)')};
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(props) => (props.isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none')};

  &:hover {
    color: var(--text-primary);
  }
`;

const ContentArea = styled.div`
  height: 200px;
  overflow-y: auto;
  margin-top: 12px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-rgb), 0.1);
    border-radius: 2px;
  }
`;

const PlaylistItem = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: ${(props) => (props.isActive ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent')};
  margin-bottom: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.isActive ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(var(--text-rgb), 0.05)')};
  }

  .index {
    font-size: 0.75rem;
    color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'var(--text-tertiary)')};
    width: 24px;
    text-align: center;
  }

  .info {
    flex: 1;
    margin-left: 8px;
    overflow: hidden;

    .title {
      font-size: 0.85rem;
      color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'var(--text-primary)')};
      font-weight: ${(props) => (props.isActive ? '600' : '400')};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
  }
`;

const LyricLine = styled.div<{ isActive: boolean }>`
  text-align: center;
  padding: 8px 0;
  color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'var(--text-secondary)')};
  font-weight: ${(props) => (props.isActive ? '600' : '400')};
  font-size: ${(props) => (props.isActive ? '1rem' : '0.9rem')};
  opacity: ${(props) => (props.isActive ? 1 : 0.6)};
  transition: all 0.3s;
  transform: scale(${(props) => (props.isActive ? 1.05 : 1)});
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  font-size: 0.9rem;
  gap: 8px;
`;

interface ExpandedPlayerProps {
  onClose: () => void;
}

const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({ onClose }) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    musicList,
    playTrack,
    currentLyric,
    showNavbarLyrics,
    toggleNavbarLyrics,
    playMode,
    togglePlayMode,
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<'playlist' | 'lyrics'>('playlist');
  const [imgError, setImgError] = useState(false);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setImgError(false);
  }, [currentTrack.pic]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  // 歌词自动滚动
  useEffect(() => {
    if (activeTab === 'lyrics' && currentLyric && lyricContainerRef.current) {
      const activeElement = lyricContainerRef.current.querySelector('.active-lyric');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyric, activeTab]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const playerContent = (
    <PlayerDropdown
      initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: -10 }}
      animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag={isMobile ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.2 }}
      onDragEnd={handleDragEnd}
      style={isMobile ? { touchAction: 'none' } : {}}
    >
      {isMobile && <DragHandle />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>NOW PLAYING</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ControlButton
            size="small"
            isActive={showNavbarLyrics}
            onClick={toggleNavbarLyrics}
            title={showNavbarLyrics ? '切换为歌曲信息' : '切换为歌词滚动'}
          >
            <FiMessageSquare />
          </ControlButton>
          <FiX style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose} />
        </div>
      </div>

      <CoverArea>
        <CoverImage isPlaying={isPlaying}>
          {!imgError && currentTrack.pic ? (
            <img src={currentTrack.pic} alt={currentTrack.title} onError={() => setImgError(true)} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--accent-color)',
                color: 'white',
              }}
            >
              <FiMusic size={32} />
            </div>
          )}
        </CoverImage>
        <TrackInfo>
          <Title>{currentTrack.title}</Title>
          <Artist>{currentTrack.artist}</Artist>
        </TrackInfo>
      </CoverArea>

      <ProgressBarContainer onClick={handleProgressBarClick}>
        <ProgressFill progress={duration ? (currentTime / duration) * 100 : 0} />
      </ProgressBarContainer>

      <TimeInfo>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </TimeInfo>

      <Controls>
        <ControlButton size="small" onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>
          {volume === 0 ? <FiVolumeX /> : volume < 0.5 ? <FiVolume1 /> : <FiVolume2 />}
        </ControlButton>
        <div style={{ width: 80, display: 'flex', alignItems: 'center' }}>
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ControlButton
            onClick={togglePlayMode}
            title={playMode === 'list' ? '列表循环' : playMode === 'single' ? '单曲循环' : '随机播放'}
          >
            {playMode === 'list' && <FiRepeat />}
            {playMode === 'single' && <FiRefreshCw />}
            {playMode === 'shuffle' && <FiShuffle />}
          </ControlButton>
          <ControlButton onClick={playPrev}>
            <FiSkipBack />
          </ControlButton>
          <PlayButton size="large" onClick={togglePlay}>
            {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: 2 }} />}
          </PlayButton>
          <ControlButton onClick={playNext}>
            <FiSkipForward />
          </ControlButton>
        </div>
      </Controls>

      <Tabs>
        <Tab isActive={activeTab === 'playlist'} onClick={() => setActiveTab('playlist')}>
          <FiList style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
          播放列表
        </Tab>
        <Tab isActive={activeTab === 'lyrics'} onClick={() => setActiveTab('lyrics')}>
          <FiMusic style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
          歌词
        </Tab>
      </Tabs>

      <ContentArea ref={lyricContainerRef}>
        {activeTab === 'playlist' ? (
          <div>
            {musicList.map((track, index) => (
              <PlaylistItem key={track.id} isActive={currentTrack.id === track.id} onClick={() => playTrack(track)}>
                <div className="index">
                  {currentTrack.id === track.id && isPlaying ? <FiMusic size={12} /> : index + 1}
                </div>
                <div className="info">
                  <div className="title">{track.title}</div>
                  <div className="artist">{track.artist}</div>
                </div>
              </PlaylistItem>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, index) => (
                <LyricLine
                  key={`${index}-${line.time}`}
                  isActive={currentLyric?.time === line.time}
                  className={currentLyric?.time === line.time ? 'active-lyric' : ''}
                >
                  {line.text}
                </LyricLine>
              ))
            ) : (
              <EmptyState>
                <FiMusic size={24} />
                <p>暂无歌词</p>
              </EmptyState>
            )}
          </div>
        )}
      </ContentArea>
    </PlayerDropdown>
  );

  if (isMobile) {
    return ReactDOM.createPortal(
      <>
        <MobileBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        {playerContent}
      </>,
      document.body,
    );
  }

  return playerContent;
};

export default ExpandedPlayer;
