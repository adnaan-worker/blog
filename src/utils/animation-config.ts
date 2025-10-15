import { Variants, Transition } from 'framer-motion';

/**
 * 统一的动画配置
 * 所有动画使用GPU加速的transform属性
 */

// ==================== 动画时长配置 ====================
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const;

// ==================== 缓动函数配置 ====================
export const EASING = {
  // 标准缓动 - 平滑自然
  ease: [0.4, 0, 0.2, 1],
  // 入场动画 - 快速启动，平滑结束
  easeIn: [0.25, 0.46, 0.45, 0.94],
  // 出场动画 - 平滑启动，快速结束
  easeOut: [0.16, 1, 0.3, 1],
  // 弹性效果
  spring: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
} as const;

// ==================== 基础过渡配置 ====================
export const transitions: Record<string, Transition> = {
  fast: {
    duration: ANIMATION_DURATION.fast,
    ease: EASING.ease,
  },
  normal: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING.ease,
  },
  slow: {
    duration: ANIMATION_DURATION.slow,
    ease: EASING.easeIn,
  },
  spring: EASING.spring,
};

// ==================== 优化的动画变体 ====================

/**
 * 淡入淡出 - 最基础的动画
 */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

/**
 * 向上淡入 - 最常用的入场动画
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

/**
 * 向下淡入
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
};

/**
 * 从左淡入
 */
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

/**
 * 从右淡入
 */
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

/**
 * 缩放淡入
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

/**
 * 交错容器 - 用于列表动画
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
      duration: ANIMATION_DURATION.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/**
 * 卡片动画 - 适用于卡片元素
 */
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
};

/**
 * 页面过渡动画
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: transitions.fast,
  },
};

/**
 * 抽屉/侧边栏动画
 */
export const drawerVariants = {
  left: {
    hidden: { x: '-100%' },
    visible: {
      x: 0,
      transition: {
        ...transitions.spring,
        damping: 25,
      },
    },
    exit: { x: '-100%' },
  },
  right: {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: {
        ...transitions.spring,
        damping: 25,
      },
    },
    exit: { x: '100%' },
  },
  top: {
    hidden: { y: '-100%' },
    visible: {
      y: 0,
      transition: {
        ...transitions.spring,
        damping: 25,
      },
    },
    exit: { y: '-100%' },
  },
  bottom: {
    hidden: { y: '100%' },
    visible: {
      y: 0,
      transition: {
        ...transitions.spring,
        damping: 25,
      },
    },
    exit: { y: '100%' },
  },
};

/**
 * Modal/Dialog动画
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

/**
 * 遮罩层动画
 */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// ==================== 高级动画效果 ====================

/**
 * 创建自定义交错动画
 */
export const createStaggerVariants = (delay = 0.05, duration = ANIMATION_DURATION.normal): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      duration,
    },
  },
});

/**
 * 创建自定义淡入动画
 */
export const createFadeInVariants = (direction: 'up' | 'down' | 'left' | 'right' = 'up', distance = 20): Variants => {
  const isVertical = direction === 'up' || direction === 'down';
  const value = direction === 'up' || direction === 'left' ? distance : -distance;

  return {
    hidden: {
      opacity: 0,
      ...(isVertical ? { y: value } : { x: value }),
    },
    visible: {
      opacity: 1,
      ...(isVertical ? { y: 0 } : { x: 0 }),
      transition: transitions.normal,
    },
  };
};

// ==================== 性能优化配置 ====================

/**
 * GPU加速的CSS属性
 */
export const gpuAcceleration = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
};

/**
 * 优化的hover动画配置
 */
export const hoverScale = {
  whileHover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  whileTap: {
    scale: 0.98,
  },
};

/**
 * 优化的点击反馈
 */
export const tapScale = {
  whileTap: {
    scale: 0.95,
    transition: transitions.fast,
  },
};

/**
 * 检测是否应该减少动画
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * 根据用户偏好返回动画配置
 */
export const getAnimationVariants = (variants: Variants): Variants => {
  if (shouldReduceMotion()) {
    // 简化动画
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: ANIMATION_DURATION.fast },
      },
    };
  }
  return variants;
};

/**
 * 导出所有动画变体
 */
export const variants = {
  fade,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  cardVariants,
  pageTransition,
  drawerVariants,
  modalVariants,
  overlayVariants,
};

export default variants;
