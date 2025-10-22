import React from 'react';
import styled from '@emotion/styled';
import { FiClock, FiImage, FiLink, FiCode, FiType, FiEye } from 'react-icons/fi';
import { RichTextParser } from '@/utils/rich-text-parser';

// 统计容器
const StatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin: 1rem 0;
`;

// 统计项
const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .icon {
    color: var(--accent-color);
    flex-shrink: 0;
  }

  .label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .value {
    font-weight: 600;
    color: var(--accent-color);
  }
`;

// 组件接口
interface RichTextStatsProps {
  content: string;
  className?: string;
  showDetailed?: boolean;
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// 格式化阅读时间
const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) {
    return '< 1 分钟';
  } else if (minutes === 1) {
    return '1 分钟';
  } else if (minutes < 60) {
    return `${minutes} 分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} 小时`;
    }
    return `${hours} 小时 ${remainingMinutes} 分钟`;
  }
};

const RichTextStats: React.FC<RichTextStatsProps> = ({ content, className, showDetailed = false }) => {
  // 获取内容统计
  const stats = React.useMemo(() => {
    return RichTextParser.getContentStats(content);
  }, [content]);

  // 基础统计项
  const basicStats = [
    {
      icon: <FiType size={16} />,
      label: '字数',
      value: formatNumber(stats.wordCount),
      title: `总计 ${stats.wordCount} 个字符`,
    },
    {
      icon: <FiClock size={16} />,
      label: '阅读时间',
      value: formatReadingTime(stats.readingTime),
      title: `预计需要 ${stats.readingTime} 分钟阅读`,
    },
  ];

  // 详细统计项
  const detailedStats = [
    {
      icon: <FiImage size={16} />,
      label: '图片',
      value: stats.imageCount,
      title: `包含 ${stats.imageCount} 张图片`,
    },
    {
      icon: <FiLink size={16} />,
      label: '链接',
      value: stats.linkCount,
      title: `包含 ${stats.linkCount} 个外部链接`,
    },
    {
      icon: <FiCode size={16} />,
      label: '代码块',
      value: stats.codeBlockCount,
      title: `包含 ${stats.codeBlockCount} 个代码块`,
    },
  ];

  const displayStats = showDetailed ? [...basicStats, ...detailedStats] : basicStats;

  return (
    <StatsContainer className={className}>
      {displayStats.map((stat, index) => (
        <StatItem key={index} title={stat.title}>
          <span className="icon">{stat.icon}</span>
          <span className="label">{stat.label}:</span>
          <span className="value">{stat.value}</span>
        </StatItem>
      ))}
    </StatsContainer>
  );
};

export default RichTextStats;
