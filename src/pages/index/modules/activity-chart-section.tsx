import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ActivityChartSectionProps } from './types';
import { useAnimationEngine } from '@/utils/animation-engine';

// Styled Components
const ChartSection = styled(motion.section)`
  margin: 2.5rem 0;
`;

const CreativeSectionHeader = styled.div`
  text-align: center;
  margin: 3.5rem 0 2.5rem;

  @media (max-width: 768px) {
    margin: 2.5rem 0 2rem;
  }
`;

const CreativeSectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ChartContainer = styled(motion.div)`
  padding: 1.25rem 0;
`;

// 活动图表容器
const Chart = styled.div`
  height: 150px;
  display: flex;
  align-items: stretch;
  gap: 4px;
  margin-top: 1.5rem;
  padding: 1rem;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: 120px;
    gap: 3px;
    padding: 0.75rem;
  }
`;

// 月份组容器（每个月均分空间）
const MonthGroup = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end; /* 线条底部对齐 */
  gap: 2px;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 1.5px;
  }
`;

// 每一天的线条（在月份组内均分空间）
const DayLine = styled(motion.div)<{ height: number }>`
  flex: 1;
  min-width: 2px;
  height: ${(props) => props.height}px; /* 使用绝对高度 */
  background: linear-gradient(180deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.7) 100%);
  border-radius: 3px 3px 0 0;
  opacity: 0.85;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    opacity: 1;
    transform: scaleY(1.15) translateY(-2px);
    box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.6);
    filter: brightness(1.1);
  }

  @media (max-width: 768px) {
    min-width: 1.5px;
  }
`;

// 月份标签容器
const ChartLabels = styled.div`
  display: flex;
  margin-top: 1rem;
  padding: 0 1rem;
  gap: 4px;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
    gap: 3px;
  }
`;

// 单个月份标签（均分空间，和MonthGroup对应）
const MonthLabel = styled.div`
  flex: 1;
  font-size: 0.7rem;
  color: var(--text-secondary);
  opacity: 0.8;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

// 主组件
export const ActivityChartSection: React.FC<ActivityChartSectionProps> = ({ chartData }) => {
  const { variants, springPresets } = useAnimationEngine();
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return (
      <ChartSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={variants.stagger}
      >
        <CreativeSectionHeader>
          <CreativeSectionTitle variants={variants.fadeIn}>年度活跃度一览</CreativeSectionTitle>
          <SectionSubtitle variants={variants.fadeIn}>暂无数据</SectionSubtitle>
        </CreativeSectionHeader>
      </ChartSection>
    );
  }

  // 处理API返回的数据
  const dailyData = chartData.map((item: any) => {
    const date = new Date(item.date);
    return {
      date: item.date,
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      month: `${date.getMonth() + 1}月`,
      count: item.count,
    };
  });

  // 计算最大贡献数和图表高度
  const maxCount = Math.max(...dailyData.map((item) => item.count), 1);
  const chartHeight = window.innerWidth <= 768 ? 96 : 118;

  // 标准化数据为绝对高度（避免百分比高度问题）
  const normalizedData = dailyData.map((item) => ({
    ...item,
    heightPx:
      item.count === 0
        ? 3 // 无贡献时显示最小高度
        : Math.max((item.count / maxCount) * chartHeight, 5), // 有贡献时至少5px
  }));

  // 按月份分组数据（用于月份均分布局）
  const monthGroups = normalizedData.reduce(
    (groups: Array<{ month: string; days: typeof normalizedData }>, item, index) => {
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.month !== item.month) {
        groups.push({ month: item.month, days: [item] });
      } else {
        lastGroup.days.push(item);
      }

      return groups;
    },
    [],
  );

  return (
    <ChartSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants.stagger}
    >
      <CreativeSectionHeader>
        <CreativeSectionTitle variants={variants.fadeIn}>我的提交频次诗意图谱</CreativeSectionTitle>
        <SectionSubtitle variants={variants.fadeIn}>
          让每一次代码提交，都化作 {normalizedData[0].month + '-' + normalizedData[normalizedData.length - 1].month}
          的诗意的编程韵律
        </SectionSubtitle>
      </CreativeSectionHeader>

      <ChartContainer>
        <Chart>
          {monthGroups.map((group, groupIndex) => (
            <MonthGroup key={`${group.month}-${groupIndex}`}>
              {group.days.map((item, dayIndex) => (
                <DayLine
                  key={`${item.date}-${dayIndex}`}
                  height={item.heightPx}
                  title={`${item.displayDate}: ${item.count} 次贡献`}
                  style={{
                    background: item.count === 0 ? 'rgba(var(--text-secondary-rgb, 107, 114, 126), 0.15)' : undefined,
                    opacity: item.count === 0 ? 0.5 : 0.85,
                  }}
                />
              ))}
            </MonthGroup>
          ))}
        </Chart>

        <ChartLabels>
          {monthGroups.map((group, index) => (
            <MonthLabel key={`${group.month}-${index}`}>{group.month}</MonthLabel>
          ))}
        </ChartLabels>
      </ChartContainer>
    </ChartSection>
  );
};

export default ActivityChartSection;
