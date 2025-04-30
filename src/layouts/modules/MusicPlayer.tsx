import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiList, FiMusic, FiMessageSquare } from 'react-icons/fi';
import * as mm from 'music-metadata';

// 音乐播放器面板
const PlayerPanel = styled(motion.div)`
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  background-color: var(--bg-primary);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  overflow: hidden;
  z-index: 1000;

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.15);
    max-height: 70vh;
    overflow-y: auto;
    padding: 1rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-color-hover, #4a76e8));
  }
`;

// 播放器头部样式
const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .header-controls {
    display: flex;
    gap: 0.5rem;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    opacity: 0.7;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.3rem;
    border-radius: 50%;

    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.active {
      color: var(--accent-color);
      opacity: 1;
    }
  }
`;

// 音乐列表
const MusicList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.8rem 0;
  max-height: 180px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-height: 200px;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.3);
    border-radius: 3px;
  }
`;

// 音乐项
const MusicItem = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: ${(props) => (props.isActive ? 'rgba(81, 131, 245, 0.12)' : 'transparent')};
  border: none;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(81, 131, 245, 0.08);
  }

  .music-info {
    flex: 1;
    overflow: hidden;

    .title {
      font-size: 0.9rem;
      font-weight: ${(props) => (props.isActive ? '600' : '500')};
      color: var(--text-primary);
      margin: 0 0 0.2rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .music-status {
    color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'var(--text-secondary)')};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
`;

// 播放控制区
const PlayerControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  margin: 1.2rem 0 1rem;
  padding: 0.5rem 0;

  @media (max-width: 768px) {
    margin: 1.5rem 0 1.2rem;
    gap: 2rem;

    button.play-pause {
      width: 56px;
      height: 56px;
    }
  }

  button {
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(81, 131, 245, 0.1);
      transform: scale(1.1);
    }

    &.play-pause {
      width: 48px;
      height: 48px;
      background-color: var(--accent-color);
      color: white;

      &:hover {
        background-color: var(--accent-color-hover, #4a76e8);
      }
    }
  }
`;

// 音量控制区
const VolumeControl = styled.div<{ volumeValue: number }>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.2rem;

  svg {
    color: var(--text-secondary);
    min-width: 18px;
  }

  input[type='range'] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    background: linear-gradient(
      90deg,
      var(--accent-color) 0%,
      var(--accent-color) ${(props) => props.volumeValue * 100}%,
      var(--border-color) ${(props) => props.volumeValue * 100}%,
      var(--border-color) 100%
    );
    border-radius: 2px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent-color);
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform 0.1s ease;
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.2);
    }
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 4px;
  width: 100%;
  background: var(--border-color);
  border-radius: 2px;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${(props) => props.progress}%;
    background: var(--accent-color);
    border-radius: 2px;
    transition: width 0.1s linear;
  }
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin: 0.3rem 0 0.8rem;
`;

// 歌词显示区域
const LyricsContainer = styled.div`
  margin: 1rem 0;
  padding: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  font-family: 'Noto Sans SC', sans-serif;

  .lyrics-line {
    padding: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    text-align: center;
    line-height: 1.6;
    opacity: 0.6;

    &.active {
      color: var(--accent-color);
      font-weight: 500;
      transform: scale(1.02);
      opacity: 1;
      text-shadow: 0 0 10px rgba(81, 131, 245, 0.2);
    }

    &:hover {
      opacity: 0.8;
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.3);
    border-radius: 2px;
  }
`;

// 音乐播放列表
const musicList = [
  {
    id: 1,
    title: 'Lo-Fi Chill',
    artist: 'Lofi Records',
    url: 'https://meting.qjqq.cn/?server=netease&type=url&id=525278976',
    lyrics: [
      { time: 0, text: '【轻柔的音乐开始】' },
      { time: 10, text: '让思绪随着节奏飘扬' },
      { time: 20, text: '在这平静的时刻' },
      { time: 30, text: '感受音符的温度' },
      { time: 40, text: '无需言语，只需聆听' },
      { time: 50, text: '让心灵在乐声中舒展' },
      { time: 60, text: '这是属于你的时光' },
      { time: 70, text: '在音乐的怀抱中放松' },
    ],
  },
];

interface MusicMetadata {
  title: string;
  artist: string;
  album?: string;
  lyrics: Array<{ time: number; text: string }>;
  picture?: Uint8Array;
}

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onLyricChange?: (lyric: string) => void;
  onLyricBubbleToggle?: (isEnabled: boolean) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  isOpen, 
  onClose, 
  onLyricChange,
  onLyricBubbleToggle 
}) => {
  const [currentTrack, setCurrentTrack] = useState(musicList[0]);
  const [metadata, setMetadata] = useState<MusicMetadata | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showMusicList, setShowMusicList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLyricBubbleEnabled, setIsLyricBubbleEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 获取音乐元数据
  const getMusicMetadata = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error('获取音乐文件失败');
      
      const blob = await response.blob();
      const metadata = await mm.parseBlob(blob);
      
      // 处理歌词
      let formattedLyrics: Array<{ time: number; text: string }> = [];
      if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
        formattedLyrics = metadata.common.lyrics.map(lyric => {
          if (typeof lyric === 'string') {
            return { time: 0, text: lyric };
          }
          return {
            time: 0,
            text: lyric.text || ''
          };
        });
      }
      
      const musicMetadata: MusicMetadata = {
        title: metadata.common.title || '未知标题',
        artist: metadata.common.artist || '未知艺术家',
        album: metadata.common.album,
        lyrics: formattedLyrics,
        picture: metadata.common.picture?.[0]?.data,
      };

      console.log('获取到的音乐元数据:', musicMetadata);
      return musicMetadata;
    } catch (error) {
      console.error('获取音乐元数据失败:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 处理播放暂停
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.src !== currentTrack.url) {
          audioRef.current.src = currentTrack.url;
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放出错:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 播放特定曲目
  const playTrack = async (track: typeof musicList[0]) => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      const musicMetadata = await getMusicMetadata(track.url);
      if (musicMetadata) {
        setMetadata(musicMetadata);
        setCurrentTrack({
          ...track,
          title: musicMetadata.title,
          artist: musicMetadata.artist,
          lyrics: musicMetadata.lyrics.length > 0 ? musicMetadata.lyrics : track.lyrics
        });
      } else {
        setCurrentTrack(track);
      }
      
      if (audioRef.current.src !== track.url) {
        audioRef.current.src = track.url;
      }
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('播放出错:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 上一首/下一首
  const playPrev = () => {
    const currentIndex = musicList.findIndex((track) => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    playTrack(musicList[prevIndex]);
  };

  const playNext = () => {
    const currentIndex = musicList.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % musicList.length;
    playTrack(musicList[nextIndex]);
  };

  // 更新音量
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 更新播放时间
  const updateTime = () => {
    if (audioRef.current && isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  // 初始化音频元素和事件
  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.url;
    audio.volume = volume;
    audioRef.current = audio;

    const handleLoadedMetadata = async () => {
      setDuration(audio.duration);
      // 获取音乐元数据
      const musicMetadata = await getMusicMetadata(currentTrack.url);
      if (musicMetadata) {
        setMetadata(musicMetadata);
        // 更新当前曲目信息
        setCurrentTrack(prev => ({
          ...prev,
          title: musicMetadata.title,
          artist: musicMetadata.artist,
          lyrics: musicMetadata.lyrics.length > 0 ? musicMetadata.lyrics : prev.lyrics
        }));
      }
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 更新播放状态时启动时间更新
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // 获取当前播放的歌词
  const getCurrentLyric = () => {
    if (!currentTrack.lyrics) return null;

    for (let i = currentTrack.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= currentTrack.lyrics[i].time) {
        return currentTrack.lyrics[i];
      }
    }

    return null;
  };

  const currentLyric = getCurrentLyric();
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  // 监听播放状态变化
  useEffect(() => {
    if (!isPlaying && isLyricBubbleEnabled) {
      setIsLyricBubbleEnabled(false);
      if (onLyricBubbleToggle) {
        onLyricBubbleToggle(false);
      }
    }
  }, [isPlaying, onLyricBubbleToggle]);

  // 监听歌词变化
  useEffect(() => {
    if (currentLyric && onLyricChange && isLyricBubbleEnabled && isPlaying) {
      onLyricChange(currentLyric.text);
    }
  }, [currentLyric, onLyricChange, isLyricBubbleEnabled, isPlaying]);

  // 切换歌词气泡显示
  const toggleLyricBubble = () => {
    if (!isPlaying) return; // 暂停状态下不允许开启歌词气泡
    
    const newState = !isLyricBubbleEnabled;
    setIsLyricBubbleEnabled(newState);
    if (onLyricBubbleToggle) {
      onLyricBubbleToggle(newState);
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <PlayerPanel
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <PlayerHeader>
            <h4>
              {metadata?.title || currentTrack.title}
              {metadata?.artist && ` - ${metadata.artist}`}
            </h4>
            <div className="header-controls">
              <button 
                onClick={() => setShowMusicList(!showMusicList)} 
                title="切换歌曲列表"
                className={showMusicList ? 'active' : ''}
              >
                <FiList />
              </button>
              <button 
                onClick={() => setShowLyrics(!showLyrics)} 
                title="切换歌词显示"
                className={showLyrics ? 'active' : ''}
              >
                <FiMusic />
              </button>
              <button 
                onClick={toggleLyricBubble}
                title={isLyricBubbleEnabled ? "关闭歌词气泡" : "开启歌词气泡"}
                className={isLyricBubbleEnabled ? 'active' : ''}
                disabled={!isPlaying}
                style={{ opacity: !isPlaying ? 0.5 : 1 }}
              >
                <FiMessageSquare />
              </button>
              <button onClick={onClose} title="关闭播放器">
                <FiX />
              </button>
            </div>
          </PlayerHeader>

          {showMusicList && !showLyrics && (
            <MusicList>
              {musicList.map((track) => (
                <MusicItem
                  key={`track-${track.id}`}
                  isActive={track.id === currentTrack.id}
                  onClick={() => playTrack(track)}
                  disabled={isLoading}
                >
                  <div className="music-info">
                    <div className="title">
                      {track.id === currentTrack.id && metadata?.title 
                        ? metadata.title 
                        : track.title}
                    </div>
                    <div className="artist">
                      {track.id === currentTrack.id && metadata?.artist 
                        ? metadata.artist 
                        : track.artist}
                    </div>
                  </div>
                  <div className="music-status">
                    {track.id === currentTrack.id && isPlaying ? <FiPause /> : <FiPlay />}
                  </div>
                </MusicItem>
              ))}
            </MusicList>
          )}

          {showLyrics && (
            <LyricsContainer>
              {currentTrack.lyrics?.map((line, index) => (
                <div
                  key={`lyric-${index}-${line.time}`}
                  className={`lyrics-line ${currentLyric?.text === line.text ? 'active' : ''}`}
                >
                  {line.text}
                </div>
              ))}
            </LyricsContainer>
          )}

          <ProgressBar progress={progressPercentage} />
          <TimeDisplay>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </TimeDisplay>

          <PlayerControls>
            <button onClick={playPrev} disabled={isLoading}>
              <FiSkipBack />
            </button>
            <button 
              className="play-pause" 
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : isPlaying ? (
                <FiPause />
              ) : (
                <FiPlay />
              )}
            </button>
            <button onClick={playNext} disabled={isLoading}>
              <FiSkipForward />
            </button>
          </PlayerControls>

          <VolumeControl volumeValue={volume}>
            <FiVolume2 />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isLoading}
            />
          </VolumeControl>
        </PlayerPanel>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;