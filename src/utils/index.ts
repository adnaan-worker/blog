/**
 * Utils 统一导出入口
 * 按功能模块组织，保持向后兼容
 */

// API 相关模块
export { default as API } from './api/api';
export { default as http } from './api/http';
export { HttpRequest } from './api/http';
export { setupHttpConfig } from './api/http-config';

// 编辑器相关模块
export { RichTextParser } from './editor/parser';
export { aiWritingHelper, AIWritingHelper, AI_WRITING_TEMPLATES } from './editor/ai-helper';
export * from './editor/helpers';
export * from './editor/extensions';

// UI/动画相关模块
export { useAnimationEngine, useSmartInView, SPRING_PRESETS } from './ui/animation';
export * from './ui/theme';
export * from './ui/icons';
export * from './ui/language-icons';

// 核心工具函数
export { debounce } from './core/debounce';
export { throttle } from './core/throttle';
export { storage } from './core/storage';
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
} from './core/date';
export { truncateText } from './core/string';
export { default as scrollLock } from './core/scroll-lock';
export * from './core/device-id';

// 业务帮助函数
export * from './helpers/companion';
export * from './helpers/role';
export * from './helpers/timeline';

// 配置相关
export { default as appConfig } from './config/app';
export * from './config/socket';

// 导出调试工具
export { useDebugTool, DebugTool, initialViewportInfo } from '@/components/dev-tools/debug';
export type { ViewportInfo, HeadingInfo } from '@/components/dev-tools/debug';

// 导出Sticky调试工具
export { StickyDebugger, useStickyDebug } from '@/components/dev-tools/sticky-debug';
