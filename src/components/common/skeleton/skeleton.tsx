import styled from '@emotion/styled';

/**
 * 骨架屏基础组件
 * 提供各种骨架元素的原子组件
 */

// ========== 基础骨架容器 ==========

export const SkeletonContainer = styled.div`
  width: 100%;
  background: var(--bg-primary);
`;

// ========== 骨架元素基础样式 ==========

const skeletonBaseStyles = `
  background: linear-gradient(
    90deg,
    var(--skeleton-bg, rgba(229, 231, 235, 0.5)) 0%,
    var(--skeleton-highlight, rgba(229, 231, 235, 0.8)) 50%,
    var(--skeleton-bg, rgba(229, 231, 235, 0.5)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  [data-theme='dark'] & {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    background-size: 200% 100%;
  }
`;

// ========== 骨架元素组件 ==========

// 标题骨架
export const SkeletonTitle = styled.div<{ width?: string }>`
  ${skeletonBaseStyles}
  height: 2rem;
  width: ${(props) => props.width || '60%'};
  border-radius: 8px;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    height: 1.5rem;
    width: ${(props) => props.width || '80%'};
  }
`;

// 文本行骨架
export const SkeletonText = styled.div<{ width?: string }>`
  ${skeletonBaseStyles}
  height: 1rem;
  width: ${(props) => props.width || '100%'};
  border-radius: 4px;
  margin-bottom: 0.75rem;
`;

// 头像骨架
export const SkeletonAvatar = styled.div<{ size?: number }>`
  ${skeletonBaseStyles}
  width: ${(props) => props.size || 40}px;
  height: ${(props) => props.size || 40}px;
  border-radius: 50%;
  flex-shrink: 0;
`;

// 图片骨架
export const SkeletonImage = styled.div<{ height?: string; aspectRatio?: string }>`
  ${skeletonBaseStyles}
  width: 100%;
  height: ${(props) => props.height || 'auto'};
  aspect-ratio: ${(props) => props.aspectRatio || '16/9'};
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

// 卡片骨架
export const SkeletonCard = styled.div`
  ${skeletonBaseStyles}
  width: 100%;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
`;

// 按钮骨架
export const SkeletonButton = styled.div<{ width?: string }>`
  ${skeletonBaseStyles}
  height: 2.5rem;
  width: ${(props) => props.width || '120px'};
  border-radius: 8px;
`;

// 徽章骨架
export const SkeletonBadge = styled.div`
  ${skeletonBaseStyles}
  height: 1.5rem;
  width: 60px;
  border-radius: 12px;
  display: inline-block;
  margin-right: 0.5rem;
`;

// 列表项骨架
export const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`;

// 元数据骨架（发布时间、阅读量等）
export const SkeletonMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
`;

// 标签骨架容器
export const SkeletonTags = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1rem 0;
`;

// ========== 工具函数 ==========

/**
 * 生成随机宽度（用于文本行）
 */
export const randomWidth = (min: number = 60, max: number = 95) => {
  return `${Math.floor(Math.random() * (max - min + 1)) + min}%`;
};
