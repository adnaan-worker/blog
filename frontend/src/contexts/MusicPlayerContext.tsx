import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import musicListData from '@/data/music-list.json';
import { API } from '@/utils/api';

// 歌曲信息接口
export interface SongInfo {
  id: number | string;
  songId?: string;
  title: string;
  artist: string;
  url: string;
  pic: string;
  lrc?: string;
  lyrics?: Array<{ time: number; text: string }>;
}

export type PlayMode = 'list' | 'single' | 'shuffle';

interface MusicPlayerContextType {
  // 状态
  currentTrack: SongInfo;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  errorMessage: string | null;
  musicList: SongInfo[];
  playMode: PlayMode;

  // 歌词相关
  currentLyric: { time: number; text: string } | null;

  // UI状态
  showNavbarLyrics: boolean;
  toggleNavbarLyrics: () => void;

  // 动作
  togglePlay: () => void;
  playTrack: (track: SongInfo) => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  togglePlayMode: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// 从后端代理获取歌曲信息
const fetchSongInfo = async (songId: string): Promise<Partial<SongInfo> | null> => {
  try {
    // 使用后端代理API，避免CORS问题
    const response = await API.proxy.getMusicUrl('tencent', songId);

    if (response.success && response.data) {
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        const info = data[0];
        return {
          title: info.name,
          artist: info.artist,
          url: info.url,
          pic: info.pic,
          lrc: info.lrc,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取歌曲信息失败:', error);
    return null;
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
const fetchLyrics = async (lrcUrl: string, signal?: AbortSignal): Promise<Array<{ time: number; text: string }>> => {
  try {
    const response = await fetch(lrcUrl, { signal });
    if (!response.ok) throw new Error('获取歌词失败');
    const lrcContent = await response.text();
    return parseLrc(lrcContent);
  } catch (error) {
    console.error('获取歌词失败:', error);
    return [];
  }
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicList] = useState<SongInfo[]>(musicListData);
  const [currentTrack, setCurrentTrack] = useState<SongInfo>(musicList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNavbarLyrics, setShowNavbarLyrics] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('list');

  const toggleNavbarLyrics = useCallback(() => {
    setShowNavbarLyrics((prev) => !prev);
  }, []);

  const togglePlayMode = useCallback(() => {
    setPlayMode((prev) => {
      if (prev === 'list') return 'shuffle';
      if (prev === 'shuffle') return 'single';
      return 'list';
    });
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 加载歌曲详细信息（URL, 歌词等）
  const loadSongDetails = async (track: SongInfo) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      let audioUrl = track.url;
      let lyrics = track.lyrics;
      let trackInfo = { ...track };

      // 如果有songId，从Meting-api获取最新信息
      if (track.songId) {
        const songInfo = await fetchSongInfo(track.songId);
        if (songInfo && songInfo.url) {
          audioUrl = songInfo.url;
          trackInfo = {
            ...trackInfo,
            ...songInfo,
            url: songInfo.url!, // 确保 URL 存在
          };

          // 如果有歌词URL，获取歌词
          if (songInfo.lrc) {
            const lyricsContent = await fetchLyrics(songInfo.lrc);
            if (lyricsContent.length > 0) {
              lyrics = lyricsContent;
              trackInfo.lyrics = lyrics;
            }
          }
        }
      }

      // 验证音频URL
      if (!audioUrl || !audioUrl.startsWith('http')) {
        throw new Error('无效的音频URL');
      }

      return { audioUrl, trackInfo };
    } catch (error) {
      console.error('加载歌曲信息失败:', error);
      setErrorMessage('获取歌曲信息失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 播放指定曲目
  const playTrack = useCallback(
    async (track: SongInfo) => {
      if (isLoading) return;

      // 更新当前显示的曲目信息（即使还没有开始播放）
      setCurrentTrack(track);
      setIsPlaying(false);

      try {
        const result = await loadSongDetails(track);
        if (!result) return;

        const { audioUrl, trackInfo } = result;
        setCurrentTrack(trackInfo); // 更新完整的曲目信息（含歌词）

        if (audioRef.current) {
          // 检查 URL 是否有效
          if (!audioUrl) {
            throw new Error('音频 URL 为空');
          }

          audioRef.current.src = audioUrl;
          audioRef.current.load();

          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch((error) => {
                console.error('播放失败:', error);
                // 只有当错误不是由用户暂停引起时才更新状态
                if (error.name !== 'AbortError') {
                  setIsPlaying(false);
                  setErrorMessage('无法播放此音频');
                }
              });
          }
        }
      } catch (e: any) {
        console.error('Track load error:', e);
        setErrorMessage(e.message || '加载失败');
        setIsPlaying(false);
      }
    },
    [isLoading],
  );

  const playNext = useCallback(() => {
    let nextIndex = 0;
    const currentIndex = musicList.findIndex((t) => t.id === currentTrack.id);

    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * musicList.length);
      // 避免随机到同一首（除非只有一首）
      if (musicList.length > 1 && nextIndex === currentIndex) {
        nextIndex = (currentIndex + 1) % musicList.length;
      }
    } else {
      // list or single (manual next always goes to next song)
      nextIndex = (currentIndex + 1) % musicList.length;
    }
    playTrack(musicList[nextIndex]);
  }, [currentTrack, musicList, playMode, playTrack]);

  const playPrev = useCallback(() => {
    let prevIndex = 0;
    const currentIndex = musicList.findIndex((t) => t.id === currentTrack.id);

    if (playMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * musicList.length);
    } else {
      prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    }
    playTrack(musicList[prevIndex]);
  }, [currentTrack, musicList, playMode, playTrack]);

  // 设置音频监听器
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      if (audio.duration) setDuration(audio.duration);
    };

    const handleError = () => {
      setIsPlaying(false);
      setErrorMessage('音频加载失败');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      if (playMode === 'single') {
        // 单曲循环
        audio.play().catch(console.error);
        setIsPlaying(true);
      } else {
        playNext(); // 自动播放下一首
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext, playMode]); // playMode change should re-bind ended logic? No, handleEnded closes over playMode

  // 初始化音频（仅一次）
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = volume;
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // 如果当前有源，直接播放
      if (audioRef.current.src && audioRef.current.src !== window.location.href) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (e: any) {
          // 如果是支持的错误类型，尝试恢复
          if (e.name === 'NotSupportedError' || e.name === 'NotAllowedError') {
            console.warn('播放资源失效，尝试重新加载...', e.message);
            playTrack(currentTrack);
          } else if (e.name !== 'AbortError') {
            console.error('播放出错:', e);
            setIsPlaying(false);
          }
        }
      } else {
        // 没有源，重新加载当前曲目
        playTrack(currentTrack);
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  // 计算当前歌词
  const currentLyric = useMemo(() => {
    if (!currentTrack.lyrics || currentTrack.lyrics.length === 0) return null;

    // 找到当前时间对应的最后一句歌词
    for (let i = currentTrack.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= currentTrack.lyrics[i].time) {
        return currentTrack.lyrics[i];
      }
    }
    return currentTrack.lyrics[0];
  }, [currentTrack.lyrics, currentTime]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isLoading,
        errorMessage,
        musicList,
        currentLyric,
        showNavbarLyrics,
        toggleNavbarLyrics,
        togglePlay,
        playTrack,
        playNext,
        playPrev,
        seek,
        setVolume,
        playMode,
        togglePlayMode,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
