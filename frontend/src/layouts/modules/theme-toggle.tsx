import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiMonitor, FiCheck } from 'react-icons/fi';
import { IoDiceOutline, IoColorPaletteOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { cycleTheme, setMode, setColorIndex, setRandomColor } from '@/store/modules/themeSlice';
import { ACCENT_COLORS } from '@/theme/theme-color';
import { getElementCenter } from '@/utils/ui/theme';
import type { RootState } from '@/store';
import { useAnimationEngine } from '@/utils/ui/animation';

// 主题切换按钮容器
const ThemeToggleContainer = styled.div<{ $isMobile?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  ${(props) =>
    props.$isMobile &&
    `
    width: 100%;
    display: block;
  `}
`;

// 主题切换按钮
const ThemeToggleButton = styled(motion.button)`
  position: relative;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  z-index: 2;

  /* 悬停时显示背景 */
  &:hover {
    background-color: rgba(var(--text-primary-rgb), 0.05);
  }

  /* 禁用状态 */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
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
    width: 20px;
    height: 20px;
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

// ===== 高级面板 =====

const Panel = styled(motion.div)<{ $isMobile?: boolean }>`
  ${(props) =>
    !props.$isMobile
      ? `
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 12px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 16px;
    width: 260px;
    box-shadow: 
      0 10px 40px -10px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(0,0,0,0.02);
    overflow: hidden;
    transform-origin: top right;

    [data-theme='dark'] & {
      background: rgba(30, 30, 30, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 10px 40px -10px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255,255,255,0.05);
    }

    /* 连接小三角 */
    &::before {
      content: '';
      position: absolute;
      top: -6px;
      right: 14px;
      width: 12px;
      height: 12px;
      background: inherit;
      border-left: 1px solid inherit;
      border-top: 1px solid inherit;
      transform: rotate(45deg);
      border-radius: 2px 0 0 0;
      backdrop-filter: blur(16px);
    }
  `
      : `
    /* 移动端内联样式 */
    width: 100%;
    background: transparent;
    padding: 0;
  `}
`;

const PanelSection = styled.div`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// 模式切换器
const ModeSwitcher = styled.div`
  display: flex;
  background: rgba(var(--text-primary-rgb), 0.05);
  padding: 4px;
  border-radius: 12px;
  position: relative;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background: ${(props) => (props.isActive ? 'var(--bg-primary)' : 'transparent')};
  color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'var(--text-secondary)')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none')};
  font-size: 0.85rem;

  &:hover {
    color: var(--text-primary);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// 颜色网格
const ColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

const ColorButton = styled(motion.button)<{ color: string; isSelected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.isSelected ? 'var(--text-primary)' : 'transparent')};
  background: ${(props) => props.color};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  transition: border-color 0.2s ease;

  /* 内部光泽 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%);
  }

  svg {
    color: white;
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    z-index: 2;
  }
`;

const RandomButton = styled(ColorButton)`
  background: conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b);
`;

interface ThemeToggleProps {
  variant?: 'default' | 'mobile';
}

// 全能主题控制组件
const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'default' }) => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = useSelector((state: RootState) => state.theme.theme); // light | dark
  const colorIndex = useSelector((state: RootState) => state.theme.colorIndex);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = variant === 'mobile';

  const { springPresets } = useAnimationEngine();

  // 动画变体
  const iconVariants = {
    initial: { rotate: -90, scale: 0 },
    animate: { rotate: 0, scale: 1 },
    exit: { rotate: 90, scale: 0 },
  };

  // 处理Hover逻辑 - 增加延迟避免闪烁
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 300); // 300ms 延迟关闭
  };

  // 点击切换模式 (Primary Action)
  const handleToggle = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const center = buttonRef.current ? getElementCenter(buttonRef.current) : undefined;

    try {
      await dispatch(
        cycleTheme({
          x: center?.x,
          y: center?.y,
          duration: 800,
        }) as any,
      );
    } finally {
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  // 模式切换 (Panel Action)
  const handleModeSelect = (newMode: 'light' | 'dark' | 'auto') => {
    if (mode === newMode) return;

    // 使用无动画切换或简单的 dispatch
    dispatch(setMode(newMode) as any);
  };

  // 颜色选择
  const handleColorSelect = (index: number) => {
    dispatch(setColorIndex(index));
  };

  const handleRandomSelect = () => {
    dispatch(setRandomColor());
  };

  // 当前展示的颜色集
  const displayColors = theme === 'dark' ? ACCENT_COLORS.dark : ACCENT_COLORS.light;

  const renderPanelContent = () => (
    <>
      {/* 模式切换区 */}
      <PanelSection>
        <SectionTitle>模式</SectionTitle>
        <ModeSwitcher>
          <ModeButton isActive={mode === 'light'} onClick={() => handleModeSelect('light')}>
            <FiSun />
          </ModeButton>
          <ModeButton isActive={mode === 'dark'} onClick={() => handleModeSelect('dark')}>
            <FiMoon />
          </ModeButton>
          <ModeButton isActive={mode === 'auto'} onClick={() => handleModeSelect('auto')}>
            <FiMonitor />
          </ModeButton>
        </ModeSwitcher>
      </PanelSection>

      {/* 颜色选择区 */}
      <PanelSection>
        <SectionTitle>
          <IoColorPaletteOutline /> 主题色
        </SectionTitle>
        <ColorsGrid>
          {/* 随机按钮 */}
          <RandomButton
            color="transparent"
            isSelected={colorIndex === null}
            onClick={handleRandomSelect}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            {colorIndex === null ? <FiCheck /> : <IoDiceOutline />}
          </RandomButton>

          {/* 预设颜色 */}
          {displayColors.map((color, index) => (
            <ColorButton
              key={color}
              color={color}
              isSelected={colorIndex === index}
              onClick={() => handleColorSelect(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {colorIndex === index && <FiCheck />}
            </ColorButton>
          ))}
        </ColorsGrid>
      </PanelSection>
    </>
  );

  if (isMobile) {
    return (
      <ThemeToggleContainer $isMobile>
        <Panel $isMobile>{renderPanelContent()}</Panel>
      </ThemeToggleContainer>
    );
  }

  return (
    <ThemeToggleContainer ref={containerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* 主按钮 */}
      <ThemeToggleButton
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isTransitioning}
        aria-label="切换主题"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {mode === 'light' ? (
            <IconContainer
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springPresets.bouncy}
            >
              <FiSun />
              <SunRays
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              />
            </IconContainer>
          ) : mode === 'dark' ? (
            <IconContainer
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springPresets.bouncy}
            >
              <FiMoon />
            </IconContainer>
          ) : (
            <IconContainer
              key="auto"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springPresets.bouncy}
            >
              <FiMonitor />
            </IconContainer>
          )}
        </AnimatePresence>
      </ThemeToggleButton>

      {/* 高级面板 - Hover 显示 */}
      <AnimatePresence>
        {isHovering && (
          <Panel
            initial={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            {renderPanelContent()}
          </Panel>
        )}
      </AnimatePresence>
    </ThemeToggleContainer>
  );
};

export default ThemeToggle;
