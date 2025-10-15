import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiArrowUp } from 'react-icons/fi';
import MusicPlayer from './modules/music-player';
import LyricBubble from './modules/lyric-bubble';

const ToolbarContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
  }
`;

// 歌词胶囊容器
const LyricCapsule = styled(motion.div)<{ isExpanded: boolean }>`
  position: fixed;
  bottom: 80px; /* 调整位置，避免与返回顶部按钮重叠 */
  right: 20px;
  display: flex;
  align-items: center;
  background: var(--accent-color);
  border-radius: ${(props) => (props.isExpanded ? '25px' : '50%')};
  padding: ${(props) => (props.isExpanded ? '8px 20px 8px 8px' : '8px')};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 100;

  @media (max-width: 768px) {
    bottom: 76px; /* 移动端也相应调整 */
    right: 16px;
  }
`;

// 音乐按钮
const MusicButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// 歌词文本
const LyricText = styled(motion.div)`
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 120px;
    margin-left: 6px;
  }
`;

// 歌词胶囊动画变体
const capsuleVariants = {
  collapsed: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    padding: '8px',
    transition: {
      duration: 0.4,
      ease: "easeInOut" as const,
    },
  },
  expanded: {
    width: 'auto',
    height: 48,
    borderRadius: '24px',
    padding: '8px 16px 8px 8px',
    transition: {
      duration: 0.4,
      ease: "easeInOut" as const,
    },
  },
};

// 歌词文本动画变体
const lyricTextVariants = {
  hidden: {
    opacity: 0,
    x: 20,
    width: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const,
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    width: 'auto',
    transition: {
      duration: 0.3,
      delay: 0.1,
      ease: "easeInOut" as const,
    },
  },
};

// 返回顶部按钮样式
const ToolbarButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--accent-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  opacity: 0.9;

  &:hover {
    background-color: var(--accent-color-hover);
    transform: scale(1.05);
    opacity: 1;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// 返回顶部按钮的动画变体
const scrollTopVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const,
    },
  },
  visible: {
    opacity: 0.9,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
  hover: {
    scale: 1.05,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeInOut" as const,
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
        <AnimatePresence mode="wait">
          {showScrollTop && (
            <ToolbarButton
              variants={scrollTopVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover="hover"
              whileTap="tap"
              onClick={handleScrollTop}
            >
              <FiArrowUp />
            </ToolbarButton>
          )}
        </AnimatePresence>
      </ToolbarContainer>

      {/* 歌词胶囊 */}
      <LyricCapsule
        isExpanded={isCapsuleExpanded}
        variants={capsuleVariants}
        animate={isCapsuleExpanded ? "expanded" : "collapsed"}
        initial="collapsed"
      >
        <MusicButton
          onClick={handleMusicPlayerToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMusic />
        </MusicButton>
        
        <AnimatePresence>
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
