import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { IoColorPaletteOutline, IoDiceOutline, IoCheckmark } from 'react-icons/io5';
import { setColorIndex, setRandomColor } from '@/store/modules/themeSlice';
import { ACCENT_COLORS } from '@/theme/theme-color';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { RootState } from '@/store';

// 容器
const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 触发按钮
const TriggerButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  position: relative;

  /* 彩色光晕效果 */
  &::before {
    content: '';
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b);
    opacity: 0;
    filter: blur(8px);
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  &:hover::before {
    opacity: 0.5;
  }

  svg {
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(45deg);
    color: var(--accent-color);
  }
`;

// 弹出面板
const PickerPanel = styled(motion.div)`
  position: absolute;
  top: 120%;
  right: -10px; /* 向右偏移一点，防止超出屏幕 */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 16px;
  width: 280px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 100;

  [data-theme='dark'] & {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  /* 小三角 */
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: inherit;
    border-left: 1px solid inherit;
    border-top: 1px solid inherit;
    transform: rotate(45deg);
    border-radius: 2px 0 0 0;
    backdrop-filter: blur(12px);
  }
`;

// 标题区
const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// 颜色网格
const ColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

// 颜色项组件
const ColorItem = styled(motion.button)<{ color: string; isSelected: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.isSelected ? 'var(--text-primary)' : 'transparent')};
  background: ${(props) => props.color};
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: border-color 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  /* 内部光泽感 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%);
  }

  &:hover {
    transform: scale(1.1);
    z-index: 2;
  }

  svg {
    color: white;
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    z-index: 2;
  }
`;

// 随机按钮
const RandomButton = styled(ColorItem)`
  background: conic-gradient(from 0deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b);

  /* 旋转动画 */
  &::before {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1); /* 微弱遮罩增加层次 */
  }
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
`;

export const ThemeColorPicker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | 'random' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme); // 'light' | 'dark'
  const colorIndex = useSelector((state: RootState) => state.theme.colorIndex); // number | null

  useClickOutside(containerRef, () => setIsOpen(false));

  const handleSelectColor = (index: number) => {
    dispatch(setColorIndex(index));
  };

  const handleSelectRandom = () => {
    dispatch(setRandomColor());
  };

  // 根据当前主题获取展示的颜色列表
  // 为了让用户感知到对应关系，我们可以展示当前模式下的颜色
  const displayColors = theme === 'dark' ? ACCENT_COLORS.dark : ACCENT_COLORS.light;

  return (
    <Container ref={containerRef}>
      <TriggerButton
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="切换主题色"
      >
        <IoColorPaletteOutline size={22} />
      </TriggerButton>

      <AnimatePresence>
        {isOpen && (
          <PickerPanel
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <PanelHeader>
              <Title>
                <IoColorPaletteOutline />
                主题色风格
              </Title>
            </PanelHeader>

            <ColorsGrid>
              {/* 随机按钮 */}
              <div style={{ position: 'relative' }}>
                <RandomButton
                  color="transparent" // 使用 styled 中定义的渐变
                  isSelected={colorIndex === null}
                  onClick={handleSelectRandom}
                  onMouseEnter={() => setHoveredIndex('random')}
                  onMouseLeave={() => setHoveredIndex(null)}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  aria-label="随机颜色"
                >
                  {colorIndex === null && <IoCheckmark />}
                  {colorIndex !== null && <IoDiceOutline />}
                </RandomButton>
                <AnimatePresence>
                  {hoveredIndex === 'random' && (
                    <Tooltip initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                      随机风格
                    </Tooltip>
                  )}
                </AnimatePresence>
              </div>

              {/* 预设颜色 */}
              {displayColors.map((color, index) => (
                <div key={color} style={{ position: 'relative' }}>
                  <ColorItem
                    color={color}
                    isSelected={colorIndex === index}
                    onClick={() => handleSelectColor(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {colorIndex === index && <IoCheckmark />}
                  </ColorItem>
                  {/* 可以在这里加 Tooltip 显示颜色名称，如果需要 */}
                </div>
              ))}
            </ColorsGrid>
          </PickerPanel>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ThemeColorPicker;
