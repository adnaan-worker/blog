import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiEye, FiClock, FiSearch, FiRefreshCw, FiCalendar, FiMessageSquare, FiX } from 'react-icons/fi';
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

const LikesList = styled.div`
  padding: 1rem;
`;

const LikeCard = styled(motion.div)`
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

const LikeHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const LikeTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LikeIcon = styled.div`
  color: var(--error-color);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LikeContent = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LikeMeta = styled.div`
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
interface LikeManagementProps {
  className?: string;
}

// 点赞接口
interface Like {
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
interface LikeStats {
  totalLikes: number;
}

const LikeManagement: React.FC<LikeManagementProps> = ({ className }) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<Like[]>([]);
  const [stats, setStats] = useState<LikeStats>({
    totalLikes: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');

  // 加载更多数据
  const loadMoreLikes = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await API.article.getUserLikes({
        page: page + 1,
        limit: 10,
        search: searchQuery || undefined,
      });

      const newLikes = response.data || [];
      setLikes((prev) => [...prev, ...newLikes]);
      setPage((prev) => prev + 1);

      // 检查是否还有更多数据
      const totalPages = response.meta?.pagination?.totalPages || 1;
      setHasMore(page + 1 < totalPages);
    } catch (err: any) {
      console.error('加载点赞失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, error, searchQuery]);

  // 重新加载数据
  const reloadLikes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const response = await API.article.getUserLikes({
        page: 1,
        limit: 10,
        search: searchQuery || undefined,
      });

      const newLikes = response.data || [];
      setLikes(newLikes);

      // 检查是否还有更多数据
      const totalPages = response.meta?.pagination?.totalPages || 1;
      setHasMore(1 < totalPages);

      // 计算统计数据
      calculateStats(newLikes);
    } catch (err: any) {
      console.error('加载点赞失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
      setLikes([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 计算统计数据
  const calculateStats = (likesList: Like[]) => {
    const newStats: LikeStats = {
      totalLikes: likesList.length,
    };
    setStats(newStats);
  };

  // 初始化
  useEffect(() => {
    reloadLikes();
  }, []);

  // 搜索变化时重新加载
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadLikes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 处理刷新
  const handleRefresh = () => {
    reloadLikes();
  };

  // 处理卡片点击
  const handleCardClick = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  // 处理取消点赞
  const handleUnlike = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation(); // 阻止冒泡到卡片点击事件

    try {
      await API.article.toggleLike(postId);
      adnaan?.toast?.success('已取消点赞');

      // 从列表中移除该项
      setLikes((prev) => prev.filter((like) => like.postId !== postId));

      // 更新统计
      setStats((prev) => ({
        totalLikes: prev.totalLikes - 1,
      }));
    } catch (error: any) {
      adnaan?.toast?.error(error.message || '取消点赞失败');
    }
  };

  return (
    <Container className={className}>
      <Header>
        <HeaderTop>
          <HeaderLeft>
            <Title>我的点赞</Title>
            <StatsContainer>
              <StatItem>
                <span className="number">{stats.totalLikes}</span>
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
              placeholder="搜索点赞..."
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
          onLoadMore={loadMoreLikes}
          onRetry={reloadLikes}
          itemCount={likes.length}
          maxHeight="calc(100vh - 400px)"
          emptyComponent={
            <EmptyState>
              <h3>暂无点赞</h3>
              <p>还没有点赞任何文章</p>
            </EmptyState>
          }
        >
          <LikesList>
            <AnimatePresence>
              {likes.map((like, index) => (
                <LikeCard
                  key={like.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCardClick(like.postId)}
                >
                  <LikeHeader>
                    <LikeTitle>
                      <LikeIcon>
                        <FiHeart size={16} />
                      </LikeIcon>
                      {like.post?.title || `文章 #${like.postId}`}
                    </LikeTitle>
                    <Button
                      variant="outline"
                      size="small"
                      style={{
                        padding: '0.5rem',
                        minWidth: 'auto',
                        minHeight: 'auto',
                      }}
                      onClick={(e) => handleUnlike(e, like.postId)}
                      title="取消点赞"
                    >
                      <FiX size={16} />
                    </Button>
                  </LikeHeader>

                  {like.post?.summary && <LikeContent>{like.post.summary}</LikeContent>}

                  <LikeMeta>
                    <MetaItem>
                      <FiClock size={12} />
                      点赞于 {formatDate(like.createdAt, 'YYYY-MM-DD HH:mm')}
                    </MetaItem>
                    {like.post && (
                      <>
                        <MetaItem>
                          <FiCalendar size={12} />
                          {formatDate(like.post.createdAt, 'YYYY-MM-DD')}
                        </MetaItem>
                        <MetaItem>
                          <FiEye size={12} />
                          {like.post.viewCount}
                        </MetaItem>
                        <MetaItem>
                          <FiHeart size={12} />
                          {like.post.likeCount}
                        </MetaItem>
                      </>
                    )}
                  </LikeMeta>
                </LikeCard>
              ))}
            </AnimatePresence>
          </LikesList>
        </InfiniteScroll>
      </Content>
    </Container>
  );
};

export default LikeManagement;
