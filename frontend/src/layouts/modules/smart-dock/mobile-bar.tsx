import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowUp,
  FiPause,
  FiPlay,
  FiSun,
  FiCloud,
  FiCloudRain,
  FiCloudSnow,
  FiCloudLightning,
  FiWind,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';
import { useSimulatedAI } from './useSimulatedAI';
import { dockItemHover } from './shared-styles';
import GhostVisual from './visuals/GhostVisual';
import SheepVisual from './visuals/SheepVisual';
import ExpandedPlayer from '../navbar-player/expanded-player';

// ============================================================================
// 样式定义
// ============================================================================

const WaveBar = styled(motion.div)`
  width: 3px;
  background-color: var(--accent-color);
  border-radius: 2px;
  margin-right: 2px;
`;

const Visualizer = () => (
  <div style={{ display: 'flex', alignItems: 'center', height: '12px', marginRight: '6px' }}>
    {[1, 2, 3].map((i) => (
      <WaveBar
        key={i}
        animate={{ height: [4, 12, 4] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// AI 核心光球
const GlowingOrb = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.8) 0%, rgba(var(--accent-rgb), 0) 70%);
  filter: blur(20px);
  margin-bottom: 32px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, rgba(var(--text-rgb), 0.2) 0%, transparent 70%);
    filter: blur(30px);
    border-radius: 50%;
    z-index: -1;
  }
`;

// AI 对话面板 - 确保层级最高
const AIOverlayContainer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 85vh;
  background: rgba(var(--bg-secondary-rgb), 0.98);
  backdrop-filter: blur(24px) saturate(180%);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  z-index: 2000; /* 提高层级，确保不被遮挡 */
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.2);
  touch-action: none; /* 防止背景滚动 */
`;

const AIResponseArea = styled(motion.div)`
  width: 100%;
  padding: 20px;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  height: 100%;
  overflow-y: auto;
`;

const AIInputArea = styled.div`
  width: 100%;
  margin-top: auto;
  margin-bottom: 32px;
  position: relative;
`;

const AIGreeting = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  text-align: center;
`;

const AISuggestionChip = styled(motion.button)`
  padding: 10px 20px;
  background: rgba(var(--bg-primary-rgb), 0.5);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 6px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:active {
    background: rgba(var(--text-rgb), 0.05);
    transform: scale(0.98);
  }
`;

const HandleBar = styled.div`
  width: 48px;
  height: 5px;
  background: var(--text-tertiary);
  border-radius: 3px;
  opacity: 0.3;
  margin-bottom: 48px;
`;

// 灵动胶囊容器
const CapsuleContainer = styled(motion.div)<{ isVisible: boolean }>`
  position: fixed;
  bottom: 24px;
  left: 16px;
  right: 16px;
  height: 68px;
  border-radius: 34px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  z-index: 900;
  overflow: visible;

  background-color: ${(props) => (props.isVisible ? 'rgba(var(--bg-secondary-rgb), 0.85)' : 'transparent')};
  backdrop-filter: ${(props) => (props.isVisible ? 'blur(16px) saturate(180%)' : 'blur(0px)')};
  box-shadow: ${(props) => (props.isVisible ? '0 8px 32px rgba(0, 0, 0, 0.12)' : 'none')};
  border: ${(props) => (props.isVisible ? '1px solid rgba(var(--border-rgb), 0.15)' : '1px solid transparent')};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

// 陪伴物容器
const BoundaryBreaker = styled(motion.div)`
  position: absolute;
  left: -6px;
  bottom: 12px;
  width: 64px;
  height: 72px;
  z-index: 910;
  cursor: pointer;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  ${dockItemHover}

  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

// AI 思维气泡 - 样式优化
const ThoughtBubble = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 12px;
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
  transform-origin: bottom left;
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

const ContentArea = styled(motion.div)`
  flex: 1;
  height: 100%;
  margin-left: 52px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  z-index: 905;
`;

const MainText = styled(motion.div)`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubText = styled(motion.div)`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
  margin-top: 2px;
`;

const ActionArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 6px;
  z-index: 905;
`;

const CircleButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(var(--text-rgb), 0.03);
  border: 1px solid rgba(var(--border-rgb), 0.05);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;

  &:active {
    transform: scale(0.95);
    background: rgba(var(--text-rgb), 0.08);
  }
`;

const ProgressRing = styled.svg`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%) rotate(-90deg);
  pointer-events: none;
`;

// ============================================================================
// 组件实现
// ============================================================================

const MobileSmartDock: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [showBackTop, setShowBackTop] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const ai = useSimulatedAI();

  const { isPlaying, currentTrack, togglePlay, currentLyric, duration, currentTime } = useMusicPlayer();
  const hasTrack = !!currentTrack.id;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const companion = useCompanionWidget({
    storageKey: 'mobile_dock_companion',
    width: 60,
    height: 70,
    enablePhysics: false,
    enableSmartBubble: true,
    bubbleIdleTime: 8000,
  });

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

  // --------------------------------------------------------------------------
  // 事件处理函数
  // --------------------------------------------------------------------------

  const handleCompanionClick = () => {
    setIsAIActive(true);
    companion.createParticles();
  };

  const handleContentClick = () => {
    if (hasTrack) {
      setShowFullPlayer(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dock 显示逻辑：常驻 (只要有歌或有 BackTop)
  const shouldShowDock = !isAIActive && (hasTrack || showBackTop);

  const mainText = hasTrack ? (isPlaying && currentLyric ? currentLyric.text : currentTrack.title) : '';

  const subText = hasTrack ? `${currentTrack.artist}` : '';

  return (
    <>
      <AnimatePresence>
        {isAIActive && (
          <motion.div
            key="ai-mask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 940,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setIsAIActive(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAIActive && (
          <AIOverlayContainer
            key="ai-overlay"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 150) setIsAIActive(false);
            }}
          >
            <HandleBar />

            <GlowingOrb
              key="glowing-orb"
              animate={{
                scale: ai.aiState === 'thinking' ? [1, 1.2, 1] : [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
                height: ai.aiState === 'idle' ? 120 : 60,
                width: ai.aiState === 'idle' ? 120 : 60,
                marginBottom: ai.aiState === 'idle' ? '32px' : '16px',
              }}
              transition={{ duration: ai.aiState === 'thinking' ? 1 : 3, repeat: Infinity }}
            />

            {ai.aiState === 'idle' && !ai.reply && (
              <motion.div
                key="ai-idle-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ textAlign: 'center', width: '100%' }}
              >
                <AIGreeting>Hi, 我在听</AIGreeting>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>
                  我可以帮你总结文章、播放音乐或回答问题
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '32px',
                  }}
                >
                  <AISuggestionChip onClick={() => ai.send('总结这篇文章')} whileTap={{ scale: 0.95 }}>
                    ✨ 总结这篇文章
                  </AISuggestionChip>
                  <AISuggestionChip onClick={() => ai.send('播放推荐音乐')} whileTap={{ scale: 0.95 }}>
                    🎵 播放推荐音乐
                  </AISuggestionChip>
                  <AISuggestionChip onClick={() => ai.send('今天有什么新闻')} whileTap={{ scale: 0.95 }}>
                    📰 今天有什么新闻
                  </AISuggestionChip>
                </div>
              </motion.div>
            )}

            {(ai.aiState === 'thinking' || ai.reply) && (
              <AIResponseArea key="ai-response" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {ai.aiState === 'thinking' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}
                  >
                    正在思考...
                  </motion.div>
                )}
                {ai.reply}
              </AIResponseArea>
            )}

            <AIInputArea>
              <div
                style={{
                  background: 'rgba(var(--text-rgb), 0.05)',
                  borderRadius: '24px',
                  padding: '8px 16px',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(var(--border-rgb), 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <input
                  style={{
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    padding: '8px 0',
                  }}
                  placeholder="输入你想问的内容..."
                  value={ai.inputValue}
                  onChange={(e) => ai.setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') ai.send(ai.inputValue);
                  }}
                />
              </div>
            </AIInputArea>
          </AIOverlayContainer>
        )}
      </AnimatePresence>

      <CapsuleContainer
        isVisible={!!shouldShowDock}
        initial={false}
        animate={{
          width: shouldShowDock ? 'auto' : 'fit-content',
          y: isAIActive ? 100 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none' }}
      >
        <BoundaryBreaker
          style={{ pointerEvents: 'auto' }}
          onClick={handleCompanionClick}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: isPlaying ? [0, -4, 0] : [0, -2, 0],
            rotate: isPlaying ? [0, 2, 0, -2, 0] : 0,
          }}
          transition={{
            y: { duration: isPlaying ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          }}
        >
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
        </BoundaryBreaker>

        {/* AI 思维气泡 (Proactive Thought) */}
        <AnimatePresence>
          {!!companion.careBubble && !isAIActive && (
            <ThoughtBubble
              key={companion.careBubble || 'thought-bubble'}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCompanionClick();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ pointerEvents: 'auto' }}
            >
              {getWeatherIcon() || <span style={{ fontSize: '1rem' }}>✨</span>}
              {companion.careBubble}
            </ThoughtBubble>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {shouldShowDock && (
            <ContentArea
              key="dock-content"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              onClick={handleContentClick}
              style={{ pointerEvents: 'auto' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainText || 'empty-text'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MainText>
                    {hasTrack && isPlaying ? <Visualizer /> : null}
                    {mainText}
                  </MainText>
                  {subText && <SubText>{subText}</SubText>}
                </motion.div>
              </AnimatePresence>
            </ContentArea>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {shouldShowDock && hasTrack && (
            <ActionArea key="action-play" style={{ pointerEvents: 'auto' }}>
              <CircleButton
                key="play-control"
                layout
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                initial={{ scale: 0, width: 0, opacity: 0 }}
                animate={{ scale: 1, width: 48, opacity: 1 }}
                exit={{ scale: 0, width: 0, opacity: 0 }}
              >
                <ProgressRing viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(var(--text-rgb), 0.05)" strokeWidth="2" />
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeWidth="2"
                    strokeDasharray={`${progress}, 100`}
                    pathLength={100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                  />
                </ProgressRing>
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} style={{ marginLeft: 2 }} />}
              </CircleButton>
            </ActionArea>
          )}

          {shouldShowDock && showBackTop && (
            <ActionArea key="action-backtop" style={{ pointerEvents: 'auto' }}>
              <CircleButton
                key="back-top"
                layout
                initial={{ scale: 0, width: 0, opacity: 0, marginLeft: 0 }}
                animate={{ scale: 1, width: 48, opacity: 1, marginLeft: 8 }}
                exit={{ scale: 0, width: 0, opacity: 0, marginLeft: 0 }}
                onClick={scrollToTop}
              >
                <FiArrowUp size={22} />
              </CircleButton>
            </ActionArea>
          )}
        </AnimatePresence>
      </CapsuleContainer>

      <AnimatePresence>
        {showFullPlayer && <ExpandedPlayer key="expanded-player" onClose={() => setShowFullPlayer(false)} />}
      </AnimatePresence>
    </>
  );
};

export default MobileSmartDock;
