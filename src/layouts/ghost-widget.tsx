import styled from '@emotion/styled';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useState, useEffect, useRef, useMemo } from 'react';
import { RootState } from '@/store';
import { storage } from '@/utils';

// 幽灵容器 - 缩小到原始的 45%，支持交互和拖拽
const GhostContainer = styled(motion.div)<{ isDragging?: boolean }>`
  position: fixed;
  z-index: 9999; /* 确保在最上层 */
  width: 36px;
  height: 45px;
  pointer-events: auto; /* 启用交互 */
  cursor: ${(props) => (props.isDragging ? 'grabbing' : 'grab')};
  /* 确保光圈不被裁剪 */
  overflow: visible;
  user-select: none;
  will-change: left, top; /* 优化性能 */

  @media (max-width: 768px) {
    transform: scale(0.7);
  }
`;

// 幽灵身体 - 使用主题色
const GhostBody = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  border-top-right-radius: 18px;
  border-top-left-radius: 18px;
  overflow: visible;

  /* 使用主题色的渐变 */
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-color) 70%, white) 0%,
    color-mix(in srgb, var(--accent-color) 50%, white) 100%
  );

  /* 主题色发光效果 */
  box-shadow:
    0 0 20px color-mix(in srgb, var(--accent-color) 50%, transparent),
    0 0 40px color-mix(in srgb, var(--accent-color) 30%, transparent);

  transition:
    background 0.5s ease,
    box-shadow 0.5s ease;
`;

// 脸部容器 - 缩小到 45%
const Face = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  top: 15.075px;
  left: 9px;
  width: 16.2px;
  height: 9.225px;
`;

// 眼睛容器
const EyeContainer = styled.div`
  width: 5.4px;
  height: 5.4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &.left {
    margin-right: 5.4px;
  }
`;

// 眼睛 - 可以移动的瞳孔
const Eye = styled(motion.div)`
  width: 4.5px;
  height: 4.5px;
  background-color: color-mix(in srgb, var(--accent-color) 80%, black);
  border-radius: 100%;
  transition: all 0.2s ease;
`;

// 微笑
const Smile = styled.div`
  width: 7.2px;
  height: 3.6px;
  background-color: color-mix(in srgb, var(--accent-color) 80%, black);
  margin-top: 1.35px;
  margin-left: 4.5px;
  border-bottom-left-radius: 3.6px 2.7px;
  border-bottom-right-radius: 3.6px 2.7px;
  border-top-left-radius: 0.9px;
  border-top-right-radius: 0.9px;
`;

// 腮红
const Rosy = styled.div`
  position: absolute;
  top: 6.3px;
  width: 4.95px;
  height: 1.8px;
  background-color: #fb923c;
  border-radius: 100%;
  box-shadow: 0 0 6px rgba(251, 146, 60, 0.6);

  &.left {
    left: -1.35px;
    transform: rotate(-8deg);
  }

  &.right {
    right: -1.35px;
    transform: rotate(8deg);
  }
`;

// 手臂
const ArmLeft = styled(motion.div)`
  position: absolute;
  top: 30.6px;
  left: -0.9px;
  width: 13.5px;
  height: 9px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-color) 70%, white) 0%,
    color-mix(in srgb, var(--accent-color) 50%, white) 100%
  );
  border-radius: 60% 100%;
`;

const ArmRight = styled(motion.div)`
  position: absolute;
  top: 30.6px;
  right: -14.625px;
  width: 13.5px;
  height: 9px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-color) 70%, white) 0%,
    color-mix(in srgb, var(--accent-color) 50%, white) 100%
  );
  border-radius: 100% 60%;
`;

// 底部波浪容器
const Bottom = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0px;
  right: -0.225px;
`;

// 底部波浪单元
const BottomWave = styled.div<{ isOdd: boolean }>`
  flex-grow: 1;
  position: relative;
  top: ${(props) => (props.isOdd ? '-2.25px' : '-3.15px')};
  height: 6.3px;
  border-radius: 100%;
  background: ${(props) =>
    props.isOdd
      ? 'transparent'
      : 'linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 70%, white) 0%, color-mix(in srgb, var(--accent-color) 50%, white) 100%)'};
  border-top: ${(props) => (props.isOdd ? '4.5px solid color-mix(in srgb, var(--accent-color) 60%, white)' : 'none')};
  margin: ${(props) => (props.isOdd ? '0 -0.45px' : '0')};
`;

// 影子
const Shadow = styled(motion.div)`
  position: absolute;
  bottom: -25px;
  left: 50%;
  width: 45px;
  height: 2.7px;
  border-radius: 100%;
  background-color: color-mix(in srgb, var(--accent-color) 40%, black);
`;

// 粒子容器
const ParticlesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

// 拉线指示器
const PullLine = styled.svg`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
`;

// 头顶提示
const TopHint = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: rgba(var(--accent-rgb, 81, 131, 245), 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(var(--accent-rgb, 81, 131, 245), 0.9);
  }
`;

// 关心气泡
const CareBubble = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.95) 0%, rgba(255, 192, 203, 0.95) 100%);
  color: #fff;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.4);
  max-width: 200px;
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(255, 192, 203, 0.95);
  }
`;

// 小星星粒子
const StarParticle = styled(motion.div)`
  position: absolute;
  font-size: 16px;
  top: 50%;
  left: 50%;
  color: #ffd700;
  text-shadow: 0 0 4px rgba(255, 215, 0, 0.6);
`;

// 动画变体 - 按照原始 CSS keyframes
const floatVariants = {
  animate: {
    y: [0, -9, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as any,
    },
  },
};

// 手臂动画 - translate 固定，只有 rotate 在变化
const armLeftVariants = {
  animate: {
    x: '-50%', // 固定不变
    y: '-50%', // 固定不变
    rotate: [25, 20, 25], // 这个在动画
    transition: {
      rotate: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as any,
        times: [0, 0.4, 1],
      },
    },
  },
};

const armRightVariants = {
  animate: {
    x: '-50%', // 固定不变
    y: '-50%', // 固定不变
    rotate: [-25, -20, -25], // 这个在动画
    transition: {
      rotate: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as any,
        times: [0, 0.4, 1],
      },
    },
  },
};

const shadowVariants = {
  animate: {
    scale: [1, 0.5, 1],
    x: ['-50%', '-50%', '-50%'],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as any,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1] as any,
    },
  },
};

// 粒子类型
interface ParticleType {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const GhostWidget = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // 常量定义
  const GHOST_WIDTH = 36;
  const GHOST_HEIGHT = 45;
  const MARGIN = 10;

  // 位置和速度状态
  const [position, setPosition] = useState(() => {
    const saved = storage.local.get<{ x: number; y: number }>('ghost_position');
    // 默认位置在屏幕中央偏左下
    const defaultPos = {
      x: Math.min(100, window.innerWidth / 4),
      y: window.innerHeight / 2,
    };

    if (!saved) return defaultPos;

    return {
      x: Math.max(MARGIN, Math.min(window.innerWidth - GHOST_WIDTH - MARGIN, saved.x)),
      y: Math.max(MARGIN, Math.min(window.innerHeight - GHOST_HEIGHT - MARGIN, saved.y)),
    };
  });

  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isFlying, setIsFlying] = useState(false);

  // 弹射游戏状态
  const [isPulling, setIsPulling] = useState(false);
  const [pullStart, setPullStart] = useState({ x: 0, y: 0 });
  const [pullCurrent, setPullCurrent] = useState({ x: 0, y: 0 });
  const [launchCount, setLaunchCount] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // 关心气泡状态
  const [careBubble, setCareBubble] = useState<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 交互状态
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<ParticleType[]>([]);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);
  const ghostRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 保存位置到localStorage
  useEffect(() => {
    storage.local.set('ghost_position', position);
  }, [position]);

  // 窗口大小变化时，确保幽灵仍在可视区域内
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.max(MARGIN, Math.min(window.innerWidth - GHOST_WIDTH - MARGIN, prev.x)),
        y: Math.max(MARGIN, Math.min(window.innerHeight - GHOST_HEIGHT - MARGIN, prev.y)),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [GHOST_WIDTH, GHOST_HEIGHT, MARGIN]);

  // 关心文案数组
  const careMessages = [
    '工作累了吗？休息一下吧~',
    '夜深了，早点休息哦💤',
    '今天也要保持好心情呀！',
    '记得多喝水哦💧',
    '你真的很棒！',
    '别熬夜啦，熬夜对身体不好~',
    '明天又是元气满满的一天！',
    '要相信自己！加油！',
    '深夜了，注意保暖呀~',
    '偶尔也要放松一下呢~',
  ];

  // 创建星星粒子效果
  const createStarParticles = (withVibration = false) => {
    const stars = ['⭐', '✨', '💫', '🌟'];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const particle: ParticleType = {
        id: particleIdRef.current++,
        emoji: stars[Math.floor(Math.random() * stars.length)],
        x: Math.cos(angle) * 25,
        y: Math.sin(angle) * 25,
      };
      setParticles((prev) => [...prev, particle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particle.id));
      }, 800);
    }

    // 碰撞时的触觉反馈
    if (withVibration && hasInteracted && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (e) {
        // 忽略震动错误
      }
    }
  };

  // 物理引擎 - 飞行和碰撞
  useEffect(() => {
    if (!isFlying) return;

    const animate = () => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        // 重力效果（降低重力，让飞行更轻盈）
        newVelocityY += 0.3;

        // 边界碰撞和反弹
        let collided = false;
        let stuckToWall = false; // 是否粘在墙上

        if (newX <= MARGIN) {
          newX = MARGIN;
          newVelocityX = -newVelocityX * 0.6;
          collided = true;
          // 速度很小时粘在左墙
          if (Math.abs(newVelocityX) < 3) {
            newVelocityX = 0;
            stuckToWall = true;
          }
        }
        if (newX >= window.innerWidth - GHOST_WIDTH - MARGIN) {
          newX = window.innerWidth - GHOST_WIDTH - MARGIN;
          newVelocityX = -newVelocityX * 0.6;
          collided = true;
          // 速度很小时粘在右墙
          if (Math.abs(newVelocityX) < 3) {
            newVelocityX = 0;
            stuckToWall = true;
          }
        }
        if (newY <= MARGIN) {
          newY = MARGIN;
          newVelocityY = -newVelocityY * 0.6;
          collided = true;
          // 速度很小时粘在顶部
          if (Math.abs(newVelocityY) < 3) {
            newVelocityY = 0;
            stuckToWall = true;
          }
        }
        if (newY >= window.innerHeight - GHOST_HEIGHT - MARGIN) {
          newY = window.innerHeight - GHOST_HEIGHT - MARGIN;
          newVelocityY = -newVelocityY * 0.6;
          collided = true;
          // 速度很小时粘在底部
          if (Math.abs(newVelocityY) < 3) {
            newVelocityY = 0;
            stuckToWall = true;
          }
        }

        // 碰撞时创建星星粒子（带触觉反馈）
        if (collided) {
          createStarParticles(true);
        }

        // 如果粘在墙上，停止移动
        if (stuckToWall) {
          setIsFlying(false);
          setVelocity({ x: 0, y: 0 });
          return { x: newX, y: newY };
        }

        // 摩擦力（增加空气阻力）
        newVelocityX *= 0.97;
        newVelocityY *= 0.97;

        // 速度太小时停止
        if (Math.abs(newVelocityX) < 0.2 && Math.abs(newVelocityY) < 0.2) {
          setIsFlying(false);
          setVelocity({ x: 0, y: 0 });
          return { x: newX, y: newY };
        }

        setVelocity({ x: newVelocityX, y: newVelocityY });
        return { x: newX, y: newY };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFlying, velocity.x, velocity.y, MARGIN, GHOST_WIDTH, GHOST_HEIGHT]);

  // 更新活动时间
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    setShowHint(true);
  };

  // 鼠标/触摸移动 - 眼睛跟随和拉线
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      // 更新拉线位置
      if (isPulling) {
        setPullCurrent({ x: clientX, y: clientY });
      }

      // 眼睛跟随
      if (isFlying) return;

      const ghostRect = document.querySelector('[data-ghost-body]')?.getBoundingClientRect();
      if (!ghostRect) return;

      const ghostCenterX = ghostRect.left + ghostRect.width / 2;
      const ghostCenterY = ghostRect.top + ghostRect.height / 2;

      const dx = clientX - ghostCenterX;
      const dy = clientY - ghostCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxOffset = 1.5;
      const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (dx / distance) * maxOffset));
      const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (dy / distance) * maxOffset));

      setEyeOffset({ x: offsetX, y: offsetY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isPulling, isFlying]);

  // 提示自动隐藏
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(hintTimer);
  }, [launchCount]); // 每次发射后重新计时

  // 关心气泡循环显示（独立逻辑，不依赖气泡状态）
  useEffect(() => {
    const checkAndShowBubble = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      setCareBubble((currentBubble) => {
        // 如果已经有气泡了，不重复显示
        if (currentBubble) return currentBubble;

        // 如果超过 10 秒没活动，显示关心
        if (timeSinceLastActivity > 10000) {
          const randomMessage = careMessages[Math.floor(Math.random() * careMessages.length)];

          // 5秒后隐藏气泡
          setTimeout(() => {
            setCareBubble(null);
          }, 5000);

          return randomMessage;
        }

        return null;
      });
    };

    // 首次 5 秒后检查，之后每 20-40 秒检查一次
    const firstCheck = setTimeout(checkAndShowBubble, 5000);

    const interval = setInterval(
      () => {
        checkAndShowBubble();
      },
      20000 + Math.random() * 20000,
    ); // 20-40秒随机间隔

    return () => {
      clearTimeout(firstCheck);
      clearInterval(interval);
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, []); // 只在组件挂载时启动一次

  // 用户是否已交互（用于震动权限）
  const [hasInteracted, setHasInteracted] = useState(false);

  // 处理开始拉动（统一处理鼠标和触摸）
  const handlePullStart = (clientX: number, clientY: number) => {
    if (isFlying) return;

    // 标记用户已交互
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    updateActivity(); // 更新活动时间
    setIsPulling(true);
    const ghostRect = ghostRef.current?.getBoundingClientRect();
    if (ghostRect) {
      setPullStart({
        x: ghostRect.left + ghostRect.width / 2,
        y: ghostRect.top + ghostRect.height / 2,
      });
      setPullCurrent({ x: clientX, y: clientY });
    }

    // 移动端触觉反馈（仅在用户已交互后）
    if (hasInteracted && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {
        // 忽略震动错误
      }
    }
  };

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePullStart(e.clientX, e.clientY);
  };

  // 触摸事件需要使用原生监听器来支持 preventDefault
  useEffect(() => {
    const element = ghostRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // 现在可以正常工作了
      const touch = e.touches[0];
      handlePullStart(touch.clientX, touch.clientY);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isFlying]);

  // 处理鼠标松开 - 发射
  const handleMouseUp = () => {
    if (!isPulling) return;

    setIsPulling(false);
    updateActivity(); // 更新活动时间

    // 计算发射速度
    const dx = pullStart.x - pullCurrent.x;
    const dy = pullStart.y - pullCurrent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 限制最大拉力（增加到300，支持更远距离瞄准）
    const maxPull = 300;
    const power = Math.min(distance, maxPull) / 8; // 除以8而不是10，增加力度

    const velocityX = (dx / distance) * power || 0;
    const velocityY = (dy / distance) * power || 0;

    setVelocity({ x: velocityX, y: velocityY });
    setIsFlying(true);
    setLaunchCount((prev) => prev + 1);

    // 发射时创建星星粒子
    createStarParticles();

    // 移动端触觉反馈（根据力度调整震动强度）
    if (hasInteracted && 'vibrate' in navigator && distance > 10) {
      try {
        const vibrateDuration = Math.min(Math.floor(distance / 3), 50);
        navigator.vibrate(vibrateDuration);
      } catch (e) {
        // 忽略震动错误
      }
    }
  };

  // 处理点击
  const handleClick = () => {
    updateActivity(); // 更新活动时间
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // 生成星星粒子
    createStarParticles();

    // 5连击时再多一次星星效果
    if (newCount === 5) {
      setTimeout(() => createStarParticles(), 200);
    }

    // 重置点击计数
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };

  // 全局鼠标/触摸松开事件
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (isPulling) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    window.addEventListener('touchcancel', handleGlobalEnd);

    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
      window.removeEventListener('touchcancel', handleGlobalEnd);
    };
  }, [isPulling, pullStart, pullCurrent]);

  // 计算拉线距离和角度
  const pullDistance = isPulling
    ? Math.sqrt(Math.pow(pullStart.x - pullCurrent.x, 2) + Math.pow(pullStart.y - pullCurrent.y, 2))
    : 0;
  const pullAngle = isPulling ? Math.atan2(pullCurrent.y - pullStart.y, pullCurrent.x - pullStart.x) : 0;

  // 只在深色模式下显示
  if (!isDark) return null;

  // 点击跳跃动画
  const jumpVariants = {
    jump: {
      y: [-40, 0],
      rotate: clickCount >= 5 ? [0, 360] : [0, 15, -15, 0], // 连击5次旋转360度
      transition: {
        duration: 0.6,
        ease: 'easeOut' as any,
      },
    },
  };

  // 悬停时害羞效果
  const hoverBodyVariants = {
    hover: {
      scale: 1.1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  return (
    <>
      {/* 拉线指示器 */}
      {isPulling && (
        <PullLine>
          {/* 主拉线 */}
          <line
            x1={pullStart.x}
            y1={pullStart.y}
            x2={pullCurrent.x}
            y2={pullCurrent.y}
            stroke="rgba(var(--accent-rgb, 81, 131, 245), 0.6)"
            strokeWidth="3"
            strokeDasharray="5,5"
          />

          {/* 力度指示圆圈 */}
          <circle
            cx={pullStart.x}
            cy={pullStart.y}
            r={Math.min(pullDistance, 300) / 2.5}
            fill="none"
            stroke="rgba(var(--accent-rgb, 81, 131, 245), 0.3)"
            strokeWidth="2"
          />

          {/* 方向箭头 */}
          <polygon
            points={`
              ${pullStart.x + Math.cos(pullAngle + Math.PI) * 20},${pullStart.y + Math.sin(pullAngle + Math.PI) * 20}
              ${pullStart.x + Math.cos(pullAngle + Math.PI) * 40 + Math.cos(pullAngle + Math.PI - 0.5) * 10},${pullStart.y + Math.sin(pullAngle + Math.PI) * 40 + Math.sin(pullAngle + Math.PI - 0.5) * 10}
              ${pullStart.x + Math.cos(pullAngle + Math.PI) * 40 + Math.cos(pullAngle + Math.PI + 0.5) * 10},${pullStart.y + Math.sin(pullAngle + Math.PI) * 40 + Math.sin(pullAngle + Math.PI + 0.5) * 10}
            `}
            fill="rgba(var(--accent-rgb, 81, 131, 245), 0.8)"
          />

          {/* 力度文字提示 */}
          <text
            x={pullCurrent.x}
            y={pullCurrent.y - 15}
            fill="rgba(var(--accent-rgb, 81, 131, 245), 0.9)"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
          >
            {Math.round((Math.min(pullDistance, 300) / 300) * 100)}%
          </text>
        </PullLine>
      )}

      <GhostContainer
        ref={ghostRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => {
          setIsHovered(true);
          updateActivity();
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        isDragging={isPulling}
        style={{
          left: position.x,
          top: position.y,
          cursor: isFlying ? 'default' : isPulling ? 'grabbing' : 'grab',
          touchAction: 'none', // 防止移动端默认触摸行为
        }}
      >
        {/* 头顶提示 */}
        {showHint && !careBubble && launchCount > 0 && !isFlying && (
          <TopHint initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            发射了 {launchCount} 次
          </TopHint>
        )}

        {/* 关心气泡 */}
        {careBubble && !isPulling && !isFlying && (
          <CareBubble
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
          >
            {careBubble}
          </CareBubble>
        )}

        <GhostBody
          variants={clickCount > 0 ? jumpVariants : floatVariants}
          animate={clickCount > 0 ? 'jump' : 'animate'}
          whileHover="hover"
          onAnimationComplete={() => setClickCount(0)}
          data-ghost-body
        >
          {/* 脸部 */}
          <Face>
            <EyeContainer className="left">
              <Eye
                animate={{
                  x: eyeOffset.x,
                  y: eyeOffset.y,
                  scale: isHovered ? 1.3 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </EyeContainer>
            <EyeContainer className="right">
              <Eye
                animate={{
                  x: eyeOffset.x,
                  y: eyeOffset.y,
                  scale: isHovered ? 1.3 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </EyeContainer>
            <Smile />
            {/* 腮红 - 悬停时加深 */}
            <Rosy
              className="left"
              style={{
                opacity: isHovered ? 1 : 0.6,
                transform: isHovered ? 'rotate(-8deg) scale(1.2)' : 'rotate(-8deg)',
                transition: 'all 0.3s ease',
              }}
            />
            <Rosy
              className="right"
              style={{
                opacity: isHovered ? 1 : 0.6,
                transform: isHovered ? 'rotate(8deg) scale(1.2)' : 'rotate(8deg)',
                transition: 'all 0.3s ease',
              }}
            />
          </Face>

          {/* 手臂 */}
          <ArmLeft variants={armLeftVariants} animate="animate" />
          <ArmRight variants={armRightVariants} animate="animate" />

          {/* 底部波浪 */}
          <Bottom>
            {[0, 1, 2, 3, 4].map((i) => (
              <BottomWave key={i} isOdd={i % 2 === 1} />
            ))}
          </Bottom>

          {/* 星星粒子效果 */}
          <ParticlesContainer>
            {particles.map((particle) => (
              <StarParticle
                key={particle.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 0,
                  scale: 1.2,
                  rotate: 360,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {particle.emoji}
              </StarParticle>
            ))}
          </ParticlesContainer>
        </GhostBody>

        {/* 影子 */}
        <Shadow variants={shadowVariants} animate="animate" />
      </GhostContainer>
    </>
  );
};

export default GhostWidget;
