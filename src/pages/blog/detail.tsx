import React, { useState, useEffect, useRef, RefObject, useCallback, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import ArticleContent from '@/components/blog/ArticleContent';
import ArticleToc from '@/components/blog/ArticleToc';
import CommentSection from '@/components/blog/CommentSection';
import { Article } from '@/components/blog/ArticleList';
import styled from '@emotion/styled';

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

// 通用页面渐入动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

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
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<any[]>(DUMMY_COMMENTS);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  // 目录状态
  const [headings, setHeadings] = useState<DetailPageHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  
  // 引用
  const articleRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // 获取文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      const foundArticle = DUMMY_ARTICLES.find((article) => article.id === Number(id));
      setArticle(foundArticle || null);

      // 加载相关文章
      if (foundArticle) {
        const related = DUMMY_ARTICLES.filter(
          (a) =>
            a.id !== foundArticle.id &&
            (a.category === foundArticle.category || a.tags?.some((tag) => foundArticle.tags?.includes(tag))),
        ).slice(0, 2);
        setRelatedArticles(related);
      }
    };

    // 重置滚动位置到顶部
    window.scrollTo(0, 0);
    
    // 重置状态
    setHeadings([]);
    setActiveHeading('');
    setReadingProgress(0);
    
    // 清理之前的observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    fetchArticle();
  }, [id]);
  
  // 强制初始渲染后滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  // 提取文章中的标题并设置导航
  useEffect(() => {
    if (!article?.content || !articleRef.current) return;
    
    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [article]);
  
  // 在DOM加载完成后提取标题和设置观察器
  useEffect(() => {
    if (!article?.content || !articleRef.current) return;
    
    // 等待DOM完全加载
    const timer = setTimeout(() => {
      const articleElement = articleRef.current;
      if (!articleElement) return;
      
      // 查找所有标题
      const headingElements = Array.from(articleElement.querySelectorAll('h2, h3'));
      if (headingElements.length === 0) return;
      
      console.log('找到标题元素:', headingElements.length);
      
      // 处理找到的标题
      const extractedHeadings: DetailPageHeading[] = [];
      
      headingElements.forEach((element, index) => {
        const headingId = `heading-${index}`;
        const headingText = element.textContent || '';
        
        // 设置标题ID
        element.setAttribute('id', headingId);
        
        // 收集标题信息
        extractedHeadings.push({
          id: headingId,
          text: headingText,
          element: element as HTMLElement
        });
        
        console.log(`标题 ${index}: id=${headingId}, text=${headingText}`);
      });
      
      // 更新标题数据
      setHeadings(extractedHeadings);
      
      // 如果有标题，默认选择第一个
      if (extractedHeadings.length > 0) {
        setActiveHeading(extractedHeadings[0].id);
        console.log('初始活动标题:', extractedHeadings[0].id);
      }
      
      // 创建一个IntersectionObserver来监视标题元素
      const options = {
        rootMargin: '-100px 0px -80% 0px', // 调整这些值以控制何时标记一个标题为"可见"
        threshold: 0.1
      };
      
      // 创建交叉观察器
      const observer = new IntersectionObserver((entries) => {
        // 找到所有进入视口的标题
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.id);
          
        if (visibleHeadings.length > 0) {
          // 使用第一个可见标题作为当前活动标题
          setActiveHeading(visibleHeadings[0]);
          console.log('可见标题:', visibleHeadings[0]);
        }
      }, options);
      
      // 观察所有标题元素
      headingElements.forEach(heading => {
        observer.observe(heading);
      });
      
      // 保存观察器以便后续清理
      observerRef.current = observer;
      
      // 设置滚动监听以计算阅读进度
      const handleScroll = () => {
        if (!articleElement) return;
        
        const scrollTop = window.scrollY;
        const scrollHeight = articleElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // 计算阅读进度
        const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));
        setReadingProgress(progress);
      };
      
      // 添加滚动监听
      window.addEventListener('scroll', handleScroll);
      
      // 初始计算
      handleScroll();
      
      return () => {
        // 清理函数
        if (observer) {
          observer.disconnect();
        }
        window.removeEventListener('scroll', handleScroll);
      };
    }, 500); // 延迟确保DOM已完全渲染
    
    return () => clearTimeout(timer);
  }, [article]);
  
  // 处理目录点击
  const handleTocClick = (headingId: string) => {
    console.log('点击目录项:', headingId);
    
    // 找到对应的标题
    const heading = headings.find(h => h.id === headingId);
    if (!heading) {
      console.error('找不到标题元素:', headingId);
      return;
    }
    
    // 设置活动标题
    setActiveHeading(headingId);
    
    // 滚动到标题位置
    heading.element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    
    // 添加视觉反馈
    heading.element.classList.add('target-highlight');
    setTimeout(() => {
      heading.element.classList.remove('target-highlight');
    }, 1000);
  };

  // 点赞、收藏和分享功能
  const handleLike = () => setLiked(!liked);
  const handleBookmark = () => setBookmarked(!bookmarked);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      }).catch(error => console.log('分享失败', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('链接已复制到剪贴板'))
        .catch(error => console.error('复制失败', error));
    }
  };

  // 文章未找到
  if (!article) {
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
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <BackLink to="/blog">
          <FiArrowLeft /> 返回博客列表
        </BackLink>
        
        <ArticleLayout>
          {/* 左侧：文章内容 */}
          <ArticleMain>
            <ArticleContent 
              article={{
                ...article,
                content: article?.content || '' // 确保content不为undefined
              }}
              contentRef={articleRef as RefObject<HTMLDivElement>} // 类型断言
            />
            
            {/* 相关文章 */}
            {relatedArticles.length > 0 && (
              <RelatedArticles>
                <RelatedTitle>相关文章</RelatedTitle>
                {/* 这里可以使用ArticleList组件显示相关文章 */}
                <div>
                  {relatedArticles.map(related => (
                    <div key={related.id} style={{ marginBottom: '1rem' }}>
                      <h4><Link to={`/blog/${related.id}`}>{related.title}</Link></h4>
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
            <ArticleToc
              headings={headings.map(h => ({ id: h.id, text: h.text }))}
              activeHeading={activeHeading}
              readingProgress={readingProgress}
              onHeadingClick={handleTocClick}
              liked={liked}
              bookmarked={bookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          </ArticleSidebar>
        </ArticleLayout>
      </motion.div>
    </PageContainer>
  );
};

export default BlogDetail;
