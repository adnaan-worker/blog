import { useState, useEffect, useRef, useCallback } from 'react';
import { buildSmartContext, getSmartMessage, SmartContext } from '@/utils/helpers/companion';

// ============================================================================
// 🎮 通用陪伴物 Hook
// ============================================================================

export interface CompanionConfig {
  width?: number;
  height?: number;
  blinkInterval?: number; // 眨眼间隔（毫秒）
}

export interface ParticleType {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const useCompanionWidget = (config: CompanionConfig) => {
  const { blinkInterval = 3000 } = config;

  // ============================================================================
  // 交互状态
  // ============================================================================
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<ParticleType[]>([]);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // 💬 气泡消息状态
  const [message, setMessage] = useState<string | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  // ============================================================================
  // Refs
  // ============================================================================
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);
  const widgetRef = useRef<HTMLDivElement>(null);
  const userActivityRef = useRef<SmartContext['userActivity']>({
    isActive: true,
    idleTime: 0,
    scrollCount: 0,
    readingTime: 0,
    lastInteraction: Date.now(),
    currentPage: 'home',
    hasTyped: false,
    isHovered: false, // 初始化
  });

  // ============================================================================
  // 工具函数
  // ============================================================================

  // 显示消息
  const showMessage = useCallback((text: string, duration = 5000) => {
    setMessage(text);
    setIsMessageVisible(true);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setIsMessageVisible(false);
      // 动画结束后清空消息，避免再次显示时有闪烁
      setTimeout(() => setMessage(null), 500);
    }, duration);
  }, []);

  // 触发智能消息
  const triggerSmartMessage = useCallback(async () => {
    // 更新活跃状态
    const now = Date.now();
    userActivityRef.current.idleTime = now - userActivityRef.current.lastInteraction;

    // 构建上下文
    const context = await buildSmartContext(userActivityRef.current);
    const msg = getSmartMessage(context);

    showMessage(msg);
  }, [showMessage]);

  // 监听 hover 状态变化并更新 ref，触发互动
  useEffect(() => {
    userActivityRef.current.isHovered = isHovered;

    // 悬浮超过 2 秒，尝试触发“盯着看”的文案
    let hoverTimer: NodeJS.Timeout;
    if (isHovered) {
      hoverTimer = setTimeout(() => {
        // 50% 概率触发
        if (Math.random() > 0.5) {
          triggerSmartMessage();
        }
      }, 2000);
    }

    return () => clearTimeout(hoverTimer);
  }, [isHovered, triggerSmartMessage]);

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
      if (withVibration && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch (e) {
          // 忽略错误
        }
      }
    },
    [],
  );

  // ============================================================================
  // 鼠标/触摸移动 - 眼睛跟随 & 活跃度追踪
  // ============================================================================
  useEffect(() => {
    let rafId: number | null = null;

    const handleMove = (clientX: number, clientY: number) => {
      userActivityRef.current.lastInteraction = Date.now();
      userActivityRef.current.isActive = true;

      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        // 眼睛跟随
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const dx = clientX - centerX;
          const dy = clientY - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const maxOffset = 1.5;
          // 只有当鼠标在附近时才跟随，避免全屏乱看
          if (distance < 500) {
            const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (dx / distance) * maxOffset));
            const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (dy / distance) * maxOffset));
            setEyeOffset({ x: offsetX, y: offsetY });
          } else {
            setEyeOffset({ x: 0, y: 0 });
          }
        }
        rafId = null;
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleKeydown = () => {
      userActivityRef.current.hasTyped = true;
      userActivityRef.current.lastInteraction = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  // ============================================================================
  // 定时任务：眨眼 & 智能气泡
  // ============================================================================
  useEffect(() => {
    // 眨眼
    const blinkIntervalId = setInterval(
      () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      },
      blinkInterval + Math.random() * 2000,
    );

    // 智能气泡 (每隔 3-8 分钟尝试弹一次)
    const messageCheckInterval = setInterval(
      () => {
        if (!isMessageVisible && Math.random() > 0.6) {
          // 40% 概率弹出
          triggerSmartMessage();
        }
      },
      3 * 60 * 1000,
    ); // 3分钟检查一次

    // 初始延迟 2 秒弹个欢迎
    const initTimer = setTimeout(() => {
      triggerSmartMessage();
    }, 2000);

    return () => {
      clearInterval(blinkIntervalId);
      clearInterval(messageCheckInterval);
      clearTimeout(initTimer);
    };
  }, [blinkInterval, isMessageVisible, triggerSmartMessage]);

  // ============================================================================
  // 点击处理
  // ============================================================================
  const handleClick = useCallback(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    createParticles();

    // 每次点击有一定概率触发消息
    if (Math.random() > 0.7) {
      triggerSmartMessage();
    }

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
  }, [clickCount, createParticles, triggerSmartMessage]);

  // ============================================================================
  // 清理
  // ============================================================================
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  return {
    // 交互状态
    isHovered,
    setIsHovered,
    isDragging,
    setIsDragging,
    clickCount,
    particles,
    eyeOffset,
    isBlinking,

    // 消息状态
    message,
    isMessageVisible,

    // 事件处理
    handleClick,
    createParticles,
    triggerSmartMessage,

    // Refs
    widgetRef,
  };
};
