import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import ArticleList, { Article } from '@/components/blog/article-list';
import BlogSidebar from '@/components/blog/blog-sidebar';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 50px;
`;

// 博客页面左右布局容器
const BlogLayoutContainer = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 860px) {
    flex-direction: column;
  }
`;

// 博客主内容
const BlogMainContent = styled.div`
  flex: 1;
`;

// 分页控件
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${(props) => (props.active ? 'var(--accent-color)' : 'var(--border-color)')};
  background: ${(props) => (props.active ? 'var(--accent-color-alpha)' : 'var(--bg-primary)')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
    border-color: var(--accent-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: var(--bg-primary);
      color: var(--text-secondary);
      border-color: var(--border-color);
    }
  }
`;

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

// 统计每个分类的文章数量并格式化为侧边栏需要的格式
const formatCategories = (articles: Article[]): { name: string; count: number }[] => {
  const counts: Record<string, number> = {
    全部: articles.length,
  };

  articles.forEach((article) => {
    counts[article.category] = (counts[article.category] || 0) + 1;
  });

  return Object.entries(counts).map(([name, count]) => ({ name, count }));
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
  const [viewMode, setViewMode] = useState<'timeline' | 'card'>('timeline');
  const articlesPerPage = 5;

  // 计算所有标签和分类
  const allTags = useMemo(() => extractAllTags(articles), [articles]);
  const categories = useMemo(() => formatCategories(articles), [articles]);

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
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // 视图模式切换
  const handleViewModeChange = (mode: 'timeline' | 'card') => {
    setViewMode(mode);
  };

  return (
    <PageContainer>
      <BlogLayoutContainer>
        {/* 侧边栏 */}
        <BlogSidebar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          categories={categories}
          selectedTag={selectedTag}
          onTagClick={handleTagClick}
          tags={allTags}
          sortBy={sortBy}
          onSortClick={handleSortClick}
          sortOptions={SORT_OPTIONS}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* 主内容区域 */}
        <BlogMainContent>
          <ArticleList 
            articles={currentArticles} 
            viewMode={viewMode} 
          />
          
          {/* 分页控件 */}
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </PageButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PageButton
                  key={page}
                  active={currentPage === page}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PageButton>
              ))}

              <PageButton 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </PageButton>
            </Pagination>
          )}
        </BlogMainContent>
      </BlogLayoutContainer>
    </PageContainer>
  );
};

export default Blog;
