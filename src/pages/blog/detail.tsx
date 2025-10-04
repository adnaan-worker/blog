import React, { useState, useEffect, useRef, RefObject, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ArticleContent from '@/components/blog/article-content';
import ArticleToc from '@/components/blog/article-toc';
import CommentSection from '@/components/blog/comment-section';
import type { Article } from '@/utils/api';
import styled from '@emotion/styled';
import { useDebugTool, DebugTool } from '@/utils';
import { API, Article as ApiArticle } from '@/utils/api';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 50px;
  position: relative;
  z-index: 3; /* 确保内容在纸张背景之上 */
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

// 文章布局容器
const ArticleLayout = styled.div`
  display: flex;
  gap: 2.5rem;
  position: relative;

  @media (max-width: 860px) {
    flex-direction: column;
  }
`;

// 文章主内容区
const ArticleMain = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 860px) {
    margin-right: 0;
  }
`;

// 侧边栏容器
const ArticleSidebar = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 150px;
  width: 280px;
  height: fit-content;
  align-self: flex-start;
  margin-top: 40px;

  @media (max-width: 860px) {
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

    // 滚动到顶部
    window.scrollTo(0, 0);

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
      rootMargin: '-120px 0px -60% 0px',
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
    const handleScroll = () => {
      scrollHandlerRef.current = window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        if (!articleElement) return;

        // 获取内容区域实际高度及位置
        const contentHeight = articleElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const contentRect = articleElement.getBoundingClientRect();
        const contentTop = contentRect.top + window.scrollY;
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
            const viewportTop = 150; // 与滚动检测保持一致
            const isVisible = rect.top < viewportTop && rect.bottom > 0;
            return {
              id: el.id,
              text: el.textContent || '',
              top: rect.top,
              isVisible,
            };
          });

          setViewportInfo({
            scrollY: window.scrollY,
            viewportTop: 150, // 与观察器设置一致
            viewportBottom: window.innerHeight,
            headings: headingInfo,
            activeEl: activeHeading,
          });
        }

        // 如果没有可见的标题，手动查找当前应该激活的标题
        if (headingElements.length === 0) return;

        const scrollPosition = window.scrollY + 150; // 添加偏移量
        const currentHeading = headingElements.find((heading, index) => {
          const nextHeading = headingElements[index + 1];
          const headingTop = heading.getBoundingClientRect().top + window.scrollY;
          const nextHeadingTop = nextHeading ? nextHeading.getBoundingClientRect().top + window.scrollY : contentBottom; // 使用内容底部而不是无限

          return scrollPosition >= headingTop && scrollPosition < nextHeadingTop;
        });

        if (currentHeading) {
          setActiveHeading(currentHeading.id);
        }
      });
    };

    // 使用passive事件减少性能影响
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初始计算
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (scrollHandlerRef.current) {
        window.cancelAnimationFrame(scrollHandlerRef.current);
      }
    };
  }, [article, showDebugInfo, activeHeading, setViewportInfo]);

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
  const handleTocClick = useCallback(
    (headingId: string) => {
      const heading = headings.find((h) => h.id === headingId);
      if (!heading) return;

      // 设置活动标题
      setActiveHeading(headingId);

      // 获取目标元素的位置信息
      const rect = heading.element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // 计算目标位置（考虑固定头部的高度）
      const headerOffset = 100; // 增加偏移量，确保标题不会被遮挡
      const targetPosition = rect.top + scrollTop - headerOffset;

      // 平滑滚动到目标位置
      window.scrollTo({
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
      <PageContainer>
        <NotFoundContainer>
          <h2>加载失败</h2>
          <p>{error}</p>
          <BackLink to="/blog">
            <FiArrowLeft /> 返回博客列表
          </BackLink>
        </NotFoundContainer>
      </PageContainer>
    );
  }

  // 文章未找到
  if (!article) {
    return (
      <PageContainer>
        <NotFoundContainer>
          <h2>文章未找到</h2>
          <p>抱歉，找不到您请求的文章</p>
          <BackLink to="/blog">
            <FiArrowLeft /> 返回博客列表
          </BackLink>
        </NotFoundContainer>
      </PageContainer>
    );
  }

  return (
    <>
      <PageHeadGradient />
      <PaperBackground />

      <PageContainer>
        <motion.div variants={pageVariants} initial="initial" animate="animate">
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

          {article && (
            <>
              <ArticleLayout>
                {/* 左侧：文章内容 */}
                <ArticleMain>
                  <ArticleContent
                    article={{
                      ...article,
                      content: article?.content || '', // 确保content不为undefined
                    }}
                    contentRef={articleRef as RefObject<HTMLDivElement>} // 类型断言
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

                {/* 右侧：文章目录 */}
                <ArticleSidebar>
                  <ArticleToc {...tocProps} />
                </ArticleSidebar>
              </ArticleLayout>
            </>
          )}
        </motion.div>
      </PageContainer>
    </>
  );
};

export default BlogDetail;
