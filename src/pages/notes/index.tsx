import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import TimelineMasonry, { TimelineItem } from '@/components/common/time-line-masonry';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { API, Note, NoteParams } from '@/utils/api';
import { toast } from '@/ui';

// 页面样式组件
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
`;

const StatsInfo = styled.div`
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;

  .count {
    color: var(--accent-color);
    font-weight: 600;
    font-family: var(--font-code);
  }

  .text {
    opacity: 0.8;
  }
`;

// 手记项目样式
const NoteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.3;
  cursor: pointer;
  padding: 0.3rem 0;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--accent-color-rgb), 0.05);
    transform: translateX(2px);
  }
`;

const NoteDate = styled.time`
  color: var(--text-tertiary);
  font-size: 0.7rem;
  font-family: var(--font-code);
  flex-shrink: 0;
  min-width: 45px;
`;

const NoteTitle = styled.span`
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TagList = styled.div`
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
  margin-left: auto;
`;

const Tag = styled.span`
  color: var(--accent-color);
  font-size: 0.65rem;
  opacity: 0.8;
  font-weight: 400;
  flex-shrink: 0;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.1em;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-tertiary);

  h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-weight: 400;
  }

  p {
    font-size: 0.875rem;
    opacity: 0.8;
  }
`;

// 工具函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 初始数据加载
  useEffect(() => {
    loadNotes(1);
  }, []);

  // 将Note转换为TimelineItem
  const convertNoteToTimelineItem = (note: Note): TimelineItem => ({
    id: String(note.id),
    title: note.title || '生活随记',
    content: note.content,
    createdAt: note.createdAt,
    tags: note.tags,
  });

  // 加载手记数据
  const loadNotes = async (pageNum: number, append = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const params: NoteParams = {
        page: pageNum,
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'DESC',
      };

      const response = await API.note.getNotes(params);
      const apiNotes = response.data.data || response.data.list || [];
      const newNotes = apiNotes.map(convertNoteToTimelineItem);

      if (append) {
        setNotes((prev) => [...prev, ...newNotes]);
      } else {
        setNotes(newNotes);
      }

      const pagination = response.data.pagination || { page: pageNum, totalPages: 1 };
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (error: any) {
      toast.error(error.message || '加载手记失败');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await loadNotes(page + 1, true);
  }, [page, isLoadingMore, hasMore]);

  // 使用无限滚动Hook
  useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  // 渲染单个手记项目
  const renderNoteItem = (note: Note, index: number) => (
    <Link to={`/notes/${note.id}`} style={{ textDecoration: 'none' }}>
      <NoteItem>
        <NoteDate>{formatDate(note.createdAt)}</NoteDate>
        <NoteTitle>{note.title || '生活随记'}</NoteTitle>
        {note.tags && note.tags.length > 0 && (
          <TagList>
            {note.tags.slice(0, 2).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagList>
        )}
      </NoteItem>
    </Link>
  );

  // 空状态组件
  const emptyStateComponent = (
    <EmptyState>
      <h3>还没有手记</h3>
      <p>开始记录你的生活吧</p>
    </EmptyState>
  );

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>这是一个手记页面</Title>
          {notes.length > 0 && (
            <StatsInfo>
              <span className="text">共</span>
              <span className="count">{notes.length}</span>
              <span className="text">篇手记</span>
            </StatsInfo>
          )}
        </Header>

        <TimelineMasonry
          items={notes}
          renderItem={renderNoteItem}
          loading={isLoading}
          loadingMore={isLoadingMore}
          hasMore={hasMore}
          emptyState={emptyStateComponent}
        />
      </Container>
    </PageContainer>
  );
};

export default NotesPage;
