import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import {
  SkeletonContainer,
  SkeletonTitle,
  SkeletonText,
  SkeletonMeta,
  SkeletonTags,
  randomWidth,
  SkeletonBadge,
} from './skeleton';

// ========== 手记列表骨架屏 ==========

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListItem = styled(motion.div)`
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const NoteListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  const { variants } = useAnimationEngine();

  return (
    <ListContainer>
      {Array.from({ length: count }).map((_, index) => (
        <ListItem key={index} variants={variants.listItemUp}>
          <SkeletonTitle width={randomWidth(40, 70)} style={{ height: '20px' }} />
          <SkeletonText width={randomWidth(80, 95)} />
          <SkeletonText width={randomWidth(60, 85)} />
          <SkeletonMeta>
            <SkeletonText width="80px" />
            <SkeletonText width="100px" />
          </SkeletonMeta>
        </ListItem>
      ))}
    </ListContainer>
  );
};

// ========== 手记详情骨架屏 ==========

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

// 返回链接骨架
const BackLinkSkeleton = styled(SkeletonContainer)`
  width: 120px;
  height: 32px;
  margin-bottom: 1.5rem;
  border-radius: 6px;
`;

// 双列布局 (匹配 NoteLayout)
const NoteLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 300px;
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

// 手记信息卡片骨架
const InfoCard = styled.div`
  padding: 1.5rem;
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.03);
  border: 1px solid rgba(var(--accent-rgb, 99, 102, 241), 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

/**
 * 手记详情页骨架屏
 * 完全匹配真实 DOM 结构：双列布局 + 侧边信息卡片
 */
export const NoteDetailSkeleton: React.FC = () => {
  const { variants } = useAnimationEngine();

  return (
    <PageContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
      {/* 返回链接 */}
      <BackLinkSkeleton />

      <NoteLayout>
        {/* 左侧：主内容区 */}
        <MainContent>
          {/* 手记头部 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <SkeletonTitle width="60%" style={{ height: '32px', marginBottom: '1rem' }} />
            <SkeletonMeta>
              <SkeletonText width="150px" />
              <SkeletonText width="120px" />
            </SkeletonMeta>
          </div>

          {/* 内容统计 */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <SkeletonText width="80px" style={{ height: '20px' }} />
            <SkeletonText width="100px" style={{ height: '20px' }} />
            <SkeletonText width="90px" style={{ height: '20px' }} />
          </div>

          {/* 手记内容 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonText key={i} width={randomWidth(85, 100)} />
            ))}
          </div>

          {/* 图片占位 */}
          <SkeletonContainer
            style={{
              width: '100%',
              height: '300px',
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

          {/* 相关手记 */}
          <div style={{ marginTop: '2rem' }}>
            <SkeletonTitle width="100px" style={{ height: '24px', marginBottom: '1rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {[1, 2, 3].map((i) => (
                <SkeletonContainer
                  key={i}
                  style={{
                    padding: '1rem',
                    background: 'rgba(var(--text-primary-rgb), 0.03)',
                    borderRadius: '8px',
                  }}
                >
                  <SkeletonText width="80%" style={{ height: '18px', marginBottom: '0.5rem' }} />
                  <SkeletonText width="100%" style={{ height: '14px', marginBottom: '0.3rem' }} />
                  <SkeletonText width="90%" style={{ height: '14px', marginBottom: '0.5rem' }} />
                  <SkeletonText width="100px" style={{ height: '12px' }} />
                </SkeletonContainer>
              ))}
            </div>
          </div>
        </MainContent>

        {/* 右侧：信息卡片侧边栏 (PC端) */}
        <Sidebar>
          <InfoCard>
            <SkeletonTitle width="80px" style={{ height: '18px', marginBottom: '0.5rem' }} />

            {/* 信息项 */}
            {[
              { label: '创建时间', width: '150px' },
              { label: '心情', width: '60px' },
              { label: '天气', width: '50px' },
              { label: '地点', width: '100px' },
              { label: '最后阅读', width: '120px' },
            ].map((item, i) => (
              <InfoItem key={i}>
                <SkeletonText width="60px" style={{ height: '14px' }} />
                <SkeletonText width={item.width} style={{ height: '14px' }} />
              </InfoItem>
            ))}

            {/* 标签 */}
            <div>
              <SkeletonText width="40px" style={{ height: '14px', marginBottom: '0.5rem' }} />
              <SkeletonTags style={{ gap: '0.5rem', margin: 0 }}>
                {[1, 2, 3].map((i) => (
                  <SkeletonBadge key={i} />
                ))}
              </SkeletonTags>
            </div>
          </InfoCard>
        </Sidebar>
      </NoteLayout>
    </PageContainer>
  );
};

export default NoteDetailSkeleton;
