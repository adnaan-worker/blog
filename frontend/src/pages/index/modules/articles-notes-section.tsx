import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { formatDate, getTimeAgo } from '@/utils';
import { useAnimationEngine, useSmartInView, useSpringInteractions } from '@/utils/ui/animation';
import { ArticlesSectionProps, NotesSectionProps } from './types';

// Styled Components
const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
  overflow-x: hidden; /* 防止横向滚动条 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
  & * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  & *::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
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
  overflow-x: hidden;
  padding: 0 0 0 8px; /* 左侧留出空间给时间线 */
  position: relative;

  /* 添加左侧贯穿时间线 */
  &::before {
    content: '';
    position: absolute;
    left: 11px; /* 调整位置以对齐圆点中心 */
    top: 1rem;
    bottom: 1rem;
    width: 1px;
    background: linear-gradient(
      180deg,
      rgba(var(--accent-rgb), 0.1) 0%,
      rgba(var(--accent-rgb), 0.3) 50%,
      rgba(var(--accent-rgb), 0.1) 100%
    );

    @media (max-width: 768px) {
      left: 11px; /* 保持与 PC 端一致 */
    }
  }
`;

const ArticleCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0; /* 更加紧凑 */
  position: relative;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;

  /* 左侧彩色指示点 - 节点 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 7px;
    height: 7px;
    background: var(--bg-primary); /*以此背景色遮挡线条*/
    border: 1.5px solid var(--accent-color);
    border-radius: 50%;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 0 2px var(--bg-primary); /* 增加外圈间隙感 */
  }

  &:hover {
    &::before {
      background: var(--accent-color);
      transform: translateY(-50%) scale(1.3);
      box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.4);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    padding-left: 1.5rem; /* 移动端增加左侧缩进，避开圆点 */

    &::before {
      left: 0; /* 保持与 PC 端一致 */
      top: 0.9rem; /* 移动端对齐标题首行 */
      transform: none;
    }
  }
`;

const ArticleContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 1.5rem; /* 增加文字左侧间距 */

  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const ArticleTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.2s ease;

  /* 单行截断 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${ArticleCard}:hover & {
    color: var(--accent-color);
  }
`;

const ArticleTime = styled.div`
  font-size: 0.75rem; /* 稍微调小字体 */
  color: var(--text-secondary);
  font-weight: 400;
  opacity: 0.6;
  flex-shrink: 0;
  font-family: monospace; /* 科技感字体 */
  margin-left: 1rem;

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 2px;
  }
`;

// ArticleLink 组件
interface ArticleLinkProps {
  to: string;
  children: React.ReactNode;
  variants?: any;
  custom?: any;
  initial?: string;
  animate?: string;
  whileHover?: any;
  whileTap?: any;
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
  const itemInteractions = useSpringInteractions({ hoverScale: 1.005 });

  // 使用智能视口检测 - 修复刷新时可见度问题
  const containerView = useSmartInView({ amount: 0.2, lcpOptimization: true });
  const titleView = useSmartInView({ amount: 0.3 });
  const gridView = useSmartInView({ amount: 0.1 });

  if (loading) {
    return null; // 加载中不显示
  }

  return (
    <ContentSection
      ref={containerView.ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={containerView.isInView ? 'visible' : 'hidden'}
      variants={variants.fadeIn}
    >
      <SectionTitle
        ref={titleView.ref as React.RefObject<HTMLHeadingElement>}
        initial="hidden"
        animate={titleView.isInView ? 'visible' : 'hidden'}
        variants={variants.slideInLeft}
        transition={springPresets.gentle}
      >
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
        ref={gridView.ref as React.RefObject<HTMLDivElement>}
        initial="hidden"
        animate={gridView.isInView ? 'visible' : 'hidden'}
        variants={variants.stagger}
      >
        {articles.slice(0, 3).map((article, index) => (
          <ArticleLink
            to={`/blog/${article.id}`}
            key={article.id}
            variants={variants.listItem}
            custom={index}
            {...itemInteractions}
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
  const itemInteractions = useSpringInteractions({ hoverScale: 1.005 });

  // 使用智能视口检测 - 修复刷新时可见度问题
  const containerView = useSmartInView({ amount: 0.2, lcpOptimization: true });
  const titleView = useSmartInView({ amount: 0.3 });
  const gridView = useSmartInView({ amount: 0.1 });

  if (loading) {
    return null; // 加载中不显示
  }

  return (
    <ContentSection
      ref={containerView.ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={containerView.isInView ? 'visible' : 'hidden'}
      variants={variants.fadeIn}
    >
      <SectionTitle
        ref={titleView.ref as React.RefObject<HTMLHeadingElement>}
        initial="hidden"
        animate={titleView.isInView ? 'visible' : 'hidden'}
        variants={variants.slideInLeft}
        transition={springPresets.gentle}
      >
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
        ref={gridView.ref as React.RefObject<HTMLDivElement>}
        initial="hidden"
        animate={gridView.isInView ? 'visible' : 'hidden'}
        variants={variants.stagger}
      >
        {notes.slice(0, 5).map((note, index) => (
          <ArticleLink
            to={`/notes/${note.id}`}
            key={note.id}
            variants={variants.listItem}
            custom={index}
            {...itemInteractions}
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
