import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiCornerDownRight, FiThumbsUp, FiTrash2, FiLoader } from 'react-icons/fi';
import { Button, Input, Textarea } from '@/components/ui';
import { API, Comment as CommentType } from '@/utils/api';
import { storage } from '@/utils';
import { formatDate } from '@/utils';

// 评论区容器
const CommentSectionContainer = styled.div`
  margin-top: 3rem;
  padding: 0;
`;

// 评论区标题
const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
`;

const CommentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  margin: 0;

  svg {
    color: var(--accent-color);
  }
`;

const CommentCount = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 400;
  padding: 0.25rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
`;

// 评论表单
const CommentForm = styled.form`
  margin-bottom: 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-alpha);
  }
`;

// 表单底部
const FormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FormInfo = styled.div`
  font-size: 0.85rem;
  color: var(--text-tertiary);
`;

// 操作按钮容器
const ActionButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// 评论列表
const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 评论项容器
const CommentItemWrapper = styled(motion.div)``;

// 评论项
const CommentItem = styled.div<{ isReply?: boolean }>`
  display: flex;
  gap: 1rem;
  padding: ${(props) => (props.isReply ? '1rem 0 1rem 3rem' : '1.25rem 0')};
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: ${(props) => (props.isReply ? '1rem 0 1rem 2rem' : '1rem 0')};
  }
`;

// 头像
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.2);
`;

// 评论内容区
const CommentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

// 评论头部
const CommentContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
`;

// 评论者名字
const CommentAuthor = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

// 评论日期
const CommentDate = styled.div`
  color: var(--text-tertiary);
  font-size: 0.85rem;
`;

// 评论文本
const CommentText = styled.p`
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0.5rem 0 0.75rem 0;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

// 评论操作栏
const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// 管理员标签样式
const AdminBadgeStyled = styled.span`
  padding: 0.125rem 0.5rem;
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

// 回复表单容器
const ReplyFormContainer = styled(motion.div)`
  margin-top: 1rem;
  padding-left: 3rem;

  @media (max-width: 768px) {
    padding-left: 2rem;
  }
`;

// 空状态
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-tertiary);

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

// 加载状态
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: var(--accent-color);

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const user = storage.local.get('user');
  const token = storage.local.get('token');
  const isLoggedIn = !!token;

  // 获取评论列表
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await API.comment.getCommentsByPost(postId, { page: 1, limit: 50 });
      if (response.code === 200 && response.data) {
        setComments(response.data.comments || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      window.UI?.toast?.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isLoggedIn) {
      window.UI?.toast?.error('请先登录');
      return;
    }

    try {
      setIsSubmitting(true);
      await API.comment.createComment({
        content: commentText,
        postId,
      });

      window.UI?.toast?.success('评论发布成功');
      setCommentText('');
      await fetchComments();
    } catch (error: any) {
      window.UI?.toast?.error(error.message || '评论发布失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交回复
  const handleReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    if (!isLoggedIn) {
      window.UI?.toast?.error('请先登录');
      return;
    }

    try {
      await API.comment.createComment({
        content: replyText,
        postId,
        parentId,
      });

      window.UI?.toast?.success('回复发布成功');
      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error: any) {
      window.UI?.toast?.error(error.message || '回复发布失败');
    }
  };

  // 删除评论
  const handleDelete = async (id: number) => {
    const confirmed = window.UI?.confirm
      ? await window.UI.confirm({ title: '确认删除', message: '确定要删除这条评论吗？' })
      : window.confirm('确定要删除这条评论吗？');

    if (!confirmed) return;

    try {
      await API.comment.deleteComment(id);
      window.UI?.toast?.success('评论已删除');
      await fetchComments();
    } catch (error: any) {
      window.UI?.toast?.error(error.message || '删除失败');
    }
  };

  // 渲染单个评论
  const renderComment = (comment: CommentType, isReply: boolean = false) => (
    <CommentItemWrapper
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CommentItem isReply={isReply}>
        <Avatar>
          {typeof comment.author === 'string' && comment.author ? comment.author[0]?.toUpperCase() || '?' : '?'}
        </Avatar>
        <CommentContent>
          <CommentContentHeader>
            <CommentAuthor>{typeof comment.author === 'string' ? comment.author : '匿名用户'}</CommentAuthor>
            {comment.originalData?.author?.role === 'admin' && <AdminBadgeStyled>管理员</AdminBadgeStyled>}
            <CommentDate>{formatDate(comment.date || comment.originalData?.createdAt, 'YYYY-MM-DD HH:mm')}</CommentDate>
          </CommentContentHeader>
          <CommentText>{comment.content}</CommentText>
          <CommentActions>
            {isLoggedIn && !isReply && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setReplyingTo(replyingTo === Number(comment.id) ? null : Number(comment.id))}
              >
                <FiCornerDownRight />
                回复
              </Button>
            )}
            {isLoggedIn &&
              typeof user === 'object' &&
              user &&
              'id' in user &&
              user.id === comment.originalData?.userId && (
                <Button variant="ghost" size="small" onClick={() => handleDelete(Number(comment.id))}>
                  <FiTrash2 />
                  删除
                </Button>
              )}
          </CommentActions>

          {/* 回复表单 */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <ReplyFormContainer
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CommentForm
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReply(Number(comment.id));
                  }}
                >
                  <Textarea
                    placeholder={`回复 ${comment.author}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    size="small"
                    fullWidth
                  />
                  <FormFooter>
                    <FormInfo>Ctrl + Enter 快速发送</FormInfo>
                    <ActionButtonContainer>
                      <Button variant="ghost" onClick={() => setReplyingTo(null)}>
                        取消
                      </Button>
                      <Button type="submit" disabled={!replyText.trim()} variant="primary">
                        <FiSend size={16} />
                        发送
                      </Button>
                    </ActionButtonContainer>
                  </FormFooter>
                </CommentForm>
              </ReplyFormContainer>
            )}
          </AnimatePresence>
        </CommentContent>
      </CommentItem>

      {/* 递归渲染回复 */}
      {comment.replies && comment.replies.length > 0 && (
        <div>{comment.replies.map((reply) => renderComment(reply, true))}</div>
      )}
    </CommentItemWrapper>
  );

  return (
    <CommentSectionContainer>
      <CommentHeader>
        <CommentTitle>
          <FiMessageSquare size={20} />
          评论
          <CommentCount>{total} 条</CommentCount>
        </CommentTitle>
      </CommentHeader>

      {/* 评论表单 */}
      {isLoggedIn ? (
        <CommentForm onSubmit={handleSubmit}>
          <Textarea
            placeholder="写下你的评论..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            size="medium"
            fullWidth
          />
          <FormFooter>
            <FormInfo>支持 Markdown 语法</FormInfo>
            <Button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
            >
              {isSubmitting ? '发送中...' : '发送评论'}
            </Button>
          </FormFooter>
        </CommentForm>
      ) : (
        <CommentForm as="div" style={{ textAlign: 'center', padding: '2rem' }}>
          <FormInfo style={{ fontSize: '0.95rem' }}>请先登录后发表评论</FormInfo>
        </CommentForm>
      )}

      {/* 评论列表 */}
      {loading ? (
        <LoadingSpinner>
          <FiLoader size={24} />
        </LoadingSpinner>
      ) : comments.length > 0 ? (
        <CommentList>{comments.map((comment) => renderComment(comment))}</CommentList>
      ) : (
        <EmptyState>
          <FiMessageSquare />
          <p>还没有评论，快来抢沙发吧！</p>
        </EmptyState>
      )}
    </CommentSectionContainer>
  );
};

export default CommentSection;
