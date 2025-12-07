import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const StyledImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

/**
 * 懒加载图片组件
 * 使用 Intersection Observer API 实现图片懒加载
 *
 * @example
 * ```tsx
 * <LazyImage
 *   src="/images/photo.jpg"
 *   alt="描述"
 *   placeholder="/images/placeholder.svg"
 *   style={{ width: '100%', height: '300px' }}
 * />
 * ```
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  className,
  style,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 如果 src 为空，不渲染任何内容
  if (!src) {
    return null;
  }

  useEffect(() => {
    // 如果浏览器不支持 IntersectionObserver，直接加载图片
    if (!('IntersectionObserver' in window)) {
      setImageSrc(src);
      return;
    }

    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          // 开始加载后断开观察
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    // 开始观察
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    // 清理
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  return (
    <ImageContainer className={className} style={style}>
      {!isLoaded && !hasError && <Placeholder />}

      <StyledImage
        ref={imgRef}
        src={imageSrc || src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </ImageContainer>
  );
};

export default LazyImage;
