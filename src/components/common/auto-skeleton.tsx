import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { storage } from '@/utils';
import { useAnimationEngine, SPRING_PRESETS } from '@/utils/ui/animation';

// ========== 骨架屏元素配置 ==========

interface SkeletonElement {
  type: 'text' | 'image' | 'avatar' | 'button' | 'card' | 'block';
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  className?: string;
}

interface SkeletonConfig {
  elements: SkeletonElement[];
  containerWidth: number;
  containerHeight: number;
}

// ========== 样式组件 ==========

const SkeletonContainer = styled.div`
  position: relative;
  width: 100%;
  background: var(--bg-primary);
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const SkeletonElement = styled(motion.div)<{
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}>`
  position: absolute;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background: var(--skeleton-bg, #e0e0e0);
  border-radius: ${(props) => props.borderRadius || 4}px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: wave 1.5s infinite;
  }

  @keyframes wave {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(200%);
    }
  }

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);

    &::after {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    }
  }
`;

// ========== DOM扫描工具 ==========

class SkeletonGenerator {
  private elements: SkeletonElement[] = [];
  private containerRect: DOMRect | null = null;

  /**
   * 判断元素是否在视口内
   */
  private isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  /**
   * 判断元素是否可见
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  /**
   * 识别元素类型
   */
  private identifyElementType(element: HTMLElement): SkeletonElement['type'] {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const computedStyle = window.getComputedStyle(element);

    // 图片类型
    if (tagName === 'img' || tagName === 'picture' || className.includes('image')) {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      // 头像（圆形或正方形小图）
      if (
        (computedStyle.borderRadius === '50%' || parseFloat(computedStyle.borderRadius) > width / 4) &&
        width < 100 &&
        Math.abs(width - height) < 10
      ) {
        return 'avatar';
      }
      return 'image';
    }

    // 按钮类型
    if (tagName === 'button' || (tagName === 'a' && className.includes('button'))) {
      return 'button';
    }

    // 文本类型
    if (
      tagName === 'p' ||
      tagName === 'span' ||
      tagName === 'h1' ||
      tagName === 'h2' ||
      tagName === 'h3' ||
      tagName === 'h4' ||
      tagName === 'h5' ||
      tagName === 'h6' ||
      tagName === 'label' ||
      tagName === 'li'
    ) {
      return 'text';
    }

    // 卡片类型（有背景、边框、阴影的容器）
    const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
    const hasBorder = computedStyle.borderWidth !== '0px';
    const hasShadow = computedStyle.boxShadow !== 'none';
    const hasPadding = parseFloat(computedStyle.paddingTop) > 0 || parseFloat(computedStyle.paddingLeft) > 0;

    if ((hasBackground || hasBorder || hasShadow) && hasPadding) {
      return 'card';
    }

    // 默认块级元素
    return 'block';
  }

  /**
   * 提取元素的布局信息
   */
  private extractElementInfo(element: HTMLElement): SkeletonElement | null {
    if (!this.isVisible(element) || !this.isInViewport(element)) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    // 过滤太小的元素
    if (rect.width < 10 || rect.height < 5) {
      return null;
    }

    const type = this.identifyElementType(element);

    // 计算相对位置
    const x = this.containerRect ? rect.left - this.containerRect.left : rect.left;
    const y = this.containerRect ? rect.top - this.containerRect.top + window.scrollY : rect.top + window.scrollY;

    return {
      type,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: rect.width,
      height: rect.height,
      borderRadius: parseFloat(computedStyle.borderRadius) || 4,
      className: element.className,
    };
  }

  /**
   * 递归扫描DOM树
   */
  private scanElement(element: HTMLElement, depth: number = 0): void {
    // 限制扫描深度，避免性能问题
    if (depth > 15) return;

    // 跳过不需要扫描的元素
    const tagName = element.tagName.toLowerCase();
    const skipTags = ['script', 'style', 'noscript', 'link', 'meta', 'head'];
    if (skipTags.includes(tagName)) return;

    // 跳过隐藏元素
    if (!this.isVisible(element)) return;

    // 叶子节点（文本、图片、按钮）- 直接生成骨架
    const isLeafNode =
      tagName === 'img' ||
      tagName === 'button' ||
      tagName === 'input' ||
      (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE);

    if (isLeafNode) {
      const info = this.extractElementInfo(element);
      if (info) {
        this.elements.push(info);
      }
      return;
    }

    // 容器节点 - 判断是否生成卡片骨架
    const computedStyle = window.getComputedStyle(element);
    const hasVisibleStyle =
      computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
      computedStyle.borderWidth !== '0px' ||
      computedStyle.boxShadow !== 'none';

    if (hasVisibleStyle && this.isInViewport(element)) {
      const info = this.extractElementInfo(element);
      if (info && info.type === 'card') {
        this.elements.push(info);
        return; // 卡片内部不再扫描
      }
    }

    // 递归扫描子元素
    Array.from(element.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        this.scanElement(child, depth + 1);
      }
    });
  }

  /**
   * 生成骨架屏配置
   */
  public generate(container: HTMLElement): SkeletonConfig {
    this.elements = [];
    this.containerRect = container.getBoundingClientRect();

    // 扫描容器内所有元素
    this.scanElement(container);

    // 去重和优化
    this.elements = this.optimizeElements(this.elements);

    return {
      elements: this.elements,
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
    };
  }

  /**
   * 优化骨架元素（去重、合并）
   */
  private optimizeElements(elements: SkeletonElement[]): SkeletonElement[] {
    // 按Y坐标排序
    elements.sort((a, b) => a.y - b.y);

    // 去除重叠的元素
    const optimized: SkeletonElement[] = [];
    for (const element of elements) {
      const isOverlapping = optimized.some((existing) => {
        return (
          Math.abs(existing.x - element.x) < 5 &&
          Math.abs(existing.y - element.y) < 5 &&
          Math.abs(existing.width - element.width) < 10 &&
          Math.abs(existing.height - element.height) < 10
        );
      });

      if (!isOverlapping) {
        optimized.push(element);
      }
    }

    return optimized;
  }
}

// ========== 智能骨架屏组件 ==========

interface AutoSkeletonProps {
  /**
   * 加载状态
   */
  loading: boolean;

  /**
   * 子内容（真实内容）
   */
  children: React.ReactNode;

  /**
   * 缓存键（用于localStorage）
   */
  cacheKey: string;

  /**
   * 最小加载时间（毫秒）- 避免骨架屏闪现
   */
  minLoadingTime?: number;
}

export const AutoSkeleton: React.FC<AutoSkeletonProps> = ({ loading, children, cacheKey, minLoadingTime = 800 }) => {
  const { level } = useAnimationEngine();
  const [skeletonConfig, setSkeletonConfig] = useState<SkeletonConfig | null>(null);
  const [isShowingLoading, setIsShowingLoading] = useState(loading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  // 管理最小加载时间
  useEffect(() => {
    if (loading) {
      if (loadingStartTime === null) {
        setLoadingStartTime(Date.now());
        setIsShowingLoading(true);
      }
    } else {
      if (loadingStartTime !== null) {
        const elapsedTime = Date.now() - loadingStartTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        if (remainingTime > 0) {
          const timer = setTimeout(() => {
            setIsShowingLoading(false);
            setLoadingStartTime(null);
          }, remainingTime);
          return () => clearTimeout(timer);
        } else {
          setIsShowingLoading(false);
          setLoadingStartTime(null);
        }
      }
    }
  }, [loading, loadingStartTime, minLoadingTime]);

  // 加载缓存的骨架屏配置
  useEffect(() => {
    if (isShowingLoading && !skeletonConfig) {
      const config = storage.local.get<SkeletonConfig>(`skeleton-${cacheKey}`);
      if (config) {
        setSkeletonConfig(config);
      }
    }
  }, [cacheKey, isShowingLoading, skeletonConfig]);

  // 生成并缓存骨架屏配置（内容加载完成后）
  useEffect(() => {
    if (!loading && contentRef.current && !hasGeneratedRef.current) {
      // 等待内容渲染完成
      const timer = setTimeout(() => {
        if (contentRef.current && !hasGeneratedRef.current) {
          const generator = new SkeletonGenerator();
          const config = generator.generate(contentRef.current);

          // 缓存配置
          storage.local.set(`skeleton-${cacheKey}`, config);
          hasGeneratedRef.current = true;
        }
      }, 1000); // 延迟1秒确保内容完全渲染

      return () => clearTimeout(timer);
    }
  }, [loading, cacheKey]);

  // 显示骨架屏
  if (isShowingLoading && skeletonConfig) {
    return (
      <SkeletonContainer style={{ minHeight: `${skeletonConfig.containerHeight}px` }}>
        {skeletonConfig.elements.map((element, index) => (
          <SkeletonElement
            key={index}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            borderRadius={element.borderRadius}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.02, duration: 0.3 }}
          />
        ))}
      </SkeletonContainer>
    );
  }

  // 显示真实内容
  return <div ref={contentRef}>{children}</div>;
};

export default AutoSkeleton;
