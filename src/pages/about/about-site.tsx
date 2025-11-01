import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SEO, WordCloud, type WordCloudItem, RunningTimeCounter } from '@/components/common';
import { siteMilestones, techStack, siteStats } from '@/data/about-site.data';
import type { SiteMilestone } from '@/data/about-site.data';
import { SPRING_PRESETS, useAnimationEngine, useSmartInView } from '@/utils/ui/animation';
import { formatDate } from '@/utils';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

// 左右分栏布局
const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// 左侧边栏 - 固定在顶部
const Sidebar = styled(motion.aside)`
  position: sticky;
  top: 80px;
  align-self: start;
  /* 移除固定高度和滚动条，让内容自然延伸 */
  overflow: visible;

  @media (max-width: 768px) {
    position: static;
  }
`;

// 侧边栏标题
const SidebarTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SidebarDesc = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

// 侧边栏分区
const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SidebarSectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// 统计列表
const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  line-height: 1;

  span {
    font-size: 0.75rem;
    margin-left: 0.25rem;
    opacity: 0.7;
  }
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

// 主内容区
const MainContent = styled.main`
  min-width: 0;
`;

// 筛选器区域
const FilterSection = styled.div`
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.active ? 'var(--accent-color)' : 'var(--border-color)')};
  background: ${(props) => (props.active ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  font-size: 0.875rem;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
`;

// 分区标题
const SectionTitle = styled(motion.h2)`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: var(--text-primary);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

// 里程碑列表
const MilestonesList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const MilestoneItem = styled(motion.div)`
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.4);
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MilestoneHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
  flex-wrap: wrap;
`;

const MilestoneDate = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
`;

const MilestoneTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
`;

const MilestoneBadge = styled.span<{ category: string }>`
  padding: 0.2rem 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: ${(props) => {
    switch (props.category) {
      case 'feature':
        return 'var(--accent-color)';
      case 'design':
        return '#FF0080';
      case 'tech':
        return '#10b981';
      case 'milestone':
        return '#f59e0b';
      default:
        return 'var(--accent-color)';
    }
  }};
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const MilestoneDesc = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 0.625rem 0;
`;

const MilestoneTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const Tag = styled.span`
  color: var(--accent-color);
  font-size: 0.7rem;
  opacity: 0.75;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.1em;
  }
`;

const AboutSite: React.FC = () => {
  const { variants } = useAnimationEngine();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const milestonesView = useSmartInView({ amount: 0.1 });

  const filteredMilestones =
    activeCategory === 'all' ? siteMilestones : siteMilestones.filter((m) => m.category === activeCategory);

  // 技术栈权重映射
  const techWeights: Record<string, number> = {
    React: 5,
    'Node.js': 5,
    TypeScript: 5,
    MySQL: 4,
    Redis: 4,
    Vite: 4,
    Express: 4,
    OpenAI: 4,
    Sequelize: 3,
    'Socket.IO': 3,
    Docker: 3,
    Nginx: 3,
    LangChain: 3,
  };

  // 转换技术栈为词云格式
  const techWords: WordCloudItem[] = techStack.map((tech) => ({
    text: tech.name,
    weight: techWeights[tech.name] || 3,
    category: tech.category,
  }));

  return (
    <>
      <SEO title="关于此站点" description="了解光阴副本博客系统的设计理念、技术架构和发展历程" />
      <PageContainer>
        <LayoutGrid>
          {/* 左侧边栏 - 技术栈 */}
          <Sidebar initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING_PRESETS.gentle}>
            <SidebarTitle>关于此站点</SidebarTitle>
            <SidebarDesc>一个充满诗意与技术美学的现代化博客系统</SidebarDesc>

            {/* 统计数据 */}
            <SidebarSection>
              <SidebarSectionTitle>站点统计</SidebarSectionTitle>
              <StatsList>
                {siteStats.map((stat) => {
                  // 运行天数使用实时计数器
                  if (stat.id === '1') {
                    return (
                      <StatItem key={stat.id}>
                        <RunningTimeCounter />
                        <StatLabel>天</StatLabel>
                      </StatItem>
                    );
                  }
                  // 其他统计数据正常显示
                  return (
                    <StatItem key={stat.id}>
                      <StatValue>
                        {stat.value}
                        <span>{stat.unit}</span>
                      </StatValue>
                      <StatLabel>{stat.label}</StatLabel>
                    </StatItem>
                  );
                })}
              </StatsList>
            </SidebarSection>

            {/* 技术栈词云 */}
            <SidebarSection>
              <SidebarSectionTitle>技术栈</SidebarSectionTitle>
              <WordCloud words={techWords} minFontSize={0.8} maxFontSize={1.6} />
            </SidebarSection>
          </Sidebar>

          {/* 右侧主内容 - 筛选和历程 */}
          <MainContent>
            {/* 筛选器 */}
            <FilterSection>
              <FilterTitle>筛选类别</FilterTitle>
              <FilterBar>
                <FilterButton active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
                  全部
                </FilterButton>
                <FilterButton active={activeCategory === 'milestone'} onClick={() => setActiveCategory('milestone')}>
                  里程碑
                </FilterButton>
                <FilterButton active={activeCategory === 'feature'} onClick={() => setActiveCategory('feature')}>
                  新功能
                </FilterButton>
                <FilterButton active={activeCategory === 'design'} onClick={() => setActiveCategory('design')}>
                  设计
                </FilterButton>
                <FilterButton active={activeCategory === 'tech'} onClick={() => setActiveCategory('tech')}>
                  技术
                </FilterButton>
              </FilterBar>
            </FilterSection>

            {/* 发展历程 */}
            <SectionTitle
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, ...SPRING_PRESETS.gentle }}
            >
              发展历程
            </SectionTitle>
            <MilestonesList
              ref={milestonesView.ref as React.RefObject<HTMLDivElement>}
              initial="hidden"
              animate={milestonesView.isInView ? 'visible' : 'hidden'}
              variants={variants.stagger}
            >
              {filteredMilestones.map((milestone) => (
                <MilestoneItem key={milestone.id} variants={variants.listItem}>
                  <MilestoneHeader>
                    <MilestoneDate>{formatDate(milestone.date, 'YYYY-MM-DD')}</MilestoneDate>
                    <MilestoneTitle>{milestone.title}</MilestoneTitle>
                    <MilestoneBadge category={milestone.category}>
                      {milestone.category === 'feature'
                        ? '新功能'
                        : milestone.category === 'design'
                          ? '设计'
                          : milestone.category === 'tech'
                            ? '技术'
                            : '里程碑'}
                    </MilestoneBadge>
                  </MilestoneHeader>
                  <MilestoneDesc>{milestone.description}</MilestoneDesc>
                  {milestone.tags && milestone.tags.length > 0 && (
                    <MilestoneTags>
                      {milestone.tags.map((tag, idx) => (
                        <Tag key={idx}>{tag}</Tag>
                      ))}
                    </MilestoneTags>
                  )}
                </MilestoneItem>
              ))}
            </MilestonesList>
          </MainContent>
        </LayoutGrid>
      </PageContainer>
    </>
  );
};

export default AboutSite;
