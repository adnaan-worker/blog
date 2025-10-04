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
      ease: [0.4, 0, 0.2, 1],
    },
  },
  visible: {
    opacity: 0.9,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.05,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1],
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

  useEffect(() => {
    setShowScrollTop(scrollPosition > 300);
  }, [scrollPosition]);

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

        <ToolbarButton
          onClick={handleMusicPlayerToggle}
          whileHover={{ scale: 1.05, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMusic />
        </ToolbarButton>
      </ToolbarContainer>

      <MusicPlayer
        isOpen={isMusicPlayerOpen}
        onClose={() => setIsMusicPlayerOpen(false)}
        onLyricChange={handleLyricChange}
        onLyricBubbleToggle={handleLyricBubbleToggle}
      />

      {currentLyric && <LyricBubble text={currentLyric} duration={3000} onComplete={handleLyricComplete} />}
    </>
  );
};

export default FloatingToolbar;
