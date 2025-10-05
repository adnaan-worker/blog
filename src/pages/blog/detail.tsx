import React, { useState, useEffect, useRef, RefObject, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiHeart, FiBookmark, FiShare2 } from 'react-icons/fi';
import ArticleContent from '@/components/blog/article-content';
import ArticleToc from '@/components/blog/article-toc';
import CommentSection from '@/components/blog/comment-section';
import { Article } from '@/components/blog/article-list';
import styled from '@emotion/styled';
import { useDebugTool, DebugTool } from '@/utils';
import { API, Article as ApiArticle } from '@/utils/api';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 50px;
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

const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 500px;
  width: 100%;
  background: linear-gradient(to right, rgba(var(--gradient-from), 0.3) 0%, rgba(var(--gradient-to), 0.3) 100%);
  mask-image: linear-gradient(var(--mask-gradient-start), var(--mask-gradient-end) 70%);
  animation: fade-in 1s ease 0.2s both;
  z-index: 2;
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
    background: linear-gradient(
      180deg,
      var(--paper-bg-light-start) 0%,
      var(--paper-bg-light-mid) 50%,
      var(--paper-bg-light-end) 100%
    );

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
      radial-gradient(ellipse 1000px 800px at 50% 0%, rgba(var(--gradient-from), 0.06), transparent 60%),
      /* 深色纸张基底 */
        linear-gradient(
          180deg,
          var(--paper-bg-dark-start) 0%,
          var(--paper-bg-dark-mid) 50%,
          var(--paper-bg-dark-end) 100%
        );

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
          rgba(var(--gradient-from), 0.02) 3px,
          rgba(var(--gradient-from), 0.02) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          rgba(var(--gradient-to), 0.02) 3px,
          rgba(var(--gradient-to), 0.02) 4px
        );
      opacity: 0.4;
    }

    /* 添加主题色光斑 */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 30%, rgba(var(--gradient-from), 0.03), transparent 40%),
        radial-gradient(circle at 80% 60%, rgba(var(--gradient-to), 0.03), transparent 40%);
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
  level: number; // 标题级别 2-6
  element: HTMLElement;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
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

  // 使用封装后的调试工具钩子
  const { showDebugInfo, setViewportInfo, toggleDebugInfo } = useDebugTool();

  // 获取文章数据 - 使用useCallback
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
          // 直接返回文章对象
          apiArticle = articleResponse;
        }
      }

      if (apiArticle) {
        // 后端已经返回了前端期望的格式，直接使用
        setArticle(apiArticle);

        // 获取文章列表用于导航
        const listResponse = await API.article.getArticles({ page: 1, pageSize: 100 });

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
          // 后端已经返回了前端期望的格式，直接使用
          const allArticles: Article[] = apiArticles;

          const articleIndex = allArticles.findIndex((a) => a.id === apiArticle.id);

          // 获取上一篇和下一篇文章
          setPrevArticle(articleIndex > 0 ? allArticles[articleIndex - 1] : null);
          setNextArticle(articleIndex < allArticles.length - 1 ? allArticles[articleIndex + 1] : null);

          // 加载相关文章（同分类或同标签）
          const related = allArticles
            .filter(
              (a) =>
                a.id !== apiArticle.id &&
                (a.category === apiArticle.category || a.tags?.some((tag) => apiArticle.tags?.includes(tag))),
            )
            .slice(0, 2);
          setRelatedArticles(related);
        }

        // 评论现在由 CommentSection 组件自行获取

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
  }, [id, fetchArticle]);

  // 提取文章中的标题并设置滚动监听 - 使用useCallback优化
  const setupHeadingsAndScroll = useCallback(() => {
    if (!article?.content || !articleRef.current) return;

    const articleElement = articleRef.current;

    // 查找所有 h2-h6 标题
    const headingElements = Array.from(
      articleElement.querySelectorAll(
        'h2.article-heading, h3.article-heading, h4.article-heading, h5.article-heading, h6.article-heading',
      ),
    );

    if (headingElements.length === 0) return;

    // 处理找到的标题
    const extractedHeadings: DetailPageHeading[] = [];

    headingElements.forEach((element) => {
      const headingId = element.id || '';
      const headingText = element.textContent || '';
      const tagName = element.tagName.toLowerCase();
      const level = parseInt(tagName.substring(1)); // 提取数字部分：h2 -> 2, h3 -> 3

      extractedHeadings.push({
        id: headingId,
        text: headingText,
        level,
        element: element as HTMLElement,
      });
    });

    // 更新标题数据
    setHeadings(extractedHeadings);

    // 定义激活阈值（标题距离视口顶部的距离）
    const ACTIVE_THRESHOLD = 100;

    // 更新活动标题的函数 - 统一的逻辑
    const updateActiveHeading = () => {
      if (headingElements.length === 0) return;

      // 找到所有已经滚过阈值的标题（在阈值上方的）
      const passedHeadings: { element: Element; top: number }[] = [];

      headingElements.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        // 标题的顶部已经超过阈值（在阈值上方）
        if (rect.top <= ACTIVE_THRESHOLD) {
          passedHeadings.push({
            element: heading,
            top: rect.top,
          });
        }
      });

      // 如果有标题滚过了阈值，选择最后一个（最接近阈值的）
      if (passedHeadings.length > 0) {
        // 按 top 值降序排序，选择最接近阈值的（top 值最大的）
        passedHeadings.sort((a, b) => b.top - a.top);
        const activeElement = passedHeadings[0].element as HTMLElement;
        if (activeElement.id) {
          setActiveHeading(activeElement.id);
        }
      } else {
        // 如果没有标题滚过阈值，选择第一个标题
        const firstElement = headingElements[0] as HTMLElement;
        if (firstElement.id) {
          setActiveHeading(firstElement.id);
        }
      }
    };

    // 使用requestAnimationFrame优化滚动事件
    const handleScroll = () => {
      if (scrollHandlerRef.current) {
        window.cancelAnimationFrame(scrollHandlerRef.current);
      }

      scrollHandlerRef.current = window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        if (!articleElement) return;

        // 获取内容区域实际高度及位置
        const contentHeight = articleElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const contentRect = articleElement.getBoundingClientRect();
        const contentTop = contentRect.top + window.scrollY;

        // 计算相对于内容区域的滚动位置
        const relativeScrollTop = Math.max(0, scrollTop - contentTop);
        const scrollableDistance = contentHeight - Math.min(clientHeight, contentHeight);

        // 计算正确的阅读进度
        const progress = Math.min(100, Math.max(0, (relativeScrollTop / Math.max(1, scrollableDistance)) * 100));
        setReadingProgress(Math.round(progress));

        // 更新活动标题
        updateActiveHeading();

        // 如果调试开启，收集调试信息
        if (showDebugInfo) {
          const headingInfo = headingElements.map((el) => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < ACTIVE_THRESHOLD && rect.bottom > 0;
            return {
              id: el.id,
              text: el.textContent || '',
              top: rect.top,
              isVisible,
            };
          });

          setViewportInfo({
            scrollY: window.scrollY,
            viewportTop: ACTIVE_THRESHOLD,
            viewportBottom: window.innerHeight,
            headings: headingInfo,
            activeEl: activeHeading,
          });
        }
      });
    };

    // 使用passive事件减少性能影响
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初始计算
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);

      // 清理动画帧
      if (scrollHandlerRef.current) {
        window.cancelAnimationFrame(scrollHandlerRef.current);
      }
    };
  }, [article, showDebugInfo, activeHeading, setViewportInfo]);

  // 设置标题和滚动监听
  useEffect(() => {
    // 延迟执行，确保DOM已完全加载
    const timer = setTimeout(() => {
      setupHeadingsAndScroll();
    }, 300);

    return () => clearTimeout(timer);
  }, [setupHeadingsAndScroll]);

  // 滚动时显示书签，停止滚动后隐藏
  useEffect(() => {
    let isScrolling = false;
    let hideTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // 显示书签
      if (!isScrolling) {
        setShowMobileTocButton(true);
        isScrolling = true;
      }

      // 清除之前的定时器
      if (hideTimer) {
        clearTimeout(hideTimer);
      }

      // 设置新的定时器：1.5秒后隐藏
      hideTimer = setTimeout(() => {
        setShowMobileTocButton(false);
        isScrolling = false;
      }, 1500);
    };

    // 监听滚动事件
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, []);

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

  // 处理目录项点击 - 平滑滚动到对应标题
  const handleHeadingClick = useCallback(
    (headingId: string) => {
      const heading = headings.find((h) => h.id === headingId);
      if (heading?.element) {
        const headerOffset = 100; // 距离顶部的偏移量
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

  // 使用useMemo缓存TocProps
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
      <PageContainer>
        <PaperBackground />
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
                  {article && <CommentSection postId={Number(article.id)} />}
                </ArticleMain>

                {/* 右侧：文章目录 - 桌面端 */}
                <ArticleSidebar>
                  <ArticleToc {...tocProps} />
                </ArticleSidebar>
              </ArticleLayout>

              {/* 移动端 TOC 书签式导航 - 左侧书签条（滚动时显示） */}
              {headings.length > 0 && showMobileTocButton && (
                <MobileTocBookmarks>
                  {/* 书签列表 */}
                  <BookmarksListWrapper>
                    {headings.map((heading, index) => {
                      const isActive = activeHeading === heading.id;
                      return (
                        <BookmarkTabWrapper key={heading.id} $isActive={isActive}>
                          <BookmarkTab
                            $isActive={isActive}
                            $level={heading.level}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          />
                          <BookmarkTitle $isActive={isActive}>
                            {heading.text.length > 15 ? `${heading.text.substring(0, 15)}...` : heading.text}
                          </BookmarkTitle>
                        </BookmarkTabWrapper>
                      );
                    })}
                  </BookmarksListWrapper>

                  {/* 操作工具栏 - 在所有书签下方 */}
                  <BookmarkActions
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <button className={liked ? 'active' : ''} onClick={handleLike} aria-label="点赞">
                      <FiHeart />
                    </button>
                    <button className={bookmarked ? 'active' : ''} onClick={handleBookmark} aria-label="收藏">
                      <FiBookmark />
                    </button>
                    <button onClick={handleShare} aria-label="分享">
                      <FiShare2 />
                    </button>
                  </BookmarkActions>
                </MobileTocBookmarks>
              )}
            </>
          )}
        </motion.div>
      </PageContainer>
    </>
  );
};

export default BlogDetail;
