import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { MultiYearTimeline } from '@/components/blog';
import type { TimelineItem } from '@/utils/helpers/timeline';
import { ListPageHeader, type FilterGroup, type FilterValues } from '@/components/common';
import { SEO } from '@/components/common';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';
import { API } from '@/utils/api';
import type { Note, NoteParams } from '@/types';
import { useAnimationEngine } from '@/utils/ui/animation';
import adnaan from 'adnaan-ui';
import {
  FiSun,
  FiCloud,
  FiCloudRain,
  FiCloudSnow,
  FiWind,
  FiSmile,
  FiMeh,
  FiThumbsUp,
  FiFrown,
  FiZap,
} from 'react-icons/fi';

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
  const { variants } = useAnimationEngine();
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [years, setYears] = useState<Array<{ year: number; count: number }>>([]);

  // 筛选状态
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  // 清理后的筛选参数（由 ListPageHeader 自动处理）
  const [cleanedFilters, setCleanedFilters] = useState<Record<string, any>>({});

  // 初始化加载筛选项和年份列表
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // 加载年份列表
        const yearsResponse = await API.note.getYears();
        const yearsData = yearsResponse.data || [];
        setYears(yearsData);

        // 计算总数
        const total = yearsData.reduce((sum, year) => sum + year.count, 0);
        setTotalCount(total);
      } catch (error: any) {
        adnaan.toast.error(error.message || '加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 监听筛选参数变化，重新加载年份列表
  useEffect(() => {
    if (Object.keys(cleanedFilters).length === 0) return;

    const reloadYears = async () => {
      try {
        const yearsResponse = await API.note.getYears();
        const yearsData = yearsResponse.data || [];
        setYears(yearsData);

        const total = yearsData.reduce((sum, year) => sum + year.count, 0);
        setTotalCount(total);
      } catch (error: any) {
        adnaan.toast.error(error.message || '加载年份失败');
      }
    };

    reloadYears();
  }, [cleanedFilters]);

  // 将Note转换为TimelineItem
  const convertNoteToTimelineItem = useCallback(
    (note: Note): TimelineItem & Note => ({
      ...note,
      id: String(note.id),
      title: note.title,
    }),
    [],
  );

  // 按年份加载手记
  const loadYearItems = useCallback(
    async (year: number, page: number): Promise<{ items: (TimelineItem & Note)[]; total: number }> => {
      try {
        // 使用清理后的参数，映射到API字段
        const params: any = {
          page,
          limit: 10,
          year, // 添加年份参数
          orderBy: 'createdAt',
          orderDirection: 'DESC',
          ...cleanedFilters,
        };

        const response = await API.note.getNotes(params);
        const apiNotes = response.data || [];
        const items = apiNotes.map(convertNoteToTimelineItem);
        const total = response.meta?.pagination?.total || 0;

        return { items, total };
      } catch (error: any) {
        adnaan.toast.error(error.message || `加载${year}年手记失败`);
        return { items: [], total: 0 };
      }
    },
    [cleanedFilters, convertNoteToTimelineItem],
  );

  // 筛选组配置
  const filterGroups: FilterGroup[] = [
    {
      key: 'search',
      label: '搜索',
      type: 'search',
      placeholder: '搜索手记内容...',
    },
    {
      key: 'mood',
      label: '心情',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        { label: '开心', value: '开心', icon: <FiSmile /> },
        { label: '平静', value: '平静', icon: <FiMeh /> },
        { label: '思考', value: '思考', icon: <FiThumbsUp /> },
        { label: '感慨', value: '感慨', icon: <FiFrown /> },
        { label: '兴奋', value: '兴奋', icon: <FiZap /> },
      ],
    },
    {
      key: 'weather',
      label: '天气',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        { label: '晴天', value: '晴天', icon: <FiSun /> },
        { label: '多云', value: '多云', icon: <FiCloud /> },
        { label: '雨天', value: '雨天', icon: <FiCloudRain /> },
        { label: '雪天', value: '雪天', icon: <FiCloudSnow /> },
        { label: '阴天', value: '阴天', icon: <FiWind /> },
      ],
    },
    {
      key: 'orderBy',
      label: '排序',
      type: 'single',
      options: [
        { label: '最新', value: 'createdAt' },
        { label: '最热', value: 'likeCount' },
      ],
    },
  ];

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
            title="拾光"
            subtitle="键盘敲碎的晨昏里，藏着踩坑的余温、顿悟的微光，把每一次批注都折成纸船，在笔记的河流里打捞成长的回响"
            count={totalCount}
            countUnit="篇手记"
            filterGroups={filterGroups}
            filterValues={filterValues}
            onFilterChange={setFilterValues}
            onCleanFilterChange={setCleanedFilters}
          />

          <MultiYearTimeline
            years={years}
            renderItem={(item, index) => renderNoteItem(item as unknown as Note, index)}
            onLoadYearItems={loadYearItems}
            initialYearsToLoad={4}
            loading={isLoading}
            emptyState={emptyStateComponent}
            maxHeight={300}
          />
        </Container>
      </PageContainer>
    </>
  );
};

export default NotesPage;
