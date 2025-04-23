import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiTag, FiUser, FiShare2, FiMessageCircle, FiHeart, FiBookmark } from 'react-icons/fi';

// 动画变体定义
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  }
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// 页面容器
export const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
`;

// 页面标题组件
export const PageTitle = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 60px;
    height: 4px;
    background: var(--accent-color);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

// 博客文章卡片
export const ArticleCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: 0 8px 30px rgba(81, 131, 245, 0.1);
    transform: translateY(-3px);
  }
`;

export const ArticleImage = styled.div`
  height: 200px;
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

export const ArticleContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: var(--text-primary);
`;

export const ArticleMeta = styled.div`
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

export const ArticleExcerpt = styled.p`
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

export const ArticleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

export const ArticleTag = styled.span`
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

export const ReadMoreButton = styled(Link)`
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

// 文章详情页样式组件
export const ArticleDetailContainer = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const ArticleDetailHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

export const ArticleDetailTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

export const ArticleDetailMeta = styled.div`
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

export const ArticleCover = styled.div`
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

export const ArticleContent2 = styled.div`
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
  }
  
  ul, ol {
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
`;

export const ArticleActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
`;

export const ArticleActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-secondary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
  }
`;

export const ArticleTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 2rem;
`;

// 分页组件
export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
`;

export const PageNumber = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.active ? 'var(--accent-color)' : 'var(--border-color)'};
  background: ${props => props.active ? 'var(--accent-color-alpha)' : 'var(--bg-primary)'};
  color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
    border-color: var(--accent-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: var(--bg-primary);
      color: var(--text-secondary);
      border-color: var(--border-color);
    }
  }
`;

// 博客文章网格
export const ArticleGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// 博客过滤器组件
export const BlogFilter = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

export const FilterLabel = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
`;

export const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

export const FilterOption = styled.button<{ active?: boolean }>`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid ${props => props.active ? 'var(--accent-color)' : 'var(--border-color)'};
  background: ${props => props.active ? 'var(--accent-color-alpha)' : 'var(--bg-primary)'};
  color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
    border-color: var(--accent-color);
  }
`;

export const SearchInput = styled.input`
  padding: 0.6rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
`;

// 相关文章组件
export const RelatedArticles = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

export const RelatedTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 4px;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

// 评论区组件
export const CommentSection = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

export const CommentTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: var(--accent-color);
    font-size: 1rem;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-color-alpha);
  }
`;

export const CommentForm = styled.form`
  margin-bottom: 2.5rem;
`;

export const CommentInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
`;

export const SubmitButton = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  background: var(--accent-color);
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-color-hover);
  }
`;

// 博客页面左右布局容器
export const BlogLayoutContainer = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 860px) {
    flex-direction: column;
  }
`;

export const BlogMainContent = styled.div`
  flex: 1;
`;

export const BlogSidebar = styled.div`
  width: 300px;
  flex-shrink: 0;
  
  @media (max-width: 860px) {
    width: 100%;
    margin-bottom: 2rem;
  }
`;

// 时间线样式的文章列表
export const TimelineContainer = styled(motion.div)`
  position: relative;
  padding-left: 1.5rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border-color);
    border-radius: 1px;
  }
`;

export const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 2.5rem;
  
  &::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0.5rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-color);
    border: 2px solid var(--bg-primary);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const TimelineDate = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

export const TimelineContent = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.25s ease;
  
  &:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color-alpha);
    box-shadow: 0 4px 20px rgba(81, 131, 245, 0.08);
    transform: translateY(-3px) translateX(3px);
  }
`;

// 右侧栏组件
export const SidebarCard = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    position: relative;
    padding-bottom: 0.5rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 30px;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-color), transparent);
      border-radius: 2px;
    }
  }
`;

export const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const CategoryItem = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: left;
  background: ${props => props.active ? 'var(--accent-color-alpha)' : 'transparent'};
  color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.active ? '500' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
  }
  
  span:last-child {
    font-size: 0.8rem;
    background: ${props => props.active ? 'var(--accent-color)' : 'var(--bg-secondary)'};
    color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    min-width: 24px;
    text-align: center;
  }
`;

export const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

export const TagItem = styled.button<{ active?: boolean }>`
  padding: 0.4rem 0.8rem;
  background: ${props => props.active ? 'var(--accent-color)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: var(--accent-color);
    color: white;
  }
`;

// 时间线文章组件（可复用）
export const TimelineArticleComponent: React.FC<{
  article: {
    id: number;
    title: string;
    date: string;
    category: string;
    tags?: string[];
    views: number;
    excerpt: string;
    image?: string;
    readTime?: number;
  };
}> = ({ article }) => {
  return (
    <TimelineItem>
      <TimelineDate>
        <FiCalendar size={14} /> {article.date}
      </TimelineDate>
      <TimelineContent>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <span><FiClock size={14} /> {article.readTime || '5'} 分钟阅读</span>
          <span><FiTag size={14} /> {article.category}</span>
        </ArticleMeta>
        <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
        <ArticleFooter>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {article.tags?.slice(0, 2).map(tag => (
              <ArticleTag key={tag}>{tag}</ArticleTag>
            ))}
          </div>
          <ReadMoreButton to={`/blog/${article.id}`}>
            阅读更多 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </ReadMoreButton>
        </ArticleFooter>
      </TimelineContent>
    </TimelineItem>
  );
};

// 文章卡片组件（可复用）
export const BlogCardComponent: React.FC<{
  article: {
    id: number;
    title: string;
    date: string;
    category: string;
    tags?: string[];
    views: number;
    excerpt: string;
    image: string;
    readTime?: number;
  };
}> = ({ article }) => {
  return (
    <ArticleCard whileHover={{ y: -5 }}>
      <ArticleImage>
        <img 
          src={article.image} 
          alt={article.title} 
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/600x400?text=Blog+Image";
          }}
        />
      </ArticleImage>
      <ArticleContent>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <span><FiCalendar size={14} /> {article.date}</span>
          <span><FiClock size={14} /> {article.readTime || '5'} 分钟阅读</span>
          <span><FiTag size={14} /> {article.category}</span>
        </ArticleMeta>
        <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
        <ArticleFooter>
          <ArticleTag>{article.tags?.[0] || article.category}</ArticleTag>
          <ReadMoreButton to={`/blog/${article.id}`}>
            阅读更多 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </ReadMoreButton>
        </ArticleFooter>
      </ArticleContent>
    </ArticleCard>
  );
}; 