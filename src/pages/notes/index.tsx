import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import TimelineMasonry, { TimelineItem } from '@/components/common/time-line-masonry';
import { ListPageHeader } from '@/components/common/list-page-header';
import { SEO } from '@/components/common';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { API } from '@/utils/api';
import type { Note, NoteParams } from '@/types';
import { useAnimationEngine } from '@/utils/ui/animation';

const PageContainer = styled(motion.div)`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const NoteItem = styled(motion.div)`
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
    background: rgba(var(--accent-rgb), 0.05);
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

// 导入封装的工具函数
import { formatDate as formatDateUtil } from '@/utils';

const NotesPage: React.FC = () => {
  const { variants, level } = useAnimationEngine();
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
      const apiNotes = response.data || [];
      const newNotes = apiNotes.map(convertNoteToTimelineItem);

      if (append) {
        setNotes((prev) => [...prev, ...newNotes]);
      } else {
        setNotes(newNotes);
      }

      const pagination = response.meta?.pagination || { page: pageNum, totalPages: 1 };
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (error: any) {
      adnaan.toast.error(error.message || '加载手记失败');
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
        <NoteDate>{formatDateUtil(note.createdAt, 'MM-DD')}</NoteDate>
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
    <>
      <SEO
        title={PAGE_SEO_CONFIG.noteList.title}
        description={PAGE_SEO_CONFIG.noteList.description}
        keywords={PAGE_SEO_CONFIG.noteList.keywords}
        type="website"
      />
      <PageContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
        <Container>
          {/* 页面头部 */}
          <ListPageHeader
            title="生活手记"
            subtitle="记录时光片段，留住美好瞬间"
            count={notes.length}
            countUnit="篇手记"
          />

          <TimelineMasonry
            items={notes}
            renderItem={(item, index) => renderNoteItem(item as Note, index)}
            loading={isLoading}
            loadingMore={isLoadingMore}
            hasMore={hasMore}
            emptyState={emptyStateComponent}
          />
        </Container>
      </PageContainer>
    </>
  );
};

export default NotesPage;
