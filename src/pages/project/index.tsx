import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiGithub, FiExternalLink, FiStar, FiGitBranch, FiCalendar, FiCode, FiUnlock } from 'react-icons/fi';
import { API } from '@/utils/api';
import type { Project } from '@/types';
import { formatDate } from '@/utils';
import { Pagination } from 'adnaan-ui';
import { useAnimationEngine, useSmartInView } from '@/utils/ui/animation';
import { ListPageHeader, type FilterGroup, type FilterValues, ProjectListSkeleton } from '@/components/common';
import { SEO } from '@/components/common';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';

// 样式组件
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
  /* 移动端优化 - 防止内容溢出 */
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const ProjectsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ProjectItem = styled(motion.div)`
  position: relative;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.5);
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 0;
  }
`;

const ProjectInner = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProjectMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  /* 移动端优化 - 防止内容溢出 */
  max-width: 100%;
  overflow-x: hidden;
`;

const ProjectTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ProjectTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent-color);
    }
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: ${(props) => {
    switch (props.status) {
      case 'active':
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))';
      case 'developing':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08))';
      case 'paused':
        return 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.08))';
      case 'archived':
        return 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.08))';
      default:
        return 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.08))';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'active':
        return '#10b981';
      case 'developing':
        return '#3b82f6';
      case 'paused':
        return '#fbbf24';
      case 'archived':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const ProjectMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ProjectLanguage = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--accent-color);
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(var(--accent-rgb), 0.08);
  border-radius: 4px;

  &::before {
    content: '◆';
    font-size: 0.7rem;
  }
`;

const ProjectInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ProjectMetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);

  @media (max-width: 1024px) {
    gap: 1rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: 0.01em;
  /* 移动端优化 - 防止长单词溢出 */
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

const ProjectTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Tag = styled.span`
  font-size: 0.7rem;
  color: var(--accent-color);
  opacity: 0.8;
  font-weight: 400;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.1em;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.9;

  svg {
    font-size: 0.85rem;
    opacity: 0.7;
  }
`;

const ProjectActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 1024px) {
    margin-top: 0.75rem;
  }
`;

const ProjectLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;

  &.primary {
    background: rgba(var(--accent-rgb), 0.12);
    color: var(--accent-color);

    &:hover {
      background: rgba(var(--accent-rgb), 0.18);
    }
  }

  &.secondary {
    color: var(--text-tertiary);
    border: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

    &:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
  }

  svg {
    font-size: 0.85rem;
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    font-size: 0.9rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.15);
`;

// 状态文本映射
const statusTextMap: Record<string, string> = {
  active: '活跃',
  developing: '开发中',
  paused: '暂停',
  archived: '已归档',
};

// 项目卡片组件
interface ProjectCardProps {
  project: Project;
  index: number;
  variants: any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, variants }) => {
  return (
    <ProjectItem variants={variants} custom={index}>
      <ProjectInner>
        <ProjectMain>
          <ProjectTitleRow>
            <ProjectTitle>
              <Link to={`/projects/${project.slug}`}>{project.title}</Link>
            </ProjectTitle>
            {project.language && <ProjectLanguage>{project.language}</ProjectLanguage>}
            <StatusBadge status={project.status}>{statusTextMap[project.status]}</StatusBadge>
          </ProjectTitleRow>

          {project.description && <ProjectDescription>{project.description}</ProjectDescription>}

          <ProjectInfo>
            {project.tags && project.tags.length > 0 && (
              <ProjectTags>
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <Tag key={idx}>{tag}</Tag>
                ))}
              </ProjectTags>
            )}
          </ProjectInfo>
        </ProjectMain>

        <ProjectMetaInfo>
          {project.stars > 0 && (
            <MetaItem>
              <FiStar /> {project.stars}
            </MetaItem>
          )}
          {project.forks > 0 && (
            <MetaItem>
              <FiGitBranch /> {project.forks}
            </MetaItem>
          )}
          {project.startedAt && (
            <MetaItem>
              <FiCalendar /> {formatDate(project.startedAt, 'MM-DD')}
            </MetaItem>
          )}
        </ProjectMetaInfo>

        <ProjectActions>
          {project.githubUrl && (
            <ProjectLink href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="primary">
              <FiGithub /> GitHub
            </ProjectLink>
          )}
          {project.demoUrl && (
            <ProjectLink href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="secondary">
              <FiExternalLink /> Demo
            </ProjectLink>
          )}
        </ProjectActions>
      </ProjectInner>
    </ProjectItem>
  );
};

const Projects: React.FC = () => {
  // 使用动画引擎 - 统一的 Spring 动画系统
  const { variants, springPresets } = useAnimationEngine();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 5;

  // 筛选相关状态
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // 清理后的筛选参数（由 ListPageHeader 自动处理）
  const [cleanedFilters, setCleanedFilters] = useState<Record<string, any>>({});

  // 加载项目
  const loadProjects = async (currentPage: number) => {
    try {
      setLoading(true);

      // 使用清理后的参数，映射到API字段
      const params: any = {
        page: currentPage,
        limit: limit,
        ...cleanedFilters,
      };

      // 特殊字段映射
      if (cleanedFilters.search) {
        params.keyword = cleanedFilters.search;
        delete params.search;
      }

      const response = await API.project.getProjects(params);

      const newProjects = response.data || [];
      setProjects(newProjects);

      // 更新分页信息
      if (response.meta?.pagination) {
        setTotalPages(response.meta.pagination.totalPages);
        setTotalCount(response.meta.pagination.total);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
      adnaan.toast.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  // 筛选条件变化时重置页码
  useEffect(() => {
    setPage(1);
  }, [cleanedFilters]);

  // 页码变化或筛选条件变化时加载数据
  useEffect(() => {
    loadProjects(page);
    // 滚动到顶部
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, cleanedFilters]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 筛选组配置
  const filterGroups: FilterGroup[] = [
    {
      key: 'search',
      label: '搜索',
      type: 'search',
      placeholder: '搜索项目名称、描述...',
    },
    {
      key: 'status',
      label: '状态',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        { label: '活跃', value: 'active' },
        { label: '开发中', value: 'developing' },
        { label: '暂停', value: 'paused' },
        { label: '已归档', value: 'archived' },
      ],
    },
    {
      key: 'language',
      label: '编程语言',
      type: 'single',
      options: [
        { label: '全部', value: '', icon: <FiCode /> },
        { label: 'TypeScript', value: 'TypeScript', icon: <FiCode /> },
        { label: 'JavaScript', value: 'JavaScript', icon: <FiCode /> },
        { label: 'Python', value: 'Python', icon: <FiCode /> },
        { label: 'Java', value: 'Java', icon: <FiCode /> },
        { label: 'Go', value: 'Go', icon: <FiCode /> },
        { label: 'Rust', value: 'Rust', icon: <FiCode /> },
      ],
    },
    {
      key: 'isOpenSource',
      label: '开源',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        { label: '开源', value: 'true', icon: <FiUnlock /> },
      ],
    },
    {
      key: 'isFeatured',
      label: '精选',
      type: 'single',
      options: [
        { label: '全部', value: '' },
        { label: '精选项目', value: 'true', icon: <FiStar /> },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={PAGE_SEO_CONFIG.projectList.title}
        description={PAGE_SEO_CONFIG.projectList.description}
        keywords={PAGE_SEO_CONFIG.projectList.keywords}
        type="website"
      />
      <PageContainer>
        {/* 页面头部 - 统一组件 */}
        <ListPageHeader
          title="赴约"
          subtitle="以代码为信物，跨越屏幕的距离，每一行提交都是同频者的应答，在开源的旷野上，赴一场关于热爱与传承的约定"
          count={totalCount}
          countUnit="个项目"
          filterGroups={filterGroups}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          onCleanFilterChange={setCleanedFilters}
        />

        {/* 只有加载完成后才显示内容或空状态 */}
        {loading ? (
          <ProjectListSkeleton count={4} />
        ) : projects.length > 0 ? (
          <>
            <ProjectsList initial="hidden" animate="visible" variants={variants.stagger}>
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} variants={variants.listItemUp} />
              ))}
            </ProjectsList>

            {totalPages > 1 && (
              <PaginationWrapper>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={limit}
                  totalItems={totalCount}
                  onPageChange={handlePageChange}
                  showInfo={false}
                  showSizeChanger={false}
                />
              </PaginationWrapper>
            )}
          </>
        ) : (
          <EmptyState variants={variants.fadeIn} initial="hidden" animate="visible">
            <FiGithub />
            <h3>暂无项目</h3>
            <p>还没有发布任何项目</p>
          </EmptyState>
        )}
      </PageContainer>
    </>
  );
};

export default Projects;
