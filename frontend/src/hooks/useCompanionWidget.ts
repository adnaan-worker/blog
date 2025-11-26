import { useState, useEffect, useRef, useCallback } from 'react';

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

  // ============================================================================
  // Refs
  // ============================================================================
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);
  const widgetRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // 工具函数
  // ============================================================================

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
  // 鼠标/触摸移动 - 眼睛跟随
  // ============================================================================
  useEffect(() => {
    let rafId: number | null = null;

    const handleMove = (clientX: number, clientY: number) => {
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

    // 移动端不需要眼睛跟随，或者只在触摸时跟随？通常不需要
    // window.addEventListener('touchmove', ...);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
  }, [clickCount, createParticles]);

  // ============================================================================
  // 清理
  // ============================================================================
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
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

    // 事件处理
    handleClick,
    createParticles,

    // Refs
    widgetRef,
  };
};
