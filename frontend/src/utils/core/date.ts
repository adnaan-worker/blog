/**
 * 日期格式化工具
 * 提供日期格式化、时间差计算等功能
 */

/**
 * 格式化日期
 * @param date 日期对象、字符串、时间戳或null/undefined
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @param timeAgo 是否显示相对时间（几天前，几小时前等）
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss',
  //几天前，几小时前，几分钟前，几秒前
  timeAgo: boolean = false,
): string => {
  // 处理空值
  if (!date) return '-';

  const d = new Date(date);

  // 检查日期是否有效
  if (isNaN(d.getTime())) return '-';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (timeAgo) {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffSeconds = Math.floor(diff / 1000);
    if (diffDays > 0) {
      return `${diffDays}天前`;
    } else if (diffHours > 0) {
      return `${diffHours}小时前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分钟前`;
    } else {
      return `${diffSeconds}秒前`;
    }
  }
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 获取相对时间描述
 * @param date 日期对象、字符串、时间戳
 * @returns 相对时间描述（如：3天前、2小时前等）
 */
export const getTimeAgo = (date: Date | string | number | null | undefined): string => {
  return formatDate(date, '', true);
};

/**
 * 格式化日期为简短格式
 * @param date 日期对象、字符串、时间戳
 * @returns 简短格式的日期字符串（如：2024-01-01）
 */
export const formatDateShort = (date: Date | string | number | null | undefined): string => {
  return formatDate(date, 'YYYY-MM-DD');
};

/**
 * 格式化日期为完整格式
 * @param date 日期对象、字符串、时间戳
 * @returns 完整格式的日期字符串（如：2024-01-01 12:30:45）
 */
export const formatDateFull = (date: Date | string | number | null | undefined): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化日期为时间格式
 * @param date 日期对象、字符串、时间戳
 * @returns 时间格式的字符串（如：12:30:45）
 */
export const formatTime = (date: Date | string | number | null | undefined): string => {
  return formatDate(date, 'HH:mm:ss');
};

/**
 * 格式化日期为中文格式
 * @param date 日期对象、字符串、时间戳
 * @returns 中文格式的日期字符串（如：2024年1月1日）
 */
export const formatDateChinese = (date: Date | string | number | null | undefined): string => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${year}年${month}月${day}日`;
};

/**
 * 检查日期是否为今天
 * @param date 日期对象、字符串、时间戳
 * @returns 是否为今天
 */
export const isToday = (date: Date | string | number | null | undefined): boolean => {
  if (!date) return false;

  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  return (
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  );
};

/**
 * 检查日期是否为昨天
 * @param date 日期对象、字符串、时间戳
 * @returns 是否为昨天
 */
export const isYesterday = (date: Date | string | number | null | undefined): boolean => {
  if (!date) return false;

  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * 获取日期的时间戳
 * @param date 日期对象、字符串、时间戳
 * @returns 时间戳（毫秒）
 */
export const getTimestamp = (date: Date | string | number | null | undefined): number => {
  if (!date) return 0;

  const d = new Date(date);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

/**
 * 计算两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差（正数表示date1在date2之后）
 */
export const getDaysDiff = (
  date1: Date | string | number | null | undefined,
  date2: Date | string | number | null | undefined,
): number => {
  const d1 = getTimestamp(date1);
  const d2 = getTimestamp(date2);

  if (d1 === 0 || d2 === 0) return 0;

  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
};

export default formatDate;
