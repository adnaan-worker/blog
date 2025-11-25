import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { storage } from '@/utils';
import { buildSmartContext, getSmartMessage, SmartContext } from '@/utils/helpers/companion';

// ============================================================================
// 🎮 通用陪伴物 Hook - 封装所有公共逻辑
// ============================================================================

export interface CompanionConfig {
  storageKey: string; // localStorage 键名
  width: number; // 组件宽度
  height: number; // 组件高度
  defaultPosition?: { x: number; y: number }; // 默认位置
  enablePhysics?: boolean; // 是否启用物理引擎
  enableSmartBubble?: boolean; // 是否启用智能气泡
  bubbleIdleTime?: number; // 空闲多久显示气泡（毫秒）
  bubbleInterval?: number; // 气泡显示间隔（毫秒）
  blinkInterval?: number; // 眨眼间隔（毫秒）
}

export interface ParticleType {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const useCompanionWidget = (config: CompanionConfig) => {
  const location = useLocation();
  const {
    storageKey,
    width,
    height,
    defaultPosition = { x: 100, y: window.innerHeight / 2 },
    enablePhysics = true,
    enableSmartBubble = true,
    bubbleIdleTime = 10000,
    bubbleInterval = 20000,
    blinkInterval = 3000,
  } = config;

  const MARGIN = 10;

  // ============================================================================
  // 位置和物理状态
  // ============================================================================
  const [position, setPosition] = useState(() => {
    const saved = storage.local.get<{ x: number; y: number }>(storageKey);
    if (!saved) return defaultPosition;

    return {
      x: Math.max(MARGIN, Math.min(window.innerWidth - width - MARGIN, saved.x)),
      y: Math.max(MARGIN, Math.min(window.innerHeight - height - MARGIN, saved.y)),
    };
  });

  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isFlying, setIsFlying] = useState(false);
  const velocityRef = useRef(velocity);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  // ============================================================================
  // 弹射游戏状态
  // ============================================================================
  const [isPulling, setIsPulling] = useState(false);
  const [pullStart, setPullStart] = useState({ x: 0, y: 0 });
  const [pullCurrent, setPullCurrent] = useState({ x: 0, y: 0 });
  const isPullingRef = useRef(isPulling);
  const pullStartRef = useRef(pullStart);
  const pullCurrentRef = useRef(pullCurrent);
  const positionRef = useRef(position);

  useEffect(() => {
    isPullingRef.current = isPulling;
    pullStartRef.current = pullStart;
    pullCurrentRef.current = pullCurrent;
    positionRef.current = position;
  }, [isPulling, pullStart, pullCurrent, position]);

  // ============================================================================
  // 交互状态
  // ============================================================================
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<ParticleType[]>([]);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // ============================================================================
  // 智能系统状态
  // ============================================================================
  const [smartContext, setSmartContext] = useState<SmartContext | null>(null);
  const [careBubble, setCareBubble] = useState<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const pageLoadTimeRef = useRef<number>(Date.now());
  const scrollCountRef = useRef<number>(0);
  const hasTypedRef = useRef<boolean>(false);

  // ============================================================================
  // Refs
  // ============================================================================
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // 工具函数
  // ============================================================================

  // 获取当前页面类型
  const getCurrentPageType = useCallback((): SmartContext['userActivity']['currentPage'] => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path.includes('/blog/') || path.includes('/article/')) return 'article';
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/project')) return 'project';
    if (path.includes('/profile')) return 'profile';
    return 'other';
  }, [location.pathname]);

  // 构建用户活动上下文
  const buildUserActivity = useCallback((): SmartContext['userActivity'] => {
    const now = Date.now();
    return {
      isActive: now - lastActivityRef.current < 10000,
      idleTime: now - lastActivityRef.current,
      scrollCount: scrollCountRef.current,
      readingTime: now - pageLoadTimeRef.current,
      lastInteraction: lastActivityRef.current,
      currentPage: getCurrentPageType(),
      hasTyped: hasTypedRef.current,
    };
  }, [getCurrentPageType]);

  // 更新活动时间
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // 创建粒子效果
  const createParticles = useCallback(
    (emojis: string[] = ['⭐', '✨', '💫', '🌟'], count: number = 5, withVibration: boolean = false) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const particle: ParticleType = {
          id: particleIdRef.current++,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x: Math.cos(angle) * 25,
          y: Math.sin(angle) * 25,
        };
        setParticles((prev) => [...prev, particle]);

        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== particle.id));
        }, 800);
      }

      // 触觉反馈
      if (withVibration && hasInteracted && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch (e) {
          // 忽略错误
        }
      }
    },
    [hasInteracted],
  );

  // ============================================================================
  // 位置管理
  // ============================================================================

  // 保存位置到 localStorage
  useEffect(() => {
    storage.local.set(storageKey, position);
  }, [position, storageKey]);

  // 窗口大小变化时调整位置
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.max(MARGIN, Math.min(window.innerWidth - width - MARGIN, prev.x)),
        y: Math.max(MARGIN, Math.min(window.innerHeight - height - MARGIN, prev.y)),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height, MARGIN]);

  // ============================================================================
  // 物理引擎
  // ============================================================================

  useEffect(() => {
    if (!enablePhysics || !isFlying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      setPosition((prev) => {
        let newX = prev.x + velocityRef.current.x;
        let newY = prev.y + velocityRef.current.y;
        let newVelocityX = velocityRef.current.x;
        let newVelocityY = velocityRef.current.y;

        // 重力 - 减小重力，让它更像悬浮物
        newVelocityY += 0.15;

        // 边界碰撞
        let collided = false;
        let stuckToWall = false;

        // 碰撞反弹系数 - 降低反弹力度，避免剧烈弹跳
        const bounceFactor = 0.4;

        if (newX <= MARGIN) {
          newX = MARGIN;
          newVelocityX = -newVelocityX * bounceFactor;
          collided = true;
          if (Math.abs(newVelocityX) < 2) {
            newVelocityX = 0;
            stuckToWall = true;
          }
        }
        if (newX >= window.innerWidth - width - MARGIN) {
          newX = window.innerWidth - width - MARGIN;
          newVelocityX = -newVelocityX * bounceFactor;
          collided = true;
          if (Math.abs(newVelocityX) < 2) {
            newVelocityX = 0;
            stuckToWall = true;
          }
        }
        if (newY <= MARGIN) {
          newY = MARGIN;
          newVelocityY = -newVelocityY * bounceFactor;
          collided = true;
          if (Math.abs(newVelocityY) < 2) {
            newVelocityY = 0;
            stuckToWall = true;
          }
        }
        if (newY >= window.innerHeight - height - MARGIN) {
          newY = window.innerHeight - height - MARGIN;
          newVelocityY = -newVelocityY * bounceFactor;
          collided = true;
          if (Math.abs(newVelocityY) < 2) {
            newVelocityY = 0;
            stuckToWall = true;
          }
        }

        // 碰撞时创建粒子
        if (collided && Math.abs(newVelocityX) > 2) {
          createParticles(['⭐', '✨', '💫', '🌟'], 3, true);
        }

        // 粘在墙上
        if (stuckToWall) {
          setIsFlying(false);
          setVelocity({ x: 0, y: 0 });
          return { x: newX, y: newY };
        }

        // 摩擦力 - 增加阻力，让停止更丝滑
        newVelocityX *= 0.92;
        newVelocityY *= 0.92;

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
        animationFrameRef.current = null;
      }
    };
  }, [enablePhysics, isFlying, width, height, MARGIN, createParticles]);

  // ============================================================================
  // 弹射游戏逻辑
  // ============================================================================

  // 计算发射速度
  const calculateLaunchVelocity = useCallback(
    (start: { x: number; y: number }, current: { x: number; y: number }, pos: { x: number; y: number }) => {
      const dx = start.x - current.x;
      const dy = start.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxPull = 150;
      const power = Math.min(distance, maxPull) / 4;

      // 边界增强
      const edgeThreshold = 100;
      const edgeBoost = 1.5;
      let powerMultiplierX = 1;
      let powerMultiplierY = 1;

      if (pos.x < edgeThreshold && dx > 0) powerMultiplierX = edgeBoost;
      if (pos.x > window.innerWidth - width - edgeThreshold && dx < 0) powerMultiplierX = edgeBoost;
      if (pos.y < edgeThreshold && dy > 0) powerMultiplierY = edgeBoost;
      if (pos.y > window.innerHeight - height - edgeThreshold && dy < 0) powerMultiplierY = edgeBoost;

      const velocityX = (dx / distance) * power * powerMultiplierX || 0;
      const velocityY = (dy / distance) * power * powerMultiplierY || 0;

      return { velocityX, velocityY, distance };
    },
    [width, height],
  );

  // 处理发射
  const handleLaunch = useCallback(() => {
    if (!enablePhysics) return;

    const { velocityX, velocityY, distance } = calculateLaunchVelocity(
      pullStartRef.current,
      pullCurrentRef.current,
      positionRef.current,
    );

    setVelocity({ x: velocityX, y: velocityY });
    setIsFlying(true);
    createParticles();

    // 触觉反馈
    if (hasInteracted && 'vibrate' in navigator && distance > 10) {
      try {
        const vibrateDuration = Math.min(Math.floor(distance / 3), 50);
        navigator.vibrate(vibrateDuration);
      } catch (e) {
        // 忽略错误
      }
    }
  }, [enablePhysics, calculateLaunchVelocity, createParticles, hasInteracted]);

  // 处理拉动开始
  const handlePullStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!enablePhysics || isFlying) return;

      if (!hasInteracted) setHasInteracted(true);
      updateActivity();

      setIsPulling(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setPullStart({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setPullCurrent({ x: clientX, y: clientY });
      }

      if (hasInteracted && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch (e) {
          // 忽略错误
        }
      }
    },
    [enablePhysics, isFlying, hasInteracted, updateActivity],
  );

  // 全局鼠标/触摸松开
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (isPullingRef.current) {
        setIsPulling(false);
        updateActivity();
        handleLaunch();
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
  }, [updateActivity, handleLaunch]);

  // 鼠标/触摸移动 - 眼睛跟随和拉线
  useEffect(() => {
    let rafId: number | null = null;

    const handleMove = (clientX: number, clientY: number) => {
      if (rafId) return; // 如果已经在等待下一帧，则跳过

      rafId = requestAnimationFrame(() => {
        // 更新拉线位置
        if (isPulling) {
          setPullCurrent({ x: clientX, y: clientY });
        }

        // 眼睛跟随
        if (!isFlying) {
          const rect = widgetRef.current?.getBoundingClientRect();
          if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = clientX - centerX;
            const dy = clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const maxOffset = 1.5;
            const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (dx / distance) * maxOffset));
            const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (dy / distance) * maxOffset));

            setEyeOffset({ x: offsetX, y: offsetY });
          }
        }

        rafId = null; // 重置
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (isPulling || isDragging) {
        e.preventDefault();
      }
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isPulling, isFlying, isDragging]);

  // ============================================================================
  // 智能系统
  // ============================================================================

  // 智能系统初始化和更新
  useEffect(() => {
    if (!enableSmartBubble) return;

    const updateSmartContext = async () => {
      const userActivity = buildUserActivity();
      const context = await buildSmartContext(userActivity);
      setSmartContext(context);
    };

    updateSmartContext();
    const interval = setInterval(updateSmartContext, 60000);

    return () => clearInterval(interval);
  }, [enableSmartBubble, location.pathname, buildUserActivity]);

  // 页面加载时重置
  useEffect(() => {
    pageLoadTimeRef.current = Date.now();
    scrollCountRef.current = 0;
    hasTypedRef.current = false;
  }, [location.pathname]);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      scrollCountRef.current++;
      updateActivity();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateActivity]);

  // 监听键盘
  useEffect(() => {
    const handleKeyDown = () => {
      hasTypedRef.current = true;
      updateActivity();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateActivity]);

  // 智能气泡循环
  useEffect(() => {
    if (!enableSmartBubble) return;

    const checkAndShowBubble = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      setCareBubble((currentBubble) => {
        if (currentBubble) return currentBubble;

        if (timeSinceLastActivity > bubbleIdleTime && smartContext) {
          const smartMessage = getSmartMessage(smartContext);

          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }

          hideTimeoutRef.current = setTimeout(() => {
            setCareBubble(null);
            hideTimeoutRef.current = null;
          }, 6000);

          return smartMessage;
        }

        return null;
      });
    };

    const firstCheck = setTimeout(checkAndShowBubble, 5000);
    const interval = setInterval(checkAndShowBubble, bubbleInterval + Math.random() * 20000);

    return () => {
      clearTimeout(firstCheck);
      clearInterval(interval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [enableSmartBubble, smartContext, bubbleIdleTime, bubbleInterval]);

  // ============================================================================
  // 眨眼动画
  // ============================================================================

  useEffect(() => {
    const blinkIntervalId = setInterval(
      () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      },
      blinkInterval + Math.random() * 2000,
    );

    return () => clearInterval(blinkIntervalId);
  }, [blinkInterval]);

  // ============================================================================
  // 点击处理
  // ============================================================================

  const handleClick = useCallback(() => {
    updateActivity();
    const newCount = clickCount + 1;
    setClickCount(newCount);

    createParticles();

    // 5连击额外效果
    if (newCount === 5) {
      setTimeout(() => createParticles(), 200);
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);
  }, [clickCount, updateActivity, createParticles]);

  // ============================================================================
  // 清理
  // ============================================================================

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // ============================================================================
  // 返回值
  // ============================================================================

  return {
    // 位置和物理
    position,
    setPosition,
    velocity,
    isFlying,

    // 弹射游戏
    isPulling,
    pullStart,
    pullCurrent,
    handlePullStart,

    // 交互状态
    isHovered,
    setIsHovered,
    isDragging,
    setIsDragging,
    clickCount,
    particles,
    eyeOffset,
    isBlinking,

    // 智能系统
    careBubble,
    smartContext,

    // 事件处理
    handleClick,
    updateActivity,
    createParticles,

    // Refs
    widgetRef,

    // 计算属性
    pullDistance: isPulling
      ? Math.sqrt(Math.pow(pullStart.x - pullCurrent.x, 2) + Math.pow(pullStart.y - pullCurrent.y, 2))
      : 0,
    pullAngle: isPulling ? Math.atan2(pullCurrent.y - pullStart.y, pullCurrent.x - pullStart.x) : 0,
    isNearEdge: useMemo(() => {
      if (!isPulling) return false;
      const dx = pullStart.x - pullCurrent.x;
      const dy = pullStart.y - pullCurrent.y;
      const edgeThreshold = 100;
      return (
        (position.x < edgeThreshold && dx > 0) ||
        (position.x > window.innerWidth - width - edgeThreshold && dx < 0) ||
        (position.y < edgeThreshold && dy > 0) ||
        (position.y > window.innerHeight - height - edgeThreshold && dy < 0)
      );
    }, [isPulling, position, pullStart, pullCurrent, width, height]),
  };
};
