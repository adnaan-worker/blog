import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export interface WordCloudItem {
  text: string;
  weight: number; // 1-5，数字越大字体越大
  color?: string; // 可选自定义颜色
  category?: string; // 可选分类
  highlighted?: boolean; // 是否高亮显示（添加边框）
}

interface WordCloudProps {
  words: WordCloudItem[];
  minFontSize?: number;
  maxFontSize?: number;
  className?: string;
  enableRotation?: boolean; // 是否启用文字旋转
  compact?: boolean; // 是否使用紧凑布局
}

const CloudContainer = styled.div<{ $compact?: boolean }>`
  position: relative;
  width: 100%;
  min-height: ${(props) => (props.$compact ? '300px' : '200px')};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${(props) => (props.$compact ? '0.3rem 0.5rem' : '0.5rem 1rem')};
  padding: ${(props) => (props.$compact ? '1.5rem' : '1rem')};
  overflow: hidden;
`;

const CloudWordWrapper = styled(motion.div)<{
  $size: number;
  $rotation: number;
  $highlighted?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: rotate(${(props) => props.$rotation}deg);
  transform-origin: center center;

  /* 高亮边框效果 */
  ${(props) =>
    props.$highlighted &&
    `
    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -6px;
      right: -6px;
      bottom: -4px;
      border: 2px solid currentColor;
      border-radius: 6px;
      opacity: 0.3;
      pointer-events: none;
    }
  `}

  z-index: 1;
`;

const CloudWord = styled(motion.span)<{
  $size: number;
  $colorIndex: number;
  $highlighted?: boolean;
}>`
  display: inline-block;
  font-size: ${(props) => props.$size}rem;
  font-weight: ${(props) => {
    if (props.$size >= 1.8) return 800;
    if (props.$size >= 1.5) return 700;
    if (props.$size >= 1.2) return 600;
    return 500;
  }};
  letter-spacing: ${(props) => (props.$size > 1.5 ? '0.02em' : '0.01em')};
  padding: ${(props) => (props.$highlighted ? '0.2em 0.4em' : '0')};

  /* 丰富的渐变色系统 - 参考图片中的颜色 */
  background: ${(props) => {
    const gradients = [
      // 黄色系 - 图片中最显眼的颜色
      'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      // 紫色系 - 图片中的主要色调
      'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6d28d9 100%)',
      // 红粉色系
      'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
      // 蓝色系
      'linear-gradient(135deg, var(--accent-color) 0%, #667eea 50%, #5568d3 100%)',
      // 青色系
      'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
      // 绿色系
      'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
      // 橙色系
      'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
      // 品红系
      'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
      // 深紫系
      'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)',
      // 深蓝系
      'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    ];
    return gradients[props.$colorIndex % gradients.length];
  }};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  /* 高亮词的特殊效果 */
  ${(props) =>
    props.$highlighted &&
    `
    position: relative;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: brightness(1.1);
  `}

  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* 文字阴影 - 增加层次感 */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));

  &:hover {
    filter: brightness(1.3) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
    transform: scale(1.05);
  }

  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background: ${(props) => {
      const gradients = [
        'linear-gradient(135deg, #fbbf24 0%, #fcd34d 50%, #fde047 100%)',
        'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #c4b5fd 100%)',
        'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #fb923c 100%)',
        'linear-gradient(135deg, var(--accent-color) 0%, #818cf8 50%, #a5b4fc 100%)',
        'linear-gradient(135deg, #67e8f9 0%, #22d3ee 50%, #06b6d4 100%)',
        'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
        'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
        'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)',
        'linear-gradient(135deg, #d8b4fe 0%, #c084fc 50%, #a855f7 100%)',
        'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
      ];
      return gradients[props.$colorIndex % gradients.length];
    }};
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));

    &:hover {
      filter: brightness(1.2) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
    }
  }
`;

/**
 * 创新词云组件 - 基于图片效果设计
 *
 * 核心特性：
 * - 多方向文字旋转（横向、竖向、倾斜）
 * - 紧凑密集布局
 * - 丰富的渐变色系统（10种配色）
 * - 重点词高亮标注（边框效果）
 * - 层次感设计（阴影、大小对比）
 * - 背景装饰效果
 * - 流畅的交互动画
 * - 响应式适配
 */
export const WordCloud: React.FC<WordCloudProps> = ({
  words,
  minFontSize = 0.75,
  maxFontSize = 2.2,
  className,
  enableRotation = true,
  compact = true,
}) => {
  // 随机打乱顺序 + 添加旋转角度
  const processedWords = useMemo(() => {
    const shuffled = [...words];

    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 为每个词分配旋转角度
    return shuffled.map((word, index) => {
      let rotation = 0;

      if (enableRotation) {
        // 根据权重和索引决定旋转角度
        const rand = Math.random();
        if (word.weight >= 4) {
          // 大词保持水平，更易阅读
          rotation = 0;
        } else if (rand < 0.15) {
          // 15% 的词垂直显示
          rotation = 90;
        } else if (rand < 0.25) {
          // 10% 的词倾斜
          rotation = Math.random() > 0.5 ? -45 : 45;
        } else if (rand < 0.3) {
          // 5% 的词小角度倾斜
          rotation = Math.random() > 0.5 ? -15 : 15;
        }
      }

      return {
        ...word,
        rotation,
        colorSeed: index,
      };
    });
  }, [words, enableRotation]);

  // 计算字体大小 - 更大的差异
  const calculateFontSize = (weight: number): number => {
    const range = maxFontSize - minFontSize;
    // 使用指数曲线，让大小差异更明显
    const normalized = Math.pow((weight - 1) / 4, 0.8);
    return minFontSize + range * normalized;
  };

  return (
    <CloudContainer className={className} $compact={compact}>
      {processedWords.map((word, index) => {
        const fontSize = calculateFontSize(word.weight);
        const delay = index * 0.02; // 更快的动画序列

        return (
          <CloudWordWrapper
            key={`${word.text}-${index}`}
            $size={fontSize}
            $rotation={word.rotation}
            $highlighted={word.highlighted}
            initial={{
              opacity: 0,
              scale: 0.3,
              rotate: word.rotation - 180,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: word.rotation,
            }}
            whileHover={{
              scale: 1.1,
              rotate: word.rotation,
              zIndex: 10,
            }}
            transition={{
              delay,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1], // 弹性效果
            }}
          >
            <CloudWord
              $size={fontSize}
              $colorIndex={word.colorSeed}
              $highlighted={word.highlighted}
              title={word.category || word.text}
            >
              {word.text}
            </CloudWord>
          </CloudWordWrapper>
        );
      })}
    </CloudContainer>
  );
};

export default WordCloud;
