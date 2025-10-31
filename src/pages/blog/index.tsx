import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import TimelineMasonry, { TimelineItem } from '@/components/common/time-line-masonry';
import { ListPageHeader } from '@/components/common/list-page-header';
import { SEO } from '@/components/common';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { API, Article } from '@/utils/api';
import { formatDate } from '@/utils';
import { FiCalendar, FiEye, FiHeart, FiMessageSquare, FiClock } from 'react-icons/fi';

// 页面样式组件
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

// 文章项目样式 - 紧凑卡片风格
const ArticleCard = styled.div`
  background: var(--bg-primary);
  border: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.4);
  border-radius: 10px;
  padding: 1.25rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    background: var(--bg-secondary);
    border-color: rgba(var(--accent-rgb), 0.3);
    box-shadow: 0 4px 16px rgba(var(--accent-rgb), 0.08);
    transform: translateY(-2px) translateX(2px);
  }

  [data-theme='dark'] & {
    border-color: rgba(255, 255, 255, 0.08);

    &:hover {
      border-color: rgba(var(--accent-rgb), 0.4);
    }
  }
`;

const ArticleTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  transition: color 0.2s ease;

  ${ArticleCard}:hover & {
    color: var(--accent-color);
  }
`;

const ArticleExcerpt = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.9;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.85;

  svg {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  strong {
    font-weight: 600;
    color: var(--accent-color);
    margin-left: 0.15rem;
  }
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: auto;
`;

const TagList = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  color: var(--accent-color);
  font-size: 0.7rem;
  opacity: 0.75;
  font-weight: 400;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.1em;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: var(--text-tertiary);

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  p {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 初始数据加载
  useEffect(() => {
    loadArticles(1);
  }, []);

  // 将Article转换为TimelineItem（保留完整的Article数据）
  const convertArticleToTimelineItem = (article: Article): TimelineItem & Article => ({
    ...article,
    id: String(article.id),
    createdAt: article.publishedAt || article.createdAt,
  });

  // 加载文章数据
  const loadArticles = async (pageNum: number, append = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await API.article.getArticles({
        page: pageNum,
        limit: 10,
      });

      const apiArticles = response.data || [];
      const newArticles = apiArticles.map(convertArticleToTimelineItem);

      if (append) {
        setArticles((prev) => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }

      const pagination = response.meta?.pagination || { page: pageNum, totalPages: 1, total: 0 };
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
      setTotalCount(pagination.total || 0);
    } catch (error: any) {
      adnaan.toast.error(error.message || '加载文章失败');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await loadArticles(page + 1, true);
  }, [page, isLoadingMore, hasMore]);

  // 使用无限滚动Hook
  useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  // 渲染单个文章项目
  const renderArticleItem = (article: Article, index: number) => (
    <Link to={`/blog/${article.id}`} style={{ textDecoration: 'none' }}>
      <ArticleCard>
        <ArticleTitle>{article.title}</ArticleTitle>

        {article.excerpt && <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>}

        {article.tags && article.tags.length > 0 && (
          <TagList>
            {article.tags.slice(0, 3).map((tag: any) => (
              <Tag key={typeof tag === 'string' ? tag : tag.name}>{typeof tag === 'string' ? tag : tag.name}</Tag>
            ))}
          </TagList>
        )}

        <ArticleMeta>
          <MetaItem>
            <FiCalendar />
            {formatDate(article.createdAt, 'MM-DD')}
          </MetaItem>

          {article.readTime && (
            <MetaItem>
              <FiClock />
              {article.readTime} 分钟
            </MetaItem>
          )}

          {article.viewCount && article.viewCount > 0 && (
            <MetaItem>
              <FiEye />
              <strong>{article.viewCount}</strong>
            </MetaItem>
          )}

          {article.likeCount && article.likeCount > 0 && (
            <MetaItem>
              <FiHeart />
              <strong>{article.likeCount}</strong>
            </MetaItem>
          )}

          {article.commentCount && article.commentCount > 0 && (
            <MetaItem>
              <FiMessageSquare />
              <strong>{article.commentCount}</strong>
            </MetaItem>
          )}

          {article.category && (
            <CategoryBadge>
              {typeof article.category === 'string' ? article.category : article.category.name}
            </CategoryBadge>
          )}
        </ArticleMeta>
      </ArticleCard>
    </Link>
  );

  // 空状态组件
  const emptyStateComponent = (
    <EmptyState>
      <h3>还没有文章</h3>
      <p>开始创作你的第一篇文章吧</p>
    </EmptyState>
  );

  return (
    <>
      <SEO
        title="技术文章"
        description="探索代码世界，分享技术思考。包含React、TypeScript、Node.js等前后端开发技术文章。"
        keywords="技术博客, React教程, TypeScript, Node.js, 前端开发, 后端开发"
      />
      <PageContainer>
        <Container>
          {/* 页面头部 */}
          <ListPageHeader
            title="技术文章"
            subtitle="探索代码世界，分享技术思考"
            count={totalCount}
            countUnit="篇文章"
          />

          {/* 时间线列表 */}
          <TimelineMasonry
            items={articles}
            renderItem={(item, index) => renderArticleItem(item as unknown as Article, index)}
            loading={isLoading}
            loadingMore={isLoadingMore}
            hasMore={hasMore}
            emptyState={emptyStateComponent}
          />
        </Container>
      </PageContainer>
    </>
  );
};

export default BlogPage;
