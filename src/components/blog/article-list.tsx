import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiTag, FiArrowRight } from 'react-icons/fi';
import type { Article } from '@/utils/api';
import ImageError from '@/assets/images/image-error.png';
import { formatDate } from '@/utils';

// 动画变体定义
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// 导出 Article 类型供其他组件使用
export type { Article };

// 时间线容器
const TimelineContainer = styled(motion.div)`
  position: relative;
  padding-left: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--border-color);
    border-radius: 1px;
  }
`;

// 时间线项
const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 2.5rem;

  &::before {
    content: '';
    position: absolute;
    left: -1.6875rem;
    top: 0.5rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-color);
    border: 2px solid var(--bg-primary);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }

  &:last-child {
    /* margin-bottom: 0; */
  }
`;

// 时间线日期
const TimelineDate = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

// 时间线内容
const TimelineContent = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.25s ease;

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color-alpha);
    box-shadow: 0 4px 16px rgba(81, 131, 245, 0.06);
    transform: translateY(-3px) translateX(3px);
  }
`;

// 文章标题
const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: var(--text-primary);
`;

// 文章元数据
const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

// 文章摘要
const ArticleExcerpt = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

// 文章页脚
const ArticleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

// 文章标签
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

// 阅读更多按钮
const ReadMoreButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--accent-color);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    text-decoration: underline;

    svg {
      transform: translateX(3px);
    }
  }
`;

// 卡片网格
const ArticleGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// 文章卡片
const ArticleCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    background-color: rgba(81, 131, 245, 0.03);
    box-shadow: 0 8px 24px rgba(81, 131, 245, 0.08);
    transform: translateY(-3px);
  }
`;

// 文章图片
const ArticleImage = styled.div`
  height: 180px;
  background-color: var(--bg-secondary);
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  ${ArticleCard}:hover & img {
    transform: scale(1.05);
  }
`;

// 文章内容
const ArticleContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// 无文章提示
const NoArticles = styled(motion.div)`
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary);
`;

// 时间线文章组件
export const TimelineArticleComponent: React.FC<{ article: Article }> = ({ article }) => {
  const readTime = Math.ceil((article.content?.length || 0) / 200);

  return (
    <TimelineItem>
      <TimelineDate>
        <FiCalendar size={14} /> {formatDate(article.publishedAt || article.createdAt, 'YYYY-MM-DD')}
      </TimelineDate>
      <TimelineContent>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <span>
            <FiClock size={14} /> {readTime} 分钟阅读
          </span>
          <span>
            <FiTag size={14} /> {article.category?.name || '未分类'}
          </span>
        </ArticleMeta>
        <ArticleExcerpt>{article.summary || article.content?.substring(0, 150) + '...' || ''}</ArticleExcerpt>
        <ArticleFooter>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {article.tags?.slice(0, 2).map((tag) => (
              <ArticleTag key={tag.id}>{tag.name}</ArticleTag>
            ))}
          </div>
          <ReadMoreButton to={`/blog/${article.id}`}>
            阅读更多 <FiArrowRight size={14} />
          </ReadMoreButton>
        </ArticleFooter>
      </TimelineContent>
    </TimelineItem>
  );
};

// 卡片文章组件
export const BlogCardComponent: React.FC<{ article: Article }> = ({ article }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const readTime = Math.ceil((article.content?.length || 0) / 200);
  const imageUrl = article.coverImage ? `/api/uploads/${article.coverImage}` : ImageError;

  return (
    <ArticleCard whileHover={{ y: -5 }}>
      <ArticleImage>
        <img
          src={imageUrl}
          alt={article.title}
          onError={(e) => {
            e.currentTarget.src = ImageError;
          }}
        />
      </ArticleImage>
      <ArticleContent>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <span>
            <FiCalendar size={14} /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span>
            <FiClock size={14} /> {readTime} 分钟阅读
          </span>
          <span>
            <FiTag size={14} /> {article.category?.name || '未分类'}
          </span>
        </ArticleMeta>
        <ArticleExcerpt>{article.summary || article.content?.substring(0, 150) + '...' || ''}</ArticleExcerpt>
        <ArticleFooter>
          <ArticleTag>{article.tags?.[0]?.name || article.category?.name || '未分类'}</ArticleTag>
          <ReadMoreButton to={`/blog/${article.id}`}>
            阅读更多 <FiArrowRight size={14} />
          </ReadMoreButton>
        </ArticleFooter>
      </ArticleContent>
    </ArticleCard>
  );
};

// 主文章列表组件，支持时间线和卡片视图
interface ArticleListProps {
  articles: Article[];
  viewMode?: 'timeline' | 'card';
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, viewMode = 'timeline' }) => {
  if (articles.length === 0) {
    return (
      <NoArticles initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h3>没有找到匹配的文章</h3>
        <p>尝试修改搜索条件或查看其他分类</p>
      </NoArticles>
    );
  }

  if (viewMode === 'timeline') {
    return (
      <TimelineContainer variants={staggerContainerVariants} initial="hidden" animate="visible">
        {articles.map((article, index) => (
          <motion.div key={article.id} variants={fadeInUpVariants} custom={index}>
            <TimelineArticleComponent article={article} />
          </motion.div>
        ))}
      </TimelineContainer>
    );
  }

  return (
    <ArticleGrid variants={staggerContainerVariants} initial="hidden" animate="visible">
      {articles.map((article, index) => (
        <motion.div key={article.id} variants={fadeInUpVariants} custom={index}>
          <BlogCardComponent article={article} />
        </motion.div>
      ))}
    </ArticleGrid>
  );
};

export default ArticleList;
