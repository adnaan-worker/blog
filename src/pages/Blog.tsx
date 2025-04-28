import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBarChart2 } from 'react-icons/fi';
import {
  PageContainer,
  SearchInput,
  Pagination,
  PageNumber,
  fadeInUpVariants,
  staggerContainerVariants,
  // 新组件
  BlogLayoutContainer,
  BlogMainContent,
  BlogSidebar,
  TimelineContainer,
  TimelineArticleComponent,
  SidebarCard,
  CategoryList,
  CategoryItem,
  TagCloud,
  TagItem,
} from '../components/BlogComponents';

// 示例博客文章数据
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
  },
  {
    id: 3,
    title: 'Node.js微服务架构设计与实现',
    date: '2025-04-05',
    category: '后端开发',
    tags: ['Node.js', '微服务', '后端'],
    views: 693,
    readTime: 10,
    excerpt: '从零开始构建一个基于Node.js的微服务系统，涵盖服务发现、负载均衡、熔断机制以及容器化部署。',
    image: 'https://via.placeholder.com/800x450?text=Node.js+Microservices',
  },
  {
    id: 4,
    title: 'CSS Grid与Flexbox布局实战指南',
    date: '2025-04-01',
    category: '前端开发',
    tags: ['CSS', '布局', '前端'],
    views: 581,
    readTime: 5,
    excerpt: '通过实例讲解CSS Grid和Flexbox的使用场景、核心概念以及如何结合两者创建复杂而灵活的页面布局。',
    image: 'https://via.placeholder.com/800x450?text=CSS+Layout',
  },
  {
    id: 5,
    title: 'TypeScript高级类型系统深度剖析',
    date: '2025-03-28',
    category: '编程语言',
    tags: ['TypeScript', '编程语言', '类型系统'],
    views: 724,
    readTime: 12,
    excerpt: '探索TypeScript的高级类型特性，包括条件类型、映射类型、类型推断以及如何利用这些特性编写更安全的代码。',
    image: 'https://via.placeholder.com/800x450?text=TypeScript+Advanced',
  },
  {
    id: 6,
    title: '构建高性能Web应用的最佳实践',
    date: '2025-03-25',
    category: '性能优化',
    tags: ['性能优化', 'Web开发', '最佳实践'],
    views: 865,
    readTime: 9,
    excerpt: '全面介绍提升Web应用性能的策略和技术，从网络请求优化、资源加载到渲染性能和运行时优化的全方位指南。',
    image: 'https://via.placeholder.com/800x450?text=Web+Performance',
  },
  {
    id: 7,
    title: 'GraphQL与RESTful API设计对比',
    date: '2025-03-20',
    category: 'API设计',
    tags: ['GraphQL', 'RESTful', 'API'],
    views: 619,
    readTime: 7,
    excerpt: '分析GraphQL和RESTful API的设计理念、优缺点以及各自适用的场景，帮助开发者选择最适合项目的API方案。',
    image: 'https://via.placeholder.com/800x450?text=GraphQL+vs+REST',
  },
  {
    id: 8,
    title: 'JavaScript异步编程模式演进',
    date: '2025-03-15',
    category: '编程语言',
    tags: ['JavaScript', '异步编程', '编程语言'],
    views: 732,
    readTime: 8,
    excerpt: '从回调函数、Promise到Async/Await，全面回顾JavaScript异步编程模式的发展历程及最佳实践。',
    image: 'https://via.placeholder.com/800x450?text=JS+Async',
  },
  {
    id: 9,
    title: '深入Webpack5：模块联邦与缓存优化',
    date: '2025-03-10',
    category: '工具',
    tags: ['Webpack', '工具', '构建工具'],
    views: 547,
    readTime: 11,
    excerpt: '详细介绍Webpack5的新特性，特别是模块联邦如何实现微前端架构，以及持久化缓存如何提升构建性能。',
    image: 'https://via.placeholder.com/800x450?text=Webpack5',
  },
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
}

// 所有可用分类
const ALL_CATEGORIES = ['全部', '前端开发', '后端开发', '编程语言', '性能优化', 'API设计', '工具'];

// 排序选项
const SORT_OPTIONS = ['最新发布', '最多浏览', '阅读时间'];

// 提取所有标签
const extractAllTags = (articles: Article[]): string[] => {
  const tagSet = new Set<string>();
  articles.forEach((article) => {
    article.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet);
};

// 统计每个分类的文章数量
const countCategoryArticles = (articles: Article[]): Record<string, number> => {
  const counts: Record<string, number> = {
    全部: articles.length,
  };

  articles.forEach((article) => {
    counts[article.category] = (counts[article.category] || 0) + 1;
  });

  return counts;
};

const Blog: React.FC = () => {
  // 状态管理
  const [articles] = useState<Article[]>(DUMMY_ARTICLES);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(DUMMY_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('最新发布');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const articlesPerPage = 5;

  // 计算所有标签和分类统计
  const allTags = useMemo(() => extractAllTags(articles), [articles]);
  const categoryCounts = useMemo(() => countCategoryArticles(articles), [articles]);

  // 当筛选条件变化时更新文章列表
  useEffect(() => {
    let result = [...articles];

    // 应用分类筛选
    if (selectedCategory !== '全部') {
      result = result.filter((article) => article.category === selectedCategory);
    }

    // 应用标签筛选
    if (selectedTag) {
      result = result.filter((article) => article.tags?.includes(selectedTag));
    }

    // 应用搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // 应用排序
    switch (sortBy) {
      case '最新发布':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case '最多浏览':
        result.sort((a, b) => b.views - a.views);
        break;
      case '阅读时间':
        result.sort((a, b) => a.readTime - b.readTime);
        break;
      default:
        break;
    }

    setFilteredArticles(result);
    setCurrentPage(1); // 重置为第一页
  }, [selectedCategory, selectedTag, sortBy, searchQuery, articles]);

  // 计算当前页面显示的文章
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  // 计算页数
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  // 页码变化处理
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // 搜索处理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 分类点击处理
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedTag(null); // 重置标签选择
  };

  // 标签点击处理
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  // 排序点击处理
  const handleSortClick = (sort: string) => {
    setSortBy(sort);
  };

  // 渲染页码
  const renderPagination = () => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <PageNumber key={i} active={i === currentPage} onClick={() => handlePageChange(i)} disabled={i === currentPage}>
          {i}
        </PageNumber>,
      );
    }

    return (
      <Pagination>
        <PageNumber onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          &lt;
        </PageNumber>

        {pageNumbers}

        <PageNumber onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          &gt;
        </PageNumber>
      </Pagination>
    );
  };

  return (
    <PageContainer>
      <BlogLayoutContainer>
        {/* 右侧栏 - 在移动端会显示在顶部 */}
        <BlogSidebar>
          <SidebarCard>
            <h3>搜索文章</h3>
            <div style={{ position: 'relative' }}>
              <SearchInput type="text" placeholder="搜索文章..." value={searchQuery} onChange={handleSearch} />
              <FiSearch
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  opacity: 0.6,
                }}
              />
            </div>
          </SidebarCard>

          <SidebarCard>
            <h3>文章分类</h3>
            <CategoryList>
              {ALL_CATEGORIES.map((category) => (
                <CategoryItem
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span>{category}</span>
                  <span>{categoryCounts[category] || 0}</span>
                </CategoryItem>
              ))}
            </CategoryList>
          </SidebarCard>

          <SidebarCard>
            <h3>热门标签</h3>
            <TagCloud>
              {allTags.map((tag) => (
                <TagItem key={tag} active={selectedTag === tag} onClick={() => handleTagClick(tag)}>
                  {tag}
                </TagItem>
              ))}
            </TagCloud>
          </SidebarCard>

          <SidebarCard>
            <h3>排序方式</h3>
            <CategoryList>
              {SORT_OPTIONS.map((option) => (
                <CategoryItem key={option} active={sortBy === option} onClick={() => handleSortClick(option)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiBarChart2 size={14} /> {option}
                  </span>
                </CategoryItem>
              ))}
            </CategoryList>
          </SidebarCard>
        </BlogSidebar>

        {/* 左侧主内容区域 */}
        <BlogMainContent>
          {filteredArticles.length > 0 ? (
            <>
              <TimelineContainer variants={staggerContainerVariants} initial="hidden" animate="visible">
                {currentArticles.map((article, index) => (
                  <motion.div key={article.id} variants={fadeInUpVariants} custom={index}>
                    <TimelineArticleComponent article={article} />
                  </motion.div>
                ))}
              </TimelineContainer>

              {/* 分页 */}
              {totalPages > 1 && renderPagination()}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                textAlign: 'center',
                padding: '3rem 0',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
              <h3>没有找到匹配的文章</h3>
              <p>尝试修改搜索条件或查看其他分类</p>
            </motion.div>
          )}
        </BlogMainContent>
      </BlogLayoutContainer>
    </PageContainer>
  );
};

export default Blog;
