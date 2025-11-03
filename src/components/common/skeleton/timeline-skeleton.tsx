import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useAnimationEngine } from '@/utils/ui/animation';
import { SkeletonText, SkeletonTitle } from './skeleton';

interface TimelineSkeletonProps {
  /** 显示的年份数量 */
  yearCount?: number;
  /** 每个年份的条目数量 */
  itemsPerYear?: number;
  /** 是否显示为手记样式（更紧凑） */
  noteStyle?: boolean;
}

// 容器 - 双列布局
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
`;

// 年份容器
const YearContainer = styled(motion.div)`
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  background: var(--bg-primary);
`;

// 年份标题
const YearHeader = styled.div`
  position: relative;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;

  /* 年份前的竖线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 2px;
    transform: translateY(-50%);
    z-index: 2;
  }
`;

// 时间线列表
const TimelineList = styled.div`
  position: relative;
  padding-left: 2rem;

  /* 时间线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--accent-color) 0%, var(--accent-color) 90%, transparent 100%);
  }
`;

// 时间线条目
const TimelineItemWrapper = styled(motion.div)<{ noteStyle?: boolean }>`
  position: relative;
  margin-bottom: ${(props) => (props.noteStyle ? '0.5rem' : '1rem')};
  padding: ${(props) => (props.noteStyle ? '0.5rem 0' : '0.75rem 0')};

  /* 时间线节点 */
  &::before {
    content: '';
    position: absolute;
    left: -2.25rem;
    top: ${(props) => (props.noteStyle ? '0.6rem' : '0.8rem')};
    width: 10px;
    height: 10px;
    background: var(--accent-color);
    border-radius: 50%;
    border: 2px solid var(--bg-primary);
    z-index: 2;
    opacity: 0.5;
  }
`;

// 单个时间线骨架条目
const SkeletonItem = styled.div<{ noteStyle?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => (props.noteStyle ? '0.25rem' : '0.5rem')};
`;

// 年份骨架
const YearSkeleton: React.FC<{
  year: number;
  itemCount: number;
  noteStyle?: boolean;
  variants: any;
}> = ({ year, itemCount, noteStyle, variants }) => {
  return (
    <YearContainer variants={variants.fadeIn}>
      <YearHeader>
        <SkeletonTitle
          style={{
            width: '80px',
            height: '24px',
          }}
        />
        <SkeletonText
          style={{
            width: '60px',
            height: '16px',
          }}
        />
      </YearHeader>

      <TimelineList>
        {Array.from({ length: itemCount }).map((_, index) => (
          <TimelineItemWrapper key={index} noteStyle={noteStyle} variants={variants.listItemUp}>
            <SkeletonItem noteStyle={noteStyle}>
              {noteStyle ? (
                // 手记样式 - 单行紧凑
                <SkeletonText
                  style={{
                    width: `${60 + Math.random() * 30}%`,
                    height: '16px',
                  }}
                />
              ) : (
                // 文章样式 - 标题 + 摘要
                <>
                  <SkeletonTitle
                    style={{
                      width: `${70 + Math.random() * 20}%`,
                      height: '20px',
                    }}
                  />
                  <SkeletonText
                    style={{
                      width: `${80 + Math.random() * 15}%`,
                      height: '14px',
                    }}
                  />
                  <SkeletonText
                    style={{
                      width: `${60 + Math.random() * 25}%`,
                      height: '14px',
                    }}
                  />
                </>
              )}
            </SkeletonItem>
          </TimelineItemWrapper>
        ))}
      </TimelineList>
    </YearContainer>
  );
};

/**
 * 时间线骨架屏组件
 * 用于文章列表和手记列表的加载状态
 */
export const TimelineSkeleton: React.FC<TimelineSkeletonProps> = ({
  yearCount = 4,
  itemsPerYear = 5,
  noteStyle = false,
}) => {
  const { variants } = useAnimationEngine();

  // 生成年份数据（从当前年份往前）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: yearCount }, (_, i) => currentYear - i);

  // 分成两列
  const leftYears = years.filter((_, index) => index % 2 === 0);
  const rightYears = years.filter((_, index) => index % 2 === 1);

  return (
    <Container>
      {/* 左列 */}
      <Column>
        {leftYears.map((year) => (
          <YearSkeleton key={year} year={year} itemCount={itemsPerYear} noteStyle={noteStyle} variants={variants} />
        ))}
      </Column>

      {/* 右列 */}
      <Column>
        {rightYears.map((year) => (
          <YearSkeleton key={year} year={year} itemCount={itemsPerYear} noteStyle={noteStyle} variants={variants} />
        ))}
      </Column>
    </Container>
  );
};

export default TimelineSkeleton;
