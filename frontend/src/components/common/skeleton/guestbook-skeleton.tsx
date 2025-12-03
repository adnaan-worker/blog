import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import { SkeletonContainer, SkeletonAvatar } from './skeleton';

/**
 * 留言板骨架屏 - 瀑布流便签风格
 */

const MasonryContainer = styled(SkeletonContainer)`
  column-count: 3;
  column-gap: 1.5rem;
  display: block;
  background: transparent;

  @media (max-width: 1200px) {
    column-count: 2;
  }

  @media (max-width: 768px) {
    column-count: 1;
  }
`;

// 骨架屏 shimmer 动画样式
const shimmerStyle = css`
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

const CardItem = styled(motion.div)`
  break-inside: avoid;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
`;

const ContentColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// 模拟文本行
const SkeletonLine = styled.div<{ width?: string; height?: string }>`
  ${shimmerStyle}
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '1rem'};
  border-radius: 4px;
`;

// 模拟气泡
const BubblePlaceholder = styled.div<{ height: string }>`
  ${shimmerStyle}
  width: 100%;
  height: ${(props) => props.height};
  border-radius: 4px 16px 16px 16px;
  margin-top: 0.2rem;
  opacity: 0.6;
`;

// 模拟博主回复
const ReplyPlaceholder = styled.div`
  ${shimmerStyle}
  width: 70%;
  height: 50px;
  border-radius: 16px 4px 16px 16px;
  opacity: 0.5;
`;

export const GuestbookSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const { variants } = useAnimationEngine();

  return (
    <MasonryContainer>
      {Array.from({ length: count }).map((_, index) => (
        <CardItem key={index} custom={index} initial="hidden" animate="visible" variants={variants.listItem}>
          {/* 头像 */}
          <SkeletonAvatar size={40} style={{ marginTop: '2px' }} />

          <ContentColumn>
            {/* 用户名 + 时间 */}
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.2rem', alignItems: 'center' }}>
              <SkeletonLine width="80px" height="1rem" />
              <SkeletonLine width="60px" height="0.8rem" />
            </div>

            {/* 气泡内容 */}
            <BubblePlaceholder height={['60px', '80px', '100px', '120px'][index % 4]} />

            {/* 模拟博主回复 (随机出现) */}
            {index % 2 === 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.8rem',
                  marginTop: '0.8rem',
                  alignItems: 'flex-start',
                  flexDirection: 'row-reverse',
                }}
              >
                <SkeletonAvatar size={32} />
                <ReplyPlaceholder />
              </div>
            )}
          </ContentColumn>
        </CardItem>
      ))}
    </MasonryContainer>
  );
};

export default GuestbookSkeleton;
