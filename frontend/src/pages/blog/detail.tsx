import React, { useState, useEffect, useRef, RefObject, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiBookmark, FiShare2 } from 'react-icons/fi';
import { ArticleContent, ArticleToc } from './modules';
import { CommentSection } from '@/components/content';
import styled from '@emotion/styled';
import { API } from '@/utils/api';
import type { Article } from '@/types';
import { useAnimationEngine } from '@/utils/ui/animation';
import {
  DetailPageLayout,
  DetailMainContent,
  DetailSidebar,
  DetailBackLink,
  DetailNavigation,
  DetailNoiseBackground,
} from '@/components/content';
import { usePageInfo } from '@/hooks/usePageInfo';
import { SEO, ArticleDetailSkeleton } from '@/components/common';

const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding-top: 50px;
`;

// 文章布局容器
const ArticleLayout = styled.div`
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 3;

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
  height: calc(100vh - 210px);
  align-self: flex-start;
  margin-top: 40px;

  @media (max-width: 860px) {
    display: none;
  }
`;

// 移动端 TOC 书签容器 - 左侧书签式导航
const MobileTocBookmarks = styled.div`
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  z-index: 50;
  padding: 1rem 0;
  max-height: 70vh;
  overflow-y: auto;

  @media (max-width: 860px) {
    display: flex;
  }

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

// 书签列表容器
const BookmarksListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

// 单个书签条容器
const BookmarkTabWrapper = styled.div<{ $isActive: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const BookmarkTab = styled(motion.div)<{ $isActive: boolean; $level: number }>`
  position: relative;
  left: ${(props) => (props.$isActive ? '0' : '-8px')};
  width: ${(props) => {
    if (props.$isActive) {
      return props.$level === 2 ? '48px' : '40px';
    }
    return props.$level === 2 ? '32px' : '24px';
  }};
  height: ${(props) => (props.$level === 2 ? '4px' : '3px')};
  border-radius: 0 8px 8px 0;
  background: ${(props) => (props.$isActive ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.2)')};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) => (props.$isActive ? '2px 2px 8px rgba(var(--accent-rgb), 0.3)' : 'none')};
  overflow: visible;
  flex-shrink: 0;

  /* 发光效果 */
  ${(props) =>
    props.$isActive &&
    `
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: var(--accent-color);
      border-radius: 0 8px 8px 0;
      filter: blur(6px);
      opacity: 0.4;
      z-index: -1;
    }
  `}
`;

// 书签标题文本 - 在书签条下方
const BookmarkTitle = styled(motion.div)<{ $isActive: boolean }>`
  font-size: 9px;
  color: var(--accent-color);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${(props) => (props.$isActive ? 0.9 : 0)};
  height: ${(props) => (props.$isActive ? 'auto' : '0')};
  transition: all 0.3s ease;
  font-weight: 600;
  padding-left: 4px;
  letter-spacing: 0.02em;
  line-height: 1.2;
  pointer-events: none;

  @media (max-width: 768px) {
    font-size: 8px;
    max-width: 100px;
  }
`;

// 操作工具栏 - 竖着排列在书签区域下方
const BookmarkActions = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px 4px;
  background: rgba(var(--accent-rgb), 0.05);
  border-radius: 0 12px 12px 0;
  border-left: 2px solid var(--accent-color);

  button {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
      background: var(--accent-color-alpha);
      color: var(--accent-color);
      border-color: var(--accent-color);
      transform: translateX(4px);
    }

    &:active {
      transform: translateX(2px);
    }

    &.active {
      background: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
  }

  @media (max-width: 768px) {
    gap: 6px;
    margin-top: 12px;
    padding: 6px 3px;

    button {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }

  [data-theme='dark'] & {
    background: rgba(var(--accent-rgb), 0.08);
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

// 未找到文章提示
const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-secondary);
`;

interface DetailPageHeading {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // 使用页面信息 Hook
  const { setPageInfo } = usePageInfo();

  // 组件卸载时清除页面信息
  useEffect(() => {
    return () => {
      setPageInfo(null);
    };
  }, [setPageInfo]);

  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 目录状态
  const [headings, setHeadings] = useState<DetailPageHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // 移动端 TOC 书签显示状态（滚动时显示）
  const [showMobileTocButton, setShowMobileTocButton] = useState(false);

  // 引用
  const articleRef = useRef<HTMLDivElement>(null);

  // 滚动处理器引用
  const scrollHandlerRef = useRef<number | null>(null);

  const { springPresets, variants } = useAnimationEngine();

  // 获取文章数据
  const fetchArticle = useCallback(async (articleId: string) => {
    try {
      setError(null);

      // 获取文章详情
      const articleResponse = await API.article.getArticleDetail(articleId);

      // 处理不同的响应格式
      let apiArticle: any = null;
      if (articleResponse && typeof articleResponse === 'object') {
        if ('success' in articleResponse && articleResponse.success && articleResponse.data) {
          apiArticle = articleResponse.data;
        } else if ('id' in articleResponse) {
          apiArticle = articleResponse;
        }
      }

      if (apiArticle) {
        setArticle(apiArticle);

        // 更新 Header 的页面信息
        setPageInfo({
          title: apiArticle.title,
          tags: apiArticle.tags || [],
          category: apiArticle.category,
        });

        // 获取文章列表用于导航
        const listResponse = await API.article.getArticles({ page: 1, limit: 100 });

        let apiArticles: any[] = [];
        if (listResponse && typeof listResponse === 'object') {
          if ('success' in listResponse && listResponse.success && listResponse.data) {
            const data = listResponse.data as any;
            apiArticles = data.list || data || [];
          } else if (Array.isArray(listResponse)) {
            apiArticles = listResponse;
          } else if ('data' in listResponse && Array.isArray(listResponse.data)) {
            apiArticles = listResponse.data;
          }
        }

        if (apiArticles.length > 0) {
          const allArticles: Article[] = apiArticles;
          const articleIndex = allArticles.findIndex((a) => a.id === apiArticle.id);

          setPrevArticle(articleIndex > 0 ? allArticles[articleIndex - 1] : null);
          setNextArticle(articleIndex < allArticles.length - 1 ? allArticles[articleIndex + 1] : null);

          // 加载相关文章
          const related = allArticles
            .filter(
              (a) =>
                a.id !== apiArticle.id &&
                (a.category === apiArticle.category || a.tags?.some((tag) => apiArticle.tags?.includes(tag))),
            )
            .slice(0, 2);
          setRelatedArticles(related);
        }

        // 异步获取用户状态
        API.article
          .getUserStatus(articleId)
          .then((statusResponse) => {
            if (statusResponse.success) {
              setLiked(statusResponse.data.liked);
              setBookmarked(statusResponse.data.bookmarked);
            }
          })
          .catch(() => {
            setLiked(false);
            setBookmarked(false);
          });
      } else {
        setError('文章不存在或已被删除');
        setArticle(null);
        setPrevArticle(null);
        setNextArticle(null);
        setRelatedArticles([]);
      }
    } catch (error) {
      console.error('获取文章失败:', error);
      setError('网络错误，请稍后重试');
      setArticle(null);
    }
  }, []);

  // ID变化时获取文章
  useEffect(() => {
    setHeadings([]);
    setActiveHeading('');
    setReadingProgress(0);

    if (scrollHandlerRef.current) {
      window.cancelAnimationFrame(scrollHandlerRef.current);
      scrollHandlerRef.current = null;
    }

    if (id) {
      fetchArticle(id);
    }

    window.scrollTo(0, 0);
  }, [id, fetchArticle]);

  // 处理从 ArticleContent 接收到的标题
  const handleHeadingsExtracted = useCallback((extractedHeadings: DetailPageHeading[]) => {
    setHeadings(extractedHeadings);
  }, []);

  // 设置滚动监听 - 监听活动标题和阅读进度
  useEffect(() => {
    if (headings.length === 0) return;

    const ACTIVE_THRESHOLD = 100;

    const updateActiveHeading = () => {
      const passedHeadings: { id: string; top: number }[] = [];

      headings.forEach((heading) => {
        if (!heading.element) return;
        const rect = heading.element.getBoundingClientRect();
        if (rect.top <= ACTIVE_THRESHOLD) {
          passedHeadings.push({ id: heading.id, top: rect.top });
        }
      });

      if (passedHeadings.length > 0) {
        passedHeadings.sort((a, b) => b.top - a.top);
        setActiveHeading(passedHeadings[0].id);
      } else if (headings[0]) {
        setActiveHeading(headings[0].id);
      }
    };

    const handleScroll = () => {
      if (scrollHandlerRef.current) {
        window.cancelAnimationFrame(scrollHandlerRef.current);
      }

      scrollHandlerRef.current = window.requestAnimationFrame(() => {
        if (!articleRef.current) return;

        const scrollTop = window.scrollY;
        const contentHeight = articleRef.current.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const contentRect = articleRef.current.getBoundingClientRect();
        const contentTop = contentRect.top + window.scrollY;

        const relativeScrollTop = Math.max(0, scrollTop - contentTop);
        const scrollableDistance = contentHeight - Math.min(clientHeight, contentHeight);

        const progress = Math.min(100, Math.max(0, (relativeScrollTop / Math.max(1, scrollableDistance)) * 100));
        setReadingProgress(Math.round(progress));

        updateActiveHeading();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollHandlerRef.current) {
        window.cancelAnimationFrame(scrollHandlerRef.current);
      }
    };
  }, [headings]);

  // 滚动时显示书签
  useEffect(() => {
    let isScrolling = false;
    let hideTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (!isScrolling) {
        setShowMobileTocButton(true);
        isScrolling = true;
      }

      if (hideTimer) {
        clearTimeout(hideTimer);
      }

      hideTimer = setTimeout(() => {
        setShowMobileTocButton(false);
        isScrolling = false;
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, []);

  // 交互功能
  const handleLike = useCallback(async () => {
    if (!id) return;

    try {
      const response = await API.article.toggleLike(id);
      if (response.success) {
        setLiked(response.data.liked);
        if (article) {
          setArticle({ ...article, likeCount: response.data.likeCount });
        }
      }
    } catch (error: any) {
      adnaan.toast.error((error && error.message) || '点赞失败，请稍后重试');
    }
  }, [id, article]);

  const handleBookmark = useCallback(async () => {
    if (!id) return;

    try {
      const response = await API.article.toggleBookmark(id);
      if (response.success) {
        setBookmarked(response.data.bookmarked);
      }
    } catch (error: any) {
      adnaan.toast.error((error && error.message) || '收藏失败，请稍后重试');
    }
  }, [id]);

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
        .then(() => adnaan.toast.success('链接已复制到剪贴板'))
        .catch(() => adnaan.toast.error('复制失败'));
    }
  }, [article]);

  const handleHeadingClick = useCallback(
    (headingId: string) => {
      const heading = headings.find((h) => h.id === headingId);
      if (heading?.element) {
        const headerOffset = 100;
        const elementPosition = heading.element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    },
    [headings],
  );

  // TOC Props
  const tocProps = useMemo(
    () => ({
      headings: headings.map((h) => ({ id: h.id, text: h.text, level: h.level })),
      activeHeading,
      readingProgress,
      liked,
      bookmarked,
      onLike: handleLike,
      onBookmark: handleBookmark,
      onShare: handleShare,
      onHeadingClick: handleHeadingClick,
    }),
    [
      headings,
      activeHeading,
      readingProgress,
      liked,
      bookmarked,
      handleLike,
      handleBookmark,
      handleShare,
      handleHeadingClick,
    ],
  );

  // 错误状态
  if (error) {
    return (
      <PageContainer>
        <NotFoundContainer>
          <h2>加载失败</h2>
          <p>{error}</p>
          <DetailBackLink to="/blog" label="返回博客列表" />
        </NotFoundContainer>
      </PageContainer>
    );
  }

  return (
    <>
      <SEO
        title={article?.title || '加载中...'}
        description={article?.excerpt || article?.summary || '阅读更多技术文章'}
        keywords={article?.tags?.map((tag: any) => (typeof tag === 'string' ? tag : tag.name)).join(', ')}
        image={article?.coverImage}
        type="article"
        author={
          typeof article?.author === 'string' ? article.author : article?.author?.username || article?.author?.nickname
        }
      />
      {!article ? (
        <ArticleDetailSkeleton />
      ) : (
        <DetailPageLayout showBackground={true} mainContent={<></>}>
          <DetailNoiseBackground />
          <PageContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
            <ArticleLayout>
              {/* 左侧：文章内容 - 向上弹性划出 */}
              <DetailMainContent>
                <ArticleMain>
                  <ArticleContent
                    article={{
                      ...article,
                      content: article?.content || '',
                    }}
                    contentRef={articleRef as RefObject<HTMLDivElement>}
                    onHeadingsExtracted={handleHeadingsExtracted}
                  />

                  {/* 上一篇/下一篇文章导航 */}
                  <DetailNavigation
                    prevItem={prevArticle ? { id: prevArticle.id, title: prevArticle.title } : undefined}
                    nextItem={nextArticle ? { id: nextArticle.id, title: nextArticle.title } : undefined}
                    basePath="/blog"
                  />

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
                  <CommentSection postId={Number(article.id)} />
                </ArticleMain>
              </DetailMainContent>

              {/* 右侧：文章目录 - 桌面端，快速淡入 */}
              <DetailSidebar>
                <ArticleSidebar>
                  <ArticleToc {...tocProps} />
                </ArticleSidebar>
              </DetailSidebar>
            </ArticleLayout>

            {/* 移动端 TOC 书签式导航 - 弹性书签 */}
            {headings.length > 0 && showMobileTocButton && (
              <MobileTocBookmarks>
                <BookmarksListWrapper>
                  {headings.map((heading, index) => {
                    const isActive = activeHeading === heading.id;
                    return (
                      <BookmarkTabWrapper key={heading.id} $isActive={isActive}>
                        <BookmarkTab
                          $isActive={isActive}
                          $level={heading.level}
                          initial={{ opacity: 0, x: -20, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{
                            ...springPresets.bouncy, // 使用弹性预设
                            delay: index * 0.03,
                          }}
                        />
                        <BookmarkTitle $isActive={isActive}>
                          {heading.text.length > 15 ? `${heading.text.substring(0, 15)}...` : heading.text}
                        </BookmarkTitle>
                      </BookmarkTabWrapper>
                    );
                  })}
                </BookmarksListWrapper>

                {/* 操作工具栏 - 弹性入场 */}
                <BookmarkActions
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ ...springPresets.bouncy, delay: 0.2 }}
                >
                  {/* 点赞按钮 - 弹性交互 */}
                  <motion.button
                    className={liked ? 'active' : ''}
                    onClick={handleLike}
                    aria-label="点赞"
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    transition={springPresets.bouncy}
                  >
                    <FiHeart />
                  </motion.button>

                  {/* 收藏按钮 - 弹性交互 */}
                  <motion.button
                    className={bookmarked ? 'active' : ''}
                    onClick={handleBookmark}
                    aria-label="收藏"
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    transition={springPresets.bouncy}
                  >
                    <FiBookmark />
                  </motion.button>

                  {/* 分享按钮 - 弹性交互 */}
                  <motion.button
                    onClick={handleShare}
                    aria-label="分享"
                    whileHover={{ scale: 1.15, y: -4, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    transition={springPresets.bouncy}
                  >
                    <FiShare2 />
                  </motion.button>
                </BookmarkActions>
              </MobileTocBookmarks>
            )}
          </PageContainer>
        </DetailPageLayout>
      )}
    </>
  );
};

export default BlogDetail;
