import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/modules/themeSlice';
import type { RootState } from '@/store';

// 主题切换按钮容器
const ThemeToggleContainer = styled(motion.div)`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
`;

// 主题切换按钮
const ThemeToggleButton = styled(motion.button)`
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;

  &:hover {
    background-color: var(--accent-color-alpha);
    color: var(--accent-color);
  }
`;

// 图标容器
const IconContainer = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  svg {
    color: var(--text-secondary);
    min-width: 20px;
  }
`;

// 太阳光线动画
const SunRays = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at center, var(--accent-color-alpha) 0%, transparent 70%);
  opacity: 0;
`;

// 简化的ThemeToggle组件
const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);

  // 太阳动画变体
  const sunVariants = {
    initial: {
      rotate: 0,
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      rotate: 360,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    exit: {
      rotate: -360,
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  // 月亮动画变体
  const moonVariants = {
    initial: {
      rotate: 0,
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      rotate: -360,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    exit: {
      rotate: 360,
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  // 光线动画变体
  const raysVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: 1.2,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <ThemeToggleContainer>
      <ThemeToggleButton
        onClick={() => dispatch(toggleTheme())}
        aria-label="切换主题"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <IconContainer key="sun" variants={sunVariants} initial="initial" animate="animate" exit="exit">
              <FiSun size={20} />
              <SunRays variants={raysVariants} initial="initial" animate="animate" exit="exit" />
            </IconContainer>
          ) : (
            <IconContainer key="moon" variants={moonVariants} initial="initial" animate="animate" exit="exit">
              <FiMoon size={20} />
            </IconContainer>
          )}
        </AnimatePresence>
      </ThemeToggleButton>
    </ThemeToggleContainer>
  );
};

export default ThemeToggle;
