import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';
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
  FiSun,
  FiMoon,
  FiSmile,
  FiFrown,
  FiMeh,
} from 'react-icons/fi';
import { Button, InfiniteScroll } from 'adnaan-ui';
import { API, Note, NoteParams } from '@/utils/api';
import { RichTextParser } from '@/utils/rich-text-parser';
import { ManagementLayout, type StatItemData, type FilterOption } from '../common/management-layout';
import {
  ItemCard,
  ItemHeader,
  ItemTitle,
  ItemActions,
  ActionButton,
  ItemContent,
  ItemMeta,
  MetaItem,
  StatusBadge,
  TagsContainer,
  Tag,
  EmptyState,
  getMetaIcon,
  getActionIcon,
} from '../common/item-card';
import { useManagementPage } from '../common/management-hooks';

// 组件接口
interface NoteManagementProps {
  className?: string;
}

// 统计数据接口
interface NoteStats {
  totalNotes: number;
  totalViews: number;
  totalLikes: number;
  publicNotes: number;
  privateNotes: number;
}

// 心情图标映射
const moodIcons: Record<string, React.ReactNode> = {
  happy: <FiSmile />,
  sad: <FiFrown />,
  calm: <FiMeh />,
  excited: <FiSun />,
  thoughtful: <FiMoon />,
};

// 心情文本映射
const moodTexts: Record<string, string> = {
  happy: '开心',
  sad: '难过',
  calm: '平静',
  excited: '兴奋',
  thoughtful: '深思',
};

const NoteManagement: React.FC<NoteManagementProps> = ({ className }) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // 使用通用管理页面Hook
  const {
    items: notes,
    isLoading,
    hasMore,
    error,
    loadMore,
    reload,
    search,
    filter,
  } = useManagementPage<Note>({
    fetchFunction: async (params: NoteParams) => {
      const response = await API.note.getNotes(params);
      return {
        success: response.success,
        code: response.code,
        message: response.message,
        data: response.data,
        meta: {
          pagination: response.meta.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: response.meta.timestamp,
        },
      };
    },
    initialParams: {
      keyword: '',
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    },
    pageSize: 10,
  });

  // 使用 useMemo 计算统计数据，避免不必要的重渲染
  const stats = useMemo<NoteStats>(() => {
    return {
      totalNotes: notes.length,
      totalViews: notes.reduce((sum, note) => sum + (note.viewCount || 0), 0),
      totalLikes: notes.reduce((sum, note) => sum + (note.likeCount || 0), 0),
      publicNotes: notes.filter((note) => !note.isPrivate).length,
      privateNotes: notes.filter((note) => note.isPrivate).length,
    };
  }, [notes]);

  // 处理函数
  const handleCreateNote = () => {
    navigate('/editor/note');
  };

  const handleEditNote = (note: Note) => {
    navigate(`/editor/note?id=${note.id}`);
  };

  const handleDeleteNote = async (note: Note) => {
    const confirmed = await adnaan.modal.confirm({
      title: '确认删除',
      message: `确定要删除手记"${note.title}"吗？此操作不可恢复。`,
    });

    if (confirmed) {
      try {
        await API.note.deleteNote(note.id);
        adnaan.toast.success('删除成功');
        reload();
      } catch (error: any) {
        console.error('删除失败:', error);
        adnaan.toast.error(error.message || '删除失败');
      }
    }
  };

  // 统计数据
  const statItems: StatItemData[] = [
    {
      label: '篇',
      value: stats.totalNotes,
      icon: <FiCloud size={12} />,
    },
    {
      label: '次',
      value: stats.totalViews,
      icon: <FiEye size={12} />,
    },
    {
      label: '个',
      value: stats.totalLikes,
      icon: <FiHeart size={12} />,
    },
  ];

  // 筛选选项
  const filterOptions: FilterOption[] = [
    { key: '', label: '全部' },
    { key: 'public', label: '公开' },
    { key: 'private', label: '私密' },
  ];

  // 格式化日期
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <ManagementLayout
      title="我的手记"
      icon={<FiCloud />}
      stats={statItems}
      searchPlaceholder="搜索手记..."
      searchValue={search.searchQuery}
      onSearchChange={search.setSearchQuery}
      onAdd={handleCreateNote}
      onRefresh={reload}
      loading={isLoading}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filterOptions={filterOptions}
      selectedFilter={filter.selectedFilter}
      onFilterChange={filter.handleFilterChange}
      showCard={true}
    >
      <InfiniteScroll
        hasMore={hasMore}
        loading={isLoading}
        error={error}
        onLoadMore={loadMore}
        onRetry={reload}
        itemCount={notes.length}
        maxHeight="calc(100vh - 400px)"
        showScrollToTop={true}
      >
        {!isLoading && notes.length === 0 ? (
          <EmptyState>
            <FiCloud size={48} />
            <p>暂无手记</p>
            <Button variant="primary" size="small" onClick={handleCreateNote} style={{ marginTop: '1rem' }}>
              <FiPlus size={14} style={{ marginRight: '0.5rem' }} />
              写手记
            </Button>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {notes.map((note, index) => (
              <ItemCard
                key={note.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, delay: index * 0.05 },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
              >
                <ItemHeader>
                  <ItemTitle>{note.title}</ItemTitle>
                  <ItemActions>
                    <ActionButton onClick={() => handleEditNote(note)} title="编辑">
                      {getActionIcon('edit')}
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteNote(note)} title="删除">
                      {getActionIcon('delete')}
                    </ActionButton>
                  </ItemActions>
                </ItemHeader>

                {note.content && <ItemContent>{RichTextParser.extractSummary(note.content, 200)}</ItemContent>}

                <ItemMeta>
                  <MetaItem>
                    <StatusBadge color={note.isPrivate ? '#ef4444' : '#10b981'}>
                      {note.isPrivate ? (
                        <>
                          <FiEyeOff size={12} /> 私密
                        </>
                      ) : (
                        <>
                          <FiEye size={12} /> 公开
                        </>
                      )}
                    </StatusBadge>
                  </MetaItem>

                  {note.mood && (
                    <MetaItem>
                      {moodIcons[note.mood]}
                      {moodTexts[note.mood]}
                    </MetaItem>
                  )}

                  {note.weather && (
                    <MetaItem>
                      <FiCloud />
                      {note.weather}
                    </MetaItem>
                  )}

                  {note.location && (
                    <MetaItem>
                      <FiMapPin />
                      {note.location}
                    </MetaItem>
                  )}

                  {(note.viewCount ?? 0) > 0 && (
                    <MetaItem>
                      {getMetaIcon('view')}
                      {note.viewCount}
                    </MetaItem>
                  )}

                  {(note.likeCount ?? 0) > 0 && (
                    <MetaItem>
                      {getMetaIcon('like')}
                      {note.likeCount}
                    </MetaItem>
                  )}

                  <MetaItem>
                    {getMetaIcon('date')}
                    {formatDate(note.createdAt)}
                  </MetaItem>
                </ItemMeta>

                {note.tags && note.tags.length > 0 && (
                  <TagsContainer>
                    {note.tags.map((tag, idx) => (
                      <Tag key={idx}>{tag}</Tag>
                    ))}
                  </TagsContainer>
                )}
              </ItemCard>
            ))}
          </AnimatePresence>
        )}
      </InfiniteScroll>
    </ManagementLayout>
  );
};

export default NoteManagement;
