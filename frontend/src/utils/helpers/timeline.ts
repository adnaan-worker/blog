/**
 * 时间线工具函数
 */

// 通用时间线项目接口
export interface TimelineItem {
  id: string;
  createdAt: string;
  [key: string]: any; // 允许其他自定义字段
}

// 年份分组数据结构
export interface YearGroup<T extends TimelineItem> {
  year: string;
  items: T[];
}

/**
 * 按年份分组时间线项目
 * @param items - 时间线项目数组
 * @returns 按年份分组的数据
 */
export const groupItemsByYear = <T extends TimelineItem>(items: T[]): YearGroup<T>[] => {
  const grouped: Record<string, T[]> = {};

  items.forEach((item) => {
    const year = new Date(item.createdAt).getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(item);
  });

  // 按年份降序排列
  const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => ({
    year,
    items: grouped[year].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  }));
};
