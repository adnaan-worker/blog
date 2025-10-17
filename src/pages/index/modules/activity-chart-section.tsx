import React from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { useAnimationOptimization } from '@/utils/animation-utils';
import { ActivityChartSectionProps } from './types';

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
  padding: 1.25rem;

  [data-theme='dark'] & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Chart = styled.div`
  height: 150px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  margin-top: 1rem;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-color);
    opacity: 0.6;
  }
`;

const ChartBar = styled(motion.div)<{ height: number }>`
  width: 6px;
  height: ${(props) => props.height}%;
  background-color: var(--accent-color);
  border-radius: 3px 3px 0 0;
  opacity: 0.8;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    opacity: 1;
    transform: scaleY(1.05);
    background-color: var(--accent-color);
  }
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
`;

// 主组件
export const ActivityChartSection: React.FC<ActivityChartSectionProps> = ({ chartData }) => {
  // 使用动画优化工具
  const { fadeInUp, staggerContainer } = useAnimationOptimization();

  // 柱状图动画变体
  const barVariants: any = {
    hidden: { scaleY: 0, transformOrigin: 'bottom' },
    visible: (custom: number) => ({
      scaleY: 1,
      transition: {
        duration: 0.3,
        delay: custom * 0.03,
        ease: [0.25, 1, 0.5, 1],
      },
    }),
  };

  return (
    <ChartSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
    >
      <CreativeSectionHeader>
        <CreativeSectionTitle variants={fadeInUp}>
          年度活跃度一览
        </CreativeSectionTitle>
        <SectionSubtitle variants={fadeInUp}>
          记录每一次创作的足迹
        </SectionSubtitle>
      </CreativeSectionHeader>

      <ChartContainer variants={fadeInUp} whileHover={{ y: -3 }}>
        <Chart>
          {chartData.map((item, index) => (
            <ChartBar
              key={item.month}
              height={item.count}
              variants={barVariants}
              custom={index}
              whileHover={{ opacity: 1, scaleY: 1.05 }}
            />
          ))}
        </Chart>

        <ChartLabels>
          {chartData.map((item, index) =>
            index % 3 === 0 ? <span key={item.month}>{item.month}</span> : null
          )}
        </ChartLabels>
      </ChartContainer>
    </ChartSection>
  );
};

export default ActivityChartSection;

