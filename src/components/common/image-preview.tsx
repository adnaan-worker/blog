import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiDownload, FiMaximize2 } from 'react-icons/fi';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

// 图片容器
const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    .preview-overlay {
      opacity: 1;
    }
  }
`;

// 预览覆盖层
const PreviewOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);

  .preview-icon {
    color: white;
    background: rgba(255, 255, 255, 0.2);
    padding: 12px;
    border-radius: 50%;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
`;

// 图片元素
const Image = styled.img`
  width: 100%;
  height: auto;
  display: block;
  transition: all 0.3s ease;
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
  position: absolute;
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

  // 简单有效的页面滚动阻止
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

      // 阻止页面滚动的最简单有效方法
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClick={onClose} onWheel={handleWheel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <PreviewImage
          src={src}
          alt={alt}
          scale={scale}
          rotation={rotation}
          translateX={translateX}
          translateY={translateY}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          draggable={false}
        />

        <ControlBar>
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
          <ControlButton onClick={onClose} title="关闭 (Esc)">
            <FiX size={16} />
          </ControlButton>
        </ControlBar>

        {alt && <ImageInfo>{alt}</ImageInfo>}
      </ModalContent>
    </ModalBackdrop>
  );
};

// 主组件
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, className, style, onClick }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleImageClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      setIsPreviewOpen(true);
    }
  }, [onClick]);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return (
    <>
      <ImageContainer className={className} style={style} onClick={handleImageClick}>
        <Image src={src} alt={alt} loading="lazy" />
        <PreviewOverlay className="preview-overlay">
          <div className="preview-icon">
            <FiMaximize2 size={20} />
          </div>
        </PreviewOverlay>
      </ImageContainer>

      <PreviewModal isOpen={isPreviewOpen} onClose={handleClosePreview} src={src} alt={alt} />
    </>
  );
};

export default ImagePreview;
