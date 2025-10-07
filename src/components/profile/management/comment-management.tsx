import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare,
  FiTrash2,
  FiExternalLink,
  FiClock,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
} from 'react-icons/fi';
import { Button, Input, InfiniteScroll } from 'adnaan-ui';
import { API, type Comment } from '@/utils/api';
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 200px;

  @media (max-width: 640px) {
    flex: 1;
    min-width: auto;
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
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-color-rgb), 0.1)')};
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
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-color-rgb), 0.1)')};
  }
`;

const CommentsList = styled.div`
  padding: 1rem;
`;

const CommentCard = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  flex: 1;
`;

const PostLink = styled.a`
  color: var(--accent-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${CommentCard}:hover & {
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
    background: var(--error-color);
    color: white;
  }
`;

const CommentContent = styled.div`
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  word-break: break-word;
`;

const CommentMeta = styled.div`
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
      case 'approved':
        return 'rgba(34, 197, 94, 0.1)';
      case 'pending':
        return 'rgba(251, 191, 36, 0.1)';
      case 'spam':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'approved':
        return '#22c55e';
      case 'pending':
        return '#fbbf24';
      case 'spam':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
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
interface CommentManagementProps {
  className?: string;
  isAdmin?: boolean; // 是否为管理员
}

// 统计数据接口
interface CommentStats {
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  spamComments: number;
}

const CommentManagement: React.FC<CommentManagementProps> = ({ className, isAdmin = false }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats>({
    totalComments: 0,
    approvedComments: 0,
    pendingComments: 0,
    spamComments: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // 筛选和搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'approved' | 'pending' | 'spam' | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // 加载更多数据
  const loadMoreComments = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
        status: selectedStatus || undefined,
      };

      // 统一接口，后端根据角色返回不同数据
      const response = await API.comment.getUserComments(params);

      const newComments = response.data || [];

      setComments((prev) => [...prev, ...newComments]);
      setHasMore(page + 1 < (response.meta?.pagination?.totalPages || 1));
      setPage(page + 1);
      setTotalItems((prev) => prev + newComments.length);
    } catch (err: any) {
      console.error('加载评论失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, error, isAdmin, selectedStatus]);

  // 重新加载数据
  const reloadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const params = {
        page: 1,
        limit: 10,
        status: selectedStatus || undefined,
      };

      // 统一接口，后端根据角色返回不同数据
      const response = await API.comment.getUserComments(params);

      const newComments = response.data || [];

      setComments(newComments);
      setHasMore(1 < (response.meta?.pagination?.totalPages || 1));
      setTotalItems(newComments.length);

      // 计算统计数据
      calculateStats(newComments);
    } catch (err: any) {
      console.error('加载评论失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatus, isAdmin]);

  // 计算统计数据
  const calculateStats = (commentsList: Comment[]) => {
    const newStats: CommentStats = {
      totalComments: commentsList.length,
      approvedComments: commentsList.filter((c) => c.status === 'approved').length,
      pendingComments: commentsList.filter((c) => c.status === 'pending').length,
      spamComments: commentsList.filter((c) => c.status === 'spam').length,
    };
    setStats(newStats);
  };

  // 初始化
  useEffect(() => {
    reloadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadComments();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedStatus]);

  // 处理删除评论
  const handleDeleteComment = async (comment: Comment) => {
    const confirmed = await adnaan.confirm.delete('确定要删除这条评论吗？删除后无法恢复。', '删除评论');

    if (!confirmed) return;

    try {
      await API.comment.deleteComment(comment.id);

      adnaan.toast.success('评论删除成功');
      const updatedComments = comments.filter((c) => c.id !== comment.id);
      setComments(updatedComments);
      calculateStats(updatedComments);
      setTotalItems((prev) => prev - 1);
    } catch (error: any) {
      adnaan.toast.error(error.message || '删除失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    reloadComments();
  };

  // 跳转到文章
  const handleGoToPost = (postId: number) => {
    navigate(`/article/${postId}`);
  };

  // 获取状态文本
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'pending':
        return '待审核';
      case 'spam':
        return '已驳回';
      default:
        return status || '未知';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle size={10} />;
      case 'pending':
        return <FiAlertCircle size={10} />;
      case 'spam':
        return <FiXCircle size={10} />;
      default:
        return null;
    }
  };

  return (
    <Container className={className}>
      <Header>
        <HeaderTop>
          <HeaderLeft>
            <Title>{isAdmin ? '评论管理' : '我的评论'}</Title>
            <StatsContainer>
              <StatItem>
                <span className="number">{stats.totalComments}</span>
                <span>条</span>
              </StatItem>
              {isAdmin && (
                <>
                  <StatItem>
                    <FiCheckCircle size={12} />
                    <span className="number">{stats.approvedComments}</span>
                  </StatItem>
                  <StatItem>
                    <FiAlertCircle size={12} />
                    <span className="number">{stats.pendingComments}</span>
                  </StatItem>
                </>
              )}
            </StatsContainer>
          </HeaderLeft>
        </HeaderTop>

        <HeaderRight>
          <SearchContainer>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索评论..."
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
                  active={selectedStatus === 'approved'}
                  onClick={() => setSelectedStatus(selectedStatus === 'approved' ? '' : 'approved')}
                >
                  已通过
                </FilterTag>
                <FilterTag
                  active={selectedStatus === 'pending'}
                  onClick={() => setSelectedStatus(selectedStatus === 'pending' ? '' : 'pending')}
                >
                  待审核
                </FilterTag>
                <FilterTag
                  active={selectedStatus === 'spam'}
                  onClick={() => setSelectedStatus(selectedStatus === 'spam' ? '' : 'spam')}
                >
                  已驳回
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
          onLoadMore={loadMoreComments}
          onRetry={reloadComments}
          itemCount={comments.length}
          maxHeight="calc(100vh - 400px)"
          showScrollToTop={true}
          emptyComponent={
            <EmptyState>
              <h3>暂无评论</h3>
              <p>{isAdmin ? '还没有任何评论' : '你还没有发表过评论'}</p>
            </EmptyState>
          }
        >
          <CommentsList>
            <AnimatePresence>
              {comments.map((comment, index) => (
                <CommentCard
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CommentHeader>
                    <PostInfo>
                      <PostLink onClick={() => handleGoToPost(comment.post_id)}>
                        文章: {comment.post_title || `#${comment.post_id}`}
                        <FiExternalLink size={14} />
                      </PostLink>
                      {comment.parent_id && <span>• 回复 #{comment.parent_id}</span>}
                    </PostInfo>
                    <CommentActions>
                      <ActionButton onClick={() => handleDeleteComment(comment)}>
                        <FiTrash2 size={14} />
                      </ActionButton>
                    </CommentActions>
                  </CommentHeader>

                  <CommentContent>{comment.content}</CommentContent>

                  <CommentMeta>
                    <MetaItem>
                      <FiClock size={12} />
                      {formatDate(comment.createTime || (comment as any).createdAt || '', 'YYYY-MM-DD HH:mm')}
                    </MetaItem>
                    <StatusBadge status={comment.status}>
                      {getStatusIcon(comment.status)}
                      {getStatusText(comment.status)}
                    </StatusBadge>
                  </CommentMeta>
                </CommentCard>
              ))}
            </AnimatePresence>
          </CommentsList>
        </InfiniteScroll>
      </Content>
    </Container>
  );
};

export default CommentManagement;
