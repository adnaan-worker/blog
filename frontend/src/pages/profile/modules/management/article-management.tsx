import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';
import { Button, InfiniteScroll } from 'adnaan-ui';
import { API } from '@/utils/api';
import type { Article, ArticleParams } from '@/types';
import { RichTextParser } from '@/utils/editor/parser';
import { ManagementLayout, type StatItemData, type FilterOption } from '../common/management-layout';
import {
  ItemCard,
  ItemHeader,
  ItemTitle,
  ItemActions,
  ActionButton,
  ItemContent,
  ItemMeta,
  MetaItem,
  StatusBadge,
  TagsContainer,
  Tag,
  EmptyState,
  getMetaIcon,
  getActionIcon,
} from '../common/item-card';
import { useManagementPage } from '../common/management-hooks';

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
  const [showFilters, setShowFilters] = useState(false);

  // 使用 useCallback 包装 fetchFunction，避免每次渲染时创建新的函数引用
  const fetchArticles = useCallback(async (params: ArticleParams) => {
    // 使用个人中心专用接口：管理员看所有，普通用户看自己的
    const response = await API.article.getMyArticles(params);
    // 转换 API 响应格式以匹配 hook 期望的格式
    return {
      success: response.success,
      code: response.code,
      message: response.message,
      data: response.data,
      meta: {
        pagination: response.meta.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        timestamp: response.meta.timestamp,
      },
    };
  }, []);

  // 使用通用管理页面Hook
  const {
    items: articles,
    isLoading,
    hasMore,
    error,
    loadMore,
    reload,
    search,
    filter,
  } = useManagementPage<Article>({
    fetchFunction: fetchArticles,
    initialParams: {
      keyword: '',
      status: undefined,
    },
    limit: 10,
  });

  // 使用 useMemo 计算统计数据，避免不必要的重渲染
  const stats = useMemo<ArticleStats>(() => {
    return {
      totalArticles: articles.length,
      totalViews: articles.reduce((sum, article) => sum + (article.viewCount || 0), 0),
      totalLikes: articles.reduce((sum, article) => sum + (article.likeCount || 0), 0),
      publishedArticles: articles.filter((article) => article.status === 1).length,
      draftArticles: articles.filter((article) => article.status === 0).length,
    };
  }, [articles]);

  // 处理函数
  const handleCreateArticle = () => {
    navigate('/editor/article');
  };

  const handleEditArticle = (article: Article) => {
    navigate(`/editor/article?id=${article.id}`);
  };

  const handleDeleteArticle = async (article: Article) => {
    const confirmed = await adnaan.confirm.delete('确定要删除这篇文章吗？删除后无法恢复。', '删除文章');

    if (!confirmed) return;

    try {
      await API.article.deleteArticle(article.id);
      adnaan.toast.success('文章删除成功');
      reload();
    } catch (error: any) {
      adnaan.toast.error(error.message || '删除失败');
    }
  };

  // 格式化状态显示
  const getStatusText = (status: any): string => {
    if (status === 'published' || status === 1) return '已发布';
    if (status === 'draft' || status === 0) return '草稿';
    return '未知';
  };

  // 统计数据
  const statsData: StatItemData[] = [
    { label: '篇', value: stats.totalArticles },
    { label: '次', value: stats.totalViews, icon: <FiEye size={12} /> },
    { label: '个', value: stats.totalLikes, icon: <FiHeart size={12} /> },
  ];

  // 筛选选项
  const filterOptions: FilterOption[] = [
    { key: 'published', label: '已发布' },
    { key: 'draft', label: '草稿' },
  ];

  return (
    <ManagementLayout
      title="我的文章"
      icon={<FiFileText />}
      stats={statsData}
      searchPlaceholder="搜索文章..."
      searchValue={search.searchQuery}
      onSearchChange={search.setSearchQuery}
      onAdd={handleCreateArticle}
      onRefresh={reload}
      loading={isLoading}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filterOptions={filterOptions}
      selectedFilter={filter.selectedFilter}
      onFilterChange={filter.handleFilterChange}
      showCard={true}
      createButton={
        <Button variant="primary" onClick={handleCreateArticle}>
          <FiPlus size={14} />
          <span style={{ marginLeft: '0.5rem' }}>写文章</span>
        </Button>
      }
    >
      <InfiniteScroll
        hasMore={hasMore}
        loading={isLoading}
        error={error}
        onLoadMore={loadMore}
        onRetry={reload}
        itemCount={articles.length}
        maxHeight="calc(100vh - 400px)"
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
        <div style={{ padding: '1rem' }}>
          <AnimatePresence>
            {articles.map((article, index) => (
              <ItemCard
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ItemHeader>
                  <ItemTitle>{article.title}</ItemTitle>
                  <ItemActions>
                    <ActionButton onClick={() => handleEditArticle(article)}>{getActionIcon('edit')}</ActionButton>
                    <ActionButton onClick={() => handleDeleteArticle(article)}>{getActionIcon('delete')}</ActionButton>
                  </ItemActions>
                </ItemHeader>

                <ItemContent>{article.summary || RichTextParser.extractSummary(article.content || '')}</ItemContent>

                <ItemMeta>
                  <MetaItem>
                    {getMetaIcon('date')}
                    {new Date(article.createdAt || '').toLocaleDateString('zh-CN')}
                  </MetaItem>
                  {article.category && (
                    <MetaItem>
                      {getMetaIcon('category')}
                      {typeof article.category === 'string' ? article.category : article.category.name}
                    </MetaItem>
                  )}
                  <MetaItem>
                    {getMetaIcon('views')}
                    {article.viewCount || 0}
                  </MetaItem>
                  <MetaItem>
                    {getMetaIcon('likes')}
                    {article.likeCount || 0}
                  </MetaItem>
                  <StatusBadge status={article.status === 1 ? 'published' : 'draft'}>
                    <FiFileText size={10} />
                    {getStatusText(article.status)}
                  </StatusBadge>
                </ItemMeta>

                {article.tags && article.tags.length > 0 && (
                  <TagsContainer>
                    {article.tags.map((tag: any) => (
                      <Tag key={typeof tag === 'object' ? tag.id : tag}>{typeof tag === 'object' ? tag.name : tag}</Tag>
                    ))}
                  </TagsContainer>
                )}
              </ItemCard>
            ))}
          </AnimatePresence>
        </div>
      </InfiniteScroll>
    </ManagementLayout>
  );
};

export default ArticleManagement;
