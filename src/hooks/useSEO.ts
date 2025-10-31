import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_SEO_CONFIG,
  SITE_CONFIG,
  OG_CONFIG,
  TWITTER_CONFIG,
  generatePageTitle,
  generateImageUrl,
  generatePageUrl,
} from '@/config/seo.config';

/**
 * SEO配置接口
 */
export interface SEOConfig {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 关键词（逗号分隔） */
  keywords?: string;
  /** 页面图片（Open Graph / Twitter Card） */
  image?: string;
  /** 页面类型 (website, article, profile等) */
  type?: 'website' | 'article' | 'profile';
  /** 文章作者（仅article类型） */
  author?: string;
  /** 发布时间（仅article类型） */
  publishedTime?: string;
  /** 修改时间（仅article类型） */
  modifiedTime?: string;
  /** 文章标签 */
  tags?: string[];
  /** 是否索引（默认true） */
  index?: boolean;
  /** 是否跟踪链接（默认true） */
  follow?: boolean;
  /** 自定义Canonical URL */
  canonical?: string;
}

/**
 * 设置meta标签
 */
const setMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

/**
 * 移除meta标签
 */
const removeMetaTag = (name: string, attribute: 'name' | 'property' = 'name') => {
  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (element) {
    element.remove();
  }
};

/**
 * 设置link标签
 */
const setLinkTag = (rel: string, href: string) => {
  if (!href) return;

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

/**
 * SEO Hook
 * 用于动态设置页面的SEO信息
 *
 * @example
 * ```tsx
 * useSEO({
 *   title: '文章标题',
 *   description: '文章摘要',
 *   type: 'article',
 *   author: 'Adnaan',
 *   publishedTime: '2025-01-01',
 * });
 * ```
 */
export const useSEO = (config: SEOConfig) => {
  const location = useLocation();

  useEffect(() => {
    const {
      title,
      description = DEFAULT_SEO_CONFIG.description,
      keywords,
      image,
      type = 'website',
      author,
      publishedTime,
      modifiedTime,
      tags,
      index = true,
      follow = true,
      canonical,
    } = config;

    // 1. 设置页面标题
    document.title = generatePageTitle(title);

    // 2. 基础meta标签
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);

    // 3. Robots meta
    const robotsContent = `${index ? 'index' : 'noindex'}, ${follow ? 'follow' : 'nofollow'}`;
    setMetaTag('robots', robotsContent);

    // 4. Open Graph (Facebook, LinkedIn等)
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:url', canonical || generatePageUrl(location.pathname), 'property');
    const imageUrl = generateImageUrl(image);
    setMetaTag('og:image', imageUrl, 'property');
    setMetaTag('og:image:width', String(OG_CONFIG.imageWidth), 'property');
    setMetaTag('og:image:height', String(OG_CONFIG.imageHeight), 'property');
    setMetaTag('og:site_name', OG_CONFIG.siteName, 'property');
    setMetaTag('og:locale', OG_CONFIG.locale, 'property');

    // 5. Twitter Card
    setMetaTag('twitter:card', TWITTER_CONFIG.card);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', imageUrl);
    if (TWITTER_CONFIG.site) setMetaTag('twitter:site', TWITTER_CONFIG.site);
    if (TWITTER_CONFIG.creator) setMetaTag('twitter:creator', TWITTER_CONFIG.creator);

    // 6. 文章专属meta（article类型）
    if (type === 'article') {
      if (author) setMetaTag('article:author', author, 'property');
      if (publishedTime) setMetaTag('article:published_time', publishedTime, 'property');
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, 'property');
      if (tags && tags.length > 0) {
        // 移除旧标签
        document.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove());
        // 添加新标签
        tags.forEach((tag) => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }
    }

    // 7. Canonical URL（避免重复内容）
    const canonicalUrl = canonical || generatePageUrl(location.pathname);
    setLinkTag('canonical', canonicalUrl);

    // 8. 移动端优化
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    setMetaTag('theme-color', SITE_CONFIG.themeColor);

    // 9. 应用名称（PWA相关）
    setMetaTag('application-name', SITE_CONFIG.name);
    setMetaTag('apple-mobile-web-app-title', SITE_CONFIG.name);

    // 清理函数：组件卸载时重置为默认值
    return () => {
      document.title = DEFAULT_SEO_CONFIG.title;
      // 不移除meta标签，只在下次更新时覆盖
    };
  }, [config, location.pathname]);
};

/**
 * 生成结构化数据（JSON-LD）
 * 用于增强搜索引擎理解
 */
export const generateStructuredData = (config: SEOConfig) => {
  if (config.type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: config.title,
      description: config.description || DEFAULT_SEO_CONFIG.description,
      image: generateImageUrl(config.image),
      author: {
        '@type': 'Person',
        name: config.author || SITE_CONFIG.author.name,
        url: SITE_CONFIG.author.url,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        logo: {
          '@type': 'ImageObject',
          url: generateImageUrl(SITE_CONFIG.logo),
        },
      },
      datePublished: config.publishedTime,
      dateModified: config.modifiedTime || config.publishedTime,
      keywords: config.tags?.join(', '),
    };
  }

  // 默认返回WebSite结构化数据
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: config.description || DEFAULT_SEO_CONFIG.description,
  };
};

/**
 * 注入结构化数据到页面
 */
export const injectStructuredData = (data: any) => {
  let script = document.getElementById('structured-data') as HTMLScriptElement;

  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
};

export default useSEO;
