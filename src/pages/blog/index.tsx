import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { MultiYearTimeline } from '@/components/content';
import type { TimelineItem } from '@/utils/helpers/timeline';
import { ListPageHeader, type FilterGroup, type FilterValues } from '@/components/common';
import { SEO } from '@/components/common';
import { API } from '@/utils/api';
import type { Article, Category, Tag } from '@/types';
import { formatDate } from '@/utils';
import { FiCalendar, FiEye, FiHeart, FiMessageSquare, FiClock } from 'react-icons/fi';
import { useAnimationEngine } from '@/utils/ui/animation';

const PageContainer = styled(motion.div)`
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

const ArticleCard = styled(motion.div)`
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
  const { variants, level } = useAnimationEngine();
  const [years, setYears] = useState<Array<{ year: number; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 筛选相关状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // 清理后的筛选参数（由 ListPageHeader 自动处理）
  const [cleanedFilters, setCleanedFilters] = useState<Record<string, any>>({});

  // 加载分类、标签和年份数据
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesRes, tagsRes, yearsRes] = await Promise.all([
          API.category.getCategories(),
          API.tag.getTags(),
          API.article.getYears(),
        ]);
        setCategories(categoriesRes.data || []);
        setTags(tagsRes.data || []);
        const yearList = yearsRes.data || [];
        setYears(yearList);
        setTotalCount(yearList.reduce((sum, y) => sum + y.count, 0));
      } catch (error) {
        console.error('加载筛选选项失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFilterOptions();
  }, []);

  // 筛选条件变化时重新加载年份数据
  useEffect(() => {
    if (Object.keys(cleanedFilters).length > 0) {
      setIsLoading(true);
      // 重新加载年份列表
      API.article.getYears().then((res) => {
        const yearList = res.data || [];
        setYears(yearList);
        setTotalCount(yearList.reduce((sum, y) => sum + y.count, 0));
        setIsLoading(false);
      });
    }
  }, [cleanedFilters]);

  // 将Article转换为TimelineItem（保留完整的Article数据）
  const convertArticleToTimelineItem = useCallback(
    (article: Article): TimelineItem & Article => ({
      ...article,
      id: String(article.id),
      createdAt: article.publishedAt || article.createdAt,
    }),
    [],
  );

  // 按年份加载数据
  const loadYearItems = useCallback(
    async (year: number, page: number): Promise<{ items: (TimelineItem & Article)[]; total: number }> => {
      try {
        // 使用清理后的参数，映射到API字段
        const params: any = {
          page,
          limit: 10,
          year, // 添加年份参数
          ...cleanedFilters,
        };

        // 特殊字段映射
        if (cleanedFilters.category) {
          params.categoryId = Number(cleanedFilters.category);
          delete params.category;
        }

        const response = await API.article.getArticles(params);
        const apiArticles = response.data || [];
        const items = apiArticles.map(convertArticleToTimelineItem);
        const total = response.meta?.pagination?.total || 0;

        return { items, total };
      } catch (error: any) {
        adnaan.toast.error(error.message || `加载${year}年文章失败`);
        return { items: [], total: 0 };
      }
    },
    [cleanedFilters, convertArticleToTimelineItem],
  );

  // 筛选组配置
  const filterGroups: FilterGroup[] = [
    {
      key: 'search',
      label: '搜索',
      type: 'search',
      placeholder: '搜索文章标题、内容...',
    },
    {
      key: 'category',
      label: '分类',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        ...categories.map((cat) => ({
          label: cat.name,
          value: cat.id,
        })),
      ],
    },
    {
      key: 'tag',
      label: '标签',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        ...tags.slice(0, 10).map((tag) => ({
          label: tag.name,
          value: tag.id,
        })),
      ],
    },
  ];

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
      <PageContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
        <Container>
          <ListPageHeader
            title="织星"
            subtitle="以逻辑为经、语法为纬，在 0 与 1 的旷野里织就星河，那些调试的夜、重构的风，终会让指令落进理想的经纬"
            count={totalCount}
            countUnit="篇文章"
            filterGroups={filterGroups}
            filterValues={filterValues}
            onFilterChange={setFilterValues}
            onCleanFilterChange={setCleanedFilters}
          />

          <MultiYearTimeline
            years={years}
            renderItem={(item, index) => renderArticleItem(item as unknown as Article, index)}
            onLoadYearItems={loadYearItems}
            initialYearsToLoad={4}
            loading={isLoading}
            emptyState={emptyStateComponent}
          />
        </Container>
      </PageContainer>
    </>
  );
};

export default BlogPage;
