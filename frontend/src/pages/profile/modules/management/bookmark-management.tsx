import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookmark, FiTrash2, FiEye, FiHeart, FiClock, FiSearch, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { Button, Input, InfiniteScroll } from 'adnaan-ui';
import { API } from '@/utils/api';
import { formatDate } from '@/utils';

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

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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

const Content = styled.div`
  min-height: 400px;
`;

const BookmarksList = styled.div`
  padding: 1rem;
`;

const BookmarkCard = styled(motion.div)`
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

const BookmarkHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const BookmarkTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const BookmarkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${BookmarkCard}:hover & {
    opacity: 1;
  }
`;

const BookmarkContent = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BookmarkMeta = styled.div`
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
    opacity: 0.8;
  }
`;

// 组件接口
interface BookmarkManagementProps {
  className?: string;
}

// 收藏接口
interface Bookmark {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
  post?: {
    id: number;
    title: string;
    summary?: string;
    viewCount: number;
    likeCount: number;
    createdAt: string;
    status: number;
  };
}

// 统计数据接口
interface BookmarkStats {
  totalBookmarks: number;
}

const BookmarkManagement: React.FC<BookmarkManagementProps> = ({ className }) => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [stats, setStats] = useState<BookmarkStats>({
    totalBookmarks: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  // 加载更多数据
  const loadMoreBookmarks = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await API.article.getUserBookmarks({
        page: page + 1,
        limit: 10,
        search: searchQuery || undefined,
      });

      const newBookmarks = response.data || [];
      setBookmarks((prev) => [...prev, ...newBookmarks]);
      setPage((prev) => prev + 1);

      // 检查是否还有更多数据
      const totalPages = response.meta?.pagination?.totalPages || 1;
      setHasMore(page + 1 < totalPages);
    } catch (err: any) {
      console.error('加载收藏失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, error, searchQuery]);

  // 重新加载数据
  const reloadBookmarks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const response = await API.article.getUserBookmarks({
        page: 1,
        limit: 10,
        search: searchQuery || undefined,
      });

      const newBookmarks = response.data || [];
      setBookmarks(newBookmarks);

      // 检查是否还有更多数据
      const totalPages = response.meta?.pagination?.totalPages || 1;
      setHasMore(1 < totalPages);

      // 计算统计数据
      calculateStats(newBookmarks);
    } catch (err: any) {
      console.error('加载收藏失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 计算统计数据
  const calculateStats = (bookmarksList: Bookmark[]) => {
    const newStats: BookmarkStats = {
      totalBookmarks: bookmarksList.length,
    };
    setStats(newStats);
  };

  // 初始化
  useEffect(() => {
    reloadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 搜索变化时重新加载
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadBookmarks();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // 处理取消收藏
  const handleRemoveBookmark = async (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = await adnaan.confirm.delete('确定要取消收藏这篇文章吗？', '确认取消');
    if (!confirmed) return;

    try {
      await API.article.toggleBookmark(bookmark.postId);

      adnaan.toast.success('取消收藏成功');
      const updatedBookmarks = bookmarks.filter((b) => b.id !== bookmark.id);
      setBookmarks(updatedBookmarks);
      calculateStats(updatedBookmarks);
    } catch (error: any) {
      adnaan.toast.error(error.message || '取消收藏失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    reloadBookmarks();
  };

  // 处理卡片点击
  const handleCardClick = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  return (
    <Container className={className}>
      <Header>
        <HeaderTop>
          <HeaderLeft>
            <Title>我的收藏</Title>
            <StatsContainer>
              <StatItem>
                <span className="number">{stats.totalBookmarks}</span>
                <span>篇</span>
              </StatItem>
            </StatsContainer>
          </HeaderLeft>
        </HeaderTop>

        <HeaderRight>
          <SearchContainer>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索收藏..."
              leftIcon={<FiSearch />}
              variant="filled"
              size="small"
            />
          </SearchContainer>
          <Button variant="secondary" onClick={handleRefresh}>
            <FiRefreshCw size={14} />
          </Button>
        </HeaderRight>
      </Header>

      <Content>
        <InfiniteScroll
          hasMore={hasMore}
          loading={isLoading}
          error={error}
          onLoadMore={loadMoreBookmarks}
          onRetry={reloadBookmarks}
          itemCount={bookmarks.length}
          maxHeight="calc(100vh - 400px)"
          emptyComponent={
            <EmptyState>
              <h3>暂无收藏</h3>
              <p>还没有收藏任何文章</p>
            </EmptyState>
          }
        >
          <BookmarksList>
            <AnimatePresence>
              {bookmarks.map((bookmark, index) => (
                <BookmarkCard
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCardClick(bookmark.postId)}
                >
                  <BookmarkHeader>
                    <BookmarkTitle>{bookmark.post?.title || `文章 #${bookmark.postId}`}</BookmarkTitle>
                    <BookmarkActions>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => handleRemoveBookmark(bookmark, e)}
                        style={{
                          width: '2rem',
                          height: '2rem',
                          padding: 0,
                          minWidth: 'auto',
                          minHeight: 'auto',
                        }}
                      >
                        <FiTrash2 size={14} />
                      </Button>
                    </BookmarkActions>
                  </BookmarkHeader>

                  {bookmark.post?.summary && <BookmarkContent>{bookmark.post.summary}</BookmarkContent>}

                  <BookmarkMeta>
                    <MetaItem>
                      <FiBookmark size={12} />
                      收藏于 {formatDate(bookmark.createdAt, 'YYYY-MM-DD HH:mm')}
                    </MetaItem>
                    {bookmark.post && (
                      <>
                        <MetaItem>
                          <FiCalendar size={12} />
                          {formatDate(bookmark.post.createdAt, 'YYYY-MM-DD')}
                        </MetaItem>
                        <MetaItem>
                          <FiEye size={12} />
                          {bookmark.post.viewCount}
                        </MetaItem>
                        <MetaItem>
                          <FiHeart size={12} />
                          {bookmark.post.likeCount}
                        </MetaItem>
                      </>
                    )}
                  </BookmarkMeta>
                </BookmarkCard>
              ))}
            </AnimatePresence>
          </BookmarksList>
        </InfiniteScroll>
      </Content>
    </Container>
  );
};

export default BookmarkManagement;
