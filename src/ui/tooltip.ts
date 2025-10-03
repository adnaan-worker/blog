import { createRoot } from 'react-dom/client';
import React from 'react';
import { TooltipOptions, TooltipPlacement } from './common-types';

// 计算提示框位置
const calculatePosition = (
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
): { x: number; y: number } => {
  let x = 0;
  let y = 0;

  const gap = 8; // 提示框与目标元素的间距

  switch (placement) {
    case 'top':
      x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      y = targetRect.top - tooltipRect.height - gap;
      break;
    case 'bottom':
      x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      y = targetRect.bottom + gap;
      break;
    case 'left':
      x = targetRect.left - tooltipRect.width - gap;
      y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      break;
    case 'right':
      x = targetRect.right + gap;
      y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      break;
    default:
      x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      y = targetRect.top - tooltipRect.height - gap;
  }

  // 确保提示框不超出屏幕边界
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 水平限制
  x = Math.max(gap, Math.min(x, viewportWidth - tooltipRect.width - gap));

  // 垂直限制
  y = Math.max(gap, Math.min(y, viewportHeight - tooltipRect.height - gap));

  return { x, y };
};

// 创建简单的内联样式Tooltip组件
const TooltipComponent = (props: {
  content: React.ReactNode;
  placement: TooltipPlacement;
  maxWidth?: string;
  style: React.CSSProperties;
  onClose: () => void;
}) => {
  const { content, style, placement, maxWidth = '200px' } = props;

  // 计算箭头样式
  let arrowStyle: React.CSSProperties = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--bg-primary)',
    transform: 'rotate(45deg)',
  };

  switch (placement) {
    case 'top':
      arrowStyle = { ...arrowStyle, bottom: '-4px', left: '50%', marginLeft: '-4px' };
      break;
    case 'bottom':
      arrowStyle = { ...arrowStyle, top: '-4px', left: '50%', marginLeft: '-4px' };
      break;
    case 'left':
      arrowStyle = { ...arrowStyle, right: '-4px', top: '50%', marginTop: '-4px' };
      break;
    case 'right':
      arrowStyle = { ...arrowStyle, left: '-4px', top: '50%', marginTop: '-4px' };
      break;
  }

  // 主容器样式
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-small)',
    fontSize: '0.85rem',
    boxShadow: 'var(--shadow-lg)',
    maxWidth,
    wordWrap: 'break-word',
    pointerEvents: 'none',
    ...style,
  };

  // 自动关闭
  React.useEffect(() => {
    if (props.onClose) {
      const timer = setTimeout(props.onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [props.onClose]);

  return React.createElement('div', { style: containerStyle }, [
    content,
    React.createElement('div', { key: 'arrow', style: arrowStyle }),
  ]);
};

// 管理提示框容器与实例
let activeTooltip: {
  root: ReturnType<typeof createRoot>;
  container: HTMLDivElement;
  timerId?: NodeJS.Timeout;
} | null = null;

// 显示提示框
export const showTooltip = (
  element: HTMLElement,
  content: React.ReactNode,
  options?: {
    placement?: TooltipPlacement;
    maxWidth?: string;
    duration?: number;
  },
): (() => void) => {
  // 先移除之前的提示框
  if (activeTooltip) {
    if (activeTooltip.timerId) {
      clearTimeout(activeTooltip.timerId);
    }
    activeTooltip.root.unmount();
    if (activeTooltip.container.parentNode) {
      activeTooltip.container.parentNode.removeChild(activeTooltip.container);
    }
    activeTooltip = null;
  }

  // 创建新的提示框容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建React根
  const root = createRoot(container);

  // 关闭函数
  const close = () => {
    if (activeTooltip) {
      activeTooltip.root.unmount();
      if (activeTooltip.container.parentNode) {
        activeTooltip.container.parentNode.removeChild(activeTooltip.container);
      }
      activeTooltip = null;
    }
  };

  // 获取元素位置
  const targetRect = element.getBoundingClientRect();

  // 创建一个临时元素来获取tooltip的大小
  const tempTooltip = document.createElement('div');
  tempTooltip.style.position = 'absolute';
  tempTooltip.style.visibility = 'hidden';
  tempTooltip.style.padding = '0.5rem 0.75rem';
  tempTooltip.style.maxWidth = options?.maxWidth || '200px';
  tempTooltip.innerHTML = typeof content === 'string' ? content : 'Tooltip';
  document.body.appendChild(tempTooltip);
  const tooltipRect = tempTooltip.getBoundingClientRect();
  document.body.removeChild(tempTooltip);

  // 计算位置
  const position = calculatePosition(targetRect, tooltipRect, options?.placement || 'top');

  // 渲染提示框
  root.render(
    React.createElement(TooltipComponent, {
      content: content,
      placement: options?.placement || 'top',
      maxWidth: options?.maxWidth,
      style: { left: position.x, top: position.y },
      onClose: close,
    }),
  );

  // 存储活动提示框信息
  const duration = options?.duration === undefined ? 3000 : options.duration;
  activeTooltip = {
    root,
    container,
    timerId: duration !== 0 ? setTimeout(close, duration) : undefined,
  };

  // 返回关闭函数
  return close;
};

// 在元素上显示提示
const tooltip = {
  show: showTooltip,

  hide: () => {
    if (activeTooltip) {
      if (activeTooltip.timerId) {
        clearTimeout(activeTooltip.timerId);
      }
      activeTooltip.root.unmount();
      if (activeTooltip.container.parentNode) {
        activeTooltip.container.parentNode.removeChild(activeTooltip.container);
      }
      activeTooltip = null;
    }
  },
};

export default tooltip;
