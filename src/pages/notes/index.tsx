import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// 手记数据类型
interface Note {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
}

// 样式组件
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

const MasonryContainer = styled.div`
  columns: 2;
  column-gap: 3rem;
  column-fill: balance;

  @media (max-width: 768px) {
    columns: 1;
    column-gap: 0;
  }
`;

const YearTimeline = styled(motion.div)`
  break-inside: avoid;
  margin-bottom: 2rem;
  position: relative;
  background: var(--bg-primary);
`;

const YearHeader = styled.div`
  position: relative;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .year-badge {
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    position: relative;
    z-index: 3;
  }

  .note-count {
    color: var(--text-tertiary);
    font-size: 0.75rem;
    font-weight: 400;
  }

  /* 年份前的竖线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 2px;
    transform: translateY(-50%);
    z-index: 2;
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 1.5rem;

  /* 时间线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--accent-color) 0%, var(--accent-color) 90%, transparent 100%);
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 1rem;

  /* 时间线节点 */
  &::before {
    content: '';
    position: absolute;
    left: -1.9rem;
    top: 0.3rem;
    width: 8px;
    height: 8px;
    background: var(--accent-color);
    border-radius: 50%;
    border: 2px solid var(--bg-primary);
    z-index: 2;
  }
`;

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

const LoadingMore = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.8rem;

  .loading-text {
    opacity: 0.8;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(var(--accent-color-rgb), 0.2);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const NoMoreData = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  opacity: 0.6;
`;

// 工具函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

// 按年份分组笔记
const groupNotesByYear = (notes: Note[]) => {
  const grouped: Record<string, Note[]> = {};

  notes.forEach((note) => {
    const year = new Date(note.createdAt).getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(note);
  });

  // 按年份降序排列
  const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  return sortedYears.map((year) => ({
    year,
    notes: grouped[year].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  }));
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

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      // 当滚动到距离底部200px时开始加载
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const groupedNotes = groupNotesByYear(notes);

  if (isLoading) {
    return (
      <PageContainer>
        <Container>
          <Header>
            <Title>这是一个手记页面</Title>
          </Header>
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-tertiary)',
              fontSize: '0.875rem',
            }}
          >
            加载中...
          </div>
        </Container>
      </PageContainer>
    );
  }

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

        {notes.length === 0 ? (
          <EmptyState>
            <h3>还没有手记</h3>
            <p>开始记录你的生活吧</p>
          </EmptyState>
        ) : (
          <>
            <MasonryContainer>
              {groupedNotes.map((yearGroup, yearIndex) => (
                <YearTimeline
                  key={yearGroup.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: yearIndex * 0.1 }}
                >
                  <YearHeader>
                    <div className="year-badge">{yearGroup.year}</div>
                    <div className="note-count">{yearGroup.notes.length} 篇</div>
                  </YearHeader>

                  <TimelineContainer>
                    {yearGroup.notes.map((note, noteIndex) => (
                      <TimelineItem
                        key={note.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (yearIndex * 5 + noteIndex) * 0.05 }}
                      >
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
                      </TimelineItem>
                    ))}
                  </TimelineContainer>
                </YearTimeline>
              ))}
            </MasonryContainer>

            {/* 加载更多状态 */}
            {isLoadingMore && (
              <LoadingMore>
                <div className="spinner"></div>
                <span className="loading-text">加载更多手记...</span>
              </LoadingMore>
            )}

            {!hasMore && notes.length > 10 && <NoMoreData>已加载全部手记</NoMoreData>}
          </>
        )}
      </Container>
    </PageContainer>
  );
};

export default NotesPage;
