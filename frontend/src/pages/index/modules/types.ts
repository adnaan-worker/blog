/**
 * 首页模块类型定义
 */

import type { UserActivity, Project } from '@/types';

// 图表数据类型
export interface ChartDataItem {
  month: string;
  count: number;
  color: string;
}

// 文章卡片类型
export interface ArticleCardProps {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  category?: {
    name: string;
    slug: string;
  };
  createdAt: string;
  publishedAt: string;
  viewCount?: number;
  commentCount?: number;
}

// 笔记卡片类型
export interface NoteCardProps {
  id: number;
  title: string;
  content?: string;
  mood?: string;
  createdAt: string;
}

// 文章区域Props
export interface ArticlesSectionProps {
  articles: ArticleCardProps[];
  loading: boolean;
}

// 笔记区域Props
export interface NotesSectionProps {
  notes: NoteCardProps[];
  loading: boolean;
}

// 活动区域Props
export interface ActivitiesSectionProps {
  activities: UserActivity[];
  loading: boolean;
}

// 图表区域Props
export interface ActivityChartSectionProps {
  chartData: ChartDataItem[];
}

// 项目区域Props
export interface ProjectsSectionProps {
  projects: Project[];
  selectedProjectIndex: number;
  onProjectChange: (index: number) => void;
}
