import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiArrowUp, FiPause, FiPlay, FiMusic } from 'react-icons/fi';
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

// AI 面板 - 极光风格
const AIPanel = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70vh;
  background: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(30px) saturate(180%);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -20px 80px rgba(0, 0, 0, 0.2);
  z-index: 900;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  overflow: hidden;

  /* 顶部光晕装饰 */
  &::before {
    content: '';
    position: absolute;
    top: -150px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.3) 0%, transparent 70%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }
`;

// 面板头部 - 承载 Pet
const PanelHeader = styled.div`
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
`;

// Pet 在面板中的容器
const PanelPetWrapper = styled(motion.div)`
  width: 80px;
  height: 90px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  filter: drop-shadow(0 10px 20px rgba(var(--accent-rgb), 0.3));
`;

const AIChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
  padding-top: 10px;

  &::-webkit-scrollbar {
    width: 0;
  }
`;

const MessageBubble = styled(motion.div)<{ isUser?: boolean }>`
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  background: ${(props) =>
    props.isUser
      ? 'linear-gradient(135deg, var(--accent-color), var(--accent-color-hover))'
      : 'rgba(var(--bg-primary-rgb), 0.6)'};
  color: ${(props) => (props.isUser ? '#fff' : 'var(--text-primary)')};
  padding: 14px 18px;
  border-radius: 24px;
  border-bottom-right-radius: ${(props) => (props.isUser ? '4px' : '24px')};
  border-bottom-left-radius: ${(props) => (props.isUser ? '24px' : '4px')};
  max-width: 85%;
  font-size: 1rem;
  line-height: 1.6;
  box-shadow: ${(props) => (props.isUser ? '0 8px 20px rgba(var(--accent-rgb), 0.25)' : '0 2px 10px rgba(0,0,0,0.03)')};
  border: 1px solid ${(props) => (props.isUser ? 'transparent' : 'rgba(var(--border-rgb), 0.1)')};
  backdrop-filter: blur(10px);
`;

const AIInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(var(--bg-primary-rgb), 0.7);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 8px 8px 8px 24px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(var(--accent-rgb), 0.15);
    border-color: rgba(var(--accent-rgb), 0.3);
    background: rgba(var(--bg-primary-rgb), 0.9);
  }
`;

const AIInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.05rem;
  color: var(--text-primary);
  padding: 10px 0;
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const SendButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-hover));
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.4);
  cursor: pointer;
`;

// Pet 容器 (右下角常驻)
const CornerPetWrapper = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 16px;
  width: 56px;
  height: 72px;
  z-index: 910;
  display: flex;
  align-items: flex-end;
  justify-content: center;
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

  // 阈值反馈：当拖动超过阈值时，整体轻微放大，提示可松手
  const triggerScale = useTransform([x, y], ([currentX, currentY]: number[]) => {
    if (currentY < -50 || (currentX < -30 && !isMusicExpanded)) return 1.1;
    return 1;
  });

  const hasTrack = !!currentTrack.id;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const companion = useCompanionWidget({
    width: 60,
    height: 70,
  });

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 30) {
      setIsMusicExpanded(false);
    }
  };

  const handlePetDragEnd = (event: any, info: any) => {
    const { x: dragX, y: dragY } = info.offset;

    if (dragY < -50) {
      scrollToTop();
      setIsScrolling(true);
      setTimeout(() => {
        setIsDragging(false);
        setIsScrolling(false);
      }, 1000);
      return;
    }

    setIsDragging(false);

    if (dragX < -30 && !isMusicExpanded) {
      setIsMusicExpanded(true);
    }

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

  const shouldShowDock = !isAIActive;

  const showCapsuleContent = isMusicExpanded;

  const mainText = hasTrack ? currentTrack.title : "Adnaan's Blog";

  const subText = hasTrack
    ? showNavbarLyrics && currentLyric
      ? currentLyric.text
      : isPlaying
        ? currentTrack.artist
        : `Paused - ${currentTrack.artist}`
    : '点击播放音乐';

  const petVariants = {
    idle: {
      right: 16,
      bottom: 24,
      left: 'auto',
      x: 0,
      scale: 1,
    },
    active: {
      right: '50%',
      bottom: 'calc(16px + 65vh - 30px)',
      left: 'auto',
      x: '50%',
      scale: 1.3,
    },
  };

  // 核心 Pet 视觉组件 (纯展示)
  const PetVisualContent = ({ isDark, companion }: { isDark: boolean; companion: any }) => (
    <>
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
    </>
  );

  return (
    <>
      <AnimatePresence>
        {isAIActive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 890 }}
              onClick={() => setIsAIActive(false)}
            />

            <AIPanel
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <PanelHeader>
                {/* Pet 在这里！使用 layoutId 实现飞跃 */}
                <PanelPetWrapper layoutId="pet-hero">
                  <PetVisualContent isDark={isDark} companion={companion} />
                </PanelPetWrapper>
              </PanelHeader>

              <AIChatArea>
                {/* ... Chat Logic ... */}
                {ai.reply ? (
                  <>
                    {ai.inputValue && <MessageBubble isUser>{ai.inputValue}</MessageBubble>}
                    <MessageBubble>{ai.reply}</MessageBubble>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)' }}
                  >
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>嗨，我是 Adnaan 的 AI 助手</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>无论是找文章还是聊代码，我都再行。</p>
                  </motion.div>
                )}
              </AIChatArea>

              <AIInputWrapper>
                <AIInput
                  placeholder="输入你的想法..."
                  value={ai.inputValue}
                  onChange={(e) => ai.setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && ai.send(ai.inputValue)}
                />
                <SendButton onClick={() => ai.send(ai.inputValue)} whileTap={{ scale: 0.9 }}>
                  <FiArrowUp size={22} />
                </SendButton>
              </AIInputWrapper>
            </AIPanel>
          </>
        )}
      </AnimatePresence>

      {!isAIActive && (
        <CornerPetWrapper style={{ zIndex: 920 }}>
          <BoundaryBreaker
            layoutId="pet-hero" // 关键：共享 layoutId
            onClick={handleCompanionClick}
            drag={true}
            dragConstraints={{ left: -200, right: 0, top: -300, bottom: 0 }}
            dragElastic={0.6}
            dragSnapToOrigin={true}
            onDragStart={() => setIsDragging(true)}
            onDrag={(event, info) => {
              x.set(info.offset.x);
              y.set(info.offset.y);
            }}
            onDragEnd={handlePetDragEnd}
            whileTap={{ scale: 0.95 }}
          >
            <PetVisual style={{ scaleX, scaleY, scale: triggerScale }}>
              <PetVisualContent isDark={isDark} companion={companion} />
            </PetVisual>
          </BoundaryBreaker>
        </CornerPetWrapper>
      )}

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

      <AnimatePresence>
        {showFullPlayer && <ExpandedPlayer key="expanded-player" onClose={() => setShowFullPlayer(false)} />}
      </AnimatePresence>
    </>
  );
};

export default MobileSmartDock;
