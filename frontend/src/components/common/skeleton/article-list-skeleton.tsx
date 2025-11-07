import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import {
  SkeletonContainer,
  SkeletonTitle,
  SkeletonText,
  SkeletonImage,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonMeta,
  SkeletonTags,
  randomWidth,
} from './skeleton';

/**
 * 文章列表骨架屏
 * 使用 Adnaan Animation Engine 实现性能自适应动画
 */

const ArticleCard = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const ArticleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ArticleInfo = styled.div`
  flex: 1;
`;

const ArticleContent = styled.div`
  margin-bottom: 1rem;
`;

interface ArticleListSkeletonProps {
  count?: number; // 骨架卡片数量
  showImage?: boolean; // 是否显示图片骨架
}

export const ArticleListSkeleton: React.FC<ArticleListSkeletonProps> = ({ count = 3, showImage = true }) => {
  const { variants } = useAnimationEngine();

  return (
    <SkeletonContainer>
      {Array.from({ length: count }).map((_, index) => (
        <ArticleCard key={index} custom={index} initial="hidden" animate="visible" variants={variants.card}>
          {/* 头像 + 作者信息 */}
          <ArticleHeader>
            <SkeletonAvatar size={40} />
            <ArticleInfo>
              <SkeletonText width="30%" />
              <SkeletonText width="20%" />
            </ArticleInfo>
          </ArticleHeader>

          {/* 文章标题 */}
          <SkeletonTitle width="70%" />

          {/* 文章封面图 */}
          {showImage && <SkeletonImage aspectRatio="16/9" />}

          {/* 文章摘要 */}
          <ArticleContent>
            <SkeletonText width={randomWidth()} />
            <SkeletonText width={randomWidth()} />
            <SkeletonText width={randomWidth(60, 80)} />
          </ArticleContent>

          {/* 标签 */}
          <SkeletonTags>
            <SkeletonBadge />
            <SkeletonBadge />
            <SkeletonBadge />
          </SkeletonTags>

          {/* 元数据（时间、阅读量等） */}
          <SkeletonMeta>
            <SkeletonText width="100px" />
            <SkeletonText width="80px" />
            <SkeletonText width="60px" />
          </SkeletonMeta>
        </ArticleCard>
      ))}
    </SkeletonContainer>
  );
};

export default ArticleListSkeleton;
