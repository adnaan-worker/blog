import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  SEO,
  WordCloud,
  type WordCloudItem,
  RunningTimeCounter,
  PageHeader,
  type FilterGroup,
  type FilterValues,
} from '@/components/common';
import { siteMilestones, techStack, siteStats } from '@/data/about-site.data';
import { SPRING_PRESETS, useAnimationEngine, useSmartInView } from '@/utils/ui/animation';
import { formatDate } from '@/utils';

// 页面头部渐变背景 - 流光溢彩诗意光晕 ✨
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 700px;
  width: 100%;
  overflow: hidden;
  z-index: 0;

  /* 三层光晕效果叠加 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    will-change: transform;
  }

  /* 第一层：主光晕 - 从左上方扩散 */
  &::before {
    background: radial-gradient(
      ellipse 160% 110% at 15% 10%,
      rgba(var(--accent-rgb), 0.38) 0%,
      rgba(var(--accent-rgb), 0.22) 25%,
      rgba(var(--accent-rgb), 0.08) 50%,
      transparent 75%
    );
    transform-origin: 15% 10%;
    animation: breatheGlow1 25s ease-in-out infinite;
  }

  /* 第二层：次光晕 - 从右上方流动 */
  &::after {
    background: radial-gradient(
      ellipse 140% 95% at 85% 15%,
      rgba(var(--accent-rgb), 0.32) 0%,
      rgba(var(--accent-rgb), 0.18) 30%,
      rgba(var(--accent-rgb), 0.06) 55%,
      transparent 80%
    );
    transform-origin: 85% 15%;
    animation: breatheGlow2 30s ease-in-out infinite;
    animation-delay: 8s;
  }

  /* 第三层：中央光晕 */
  & > div {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse 110% 80% at 50% 20%,
      rgba(var(--accent-rgb), 0.15) 0%,
      rgba(var(--accent-rgb), 0.08) 35%,
      transparent 65%
    );
    mix-blend-mode: screen;
    transform-origin: 50% 20%;
    animation: pulseGlow 20s ease-in-out infinite;
    animation-delay: 4s;
  }

  /* 整体渐变遮罩 */
  mask-image: radial-gradient(
    ellipse 90% 100% at 50% 0%,
    black 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 80%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 90% 100% at 50% 0%,
    black 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 80%
  );

  /* 呼吸动画 - 左侧光晕 */
  @keyframes breatheGlow1 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    33% {
      transform: scale(1.08) rotate(1deg);
      opacity: 0.92;
    }
    66% {
      transform: scale(0.96) rotate(-0.5deg);
      opacity: 0.96;
    }
  }

  /* 呼吸动画 - 右侧光晕 */
  @keyframes breatheGlow2 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    40% {
      transform: scale(1.06) rotate(-1deg);
      opacity: 0.88;
    }
    75% {
      transform: scale(0.98) rotate(0.8deg);
      opacity: 0.94;
    }
  }

  /* 脉动动画 - 中央光晕 */
  @keyframes pulseGlow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.65;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.35;
    }
  }

  @media (max-width: 768px) {
    height: 500px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    & > div {
      animation: none;
    }
  }
`;

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

// 页头容器 - 独立在最顶部
const HeaderContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem 0;
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

// 统计列表 - 网格布局
const StatsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled(motion.div)`
  position: relative;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.06) 0%, rgba(var(--accent-rgb), 0.02) 100%);
  border: 1px solid rgba(var(--accent-rgb), 0.12);
  border-radius: 10px;
  transition: all 0.3s ease;
  overflow: hidden;

  /* 悬浮光晕效果 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--accent-rgb), 0.25);
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.08);

    &::before {
      opacity: 1;
    }
  }

  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(var(--accent-rgb), 0.03) 100%);
    border-color: rgba(var(--accent-rgb), 0.15);
  }
`;

const StatValue = styled.span`
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-color);
  line-height: 1.2;
  margin-bottom: 0.25rem;
  font-variant-numeric: tabular-nums;

  span {
    font-size: 0.875rem;
    margin-left: 0.25rem;
    opacity: 0.7;
    font-weight: 500;
  }
`;

const StatLabel = styled.span`
  display: block;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// 主内容区
const MainContent = styled.main`
  min-width: 0;
`;

// 里程碑列表
const MilestonesList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const MilestoneItem = styled(motion.div)`
  padding: 1.5rem 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
  position: relative;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.75rem;
    width: 8px;
    height: 8px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    left: 3.5px;
    top: 2.5rem;
    bottom: -1.5rem;
    width: 1px;
    background: linear-gradient(
      180deg,
      rgba(var(--accent-rgb, 81, 131, 245), 0.3) 0%,
      rgba(var(--accent-rgb, 81, 131, 245), 0.1) 50%,
      transparent 100%
    );
  }

  &:last-child::after {
    display: none;
  }

  &:hover {
    padding-left: 2rem;
    background: rgba(var(--accent-rgb, 81, 131, 245), 0.02);

    &::before {
      opacity: 1;
      transform: scale(1.3);
      box-shadow: 0 0 0 4px rgba(var(--accent-rgb, 81, 131, 245), 0.1);
    }
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
  const [filterValues, setFilterValues] = useState<FilterValues>({ category: 'all' });

  const milestonesView = useSmartInView({ amount: 0.1 });

  // 筛选组配置
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        key: 'category',
        label: '类别',
        type: 'single',
        options: [
          { label: '全部', value: 'all' },
          { label: '里程碑', value: 'milestone' },
          { label: '新功能', value: 'feature' },
          { label: '设计', value: 'design' },
          { label: '技术', value: 'tech' },
        ],
      },
    ],
    [],
  );

  // 根据筛选值过滤里程碑
  const filteredMilestones = useMemo(() => {
    const category = filterValues.category as string;
    if (!category || category === 'all') {
      return siteMilestones;
    }
    return siteMilestones.filter((m) => m.category === category);
  }, [filterValues]);

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

      {/* 流光溢彩背景 ✨ */}
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}
        initial={{ opacity: 0, y: -100, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={SPRING_PRESETS.gentle}
      >
        <PageHeadGradient>
          {/* 第三层中央光晕 */}
          <div />
        </PageHeadGradient>
      </motion.div>

      {/* 页头 - 独立在最顶部 */}
      <HeaderContainer>
        <PageHeader
          title="光阴"
          subtitle="代码如诗，架构如画，在时间的河流里留下每一次迭代的痕迹，那些调试的夜、重构的风，终会让系统落进理想的经纬"
          count={filteredMilestones.length}
          countUnit="个里程碑"
          filterGroups={filterGroups}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
        />
      </HeaderContainer>

      <PageContainer>
        <LayoutGrid>
          {/* 左侧边栏 - 技术栈 */}
          <Sidebar initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING_PRESETS.gentle}>
            {/* 统计数据 */}
            <SidebarSection>
              <SidebarSectionTitle>站点统计</SidebarSectionTitle>
              <StatsList>
                {siteStats.map((stat, index) => {
                  // 运行天数使用实时计数器 - 占据整行
                  if (stat.id === '1') {
                    return (
                      <StatItem
                        key={stat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, ...SPRING_PRESETS.gentle }}
                        style={{ gridColumn: 'span 2' }}
                      >
                        <RunningTimeCounter />
                      </StatItem>
                    );
                  }
                  // 其他统计数据正常显示
                  return (
                    <StatItem
                      key={stat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, ...SPRING_PRESETS.gentle }}
                    >
                      <StatValue>
                        {stat.value}
                        {stat.unit && <span>{stat.unit}</span>}
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

          {/* 右侧主内容 - 发展历程 */}
          <MainContent>
            {/* 发展历程 */}
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
