import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ActivityChartSectionProps } from './types';
import { useAnimationEngine, useSmartInView } from '@/utils/ui/animation';

// Styled Components
const ChartSection = styled(motion.section)`
  margin: 1.5rem 0;
`;

const CreativeSectionHeader = styled.div`
  text-align: center;
  margin: 1rem 0 1.5rem;

  @media (max-width: 768px) {
    margin: 1rem 0 1rem;
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
  padding: 1rem 0;
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
const DayLine = styled(motion.div)<{ height: number; intensity: number }>`
  flex: 1;
  min-width: 3px;
  height: ${(props) => props.height}px; /* 恢复高度，确保布局稳定 */
  background: ${(props) =>
    props.intensity > 0
      ? `linear-gradient(180deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.2) 100%)`
      : `rgba(var(--text-secondary-rgb, 107, 114, 126), 0.1)`};
  border-radius: 2px 2px 0 0;
  opacity: ${(props) => (props.intensity > 0 ? 1 : 0.3)};
  transform-origin: bottom;
  cursor: pointer;
  position: relative;

  /* 顶部高亮条，增加立体感 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${(props) => (props.intensity > 0 ? 'rgba(255,255,255,0.5)' : 'transparent')};
    border-radius: 2px 2px 0 0;
  }

  &:hover {
    filter: brightness(1.3);
    z-index: 10;
    box-shadow: 0 0 10px var(--accent-color);
  }

  @media (max-width: 768px) {
    min-width: 2px;
  }
`;

// 月份标签容器
const ChartLabels = styled.div`
  display: flex;
  margin-top: 1.5rem;
  padding: 0 1rem;
  gap: 4px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    right: 1rem;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(var(--text-secondary-rgb), 0.2) 20%,
      rgba(var(--text-secondary-rgb), 0.2) 80%,
      transparent 100%
    );
  }

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
  opacity: 0.6;
  text-align: center;
  font-family: 'Courier New', monospace; /* 增加科技感 */
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

// 律动动画变体
const rhythmVariants = {
  hidden: { height: 4, opacity: 0 },
  visible: (custom: { height: number; index: number }) => ({
    height: [4, Math.min(custom.height * 1.5, 120), custom.height * 0.8, custom.height],
    opacity: 1,
    transition: {
      duration: 1.2,
      delay: custom.index * 0.008, // 更紧凑的延迟
      times: [0, 0.4, 0.7, 1],
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: (custom: { height: number }) => ({
    height: Math.min(custom.height * 1.4 + 10, 140),
    scaleY: 1.1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  }),
  tap: {
    scaleY: 0.9,
  },
};

// 扫描线组件
const ScanLine = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, transparent, var(--accent-color), transparent);
  z-index: 5;
  pointer-events: none;
  opacity: 0.5;
  box-shadow: 0 0 8px var(--accent-color);
`;

// 主组件
export const ActivityChartSection: React.FC<ActivityChartSectionProps> = ({ chartData }) => {
  const { variants } = useAnimationEngine();

  if (!Array.isArray(chartData) || chartData.length === 0) {
    return (
      <ChartSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={variants.stagger}
      >
        <CreativeSectionHeader>
          <CreativeSectionTitle variants={variants.fadeIn}>年度活跃度频谱</CreativeSectionTitle>
          <SectionSubtitle variants={variants.fadeIn}>暂无信号</SectionSubtitle>
        </CreativeSectionHeader>
      </ChartSection>
    );
  }

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const dailyData = chartData.map((item: any) => {
    const date = new Date(item.date);
    return {
      date: item.date,
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      month: `${date.getMonth() + 1}`, // 简化月份显示
      monthNum: date.getMonth(),
      year: date.getFullYear(),
      day: date.getDate(),
      count: item.count,
    };
  });

  const maxCount = Math.max(...dailyData.map((item) => item.count), 1);
  const chartHeight = window.innerWidth <= 768 ? 80 : 100; // 稍微减小高度，留出空间给倒影

  const normalizedData = dailyData.map((item) => ({
    ...item,
    heightPx:
      item.count === 0
        ? 4 // 基线高度
        : Math.max((item.count / maxCount) * chartHeight, 8),
    intensity: item.count / maxCount,
  }));

  const monthGroups = normalizedData.reduce(
    (groups: Array<{ month: string; monthNum: number; year: number; days: typeof normalizedData }>, item) => {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.month !== item.month) {
        groups.push({
          month: item.month,
          monthNum: item.monthNum,
          year: item.year,
          days: [item],
        });
      } else {
        lastGroup.days.push(item);
      }
      return groups;
    },
    [],
  );

  const completeMonthGroups = monthGroups.map((group) => {
    const daysInMonth = getDaysInMonth(group.year, group.monthNum);
    const completeDays: typeof normalizedData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const existingDay = group.days.find((d) => d.day === day);
      if (existingDay) {
        completeDays.push(existingDay);
      } else {
        const date = new Date(group.year, group.monthNum, day);
        completeDays.push({
          date: date.toISOString().split('T')[0],
          displayDate: `${group.monthNum + 1}/${day}`,
          month: group.month,
          monthNum: group.monthNum,
          year: group.year,
          day: day,
          count: 0,
          heightPx: 4,
          intensity: 0,
        });
      }
    }
    return { ...group, days: completeDays };
  });

  // 计算总索引，用于动画延迟
  let globalIndex = 0;

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
          让每一次代码提交，都化作 {completeMonthGroups[0]?.month || normalizedData[0]?.month || ''} -{' '}
          {completeMonthGroups[completeMonthGroups.length - 1]?.month ||
            normalizedData[normalizedData.length - 1]?.month ||
            ''}
          的诗意的编程韵律
        </SectionSubtitle>
      </CreativeSectionHeader>

      <ChartContainer>
        {/* 添加倒影效果 -webkit-box-reflect 是最简单高性能的方式 */}
        <Chart style={{ WebkitBoxReflect: 'below 2px linear-gradient(transparent, rgba(0,0,0,0.2))' } as any}>
          {/* 扫描线动画 */}
          <ScanLine
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: 'linear',
              repeatDelay: 2,
            }}
          />

          {completeMonthGroups.map((group, groupIndex) => (
            <MonthGroup key={`${group.month}-${groupIndex}`}>
              {group.days.map((item, dayIndex) => {
                const currentIndex = globalIndex++;
                // 确保 key 唯一，使用完整日期加索引
                const uniqueKey = `${item.date}-${group.month}-${dayIndex}`;
                return (
                  <DayLine
                    key={uniqueKey}
                    custom={{ height: item.heightPx, index: currentIndex }}
                    variants={rhythmVariants}
                    intensity={item.intensity}
                    height={item.heightPx} // 用于 styled-component 的 prop
                    title={`${item.displayDate}: ${item.count} 次贡献`}
                    whileHover="hover"
                    whileTap="tap"
                  />
                );
              })}
            </MonthGroup>
          ))}
        </Chart>

        <ChartLabels>
          {completeMonthGroups.map((group, index) => (
            <MonthLabel key={`${group.month}-${index}`}>{group.month}</MonthLabel>
          ))}
        </ChartLabels>
      </ChartContainer>
    </ChartSection>
  );
};

export default ActivityChartSection;
