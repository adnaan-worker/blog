/**
 * Layout 相关的 Context
 * 从 layouts/index.tsx 分离出来，避免 Fast Refresh 冲突
 */

import { createContext } from 'react';
import type { SiteSettings } from '@/types';

// 创建网站设置Context
export const SiteSettingsContext = createContext<{
  siteSettings: SiteSettings | null;
  loading: boolean;
}>({
  siteSettings: null,
  loading: true,
});
