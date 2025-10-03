import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiUser, FiMail, FiSend } from 'react-icons/fi';

// 评论区容器
const CommentSectionContainer = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

// 评论区标题
const CommentTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: var(--accent-color);
    font-size: 1rem;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-color-alpha);
  }
`;

// 评论表单
const CommentForm = styled.form`
  margin-bottom: 2.5rem;
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
`;

// 评论输入框组
const InputGroup = styled.div`
  margin-bottom: 1rem;

  &.half {
    @media (min-width: 768px) {
      display: flex;
      gap: 1rem;

      > div {
        flex: 1;
      }
    }
  }
`;

// 表单标签
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

// 文本输入框
const TextInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

// 文本区域
const CommentInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

// 提交按钮
const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  background: var(--accent-color);
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 评论列表
const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 评论项
const CommentItem = styled.div`
  padding: 1.25rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
`;

// 评论头部
const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

// 评论者信息
const CommentAuthor = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

// 评论日期
const CommentDate = styled.div`
  color: var(--text-tertiary);
  font-size: 0.85rem;
`;

// 评论内容
const CommentContent = styled.p`
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
`;

// 无评论提示
const NoComments = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 0;
`;

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
}

interface CommentSectionProps {
  comments?: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments = [] }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !commentText.trim()) return;

    setIsSubmitting(true);

    // 模拟评论提交
    setTimeout(() => {
      // 这里可以添加实际的评论提交逻辑
      alert(`评论已提交: ${commentText}`);

      // 重置表单
      setName('');
      setEmail('');
      setCommentText('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <CommentSectionContainer>
      <CommentTitle>
        <FiMessageSquare size={18} />
        评论区 <span>{comments.length}</span>
      </CommentTitle>

      <CommentForm onSubmit={handleSubmit}>
        <InputGroup className="half">
          <div>
            <Label htmlFor="name">昵称</Label>
            <TextInput
              id="name"
              type="text"
              placeholder="您的昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">邮箱</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="您的邮箱（不会公开）"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="comment">评论内容</Label>
          <CommentInput
            id="comment"
            placeholder="写下您的评论..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          />
        </InputGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          <FiSend size={16} />
          {isSubmitting ? '提交中...' : '提交评论'}
        </SubmitButton>
      </CommentForm>

      {comments.length > 0 ? (
        <CommentList>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CommentItem>
                <CommentHeader>
                  <CommentAuthor>{comment.author}</CommentAuthor>
                  <CommentDate>{comment.date}</CommentDate>
                </CommentHeader>
                <CommentContent>{comment.content}</CommentContent>
              </CommentItem>
            </motion.div>
          ))}
        </CommentList>
      ) : (
        <NoComments>
          <p>暂无评论，成为第一个评论的人吧！</p>
        </NoComments>
      )}
    </CommentSectionContainer>
  );
};

export default CommentSection;
