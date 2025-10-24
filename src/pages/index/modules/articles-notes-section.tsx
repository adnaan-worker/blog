import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { formatDate, getTimeAgo } from '@/utils';
import { useAnimationEngine } from '@/utils/animation-engine';
import { ArticlesSectionProps, NotesSectionProps } from './types';

// Styled Components
const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1.25rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* 为标题添加装饰线 */
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    border-radius: 3px;
  }
`;

const ArticleGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ArticleCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  transition: all 0.2s ease;
  position: relative;

  /* 左侧彩色指示点 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &:hover {
    &::before {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  [data-theme='dark'] & {
    border-bottom-color: rgba(75, 85, 99, 0.5);
  }
`;

const ArticleContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 1.2rem;

  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const ArticleTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.2s ease;

  ${ArticleCard}:hover & {
    color: var(--accent-color);
  }
`;

const ArticleTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 400;
  opacity: 0.7;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-left: 1rem;
  }
`;

// ArticleLink 组件
interface ArticleLinkProps {
  to: string;
  children: React.ReactNode;
  variants?: any;
  custom?: any;
  whileHover?: any;
  transition?: any;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({ to, children, ...props }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <ArticleCard {...props}>{children}</ArticleCard>
  </Link>
);

// 文章区域组件
export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ articles, loading }) => {
  // 使用动画引擎 - Spring 系统
  const { variants, springPresets } = useAnimationEngine();

  if (loading) {
    return null; // 加载中不显示
  }

  return (
    <ContentSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants.fadeIn}
    >
      <SectionTitle>
        技术文思的「新地球」
        <Link to="/blog" style={{ textDecoration: 'none' }}>
          <motion.span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--accent-color)',
              fontSize: '0.85rem',
            }}
            whileHover={{ x: 5 }}
            transition={springPresets.bouncy}
          >
            还有更多 <FiArrowRight size={12} />
          </motion.span>
        </Link>
      </SectionTitle>

      <ArticleGrid
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={variants.stagger}
      >
        {articles.slice(0, 3).map((article, index) => (
          <ArticleLink
            to={`/blog/${article.id}`}
            key={article.id}
            variants={variants.listItem}
            whileHover={{ x: 3, scale: 1.01 }}
            custom={index}
            transition={springPresets.snappy}
          >
            <ArticleContent>
              <ArticleTitle>{article.title}</ArticleTitle>
            </ArticleContent>
            <ArticleTime>{getTimeAgo(article.publishedAt)}</ArticleTime>
          </ArticleLink>
        ))}
      </ArticleGrid>
    </ContentSection>
  );
};

// 笔记区域组件
export const NotesSection: React.FC<NotesSectionProps> = ({ notes, loading }) => {
  // 使用动画引擎 - Spring 系统
  const { variants, springPresets } = useAnimationEngine();

  if (loading) {
    return null; // 加载中不显示
  }

  return (
    <ContentSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants.fadeIn}
    >
      <SectionTitle>
        思想的「裂缝中的阳光」
        <Link to="/notes" style={{ textDecoration: 'none' }}>
          <motion.span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--accent-color)',
              fontSize: '0.85rem',
            }}
            whileHover={{ x: 5 }}
            transition={springPresets.bouncy}
          >
            还有更多 <FiArrowRight size={12} />
          </motion.span>
        </Link>
      </SectionTitle>

      <ArticleGrid
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={variants.stagger}
      >
        {notes.slice(0, 5).map((note, index) => (
          <ArticleLink
            to={`/notes/${note.id}`}
            key={note.id}
            variants={variants.listItem}
            whileHover={{ x: 3, scale: 1.01 }}
            custom={index}
            transition={springPresets.snappy}
          >
            <ArticleContent>
              <ArticleTitle>{note.title || '无标题手记'}</ArticleTitle>
            </ArticleContent>
            <ArticleTime>{getTimeAgo(note.createdAt)}</ArticleTime>
          </ArticleLink>
        ))}
      </ArticleGrid>
    </ContentSection>
  );
};

export default { ArticlesSection, NotesSection };
