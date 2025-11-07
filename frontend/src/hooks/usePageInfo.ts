/**
 * 页面信息管理 Hook
 * 用于在详情页向 Header 传递标题和标签信息
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { PageInfo } from '@/layouts/header';

// 创建 Context
interface PageInfoContextType {
  pageInfo: PageInfo | null;
  setPageInfo: (info: PageInfo | null) => void;
}

export const PageInfoContext = createContext<PageInfoContextType>({
  pageInfo: null,
  setPageInfo: () => {},
});

// Hook：获取和设置页面信息
export const usePageInfo = () => {
  const context = useContext(PageInfoContext);

  if (!context) {
    throw new Error('usePageInfo 必须在 PageInfoProvider 内部使用');
  }

  return context;
};

// Hook：创建 PageInfoProvider 的状态
export const usePageInfoState = () => {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  const updatePageInfo = useCallback((info: PageInfo | null) => {
    setPageInfo(info);
  }, []);

  return {
    pageInfo,
    setPageInfo: updatePageInfo,
  };
};
