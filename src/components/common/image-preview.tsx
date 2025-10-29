import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiDownload, FiMaximize2, FiAlertCircle } from 'react-icons/fi';
import { scrollLock } from '@/utils/scroll-lock';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  width?: number;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

// 图片容器 - 使用 Grid 布局，避免 position 冲突
const ImageContainer = styled.span<{ customWidth?: number; containerHeight?: number }>`
  /* 使用 Grid 布局，所有子元素占据同一个单元格，实现层叠效果 */
  display: inline-grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;
  background: transparent;
  vertical-align: middle;

  /* 容器宽度 - 默认占满父容器 */
  ${(props) => (props.customWidth ? `width: min(${props.customWidth}px, 100%);` : 'width: 100%;')}

  /* 容器高度 - 带平滑过渡 */
  height: ${(props) => `${props.containerHeight}px`};
  min-height: 80px; /* 确保骨架屏有足够空间显示 */
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  /* 所有直接子元素都占据同一个 grid 单元格，实现层叠 */
  & > * {
    grid-column: 1;
    grid-row: 1;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    .preview-overlay {
      opacity: 1;
    }
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    width: 100%;
    height: ${(props) => `${props.containerHeight}px`};
    min-height: 60px;
  }
`;

// 预览覆盖层 - 使用 Grid 层叠，不需要绝对定位
const PreviewOverlay = styled.span`
  /* Grid 布局会自动处理层叠 */
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
  z-index: 2; /* 确保在图片上方 */

  .preview-icon {
    color: white;
    background: rgba(255, 255, 255, 0.2);
    padding: 12px;
    border-radius: 50%;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// 骨架屏加载动画 - 更平滑的流光效果
const shimmer = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.9;
    }
  }
`;

// 加载骨架屏 - 使用 Grid 层叠
const LoadingSkeleton = styled.span`
  ${shimmer}
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%);
  background-size: 1000px 100%;
  animation:
    shimmer 2.5s infinite ease-in-out,
    pulse 2s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  z-index: 1; /* 在图片上方 */

  /* 深色模式优化 */
  [data-theme='dark'] & {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    background-size: 1000px 100%;
    color: var(--text-tertiary);
  }
`;

// 错误提示 - 使用 Grid 层叠
const ErrorMessage = styled.span`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 59, 48, 0.05);
  color: #ff3b30;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px dashed rgba(255, 59, 48, 0.3);
  z-index: 1; /* 在图片上方 */

  svg {
    font-size: 1.5rem;
    opacity: 0.8;
  }

  /* 深色模式优化 */
  [data-theme='dark'] & {
    background: rgba(255, 59, 48, 0.1);
    border-color: rgba(255, 59, 48, 0.4);
  }
`;

// 图片元素 - 使用 Grid 层叠
const Image = styled.img<{ isLoaded?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持长宽比 */
  display: block;
  z-index: 0; /* 在底层 */

  /* 添加特定类名，用于CSS排除 */
  &.image-preview-img {
    /* 标识为预览组件的图片 */
  }

  /* 加载动画：从透明到不透明，带缓动效果 */
  opacity: ${(props) => (props.isLoaded ? 1 : 0)};
  transform: ${(props) => (props.isLoaded ? 'scale(1)' : 'scale(0.98)')};
  transition:
    opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

// 模态框背景
const ModalBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
`;

// 模态框内容
const ModalContent = styled.div`
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 预览图片
const PreviewImage = styled.img<{
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
}>`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform: scale(${(props) => props.scale}) rotate(${(props) => props.rotation}deg)
    translate(${(props) => props.translateX}px, ${(props) => props.translateY}px);
  transition: transform 0.3s ease;
  cursor: ${(props) => (props.scale > 1 ? 'grab' : 'default')};
  user-select: none;

  &:active {
    cursor: ${(props) => (props.scale > 1 ? 'grabbing' : 'default')};
  }
`;

// 控制栏
const ControlBar = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

// 控制按钮
const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 图片信息
const ImageInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 12px 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
  max-width: 300px;
`;

// 预览模态框组件
const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, src, alt }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasError, setHasError] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(src);

  // 处理预览图片加载错误
  const handlePreviewError = useCallback(() => {
    setHasError(true);
  }, []);

  // 当 src 改变时重置状态
  useEffect(() => {
    setHasError(false);
    setPreviewSrc(src);
  }, [src]);

  // 重置状态
  const resetTransform = useCallback(() => {
    setScale(1);
    setRotation(0);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // 缩放
  const handleZoom = useCallback((delta: number) => {
    setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  // 旋转
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // 下载图片
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src, alt]);

  // 鼠标拖拽
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
      }
    },
    [scale, translateX, translateY],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && scale > 1) {
        setTranslateX(e.clientX - dragStart.x);
        setTranslateY(e.clientY - dragStart.y);
      }
    },
    [isDragging, scale, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoom(0.2);
          break;
        case '-':
          handleZoom(-0.2);
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
        case '0':
          resetTransform();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoom, handleRotate, resetTransform]);

  // 鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 滚轮缩放 - 在整个模态框中都生效
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isOpen) {
        e.preventDefault(); // 始终阻止默认的页面滚动行为
        e.stopPropagation(); // 阻止事件冒泡
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
      }
    },
    [handleZoom, isOpen],
  );

  // 重置状态当模态框打开时
  useEffect(() => {
    if (isOpen) {
      resetTransform();
    }
  }, [isOpen, resetTransform]);

  // 页面滚动阻止和键盘事件处理
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        isOpen &&
        (e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'PageUp' ||
          e.key === 'PageDown' ||
          e.key === 'Home' ||
          e.key === 'End')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (isOpen) {
      // 阻止键盘滚动
      document.addEventListener('keydown', handleGlobalKeyDown, { capture: true });

      // 使用统一的滚动锁定管理器
      scrollLock.lock();

      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
        scrollLock.unlock();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClick={onClose} onWheel={handleWheel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {hasError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              height: '400px',
              color: '#ff3b30',
            }}
          >
            <FiAlertCircle size={48} />
            <span style={{ fontSize: '1rem' }}>图片加载失败</span>
          </div>
        ) : (
          <PreviewImage
            src={previewSrc}
            alt={alt || '图片预览'}
            scale={scale}
            rotation={rotation}
            translateX={translateX}
            translateY={translateY}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onError={handlePreviewError}
            draggable={false}
          />
        )}

        <ControlBar>
          {!hasError && (
            <>
              <ControlButton onClick={() => handleZoom(0.2)} title="放大 (+)">
                <FiZoomIn size={16} />
              </ControlButton>
              <ControlButton onClick={() => handleZoom(-0.2)} title="缩小 (-)">
                <FiZoomOut size={16} />
              </ControlButton>
              <ControlButton onClick={handleRotate} title="旋转 (R)">
                <FiRotateCw size={16} />
              </ControlButton>
              <ControlButton onClick={resetTransform} title="重置 (0)">
                <FiMaximize2 size={16} />
              </ControlButton>
              <ControlButton onClick={handleDownload} title="下载">
                <FiDownload size={16} />
              </ControlButton>
            </>
          )}
          <ControlButton onClick={onClose} title="关闭 (Esc)">
            <FiX size={16} />
          </ControlButton>
        </ControlBar>

        {alt && !hasError && <ImageInfo>{alt}</ImageInfo>}
      </ModalContent>
    </ModalBackdrop>
  );
};

// 主组件
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, className, style, onClick, width }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number>(200);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const loadStartTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // 当 src 改变时重置所有状态
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setIsLoaded(false);
    setShouldLoad(false);
    setContainerHeight(200); // 重置为骨架屏占位高度
    loadStartTimeRef.current = 0; // 重置加载时间
  }, [src]);

  // 当开始加载时记录时间
  useEffect(() => {
    if (shouldLoad && loadStartTimeRef.current === 0) {
      loadStartTimeRef.current = Date.now();
    }
  }, [shouldLoad]);

  // IntersectionObserver 懒加载 - 监听 src 变化以重新创建 observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 如果已经触发加载，不需要创建 observer
    if (shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // 提前100px开始加载
        threshold: 0, // 只要有任何部分可见就触发
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [src, shouldLoad]); // 当 src 改变或 shouldLoad 变化时重新运行

  // 处理图片加载完成
  const handleImageLoad = useCallback(() => {
    // 清理之前的定时器和RAF
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // 获取图片在页面中的实际渲染高度
    if (imgRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (imgRef.current) {
          const actualHeight = imgRef.current.offsetHeight || imgRef.current.clientHeight;
          const finalHeight = Math.max(actualHeight, 120);
          setContainerHeight(finalHeight);
        }
        rafRef.current = null;
      });
    }

    // 确保骨架屏至少显示 300ms
    const MIN_LOADING_TIME = 300;
    const elapsedTime = loadStartTimeRef.current ? Date.now() - loadStartTimeRef.current : 0;
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsLoaded(true);
      timeoutRef.current = null;
    }, remainingTime);
  }, []);

  // 处理图片加载错误
  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoading(false); // 立即停止加载状态
    // 错误提示使用合理的高度，确保"加载失败"文字清晰可见
    setContainerHeight(150);
  }, []);

  // 组件卸载时清理所有资源
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handleImageClick = useCallback(() => {
    if (hasError || isLoading) return;

    if (onClick) {
      onClick();
    } else {
      setIsPreviewOpen(true);
    }
  }, [onClick, hasError, isLoading]);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <>
      <ImageContainer
        ref={containerRef}
        className={className}
        style={style}
        customWidth={width}
        containerHeight={containerHeight}
        onClick={handleImageClick}
      >
        {/* 加载骨架屏 - 淡出动画 */}
        {isLoading && (
          <LoadingSkeleton
            style={{
              opacity: isLoading ? 1 : 0,
              transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            加载中...
          </LoadingSkeleton>
        )}

        {/* 错误提示 - 只在加载完成后显示 */}
        {!isLoading && hasError && (
          <ErrorMessage>
            <FiAlertCircle />
            <span>加载失败</span>
          </ErrorMessage>
        )}

        {/* 图片 - 只在无错误时渲染 */}
        {shouldLoad && !hasError && (
          <Image
            ref={imgRef}
            className="image-preview-img"
            src={src}
            alt={alt || '图片'}
            isLoaded={isLoaded}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* 预览覆盖层 */}
        {!hasError && !isLoading && (
          <PreviewOverlay className="preview-overlay">
            <span className="preview-icon">
              <FiMaximize2 size={20} />
            </span>
          </PreviewOverlay>
        )}
      </ImageContainer>

      {isPreviewOpen &&
        !hasError &&
        createPortal(
          <PreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} src={src} alt={alt} />,
          document.body,
        )}
    </>
  );
};

export default ImagePreview;
