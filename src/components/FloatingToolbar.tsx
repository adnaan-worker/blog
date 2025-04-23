import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

// 悬浮工具栏容器
const ToolbarContainer = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    bottom: 1.5rem;
    right: 1.5rem;
  }
`;

// 工具栏按钮
const ToolbarButton = styled(motion.button)`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background-color: var(--accent-color-hover, #4a76e8);
  }
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

// 音乐播放器面板
const MusicPlayerPanel = styled(motion.div)`
  position: absolute;
  bottom: 62px;
  right: 0;
  width: 320px;
  background-color: var(--bg-primary);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  overflow: hidden;
  
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
    z-index: 200;
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
  background: ${props => props.isActive ? 'rgba(81, 131, 245, 0.12)' : 'transparent'};
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
      font-weight: ${props => props.isActive ? '600' : '500'};
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
    color: ${props => props.isActive ? 'var(--accent-color)' : 'var(--text-secondary)'};
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

// 音量控制区接口
interface VolumeControlProps {
  volumeValue: number;
}

// 音量控制区
const VolumeControl = styled.div<VolumeControlProps>`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.2rem;
  
  svg {
    color: var(--text-secondary);
    min-width: 18px;
  }
  
  input[type="range"] {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    background: linear-gradient(
      90deg, 
      var(--accent-color) 0%, 
      var(--accent-color) ${props => props.volumeValue * 100}%, 
      var(--border-color) ${props => props.volumeValue * 100}%, 
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

// 提示文本组件
const NowPlayingInfo = styled.div`
  text-align: center;
  margin-bottom: 0.8rem;
  padding: 0 0.5rem;
  
  .now-playing {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--accent-color);
    margin-bottom: 0.3rem;
    font-weight: 600;
  }
  
  .track-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }
  
  .track-artist {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0.2rem 0 0;
  }
  
  @media (max-width: 768px) {
    .track-title {
      font-size: 1.1rem;
    }
    
    .track-artist {
      font-size: 0.9rem;
    }
  }
`;

// 歌词容器组件
const LyricsContainer = styled.div`
  margin: 1rem 0;
  padding: 0.8rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  text-align: center;
  max-height: 100px;
  overflow-y: auto;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.2);
    border-radius: 3px;
  }
  
  .lyrics-line {
    margin: 0.5rem 0;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    color: var(--text-secondary);
    
    &.active {
      font-weight: 500;
      color: var(--accent-color);
      font-size: 1rem;
    }
  }
`;

// 功能切换按钮
const FeatureToggleButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.2s ease;
  margin-top: 0.8rem;
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.08);
    color: var(--accent-color);
  }
  
  &.active {
    background-color: rgba(81, 131, 245, 0.12);
    color: var(--accent-color);
  }
  
  svg {
    width: 14px;
    height: 14px;
    margin-right: 5px;
  }
`;

// 歌词气泡组件
const LyricBubble = styled(motion.div)`
  position: fixed;
  bottom: 2.3rem;
  right: 5.8rem;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-hover, #4a76e8));
  color: white;
  padding: 0.9rem 1.8rem;
  border-radius: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  max-width: 300px;
  text-align: center;
  z-index: 150;
  pointer-events: none;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.5;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    bottom: 1.8rem; 
    right: 4.5rem;
    max-width: 200px;
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
    border-radius: 18px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -10px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid var(--accent-color-hover, #4a76e8);
    filter: drop-shadow(2px 0 2px rgba(0, 0, 0, 0.1));
  }
`;

// 音乐播放列表
const musicList = [
  {
    id: 1,
    title: "Lo-Fi Chill",
    artist: "Lofi Records",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    lyrics: [
      { time: 0, text: "【轻柔的音乐开始】" },
      { time: 10, text: "让思绪随着节奏飘扬" },
      { time: 20, text: "在这平静的时刻" },
      { time: 30, text: "感受音符的温度" },
      { time: 40, text: "无需言语，只需聆听" },
      { time: 50, text: "让心灵在乐声中舒展" },
      { time: 60, text: "这是属于你的时光" },
      { time: 70, text: "在音乐的怀抱中放松" }
    ]
  },
  {
    id: 2,
    title: "Jazz Cafe",
    artist: "Music Unlimited",
    url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_864fc5ee02.mp3?filename=lofi-chill-medium-version-159456.mp3",
    lyrics: [
      { time: 0, text: "【爵士节奏开始】" },
      { time: 12, text: "咖啡厅的午后时光" },
      { time: 24, text: "阳光透过窗户洒落" },
      { time: 36, text: "在爵士乐的陪伴下" },
      { time: 48, text: "品味生活的悠闲" },
      { time: 60, text: "让琴键带你穿越时空" },
      { time: 72, text: "在音符间寻找宁静" }
    ]
  },
  {
    id: 3,
    title: "Morning Coffee",
    artist: "Dream Studio",
    url: "https://cdn.pixabay.com/download/audio/2023/01/28/audio_b39677a204.mp3?filename=chill-lofi-song-8444.mp3",
    lyrics: [
      { time: 0, text: "【舒缓节奏开始】" },
      { time: 15, text: "清晨的第一缕阳光" },
      { time: 30, text: "伴随着咖啡的香气" },
      { time: 45, text: "开启新的一天" },
      { time: 60, text: "在音乐中寻找灵感" },
      { time: 75, text: "让心随着旋律舒展" },
      { time: 90, text: "感受这美好时刻" }
    ]
  },
  {
    id: 4,
    title: "Sunday Mood",
    artist: "Calm Beats",
    url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_74ee2d1ca6.mp3?filename=lofi-chill-114565.mp3",
    lyrics: [
      { time: 0, text: "【轻松节奏开始】" },
      { time: 13, text: "周日的慵懒时光" },
      { time: 26, text: "没有匆忙，没有烦恼" },
      { time: 39, text: "只有音乐与你相伴" },
      { time: 52, text: "让心情随着鼓点起舞" },
      { time: 65, text: "享受这难得的休闲" },
      { time: 78, text: "在旋律中找到平静" }
    ]
  },
  {
    id: 5,
    title: "Study Session",
    artist: "Productive Beats",
    url: "https://cdn.pixabay.com/download/audio/2022/10/11/audio_9243be0333.mp3?filename=lofi-study-112191.mp3",
    lyrics: [
      { time: 0, text: "【专注节奏开始】" },
      { time: 14, text: "集中精神，沉浸学习" },
      { time: 28, text: "让思路在音乐中清晰" },
      { time: 42, text: "每个音符都是灵感" },
      { time: 56, text: "在知识的海洋里探索" },
      { time: 70, text: "伴随着节拍前进" },
      { time: 84, text: "让学习成为享受" }
    ]
  }
];

// 返回顶部按钮接口
interface FloatingToolbarProps {
  scrollPosition: number;
}

// 添加新的按钮样式定义，用于返回顶部按钮
const ScrollTopButton = styled.button<{ visible: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  
  /* 使用纯CSS过渡代替Framer Motion动画 */
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1),
              opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1),
              box-shadow 0.3s ease;
              
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible 
    ? 'translateY(0) scale(1)' 
    : 'translateY(20px) scale(0.8)'};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  
  &:hover {
    transform: ${props => props.visible ? 'translateY(-3px)' : 'translateY(20px) scale(0.8)'};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background-color: var(--accent-color-hover, #4a76e8);
  }
  
  &:active {
    transform: ${props => props.visible ? 'scale(0.95)' : 'translateY(20px) scale(0.8)'};
  }
  
  svg {
    width: 22px;
    height: 22px;
  }
`;

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ scrollPosition }) => {
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(musicList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showLyricBubble, setShowLyricBubble] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // 监听滚动位置，显示或隐藏返回顶部按钮
  useEffect(() => {
    setShowScrollTop(scrollPosition > 300);
  }, [scrollPosition]);
  
  // 处理返回顶部点击
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // 处理播放暂停
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("播放出错:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // 播放特定曲目
  const playTrack = (track: typeof musicList[0]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("播放出错:", error);
        setIsPlaying(false);
      });
    }
  };
  
  // 上一首/下一首
  const playPrev = () => {
    const currentIndex = musicList.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    playTrack(musicList[prevIndex]);
  };
  
  const playNext = () => {
    const currentIndex = musicList.findIndex(track => track.id === currentTrack.id);
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
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
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
  
  // 获取当前的播放进度百分比
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  
  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 获取当前歌词
  const currentLyric = getCurrentLyric();
  
  // 处理当前歌词显示逻辑
  useEffect(() => {
    if (isPlaying && currentLyric) {
      setShowLyricBubble(true);
      
      const hideTimeout = setTimeout(() => {
        setShowLyricBubble(false);
      }, 4000);
      
      return () => clearTimeout(hideTimeout);
    } else if (!isPlaying) {
      setShowLyricBubble(false);
    }
  }, [currentLyric, isPlaying]);
  
  // 修改面板关闭处理，确保不影响播放状态
  const handlePanelClose = () => {
    setIsMusicOpen(false);
    // 如果正在播放，延迟显示气泡
    if (isPlaying && currentLyric) {
      setTimeout(() => {
        setShowLyricBubble(true);
      }, 300);
    }
  };
  
  return (
    <ToolbarContainer>
      <AnimatePresence>
        {isMusicOpen && (
          <MusicPlayerPanel
            key="music-player-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <PlayerHeader>
              <h4>音乐播放器</h4>
              <button onClick={handlePanelClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </PlayerHeader>
            
            {!showLyrics ? (
              <>
                <NowPlayingInfo>
                  <div className="now-playing">正在播放</div>
                  <div className="track-title">{currentTrack.title}</div>
                  <div className="track-artist">{currentTrack.artist}</div>
                </NowPlayingInfo>
                
                <MusicList>
                  {musicList.map(track => (
                    <MusicItem 
                      key={`track-${track.id}`} 
                      isActive={track.id === currentTrack.id}
                      onClick={() => playTrack(track)}
                    >
                      <div className="music-info">
                        <div className="title">{track.title}</div>
                        <div className="artist">{track.artist}</div>
                      </div>
                      <div className="music-status">
                        {track.id === currentTrack.id && isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                      </div>
                    </MusicItem>
                  ))}
                </MusicList>
              </>
            ) : (
              <>
                <NowPlayingInfo>
                  <div className="now-playing">歌词</div>
                  <div className="track-title">{currentTrack.title}</div>
                  <div className="track-artist">{currentTrack.artist}</div>
                </NowPlayingInfo>
                
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
              </>
            )}
            
            <div 
              style={{
                height: '4px', 
                width: '100%', 
                background: 'var(--border-color)',
                borderRadius: '2px',
                marginTop: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  background: 'var(--accent-color)',
                  borderRadius: '2px',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0.8rem' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <PlayerControls>
              <button onClick={playPrev}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>
              <button className="play-pause" onClick={togglePlay}>
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              <button onClick={playNext}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            </PlayerControls>
            
            <VolumeControl volumeValue={volume}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange} 
              />
            </VolumeControl>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8rem' }}>
              <FeatureToggleButton 
                className={!showLyrics ? 'active' : ''} 
                onClick={() => setShowLyrics(false)}
                style={{ marginRight: '0.4rem' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                播放列表
              </FeatureToggleButton>
              <FeatureToggleButton 
                className={showLyrics ? 'active' : ''} 
                onClick={() => setShowLyrics(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                查看歌词
              </FeatureToggleButton>
            </div>
          </MusicPlayerPanel>
        )}
        
        {/* 添加歌词气泡 */}
        {showLyricBubble && isPlaying && (
          <LyricBubble
            key="lyric-bubble"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {currentLyric?.text}
          </LyricBubble>
        )}
      </AnimatePresence>
      
      {/* 返回顶部按钮 - 使用纯CSS过渡 */}
      <ScrollTopButton 
        visible={showScrollTop} 
        onClick={handleScrollToTop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </ScrollTopButton>
      
      <ToolbarButton
        onClick={() => setIsMusicOpen(!isMusicOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMusicOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )}
      </ToolbarButton>
    </ToolbarContainer>
  );
};

export default FloatingToolbar; 