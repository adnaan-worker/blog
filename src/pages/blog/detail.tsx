import React, { useState, useEffect, useRef, RefObject, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ArticleContent from '@/components/blog/article-content';
import ArticleToc from '@/components/blog/article-toc';
import CommentSection from '@/components/blog/comment-section';
import type { Article } from '@/utils/api';
import styled from '@emotion/styled';
import { useDebugTool, DebugTool, StickyDebugger } from '@/utils';
import { API, Article as ApiArticle } from '@/utils/api';

/**
 * 📐 页面定位关系说明：
 *
 * 布局层级：
 * MainContainer (flex column)
 *   └─ Content (motion.main)
 *       └─ PageWrapper (fixed) ← 🎯 滚动容器
 *           └─ PageContainer (grid)
 *               ├─ ArticleMain (内容)
 *               └─ ArticleSidebar (sticky, top: 20px) ← 🎯 相对PageWrapper定位
 *
 * 关键点：
 * 1. MainContainer使用flex-direction: column会破坏sticky定位
 * 2. PageWrapper使用position: fixed创建独立滚动容器
 * 3. ArticleSidebar的sticky相对于PageWrapper的顶部（20px）
 * 4. 所有滚动监听都针对PageWrapper，不是window
 */

// 页面包装器 - 使用fixed定位完全脱离flex布局
const PageWrapper = styled.div`
  /* MainContainer的 flex-direction: column 会破坏后代的sticky定位 */
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;

  /* z-index需要在Header(100)之下，但在普通内容(1)之上 */
  z-index: 2;

  /* 背景色 */
  background: var(--bg-primary);

  /* 平滑滚动 */
  scroll-behavior: smooth;

  @media (max-width: 768px) {
    /* 移动端保持一致 */
  }
`;

// 页面容器 - 响应式网格布局
const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 2rem 50px;
  position: relative; /* 需要position属性使z-index生效，同时支持子元素sticky定位 */
  z-index: 3;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 3rem;
  /* 移除 align-items: start，让侧边栏有足够高度支持sticky */
  /* align-items: start; */
  /* 确保grid不会限制sticky的工作 */
  overflow: visible;

  /* 中等屏幕 */
  @media (max-width: 1200px) {
    max-width: 1200px;
    gap: 2rem;
    grid-template-columns: minmax(0, 1fr) 280px;
  }

  /* 平板及以下 - 单栏布局 */
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 860px;
    padding: 80px 2rem 50px;
  }

  /* 手机端 */
  @media (max-width: 768px) {
    padding: 70px 1.5rem 40px;
  }

  @media (max-width: 480px) {
    padding: 60px 1rem 30px;
  }
`;

// 页面过渡动画
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// 文章导航按钮
const ArticleNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

// 导航按钮
const NavButton = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  max-width: 300px;

  &:hover {
    background: var(--accent-color-hover);
    color: var(--accent-color);
    transform: translateY(-2px);
  }

  &.prev {
    padding-left: 1rem;
  }

  &.next {
    padding-right: 1rem;
    text-align: right;
    margin-left: auto;
  }

  .nav-text {
    display: flex;
    flex-direction: column;

    .title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 250px;
    }

    .label {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }

  svg {
    min-width: 20px;
  }

  &.prev svg {
    margin-right: 0.5rem;
  }

  &.next svg {
    margin-left: 0.5rem;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;

    &.next {
      margin-left: 0;
    }
  }
`;

// 文章主内容区
const ArticleMain = styled.div`
  width: 100%;
  max-width: 860px;
  margin: 0;
  min-width: 0; /* 防止内容溢出 */

  @media (max-width: 1024px) {
    margin: 0 auto; /* 单栏时居中 */
  }
`;

// 侧边栏容器 - 使用 sticky 定位
const ArticleSidebar = styled.div`
  position: sticky;
  top: 20px; /* 因为PageWrapper现在是滚动容器，所以相对于PageWrapper顶部定位 */
  align-self: start; /* 确保侧边栏从顶部开始，不被grid拉伸 */
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color);
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

// 返回链接
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
    transform: translateX(-3px);
  }
`;

// 相关文章
const RelatedArticles = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

// 相关文章标题
const RelatedTitle = styled.h3`
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

// 页面头部渐变背景 - 保留原有效果
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 500px;
  width: 100%;
  background: linear-gradient(to right, rgb(var(--gradient-from) / 0.3) 0, rgb(var(--gradient-to) / 0.3) 100%);
  mask-image: linear-gradient(#000, #ffffff00 70%);
  animation: fade-in 1s ease 0.2s both;
  z-index: 2;

  /* 暗黑模式下隐藏 */
  [data-theme='dark'] & {
    display: none;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

// 纸张背景容器 - 完全基于主题系统
const PaperBackground = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;

  /* 亮色模式：羊皮纸效果 */
  [data-theme='light'] & {
    background: 
      /* 纸张基础颜色 - 米白色 */ linear-gradient(180deg, #fdfbf7 0%, #faf8f3 50%, #f8f6f1 100%);

    /* 添加细微噪点 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px);
      opacity: 0.3;
    }
  }

  /* 暗色模式：深色纸张质感 */
  [data-theme='dark'] & {
    background:
      /* 主题色光晕效果 */
      radial-gradient(ellipse 1000px 800px at 50% 0%, rgb(var(--gradient-from) / 0.06), transparent 60%),
      /* 深色纸张基底 */ linear-gradient(180deg, #1a1a1a 0%, #151515 50%, #121212 100%);

    /* 添加主题色噪点纹理 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        /* 细微的主题色网格 */
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgb(var(--gradient-from) / 0.02) 3px,
          rgb(var(--gradient-from) / 0.02) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          rgb(var(--gradient-to) / 0.02) 3px,
          rgb(var(--gradient-to) / 0.02) 4px
        );
      opacity: 0.4;
    }

    /* 添加主题色光斑 */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 30%, rgb(var(--gradient-from) / 0.03), transparent 40%),
        radial-gradient(circle at 80% 60%, rgb(var(--gradient-to) / 0.03), transparent 40%);
    }
  }

  /* 淡入动画 */
  animation: paper-fade-in 0.8s ease both;

  @keyframes paper-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

// 未找到文章提示
const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-secondary);
`;

interface DetailPageHeading {
  id: string;
  text: string;
  element: HTMLElement;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 目录状态
  const [headings, setHeadings] = useState<DetailPageHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // 引用
  const articleRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageWrapperRef = useRef<HTMLDivElement>(null); // PageWrapper的ref，用于监听滚动

  // 防抖滚动处理器引用
  const scrollHandlerRef = useRef<number | null>(null);

  // 使用封装后的调试工具钩子
  const { showDebugInfo, setViewportInfo, toggleDebugInfo } = useDebugTool();

  // 获取文章数据 - 使用useCallback
  const fetchArticle = useCallback(async (articleId: string) => {
    try {
      setError(null);

      // 获取文章详情
      const articleResponse = await API.article.getArticleDetail(articleId);
      const apiArticle = articleResponse.data;

      if (apiArticle) {
        setArticle(apiArticle);

        // 获取文章列表用于导航
        const listResponse = await API.article.getArticles({ page: 1, pageSize: 100 });
        const apiArticles = listResponse.data.data || [];

        if (apiArticles.length > 0) {
          const allArticles: Article[] = apiArticles;

          const articleIndex = allArticles.findIndex((a) => a.id === apiArticle.id);

          // 获取上一篇和下一篇文章
          setPrevArticle(articleIndex > 0 ? allArticles[articleIndex - 1] : null);
          setNextArticle(articleIndex < allArticles.length - 1 ? allArticles[articleIndex + 1] : null);

          // 加载相关文章（同分类或同标签）
          const related = allArticles
            .filter((a) => {
              if (a.id === apiArticle.id) return false;

              // 同分类
              if (a.category?.id === apiArticle.category?.id) return true;

              // 同标签
              if (Array.isArray(a.tags) && Array.isArray(apiArticle.tags)) {
                return a.tags.some((tag: any) =>
                  apiArticle.tags?.some((t: any) => (tag?.id && t?.id && tag.id === t.id) || tag === t),
                );
              }

              return false;
            })
            .slice(0, 2);
          setRelatedArticles(related);
        }

        // 加载评论
        const commentsResponse = await API.comment.getCommentsByPost(articleId);
        if (commentsResponse.success && commentsResponse.data) {
          const responseData = commentsResponse.data as any;
          const commentsList = responseData.comments || [];
          setComments(commentsList);
        }

        // 从本地存储中读取点赞和收藏状态
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
        const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');

        setLiked(likedArticles.includes(Number(articleId)));
        setBookmarked(bookmarkedArticles.includes(Number(articleId)));
      } else {
        setError('文章不存在或已被删除');
        setArticle(null);
        setPrevArticle(null);
        setNextArticle(null);
        setRelatedArticles([]);
        setComments([]);
      }
    } catch (error) {
      console.error('获取文章失败:', error);
      setError('网络错误，请稍后重试');
      setArticle(null);
    } finally {
    }
  }, []);

  // 在ID变化时获取文章
  useEffect(() => {
    // 重置状态
    setHeadings([]);
    setActiveHeading('');
    setReadingProgress(0);

    // 清理之前的observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // 清理滚动事件处理器
    if (scrollHandlerRef.current) {
      window.cancelAnimationFrame(scrollHandlerRef.current);
      scrollHandlerRef.current = null;
    }

    if (id) {
      fetchArticle(id);
    }

    // 滚动到顶部 - PageWrapper而不是window
    if (pageWrapperRef.current) {
      pageWrapperRef.current.scrollTo(0, 0);
    }

    // 确保 body 可以滚动，但不要覆盖滚动锁定管理器的状态
    if (!document.body.style.position || document.body.style.position === 'static') {
      document.body.style.overflow = '';
    }
  }, [id, fetchArticle]);

  // 提取文章中的标题并设置导航 - 使用useCallback优化
  const setupHeadingsAndObserver = useCallback(() => {
    if (!article?.content || !articleRef.current) return;

    const articleElement = articleRef.current;

    // 查找所有h2标题
    const headingElements = Array.from(articleElement.querySelectorAll('h2.article-heading'));

    if (headingElements.length === 0) return;

    // 处理找到的标题
    const extractedHeadings: DetailPageHeading[] = [];

    headingElements.forEach((element) => {
      const headingId = element.id || '';
      const headingText = element.textContent || '';

      extractedHeadings.push({
        id: headingId,
        text: headingText,
        element: element as HTMLElement,
      });
    });

    // 更新标题数据
    setHeadings(extractedHeadings);

    // 创建 IntersectionObserver 配置
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px', // 与 TOC 的 top 值一致
      threshold: [0, 0.25, 0.5, 0.75, 1], // 使用多个阈值点，提高检测精度
    };

    // 创建交叉观察器
    const observer = new IntersectionObserver((entries) => {
      // 筛选可见度较高的标题
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // 如果有多个可见标题，选择可见比例最高的
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveHeading(visibleEntries[0].target.id);
      }
    }, observerOptions);

    // 观察所有标题元素
    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    // 保存观察器以便后续清理
    observerRef.current = observer;

    // 使用requestAnimationFrame优化滚动事件
    // ⚠️ 关键：现在滚动容器是 PageWrapper（固定定位），不是 window
    const handleScroll = () => {
      scrollHandlerRef.current = window.requestAnimationFrame(() => {
        // 获取滚动容器（PageWrapper）的滚动位置
        const pageWrapper = pageWrapperRef.current;
        if (!pageWrapper || !articleElement) return;

        const scrollTop = pageWrapper.scrollTop; // 使用PageWrapper的scrollTop，不是window.scrollY

        // 获取内容区域实际高度及位置
        const contentHeight = articleElement.scrollHeight;
        const clientHeight = pageWrapper.clientHeight; // PageWrapper的可视高度
        const contentRect = articleElement.getBoundingClientRect();
        const contentTop = contentRect.top + scrollTop; // 相对于PageWrapper
        const contentBottom = contentTop + contentHeight;

        // 计算相对于内容区域的滚动位置
        const relativeScrollTop = Math.max(0, scrollTop - contentTop);
        const scrollableDistance = contentHeight - Math.min(clientHeight, contentHeight);

        // 计算正确的阅读进度
        const progress = Math.min(100, Math.max(0, (relativeScrollTop / Math.max(1, scrollableDistance)) * 100));
        setReadingProgress(Math.round(progress));

        // 如果调试开启，收集调试信息
        if (showDebugInfo) {
          const headingInfo = headingElements.map((el) => {
            const rect = el.getBoundingClientRect();
            const viewportTop = 20; // ArticleSidebar的top值（相对于PageWrapper）
            const isVisible = rect.top < viewportTop && rect.bottom > 0;
            return {
              id: el.id,
              text: el.textContent || '',
              top: rect.top,
              isVisible,
            };
          });

          setViewportInfo({
            scrollY: scrollTop, // 使用PageWrapper的scrollTop
            viewportTop: 20, // 与ArticleSidebar的top一致
            viewportBottom: clientHeight,
            headings: headingInfo,
            activeEl: activeHeading,
          });
        }

        // 如果没有可见的标题，手动查找当前应该激活的标题
        if (headingElements.length === 0) return;

        const scrollPosition = scrollTop + 20; // PageWrapper的scrollTop + ArticleSidebar的top值
        const currentHeading = headingElements.find((heading, index) => {
          const nextHeading = headingElements[index + 1];
          const headingTop = heading.getBoundingClientRect().top + scrollTop;
          const nextHeadingTop = nextHeading ? nextHeading.getBoundingClientRect().top + scrollTop : contentBottom;

          return scrollPosition >= headingTop && scrollPosition < nextHeadingTop;
        });

        if (currentHeading) {
          setActiveHeading(currentHeading.id);
        }
      });
    };

    // ⚠️ 关键：监听 PageWrapper 的滚动，而不是 window
    const pageWrapper = pageWrapperRef.current;
    if (!pageWrapper) return;

    pageWrapper.addEventListener('scroll', handleScroll, { passive: true });

    // 初始计算
    handleScroll();

    return () => {
      observer.disconnect();
      pageWrapper.removeEventListener('scroll', handleScroll);
      if (scrollHandlerRef.current) {
        window.cancelAnimationFrame(scrollHandlerRef.current);
      }
    };
  }, [article, showDebugInfo, setViewportInfo]);

  // 设置标题和观察器 - 监听富文本渲染完成事件
  useEffect(() => {
    if (!articleRef.current) return;

    // 监听富文本渲染完成事件
    const handleRichTextRendered = () => {
      setTimeout(() => {
        setupHeadingsAndObserver();
      }, 150);
    };

    const articleElement = articleRef.current;
    articleElement.addEventListener('richTextRendered', handleRichTextRendered as EventListener);

    // 兜底：如果事件没触发，延迟执行
    const fallbackTimer = setTimeout(() => {
      setupHeadingsAndObserver();
    }, 800);

    return () => {
      articleElement.removeEventListener('richTextRendered', handleRichTextRendered as EventListener);
      clearTimeout(fallbackTimer);
    };
  }, [setupHeadingsAndObserver]);

  // 处理目录点击 - 使用useCallback
  // ⚠️ 关键：滚动 PageWrapper 而不是 window
  const handleTocClick = useCallback(
    (headingId: string) => {
      const heading = headings.find((h) => h.id === headingId);
      const pageWrapper = pageWrapperRef.current;
      if (!heading || !pageWrapper) return;

      // 设置活动标题
      setActiveHeading(headingId);

      // 获取目标元素的位置信息
      const rect = heading.element.getBoundingClientRect();
      const scrollTop = pageWrapper.scrollTop; // 使用PageWrapper的scrollTop

      // 计算目标位置（考虑ArticleSidebar的top值）
      const headerOffset = 80; // ArticleSidebar top(20) + 一些额外空间
      const targetPosition = rect.top + scrollTop - headerOffset;

      // 平滑滚动到目标位置
      pageWrapper.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // 添加视觉反馈
      heading.element.classList.add('target-highlight');
      setTimeout(() => {
        heading.element.classList.remove('target-highlight');
      }, 1000);
    },
    [headings],
  );

  // 点赞、收藏和分享功能 - 使用useCallback优化
  const handleLike = useCallback(() => {
    const newLikedState = !liked;
    setLiked(newLikedState);

    // 持久化到本地存储
    const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
    const articleId = Number(id);

    if (newLikedState) {
      localStorage.setItem('likedArticles', JSON.stringify([...likedArticles, articleId]));
    } else {
      localStorage.setItem('likedArticles', JSON.stringify(likedArticles.filter((id: number) => id !== articleId)));
    }
  }, [liked, id]);

  const handleBookmark = useCallback(() => {
    const newBookmarkState = !bookmarked;
    setBookmarked(newBookmarkState);

    // 持久化到本地存储
    const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    const articleId = Number(id);

    if (newBookmarkState) {
      localStorage.setItem('bookmarkedArticles', JSON.stringify([...bookmarkedArticles, articleId]));
    } else {
      localStorage.setItem(
        'bookmarkedArticles',
        JSON.stringify(bookmarkedArticles.filter((id: number) => id !== articleId)),
      );
    }
  }, [bookmarked, id]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        })
        .catch((error) => console.log('分享失败', error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert('链接已复制到剪贴板'))
        .catch((error) => console.error('复制失败', error));
    }
  }, [article]);

  // 使用useMemo缓存TocProps
  const tocProps = useMemo(
    () => ({
      headings: headings.map((h) => ({ id: h.id, text: h.text })),
      activeHeading,
      readingProgress,
      onHeadingClick: handleTocClick,
      liked,
      bookmarked,
      onLike: handleLike,
      onBookmark: handleBookmark,
      onShare: handleShare,
    }),
    [
      headings,
      activeHeading,
      readingProgress,
      handleTocClick,
      liked,
      bookmarked,
      handleLike,
      handleBookmark,
      handleShare,
    ],
  );

  // 错误状态
  if (error) {
    return (
      <PageWrapper>
        <PaperBackground />
        <PageContainer>
          <NotFoundContainer>
            <h2>加载失败</h2>
            <p>{error}</p>
            <BackLink to="/blog">
              <FiArrowLeft /> 返回博客列表
            </BackLink>
          </NotFoundContainer>
        </PageContainer>
      </PageWrapper>
    );
  }

  // 文章未找到
  if (!article) {
    return (
      <PageWrapper>
        <PaperBackground />
        <PageContainer>
          <NotFoundContainer>
            <h2>文章未找到</h2>
            <p>抱歉，找不到您请求的文章</p>
            <BackLink to="/blog">
              <FiArrowLeft /> 返回博客列表
            </BackLink>
          </NotFoundContainer>
        </PageContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper ref={pageWrapperRef}>
      <PageHeadGradient />
      <PaperBackground />

      {/* Sticky调试器 - 帮助诊断问题 */}
      <StickyDebugger />

      {/* 调试工具组件 */}
      {showDebugInfo && (
        <DebugTool
          viewportInfo={{
            scrollY: window.scrollY,
            viewportTop: 150,
            viewportBottom: window.innerHeight,
            headings: headings.map((h) => ({
              id: h.id,
              text: h.text,
              top: h.element.getBoundingClientRect().top,
              isVisible: h.element.getBoundingClientRect().top < 150,
            })),
            activeEl: activeHeading,
          }}
          readingProgress={readingProgress}
          toggleDebugInfo={toggleDebugInfo}
        />
      )}

      <PageContainer>
        {article && (
          <>
            {/* 主内容区 - Grid 第一列 */}
            <ArticleMain>
              <ArticleContent
                article={{
                  ...article,
                  content: article?.content || '',
                }}
                contentRef={articleRef as RefObject<HTMLDivElement>}
              />

              {/* 上一篇/下一篇文章导航 */}
              <ArticleNavigation>
                {prevArticle && (
                  <NavButton to={`/blog/${prevArticle.id}`} className="prev">
                    <FiChevronLeft size={20} />
                    <div className="nav-text">
                      <span className="label">上一篇</span>
                      <span className="title">{prevArticle.title}</span>
                    </div>
                  </NavButton>
                )}

                {nextArticle && (
                  <NavButton to={`/blog/${nextArticle.id}`} className="next">
                    <div className="nav-text">
                      <span className="label">下一篇</span>
                      <span className="title">{nextArticle.title}</span>
                    </div>
                    <FiChevronRight size={20} />
                  </NavButton>
                )}
              </ArticleNavigation>

              {/* 相关文章 */}
              {relatedArticles.length > 0 && (
                <RelatedArticles>
                  <RelatedTitle>相关文章</RelatedTitle>
                  <div>
                    {relatedArticles.map((related) => (
                      <div key={related.id} style={{ marginBottom: '1rem' }}>
                        <h4>
                          <Link to={`/blog/${related.id}`}>{related.title}</Link>
                        </h4>
                        <p>{related.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </RelatedArticles>
              )}

              {/* 评论区 */}
              <CommentSection comments={comments} />
            </ArticleMain>

            {/* 侧边栏 - Grid 第二列 */}
            <ArticleSidebar>
              <ArticleToc {...tocProps} />
            </ArticleSidebar>
          </>
        )}
      </PageContainer>
    </PageWrapper>
  );
};

export default BlogDetail;
