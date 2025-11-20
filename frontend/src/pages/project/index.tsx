import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiGithub, FiExternalLink, FiStar, FiGitBranch, FiCalendar, FiCode, FiUnlock } from 'react-icons/fi';
import { API } from '@/utils/api';
import type { Project } from '@/types';
import { formatDate } from '@/utils';
import { Pagination } from 'adnaan-ui';
import { useAnimationEngine, useSmartInView, useSpringInteractions } from '@/utils/ui/animation';
import { ListPageHeader, type FilterGroup, type FilterValues, ProjectListSkeleton } from '@/components/common';
import { SEO } from '@/components/common';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';

import { getLanguageIcon } from '@/utils/ui/language-icons';

// 样式组件
const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const ProjectsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProjectItem = styled(motion.div)`
  position: relative;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(var(--bg-secondary-rgb), 0.2);
  border: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.2);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: rgba(var(--bg-secondary-rgb), 0.5);
    border-color: rgba(var(--accent-rgb), 0.2);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const ProjectInner = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProjectMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-width: 0;
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ProjectTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.3;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent-color);
    }
  }
`;

const ProjectLanguage = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  background: ${(props) => `${props.color}15`};
  color: ${(props) => props.color};
  border-radius: 20px;
  border: 1px solid ${(props) => `${props.color}30`};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const ProjectFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  height: 100%;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    margin-top: 0.5rem;
    width: 100%;
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
  font-size: 0.85rem;
  color: var(--text-tertiary);
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

const ProjectLink = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
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

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  background: ${(props) => {
    switch (props.status) {
      case 'active':
        return 'rgba(16, 185, 129, 0.1)';
      case 'developing':
        return 'rgba(59, 130, 246, 0.1)';
      case 'paused':
        return 'rgba(251, 191, 36, 0.1)';
      case 'archived':
        return 'rgba(107, 114, 128, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
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
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, variants }) => {
  const itemInteractions = useSpringInteractions({ hoverScale: 1.01, hoverY: -2 });
  const linkInteractions = useSpringInteractions({ hoverScale: 1.05, hoverY: -1, tapScale: 0.95 });

  const langConfig = getLanguageIcon(project.language);

  return (
    <ProjectItem variants={variants} custom={index} {...itemInteractions}>
      <ProjectInner>
        <ProjectMain>
          <ProjectHeader>
            <ProjectTitle>
              <Link to={`/projects/${project.slug}`}>{project.title}</Link>
            </ProjectTitle>
            <StatusBadge status={project.status}>{statusTextMap[project.status]}</StatusBadge>
            {project.language && <ProjectLanguage color={langConfig.color}>{project.language}</ProjectLanguage>}
          </ProjectHeader>

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

        <ProjectFooter>
          <ProjectMetaInfo>
            {project.stars > 0 && (
              <MetaItem title="Stars">
                <FiStar /> {project.stars}
              </MetaItem>
            )}
            {project.forks > 0 && (
              <MetaItem title="Forks">
                <FiGitBranch /> {project.forks}
              </MetaItem>
            )}
            {project.startedAt && (
              <MetaItem title="创建时间">
                <FiCalendar /> {formatDate(project.startedAt, 'MM-DD')}
              </MetaItem>
            )}
          </ProjectMetaInfo>

          <ProjectActions>
            {project.githubUrl && (
              <ProjectLink
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary" // 改为 secondary 样式，更低调
                {...linkInteractions}
              >
                <FiGithub /> 源码
              </ProjectLink>
            )}
            {project.demoUrl && (
              <ProjectLink
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary"
                {...linkInteractions}
              >
                <FiExternalLink /> 演示
              </ProjectLink>
            )}
          </ProjectActions>
        </ProjectFooter>
      </ProjectInner>
    </ProjectItem>
  );
};

const Projects: React.FC = () => {
  // 使用动画引擎 - 统一的 Spring 动画系统
  const { variants } = useAnimationEngine();

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
      <PageContainer initial="hidden" animate="visible" variants={variants.stagger}>
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
