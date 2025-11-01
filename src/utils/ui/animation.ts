/**
 * 🚀 Adnaan Animation Engine v3.0 - 超级动画引擎
 * 统一的动画管理系统，提供最佳性能和视觉效果
 *
 * 核心功能：
 * - 性能监控：动态调整动画复杂度
 * - 视口动画：修复刷新时可见度问题
 * - Hydration优化：改善LCP性能
 * - 内存管理：自动清理和垃圾回收
 * - Spring动画：现代化的弹性动画系统
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

/**
 * Hydration 状态管理
 * 用于跳过首次加载动画，改善 LCP 性能
 */
let isHydrationComplete = false;
let hydrationCallbacks: (() => void)[] = [];

/**
 * 标记 Hydration 完成
 * 应在 App 组件挂载后2秒调用
 */
export const markHydrationComplete = () => {
  isHydrationComplete = true;
  hydrationCallbacks.forEach((cb) => cb());
  hydrationCallbacks = [];
};

/**
 * 检查 Hydration 是否完成
 */
export const getIsHydrationComplete = () => isHydrationComplete;

/**
 * 订阅 Hydration 完成事件
 */
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

/**
 * Hydration 检测组件
 * 在 App 根组件中使用
 */
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

/**
 * Spring 动画预设 - 基于物理世界的运动规律
 *
 * 传统参数 (stiffness/damping/mass):
 * - stiffness: 弹簧刚度 (50-1000)
 * - damping: 阻尼系数 (5-50)
 * - mass: 物体质量 (0.1-5)
 *
 * 现代参数 (duration/bounce):
 * - duration: 感知持续时间
 * - bounce: 回弹量 (0-1)
 */
export const SPRING_PRESETS = {
  // 🌸 温柔优雅 - 适用于页面入场、卡片展开
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 20,
    mass: 1,
  },

  // 🌊 柔和平滑 - 无回弹的平滑过渡
  soft: {
    type: 'spring' as const,
    duration: 0.35,
    stiffness: 120,
    damping: 20,
  },

  // 💎 微弹动 - 轻微的回弹效果
  microRebound: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },

  // 🔄 微阻尼 - 快速衰减的弹性
  microDamping: {
    type: 'spring' as const,
    damping: 24,
  },

  // 💫 流畅平滑 - 适用于列表、表单交互
  smooth: {
    type: 'spring' as const,
    stiffness: 180, // 中等刚度
    damping: 25, // 较高阻尼，几乎无回弹
    mass: 0.8, // 较轻质量，反应灵敏
  },

  // ⚡ 敏捷快速 - 适用于按钮、图标、小元素
  snappy: {
    type: 'spring' as const,
    stiffness: 300, // 高刚度
    damping: 30, // 高阻尼，无回弹
    mass: 0.6, // 轻质量
  },

  // 🚀 强劲有力 - 适用于模态框、抽屉、重要提示
  stiff: {
    type: 'spring' as const,
    stiffness: 400, // 很高的刚度
    damping: 35, // 很高的阻尼
    mass: 0.5, // 很轻的质量
  },

  // 🎈 弹性十足 - 适用于趣味交互、特殊效果
  bouncy: {
    type: 'spring' as const,
    stiffness: 260, // 中等刚度
    damping: 12, // 低阻尼，明显回弹
    mass: 1.2, // 较重质量，增加惯性
  },

  // 🍃 轻盈飘逸 - 适用于悬浮元素、提示框
  floaty: {
    type: 'spring' as const,
    stiffness: 100, // 低刚度
    damping: 15, // 低阻尼
    mass: 0.4, // 很轻的质量
  },

  // 🎯 精准到位 - 适用于拖拽、定位
  precise: {
    type: 'spring' as const,
    stiffness: 350, // 高刚度
    damping: 40, // 很高阻尼，无回弹
    mass: 0.5, // 轻质量
  },

  // 🌊 缓慢流动 - 适用于大型元素、背景
  slow: {
    type: 'spring' as const,
    stiffness: 80, // 很低的刚度
    damping: 25, // 适中阻尼
    mass: 2, // 重质量
  },

  // 💨 下拉菜单专用 - 快速响应
  dropdown: {
    type: 'spring' as const,
    stiffness: 450, // 很高刚度
    damping: 35, // 高阻尼
    mass: 0.4, // 很轻
  },

  // ⚙️ 自定义阻尼系数 - 根据性能动态调整
  adaptive: (performanceLevel: PerformanceMetrics['level']) => {
    const configs = {
      ultra: { stiffness: 300, damping: 30, mass: 0.6 },
      high: { stiffness: 250, damping: 28, mass: 0.7 },
      medium: { stiffness: 200, damping: 25, mass: 0.8 },
      low: { stiffness: 150, damping: 20, mass: 1 },
      minimal: { stiffness: 100, damping: 15, mass: 1.2 },
    };
    return {
      type: 'spring' as const,
      ...configs[performanceLevel],
    };
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

  // 🌟 淡入动画 - 温柔优雅
  static fadeIn(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;
    const shouldReduceMotion = level === 'minimal';

    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        },
      };
    }

    return {
      hidden: { opacity: 0, y: 20, scale: 0.98 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 💨 滑入动画 - 仅保留左侧滑入
  static slideIn(direction: 'left', level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.smooth;
    const distance = level === 'minimal' ? 0 : 40;

    return {
      hidden: { opacity: 0, x: -distance },
      visible: {
        opacity: 1,
        x: 0,
        transition: spring,
      },
    };
  }

  // 📋 交错容器 - 优雅展开
  static stagger(level: PerformanceMetrics['level']): Variants {
    const stagger = this.getStagger(level);
    const delayChildren = level === 'minimal' ? 0 : 0.05;

    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          delayChildren,
        },
      },
    };
  }

  // 📝 列表项动画 - 敏捷快速（支持自定义索引延迟）
  static listItem(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.snappy;

    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: (custom: number) => ({
          opacity: 1,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
            delay: custom * 0.05,
          },
        }),
      };
    }

    return {
      hidden: { opacity: 0, x: -20, scale: 0.95 },
      visible: (custom: number) => ({
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          ...spring,
          delay: custom * 0.05,
        },
      }),
    };
  }

  // 📋 列表项向上滑入 - 优雅上升
  static listItemUp(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.microRebound;

    return {
      hidden: { opacity: 0, y: 20 },
      visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          ...spring,
          delay: custom * 0.08,
        },
      }),
    };
  }

  // ⚡ 列表项缩放入场 - 弹性缩放
  static listItemScale(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;

    return {
      hidden: { opacity: 0, scale: 0.8 },
      visible: (custom: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
          ...spring,
          delay: custom * 0.06,
        },
      }),
    };
  }

  // 🎴 卡片动画 - 温柔优雅
  static card(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;

    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        },
      };
    }

    return {
      hidden: { opacity: 0, y: 20, scale: 0.96 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 📱 下拉菜单动画 - 快速响应
  static dropdown(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.dropdown;

    return {
      hidden: { opacity: 0, y: -10, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
      },
      exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { ...spring, damping: spring.damping! * 1.5 },
      },
    };
  }

  // ============ 波浪文字动画 ============

  // 🌊 波浪容器 - 交错显示子元素
  static waveContainer(level: PerformanceMetrics['level']): Variants {
    const stagger = level === 'minimal' ? 0 : 0.022;

    return {
      hidden: {
        opacity: 0,
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          when: 'beforeChildren',
        },
      },
    };
  }

  // 🌊 波浪字符 - 单个字符的弹性动画
  static waveChar(level: PerformanceMetrics['level']): Variants {
    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: this.springConfigs[level],
        },
      };
    }

    return {
      hidden: {
        y: '0.7em',
        opacity: 0,
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 380,
          damping: 24,
          mass: 0.5,
        },
      },
    };
  }
}

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

    // 每2秒更新一次指标
    const interval = setInterval(() => {
      const newMetrics = monitor.getMetrics();
      setMetrics(newMetrics);
      scheduler.updateConcurrency(newMetrics.level);
    }, 2000);

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
 * 智能视口检测 Hook - 完美解决视口动画问题
 *
 * 核心功能：
 * 1. 支持 LCP 优化 - 首次加载跳过动画
 * 2. 修复刷新bug - 元素在视口时立即显示
 * 3. 自动清理 - 防止内存泄漏
 * 4. 动画控制 - useAnimation精确控制
 *
 * 使用方法：
 * ```tsx
 * const { ref, isInView } = useSmartInView();
 *
 * <motion.div
 *   ref={ref}
 *   initial="hidden"
 *   animate={isInView ? "visible" : "hidden"}
 *   variants={variants.fadeIn}
 * >
 * ```
 */
export const useSmartInView = (options?: {
  once?: boolean;
  amount?: number;
  lcpOptimization?: boolean; // LCP 优化：首次加载跳过动画
}) => {
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

  // 初次检查：元素是否在视口中
  useEffect(() => {
    if (!ref.current || !isInitialCheck) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    // 检测元素是否可见
    const isVisible = rect.top < windowHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;

    if (isVisible) {
      // 元素初始就在视口中
      if (lcpOptimization && !getIsHydrationComplete()) {
        // LCP优化：跳过动画，直接显示
        controls.start('visible');
        setShouldAnimate(true);
      } else {
        // 立即触发动画
        setShouldAnimate(true);
      }
    }

    setIsInitialCheck(false);
  }, [isInitialCheck, controls, lcpOptimization]);

  // 监听视口变化
  useEffect(() => {
    if (isInView && !isInitialCheck) {
      setShouldAnimate(true);
      controls.start('visible');
    }
  }, [isInView, isInitialCheck, controls]);

  return {
    ref,
    controls,
    isInView: shouldAnimate,
  };
};

/**
 * 简化版视口检测 - 仅返回可见状态
 *
 * 使用方法：
 * ```tsx
 * const { ref, isVisible } = useInViewOnce();
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0 }}
 *   animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
 * >
 * ```
 */
export const useInViewOnce = (options?: { amount?: number }) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isInView = useInView(ref, {
    once: true,
    amount: options?.amount ?? 0.2,
    margin: '0px 0px -10% 0px',
  });

  // 初次检查
  useEffect(() => {
    if (!ref.current || isVisible) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    const isElementVisible = rect.top < windowHeight && rect.bottom > 0;

    if (isElementVisible) {
      setIsVisible(true);
    }
  }, [isVisible]);

  // 监听视口变化
  useEffect(() => {
    if (isInView && !isVisible) {
      setIsVisible(true);
    }
  }, [isInView, isVisible]);

  return {
    ref,
    isVisible,
  };
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
