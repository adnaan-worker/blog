// 核心工具函数统一导出
export { debounce } from './debounce';
export { throttle } from './throttle';
export { storage } from './storage';
export {
  formatDate,
  getTimeAgo,
  formatDateShort,
  formatDateFull,
  formatTime,
  formatDateChinese,
  isToday,
  isYesterday,
  getTimestamp,
  getDaysDiff,
} from './date';
export { default as scrollLock } from './scroll-lock';
export * from './device-id';
