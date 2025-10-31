/**
 * Layout 相关的 Hooks
 * 从 layouts/index.tsx 分离出来，避免 Fast Refresh 冲突
 */

import { useContext } from 'react';
import { SiteSettingsContext } from './contexts';

/**
 * 获取网站设置的 Hook
 */
export const useSiteSettings = () => useContext(SiteSettingsContext);
