import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
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
  FiCheck,
  FiX,
  FiList,
  FiGitBranch,
  FiCornerDownRight,
} from 'react-icons/fi';
import { Button, Input, InfiniteScroll } from 'adnaan-ui';
import { API } from '@/utils/api';
import type { Comment } from '@/types';
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

const FilterBar = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CommentsList = styled.div`
  padding: 1rem;
`;

const CommentCard = styled.div<{ depth?: number }>`
  position: relative;
  padding: 0.5rem 0.75rem;
  padding-left: ${(props) => (props.depth || 0) * 2 + 0.75}rem;
  transition: background 0.15s ease;

  /* 树形连接线 - 只在回复评论显示 */
  ${(props) =>
    props.depth && props.depth > 0
      ? `
    &::before {
      content: '└─';
      position: absolute;
      left: ${(props.depth - 1) * 2 + 0.25}rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(var(--text-tertiary-rgb, 107, 114, 126), 0.35);
      font-size: 0.75rem;
      font-family: monospace;
    }
  `
      : ''}

  &:hover {
    background: rgba(var(--accent-rgb, 99, 102, 241), 0.04);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.375rem;
  gap: 0.75rem;
`;

const PostInfo = styled.div<{ depth?: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  flex: 1;
  margin-bottom: ${(props) => (props.depth === 0 ? '0.375rem' : '0')};
`;

const PostLink = styled.a`
  color: var(--accent-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-weight: 500;
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
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  ${CommentCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
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
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  word-break: break-word;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
  white-space: nowrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusBadge = styled.div<{ status?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
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
  const [viewMode, setViewMode] = useState<'flat' | 'tree'>('tree'); // 视图模式：扁平 or 树形

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
  }, []);

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadComments();
    }, 300);
    return () => clearTimeout(timer);
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

  // 处理审核通过
  const handleApproveComment = async (comment: Comment) => {
    try {
      await API.comment.updateCommentStatus(comment.id, 'approved');
      adnaan.toast.success('评论已审核通过');

      // 更新本地状态
      const updatedComments = comments.map((c) =>
        c.id === comment.id ? ({ ...c, status: 'approved' } as Comment) : c,
      );
      setComments(updatedComments);
      calculateStats(updatedComments);
    } catch (error: any) {
      adnaan.toast.error(error.message || '审核失败');
    }
  };

  // 处理审核驳回
  const handleRejectComment = async (comment: Comment) => {
    const confirmed = await adnaan.confirm.delete('确定要驳回这条评论吗？', '驳回评论');
    if (!confirmed) return;

    try {
      await API.comment.updateCommentStatus(comment.id, 'spam');
      adnaan.toast.success('评论已驳回');

      // 更新本地状态
      const updatedComments = comments.map((c) => (c.id === comment.id ? ({ ...c, status: 'spam' } as Comment) : c));
      setComments(updatedComments);
      calculateStats(updatedComments);
    } catch (error: any) {
      adnaan.toast.error(error.message || '驳回失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    reloadComments();
  };

  // 跳转到文章
  const handleGoToPost = (postId: string | number) => {
    navigate(`/blog/${postId}`);
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

  // 递归渲染单个评论节点（树形视图组件）
  const CommentTreeNode: React.FC<{ comment: Comment; depth: number; parentPath?: string }> = ({
    comment,
    depth,
    parentPath = '',
  }) => {
    // 生成唯一的路径标识，避免 key 冲突
    const nodePath = parentPath ? `${parentPath}-${comment.id}` : `${comment.id}`;

    return (
      <>
        <CommentCard depth={depth}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* 左侧：文章链接（仅顶级）或评论内容 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {depth === 0 ? (
                <PostLink onClick={() => handleGoToPost(comment.postId)}>
                  <FiMessageSquare size={13} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {comment.post?.title || `文章 #${comment.postId}`}
                  </span>
                  <FiExternalLink size={11} />
                </PostLink>
              ) : null}
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{comment.content}</span>
            </div>

            {/* 中间：时间和状态 */}
            <CommentMeta>
              <MetaItem>
                <FiClock size={11} />
                {formatDate(comment.createTime || (comment as any).createdAt || '', 'MM-DD HH:mm')}
              </MetaItem>
              <StatusBadge status={comment.status}>
                {getStatusIcon(comment.status)}
                {getStatusText(comment.status)}
              </StatusBadge>
            </CommentMeta>

            {/* 右侧：操作按钮 */}
            <CommentActions>
              {comment.status === 'pending' && (
                <>
                  <ActionButton
                    onClick={() => handleApproveComment(comment)}
                    style={{ color: 'var(--success-color)' }}
                    title="审核通过"
                  >
                    <FiCheck size={13} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleRejectComment(comment)}
                    style={{ color: 'var(--error-color)' }}
                    title="审核驳回"
                  >
                    <FiX size={13} />
                  </ActionButton>
                </>
              )}
              <ActionButton onClick={() => handleDeleteComment(comment)} title="删除">
                <FiTrash2 size={12} />
              </ActionButton>
            </CommentActions>
          </div>
        </CommentCard>

        {/* 递归渲染子回复 - 使用路径作为 key 确保唯一性 */}
        {comment.replies &&
          comment.replies.length > 0 &&
          comment.replies.map((reply) => (
            <CommentTreeNode key={`${nodePath}-${reply.id}`} comment={reply} depth={depth + 1} parentPath={nodePath} />
          ))}
      </>
    );
  };

  // 扁平化评论列表（扁平视图）
  const flattenComments = (comments: Comment[]): Comment[] => {
    const result: Comment[] = [];

    const flatten = (comment: Comment) => {
      result.push(comment);
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(flatten);
      }
    };

    comments.forEach(flatten);
    return result;
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
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索评论..."
              leftIcon={<FiSearch />}
              variant="filled"
              size="small"
            />
          </SearchContainer>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<FiFilter size={14} />}
          >
            筛选
          </Button>
          {isAdmin && (
            <Button
              variant={viewMode === 'tree' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setViewMode(viewMode === 'tree' ? 'flat' : 'tree')}
              title={viewMode === 'tree' ? '切换到扁平视图' : '切换到树形视图'}
              leftIcon={viewMode === 'tree' ? <FiGitBranch size={14} /> : <FiList size={14} />}
            />
          )}
          <Button variant="secondary" size="small" onClick={handleRefresh} leftIcon={<FiRefreshCw size={14} />}>
            刷新
          </Button>
        </HeaderRight>
      </Header>

      {showFilters && (
        <FilterBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>状态：</span>
            <Button
              variant={selectedStatus === '' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setSelectedStatus('')}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              全部
            </Button>
            <Button
              variant={selectedStatus === 'approved' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setSelectedStatus(selectedStatus === 'approved' ? '' : 'approved')}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              已通过
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setSelectedStatus(selectedStatus === 'pending' ? '' : 'pending')}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              待审核
            </Button>
            <Button
              variant={selectedStatus === 'spam' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setSelectedStatus(selectedStatus === 'spam' ? '' : 'spam')}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              已驳回
            </Button>
          </div>
        </FilterBar>
      )}

      <Content>
        <InfiniteScroll
          hasMore={hasMore}
          loading={isLoading}
          error={error}
          onLoadMore={loadMoreComments}
          onRetry={reloadComments}
          itemCount={comments.length}
          maxHeight="calc(100vh - 400px)"
          emptyComponent={
            <EmptyState>
              <h3>暂无评论</h3>
              <p>{isAdmin ? '还没有任何评论' : '你还没有发表过评论'}</p>
            </EmptyState>
          }
        >
          <CommentsList>
            {viewMode === 'tree'
              ? // 树形视图
                comments.map((comment) => (
                  <CommentTreeNode key={`tree-${comment.id}`} comment={comment} depth={0} parentPath="" />
                ))
              : // 扁平视图
                flattenComments(comments).map((comment) => (
                  <CommentCard key={`flat-${comment.id}`} depth={0}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <PostLink onClick={() => handleGoToPost(comment.postId)}>
                          <FiMessageSquare size={13} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {comment.post?.title || `文章 #${comment.postId}`}
                          </span>
                          <FiExternalLink size={11} />
                          {comment.parentId && <span style={{ marginLeft: '0.5rem' }}>• 回复</span>}
                        </PostLink>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                          {comment.content}
                        </span>
                      </div>

                      <CommentMeta>
                        <MetaItem>
                          <FiClock size={11} />
                          {formatDate(comment.createTime || (comment as any).createdAt || '', 'MM-DD HH:mm')}
                        </MetaItem>
                        <StatusBadge status={comment.status}>
                          {getStatusIcon(comment.status)}
                          {getStatusText(comment.status)}
                        </StatusBadge>
                      </CommentMeta>

                      <CommentActions>
                        {comment.status === 'pending' && (
                          <>
                            <ActionButton
                              onClick={() => handleApproveComment(comment)}
                              style={{ color: 'var(--success-color)' }}
                              title="审核通过"
                            >
                              <FiCheck size={13} />
                            </ActionButton>
                            <ActionButton
                              onClick={() => handleRejectComment(comment)}
                              style={{ color: 'var(--error-color)' }}
                              title="审核驳回"
                            >
                              <FiX size={13} />
                            </ActionButton>
                          </>
                        )}
                        <ActionButton onClick={() => handleDeleteComment(comment)} title="删除">
                          <FiTrash2 size={12} />
                        </ActionButton>
                      </CommentActions>
                    </div>
                  </CommentCard>
                ))}
          </CommentsList>
        </InfiniteScroll>
      </Content>
    </Container>
  );
};

export default CommentManagement;
