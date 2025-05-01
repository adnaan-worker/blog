import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiTag,
  FiUser,
  FiShare2,
  FiHeart,
  FiBookmark,
  FiArrowLeft,
} from 'react-icons/fi';
import {
  PageContainer,
  ArticleDetailContainer,
  ArticleDetailHeader,
  ArticleDetailTitle,
  ArticleDetailMeta,
  ArticleCover,
  ArticleContent2,
  ArticleActionButton,
  ArticleTags,
  ArticleTag,
  RelatedArticles,
  RelatedTitle,
  CommentSection,
  CommentTitle,
  CommentForm,
  CommentInput,
  SubmitButton,
  BlogSidebar,
  SidebarCard,
  TimelineArticleComponent,
  fadeInUpVariants,
  staggerContainerVariants,
} from '../components/blog/BlogComponents';
import styled from '@emotion/styled';

// 示例文章数据（与博客页面相同）
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
    image: 'https://via.placeholder.com/800x450?text=Vue+TypeScript',
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
    image: 'https://via.placeholder.com/800x450?text=React+18',
    author: 'Adnaan',
    content: `
      <h2>React 18的并发特性</h2>
      <p>React 18引入了并发渲染（Concurrent Rendering）机制，这是React架构的重大改进，允许React中断、恢复渲染过程，从而实现更流畅的用户体验。</p>
      
      <h2>Suspense组件的应用</h2>
      <p>Suspense允许组件在渲染前"等待"某些操作完成，同时显示回退内容，极大简化了加载状态的处理逻辑。</p>
    `,
  },
  // 其他文章数据与Blog.tsx中的相同
];

// 文章类型定义
interface Article {
  id: number;
  title: string;
  date: string;
  category: string;
  tags?: string[];
  views: number;
  readTime: number;
  excerpt: string;
  image: string;
  author?: string;
  content?: string;
}

// 通用页面渐入动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// 文章目录容器 - 使用sticky定位实现吸顶效果
const TocContainer = styled.div`
  width: 280px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 12px;
  transition: all 0.3s ease;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.2);
    border-radius: 4px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(81, 131, 245, 0.4);
  }

  @media (max-width: 860px) {
    position: relative;
    top: 0;
    width: 100%;
    max-height: 300px;
    margin-bottom: 2rem;
  }
`;

// 美化的进度条容器
const ProgressContainer = styled.div`
  position: relative;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

// 进度条基础线
const ProgressTrack = styled.div`
  position: absolute;
  left: 8px;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  
  [data-theme='dark'] & {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// 进度指示器
const ProgressIndicator = styled.div<{ progress: number }>`
  position: absolute;
  left: 8px;
  top: 0;
  width: 2px;
  height: ${props => props.progress}%;
  background: linear-gradient(to bottom, var(--accent-color), var(--accent-color-hover));
  border-radius: 2px;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(81, 131, 245, 0.3);
`;

// 现代化的文章目录项
const TocItem = styled.div<{ active: boolean }>`
  position: relative;
  padding: 8px 0 8px 25px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:before {
    content: '';
    position: absolute;
    left: 7px;
    top: 14px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${props => props.active ? 'var(--accent-color)' : 'rgba(0, 0, 0, 0.15)'};
    transform: ${props => props.active ? 'scale(1.75)' : 'scale(1)'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
    box-shadow: ${props => props.active ? '0 0 6px rgba(81, 131, 245, 0.6)' : 'none'};
    
    [data-theme='dark'] & {
      background-color: ${props => props.active ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.15)'};
    }
  }
  
  &:hover:before {
    transform: scale(1.75);
    background-color: var(--accent-color);
    box-shadow: 0 0 6px rgba(81, 131, 245, 0.6);
  }
  
  span {
    font-size: 0.9rem;
    color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
    font-weight: ${props => props.active ? '500' : 'normal'};
    transition: all 0.2s ease;
    display: block;
    line-height: 1.4;
    position: relative;
    z-index: 1;
  }
  
  &:hover span {
    color: var(--accent-color);
    transform: translateX(2px);
  }
  
  /* 活跃项的背景效果 */
  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: ${props => props.active ? '100%' : '0%'};
    height: 100%;
    background-color: ${props => props.active ? 'rgba(81, 131, 245, 0.06)' : 'transparent'};
    border-radius: 4px;
    z-index: 0;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover:after {
    width: 100%;
    background-color: rgba(81, 131, 245, 0.06);
  }
`;

// 文章布局容器 - 调整结构确保侧边栏有足够空间
const ArticleLayout = styled.div`
  display: flex;
  gap: 2rem;
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

// 侧边栏容器 - 使用position: sticky正常工作所需的设置
const ArticleSidebar = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 80px; /* 吸顶位置 */
  width: 280px;
  height: fit-content; /* 确保侧边栏高度适应内容 */
  align-self: flex-start; /* 保证侧边栏从顶部开始 */
  
  @media (max-width: 860px) {
    width: 100%;
    order: -1;
  }
`;

// 美化的社交操作按钮容器
const SocialActionContainer = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding: 1rem 0 0.5rem;
  border-top: 1px solid var(--border-color);
  justify-content: space-between;
  
  @media (max-width: 860px) {
    justify-content: space-around;
  }
`;

// 美化的操作按钮
const ActionButton = styled.button<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  flex: 1;
  
  .icon-wrapper {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: ${props => props.active ? 'rgba(81, 131, 245, 0.1)' : 'transparent'};
    transition: all 0.2s ease;
  }
  
  svg {
    color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
    transition: all 0.2s ease;
  }
  
  span {
    font-size: 0.75rem;
    color: ${props => props.active ? 'var(--accent-color)' : 'var(--text-secondary)'};
    font-weight: ${props => props.active ? '500' : 'normal'};
    transition: all 0.2s ease;
  }
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.05);
    
    .icon-wrapper {
      background-color: rgba(81, 131, 245, 0.12);
      transform: scale(1.1);
    }
    
    svg {
      color: var(--accent-color);
    }
    
    span {
      color: var(--accent-color);
    }
  }
  
  &:active .icon-wrapper {
    transform: scale(0.95);
  }
`;

// 修改SidebarCard样式，更美观
const StyledSidebarCard = styled(SidebarCard)`
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    position: relative;
    padding-bottom: 0.75rem;
    color: var(--text-primary);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-color), transparent);
      border-radius: 2px;
    }
  }
  
  [data-theme='dark'] & {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.05);
  }
`;

// 博客详情页组件实现
const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [headings, setHeadings] = useState<{id: string, text: string}[]>([]);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<Map<string, HTMLElement>>(new Map());

  // 提取文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 300));
      const foundArticle = DUMMY_ARTICLES.find((article) => article.id === Number(id));
      setArticle(foundArticle || null);
      setLoading(false);

      // 加载相关文章
      if (foundArticle) {
        const related = DUMMY_ARTICLES.filter(
          (a) =>
            a.id !== foundArticle.id &&
            (a.category === foundArticle.category || a.tags?.some((tag) => foundArticle.tags?.includes(tag))),
        ).slice(0, 3);
        setRelatedArticles(related);
      }
    };

    fetchArticle();
  }, [id]);

  // 提取文章中的标题
  useEffect(() => {
    if (article?.content) {
      setTimeout(() => {
        const articleElement = articleRef.current;
        if (articleElement) {
          const headingElements = articleElement.querySelectorAll('h2, h3');
          const extractedHeadings: {id: string, text: string}[] = [];
          const newHeadingRefs = new Map();
          
          headingElements.forEach((heading, index) => {
            const id = `heading-${index}`;
            const text = heading.textContent || '';
            heading.id = id;
            extractedHeadings.push({ id, text });
            newHeadingRefs.set(id, heading as HTMLElement);
          });
          
          setHeadings(extractedHeadings);
          headingRefs.current = newHeadingRefs;
        }
      }, 100);
    }
  }, [article]);

  // 优化的滚动监听逻辑
  useEffect(() => {
    // 估计的导航栏高度
    const headerHeight = 80;
    
    // 函数：计算阅读进度
    const calculateReadingProgress = () => {
      if (articleRef.current) {
        const { top, height } = articleRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // 如果文章顶部在视窗之上
        if (top <= 0) {
          // 计算真实阅读进度，考虑滚动位置
          const scrollTop = Math.abs(top);
          const totalScrollableHeight = height - windowHeight;
          
          if (totalScrollableHeight <= 0) {
            // 如果文章完全可见，进度为100%
            return 100;
          }
          
          const scrollProgress = Math.min(scrollTop / totalScrollableHeight, 1);
          return Math.round(scrollProgress * 100);
        }
        
        // 文章顶部在视窗内，但还没开始滚动
        return 0;
      }
      
      return 0;
    };
    
    // 函数：查找当前活跃标题
    const findActiveHeading = () => {
      // 如果没有标题，直接返回
      if (headings.length === 0 || !articleRef.current) return;
      
      // 获取所有标题的位置信息和可见度
      const headingVisibility = headings.map(heading => {
        const element = headingRefs.current.get(heading.id);
        if (!element) return { id: heading.id, top: 0, visible: false, distance: Infinity };
        
        const rect = element.getBoundingClientRect();
        const top = rect.top;
        // 判断标题是否在可视区域(考虑顶部导航)
        const visible = top >= headerHeight && top <= window.innerHeight * 0.6; // 只考虑上半部分为可见
        // 计算标题距离视窗顶部的距离(考虑headerHeight)
        const distance = Math.abs(top - headerHeight);
        
        return { id: heading.id, top, visible, distance };
      });
      
      // 尝试找到可见的标题，选择最靠近顶部的
      const visibleHeadings = headingVisibility.filter(h => h.visible);
      
      if (visibleHeadings.length > 0) {
        // 找到距离顶部最近的可见标题
        const closestHeading = visibleHeadings.reduce((prev, curr) => 
          prev.distance < curr.distance ? prev : curr);
        
        if (closestHeading.id !== activeHeading) {
          setActiveHeading(closestHeading.id);
          return;
        }
      }
      
      // 如果没有可见标题，找到最后一个已经滚过的标题
      // 即top < headerHeight的标题中最后一个
      const passedHeadings = headingVisibility
        .filter(h => h.top < headerHeight)
        .sort((a, b) => b.top - a.top); // 按照top从大到小排序
      
      if (passedHeadings.length > 0) {
        const lastPassedHeading = passedHeadings[0];
        if (lastPassedHeading.id !== activeHeading) {
          setActiveHeading(lastPassedHeading.id);
          return;
        }
      }
      
      // 如果没有已滚过的标题，选择第一个
      if (headings.length > 0 && activeHeading !== headings[0].id) {
        setActiveHeading(headings[0].id);
      }
    };
    
    // 节流函数，防止过于频繁的更新
    const throttle = (func: Function, delay: number) => {
      let lastCall = 0;
      return function(...args: any[]) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func(...args);
        }
      };
    };
    
    // 主滚动处理函数
    const handleScroll = throttle(() => {
      requestAnimationFrame(() => {
        // 计算阅读进度
        const progress = calculateReadingProgress();
        setReadingProgress(progress);
        
        // 查找当前活跃标题
        findActiveHeading();
      });
    }, 30); // 30ms节流
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    
    // 初始调用一次以设置初始状态
    handleScroll();
    
    // 当组件卸载时移除监听
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings, activeHeading]);

  // 改进的滚动到指定标题函数
  const scrollToHeading = (id: string) => {
    const element = headingRefs.current.get(id);
    if (!element) return;
    
    try {
      // 计算元素的绝对位置
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteTop = rect.top + scrollTop;
      
      // 获取header高度进行调整
      const header = document.querySelector('header');
      const headerHeight = header ? header.clientHeight : 80;
      
      // 滚动到目标位置，减去header高度和额外间距
      window.scrollTo({
        top: absoluteTop - headerHeight - 16,
        behavior: 'smooth'
      });
      
      // 视觉反馈：高亮效果
      element.classList.add('highlight-heading');
      setTimeout(() => {
        element.classList.remove('highlight-heading');
      }, 2000);
      
      // 延迟更新活跃标题，等待滚动完成
      const scrollTimeout = setTimeout(() => {
        setActiveHeading(id);
        // 在滚动完成后，再次运行查找标题函数以确保同步
        setTimeout(() => {
          const findActiveHeadingEvent = new Event('scroll');
          window.dispatchEvent(findActiveHeadingEvent);
        }, 100);
      }, 500);
      
      return () => clearTimeout(scrollTimeout);
    } catch (error) {
      console.error("Error scrolling to heading:", error);
    }
  };

  // 处理评论提交
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    alert(`评论已提交: ${commentText}`);
    setCommentText('');
  };

  // 处理点赞
  const handleLike = () => setLiked(!liked);

  // 处理收藏
  const handleBookmark = () => setBookmarked(!bookmarked);

  // 处理分享
  const handleShare = () => {
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
  };

  // 加载状态显示
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // 文章未找到状态
  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        <h2>文章未找到</h2>
        <p>抱歉，找不到您请求的文章</p>
        <Link
          to="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginTop: '1rem',
            color: 'var(--accent-color)',
            gap: '0.5rem',
          }}
        >
          <FiArrowLeft /> 返回博客列表
        </Link>
      </div>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        {/* 顶部导航 - 只保留返回按钮 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              gap: '0.3rem',
            }}
          >
            <FiArrowLeft size={14} /> 返回博客列表
          </Link>
        </div>

        {/* 文章主体区域 */}
        <ArticleLayout>
          {/* 左侧：文章内容 */}
          <ArticleMain>
            <ArticleDetailContainer ref={articleRef}>
              <ArticleDetailHeader>
                <ArticleDetailTitle>{article?.title}</ArticleDetailTitle>
                <ArticleDetailMeta>
                  <span><FiCalendar size={16} /> {article?.date}</span>
                  <span><FiClock size={16} /> {article?.readTime} 分钟阅读</span>
                  <span><FiTag size={16} /> {article?.category}</span>
                </ArticleDetailMeta>
              </ArticleDetailHeader>

              <ArticleCover>
                <img src={article?.image} alt={article?.title} />
              </ArticleCover>

              <ArticleContent2 dangerouslySetInnerHTML={{ __html: article?.content || '' }} />

              <ArticleTags>
                {article?.tags?.map((tag: string) => (
                  <ArticleTag key={tag}>{tag}</ArticleTag>
                ))}
              </ArticleTags>
            </ArticleDetailContainer>

            {/* 相关文章 */}
            {relatedArticles.length > 0 && (
              <RelatedArticles>
                <RelatedTitle>相关文章</RelatedTitle>
                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  {relatedArticles.map((relatedArticle, index) => (
                    <motion.div key={relatedArticle.id} variants={fadeInUpVariants} custom={index}>
                      <TimelineArticleComponent article={relatedArticle} />
                    </motion.div>
                  ))}
                </motion.div>
              </RelatedArticles>
            )}

            {/* 评论区 */}
            <CommentSection>
              <CommentTitle>
                评论区 <span>0</span>
              </CommentTitle>

              <CommentForm onSubmit={handleCommentSubmit}>
                <CommentInput
                  placeholder="写下你的评论..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <SubmitButton type="submit">提交评论</SubmitButton>
              </CommentForm>

              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                <p>暂无评论，成为第一个评论的人吧！</p>
              </div>
            </CommentSection>
          </ArticleMain>

          {/* 右侧：文章目录 */}
          <ArticleSidebar>
            <TocContainer>
              <StyledSidebarCard>
                <h3>文章目录</h3>
                <ProgressContainer>
                  <ProgressTrack />
                  <ProgressIndicator progress={readingProgress} />
                  
                  {headings.length > 0 ? (
                    headings.map((heading) => (
                      <TocItem 
                        key={heading.id}
                        active={activeHeading === heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                      >
                        <span>{heading.text}</span>
                      </TocItem>
                    ))
                  ) : (
                    <div style={{ padding: '15px 0 5px 28px', color: 'var(--text-secondary)' }}>
                      文章暂无目录
                    </div>
                  )}
                </ProgressContainer>
                
                {/* 社交分享按钮 */}
                <SocialActionContainer>
                  <ActionButton active={liked} onClick={handleLike}>
                    <div className="icon-wrapper">
                      <FiHeart size={18} />
                    </div>
                    <span>{liked ? '已点赞' : '点赞'}</span>
                  </ActionButton>
                  
                  <ActionButton active={bookmarked} onClick={handleBookmark}>
                    <div className="icon-wrapper">
                      <FiBookmark size={18} />
                    </div>
                    <span>{bookmarked ? '已收藏' : '收藏'}</span>
                  </ActionButton>
                  
                  <ActionButton onClick={handleShare}>
                    <div className="icon-wrapper">
                      <FiShare2 size={18} />
                    </div>
                    <span>分享</span>
                  </ActionButton>
                </SocialActionContainer>
              </StyledSidebarCard>
            </TocContainer>
          </ArticleSidebar>
        </ArticleLayout>
      </motion.div>
    </PageContainer>
  );
};

export default BlogDetail;
