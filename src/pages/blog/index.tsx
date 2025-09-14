import React, { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import ArticleList, { Article } from '@/components/blog/article-list';
import BlogSidebar from '@/components/blog/blog-sidebar';
import { API, Article as ApiArticle } from '@/utils/api';

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('最新发布');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'card'>('timeline');
  const articlesPerPage = 5;

  // 获取文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.article.getArticles({ page: 1, pageSize: 100 });

        // 根据实际 API 返回格式处理数据
        let articleList: any[] = [];

        if (response && typeof response === 'object') {
          if ('success' in response && response.success && response.data) {
            // 如果是分页格式 { success, data: { list } }
            const data = response.data as any;
            articleList = data.list || data || [];
          } else if (Array.isArray(response)) {
            // 如果直接返回数组
            articleList = response;
          } else if ('data' in response && Array.isArray(response.data)) {
            // 如果是 { data: [] } 格式
            articleList = response.data;
          }
        }

        if (articleList.length > 0) {
          // 转换 API 数据格式为组件期望的格式
          const convertedArticles: Article[] = articleList.map((apiArticle: any) => ({
            id: Number(apiArticle.id),
            title: apiArticle.title,
            date: apiArticle.publishedAt
              ? new Date(apiArticle.publishedAt).toISOString().split('T')[0]
              : apiArticle.createdAt
              ? new Date(apiArticle.createdAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            category: apiArticle.category?.name || '未分类',
            tags: apiArticle.tags?.map((tag: any) => tag.name) || [],
            views: apiArticle.viewCount || 0,
            readTime: Math.ceil((apiArticle.content?.length || 0) / 200), // 估算阅读时间
            excerpt: apiArticle.summary || apiArticle.content?.substring(0, 150) + '...' || '',
            image: apiArticle.coverImage
              ? `/api/uploads/${apiArticle.coverImage}`
              : 'https://via.placeholder.com/800x450?text=Article',
            author: apiArticle.author?.fullName || apiArticle.author?.username || '匿名',
            content: apiArticle.content,
          }));
          setArticles(convertedArticles);
          setFilteredArticles(convertedArticles);
        } else {
          setError('暂无文章数据');
        }
      } catch (err) {
        console.error('获取文章失败:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>加载中...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error-color)' }}>{error}</div>
          ) : (
            <ArticleList articles={currentArticles} viewMode={viewMode} />
          )}

          {/* 分页控件 */}
          {totalPages > 1 && (
            <Pagination>
              <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                &lt;
              </PageButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PageButton key={page} active={currentPage === page} onClick={() => handlePageChange(page)}>
                  {page}
                </PageButton>
              ))}

              <PageButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
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
