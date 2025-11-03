import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import {
  SkeletonContainer,
  SkeletonTitle,
  SkeletonText,
  SkeletonImage,
  SkeletonBadge,
  SkeletonTags,
  randomWidth,
} from './skeleton';

// ========== 项目列表骨架屏 ==========

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ListItem = styled(motion.div)`
  position: relative;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.5);
`;

const ListHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const MetaBadges = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ProjectListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  const { variants } = useAnimationEngine();

  return (
    <ListContainer>
      {Array.from({ length: count }).map((_, index) => (
        <ListItem key={index} variants={variants.listItemUp}>
          {/* 标题和状态 */}
          <ListHeader>
            <SkeletonTitle width="60%" style={{ height: '24px' }} />
            <MetaBadges>
              <SkeletonBadge />
              <SkeletonBadge />
            </MetaBadges>
          </ListHeader>

          {/* 描述 */}
          <div style={{ marginBottom: '0.75rem' }}>
            <SkeletonText width={randomWidth(85, 100)} />
            <SkeletonText width={randomWidth(70, 90)} />
          </div>

          {/* 元数据 */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <SkeletonText width="80px" style={{ height: '16px' }} />
            <SkeletonText width="100px" style={{ height: '16px' }} />
            <SkeletonText width="90px" style={{ height: '16px' }} />
            <SkeletonText width="120px" style={{ height: '16px' }} />
          </div>

          {/* 标签 */}
          <SkeletonTags style={{ marginTop: '0.75rem', gap: '0.5rem', margin: '0.75rem 0 0 0' }}>
            {[1, 2, 3].map((i) => (
              <SkeletonBadge key={i} />
            ))}
          </SkeletonTags>
        </ListItem>
      ))}
    </ListContainer>
  );
};

// ========== 项目详情骨架屏 ==========

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

// 双列布局 (匹配 ProjectLayout)
const ProjectLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 320px;
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
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
`;

// 项目头部卡片
const ProjectHeaderCard = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, rgba(var(--accent-rgb, 99, 102, 241), 0.05) 0%, transparent 100%);
  border: 1px solid rgba(var(--accent-rgb, 99, 102, 241), 0.1);
  border-radius: 16px;
  margin-bottom: 2rem;
`;

// 信息卡片骨架
const InfoCard = styled.div`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
`;

const InfoCardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

/**
 * 项目详情页骨架屏
 * 完全匹配真实 DOM 结构：双列布局 + 侧边信息卡片
 */
export const ProjectDetailSkeleton: React.FC = () => {
  const { variants } = useAnimationEngine();

  return (
    <PageContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
      {/* 返回链接 */}
      <BackLinkSkeleton />

      <ProjectLayout>
        {/* 左侧：主内容区 */}
        <MainContent>
          {/* 项目头部卡片 */}
          <ProjectHeaderCard>
            {/* 状态标签 */}
            <MetaBadges style={{ marginBottom: '1rem' }}>
              <SkeletonBadge />
              <SkeletonBadge />
              <SkeletonBadge />
            </MetaBadges>

            {/* 标题 */}
            <SkeletonTitle width="70%" style={{ height: '36px', marginBottom: '1rem' }} />

            {/* 描述 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <SkeletonText width={randomWidth(90, 100)} />
              <SkeletonText width={randomWidth(80, 95)} />
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <SkeletonContainer
                style={{
                  width: '120px',
                  height: '38px',
                  background: 'rgba(var(--accent-rgb), 0.1)',
                  borderRadius: '6px',
                }}
              />
              <SkeletonContainer
                style={{
                  width: '120px',
                  height: '38px',
                  background: 'rgba(var(--accent-rgb), 0.1)',
                  borderRadius: '6px',
                }}
              />
              <SkeletonContainer
                style={{
                  width: '100px',
                  height: '38px',
                  background: 'rgba(var(--accent-rgb), 0.05)',
                  borderRadius: '6px',
                }}
              />
            </div>

            {/* 封面图 */}
            <SkeletonImage aspectRatio="16/9" style={{ marginTop: '1.5rem' }} />
          </ProjectHeaderCard>

          {/* 移动端信息卡片占位 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem',
            }}
            className="mobile-only"
          >
            <InfoCard>
              <InfoCardTitle>
                <SkeletonText width="60px" style={{ height: '16px' }} />
              </InfoCardTitle>
              <InfoList>
                {[1, 2, 3].map((i) => (
                  <SkeletonText key={i} width={randomWidth(60, 80)} />
                ))}
              </InfoList>
            </InfoCard>
          </div>

          {/* 项目内容 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonText key={i} width={randomWidth(85, 100)} />
            ))}
          </div>

          {/* 截图占位 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <SkeletonImage aspectRatio="16/9" />
            <SkeletonImage aspectRatio="16/9" />
          </div>

          {/* 更多内容 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonText key={i} width={randomWidth(80, 100)} />
            ))}
          </div>
        </MainContent>

        {/* 右侧：信息卡片侧边栏 (PC端) */}
        <Sidebar>
          {/* 作者信息卡片 */}
          <InfoCard>
            <InfoCardTitle>
              <SkeletonText width="40px" style={{ height: '16px' }} />
            </InfoCardTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <SkeletonContainer
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(var(--text-primary-rgb), 0.1)',
                }}
              />
              <div style={{ flex: 1 }}>
                <SkeletonText width="80px" style={{ height: '16px', marginBottom: '0.25rem' }} />
                <SkeletonText width="60px" style={{ height: '14px' }} />
              </div>
            </div>
          </InfoCard>

          {/* 项目统计卡片 */}
          <InfoCard>
            <InfoCardTitle>
              <SkeletonText width="60px" style={{ height: '16px' }} />
            </InfoCardTitle>
            <InfoList>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SkeletonText width="80px" />
                </div>
              ))}
            </InfoList>
          </InfoCard>

          {/* 时间线卡片 */}
          <InfoCard>
            <InfoCardTitle>
              <SkeletonText width="50px" style={{ height: '16px' }} />
            </InfoCardTitle>
            <InfoList>
              {[1, 2, 3].map((i) => (
                <SkeletonText key={i} width="120px" />
              ))}
            </InfoList>
          </InfoCard>

          {/* 功能特性卡片 */}
          <InfoCard>
            <InfoCardTitle>
              <SkeletonText width="60px" style={{ height: '16px' }} />
            </InfoCardTitle>
            <InfoList>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonText key={i} width={randomWidth(60, 90)} />
              ))}
            </InfoList>
          </InfoCard>

          {/* 技术栈卡片 */}
          <InfoCard>
            <InfoCardTitle>
              <SkeletonText width="50px" style={{ height: '16px' }} />
            </InfoCardTitle>
            <SkeletonTags style={{ gap: '0.5rem', margin: '0.75rem 0 0 0' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonBadge key={i} />
              ))}
            </SkeletonTags>
          </InfoCard>

          {/* 标签卡片 */}
          <InfoCard>
            <InfoCardTitle>
              <SkeletonText width="30px" style={{ height: '16px' }} />
            </InfoCardTitle>
            <SkeletonTags style={{ gap: '0.5rem', margin: '0.75rem 0 0 0' }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBadge key={i} />
              ))}
            </SkeletonTags>
          </InfoCard>
        </Sidebar>
      </ProjectLayout>
    </PageContainer>
  );
};

export default ProjectDetailSkeleton;
