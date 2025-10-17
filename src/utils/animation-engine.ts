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
  ease: number[] | string;
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
      const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
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
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
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
        batch.map(item =>
          new Promise(resolve => {
            requestAnimationFrame(() => {
              item.callback();
              resolve(undefined);
            });
          })
        )
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

// ==================== 缓动函数库 ====================

export const EASING = {
  // 标准缓动
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  
  // 自定义缓动
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  
  // 物理缓动
  spring: { type: 'spring' as const, stiffness: 300, damping: 20 },
  softSpring: { type: 'spring' as const, stiffness: 150, damping: 15 },
  stiffSpring: { type: 'spring' as const, stiffness: 500, damping: 30 },
} as const;

// ==================== 动画变体库 ====================

export class AnimationVariants {
  private static configs: Record<PerformanceMetrics['level'], AnimationConfig> = {
    ultra: { duration: 0.6, ease: EASING.smooth, stagger: 0.08 },
    high: { duration: 0.4, ease: EASING.smooth, stagger: 0.05 },
    medium: { duration: 0.3, ease: EASING.snappy, stagger: 0.03 },
    low: { duration: 0.2, ease: EASING.snappy, stagger: 0.02 },
    minimal: { duration: 0.1, ease: EASING.linear, stagger: 0 },
  };

  static getConfig(level: PerformanceMetrics['level']): AnimationConfig {
    return this.configs[level];
  }

  // 淡入动画
  static fadeIn(level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: config.duration } },
      };
    }
    return {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: config.duration, ease: config.ease as number[] },
      },
    };
  }

  // 滑入动画
  static slideIn(direction: 'left' | 'right' | 'top' | 'bottom', level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    const distance = level === 'minimal' ? 0 : 50;
    
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
        transition: { duration: config.duration, ease: config.ease as number[] },
      },
    };
  }

  // 缩放动画
  static scale(level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    const scaleValue = level === 'minimal' ? 1 : 0.9;
    
    return {
      hidden: { opacity: 0, scale: scaleValue },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: config.duration, ease: config.ease as number[] },
      },
    };
  }

  // 交错容器
  static stagger(level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: config.stagger,
          delayChildren: level === 'minimal' ? 0 : 0.1,
        },
      },
    };
  }

  // 列表项动画
  static listItem(level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    
    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: config.duration } },
      };
    }
    
    return {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: config.duration, ease: config.ease as number[] },
      },
    };
  }

  // 卡片动画
  static card(level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    
    if (level === 'minimal') {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: config.duration } },
      };
    }
    
    return {
      hidden: { opacity: 0, y: 15, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: config.duration, ease: config.ease as number[] },
      },
    };
  }

  // 模态框动画
  static modal(level: PerformanceMetrics['level']): Variants {
    const config = this.getConfig(level);
    
    return {
      hidden: { opacity: 0, scale: 0.95, y: 20 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: config.duration, ease: config.ease as number[] },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: { duration: config.duration * 0.7 },
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

  // 获取动画变体
  const variants = useMemo(() => ({
    fadeIn: AnimationVariants.fadeIn(metrics.level),
    slideInLeft: AnimationVariants.slideIn('left', metrics.level),
    slideInRight: AnimationVariants.slideIn('right', metrics.level),
    slideInTop: AnimationVariants.slideIn('top', metrics.level),
    slideInBottom: AnimationVariants.slideIn('bottom', metrics.level),
    scale: AnimationVariants.scale(metrics.level),
    stagger: AnimationVariants.stagger(metrics.level),
    listItem: AnimationVariants.listItem(metrics.level),
    card: AnimationVariants.card(metrics.level),
    modal: AnimationVariants.modal(metrics.level),
  }), [metrics.level]);

  // 调度动画
  const scheduleAnimation = useCallback((callback: () => void, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal') => {
    scheduler.schedule(callback, priority);
  }, [scheduler]);

  // 获取配置
  const config = useMemo(() => AnimationVariants.getConfig(metrics.level), [metrics.level]);

  // 悬停动画配置
  const hoverProps = useMemo(() => {
    if (metrics.level === 'minimal' || metrics.prefersReducedMotion) {
      return {};
    }
    
    return {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.2 },
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
    
    // 动画配置
    config,
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
  EASING,
  PerformanceMonitor,
  AnimationScheduler,
};

