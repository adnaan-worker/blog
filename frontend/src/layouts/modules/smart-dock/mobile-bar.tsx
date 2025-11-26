import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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
  FiMusic,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';
import { useSimulatedAI } from './useSimulatedAI';
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

// 音乐胶囊容器 (垫在 Pet 下面)
const MusicCapsule = styled(motion.div)<{ isVisible: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 16px;
  left: auto;
  height: 56px; /* 高度减小 */
  border-radius: 28px;
  display: flex;
  align-items: center;
  z-index: 900; /* 比 Pet 低 */
  overflow: hidden;

  background-color: ${(props) => (props.isVisible ? 'rgba(var(--bg-secondary-rgb), 0.85)' : 'transparent')};
  backdrop-filter: ${(props) => (props.isVisible ? 'blur(16px) saturate(180%)' : 'blur(0px)')};
  box-shadow: ${(props) => (props.isVisible ? '0 8px 32px rgba(0, 0, 0, 0.12)' : 'none')};
  border: ${(props) => (props.isVisible ? '1px solid rgba(var(--border-rgb), 0.15)' : '1px solid transparent')};

  transform-origin: center right;
`;

// Pet 容器
const PetContainer = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 16px;
  width: 56px; /* 与胶囊高度一致，保证中心对齐，或者稍大 */
  height: 72px; /* 比胶囊高 */
  z-index: 910; /* 比胶囊高 */
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none; /* 让点击穿透到 BoundaryBreaker */
  overflow: visible; /* 确保轨迹不被遮挡 */
`;

// 陪伴物容器 (负责拖拽和位置)
const BoundaryBreaker = styled(motion.div)`
  width: 100%;
  height: 100%;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 915;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

// 内部视觉容器 (负责悬浮、旋转、形变)
const PetVisual = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  padding-bottom: 4px;
`;

// AI 思维气泡
const ThoughtBubble = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  right: 12px;
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
  transform-origin: bottom right;
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

// 封面旋转动画
const CoverSpin = styled(motion.div)<{ isPlaying: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid rgba(var(--text-rgb), 0.1);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* 中心圆点，像唱片一样 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

const ContentArea = styled(motion.div)`
  height: 100%;
  margin-left: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center; /* 改为水平对齐 */
  cursor: pointer;
  overflow: hidden;
  position: relative;
  z-index: 905;
  min-width: 160px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const MainText = styled(motion.div)`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const ActionArea = styled(motion.div)`
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
  // 默认收起，只有播放时才自动展开，或者用户手动展开
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);
  const ai = useSimulatedAI();

  const {
    isPlaying,
    currentTrack,
    togglePlay,
    playNext,
    playPrev,
    currentLyric,
    duration,
    currentTime,
    showNavbarLyrics,
  } = useMusicPlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 弹性形变逻辑：模拟弹簧滑块 (微调：减小拉伸幅度，使其更自然)
  const scaleX = useTransform(x, [-60, 0, 60], [1.05, 1, 0.95]);
  const scaleY = useTransform(y, [-60, 0], [1.05, 1]);

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

  // 处理滑动手势 - 改为控制展开/收起
  const handleDragEnd = (event: any, info: any) => {
    // 向右滑动 (offset.x > 0) -> 收起
    if (info.offset.x > 30) {
      setIsMusicExpanded(false);
    }
  };

  // Pet 上的滑动处理
  const handlePetDragEnd = (event: any, info: any) => {
    const { x: dragX, y: dragY } = info.offset;

    // 向上滑动 -> 返回置顶
    if (dragY < -50) {
      scrollToTop();
      setIsScrolling(true);
      // 延迟恢复悬浮动画，防止滚动时抖动
      setTimeout(() => {
        setIsDragging(false);
        setIsScrolling(false);
      }, 1000);
      return;
    }

    setIsDragging(false); // 非滚动操作立即恢复

    // 向左滑动 -> 展开
    if (dragX < -30 && !isMusicExpanded) {
      setIsMusicExpanded(true);
    }

    // 向右滑动 -> 收起
    if (dragX > 30 && isMusicExpanded) {
      setIsMusicExpanded(false);
    }
  };

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

  // Dock 显示逻辑：常驻 (只要不在 AI 模式下，就一直显示陪伴物)
  // 这样用户随时可以通过左滑陪伴物来打开音乐面板
  const shouldShowDock = !isAIActive;

  // 胶囊是否展开：手动展开，或者正在播放时自动展开
  const showCapsuleContent = isMusicExpanded;

  const mainText = hasTrack ? currentTrack.title : "Adnaan's Blog";

  // Subtext logic: Show lyrics if enabled, otherwise show Artist / Paused state
  const subText = hasTrack
    ? showNavbarLyrics && currentLyric
      ? currentLyric.text
      : isPlaying
        ? currentTrack.artist
        : `Paused - ${currentTrack.artist}`
    : '点击播放音乐';

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

      <AnimatePresence>
        {/* 当 showCapsuleContent 为 true 时展开，为 false 时完全收起（隐藏） */}
        <MusicCapsule
          isVisible={true}
          layout
          initial={false}
          animate={{
            width: showCapsuleContent ? 'calc(100vw - 100px)' : 0, // 使用计算宽度代替 auto，消除停顿
            paddingRight: showCapsuleContent ? 56 : 0,
            opacity: showCapsuleContent ? 1 : 0, // 收起时透明
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            layout: { duration: 0.3 },
          }}
          style={{ pointerEvents: showCapsuleContent ? 'auto' : 'none' }} // 收起时禁止交互
        >
          {/* 1. 内容区域 (左侧) */}
          <AnimatePresence mode="wait">
            {showCapsuleContent && (
              <ContentArea
                key="dock-content"
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleContentClick}
              >
                <CoverSpin
                  isPlaying={isPlaying && hasTrack}
                  animate={{ rotate: isPlaying && hasTrack ? 360 : 0 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  style={{ rotate: 0 }}
                >
                  {hasTrack && currentTrack.pic ? (
                    <img src={currentTrack.pic} alt="cover" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FiMusic size={20} style={{ opacity: 0.5 }} />
                    </div>
                  )}
                </CoverSpin>
                <TextContainer>
                  <MainText>{mainText}</MainText>
                  {subText && <SubText>{subText}</SubText>}
                </TextContainer>
              </ContentArea>
            )}
          </AnimatePresence>

          {/* 2. 播放控制 (中间) */}
          <AnimatePresence>
            {showCapsuleContent && (
              <ActionArea key="action-play" layout style={{ marginRight: 12 }}>
                <CircleButton
                  key="play-control"
                  layout
                  onClick={(e) => {
                    e.stopPropagation();
                    hasTrack ? togglePlay() : playNext();
                  }}
                  whileTap={{ scale: 0.9 }}
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
          </AnimatePresence>
        </MusicCapsule>
      </AnimatePresence>

      {/* 3. 陪伴物 (最右侧) - 始终存在且独立 */}
      <PetContainer>
        {/* 陪伴物容器 (负责拖拽和位置) */}
        <BoundaryBreaker
          layout
          onClick={handleCompanionClick}
          drag={true}
          dragConstraints={{ left: -200, right: 0, top: -300, bottom: 0 }}
          dragElastic={0.6} // 增加弹性，手感更轻
          dragSnapToOrigin={true} // 松手自动回弹
          dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }} // 回弹有力
          onDragStart={() => setIsDragging(true)}
          onDrag={(event, info) => {
            x.set(info.offset.x);
            y.set(info.offset.y);
          }}
          onDragEnd={handlePetDragEnd}
          whileTap={{ scale: 0.95 }}
        >
          {/* 内部视觉容器 (负责悬浮、旋转、形变) */}
          <PetVisual
            style={{ scaleX, scaleY }}
            animate={{
              y: isPlaying ? [0, -4, 0] : [0, -2, 0], // 悬浮动画独立运行
            }}
            transition={{
              y: { duration: isPlaying ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' },
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
          </PetVisual>
        </BoundaryBreaker>

        {/* AI 思维气泡 (Attached to PetContainer) */}
        <AnimatePresence>
          {!!companion.careBubble && !isAIActive && (
            <ThoughtBubble
              key={companion.careBubble || 'thought-bubble'}
              initial={{ opacity: 0, scale: 0.8, y: 10, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              style={{ right: 0, left: 'auto', bottom: '100%', transformOrigin: 'bottom right', marginBottom: 8 }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleCompanionClick();
              }}
            >
              {getWeatherIcon() || <span style={{ fontSize: '1rem' }}>✨</span>}
              {companion.careBubble}
            </ThoughtBubble>
          )}
        </AnimatePresence>
      </PetContainer>

      <AnimatePresence>
        {showFullPlayer && <ExpandedPlayer key="expanded-player" onClose={() => setShowFullPlayer(false)} />}
      </AnimatePresence>
    </>
  );
};

export default MobileSmartDock;
