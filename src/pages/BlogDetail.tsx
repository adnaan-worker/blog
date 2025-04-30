import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiTag,
  FiUser,
  FiShare2,
  FiMessageCircle,
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
  ArticleActions,
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
  TagCloud,
  TagItem,
  CategoryList,
  CategoryItem,
  TimelineArticleComponent,
  fadeInUpVariants,
  staggerContainerVariants,
} from '../components/blog/BlogComponents';

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

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 提取所有标签
  const extractAllTags = (articles: Article[]): string[] => {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
      article.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  // 模拟加载文章数据
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);

      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 300));

      const foundArticle = DUMMY_ARTICLES.find((article) => article.id === Number(id));
      setArticle(foundArticle || null);
      setLoading(false);

      // 收集所有标签
      setAllTags(extractAllTags(DUMMY_ARTICLES));

      // 如果找到文章，加载相关文章
      if (foundArticle) {
        // 基于相同分类或标签查找相关文章
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

  // 处理评论提交
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // 这里可以添加提交评论到服务器的逻辑
    alert(`评论已提交: ${commentText}`);
    setCommentText('');
  };

  // 处理点赞
  const handleLike = () => {
    setLiked(!liked);
    // 可以添加向服务器发送点赞状态的逻辑
  };

  // 处理收藏
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // 可以添加向服务器发送收藏状态的逻辑
  };

  // 处理分享
  const handleShare = () => {
    // 基本分享逻辑
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        })
        .catch((error) => console.log('分享失败', error));
    } else {
      // 回退到复制链接
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert('链接已复制到剪贴板'))
        .catch((error) => console.error('复制失败', error));
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          color: 'var(--text-secondary)',
        }}
      >
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ArticleActionButton onClick={handleLike}>
              <FiHeart size={16} color={liked ? 'var(--accent-color)' : undefined} /> {liked ? '已点赞' : '点赞'}
            </ArticleActionButton>
            <ArticleActionButton onClick={handleBookmark}>
              <FiBookmark size={16} color={bookmarked ? 'var(--accent-color)' : undefined} />{' '}
              {bookmarked ? '已收藏' : '收藏'}
            </ArticleActionButton>
            <ArticleActionButton onClick={handleShare}>
              <FiShare2 size={16} /> 分享
            </ArticleActionButton>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* 主要内容区域 */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <ArticleDetailContainer style={{ maxWidth: '100%' }}>
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
                    <FiClock size={16} /> {article.readTime} 分钟阅读
                  </span>
                  <span>
                    <FiTag size={16} /> {article.category}
                  </span>
                </ArticleDetailMeta>
              </ArticleDetailHeader>

              <ArticleCover>
                <img src={article.image} alt={article.title} />
              </ArticleCover>

              <ArticleContent2 dangerouslySetInnerHTML={{ __html: article.content || '' }} />

              <ArticleTags>
                {article.tags?.map((tag: string) => (
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

              <div
                style={{
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  padding: '2rem 0',
                }}
              >
                <p>暂无评论，成为第一个评论的人吧！</p>
              </div>
            </CommentSection>
          </div>

          {/* 侧边栏 */}
          <BlogSidebar style={{ alignSelf: 'flex-start', position: 'sticky', top: '80px' }}>
            <SidebarCard>
              <h3>文章作者</h3>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--accent-color-alpha)',
                  }}
                >
                  <img
                    src="https://foruda.gitee.com/avatar/1715931924378943527/5352827_adnaan_1715931924.png!avatar200"
                    alt={article.author}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{article.author}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>全栈开发者</div>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                喜欢写代码，分享技术心得，探索新技术的前沿。
              </p>
            </SidebarCard>

            <SidebarCard>
              <h3>文章目录</h3>
              <CategoryList>
                <CategoryItem onClick={() => document.querySelector('h2')?.scrollIntoView({ behavior: 'smooth' })}>
                  <span>Vue3与TypeScript结合的优势</span>
                </CategoryItem>
                <CategoryItem
                  onClick={() => document.querySelectorAll('h2')[1]?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span>组件设计的最佳实践</span>
                </CategoryItem>
                <CategoryItem
                  onClick={() => document.querySelectorAll('h2')[2]?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span>状态管理优化</span>
                </CategoryItem>
                <CategoryItem
                  onClick={() => document.querySelectorAll('h2')[3]?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span>性能调优技巧</span>
                </CategoryItem>
                <CategoryItem
                  onClick={() => document.querySelectorAll('h2')[4]?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span>常见陷阱的规避</span>
                </CategoryItem>
              </CategoryList>
            </SidebarCard>

            <SidebarCard>
              <h3>热门标签</h3>
              <TagCloud>
                {allTags.map((tag) => (
                  <TagItem
                    key={tag}
                    active={article.tags?.includes(tag)}
                    onClick={() => (window.location.href = `/blog?tag=${tag}`)}
                  >
                    {tag}
                  </TagItem>
                ))}
              </TagCloud>
            </SidebarCard>
          </BlogSidebar>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default BlogDetail;
