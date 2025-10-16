import React from 'react';
import styled from '@emotion/styled';

export interface RadarDataItem {
  label: string;
  value: number;
  max?: number;
}

export interface RadarChartProps {
  data: RadarDataItem[];
  size?: number;
  className?: string;
}

const RadarSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const RadarGrid = styled.polygon`
  fill: none;
  stroke: var(--border-color);
  stroke-width: 1;
  opacity: 0.3;
`;

const RadarArea = styled.polygon`
  fill: var(--accent-color);
  fill-opacity: 0.2;
  stroke: var(--accent-color);
  stroke-width: 2;
  transition: all 0.3s ease;

  &:hover {
    fill-opacity: 0.3;
  }
`;

const RadarLabel = styled.text`
  font-size: 0.75rem;
  fill: var(--text-secondary);
  text-anchor: middle;
  font-weight: 500;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
`;

/**
 * 雷达图组件
 * @param data - 雷达图数据数组
 * @param size - SVG 视图大小（默认 280）
 * @param className - 自定义样式类名
 */
export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 280, className }) => {
  const center = size / 2;
  const radius = (size / 2) * 0.7; // 70% 的半径用于图表
  const levels = 5; // 网格层数

  // 使用 useMemo 确保数据变化时重新计算
  const chartData = React.useMemo(() => {
    // 计算雷达图坐标
    const getPoint = (value: number, index: number, max: number) => {
      const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
      const percent = value / max;
      const x = center + radius * percent * Math.cos(angle);
      const y = center + radius * percent * Math.sin(angle);
      return { x, y };
    };

    // 计算标签位置
    const getLabelPoint = (index: number) => {
      const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      return { x, y };
    };

    // 生成网格线坐标
    const gridPoints = (level: number) => {
      return data
        .map((_, index) => {
          const p = getPoint(100 * (level / levels), index, 100);
          return `${p.x},${p.y}`;
        })
        .join(' ');
    };

    // 生成数据区域坐标
    const dataPoints = data
      .map((item, index) => {
        const max = item.max || 100;
        const p = getPoint(item.value, index, max);
        return `${p.x},${p.y}`;
      })
      .join(' ');

    return { getPoint, getLabelPoint, gridPoints, dataPoints };
  }, [data, center, radius, levels]);

  return (
    <Container className={className}>
      <RadarSVG viewBox={`0 0 ${size} ${size}`}>
        {/* 绘制网格 */}
        {[...Array(levels)].map((_, i) => (
          <RadarGrid key={i} points={chartData.gridPoints(i + 1)} />
        ))}

        {/* 绘制数据区域 */}
        <RadarArea points={chartData.dataPoints} />

        {/* 绘制标签 */}
        {data.map((item, index) => {
          const { x, y } = chartData.getLabelPoint(index);
          return (
            <RadarLabel key={index} x={x} y={y} dy={5}>
              {item.label}
            </RadarLabel>
          );
        })}
      </RadarSVG>
    </Container>
  );
};

export default RadarChart;
