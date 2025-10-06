import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCloud,
  FiTag,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiMoreHorizontal,
} from 'react-icons/fi';
import { Button, Input, InfiniteScroll } from 'adnaan-ui';
import { API, Note, NoteParams, NoteStats } from '@/utils/api';
import { RichTextParser } from '@/utils/rich-text-parser';

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

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
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

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
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

const NotesList = styled.div`
  padding: 1rem;
`;

const NoteCard = styled(motion.div)`
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

const NoteHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const NoteTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const NoteActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${NoteCard}:hover & {
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
    background: var(--accent-color);
    color: white;
  }
`;

const NoteContent = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NoteMeta = styled.div`
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

const PrivacyBadge = styled.div<{ isPrivate?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${(props) => (props.isPrivate ? 'var(--error-bg)' : 'var(--success-bg)')};
  color: ${(props) => (props.isPrivate ? 'var(--error-color)' : 'var(--success-color)')};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.2rem 0.5rem;
  background: rgba(var(--accent-color-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;

  &::before {
    content: '#';
    opacity: 0.6;
  }
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
    margin-bottom: 2rem;
    opacity: 0.8;
  }
`;

// 组件接口
interface NoteManagementProps {
  className?: string;
}

const NoteManagement: React.FC<NoteManagementProps> = ({ className }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<NoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // 筛选和搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // 编辑器状态

  // 加载更多数据
  const loadMoreNotes = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    try {
      setIsLoading(true);
      setError(null);

      const params: NoteParams = {
        page: page + 1,
        limit: 10,
        search: searchQuery || undefined,
        mood: selectedMood || undefined,
        isPrivate: selectedPrivacy,
        orderBy: 'createdAt',
        orderDirection: 'DESC',
      };

      const response = await API.note.getMyNotes(params);
      const newNotes = response.data.data;

      setNotes((prev) => [...prev, ...newNotes]);
      setHasMore(page + 1 < response.data.pagination.totalPages);
      setPage(page + 1);
      setTotalItems((prev) => prev + newNotes.length);
    } catch (err: any) {
      console.error('加载更多手记失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, error, searchQuery, selectedMood, selectedPrivacy]);

  // 重新加载数据（搜索/筛选时使用）
  const reloadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const params: NoteParams = {
        page: 1,
        limit: 10,
        search: searchQuery || undefined,
        mood: selectedMood || undefined,
        isPrivate: selectedPrivacy,
        orderBy: 'createdAt',
        orderDirection: 'DESC',
      };

      const response = await API.note.getMyNotes(params);
      const newNotes = response.data.data;

      setNotes(newNotes);
      setHasMore(1 < response.data.pagination.totalPages);
      setTotalItems(newNotes.length);
    } catch (err: any) {
      console.error('加载手记失败:', err);
      setError(new Error(err.message || '加载失败，请重试'));
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedMood, selectedPrivacy]);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    try {
      const response = await API.note.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
    }
  }, []);

  // 初始化
  useEffect(() => {
    reloadNotes();
    loadStats();
  }, [reloadNotes, loadStats]);

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    const timer = setTimeout(() => {
      reloadNotes();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedMood, selectedPrivacy, reloadNotes]);

  // 处理创建手记
  const handleCreateNote = () => {
    const url = `${window.location.origin}/#/editor/note`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 处理编辑手记
  const handleEditNote = (note: Note) => {
    const url = `${window.location.origin}/#/editor/note?id=${note.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 处理删除手记
  const handleDeleteNote = async (note: Note) => {
    const confirmed = await adnaan.confirm.delete('确定要删除这篇手记吗？删除后无法恢复。', '删除手记');

    if (!confirmed) return;

    try {
      await API.note.deleteNote(note.id);
      adnaan.toast.success('手记删除成功');
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      loadStats(); // 重新加载统计
    } catch (error: any) {
      adnaan.toast.error(error.message || '删除失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    reloadNotes();
    loadStats();
  };

  // 获取心情选项
  const moodOptions = ['开心', '平静', '思考', '感慨', '兴奋', '忧郁'];

  return (
    <Container className={className}>
      <Header>
        <HeaderTop>
          <HeaderLeft>
            <Title>我的手记</Title>
            {stats && (
              <StatsContainer>
                <StatItem>
                  <span className="number">{stats.totalNotes}</span>
                  <span>篇</span>
                </StatItem>
                <StatItem>
                  <FiEye size={12} />
                  <span className="number">{stats.totalViews}</span>
                </StatItem>
                <StatItem>
                  <FiHeart size={12} />
                  <span className="number">{stats.totalLikes}</span>
                </StatItem>
              </StatsContainer>
            )}
          </HeaderLeft>
          <Button variant="primary" onClick={handleCreateNote}>
            <FiPlus size={14} />
            <span style={{ marginLeft: '0.5rem' }}>写手记</span>
          </Button>
        </HeaderTop>

        <HeaderRight>
          <SearchContainer>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索手记..."
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>心情：</span>
                <FilterTag active={selectedMood === ''} onClick={() => setSelectedMood('')}>
                  全部
                </FilterTag>
                {moodOptions.map((mood) => (
                  <FilterTag
                    key={mood}
                    active={selectedMood === mood}
                    onClick={() => setSelectedMood(mood === selectedMood ? '' : mood)}
                  >
                    {mood}
                  </FilterTag>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>隐私：</span>
                <FilterTag active={selectedPrivacy === undefined} onClick={() => setSelectedPrivacy(undefined)}>
                  全部
                </FilterTag>
                <FilterTag
                  active={selectedPrivacy === false}
                  onClick={() => setSelectedPrivacy(selectedPrivacy === false ? undefined : false)}
                >
                  公开
                </FilterTag>
                <FilterTag
                  active={selectedPrivacy === true}
                  onClick={() => setSelectedPrivacy(selectedPrivacy === true ? undefined : true)}
                >
                  私密
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
          onLoadMore={loadMoreNotes}
          onRetry={reloadNotes}
          itemCount={notes.length}
          maxHeight="calc(100vh - 400px)"
          showScrollToTop={true}
          emptyComponent={
            <EmptyState>
              <h3>还没有手记</h3>
              <p>开始记录你的生活点滴吧</p>
              <Button variant="primary" onClick={handleCreateNote}>
                <FiPlus size={14} />
                写第一篇手记
              </Button>
            </EmptyState>
          }
        >
          <NotesList>
            <AnimatePresence>
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NoteHeader>
                    <NoteTitle>{note.title || '生活随记'}</NoteTitle>
                    <NoteActions>
                      <ActionButton onClick={() => handleEditNote(note)}>
                        <FiEdit3 size={14} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteNote(note)}>
                        <FiTrash2 size={14} />
                      </ActionButton>
                    </NoteActions>
                  </NoteHeader>

                  <NoteContent>{RichTextParser.extractSummary(note.content)}</NoteContent>

                  <NoteMeta>
                    <MetaItem>
                      <FiCalendar size={12} />
                      {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                    </MetaItem>
                    {note.readingTime && (
                      <MetaItem>
                        <FiClock size={12} />
                        {note.readingTime}分钟
                      </MetaItem>
                    )}
                    {note.mood && (
                      <MetaItem>
                        <FiHeart size={12} />
                        {note.mood}
                      </MetaItem>
                    )}
                    {note.weather && (
                      <MetaItem>
                        <FiCloud size={12} />
                        {note.weather}
                      </MetaItem>
                    )}
                    {note.location && (
                      <MetaItem>
                        <FiMapPin size={12} />
                        {note.location}
                      </MetaItem>
                    )}
                    <MetaItem>
                      <FiEye size={12} />
                      {note.viewCount}
                    </MetaItem>
                    <MetaItem>
                      <FiHeart size={12} />
                      {note.likeCount}
                    </MetaItem>
                    <PrivacyBadge isPrivate={note.isPrivate}>
                      {note.isPrivate ? <FiEyeOff size={10} /> : <FiEye size={10} />}
                      {note.isPrivate ? '私密' : '公开'}
                    </PrivacyBadge>
                  </NoteMeta>

                  {note.tags && note.tags.length > 0 && (
                    <TagsContainer>
                      {note.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </TagsContainer>
                  )}
                </NoteCard>
              ))}
            </AnimatePresence>
          </NotesList>
        </InfiniteScroll>
      </Content>
    </Container>
  );
};

export default NoteManagement;
