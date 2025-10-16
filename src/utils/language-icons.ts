import { FiCode } from 'react-icons/fi';

// 编程语言到图标的映射
export const languageIconMap: Record<string, { icon: string; color: string }> = {
  JavaScript: { icon: 'javascript', color: '#f7df1e' },
  TypeScript: { icon: 'typescript', color: '#3178c6' },
  React: { icon: 'react', color: '#61dafb' },
  Vue: { icon: 'vue', color: '#42b883' },
  Python: { icon: 'python', color: '#3776ab' },
  Java: { icon: 'java', color: '#007396' },
  Go: { icon: 'go', color: '#00add8' },
  'C++': { icon: 'code', color: '#00599c' },
  'C#': { icon: 'code', color: '#239120' },
  Ruby: { icon: 'code', color: '#cc342d' },
  PHP: { icon: 'code', color: '#777bb4' },
  Swift: { icon: 'code', color: '#fa7343' },
  Kotlin: { icon: 'code', color: '#7f52ff' },
  Rust: { icon: 'code', color: '#000000' },
  HTML: { icon: 'code', color: '#e34c26' },
  CSS: { icon: 'code', color: '#1572b6' },
};

/**
 * 获取语言图标配置
 * @param language - 编程语言名称
 * @returns 图标名称和颜色
 */
export const getLanguageIcon = (language?: string): { icon: string; color: string } => {
  if (!language) {
    return { icon: 'code', color: 'var(--accent-color)' };
  }

  return languageIconMap[language] || { icon: 'code', color: 'var(--accent-color)' };
};

/**
 * 计算项目雷达图数据
 * @param project - 项目数据
 * @returns 雷达图数据数组
 */
export const calculateProjectRadarData = (project: {
  stars?: number;
  forks?: number;
  openIssues?: number;
  updatedAt?: string;
}): Array<{ label: string; value: number; max: number }> => {
  const now = new Date();
  const updatedAt = project.updatedAt ? new Date(project.updatedAt) : now;
  const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

  // 活跃度：基于更新时间，越近越高（最近30天内为100分）
  const activityScore = Math.max(0, Math.min(100, 100 - daysSinceUpdate * 3.33));

  // 受欢迎程度：基于 stars（100 stars = 50分，1000 stars = 100分）
  const popularityScore = Math.min(100, ((project.stars || 0) / 10) * 0.5 + 50);

  // 社区活跃度：基于 forks（50 forks = 50分，200 forks = 100分）
  const communityScore = Math.min(100, ((project.forks || 0) / 2) * 0.5 + 50);

  // 问题处理：基于未解决问题数量，越少越好（0个问题 = 100分）
  const issuesScore = Math.max(0, 100 - (project.openIssues || 0) * 2);

  // 综合质量：基于多个因素的综合评分
  const qualityScore = Math.round((activityScore + popularityScore + communityScore) / 3);

  return [
    { label: '活跃度', value: activityScore, max: 100 },
    { label: '受欢迎', value: popularityScore, max: 100 },
    { label: '社区', value: communityScore, max: 100 },
    { label: '问题', value: issuesScore, max: 100 },
    { label: '质量', value: qualityScore, max: 100 },
  ];
};
