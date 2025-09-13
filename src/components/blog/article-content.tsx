import React, { useEffect, useRef, memo, useMemo } from 'react';
import styled from '@emotion/styled';
import { FiCalendar, FiClock, FiTag, FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { createRoot } from 'react-dom/client';
import CodeBlock from '@/components/common/code-block';
import ImagePreview from '@/components/common/image-preview';

// 语言检测函数
const detectLanguageFromCode = (code: string): string => {
  const trimmed = code.trim();

  // React/JSX 检测
  if (/import\s+React|from\s+['"]react['"]|<[A-Z][a-zA-Z]*/.test(trimmed)) {
    return /\.tsx|interface\s+\w+|type\s+\w+\s*=/.test(trimmed) ? 'tsx' : 'jsx';
  }

  // TypeScript 检测
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)/.test(trimmed)) {
    return 'typescript';
  }

  // JavaScript 检测
  if (/function\s+\w+|const\s+\w+\s*=|=>\s*{/.test(trimmed)) {
    return 'javascript';
  }

  // CSS 检测
  if (/\{[^}]*:[^}]*\}|@media|@keyframes/.test(trimmed)) {
    return 'css';
  }

  // HTML 检测
  if (/<html|<head|<body|<div|<span|<p|<!DOCTYPE/.test(trimmed)) {
    return 'html';
  }

  // JSON 检测
  if (/^\s*[\{\[]/.test(trimmed) && /[\}\]]\s*$/.test(trimmed) && /"[^"]*"\s*:/.test(trimmed)) {
    return 'json';
  }

  // Python 检测
  if (/def\s+\w+|import\s+\w+|from\s+\w+\s+import/.test(trimmed)) {
    return 'python';
  }

  // Bash/Shell 检测
  if (/^#!/.test(trimmed) || /\$\s*\w+|echo\s+/.test(trimmed)) {
    return 'bash';
  }

  if (/echo\s+|cd\s+|ls\s+/.test(trimmed)) {
    return 'bash';
  }

  return 'text';
};

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

// 文章内容
const ArticleContentWrapper = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-primary);
  min-height: 300px;
  height: auto;
  position: relative;

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

  h4,
  h5,
  h6 {
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

// 使用memo包装组件，避免不必要的重渲染
const ArticleContent: React.FC<ArticleContentProps> = memo(({ article, contentRef }) => {
  // 创建内部内容引用
  const innerContentRef = useRef<HTMLDivElement>(null);

  // 使用useMemo缓存标签展示
  const articleTags = useMemo(() => {
    return article.tags?.map((tag: string) => <ArticleTag key={tag}>{tag}</ArticleTag>);
  }, [article.tags]);

  // 处理内容DOM解析和标题ID设置
  useEffect(() => {
    if (!innerContentRef.current) return;

    // 将HTML内容插入DOM
    innerContentRef.current.innerHTML = article.content || '';

    // 处理标题元素
    const headings = innerContentRef.current.querySelectorAll('h2');
    headings.forEach((heading, index) => {
      const headingId = `heading-${index}`;
      heading.setAttribute('id', headingId);

      // 添加类以便于样式调整
      heading.classList.add('article-heading');
    });

    // 替换代码块为 React 组件
    const codeBlocks = innerContentRef.current.querySelectorAll('pre code');
    codeBlocks.forEach((codeElement) => {
      const preElement = codeElement.parentElement;
      if (!preElement) return;

      const codeText = codeElement.textContent || '';
      const languageClass = codeElement.className.match(/language-(\w+)/);
      const language = languageClass ? languageClass[1] : detectLanguageFromCode(codeText);

      // 创建容器元素
      const wrapper = document.createElement('div');
      wrapper.className = 'react-code-block-wrapper';

      // 替换原始代码块
      preElement.parentNode?.replaceChild(wrapper, preElement);

      // 渲染 React 组件
      const root = createRoot(wrapper);
      root.render(
        <CodeBlock
          code={codeText}
          language={language}
          showLineNumbers={true}
          allowCopy={true}
          allowFullscreen={false}
        />,
      );
    });

    // 处理文章中的图片 - 替换为 ImagePreview 组件
    const images = innerContentRef.current.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.src;
      const alt = img.alt || '文章图片';

      // 创建容器元素
      const wrapper = document.createElement('div');
      wrapper.className = 'react-image-preview-wrapper';
      wrapper.style.margin = '1.5rem 0';
      wrapper.style.textAlign = 'center';

      // 替换原始图片
      img.parentNode?.replaceChild(wrapper, img);

      // 渲染 React 组件
      const root = createRoot(wrapper);
      root.render(
        <ImagePreview
          src={src}
          alt={alt}
          style={{
            maxWidth: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        />,
      );
    });

    // 将内部ref设置的DOM元素传递给外部ref
    if (contentRef && typeof contentRef === 'object') {
      contentRef.current = innerContentRef.current;
    }
  }, [article.content, contentRef]);

  return (
    <ArticleDetailContainer>
      <ArticleDetailHeader>
        <ArticleDetailTitle>{article.title}</ArticleDetailTitle>
        <ArticleDetailMeta>
          <span>
            <FiUser size={16} /> {article.author}
          </span>
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
        <AISummaryContent>{article.excerpt || '本文为您提供了详细的内容和指南。'}</AISummaryContent>
      </AISummaryContainer>

      <ArticleCover>
        <ImagePreview
          src={article.image}
          alt={article.title}
          style={{
            width: '100%',
          }}
        />
      </ArticleCover>

      {/* 使用内部ref代替dangerouslySetInnerHTML */}
      <ArticleContentWrapper ref={innerContentRef} />

      <ArticleTags>{articleTags}</ArticleTags>
    </ArticleDetailContainer>
  );
});

// 添加显示名称以便于调试
ArticleContent.displayName = 'ArticleContent';

export default ArticleContent;
