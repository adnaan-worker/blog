import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import { SkeletonContainer, SkeletonText, SkeletonAvatar, SkeletonButton, randomWidth } from './skeleton';

/**
 * 评论区骨架屏
 */

const CommentItem = styled(motion.div)`
  display: flex;
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
`;

export const CommentSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const { variants } = useAnimationEngine();

  return (
    <SkeletonContainer>
      {Array.from({ length: count }).map((_, index) => (
        <CommentItem key={index} custom={index} initial="hidden" animate="visible" variants={variants.listItem}>
          {/* 头像 */}
          <SkeletonAvatar size={40} />

          {/* 评论内容 */}
          <CommentContent>
            {/* 用户名 + 时间 */}
            <CommentHeader>
              <SkeletonText width="120px" />
              <SkeletonText width="80px" />
            </CommentHeader>

            {/* 评论文本 */}
            <div style={{ marginBottom: '0.75rem' }}>
              <SkeletonText width={randomWidth()} />
              <SkeletonText width={randomWidth(60, 85)} />
            </div>

            {/* 操作按钮 */}
            <CommentActions>
              <SkeletonButton width="60px" />
              <SkeletonButton width="60px" />
            </CommentActions>
          </CommentContent>
        </CommentItem>
      ))}
    </SkeletonContainer>
  );
};

export default CommentSkeleton;
