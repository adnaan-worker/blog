/**
 * Adnaan Animation Engine v3.1
 * 统一动画管理，性能优先
 */

import { Variants, Transition, useInView, useAnimation } from 'framer-motion';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

// ==================== 类型定义 ====================

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  cores: number;
  hasWebGL: boolean;
  devicePixelRatio: number;
  prefersReducedMotion: boolean;
  connectionType: string;
  level: 'ultra' | 'high' | 'medium' | 'low' | 'minimal';
}

export interface AnimationConfig {
  duration: number;
  ease: readonly number[] | string | { type: string; [key: string]: any };
  delay?: number;
  stagger?: number;
}

// ==================== Hydration 检测器 ====================

let isHydrationComplete = false;
let hydrationCallbacks: (() => void)[] = [];

export const markHydrationComplete = () => {
  isHydrationComplete = true;
  hydrationCallbacks.forEach((cb) => cb());
  hydrationCallbacks = [];
};

export const getIsHydrationComplete = () => isHydrationComplete;

export const onHydrationComplete = (callback: () => void) => {
  if (isHydrationComplete) {
    callback();
  } else {
    hydrationCallbacks.push(callback);
  }
  return () => {
    hydrationCallbacks = hydrationCallbacks.filter((cb) => cb !== callback);
  };
};

export const HydrationDetector = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      markHydrationComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  return null;
};

// ==================== 性能监控器 (优化版) ====================

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics | null = null;
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private rafId: number | null = null;
  private updateCallbacks = new Set<(metrics: PerformanceMetrics) => void>();

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private startMonitoring() {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;

      if (delta > 0) {
        const fps = 1000 / delta;
        this.fpsHistory.push(fps);

        // 只保留最近100帧
        if (this.fpsHistory.length > 100) {
          this.fpsHistory.shift();
        }
      }

      this.lastFrameTime = now;
      this.frameCount++;

      // 每60帧更新一次性能等级
      if (this.frameCount % 60 === 0) {
        this.updatePerformanceLevel();
      }

      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  private updatePerformanceLevel() {
    if (!this.metrics) return;

    const avgFPS = this.getAverageFPS();
    const oldLevel = this.metrics.level;

    // 动态调整性能等级
    if (avgFPS >= 55) {
      this.metrics.level = 'ultra';
    } else if (avgFPS >= 45) {
      this.metrics.level = 'high';
    } else if (avgFPS >= 30) {
      this.metrics.level = 'medium';
    } else if (avgFPS >= 20) {
      this.metrics.level = 'low';
    } else {
      this.metrics.level = 'minimal';
    }

    // 如果性能等级改变，通知所有订阅者
    if (oldLevel !== this.metrics.level) {
      console.log(`[Animation Engine] Performance level changed: ${oldLevel} → ${this.metrics.level}`);
      this.notifySubscribers();
    }
  }

  // 订阅性能变化
  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  private notifySubscribers() {
    if (this.metrics) {
      this.updateCallbacks.forEach((callback) => callback(this.metrics!));
    }
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  getMetrics(): PerformanceMetrics {
    if (this.metrics) return this.metrics;

    // 初始化性能指标
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL检测（优化版，防内存泄漏）
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
      hasWebGL = !!gl;

      // 立即释放WebGL上下文
      if (gl) {
        const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
      // 清理Canvas引用
      canvas.width = canvas.height = 0;
    } catch (e) {
      hasWebGL = false;
    }

    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // 检测网络连接类型
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType || '4g';

    // 计算初始性能等级
    let level: PerformanceMetrics['level'] = 'medium';
    if (prefersReducedMotion) {
      level = 'minimal';
    } else if (hasWebGL && cores >= 8 && memory >= 8 && devicePixelRatio <= 2) {
      level = 'ultra';
    } else if (hasWebGL && cores >= 4 && memory >= 4) {
      level = 'high';
    } else if (cores >= 2 && memory >= 2) {
      level = 'medium';
    } else {
      level = 'low';
    }

    this.metrics = {
      fps: 60,
      memory,
      cores,
      hasWebGL,
      devicePixelRatio,
      prefersReducedMotion,
      connectionType,
      level,
    };

    return this.metrics;
  }

  // 清理资源
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.fpsHistory = [];
    this.updateCallbacks.clear();
  }
}

// ==================== 动画调度器 (优化版) ====================

class AnimationScheduler {
  private static instance: AnimationScheduler;
  private queue: Array<{ priority: number; callback: () => void; id: string }> = [];
  private isProcessing = false;
  private maxConcurrent = 5;
  private activeAnimations = new Set<string>();

  private constructor() {}

  static getInstance(): AnimationScheduler {
    if (!AnimationScheduler.instance) {
      AnimationScheduler.instance = new AnimationScheduler();
    }
    return AnimationScheduler.instance;
  }

  schedule(callback: () => void, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal', id?: string) {
    const priorityMap = { critical: 4, high: 3, normal: 2, low: 1 };
    const animationId = id || `anim_${Date.now()}_${Math.random()}`;

    // 避免重复调度
    if (this.activeAnimations.has(animationId)) {
      return;
    }

    this.queue.push({ priority: priorityMap[priority], callback, id: animationId });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }

  private async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);

      await Promise.all(
        batch.map(
          (item) =>
            new Promise((resolve) => {
              this.activeAnimations.add(item.id);
              requestAnimationFrame(() => {
                item.callback();
                this.activeAnimations.delete(item.id);
                resolve(undefined);
              });
            }),
        ),
      );
    }

    this.isProcessing = false;
  }

  updateConcurrency(level: PerformanceMetrics['level']) {
    const concurrencyMap = {
      ultra: 10,
      high: 7,
      medium: 5,
      low: 3,
      minimal: 1,
    };
    this.maxConcurrent = concurrencyMap[level];
  }

  // 清理资源
  clear() {
    this.queue = [];
    this.activeAnimations.clear();
    this.isProcessing = false;
  }
}

// ==================== Spring 动画配置库 ====================

export const SPRING_PRESETS = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 20, mass: 1 },
  soft: { type: 'spring' as const, duration: 0.35, stiffness: 120, damping: 20 },
  microRebound: { type: 'spring' as const, stiffness: 300, damping: 20 },
  microDamping: { type: 'spring' as const, damping: 24 },
  smooth: { type: 'spring' as const, stiffness: 180, damping: 25, mass: 0.8 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.6 },
  stiff: { type: 'spring' as const, stiffness: 400, damping: 35, mass: 0.5 },
  bouncy: { type: 'spring' as const, stiffness: 260, damping: 12, mass: 1.2 },
  floaty: { type: 'spring' as const, stiffness: 100, damping: 15, mass: 0.4 },
  precise: { type: 'spring' as const, stiffness: 350, damping: 40, mass: 0.5 },
  slow: { type: 'spring' as const, stiffness: 80, damping: 25, mass: 2 },
  dropdown: { type: 'spring' as const, stiffness: 450, damping: 35, mass: 0.4 },
  adaptive: (performanceLevel: PerformanceMetrics['level']) => {
    const configs = {
      ultra: { stiffness: 300, damping: 30, mass: 0.6 },
      high: { stiffness: 250, damping: 28, mass: 0.7 },
      medium: { stiffness: 200, damping: 25, mass: 0.8 },
      low: { stiffness: 150, damping: 20, mass: 1 },
      minimal: { stiffness: 100, damping: 15, mass: 1.2 },
    };
    return { type: 'spring' as const, ...configs[performanceLevel] };
  },
} as const;

// 保留 cubic-bezier 缓动（作为降级方案）
export const EASING = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.4, 0, 0.2, 1],
} as const;

// ==================== 动画变体库 (基于 Spring) ====================

export class AnimationVariants {
  // Spring 配置 - 根据性能等级选择合适的预设
  private static springConfigs: Record<
    PerformanceMetrics['level'],
    { type: 'spring'; stiffness: number; damping: number; mass: number }
  > = {
    ultra: SPRING_PRESETS.smooth, // 最佳性能 - 流畅动画
    high: SPRING_PRESETS.smooth, // 高性能 - 流畅动画
    medium: SPRING_PRESETS.snappy, // 中等性能 - 快速动画
    low: SPRING_PRESETS.stiff, // 低性能 - 强劲快速
    minimal: { type: 'spring' as const, stiffness: 500, damping: 50, mass: 0.3 }, // 最低性能 - 极快
  };

  // Stagger 延迟配置
  private static staggerConfigs: Record<PerformanceMetrics['level'], number> = {
    ultra: 0.05,
    high: 0.04,
    medium: 0.03,
    low: 0.02,
    minimal: 0,
  };

  static getSpringConfig(level: PerformanceMetrics['level']) {
    return this.springConfigs[level];
  }

  static getStagger(level: PerformanceMetrics['level']) {
    return this.staggerConfigs[level];
  }

  static fadeIn(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;
    const shouldReduceMotion = level === 'minimal';

    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
      };
    }

    return {
      hidden: { opacity: 0, y: 20, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1, transition: spring },
    };
  }

  static slideIn(direction: 'left', level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.smooth;
    const distance = level === 'minimal' ? 0 : 40;

    return {
      hidden: { opacity: 0, x: -distance },
      visible: { opacity: 1, x: 0, transition: spring },
    };
  }

  static stagger(level: PerformanceMetrics['level']): Variants {
    const stagger = this.getStagger(level);
    const delayChildren = level === 'minimal' ? 0 : 0.05;

    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: stagger, delayChildren } },
    };
  }

  static listItem(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.snappy;

    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: (custom: number) => ({
          opacity: 1,
          transition: { duration: 0.3, ease: 'easeOut', delay: custom * 0.05 },
        }),
      };
    }

    // 移除 x 变换，只使用 opacity 和 scale，避免横向滚动和抖动
    return {
      hidden: { opacity: 0, scale: 0.98 },
      visible: (custom: number) => ({
        opacity: 1,
        scale: 1,
        transition: { ...spring, delay: custom * 0.05 },
      }),
    };
  }

  static listItemUp(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.microRebound;

    return {
      hidden: { opacity: 0, y: 20 },
      visible: (custom: number) => ({ opacity: 1, y: 0, transition: { ...spring, delay: custom * 0.08 } }),
    };
  }

  static listItemScale(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;

    return {
      hidden: { opacity: 0, scale: 0.8 },
      visible: (custom: number) => ({ opacity: 1, scale: 1, transition: { ...spring, delay: custom * 0.06 } }),
    };
  }

  static card(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;

    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
      };
    }

    return {
      hidden: { opacity: 0, y: 20, scale: 0.96 },
      visible: { opacity: 1, y: 0, scale: 1, transition: spring },
    };
  }

  static dropdown(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.dropdown;

    return {
      hidden: { opacity: 0, y: -10, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: spring },
      exit: { opacity: 0, y: -10, scale: 0.95, transition: { ...spring, damping: spring.damping! * 1.5 } },
    };
  }

  static waveContainer(level: PerformanceMetrics['level']): Variants {
    const stagger = level === 'minimal' ? 0 : 0.022;

    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: stagger, when: 'beforeChildren' } },
    };
  }

  static waveChar(level: PerformanceMetrics['level']): Variants {
    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: this.springConfigs[level] },
      };
    }

    return {
      hidden: { y: '0.7em', opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 380, damping: 24, mass: 0.5 } },
    };
  }

  static pulse(level: PerformanceMetrics['level']): Variants {
    if (level === 'minimal') return {};
    return {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    };
  }
}

// ==================== 交互 Hooks ====================

/**
 * 统一的悬停和点击交互 Hook
 * @param config 可选配置，覆盖默认行为
 */
export const useSpringInteractions = (config?: {
  hoverScale?: number;
  tapScale?: number;
  hoverY?: number;
  stiffness?: number;
  damping?: number;
}) => {
  const { metrics } = useAnimationEngine();
  const shouldReduceMotion = metrics.prefersReducedMotion || metrics.level === 'minimal';

  if (shouldReduceMotion) {
    return {};
  }

  const spring = {
    type: 'spring' as const,
    stiffness: config?.stiffness ?? 400,
    damping: config?.damping ?? 25,
    mass: 0.8,
  };

  return {
    whileHover: {
      scale: config?.hoverScale ?? 1.02,
      y: config?.hoverY ?? -2,
      transition: spring,
    },
    whileTap: {
      scale: config?.tapScale ?? 0.96,
      transition: spring,
    },
  };
};

// ==================== 主Hook ====================

export const useAnimationEngine = () => {
  const monitor = useMemo(() => PerformanceMonitor.getInstance(), []);
  const scheduler = useMemo(() => AnimationScheduler.getInstance(), []);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => monitor.getMetrics());

  // 订阅性能变化
  useEffect(() => {
    const unsubscribe = monitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      scheduler.updateConcurrency(newMetrics.level);
    });

    // 🔥 关键优化：只在性能等级变化时更新，避免频繁重渲染
    const interval = setInterval(() => {
      const newMetrics = monitor.getMetrics();

      // 只在性能等级真正变化时才更新状态
      setMetrics((prev) => {
        if (prev.level !== newMetrics.level) {
          scheduler.updateConcurrency(newMetrics.level);
          return newMetrics;
        }
        return prev; // 不变则返回原对象，避免触发重渲染
      });
    }, 5000); // 改为5秒检查一次，减少频率

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [monitor, scheduler]);

  // 获取动画变体 - 常用动画集合
  const variants = useMemo(
    () => ({
      // 基础动画
      fadeIn: AnimationVariants.fadeIn(metrics.level),
      slideInLeft: AnimationVariants.slideIn('left', metrics.level),

      // 容器和列表
      stagger: AnimationVariants.stagger(metrics.level),
      listItem: AnimationVariants.listItem(metrics.level),
      listItemUp: AnimationVariants.listItemUp(metrics.level),
      listItemScale: AnimationVariants.listItemScale(metrics.level),
      card: AnimationVariants.card(metrics.level),

      // 下拉菜单
      dropdown: AnimationVariants.dropdown(metrics.level),

      // 波浪文字动画
      waveContainer: AnimationVariants.waveContainer(metrics.level),
      waveChar: AnimationVariants.waveChar(metrics.level),
    }),
    [metrics.level],
  );

  // 调度动画
  const scheduleAnimation = useCallback(
    (callback: () => void, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal', id?: string) => {
      scheduler.schedule(callback, priority, id);
    },
    [scheduler],
  );

  // 获取 Spring 配置
  const springConfig = useMemo(() => AnimationVariants.getSpringConfig(metrics.level), [metrics.level]);

  // 悬停动画配置 - 使用 Spring
  const hoverProps = useMemo(() => {
    if (metrics.level === 'minimal' || metrics.prefersReducedMotion) {
      return {};
    }

    const spring = SPRING_PRESETS.snappy;

    return {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
      transition: spring,
    };
  }, [metrics.level, metrics.prefersReducedMotion]);

  return {
    // 性能指标
    metrics,
    fps: monitor.getAverageFPS(),
    level: metrics.level,
    shouldReduceMotion: metrics.prefersReducedMotion,

    // 动画变体
    variants,

    // Spring 动画配置
    springConfig,
    springPresets: SPRING_PRESETS,

    // 降级缓动配置
    easing: EASING,

    // 工具方法
    scheduleAnimation,
    hoverProps,
  };
};

/**
 * 智能视口检测 Hook
 * 支持LCP优化、刷新位置保持、自动清理
 */
export const useSmartInView = (options?: { once?: boolean; amount?: number; lcpOptimization?: boolean }) => {
  const ref = useRef<HTMLElement>(null);
  const controls = useAnimation();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  // framer-motion 的视口检测
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    amount: options?.amount ?? 0.2,
    margin: '0px 0px -10% 0px', // 提前触发动画
  });

  const lcpOptimization = options?.lcpOptimization ?? false;

  useEffect(() => {
    if (!ref.current || !isInitialCheck) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    const isVisible = rect.top < windowHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;

    if (isVisible) {
      if (lcpOptimization && !getIsHydrationComplete()) {
        controls.start('visible');
        setShouldAnimate(true);
      } else {
        setShouldAnimate(true);
      }
    }

    setIsInitialCheck(false);
  }, [isInitialCheck, controls, lcpOptimization]);

  useEffect(() => {
    if (isInView && !isInitialCheck) {
      setShouldAnimate(true);
      controls.start('visible');
    }
  }, [isInView, isInitialCheck, controls]);

  return { ref, controls, isInView: shouldAnimate };
};

export const useInViewOnce = (options?: { amount?: number }) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isInView = useInView(ref, {
    once: true,
    amount: options?.amount ?? 0.2,
    margin: '0px 0px -10% 0px',
  });

  useEffect(() => {
    if (!ref.current || isVisible) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      setIsVisible(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isInView && !isVisible) {
      setIsVisible(true);
    }
  }, [isInView, isVisible]);

  return { ref, isVisible };
};

// ==================== 导出 ====================

export default {
  useAnimationEngine,
  useSmartInView,
  useInViewOnce,
  HydrationDetector,
  getIsHydrationComplete,
  markHydrationComplete,
  onHydrationComplete,
  AnimationVariants,
  SPRING_PRESETS,
  EASING,
  PerformanceMonitor,
  AnimationScheduler,
};
