import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { TooltipPlacement } from '@/ui/common-types';

// 包装器组件用于跟踪鼠标事件
const TooltipWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

// 提示框容器
const TooltipContent = styled.div<{ placement: TooltipPlacement }>`
  position: fixed;
  z-index: 9999;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-small);
  font-size: 0.85rem;
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
  pointer-events: none;
  max-width: 300px;
  word-wrap: break-word;
  transition:
    opacity 0.15s,
    transform 0.15s;
  opacity: 1;
  transform: scale(1);

  &.entering {
    opacity: 0;
    transform: scale(0.8);
  }

  &.exiting {
    opacity: 0;
  }

  [data-theme='dark'] & {
    background-color: var(--bg-secondary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
`;

// 箭头组件
const TooltipArrow = styled.div<{ placement: TooltipPlacement }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--bg-primary);
  transform: rotate(45deg);

  ${({ placement }) => {
    switch (placement) {
      case 'top':
        return `
          bottom: -4px;
          left: 50%;
          margin-left: -4px;
        `;
      case 'bottom':
        return `
          top: -4px;
          left: 50%;
          margin-left: -4px;
        `;
      case 'left':
        return `
          right: -4px;
          top: 50%;
          margin-top: -4px;
        `;
      case 'right':
        return `
          left: -4px;
          top: 50%;
          margin-top: -4px;
        `;
      default:
        return '';
    }
  }}

  [data-theme='dark'] & {
    background-color: var(--bg-secondary);
  }
`;

// 计算提示框位置
const calculatePosition = (
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
): { top: number; left: number } => {
  let top = 0;
  let left = 0;

  const gap = 8; // 提示框与目标元素的间距

  switch (placement) {
    case 'top':
      top = targetRect.top - tooltipRect.height - gap;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - tooltipRect.width - gap;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + gap;
      break;
  }

  // 确保提示框不超出屏幕边界
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 水平限制
  left = Math.max(gap, Math.min(left, viewportWidth - tooltipRect.width - gap));

  // 垂直限制
  top = Math.max(gap, Math.min(top, viewportHeight - tooltipRect.height - gap));

  return { top, left };
};

// 组件接口
export interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  children: React.ReactElement;
  delay?: number;
}

// Portal组件用于将提示框渲染到body
const TooltipPortal: React.FC<{
  content: string;
  targetRect: DOMRect | null;
  placement: TooltipPlacement;
  isVisible: boolean;
}> = ({ content, targetRect, placement, isVisible }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isReady, setIsReady] = useState(false);
  const [animationState, setAnimationState] = useState('entering');

  useEffect(() => {
    if (isVisible) {
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState(''), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
    }
  }, [isVisible]);

  useEffect(() => {
    if (tooltipRef.current && targetRect) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const newPosition = calculatePosition(targetRect, tooltipRect, placement);
      setPosition(newPosition);
      setIsReady(true);
    }
  }, [tooltipRef, targetRect, placement]);

  if (!isVisible || !targetRect) return null;

  return createPortal(
    <TooltipContent
      ref={tooltipRef}
      placement={placement}
      className={animationState}
      style={{
        top: position.top,
        left: position.left,
        visibility: isReady ? 'visible' : 'hidden',
      }}
    >
      {content}
      <TooltipArrow placement={placement} />
    </TooltipContent>,
    document.body,
  );
};

// Tooltip组件
export const Tooltip: React.FC<TooltipProps> = ({ content, placement = 'top', children, delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 显示提示框
  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();

      const showFn = () => {
        setTargetRect(rect);
        setIsVisible(true);
      };

      if (delay) {
        timeoutRef.current = setTimeout(showFn, delay);
      } else {
        showFn();
      }
    }
  };

  // 隐藏提示框
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // 更新位置处理
  const handlePositionUpdate = () => {
    if (isVisible && wrapperRef.current) {
      setTargetRect(wrapperRef.current.getBoundingClientRect());
    }
  };

  // 监听滚动和调整大小事件
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', handlePositionUpdate, true);
      window.addEventListener('resize', handlePositionUpdate);
    }

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isVisible]);

  return (
    <>
      <TooltipWrapper
        ref={wrapperRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </TooltipWrapper>

      <TooltipPortal content={content} targetRect={targetRect} placement={placement} isVisible={isVisible} />
    </>
  );
};

export default Tooltip;
