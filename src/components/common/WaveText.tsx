/**
 * 🌊 波浪文字动画组件
 * 优雅的字符逐个弹性显示效果
 */

import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/animation-engine';

// ==================== 类型定义 ====================

interface WaveTextProps {
  /** 要显示的文本内容 */
  children: string;
  /** 是否显示 */
  show: boolean;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 容器显示模式 */
  display?: 'inline' | 'inline-block' | 'block';
}

// ==================== 样式组件 ====================

/** 单个字符容器 - 支持波浪动画 */
const AnimatedChar = styled(motion.span)`
  display: inline-block;
`;

// ==================== 主组件 ====================

/**
 * 波浪文字组件
 *
 * @example
 * ```tsx
 * <WaveText show={true} onComplete={() => console.log('done')}>
 *   欢迎来到 Adnaan 的博客
 * </WaveText>
 * ```
 */
export const WaveText: React.FC<WaveTextProps> = ({ children, show, onComplete, style, display = 'inline-block' }) => {
  const { variants } = useAnimationEngine();

  return (
    <motion.span
      variants={variants.waveContainer}
      initial="hidden"
      animate={show ? 'visible' : 'hidden'}
      onAnimationComplete={(definition: any) => {
        // 只在变为 visible 时触发 onComplete
        if (definition === 'visible' && onComplete) {
          onComplete();
        }
      }}
      style={{ display, ...style }}
    >
      {children.split('').map((char, index) => (
        <AnimatedChar key={index} variants={variants.waveChar}>
          {char === ' ' ? '\u00A0' : char}
        </AnimatedChar>
      ))}
    </motion.span>
  );
};

export default WaveText;
