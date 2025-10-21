/**
 * 🚀 Adnaan Animation Engine - 超级动画引擎
 * 统一的动画管理系统，提供最佳性能和视觉效果
 */

import { Variants, Transition } from 'framer-motion';
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

// ==================== 性能监控器 ====================

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics | null = null;
  private fpsHistory: number[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private rafId: number | null = null;

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

    // 如果性能等级降低，触发优化
    if (oldLevel !== this.metrics.level) {
      console.log(`[Animation Engine] Performance level changed: ${oldLevel} → ${this.metrics.level}`);
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

    // WebGL检测（优化版）
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

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

// ==================== 动画调度器 ====================

class AnimationScheduler {
  private static instance: AnimationScheduler;
  private queue: Array<{ priority: number; callback: () => void }> = [];
  private isProcessing = false;
  private maxConcurrent = 5;

  private constructor() {}

  static getInstance(): AnimationScheduler {
    if (!AnimationScheduler.instance) {
      AnimationScheduler.instance = new AnimationScheduler();
    }
    return AnimationScheduler.instance;
  }

  schedule(callback: () => void, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') {
    const priorityMap = { critical: 4, high: 3, normal: 2, low: 1 };
    this.queue.push({ priority: priorityMap[priority], callback });
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
              requestAnimationFrame(() => {
                item.callback();
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
}

// ==================== Spring 动画配置库 ====================

/**
 * Spring 动画预设 - 基于物理世界的运动规律
 *
 * 参数说明:
 * - stiffness (刚度): 弹簧的硬度，值越大弹簧越硬，动画越快 (50-1000)
 * - damping (阻尼): 减少振荡，值越大减速越快 (5-50)
 * - mass (质量): 物体的质量，影响动画的惯性 (0.1-5)
 * - velocity (初始速度): 动画的初始速度 (0-100)
 */
export const SPRING_PRESETS = {
  // 🌸 温柔优雅 - 适用于页面入场、卡片展开
  gentle: {
    type: 'spring' as const,
    stiffness: 120, // 较低的刚度，柔和
    damping: 20, // 适中的阻尼，轻微回弹
    mass: 1, // 正常质量
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
          transition: spring,
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

  // 💨 滑入动画 - 流畅平滑
  static slideIn(direction: 'left' | 'right' | 'top' | 'bottom', level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.smooth;
    const distance = level === 'minimal' ? 0 : 40;

    const offsets = {
      left: { x: -distance, y: 0 },
      right: { x: distance, y: 0 },
      top: { x: 0, y: -distance },
      bottom: { x: 0, y: distance },
    };

    return {
      hidden: { opacity: 0, ...offsets[direction] },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: spring,
      },
    };
  }

  // 🎯 缩放动画 - 弹性十足
  static scale(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;
    const scaleValue = level === 'minimal' ? 1 : 0.85;

    return {
      hidden: { opacity: 0, scale: scaleValue },
      visible: {
        opacity: 1,
        scale: 1,
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

  // 📝 列表项动画 - 敏捷快速
  static listItem(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.snappy;

    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: spring },
      };
    }

    return {
      hidden: { opacity: 0, x: -20, scale: 0.95 },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 🎴 卡片动画 - 温柔优雅
  static card(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;

    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: spring },
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

  // 🎭 模态框动画 - 强劲有力
  static modal(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.stiff;

    return {
      hidden: { opacity: 0, scale: 0.9, y: 30 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: spring,
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: { ...spring, damping: spring.damping! * 1.5 }, // 退出时更快
      },
    };
  }

  // 🎈 悬浮动画 - 轻盈飘逸
  static float(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.floaty;

    return {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: spring,
      },
    };
  }

  // ⚡ 按钮点击 - 精准到位
  static button(level: PerformanceMetrics['level']) {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.precise;

    return {
      hover: { scale: 1.02, y: -2, transition: spring },
      tap: { scale: 0.98, transition: spring },
    };
  }

  // 🌊 滚动入场 - 缓慢流动
  static scrollReveal(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.slow;

    return {
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: spring,
      },
    };
  }

  // ============ 详情页专用动画 ============

  // 📰 文章标题入场 - 弹性十足
  static articleTitle(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;

    return {
      hidden: { opacity: 0, y: -30, scale: 0.9 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 📝 文章内容入场 - 向上划出，弹性十足
  static articleContent(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;

    return {
      hidden: { opacity: 0, y: 60, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 📑 TOC 目录入场 - 从右侧滑入
  static tocSlideIn(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.smooth;

    return {
      hidden: { opacity: 0, x: 40, scale: 0.95 },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 🔖 书签 Tab 弹性入场
  static bookmark(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;

    return {
      hidden: { opacity: 0, x: -20, scale: 0.8 },
      visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: spring,
      },
    };
  }

  // 💬 评论区入场 - 从下向上弹出
  static commentSection(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;

    return {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: spring,
      },
    };
  }

  // 🎯 交互按钮悬停 - 弹性响应
  static interactiveButton(level: PerformanceMetrics['level']) {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.bouncy;

    return {
      rest: { scale: 1, y: 0 },
      hover: {
        scale: 1.1,
        y: -3,
        transition: spring,
      },
      tap: {
        scale: 0.95,
        transition: spring,
      },
    };
  }

  // ============ 项目详情页专用动画 ============

  // 🎯 项目头部 - 从上方滑入
  static projectHeader(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.smooth;

    return {
      hidden: { opacity: 0, y: -30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: spring,
      },
    };
  }

  // 📄 项目主内容 - 淡入上升
  static projectContent(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.gentle;

    return {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: spring,
      },
    };
  }

  // 📊 项目侧边栏 - 从右侧滑入
  static projectSidebar(level: PerformanceMetrics['level']): Variants {
    const spring = level === 'minimal' ? this.springConfigs[level] : SPRING_PRESETS.smooth;

    return {
      hidden: { opacity: 0, x: 30 },
      visible: {
        opacity: 1,
        x: 0,
        transition: spring,
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
        y: '0.7em', // 使用 em 相对位移，保证不同字号下摆动幅度一致
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

  useEffect(() => {
    // 每2秒更新一次指标
    const interval = setInterval(() => {
      const newMetrics = monitor.getMetrics();
      setMetrics(newMetrics);
      scheduler.updateConcurrency(newMetrics.level);
    }, 2000);

    return () => clearInterval(interval);
  }, [monitor, scheduler]);

  // 获取动画变体 - 全新 Spring 动画系统
  const variants = useMemo(
    () => ({
      // 基础动画
      fadeIn: AnimationVariants.fadeIn(metrics.level),
      scale: AnimationVariants.scale(metrics.level),
      float: AnimationVariants.float(metrics.level),

      // 滑入动画
      slideInLeft: AnimationVariants.slideIn('left', metrics.level),
      slideInRight: AnimationVariants.slideIn('right', metrics.level),
      slideInTop: AnimationVariants.slideIn('top', metrics.level),
      slideInBottom: AnimationVariants.slideIn('bottom', metrics.level),

      // 容器和列表
      stagger: AnimationVariants.stagger(metrics.level),
      listItem: AnimationVariants.listItem(metrics.level),
      card: AnimationVariants.card(metrics.level),

      // 特殊动画
      modal: AnimationVariants.modal(metrics.level),
      scrollReveal: AnimationVariants.scrollReveal(metrics.level),
      button: AnimationVariants.button(metrics.level),

      // 详情页专用动画
      articleTitle: AnimationVariants.articleTitle(metrics.level),
      articleContent: AnimationVariants.articleContent(metrics.level),
      tocSlideIn: AnimationVariants.tocSlideIn(metrics.level),
      bookmark: AnimationVariants.bookmark(metrics.level),
      commentSection: AnimationVariants.commentSection(metrics.level),
      interactiveButton: AnimationVariants.interactiveButton(metrics.level),

      // 项目详情页专用动画
      projectHeader: AnimationVariants.projectHeader(metrics.level),
      projectContent: AnimationVariants.projectContent(metrics.level),
      projectSidebar: AnimationVariants.projectSidebar(metrics.level),

      // 波浪文字动画
      waveContainer: AnimationVariants.waveContainer(metrics.level),
      waveChar: AnimationVariants.waveChar(metrics.level),
    }),
    [metrics.level],
  );

  // 调度动画
  const scheduleAnimation = useCallback(
    (callback: () => void, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') => {
      scheduler.schedule(callback, priority);
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

// ==================== 导出 ====================

export default {
  useAnimationEngine,
  AnimationVariants,
  SPRING_PRESETS,
  EASING,
  PerformanceMonitor,
  AnimationScheduler,
};
