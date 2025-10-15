import { useEffect, useRef, useState } from 'react';
import { useInViewAnimation, useAnimationQueue } from '@/utils/animation-utils';
import { shouldReduceMotion, getAnimationVariants } from '@/utils/animation-config';
import type { Variants } from 'framer-motion';

/**
 * 优化的动画Hook
 * 结合视图检测、性能检测和动画队列
 */
export const useOptimizedAnimation = (
  variants: Variants,
  options = {
    threshold: 0.1,
    triggerOnce: true,
    enableQueue: false,
  },
) => {
  const { ref, isInView } = useInViewAnimation({
    threshold: options.threshold,
    triggerOnce: options.triggerOnce,
  });

  const { enqueue } = useAnimationQueue(3);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // 检测是否应该减少动画
  const reduceMotion = shouldReduceMotion();

  // 获取优化后的动画变体
  const optimizedVariants = reduceMotion ? getAnimationVariants(variants) : variants;

  useEffect(() => {
    if (isInView) {
      if (options.enableQueue) {
        enqueue(() => setShouldAnimate(true));
      } else {
        setShouldAnimate(true);
      }
    }
  }, [isInView, options.enableQueue, enqueue]);

  return {
    ref,
    isInView,
    shouldAnimate,
    variants: optimizedVariants,
    // 用于motion组件的属性
    animationProps: {
      initial: 'hidden',
      animate: shouldAnimate ? 'visible' : 'hidden',
      variants: optimizedVariants,
    },
  };
};

/**
 * 防抖动画Hook
 * 防止快速触发导致动画卡顿
 */
export const useDebouncedAnimation = (delay = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const trigger = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      timeoutRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    trigger,
  };
};

/**
 * 节流动画Hook
 * 限制动画触发频率
 */
export const useThrottledAnimation = (delay = 100) => {
  const [canAnimate, setCanAnimate] = useState(true);
  const rafRef = useRef<number | null>(null);

  const trigger = () => {
    if (!canAnimate) return false;

    setCanAnimate(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setTimeout(() => {
        setCanAnimate(true);
        rafRef.current = null;
      }, delay);
    });

    return true;
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    canAnimate,
    trigger,
  };
};

/**
 * 智能动画Hook
 * 根据设备性能自动调整动画
 */
export const useSmartAnimation = (variants: Variants) => {
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    // 检测设备性能
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    if (cores >= 4 && memory >= 4) {
      setPerformanceLevel('high');
    } else if (cores >= 2 && memory >= 2) {
      setPerformanceLevel('medium');
    } else {
      setPerformanceLevel('low');
    }
  }, []);

  // 根据性能调整动画
  const adjustedVariants = {
    ...variants,
    visible: {
      ...variants.visible,
      transition: {
        ...(variants.visible as any)?.transition,
        duration:
          performanceLevel === 'low'
            ? 0.2
            : performanceLevel === 'medium'
              ? 0.3
              : (variants.visible as any)?.transition?.duration || 0.5,
      },
    },
  };

  return {
    performanceLevel,
    variants: adjustedVariants,
  };
};

export default {
  useOptimizedAnimation,
  useDebouncedAnimation,
  useThrottledAnimation,
  useSmartAnimation,
};
