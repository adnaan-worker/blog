import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import {
  SkeletonContainer,
  SkeletonTitle,
  SkeletonText,
  SkeletonImage,
  SkeletonMeta,
  SkeletonTags,
  randomWidth,
  SkeletonBadge,
} from './skeleton';

// 页面容器
const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// 双列布局 (匹配 ArticleLayout)
const ArticleLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 3rem;
  }
`;

// 主内容区
const MainContent = styled.div`
  min-width: 0;
`;

// 侧边栏
const Sidebar = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: block;
    position: sticky;
    top: 100px;
    align-self: start;
  }
`;

// 目录卡片骨架
const TocCard = styled.div`
  padding: 1.5rem;
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.05);
  border: 1px solid rgba(var(--accent-rgb, 99, 102, 241), 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// 导航按钮骨架
const NavSkeleton = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(var(--border-rgb, 229, 231, 235), 0.3);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavButton = styled(SkeletonContainer)`
  flex: 1;
  height: 80px;
  background: rgba(var(--text-primary-rgb), 0.03);
  border-radius: 8px;
`;

/**
 * 文章详情页骨架屏
 * 完全匹配真实 DOM 结构：双列布局 + 侧边目录
 */
export const ArticleDetailSkeleton: React.FC = () => {
  const { variants } = useAnimationEngine();

  return (
    <PageContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
      <ArticleLayout>
        {/* 左侧：主内容区 */}
        <MainContent>
          {/* 文章头部 */}
          <div style={{ marginBottom: '2rem' }}>
            <SkeletonTitle width="80%" style={{ height: '36px', marginBottom: '1rem' }} />
            <SkeletonMeta />
            <SkeletonTags style={{ marginTop: '1rem' }}>
              {[1, 2, 3].map((i) => (
                <SkeletonBadge key={i} />
              ))}
            </SkeletonTags>
          </div>

          {/* 封面图 */}
          <SkeletonImage aspectRatio="16/9" style={{ marginBottom: '2rem' }} />

          {/* 文章内容 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonText key={i} width={randomWidth(85, 100)} />
            ))}
          </div>

          {/* 代码块 */}
          <SkeletonContainer
            style={{
              width: '100%',
              height: '150px',
              marginBottom: '1.5rem',
              background: 'rgba(var(--text-primary-rgb), 0.05)',
              borderRadius: '8px',
            }}
          />

          {/* 更多内容 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonText key={i} width={randomWidth(80, 100)} />
            ))}
          </div>

          {/* 上一篇/下一篇导航 */}
          <NavSkeleton>
            <NavButton />
            <NavButton />
          </NavSkeleton>

          {/* 相关文章 */}
          <div style={{ marginTop: '2rem' }}>
            <SkeletonTitle width="120px" style={{ height: '24px', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <SkeletonText width="70%" style={{ height: '20px', marginBottom: '0.5rem' }} />
                  <SkeletonText width="90%" style={{ height: '16px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* 评论区占位 */}
          <div style={{ marginTop: '3rem' }}>
            <SkeletonTitle width="100px" style={{ height: '24px', marginBottom: '1.5rem' }} />
            <SkeletonContainer
              style={{
                width: '100%',
                height: '120px',
                background: 'rgba(var(--text-primary-rgb), 0.03)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            />
            {[1, 2].map((i) => (
              <SkeletonContainer
                key={i}
                style={{
                  width: '100%',
                  height: '80px',
                  background: 'rgba(var(--text-primary-rgb), 0.02)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              />
            ))}
          </div>
        </MainContent>

        {/* 右侧：目录侧边栏 (PC端) */}
        <Sidebar>
          <TocCard>
            <SkeletonTitle width="80px" style={{ height: '18px', marginBottom: '0.5rem' }} />
            {/* 目录项 - 模拟多级标题 */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonText
                key={i}
                width={`${60 + Math.random() * 30}%`}
                style={{
                  height: '14px',
                  marginLeft: i % 3 === 0 ? '1rem' : '0', // 模拟二级标题缩进
                }}
              />
            ))}
          </TocCard>
        </Sidebar>
      </ArticleLayout>
    </PageContainer>
  );
};

export default ArticleDetailSkeleton;
