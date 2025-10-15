import { Variants } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';

// 动画性能检测
export const detectAnimationPerformance = () => {
  // 检测用户是否偏好减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 检测设备性能（简单检测）
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasWebGL = !!gl;

  // 检测CPU核心数（粗略估计）
  const cores = navigator.hardwareConcurrency || 4;

  // 检测设备内存（如果可用）
  const memory = (navigator as any).deviceMemory || 4;

  return {
    prefersReducedMotion,
    hasWebGL,
    cores,
    memory,
    performanceLevel: (prefersReducedMotion ? 'low' : hasWebGL && cores >= 4 && memory >= 4 ? 'high' : 'medium') as
      | 'high'
      | 'medium'
      | 'low',
  };
};

// 优化的动画变体
export const createOptimizedVariants = (
  baseVariants: Variants,
  performanceLevel: 'high' | 'medium' | 'low' = 'high',
): Variants => {
  if (performanceLevel === 'low') {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.1 },
      },
    };
  }

  if (performanceLevel === 'medium') {
    return {
      ...baseVariants,
      visible: {
        ...baseVariants.visible,
        transition: {
          ...(baseVariants.visible as any)?.transition,
          duration: Math.min((baseVariants.visible as any)?.transition?.duration || 0.6, 0.3),
          staggerChildren: Math.min((baseVariants.visible as any)?.transition?.staggerChildren || 0.1, 0.05),
        },
      },
    };
  }

  return baseVariants;
};

// 优化的淡入动画
export const optimizedFadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // 使用GPU友好的缓动函数
    },
  },
};

// 优化的交错容器动画
export const optimizedStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 减少交错延迟
      delayChildren: 0.1,
    },
  },
};

// 优化的卡片动画
export const optimizedCardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// 优化的图标动画
export const optimizedIconVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200, // 减少弹性
      damping: 20, // 增加阻尼
      duration: 0.3, // 限制持续时间
    },
  },
};

// 页面过渡动画
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
    staggerChildren: 0.05,
  },
};

// 动画性能优化Hook
export const useAnimationOptimization = () => {
  const performance = detectAnimationPerformance();

  const getOptimizedVariants = (baseVariants: Variants) => {
    return createOptimizedVariants(baseVariants, performance.performanceLevel);
  };

  const shouldReduceAnimations = performance.performanceLevel === 'low' || performance.prefersReducedMotion;

  return {
    performance,
    getOptimizedVariants,
    shouldReduceAnimations,
    // 预定义的优化变体
    fadeInUp: getOptimizedVariants(optimizedFadeInUp),
    staggerContainer: getOptimizedVariants(optimizedStaggerContainer),
    cardVariants: getOptimizedVariants(optimizedCardVariants),
    iconVariants: getOptimizedVariants(optimizedIconVariants),
  };
};

// CSS动画优化工具
export const cssAnimationOptimizer = {
  // 启用硬件加速的CSS类
  hardwareAcceleration: `
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  `,

  // 优化滚动性能
  scrollOptimization: `
    overflow-anchor: auto;
    scroll-behavior: smooth;
  `,

  // 减少重绘和重排
  layoutOptimization: `
    contain: layout style paint;
  `,

  // 优化的过渡效果
  optimizedTransition: `
    transition: transform 0.2s ease, opacity 0.2s ease;
  `,

  // 优化的hover效果
  optimizedHover: `
    &:hover {
      transform: translateY(-2px) translateZ(0);
      transition: transform 0.2s ease;
    }
  `,
};

// 动画节流工具 - 使用 requestAnimationFrame 优化
export const createAnimationThrottle = (delay = 16) => {
  let canAnimate = true;
  let rafId: number | null = null;

  return () => {
    if (!canAnimate) return false;

    canAnimate = false;

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      setTimeout(() => {
        canAnimate = true;
        rafId = null;
      }, delay);
    });

    return true;
  };
};

// 动画防抖工具 - 防止快速触发
export const createAnimationDebounce = (callback: () => void, delay = 300) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, delay);
  };
};

// 使用 Intersection Observer 优化视图内动画
export const useInViewAnimation = (options = { threshold: 0.1, triggerOnce: true }) => {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!options.triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold: options.threshold },
    );

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options.threshold, options.triggerOnce]);

  return { ref, isInView };
};

// 智能动画调度 - 避免同时执行过多动画
export const useAnimationQueue = (maxConcurrent = 3) => {
  const queueRef = useRef<Array<() => void>>([]);
  const runningRef = useRef(0);

  const processQueue = useCallback(() => {
    while (runningRef.current < maxConcurrent && queueRef.current.length > 0) {
      const animation = queueRef.current.shift();
      if (animation) {
        runningRef.current++;

        requestAnimationFrame(() => {
          animation();
          runningRef.current--;
          processQueue();
        });
      }
    }
  }, [maxConcurrent]);

  const enqueue = useCallback(
    (animation: () => void) => {
      queueRef.current.push(animation);
      processQueue();
    },
    [processQueue],
  );

  return { enqueue };
};

// 批量动画优化
export const batchAnimationOptimizer = {
  // 减少同时执行的动画数量
  maxConcurrentAnimations: 5,

  // 动画队列管理
  animationQueue: [] as (() => void)[],

  // 添加动画到队列
  addToQueue: (animation: () => void) => {
    batchAnimationOptimizer.animationQueue.push(animation);
    batchAnimationOptimizer.processQueue();
  },

  // 处理动画队列
  processQueue: () => {
    if (batchAnimationOptimizer.animationQueue.length === 0) return;

    const animation = batchAnimationOptimizer.animationQueue.shift();
    if (animation) {
      animation();
      // 延迟处理下一个动画
      setTimeout(() => {
        batchAnimationOptimizer.processQueue();
      }, 50);
    }
  },
};

// 导出所有工具
export default {
  detectAnimationPerformance,
  createOptimizedVariants,
  optimizedFadeInUp,
  optimizedStaggerContainer,
  optimizedCardVariants,
  optimizedIconVariants,
  pageTransition,
  useAnimationOptimization,
  cssAnimationOptimizer,
  createAnimationThrottle,
  createAnimationDebounce,
  useInViewAnimation,
  useAnimationQueue,
  batchAnimationOptimizer,
};
