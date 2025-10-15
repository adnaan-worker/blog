import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiGithub, FiExternalLink, FiStar, FiGitBranch, FiCalendar } from 'react-icons/fi';
import { API, Project } from '@/utils/api';
import { formatDate } from '@/utils';
import { Pagination } from 'adnaan-ui';

// 动画变体
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

// 样式组件
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
`;

const PageHeader = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const StatsInfo = styled.div`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;

  .count {
    color: var(--accent-color);
    font-weight: 600;
    font-family: var(--font-code, 'Consolas', 'Monaco', monospace);
    font-size: 0.9rem;
  }

  .text {
    opacity: 0.8;
  }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.15);
  flex-wrap: wrap;
`;

const FilterLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-weight: 500;
  opacity: 0.8;
`;

const FilterTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
`;

const FilterTag = styled.button<{ active?: boolean }>`
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  border: none;
  background: ${(props) => (props.active ? 'rgba(var(--accent-rgb), 0.12)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  font-size: 0.8rem;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--accent-rgb), 0.08);
    color: var(--accent-color);
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
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  return (
    <ProjectItem variants={cardVariants} custom={index}>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const pageSize = 5;

  // 加载项目
  const loadProjects = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await API.project.getProjects({
        page: currentPage,
        limit: pageSize, // 统一使用 limit 参数
        status: selectedStatus as any,
        language: selectedLanguage,
      });

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

  // 筛选条件变化时重置页码并加载
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedLanguage]);

  // 页码变化或筛选条件变化时加载数据
  useEffect(() => {
    loadProjects(page);
    // 滚动到顶部
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, selectedStatus, selectedLanguage]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>开源项目</PageTitle>
        <PageDescription>探索代码与创意，共建开发生态</PageDescription>
        {totalCount > 0 && (
          <StatsInfo>
            <span className="text">共</span>
            <span className="count"> {totalCount} </span>
            <span className="text">个项目</span>
          </StatsInfo>
        )}
      </PageHeader>

      <FilterBar>
        <FilterLabel>筛选</FilterLabel>
        <FilterTags>
          <FilterTag active={!selectedStatus} onClick={() => setSelectedStatus('')}>
            全部
          </FilterTag>
          <FilterTag active={selectedStatus === 'active'} onClick={() => setSelectedStatus('active')}>
            活跃
          </FilterTag>
          <FilterTag active={selectedStatus === 'developing'} onClick={() => setSelectedStatus('developing')}>
            开发中
          </FilterTag>
          <FilterTag active={selectedStatus === 'archived'} onClick={() => setSelectedStatus('archived')}>
            已归档
          </FilterTag>
        </FilterTags>
      </FilterBar>

      {loading ? (
        <LoadingState>加载中...</LoadingState>
      ) : projects.length > 0 ? (
        <>
          <ProjectsList initial="hidden" animate="visible" variants={staggerContainerVariants}>
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </ProjectsList>

          {totalPages > 1 && (
            <PaginationWrapper>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalCount}
                onPageChange={handlePageChange}
                showInfo={false}
                showSizeChanger={false}
              />
            </PaginationWrapper>
          )}
        </>
      ) : (
        <EmptyState variants={fadeInUpVariants} initial="hidden" animate="visible">
          <FiGithub />
          <h3>暂无项目</h3>
          <p>还没有发布任何项目</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default Projects;
