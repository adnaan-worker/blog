import React, { useEffect, useRef, memo, useMemo } from 'react';
import styled from '@emotion/styled';
import { FiCalendar, FiClock, FiTag, FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import RichTextRenderer from '@/components/rich-text/rich-text-renderer';
import RichTextContent from '@/components/rich-text/rich-text-content';
import ImagePreview from '@/components/common/image-preview';
import type { Article } from '@/utils/api';

// 文章详情页容器
const ArticleDetailContainer = styled.div`
  width: 100%;
  padding: 0 1rem;
`;

// 文章标题区
const ArticleDetailHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

// 文章标题
const ArticleDetailTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

// 文章元信息
const ArticleDetailMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

// 文章封面图
const ArticleCover = styled.div`
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  [data-theme='dark'] & {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

// AI摘要容器
const AISummaryContainer = styled.div`
  margin: 1.5rem 0 2rem;
  padding: 1.25rem;
  background: rgba(81, 131, 245, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(81, 131, 245, 0.1);
  position: relative;
`;

// AI摘要头部
const AISummaryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
`;

// AI图标包装
const AIIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 25%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-assistant));
  color: white;
  box-shadow: 0 2px 8px rgba(81, 131, 245, 0.25);
`;

// AI摘要标题
const AISummaryTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent-color);
  margin: 0;
`;

// AI摘要内容
const AISummaryContent = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
`;

// 文章内容容器 - 继承统一的 RichTextContent 并添加文章特定样式
const ArticleContentWrapper = styled(RichTextContent)`
  /* 文章页面基础设置 */
  min-height: 300px;
  position: relative;

  /* ========== 文章特定：H2 标题装饰线 ========== */
  h2.article-heading {
    position: relative;
    padding-bottom: 0.5rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background: var(--accent-color);
      border-radius: 2px;
    }
  }

  /* ========== 文章特定：目录导航滚动偏移 ========== */
  h2.article-heading,
  h3.article-heading,
  h4.article-heading,
  h5.article-heading,
  h6.article-heading {
    scroll-margin-top: 100px; /* 避免被 Header 遮挡 */
  }

  /* ========== 文章特定：标题高亮效果（点击目录跳转时） ========== */
  .target-highlight {
    background-color: rgba(var(--accent-rgb, 81, 131, 245), 0.1) !important;
    padding: 0.5rem !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
  }
`;

// 文章标签
const ArticleTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 2rem;
`;

// 标签项
const ArticleTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: rgba(81, 131, 245, 0.1);
  color: var(--accent-color);
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color);
    color: white;
  }
`;

// 添加作者信息显示
const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

interface ArticleContentProps {
  article: Article;
  contentRef: React.RefObject<HTMLDivElement>;
}

// 使用memo包装组件，避免不必要的重渲染
const ArticleContent: React.FC<ArticleContentProps> = memo(({ article, contentRef }) => {
  // 使用useMemo缓存标签展示
  const articleTags = useMemo(() => {
    if (!article.tags || !Array.isArray(article.tags)) return null;

    return article.tags.map((tag: any, index: number) => {
      // 处理标签可能是字符串或对象的情况
      const tagName = typeof tag === 'string' ? tag : tag?.name || String(tag);
      const tagId = typeof tag === 'string' ? index : tag?.id || index;

      return <ArticleTag key={tagId}>{tagName}</ArticleTag>;
    });
  }, [article.tags]);

  // 简化的useEffect，只处理contentRef的设置
  useEffect(() => {
    // 这里不再需要复杂的DOM操作，RichTextRenderer会处理所有内容
    if (contentRef && typeof contentRef === 'object' && contentRef.current) {
      // 可以在这里添加一些额外的处理逻辑
    }
  }, [contentRef, article.content]);

  const authorName =
    typeof article.author === 'object'
      ? article.author?.fullName || article.author?.username
      : article.author || '匿名';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const readTime = Math.ceil((article.content?.length || 0) / 200);

  return (
    <ArticleDetailContainer>
      <ArticleDetailHeader>
        <ArticleDetailTitle>{article.title}</ArticleDetailTitle>
        <ArticleDetailMeta>
          <span>
            <FiUser size={16} /> {authorName}
          </span>
          <span>
            <FiCalendar size={16} /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span>
            <FiClock size={16} /> {readTime} 分钟阅读
          </span>
          <span>
            <FiTag size={16} /> {article.category?.name || '未分类'}
          </span>
        </ArticleDetailMeta>
      </ArticleDetailHeader>

      <AISummaryContainer>
        <AISummaryHeader>
          <AIIconWrapper>
            <RiRobot2Line size={16} />
          </AIIconWrapper>
          <AISummaryTitle>AI 摘要</AISummaryTitle>
        </AISummaryHeader>
        <AISummaryContent>{article.summary || '本文为您提供了详细的内容和指南。'}</AISummaryContent>
      </AISummaryContainer>

      {article.image && (
        <ArticleCover>
          <ImagePreview
            src={article.image}
            alt={article.title}
            style={{
              width: '100%',
            }}
          />
        </ArticleCover>
      )}

      {/* 使用RichTextRenderer处理所有内容 */}
      <ArticleContentWrapper ref={contentRef} className="rich-text-content">
        <RichTextRenderer
          content={article.content || ''}
          mode="article"
          enableCodeHighlight={true}
          enableImagePreview={true}
          enableTableOfContents={false}
        />
      </ArticleContentWrapper>

      {articleTags && <ArticleTags>{articleTags}</ArticleTags>}
    </ArticleDetailContainer>
  );
});

// 添加显示名称以便于调试
ArticleContent.displayName = 'ArticleContent';

export default ArticleContent;
