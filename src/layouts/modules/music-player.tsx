import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiList,
  FiMusic,
  FiMessageSquare,
} from 'react-icons/fi';
import musicListData from '@/config/musicList.json';

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

// 音乐播放器面板 - 优化性能
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

  /* GPU加速 */
  ${gpuAcceleration as any}

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateZ(0); /* 保持GPU加速 */
    width: 100%;
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.15);
    max-height: 70vh;
    overflow-y: auto;
    padding: 1rem;

    /* 滚动性能优化 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-color-hover));
  }
`;

// 移动端拖拽指示器
const DragIndicator = styled.div`
  display: none;
  width: 36px;
  height: 4px;
  background: var(--text-secondary);
  opacity: 0.3;
  border-radius: 2px;
  margin: 0 auto 12px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  @media (max-width: 768px) {
    display: block;
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

  /* 滚动性能优化 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  ${gpuAcceleration as any}

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

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(81, 131, 245, 0.5);
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
        background-color: var(--accent-color-hover);
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
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

// 音乐播放列表初始数据
const initialMusicList = musicListData;

// 歌曲信息接口
interface SongInfo {
  name: string;
  artist: string;
  url: string;
  pic: string;
  lrc: string;
}

// 从Meting-api获取歌曲信息
const fetchSongInfo = async (songId: string, signal?: AbortSignal): Promise<SongInfo | null> => {
  try {
    const controller = new AbortController();
    const abortSignal = signal || controller.signal;

    // 10秒超时
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://meting.qjqq.cn/?server=tencent&type=song&id=${songId}`, {
      signal: abortSignal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('获取歌曲信息失败');
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('获取歌曲信息超时');
      throw new Error('歌曲信息请求超时');
    }
    console.error('获取歌曲信息失败:', error);
    throw error;
  }
};

// 解析LRC歌词
const parseLrc = (lrcContent: string): Array<{ time: number; text: string }> => {
  if (!lrcContent) return [];

  const lines = lrcContent.split('\n');
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  const result: Array<{ time: number; text: string }> = [];

  lines.forEach((line) => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });

  return result.sort((a, b) => a.time - b.time);
};

// 获取歌词内容
const fetchLyrics = async (
  lrcUrl: string,
  abortSignal?: AbortSignal,
): Promise<Array<{ time: number; text: string }>> => {
  try {
    // 设置请求超时
    const controller = new AbortController();
    const signal = abortSignal || controller.signal;

    // 5秒超时
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(lrcUrl, { signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('获取歌词失败');

    const lrcContent = await response.text();
    return parseLrc(lrcContent);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('获取歌词超时');
      throw new Error('歌词请求超时');
    }
    console.error('获取歌词失败:', error);
    throw error;
  }
};

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onLyricChange?: (lyric: string) => void;
  onLyricBubbleToggle?: (isEnabled: boolean) => void;
  onTrackChange?: (track: { title: string; artist: string; pic: string; isPlaying: boolean }) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isOpen,
  onClose,
  onLyricChange,
  onLyricBubbleToggle,
  onTrackChange,
}) => {
  // 音乐列表常量
  const musicList = initialMusicList;

  const [currentTrack, setCurrentTrack] = useState(musicList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showMusicList, setShowMusicList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLyricBubbleEnabled, setIsLyricBubbleEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null); // 保存清理函数

  // 加载歌曲信息
  const loadSongInfo = async (track: (typeof musicList)[0]) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      let audioUrl = track.url;
      let lyrics = track.lyrics;

      // 如果有songId，从Meting-api获取最新信息
      if (track.songId) {
        const songInfo = await fetchSongInfo(track.songId);
        if (songInfo && songInfo.url) {
          audioUrl = songInfo.url;
          // 更新当前曲目信息
          setCurrentTrack({
            ...track,
            title: songInfo.name,
            artist: songInfo.artist,
            url: songInfo.url,
            pic: songInfo.pic,
            lrc: songInfo.lrc,
          });

          // 如果有歌词URL，获取歌词
          if (songInfo.lrc) {
            try {
              const lyricsContent = await fetchLyrics(songInfo.lrc);
              lyrics = lyricsContent;
              setCurrentTrack((prev) => ({
                ...prev,
                lyrics: lyricsContent,
              }));
            } catch (error) {
              console.error('获取歌词失败:', error);
              lyrics = [{ time: 0, text: '【歌词加载失败】' }];
            }
          }
        }
      }

      if (!audioUrl || !audioUrl.startsWith('http')) {
        throw new Error('无效的音频URL');
      }

      // 验证URL是否可访问（带超时和取消支持）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(audioUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('音频源不可访问');
      }

      return audioUrl;
    } catch (error) {
      console.error('加载歌曲信息失败:', error);
      setErrorMessage('获取歌曲信息失败，请重试');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 创建音频元素
  const createAudioElement = (audioUrl: string) => {
    const newAudio = new Audio();
    newAudio.volume = volume;
    newAudio.preload = 'auto';
    newAudio.src = audioUrl;
    return newAudio;
  };

  // 初始化音频元素和事件
  useEffect(() => {
    // 只在组件挂载时创建音频元素
    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = volume;
      audio.preload = 'none';
      audioRef.current = audio;

      const cleanup = setupAudioEventListeners(audio);
      cleanupRef.current = cleanup; // 保存清理函数引用

      return () => {
        if (cleanupRef.current) {
          cleanupRef.current(); // 清理所有事件监听器
        }
        audio.pause();
        audio.src = '';
        audio.load(); // 释放音频资源
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 设置音频事件监听器
  const setupAudioEventListeners = (audio: HTMLAudioElement) => {
    const handleCanPlay = () => {
      setIsLoading(false);
      setIsPlaying(true);
      // 确保时长已加载
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;
      let errorMessage = '音频加载失败，请重试';

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = '音频加载被中断';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = '网络错误，请检查网络连接';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = '音频格式不支持';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = '音频源不支持';
            break;
          default:
            errorMessage = `音频加载失败 (错误代码: ${error.code})`;
        }
      }

      console.error('音频加载错误:', {
        error,
        currentSrc: audioElement.currentSrc,
        readyState: audioElement.readyState,
        networkState: audioElement.networkState,
      });

      setIsLoading(false);
      setIsPlaying(false);
      setErrorMessage(errorMessage);
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setCurrentTime(currentTime);
        if (duration && !isNaN(duration)) {
          setDuration(duration);
        }
        // 如果播放结束，重置进度
        if (currentTime >= duration) {
          setCurrentTime(0);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0); // 重置进度
      const currentIndex = musicList.findIndex((t) => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % musicList.length;
      if (nextIndex !== currentIndex) {
        playNext();
      }
    };

    // 添加事件监听器
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // 返回清理函数
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  };

  // 播放特定曲目
  const playTrack = async (track: (typeof musicList)[0]) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setIsPlaying(false);

      // 获取最新的音频URL
      const audioUrl = await loadSongInfo(track);

      if (!audioUrl) {
        throw new Error('无效的音频URL');
      }

      // 先清理旧的音频元素（避免触发error事件）
      if (audioRef.current && cleanupRef.current) {
        // 调用清理函数移除所有事件监听器
        cleanupRef.current();
        cleanupRef.current = null;

        // 停止播放并清理资源
        const oldAudio = audioRef.current;
        oldAudio.pause();
        oldAudio.currentTime = 0;
        oldAudio.src = '';
        oldAudio.load();
      }

      // 创建新的音频元素
      const newAudio = createAudioElement(audioUrl);

      // 设置事件监听器
      const cleanup = setupAudioEventListeners(newAudio);
      cleanupRef.current = cleanup; // 保存清理函数引用

      // 等待音频源加载
      await new Promise<void>((resolve, reject) => {
        const loadTimeout = setTimeout(() => {
          reject(new Error('音频加载超时'));
        }, 10000);

        const handleLoad = () => {
          clearTimeout(loadTimeout);
          resolve();
        };

        newAudio.addEventListener('canplay', handleLoad, { once: true });
        newAudio.addEventListener(
          'error',
          (e) => {
            clearTimeout(loadTimeout);
            reject(e);
          },
          { once: true },
        );
      });

      // 替换音频元素
      audioRef.current = newAudio;

      // 播放音频
      await newAudio.play();

      return cleanup;
    } catch (error) {
      console.error('播放出错:', error);
      setIsLoading(false);
      setIsPlaying(false);

      const errorMsg = error instanceof Error ? error.message : '播放失败，请重试';
      setErrorMessage(errorMsg);

      return () => {};
    }
  };

  // 上一首/下一首
  const playPrev = () => {
    const currentIndex = musicList.findIndex((track) => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    if (prevIndex !== currentIndex) {
      playTrack(musicList[prevIndex]);
    }
  };

  const playNext = () => {
    const currentIndex = musicList.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % musicList.length;
    if (nextIndex !== currentIndex) {
      playTrack(musicList[nextIndex]);
    } else {
      // 如果是最后一首，停止播放
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // 处理播放暂停
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);

      // 获取最新的音频URL
      const audioUrl = await loadSongInfo(currentTrack);

      if (!audioUrl) {
        throw new Error('无效的音频URL');
      }

      // 如果URL不同或音频元素没有源，需要重新加载
      if (audioRef.current.src !== audioUrl || !audioRef.current.src) {
        // 先清理旧的音频元素
        if (audioRef.current && cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;

          const oldAudio = audioRef.current;
          oldAudio.pause();
          oldAudio.currentTime = 0;
          oldAudio.src = '';
          oldAudio.load();
        }

        // 创建新的音频元素
        const newAudio = createAudioElement(audioUrl);

        // 设置事件监听器
        const cleanup = setupAudioEventListeners(newAudio);
        cleanupRef.current = cleanup;

        // 等待音频源加载
        await new Promise<void>((resolve, reject) => {
          const loadTimeout = setTimeout(() => {
            reject(new Error('音频加载超时'));
          }, 10000);

          const handleLoad = () => {
            clearTimeout(loadTimeout);
            resolve();
          };

          newAudio.addEventListener('canplay', handleLoad, { once: true });
          newAudio.addEventListener(
            'error',
            (e) => {
              clearTimeout(loadTimeout);
              reject(e);
            },
            { once: true },
          );
        });

        // 替换音频元素
        audioRef.current = newAudio;
      }

      // 播放音频
      await audioRef.current.play();
    } catch (error) {
      console.error('播放出错:', error);
      setIsLoading(false);
      setIsPlaying(false);

      const errorMsg = error instanceof Error ? error.message : '播放失败，请重试';
      setErrorMessage(errorMsg);
    }
  };

  // 更新音量
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // 获取当前播放的歌词 - 使用 useMemo 缓存
  const currentLyric = useMemo(() => {
    if (!currentTrack.lyrics || currentTrack.lyrics.length === 0) {
      return null;
    }

    for (let i = currentTrack.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= currentTrack.lyrics[i].time) {
        return currentTrack.lyrics[i];
      }
    }

    return currentTrack.lyrics[0];
  }, [currentTrack.lyrics, currentTime]);

  // 监听播放状态变化
  useEffect(() => {
    if (!isPlaying && isLyricBubbleEnabled) {
      setIsLyricBubbleEnabled(false);
      if (onLyricBubbleToggle) {
        onLyricBubbleToggle(false);
      }
    }
  }, [isPlaying, onLyricBubbleToggle, isLyricBubbleEnabled]);

  // 监听歌词变化
  useEffect(() => {
    if (currentLyric && onLyricChange && isLyricBubbleEnabled && isPlaying) {
      onLyricChange(currentLyric.text);
    }
  }, [currentLyric, onLyricChange, isLyricBubbleEnabled, isPlaying]);

  // 监听曲目或播放状态变化，通知父组件
  // 注意：不要把 onTrackChange 放入依赖数组，避免无限循环
  useEffect(() => {
    if (onTrackChange) {
      onTrackChange({
        title: currentTrack.title,
        artist: currentTrack.artist,
        pic: currentTrack.pic,
        isPlaying,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack.title, currentTrack.artist, currentTrack.pic, isPlaying]);

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
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 处理进度条点击
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !duration) return;

      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const progressPercentage = clickPosition / rect.width;
      const newTime = duration * progressPercentage;

      setCurrentTime(newTime);
      audioRef.current.currentTime = newTime;
    },
    [duration],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <PlayerPanel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            duration: ANIMATION_DURATION.normal,
            ease: EASING.ease,
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            // 向下拖拽超过 100px 则关闭面板（仅移动端）
            if (window.innerWidth <= 768 && info.offset.y > 100) {
              onClose();
            }
          }}
        >
          {/* 移动端拖拽指示器 */}
          <DragIndicator />

          <PlayerHeader>
            <h4>
              {currentTrack.title}
              {currentTrack.artist && ` - ${currentTrack.artist}`}
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
                title={isLyricBubbleEnabled ? '关闭歌词气泡' : '开启歌词气泡'}
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
                    <div className="title">{track.title}</div>
                    <div className="artist">{track.artist}</div>
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

          <ProgressBar
            progress={duration && !isNaN(duration) ? (currentTime / duration) * 100 : 0}
            onClick={handleProgressClick}
          />
          <TimeDisplay>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </TimeDisplay>

          {errorMessage && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--error-color)',
                margin: '0.5rem 0',
                fontSize: '0.9rem',
                padding: '0.5rem',
                backgroundColor: 'var(--error-bg)',
                borderRadius: '4px',
              }}
            >
              {errorMessage}
            </div>
          )}

          <PlayerControls>
            <button onClick={playPrev} disabled={isLoading}>
              <FiSkipBack />
            </button>
            <button
              className="play-pause"
              onClick={togglePlay}
              disabled={isLoading}
              title={errorMessage ? '重试' : isPlaying ? '暂停' : '播放'}
            >
              {isLoading ? <div className="loading-spinner" /> : isPlaying ? <FiPause /> : <FiPlay />}
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
