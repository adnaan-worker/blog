import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiCloudLightning, FiWind } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSimulatedAI } from './useSimulatedAI';
import GhostVisual from './visuals/GhostVisual';
import SheepVisual from './visuals/SheepVisual';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';

// ============================================================================
// 样式定义
// ============================================================================

// AI 思维气泡 - PC端样式
const ThoughtBubble = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 16px;
  padding: 10px 16px;
  background: rgba(var(--bg-secondary-rgb), 0.9);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  z-index: 920;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;

  /* 流光效果 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(45deg, transparent, rgba(var(--accent-rgb), 0.1), transparent);
    background-size: 200% 200%;
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

// 垂直功能栈容器
const StackContainer = styled(motion.div)`
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 900;
  pointer-events: none; /* 容器穿透 */
`;

const DockItem = styled(motion.div)`
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

// 极简玻璃态按钮 - 圆角矩形
const GlassButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 16px; /* Squircle */
  background: rgba(var(--bg-secondary-rgb), 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--border-rgb), 0.15);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(var(--bg-secondary-rgb), 0.9);
    color: var(--accent-color);
    border-color: rgba(var(--accent-rgb), 0.3);
    box-shadow:
      0 8px 20px rgba(var(--accent-rgb), 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

// 陪伴物独立容器 - 可拖拽，但默认吸附
const CompanionFloater = styled(motion.div)`
  position: fixed;
  z-index: 910;
  cursor: grab;
  touch-action: none;
  user-select: none;
  &:active {
    cursor: grabbing;
  }
`;

// AI 面板遮罩
const AIBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// AI 面板主体
const AIModal = styled(motion.div)`
  width: 600px;
  min-height: 400px;
  background: rgba(var(--bg-secondary-rgb), 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--border-rgb), 0.2);
  border-radius: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const GlowingOrb = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.8) 0%, rgba(var(--accent-rgb), 0) 70%);
  filter: blur(20px);
  margin-bottom: 32px;
`;

const AIInput = styled.input`
  width: 100%;
  background: rgba(var(--text-rgb), 0.05);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  border-radius: 16px;
  padding: 16px 24px;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-top: auto;
  outline: none;
  transition: all 0.2s;

  &:focus {
    background: rgba(var(--bg-primary-rgb), 0.8);
    border-color: var(--accent-color);
    box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
  }
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
`;

const AIChip = styled(motion.button)`
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(var(--bg-primary-rgb), 0.5);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: rgba(var(--bg-primary-rgb), 0.8);
    color: var(--text-primary);
  }
`;

const AIResponseArea = styled(motion.div)`
  width: 100%;
  flex: 1;
  padding: 0 20px;
  color: var(--text-primary);
  font-size: 1.1rem;
  line-height: 1.6;
  overflow-y: auto;
  margin-bottom: 20px;

  /* 隐藏滚动条但保持功能 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-rgb), 0.1);
    border-radius: 2px;
  }
`;

// ============================================================================
// 组件实现
// ============================================================================

const DesktopSmartDock: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [showBackTop, setShowBackTop] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const ai = useSimulatedAI();

  // 陪伴物交互
  const companion = useCompanionWidget({
    storageKey: 'desktop_companion_pos',
    width: 60,
    height: 75,
    defaultPosition: { x: window.innerWidth - 100, y: window.innerHeight - 180 },
    enablePhysics: true,
    enableSmartBubble: true,
    bubbleIdleTime: 4000,
    bubbleInterval: 10000,
  });

  // 获取天气图标
  const getWeatherIcon = () => {
    const weather = companion.smartContext?.weather;
    if (!weather) return null;

    switch (weather.condition) {
      case 'sunny':
        return <FiSun color="#F59E0B" />;
      case 'cloudy':
        return <FiCloud color="#9CA3AF" />;
      case 'rainy':
        return <FiCloudRain color="#3B82F6" />;
      case 'snowy':
        return <FiCloudSnow color="#E5E7EB" />;
      case 'stormy':
        return <FiCloudLightning color="#8B5CF6" />;
      case 'windy':
        return <FiWind color="#10B981" />;
      default:
        return null;
    }
  };

  // 处理 Hover 时的临时提示
  const [hoverHint, setHoverHint] = useState<string | null>(null);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (companion.isHovered && !companion.careBubble && !isAIActive) {
      timer = setTimeout(() => setHoverHint('点我试试 ✨'), 1000);
    } else {
      setHoverHint(null);
    }
    return () => clearTimeout(timer);
  }, [companion.isHovered, companion.careBubble, isAIActive]);

  const activeBubble = companion.careBubble || hoverHint;

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompanionClick = () => {
    if (!companion.isDragging) {
      setIsAIActive(true);
      companion.createParticles();
    }
  };

  return (
    <>
      {/* AI 全屏覆盖层 */}
      <AnimatePresence>
        {isAIActive && (
          <AIBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAIActive(false)}
          >
            <AIModal
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 核心光球 - 状态联动 */}
              <GlowingOrb
                animate={{
                  scale: ai.aiState === 'thinking' ? [1, 1.2, 1] : [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                  height: ai.aiState === 'idle' ? 100 : 60,
                  width: ai.aiState === 'idle' ? 100 : 60,
                  marginBottom: ai.aiState === 'idle' ? '32px' : '16px',
                }}
                transition={{ duration: ai.aiState === 'thinking' ? 1 : 3, repeat: Infinity }}
              />

              {/* 空闲状态：显示问候 */}
              {ai.aiState === 'idle' && !ai.reply && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ textAlign: 'center', width: '100%' }}
                >
                  <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hi, 我在听</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>我可以帮你做些什么？</p>

                  <ChipContainer>
                    <AIChip onClick={() => ai.send('总结当前页面')} whileHover={{ scale: 1.05 }}>
                      ✨ 总结当前页面
                    </AIChip>
                    <AIChip onClick={() => ai.send('播放推荐歌单')} whileHover={{ scale: 1.05 }}>
                      🎵 播放推荐歌单
                    </AIChip>
                    <AIChip onClick={() => ai.send('搜索站内文章')} whileHover={{ scale: 1.05 }}>
                      🔍 搜索站内文章
                    </AIChip>
                  </ChipContainer>
                </motion.div>
              )}

              {/* 对话状态：显示回复 */}
              {(ai.aiState === 'thinking' || ai.reply) && (
                <AIResponseArea initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {ai.aiState === 'thinking' && (
                    <motion.div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>正在思考...</motion.div>
                  )}
                  {ai.reply}
                </AIResponseArea>
              )}

              <AIInput
                placeholder="输入你想问的内容..."
                autoFocus
                value={ai.inputValue}
                onChange={(e) => ai.setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') ai.send(ai.inputValue);
                }}
              />
            </AIModal>
          </AIBackdrop>
        )}
      </AnimatePresence>

      {/* 1. 陪伴物 (守护者) */}
      <CompanionFloater
        ref={companion.widgetRef}
        style={{
          left: companion.position.x,
          top: companion.position.y,
          // AI 激活时隐藏陪伴物（因为它已经在 Modal 里了？或者保持显示？）
          // 为了视觉连贯性，我们可以保持它显示，或者让 Modal 出现时它暂时隐身
          opacity: isAIActive ? 0 : 1,
          pointerEvents: isAIActive ? 'none' : 'auto',
        }}
        onMouseDown={(e) => companion.handlePullStart(e.clientX, e.clientY)}
        onMouseEnter={() => companion.setIsHovered(true)}
        onMouseLeave={() => companion.setIsHovered(false)}
        onClick={handleCompanionClick}
        animate={companion.isPulling ? { scale: 1.1 } : { scale: 1 }}
      >
        {/* 视觉主体 */}
        {isDark ? (
          <GhostVisual
            clickCount={companion.clickCount}
            isHovered={companion.isHovered}
            isBlinking={companion.isBlinking}
            particles={companion.particles}
          />
        ) : (
          <SheepVisual
            clickCount={companion.clickCount}
            isHovered={companion.isHovered}
            isBlinking={companion.isBlinking}
            particles={companion.particles}
          />
        )}

        {/* AI 思维气泡 */}
        <AnimatePresence>
          {activeBubble && !companion.isPulling && !isAIActive && (
            <ThoughtBubble
              key={activeBubble}
              initial={{ opacity: 0, scale: 0.8, y: 10, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.8, y: 10, x: '-50%' }}
              onClick={(e) => {
                e.stopPropagation();
                handleCompanionClick();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                pointerEvents: 'auto',
                left: '50%',
                bottom: '100%',
                marginBottom: '16px',
                background: 'rgba(var(--bg-secondary-rgb), 0.9)',
                backdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid rgba(var(--accent-rgb), 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                borderRadius: '16px',
                padding: '10px 20px',
                minWidth: 'max-content',
              }}
            >
              {getWeatherIcon() || <span style={{ fontSize: '1.1rem' }}>💡</span>}
              <span style={{ fontWeight: 500 }}>{activeBubble}</span>
            </ThoughtBubble>
          )}
        </AnimatePresence>
      </CompanionFloater>

      {/* 2. 右下角功能栈 (The Habitat) */}
      {/* AI 模式下隐藏 */}
      {!isAIActive && (
        <StackContainer>
          <AnimatePresence>
            {/* 返回顶部 */}
            {showBackTop && (
              <DockItem
                key="backtop"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <GlassButton onClick={scrollToTop} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <FiArrowUp size={22} />
                </GlassButton>
              </DockItem>
            )}
          </AnimatePresence>
        </StackContainer>
      )}
    </>
  );
};

export default DesktopSmartDock;
