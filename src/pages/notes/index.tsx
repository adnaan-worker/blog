import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import TimelineMasonry, { TimelineItem } from '@/components/common/time-line-masonry';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';

// 手记数据类型
interface Note extends TimelineItem {
  title?: string;
  content: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
}

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 生成更多模拟数据
  const generateMoreNotes = (pageNum: number): Note[] => {
    const baseId = (pageNum - 1) * 10;
    const currentYear = new Date().getFullYear();

    const titles = [
      '晨光初现',
      '午后阳光',
      '夜晚思考',
      '雨中漫步',
      '咖啡时光',
      '阅读时光',
      '编程心得',
      '周末悠闲',
      '城市探索',
      '友谊时光',
      '音乐感悟',
      '电影夜晚',
      '运动日记',
      '美食体验',
      '旅行见闻',
    ];

    const tagOptions = [
      ['生活', '感悟'],
      ['学习', '成长'],
      ['工作', '思考'],
      ['娱乐', '放松'],
      ['阅读', '知识'],
      ['运动', '健康'],
      ['美食', '享受'],
      ['旅行', '探索'],
      ['音乐', '艺术'],
      ['电影', '文化'],
      ['友谊', '社交'],
      ['家庭', '温暖'],
    ];

    return Array.from({ length: 10 }, (_, i) => {
      const noteIndex = baseId + i;
      const randomYear = currentYear - Math.floor(Math.random() * 3); // 2022-2024
      const randomMonth = Math.floor(Math.random() * 12);
      const randomDay = Math.floor(Math.random() * 28) + 1;

      return {
        id: `${noteIndex + 1}`,
        title: titles[noteIndex % titles.length],
        content: `第${pageNum}页的第${i + 1}条手记内容`,
        createdAt: new Date(randomYear, randomMonth, randomDay).toISOString(),
        tags: tagOptions[noteIndex % tagOptions.length],
      };
    });
  };

  // 初始数据加载
  useEffect(() => {
    const loadMockData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const initialNotes = generateMoreNotes(1);
      setNotes(initialNotes);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newNotes = generateMoreNotes(page + 1);
    setNotes((prevNotes) => [...prevNotes, ...newNotes]);
    setPage((prevPage) => prevPage + 1);

    // 模拟数据有限，加载5页后停止
    if (page >= 5) {
      setHasMore(false);
    }

    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore]);

  // 使用无限滚动Hook
  useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  // 渲染单个手记项目
  const renderNoteItem = (note: Note, index: number) => (
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
