import { Variants } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';

// 性能检测结果类型
interface PerformanceResult {
  prefersReducedMotion: boolean;
  hasWebGL: boolean;
  cores: number;
  memory: number;
  performanceLevel: 'high' | 'medium' | 'low';
}

// 性能检测结果缓存（单例模式）
let cachedPerformance: PerformanceResult | null = null;

// 动画性能检测
export const detectAnimationPerformance = (): PerformanceResult => {
  // 如果已经检测过，直接返回缓存结果
  if (cachedPerformance) {
    return cachedPerformance;
  }

  // 检测用户是否偏好减少动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 检测设备性能（简单检测） - 使用更轻量的方式
  let hasWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || 
               canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true });
    hasWebGL = !!gl;
    
    // 立即清理 WebGL 上下文
    if (gl && (gl as WebGLRenderingContext).getExtension) {
      const loseContext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }
    // 清理 canvas
    canvas.width = 0;
    canvas.height = 0;
  } catch (e) {
    hasWebGL = false;
  }

  // 检测CPU核心数（粗略估计）
  const cores = navigator.hardwareConcurrency || 4;

  // 检测设备内存（如果可用）
  const memory = (navigator as any).deviceMemory || 4;

  // 缓存结果
  cachedPerformance = {
    prefersReducedMotion,
    hasWebGL,
    cores,
    memory,
    performanceLevel: (prefersReducedMotion ? 'low' : hasWebGL && cores >= 4 && memory >= 4 ? 'high' : 'medium') as
      | 'high'
      | 'medium'
      | 'low',
  };

  return cachedPerformance;
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

// ==================== 扩展动画变体库 ====================

// 滑入动画变体
export const slideVariants = {
  // 从左滑入
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,

  // 从右滑入
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,

  // 从上滑入
  slideInTop: {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,

  // 从下滑入
  slideInBottom: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,
};

// 缩放动画变体
export const scaleVariants = {
  // 放大进入
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,

  // 缩小进入
  scaleOut: {
    hidden: { opacity: 0, scale: 1.2 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,

  // 弹性放大
  scaleSpring: {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
  } as Variants,
};

// 旋转动画变体
export const rotateVariants = {
  // 旋转淡入
  rotateIn: {
    hidden: { opacity: 0, rotate: -180 },
    visible: {
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,

  // 3D翻转
  flip: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: {
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  } as Variants,
};

// 淡入淡出变体
export const fadeVariants = {
  // 简单淡入
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  } as Variants,

  // 延迟淡入
  fadeInDelay: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.2,
      },
    },
  } as Variants,
};

// 模态框动画
export const modalVariants = {
  // 模态框背景
  overlay: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  } as Variants,

  // 模态框内容
  content: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  } as Variants,
};

// Toast 消息动画
export const toastVariants = {
  // 从顶部滑入
  slideFromTop: {
    hidden: { opacity: 0, y: -100, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  } as Variants,

  // 从右侧滑入
  slideFromRight: {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      transition: {
        duration: 0.2,
      },
    },
  } as Variants,
};

// 列表动画
export const listVariants = {
  // 列表容器
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // 列表项
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  } as Variants,
};

// 路由切换动画
export const routeVariants = {
  // 淡入淡出
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // 滑动切换
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },

  // 缩放切换
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.2 },
  },
};

// 悬停动画预设
export const hoverAnimations = {
  // 轻微上移
  lift: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },

  // 放大
  scale: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },

  // 发光效果（需配合 boxShadow）
  glow: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(var(--accent-rgb), 0.25)',
    transition: {
      duration: 0.2,
    },
  },

  // 微微倾斜
  tilt: {
    rotate: 2,
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

// 点击动画预设
export const tapAnimations = {
  // 轻微缩小
  shrink: {
    scale: 0.95,
  },

  // 弹性
  bounce: {
    scale: 0.9,
  },
};

// 缓动函数预设
export const easingPresets = {
  // 标准缓动
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],

  // 自定义缓动
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.4, 0, 0.2, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
  
  // 物理缓动
  spring: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  },
  
  softSpring: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  },
};

// 动画性能优化Hook - 整合所有动画
export const useAnimationOptimization = () => {
  const performance = detectAnimationPerformance();

  const getOptimizedVariants = (baseVariants: Variants) => {
    return createOptimizedVariants(baseVariants, performance.performanceLevel);
  };

  const shouldReduceAnimations = performance.performanceLevel === 'low' || performance.prefersReducedMotion;

  return {
    // 性能信息
    performance,
    getOptimizedVariants,
    shouldReduceAnimations,
    
    // 基础动画变体
    fadeInUp: getOptimizedVariants(optimizedFadeInUp),
    staggerContainer: getOptimizedVariants(optimizedStaggerContainer),
    cardVariants: getOptimizedVariants(optimizedCardVariants),
    iconVariants: getOptimizedVariants(optimizedIconVariants),
    
    // 扩展动画变体
    slideVariants,
    scaleVariants,
    rotateVariants,
    fadeVariants,
    modalVariants,
    toastVariants,
    listVariants,
    routeVariants,
    
    // 交互动画
    hoverAnimations,
    tapAnimations,
    
    // 缓动函数
    easingPresets,
    
    // 页面过渡
    pageTransition,
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
  // 性能检测
  detectAnimationPerformance,
  createOptimizedVariants,
  
  // 基础动画变体
  optimizedFadeInUp,
  optimizedStaggerContainer,
  optimizedCardVariants,
  optimizedIconVariants,
  pageTransition,
  
  // 扩展动画变体库
  slideVariants,
  scaleVariants,
  rotateVariants,
  fadeVariants,
  modalVariants,
  toastVariants,
  listVariants,
  routeVariants,
  
  // 交互动画
  hoverAnimations,
  tapAnimations,
  
  // 缓动函数
  easingPresets,
  
  // Hooks 和工具
  useAnimationOptimization,
  cssAnimationOptimizer,
  createAnimationThrottle,
  createAnimationDebounce,
  useInViewAnimation,
  useAnimationQueue,
  batchAnimationOptimizer,
};
