import React, { useEffect } from 'react';
import { useSEO, SEOConfig, generateStructuredData, injectStructuredData } from '@/hooks/useSEO';

interface SEOProps extends SEOConfig {
  /**
   * 是否注入结构化数据（JSON-LD）
   * @default true
   */
  structuredData?: boolean;
}

/**
 * SEO组件
 * 声明式配置页面SEO信息
 *
 * @example
 * ```tsx
 * <SEO
 *   title="文章标题"
 *   description="文章摘要"
 *   type="article"
 *   author="Adnaan"
 *   publishedTime="2025-01-01"
 *   tags={['React', 'TypeScript']}
 * />
 * ```
 */
export const SEO: React.FC<SEOProps> = ({ structuredData = true, ...config }) => {
  // 使用useSEO hook设置meta标签
  useSEO(config);

  // 注入结构化数据
  useEffect(() => {
    if (structuredData) {
      const data = generateStructuredData(config);
      injectStructuredData(data);
    }

    // 清理函数
    return () => {
      // 组件卸载时移除结构化数据
      const script = document.getElementById('structured-data');
      if (script) {
        script.remove();
      }
    };
  }, [config, structuredData]);

  // 此组件不渲染任何内容
  return null;
};

export default SEO;
