import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';

// 文章详情页容器
const ArticleDetailContainer = styled.div`
  max-width: 860px;
  margin: 0 auto;
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
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-dark));
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

// 文章内容
const ArticleContentWrapper = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-primary);

  p {
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin: 2.5rem 0 1rem;
    position: relative;
    padding-bottom: 0.5rem;
    scroll-margin-top: 100px;

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

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
    scroll-margin-top: 100px;
  }

  h4, h5, h6 {
    scroll-margin-top: 100px;
  }

  ul,
  ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.5rem;
    }
  }

  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--accent-color);
    background: var(--bg-secondary);
    border-radius: 0 8px 8px 0;
    font-style: italic;

    p {
      margin-bottom: 0;
    }
  }

  code {
    font-family: var(--font-code);
    background: var(--bg-secondary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }

  pre {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1.5rem;

    code {
      background: transparent;
      padding: 0;
      border-radius: 0;
    }
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  /* 为标题添加高亮效果 */
  .highlight-heading {
    transition: all 0.3s ease;
  }

  /* 添加一个用于视觉反馈的目标样式 */
  .target-highlight {
    background-color: rgba(81, 131, 245, 0.1) !important;
    padding: 10px !important;
    border-radius: 4px !important;
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

interface ArticleContentProps {
  article: {
    id: number;
    title: string;
    date: string;
    category: string;
    tags?: string[];
    views?: number;
    readTime?: number;
    excerpt?: string;
    image: string;
    author?: string;
    content: string;
  };
  contentRef: React.RefObject<HTMLDivElement>;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ article, contentRef }) => {
  return (
    <ArticleDetailContainer ref={contentRef}>
      <ArticleDetailHeader>
        <ArticleDetailTitle>{article.title}</ArticleDetailTitle>
        <ArticleDetailMeta>
          <span>
            <FiCalendar size={16} /> {article.date}
          </span>
          <span>
            <FiClock size={16} /> {article.readTime || 5} 分钟阅读
          </span>
          <span>
            <FiTag size={16} /> {article.category}
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
        <AISummaryContent>
          {article.excerpt || '本文为您提供了详细的内容和指南。'}
        </AISummaryContent>
      </AISummaryContainer>

      <ArticleCover>
        <img src={article.image} alt={article.title} />
      </ArticleCover>

      <ArticleContentWrapper dangerouslySetInnerHTML={{ __html: article.content || '' }} />

      <ArticleTags>
        {article.tags?.map((tag: string) => (
          <ArticleTag key={tag}>{tag}</ArticleTag>
        ))}
      </ArticleTags>
    </ArticleDetailContainer>
  );
};

export default ArticleContent; 