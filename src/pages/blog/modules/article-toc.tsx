import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiHeart, FiBookmark, FiShare2 } from 'react-icons/fi';
import { useAnimationEngine } from '@/utils/ui/animation';

const SidebarWrapper = styled(motion.div)`
  position: relative;
  width: 280px;
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (max-width: 860px) {
    width: 100%;
  }
`;

// 目录容器
const TocContainer = styled.div`
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  transition: all 0.3s ease;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--accent-color-alpha);
    border-radius: 4px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(var(--accent-rgb), 0.4);
  }

  @media (max-width: 860px) {
    max-height: 300px;
  }
`;

// 工具栏容器 - 固定在底部左侧
const ToolbarContainer = styled.div<{ isBottom: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: auto;
  transform: ${(props) => (props.isBottom ? 'rotate(-90deg)' : 'rotate(0deg)')};
  transform-origin: 20px 20px; /* 以第一个按钮中心（40px/2 = 20px）为旋转点 */
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 860px) {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    transform: none;
  }
`;

// 分隔线
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
`;

// 环形进度条容器
const CircularProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding: 4px 0 4px 16px;
`;

// 环形进度条 SVG
const CircularProgress = styled.svg`
  transform: rotate(-90deg);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

// 进度文本（在圆圈后面）
const ProgressText = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
`;

// 工具按钮
const ToolButton = styled.button<{ active?: boolean; isBottom?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${(props) => (props.active ? 'var(--accent-color-alpha)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  /* 图标容器 - 保持图标摆正 */
  svg {
    transform: ${(props) => (props.isBottom ? 'rotate(90deg)' : 'rotate(0deg)')};
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* 添加波纹效果背景 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--accent-color);
    opacity: 0;
    transform: scale(0);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
    transform: scale(1.08);
  }

  &:hover::before {
    opacity: 0.1;
    transform: scale(1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 徽章（用于点赞数等）
const Badge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--accent-color);
  color: white;
  font-size: 0.55rem;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes badge-pop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

// 目录列表容器
const TocList = styled.div`
  position: relative;
  overflow-x: hidden;
`;

// 目录项
const TocItem = styled.div<{ active: boolean; level: number }>`
  position: relative;
  padding: 4px 0 4px ${(props) => 16 + (props.level - 2) * 16}px; /* 根据层级添加缩进 */
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 使用统一的缓动函数 */

  /* 选中状态时显示短线 */
  &:before {
    content: '';
    position: absolute;
    left: ${(props) => (props.level - 2) * 16}px; /* 短线位置也跟随缩进 */
    top: 50%;
    transform: translateY(-50%);
    width: ${(props) => (props.active ? '8px' : '0')};
    height: 2px;
    background-color: var(--accent-color);
    transition:
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease;
    opacity: ${(props) => (props.active ? '1' : '0')};
  }

  &:hover:before {
    width: 8px;
    opacity: 1;
    background-color: var(--accent-color);
  }

  span {
    font-size: ${(props) =>
      props.level === 2 ? '0.85rem' : props.level === 3 ? '0.82rem' : '0.8rem'}; /* 不同层级不同字号 */
    color: ${(props) => (props.active ? 'var(--text-primary)' : 'var(--text-secondary)')};
    font-weight: ${(props) => (props.active ? '500' : props.level === 2 ? '500' : 'normal')}; /* h2 加粗 */
    transition:
      color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s ease,
      opacity 0.3s ease;
    display: block;
    line-height: 1.4;
    position: relative;
    z-index: 1;
    opacity: ${(props) => (props.level > 3 ? 0.85 : 1)}; /* 深层级稍微透明 */
  }

  &:hover span {
    color: var(--text-primary);
    transform: translateX(2px);
    opacity: 1;
  }
`;

interface ArticleTocProps {
  headings: { id: string; text: string; level: number }[];
  activeHeading: string;
  readingProgress: number;
  onHeadingClick?: (id: string) => void;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
}

const ArticleToc: React.FC<ArticleTocProps> = memo(
  ({ headings, activeHeading, readingProgress, onHeadingClick, liked, bookmarked, onLike, onBookmark, onShare }) => {
    const { variants } = useAnimationEngine();
    const [isBottom, setIsBottom] = useState(false);

    const checkIfBottom = useCallback(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const distanceToBottom = documentHeight - (scrollTop + windowHeight);
      setIsBottom(distanceToBottom < 200);
    }, []);

    useEffect(() => {
      checkIfBottom();
      window.addEventListener('scroll', checkIfBottom, { passive: true });
      return () => window.removeEventListener('scroll', checkIfBottom);
    }, [checkIfBottom]);

    // 计算环形进度条参数
    const radius = 5.5; // 圆的半径（14px / 2 - 线条宽度）
    const circumference = 2 * Math.PI * radius; // 圆的周长
    const strokeDashoffset = circumference - (readingProgress / 100) * circumference;

    // 使用useMemo优化渲染
    const renderedHeadings = useMemo(() => {
      if (headings.length === 0) {
        return (
          <div style={{ padding: '4px 0 4px 16px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            文章暂无目录
          </div>
        );
      }

      return headings.map((heading) => (
        <TocItem
          key={heading.id}
          active={activeHeading === heading.id}
          level={heading.level}
          onClick={() => onHeadingClick?.(heading.id)}
        >
          <span>{heading.text}</span>
        </TocItem>
      ));
    }, [headings, activeHeading, onHeadingClick]);

    return (
      <SidebarWrapper initial="hidden" animate="visible" variants={variants.fadeIn}>
        {/* 顶部：目录 */}
        <TocContainer>
          <TocList>{renderedHeadings}</TocList>
        </TocContainer>

        {/* 分隔线 */}
        <Divider />

        {/* 中间：环形阅读进度 */}
        <CircularProgressContainer>
          <CircularProgress>
            {/* 背景圆 */}
            <circle cx="7" cy="7" r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth="1.5" />
            {/* 进度圆 */}
            <circle
              cx="7"
              cy="7"
              r={radius}
              fill="none"
              stroke="var(--accent-color)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </CircularProgress>
          <ProgressText>{readingProgress}%</ProgressText>
        </CircularProgressContainer>

        {/* 底部：工具按钮 */}
        <ToolbarContainer isBottom={isBottom}>
          <ToolButton active={liked} isBottom={isBottom} onClick={onLike} aria-label="点赞" title="点赞">
            <FiHeart size={18} fill={liked ? 'currentColor' : 'none'} />
            {liked && <Badge>1</Badge>}
          </ToolButton>

          <ToolButton active={bookmarked} isBottom={isBottom} onClick={onBookmark} aria-label="收藏" title="收藏">
            <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          </ToolButton>

          <ToolButton isBottom={isBottom} onClick={onShare} aria-label="分享" title="分享">
            <FiShare2 size={18} />
          </ToolButton>
        </ToolbarContainer>
      </SidebarWrapper>
    );
  },
);

// 添加显示名称以便于调试
ArticleToc.displayName = 'ArticleToc';

export default ArticleToc;
