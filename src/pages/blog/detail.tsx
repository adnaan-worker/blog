import React, { useState, useEffect, useRef, RefObject, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ArticleContent from '@/components/blog/article-content';
import ArticleToc from '@/components/blog/article-toc';
import CommentSection from '@/components/blog/comment-section';
import { Article } from '@/components/blog/article-list';
import styled from '@emotion/styled';
import { useDebugTool, DebugTool } from '@/utils';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 50px;
`;

// 示例文章数据
const DUMMY_ARTICLES = [
  {
    id: 1,
    title: 'Vue3 + TypeScript 开发实践与优化技巧',
    date: '2025-04-15',
    category: '前端开发',
    tags: ['Vue', 'TypeScript', '前端'],
    views: 842,
    readTime: 8,
    excerpt: '深入探讨Vue3与TypeScript结合的最佳实践，包括组件设计、状态管理优化、性能调优以及常见陷阱的规避方法。',
    image:
      'https://innei.in/_next/image?url=https%3A%2F%2Fobject.innei.in%2Fbed%2F2025%2F0415_1744729783357.png&w=3840&q=75',
    author: 'Adnaan',
    content: `
      <h2>Vue3与TypeScript结合的优势</h2>
      <p>Vue3的发布带来了对TypeScript的全面支持，使得开发者可以更加便捷地利用TypeScript的类型检查和IDE智能提示功能，提高代码质量和开发效率。</p>
      
      <p>与Vue2相比，Vue3的Composition API设计更加贴合TypeScript的类型系统，解决了Vue2中this指向不明确和类型推断困难的问题。</p>
      
      <h2>组件设计的最佳实践</h2>
      <p>在Vue3+TS的项目中，我们推荐使用以下方式定义组件：</p>
      
      <pre><code>
      // 使用defineComponent包装组件，获得更好的类型推断
      import { defineComponent, ref, computed } from 'vue'
      
      export default defineComponent({
        props: {
          message: {
            type: String,
            required: true
          }
        },
        setup(props) {
          const count = ref(0)
          
          const doubleCount = computed(() => count.value * 2)
          
          const increment = () => {
            count.value++
          }
          
          return {
            count,
            doubleCount,
            increment
          }
        }
      })
      </code></pre>
      
      <h2>状态管理优化</h2>
      <p>在Vue3项目中，我们有多种状态管理方案可选：</p>
      <ul>
        <li>对于简单组件，使用ref和reactive即可</li>
        <li>对于跨组件共享状态，可使用provide/inject</li>
        <li>对于复杂应用，可使用Pinia替代Vuex</li>
      </ul>
      
      <p>Pinia与TypeScript的配合比Vuex更加顺畅，不需要额外的类型声明文件，类型推断更加准确。</p>
      
      <h2>性能调优技巧</h2>
      <p>Vue3本身已经包含了许多性能优化，但我们仍有很多可以进一步优化的地方：</p>
      
      <ol>
        <li>合理使用v-once和v-memo减少不必要的渲染</li>
        <li>使用Suspense和异步组件处理数据加载</li>
        <li>利用keepAlive缓存频繁切换的组件</li>
      </ol>
      
      <h2>常见陷阱的规避</h2>
      <blockquote>
        <p>TypeScript的类型系统很强大，但也有容易导致困惑的地方，特别是在与Vue的响应式系统结合时。</p>
      </blockquote>
      
      <p>一些常见的陷阱包括：</p>
      <ul>
        <li>响应式对象的类型定义问题</li>
        <li>ref解包时的类型丢失</li>
        <li>计算属性的类型推断</li>
      </ul>
      
      <p>通过正确使用泛型和类型断言，我们可以解决这些问题，获得完整的类型检查和代码提示。</p>
    `,
  },
  {
    id: 2,
    title: 'React 18新特性解析：并发渲染与Suspense',
    date: '2025-04-10',
    category: '前端开发',
    tags: ['React', 'JavaScript', '前端'],
    views: 756,
    readTime: 6,
    excerpt: '详细解读React 18中的并发渲染机制，以及Suspense组件如何简化异步数据加载和提升用户体验。',
    image:
      'https://innei.in/_next/image?url=https%3A%2F%2Fobject.innei.in%2Fbed%2F2025%2F0415_1744729783357.png&w=3840&q=75',
    author: 'Adnaan',
    content: `
      <h2>React 18的并发特性</h2>
      <p>React 18引入了并发渲染（Concurrent Rendering）机制，这是React架构的重大改进，允许React中断、恢复渲染过程，从而实现更流畅的用户体验。</p>
      
      <h2>Suspense组件的应用</h2>
      <p>Suspense允许组件在渲染前"等待"某些操作完成，同时显示回退内容，极大简化了加载状态的处理逻辑。</p>
    `,
  },
  // 其他文章数据省略
];

// 示例评论数据
const DUMMY_COMMENTS = [
  {
    id: 1,
    author: '张三',
    date: '2025-04-16 14:30',
    content: '非常实用的文章，我在项目中尝试了Composition API，确实比Options API更适合TypeScript。',
  },
  {
    id: 2,
    author: '李四',
    date: '2025-04-16 15:45',
    content: '文章提到的Pinia确实比Vuex更容易与TypeScript集成，类型提示非常完善，推荐大家尝试。',
  },
];

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

// 添加全屏加载指示器
const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  [data-theme='dark'] & {
    background: rgba(20, 20, 30, 0.8);
  }
`;

// 加载动画
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-secondary);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s infinite linear;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

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
  const [loading, setLoading] = useState(true);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);

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
    setLoading(true);

    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      const articleIndex = DUMMY_ARTICLES.findIndex((article) => article.id === Number(articleId));
      const foundArticle = DUMMY_ARTICLES[articleIndex];

      if (foundArticle) {
        setArticle(foundArticle);

        // 获取上一篇和下一篇文章
        setPrevArticle(articleIndex > 0 ? DUMMY_ARTICLES[articleIndex - 1] : null);
        setNextArticle(articleIndex < DUMMY_ARTICLES.length - 1 ? DUMMY_ARTICLES[articleIndex + 1] : null);

        // 加载相关文章
        const related = DUMMY_ARTICLES.filter(
          (a) =>
            a.id !== foundArticle.id &&
            (a.category === foundArticle.category || a.tags?.some((tag) => foundArticle.tags?.includes(tag))),
        ).slice(0, 2);
        setRelatedArticles(related);

        // 加载评论
        setComments(DUMMY_COMMENTS);

        // 从本地存储中读取点赞和收藏状态
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
        const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');

        setLiked(likedArticles.includes(Number(articleId)));
        setBookmarked(bookmarkedArticles.includes(Number(articleId)));
      } else {
        setArticle(null);
        setPrevArticle(null);
        setNextArticle(null);
        setRelatedArticles([]);
        setComments([]);
      }
    } catch (error) {
      console.error('获取文章失败', error);
      setArticle(null);
    } finally {
      setLoading(false);
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

  // 设置标题和观察器
  useEffect(() => {
    // 延迟执行，确保DOM已完全加载
    const timer = setTimeout(() => {
      setupHeadingsAndObserver();
    }, 300);

    return () => clearTimeout(timer);
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

  // 文章未找到
  if (!loading && !article) {
    return (
      <NotFoundContainer>
        <h2>文章未找到</h2>
        <p>抱歉，找不到您请求的文章</p>
        <BackLink to="/blog">
          <FiArrowLeft /> 返回博客列表
        </BackLink>
      </NotFoundContainer>
    );
  }

  return (
    <PageContainer>
      {/* 加载指示器 */}
      <AnimatePresence>
        {loading && (
          <LoadingOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner />
          </LoadingOverlay>
        )}
      </AnimatePresence>

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

        {!loading && article && (
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
  );
};

export default BlogDetail;
