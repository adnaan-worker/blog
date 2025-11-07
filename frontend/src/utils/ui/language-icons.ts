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
 * 归一化函数：将数值映射到0-100的范围
 * 使用对数缩放，让小数值之间的差异更明显
 */
const normalizeScore = (value: number, min: number = 0, max: number = 100): number => {
  if (value <= 0) return 0;
  if (max <= min) return 50;

  // 使用对数缩放，让小数值的差异更明显
  const logValue = Math.log(value + 1);
  const logMin = Math.log(min + 1);
  const logMax = Math.log(max + 1);

  const normalized = ((logValue - logMin) / (logMax - logMin)) * 100;
  return Math.max(0, Math.min(100, normalized));
};

/**
 * 计算项目雷达图数据
 * @param project - 项目数据
 * @param allProjects - 所有项目数据（用于计算相对评分）
 * @returns 雷达图数据数组
 */
export const calculateProjectRadarData = (
  project: {
    stars?: number;
    forks?: number;
    watchers?: number;
    issues?: number;
    viewCount?: number;
    updatedAt?: string;
  },
  allProjects?: Array<{
    stars?: number;
    forks?: number;
    watchers?: number;
    issues?: number;
    viewCount?: number;
  }>,
): Array<{ label: string; value: number; max: number }> => {
  // 获取当前项目的各项数据
  const stars = project.stars || 0;
  const forks = project.forks || 0;
  const watchers = project.watchers || 0;
  const issues = project.issues || 0;
  const viewCount = project.viewCount || 0;

  // 如果提供了所有项目数据，使用相对评分
  if (allProjects && allProjects.length > 1) {
    const maxStars = Math.max(...allProjects.map((p) => p.stars || 0), 1);
    const maxForks = Math.max(...allProjects.map((p) => p.forks || 0), 1);
    const maxWatchers = Math.max(...allProjects.map((p) => p.watchers || 0), 1);
    const maxViews = Math.max(...allProjects.map((p) => p.viewCount || 0), 1);

    // 使用对数归一化评分
    const popularityScore = normalizeScore(stars, 0, maxStars);
    const communityScore = normalizeScore(forks + watchers, 0, maxForks + maxWatchers);
    const activityScore = normalizeScore(viewCount, 0, maxViews);

    // 问题评分：越少越好（反向评分）
    const issuesScore = issues === 0 ? 100 : Math.max(0, 100 - issues * 10);

    // 综合质量：基于多个因素的加权平均
    const qualityScore = Math.round(
      popularityScore * 0.3 + communityScore * 0.25 + activityScore * 0.25 + issuesScore * 0.2,
    );

    return [
      { label: '热度', value: Math.round(popularityScore), max: 100 },
      { label: '社区', value: Math.round(communityScore), max: 100 },
      { label: '活跃', value: Math.round(activityScore), max: 100 },
      { label: '稳定', value: Math.round(issuesScore), max: 100 },
      { label: '质量', value: qualityScore, max: 100 },
    ];
  }

  // 降级方案：单项目评分（使用绝对值）
  const now = new Date();
  const updatedAt = project.updatedAt ? new Date(project.updatedAt) : now;
  const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

  // 使用对数缩放让小数值差异更明显
  const popularityScore = normalizeScore(stars, 0, 10);
  const communityScore = normalizeScore(forks + watchers, 0, 5);
  const activityScore = Math.max(0, Math.min(100, 100 - daysSinceUpdate * 3));
  const issuesScore = issues === 0 ? 100 : Math.max(0, 100 - issues * 10);
  const qualityScore = Math.round((popularityScore + communityScore + activityScore + issuesScore) / 4);

  return [
    { label: '热度', value: Math.round(popularityScore), max: 100 },
    { label: '社区', value: Math.round(communityScore), max: 100 },
    { label: '活跃', value: Math.round(activityScore), max: 100 },
    { label: '稳定', value: Math.round(issuesScore), max: 100 },
    { label: '质量', value: qualityScore, max: 100 },
  ];
};
