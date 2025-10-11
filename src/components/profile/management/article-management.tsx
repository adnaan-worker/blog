import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiFileText,
  FiHeart,
  FiCalendar,
  FiClock,
  FiFolder,
  FiTag,
  FiSearch,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import { Button, Input, InfiniteScroll } from 'adnaan-ui';
import { API, Article, ArticleParams } from '@/utils/api';
import { RichTextParser } from '@/utils/rich-text-parser';

// 样式组件
const Container = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--border-color);
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);

  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;

  .number {
    font-weight: 600;
    color: var(--accent-color);
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 150px;
  flex: 1;
  max-width: 100%;

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
  }
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 0.9rem;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.1)')};
  }
`;

const Content = styled.div`
  min-height: 400px;
`;

const FilterBar = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterTag = styled.button<{ active?: boolean }>`
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.1)')};
  }
`;

const ArticlesList = styled.div`
  padding: 1rem;
`;

const ArticleCard = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ArticleHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const ArticleTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const ArticleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${ArticleCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color);
    color: white;
  }
`;

const ArticleContent = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const StatusBadge = styled.div<{ status?: string }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case 'published':
        return 'rgba(34, 197, 94, 0.1)';
      case 'draft':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'published':
        return '#22c55e';
      case 'draft':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.2rem 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;

  &::before {
    content: '#';
    opacity: 0.6;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-tertiary);

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  p {
    font-size: 0.9rem;
    margin-bottom: 2rem;
    opacity: 0.8;
  }
`;

// 组件接口
interface ArticleManagementProps {
  className?: string;
}

// 统计数据接口
interface ArticleStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  publishedArticles: number;
  draftArticles: number;
}

const ArticleManagement: React.FC<ArticleManagementProps> = ({ className }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    publishedArticles: 0,
    draftArticles: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // 筛选和搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // 编辑器状态

  // 加载更多数据
  const loadMoreArticles = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    try {
      setIsLoading(true);
      setError(null);

      const params: ArticleParams = {
        page: page + 1,
        pageSize: 10,
        keyword: searchQuery || undefined,
        categoryId: selectedCategory,
      };

      const response = await API.article.getArticles(params);
      const newArticles = response.data || [];
      const pagination = response.meta?.pagination || { totalPages: 1 };

      setArticles((prev) => [...prev, ...newArticles]);
      setHasMore(page + 1 < pagination.totalPages);
      setPage(page + 1);
      setTotalItems((prev) => prev + newArticles.length);
    } catch (err: any) {
      console.error('加载更多文章失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, error, searchQuery, selectedCategory]);

  // 重新加载数据（搜索/筛选时使用）
  const reloadArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const params: ArticleParams = {
        page: 1,
        pageSize: 10,
        keyword: searchQuery || undefined,
        categoryId: selectedCategory,
      };

      const response = await API.article.getArticles(params);
      const newArticles = response.data || [];
      const pagination = response.meta?.pagination || { totalPages: 1 };

      setArticles(newArticles);
      setHasMore(1 < pagination.totalPages);
      setTotalItems(newArticles.length);

      // 计算统计数据
      calculateStats(newArticles);
    } catch (err: any) {
      console.error('加载文章失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  // 计算统计数据
  const calculateStats = (articlesList: Article[]) => {
    const newStats: ArticleStats = {
      totalArticles: articlesList.length,
      totalViews: articlesList.reduce((sum, article) => sum + (article.viewCount || 0), 0),
      totalLikes: articlesList.reduce((sum, article) => sum + (article.likeCount || 0), 0),
      publishedArticles: articlesList.filter((article) => article.status === 1).length,
      draftArticles: articlesList.filter((article) => article.status === 0).length,
    };
    setStats(newStats);
  };

  // 初始化 - 只在组件挂载时执行一次
  useEffect(() => {
    reloadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 搜索和筛选变化时重新加载（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadArticles();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedStatus, selectedCategory]);

  // 处理创建文章
  const handleCreateArticle = () => {
    navigate('/editor/article');
  };

  // 处理编辑文章
  const handleEditArticle = (article: Article) => {
    navigate(`/editor/article?id=${article.id}`);
  };

  // 处理删除文章
  const handleDeleteArticle = async (article: Article) => {
    const confirmed = await adnaan.confirm.delete('确定要删除这篇文章吗？删除后无法恢复。', '删除文章');

    if (!confirmed) return;

    try {
      await API.article.deleteArticle(article.id);
      adnaan.toast.success('文章删除成功');
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      calculateStats(articles.filter((a) => a.id !== article.id));
    } catch (error: any) {
      adnaan.toast.error(error.message || '删除失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    reloadArticles();
  };

  // 过滤状态选项
  const statusOptions = ['已发布', '草稿'];

  // 格式化状态显示
  const getStatusText = (status: any): string => {
    if (status === 'published' || status === 1) return '已发布';
    if (status === 'draft' || status === 0) return '草稿';
    return '未知';
  };

  return (
    <Container className={className}>
      <Header>
        <HeaderTop>
          <HeaderLeft>
            <Title>我的文章</Title>
            <StatsContainer>
              <StatItem>
                <span className="number">{stats.totalArticles}</span>
                <span>篇</span>
              </StatItem>
              <StatItem>
                <FiEye size={12} />
                <span className="number">{stats.totalViews}</span>
              </StatItem>
              <StatItem>
                <FiHeart size={12} />
                <span className="number">{stats.totalLikes}</span>
              </StatItem>
            </StatsContainer>
          </HeaderLeft>
          <Button variant="primary" onClick={handleCreateArticle}>
            <FiPlus size={14} />
            <span style={{ marginLeft: '0.5rem' }}>写文章</span>
          </Button>
        </HeaderTop>

        <HeaderRight>
          <SearchContainer>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文章..."
            />
            <SearchIcon>
              <FiSearch />
            </SearchIcon>
          </SearchContainer>
          <FilterButton active={showFilters} onClick={() => setShowFilters(!showFilters)}>
            <FiFilter size={14} />
            <span style={{ marginLeft: '0.25rem' }}>筛选</span>
          </FilterButton>
          <Button variant="secondary" onClick={handleRefresh}>
            <FiRefreshCw size={14} />
          </Button>
        </HeaderRight>
      </Header>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FilterBar>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>状态：</span>
                <FilterTag active={selectedStatus === ''} onClick={() => setSelectedStatus('')}>
                  全部
                </FilterTag>
                <FilterTag
                  active={selectedStatus === 'published'}
                  onClick={() => setSelectedStatus(selectedStatus === 'published' ? '' : 'published')}
                >
                  已发布
                </FilterTag>
                <FilterTag
                  active={selectedStatus === 'draft'}
                  onClick={() => setSelectedStatus(selectedStatus === 'draft' ? '' : 'draft')}
                >
                  草稿
                </FilterTag>
              </div>
            </FilterBar>
          </motion.div>
        )}
      </AnimatePresence>

      <Content>
        <InfiniteScroll
          hasMore={hasMore}
          loading={isLoading}
          error={error}
          onLoadMore={loadMoreArticles}
          onRetry={reloadArticles}
          itemCount={articles.length}
          maxHeight="calc(100vh - 400px)"
          showScrollToTop={true}
          emptyComponent={
            <EmptyState>
              <h3>还没有文章</h3>
              <p>开始创作你的第一篇文章吧</p>
              <Button variant="primary" onClick={handleCreateArticle}>
                <FiPlus size={14} />
                写第一篇文章
              </Button>
            </EmptyState>
          }
        >
          <ArticlesList>
            <AnimatePresence>
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ArticleHeader>
                    <ArticleTitle>{article.title}</ArticleTitle>
                    <ArticleActions>
                      <ActionButton onClick={() => handleEditArticle(article)}>
                        <FiEdit3 size={14} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteArticle(article)}>
                        <FiTrash2 size={14} />
                      </ActionButton>
                    </ArticleActions>
                  </ArticleHeader>

                  <ArticleContent>
                    {article.summary || RichTextParser.extractSummary(article.content || '')}
                  </ArticleContent>

                  <ArticleMeta>
                    <MetaItem>
                      <FiCalendar size={12} />
                      {new Date(article.createdAt || '').toLocaleDateString('zh-CN')}
                    </MetaItem>
                    {article.category && (
                      <MetaItem>
                        <FiFolder size={12} />
                        {typeof article.category === 'string' ? article.category : article.category.name}
                      </MetaItem>
                    )}
                    <MetaItem>
                      <FiEye size={12} />
                      {article.viewCount || 0}
                    </MetaItem>
                    <MetaItem>
                      <FiHeart size={12} />
                      {article.likeCount || 0}
                    </MetaItem>
                    <StatusBadge status={article.status === 1 ? 'published' : 'draft'}>
                      <FiFileText size={10} />
                      {getStatusText(article.status)}
                    </StatusBadge>
                  </ArticleMeta>

                  {article.tags && article.tags.length > 0 && (
                    <TagsContainer>
                      {article.tags.map((tag: any) => (
                        <Tag key={typeof tag === 'object' ? tag.id : tag}>
                          {typeof tag === 'object' ? tag.name : tag}
                        </Tag>
                      ))}
                    </TagsContainer>
                  )}
                </ArticleCard>
              ))}
            </AnimatePresence>
          </ArticlesList>
        </InfiniteScroll>
      </Content>
    </Container>
  );
};

export default ArticleManagement;
