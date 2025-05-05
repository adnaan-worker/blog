import React from 'react';
import styled from '@emotion/styled';
import { FiHeart, FiBookmark, FiShare2 } from 'react-icons/fi';

// 目录容器 - 使用sticky定位实现吸顶效果
const TocContainer = styled.div`
  width: 280px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 12px;
  transition: all 0.3s ease;
  position: relative;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.2);
    border-radius: 4px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.4);
  }

  @media (max-width: 860px) {
    position: relative;
    top: 0;
    width: 100%;
    max-height: 300px;
    margin-bottom: 2rem;
  }
`;

// 目录列表容器
const TocList = styled.div`
  position: relative;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

// 目录项
const TocItem = styled.div<{ active: boolean }>`
  position: relative;
  padding: 4px 0 4px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* 选中状态时显示短线 */
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: ${props => props.active ? '8px' : '0'};
    height: 2px;
    background-color: var(--accent-color);
    transition: width 0.2s ease;
  }

  &:hover:before {
    width: 8px;
    background-color: var(--accent-color);
  }

  span {
    font-size: 0.85rem;
    color: ${(props) => (props.active ? 'var(--text-primary)' : 'var(--text-secondary)')};
    font-weight: ${(props) => (props.active ? '500' : 'normal')};
    transition: all 0.2s ease;
    display: block;
    line-height: 1.4;
    position: relative;
    z-index: 1;
  }

  &:hover span {
    color: var(--text-primary);
    transform: translateX(2px);
  }

  /* 活跃项的背景效果 */
  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: ${(props) => (props.active ? '100%' : '0%')};
    height: 100%;
    background-color: ${(props) => (props.active ? 'rgba(81, 131, 245, 0.04)' : 'transparent')};
    border-radius: 4px;
    z-index: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:after {
    width: 100%;
    background-color: rgba(81, 131, 245, 0.04);
  }
`;

// 社交操作按钮容器
const SocialActionContainer = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding: 1rem 0 0.5rem;
  border-top: 1px solid var(--border-color);
  justify-content: space-between;

  @media (max-width: 860px) {
    justify-content: space-around;
  }
`;

// 操作按钮
const ActionButton = styled.button<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  flex: 1;

  .icon-wrapper {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: ${(props) => (props.active ? 'rgba(81, 131, 245, 0.1)' : 'transparent')};
    transition: all 0.2s ease;
  }

  svg {
    color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
    transition: all 0.2s ease;
  }

  span {
    font-size: 0.75rem;
    color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
    font-weight: ${(props) => (props.active ? '500' : 'normal')};
    transition: all 0.2s ease;
  }

  &:hover {
    background-color: rgba(81, 131, 245, 0.05);

    .icon-wrapper {
      background-color: rgba(81, 131, 245, 0.12);
      transform: scale(1.1);
    }

    svg {
      color: var(--accent-color);
    }

    span {
      color: var(--accent-color);
    }
  }

  &:active .icon-wrapper {
    transform: scale(0.95);
  }
`;

interface ArticleTocProps {
  headings: { id: string; text: string }[];
  activeHeading: string;
  readingProgress: number;
  onHeadingClick: (id: string) => void;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
}

// 简化的TOC组件
const ArticleToc: React.FC<ArticleTocProps> = ({
  headings,
  activeHeading,
  readingProgress,
  onHeadingClick,
  liked,
  bookmarked,
  onLike,
  onBookmark,
  onShare,
}) => {
  return (
    <TocContainer>
      <TocList>
        {headings.length > 0 ? (
          headings.map((heading) => (
            <TocItem
              key={heading.id}
              active={activeHeading === heading.id}
              onClick={() => onHeadingClick(heading.id)}
            >
              <span>{heading.text}</span>
            </TocItem>
          ))
        ) : (
          <div style={{ padding: '4px 0 4px 16px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            文章暂无目录
          </div>
        )}
      </TocList>

      {/* 社交分享按钮 */}
      <SocialActionContainer>
        <ActionButton active={liked} onClick={onLike}>
          <div className="icon-wrapper">
            <FiHeart size={18} />
          </div>
          <span>喜欢</span>
        </ActionButton>

        <ActionButton active={bookmarked} onClick={onBookmark}>
          <div className="icon-wrapper">
            <FiBookmark size={18} />
          </div>
          <span>收藏</span>
        </ActionButton>

        <ActionButton onClick={onShare}>
          <div className="icon-wrapper">
            <FiShare2 size={18} />
          </div>
          <span>分享</span>
        </ActionButton>
      </SocialActionContainer>
    </TocContainer>
  );
};

export default ArticleToc; 