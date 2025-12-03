import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  FiGithub,
  FiExternalLink,
  FiStar,
  FiGitBranch,
  FiEye,
  FiCalendar,
  FiPackage,
  FiBook,
  FiCode,
  FiDownload,
  FiAlertCircle,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiArrowLeft,
  FiLayers,
  FiGlobe,
} from 'react-icons/fi';
import { API } from '@/utils/api';
import type { Project } from '@/types';
import { formatDate } from '@/utils';
import LazyRichTextRenderer from '@/components/rich-text/lazy-rich-text-renderer';
import { RichTextContent } from '@/components/rich-text/rich-text-content';
import { DetailPageLayout, DetailNoiseBackground, CommentSection } from '@/components/content';
import { usePageInfo } from '@/hooks/usePageInfo';
import { SEO, ProjectDetailSkeleton } from '@/components/common';
import { useAnimationEngine, SPRING_PRESETS } from '@/utils/ui/animation';

// ============================================================================
// 样式组件 - 保持与手记详情(NoteDetail)一致的极简风格
// ============================================================================

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem 1rem 3rem;
  }
`;

// 页面头部渐变背景 (带呼吸动画)
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 700px;
  width: 100%;
  overflow: hidden;
  z-index: 0;
  transition: opacity 1s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    will-change: transform;
  }

  /* 第一层：主光晕 */
  &::before {
    background: radial-gradient(
      ellipse 160% 110% at 15% 10%,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(59, 130, 246, 0.15) 25%,
      rgba(59, 130, 246, 0.05) 50%,
      transparent 75%
    );
    transform-origin: 15% 10%;
    animation: breatheGlow1 25s ease-in-out infinite;
  }

  /* 第二层：次光晕 */
  &::after {
    background: radial-gradient(
      ellipse 140% 95% at 85% 15%,
      rgba(139, 92, 246, 0.2) 0%,
      rgba(139, 92, 246, 0.1) 30%,
      rgba(139, 92, 246, 0.04) 55%,
      transparent 80%
    );
    transform-origin: 85% 15%;
    animation: breatheGlow2 30s ease-in-out infinite;
    animation-delay: 8s;
  }

  @keyframes breatheGlow1 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    33% {
      transform: scale(1.08) rotate(1deg);
      opacity: 0.92;
    }
    66% {
      transform: scale(0.96) rotate(-0.5deg);
      opacity: 0.96;
    }
  }

  @keyframes breatheGlow2 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    40% {
      transform: scale(1.06) rotate(-1deg);
      opacity: 0.88;
    }
    75% {
      transform: scale(0.98) rotate(0.8deg);
      opacity: 0.94;
    }
  }

  /* 遮罩 */
  mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.8) 40%, transparent 80%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.8) 40%, transparent 80%);
`;

// 非对称布局网格
const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 240px 1fr;
    gap: 2.5rem;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// 侧边栏
const Sidebar = styled(motion.aside)`
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

  @media (max-width: 860px) {
    position: static;
    order: 2;
    display: none; /* 移动端在底部显示 */
  }
`;

// 移动端侧边栏替代
const MobileSidebar = styled.div`
  display: none;
  @media (max-width: 860px) {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-tertiary);
  font-size: 0.9rem;
  transition: color 0.2s ease;
  text-decoration: none;

  &:hover {
    color: var(--accent-color);
    transform: translateX(-4px);
  }
`;

const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SidebarTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  font-weight: 600;
  margin: 0;
`;

const SidebarDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  text-align: justify;
`;

// 项目操作按钮组
const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ActionButton = styled.a<{ variant?: 'primary' | 'default' }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: var(--accent-color);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.25);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.35);
    }
  `
      : `
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    
    &:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
      background: var(--bg-tertiary);
    }
  `}

  svg {
    font-size: 1.1rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-secondary);
  font-size: 0.9rem;

  svg {
    color: var(--accent-color);
    opacity: 0.8;
  }
`;

// 状态标签
const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  color: var(--text-secondary);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) => {
      switch (props.status) {
        case 'active':
          return '#10b981';
        case 'developing':
          return '#3b82f6';
        case 'paused':
          return '#f59e0b';
        default:
          return '#9ca3af';
      }
    }};
  }
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  background: rgba(var(--bg-primary-rgb), 0.5);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
`;

// 主内容区
const MainContent = styled(motion.main)`
  min-width: 0;
`;

const HeaderArea = styled.header`
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const MobileBackLinkWrapper = styled.div`
  display: none;
  margin-bottom: 1rem;

  @media (max-width: 860px) {
    display: block;
  }
`;

const ContentCard = styled.div`
  position: relative;

  .rich-text-content {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text-primary);

    img {
      border-radius: 12px;
      box-shadow: var(--shadow-md);
      margin: 2rem 0;
    }
  }
`;

// 项目统计展示
const StatsRow = styled.div`
  display: flex;
  gap: 2.5rem;

  @media (max-width: 640px) {
    gap: 1rem;
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.1rem;
  }

  svg {
    color: var(--text-tertiary);
    font-size: 1.1rem;
  }
`;

const statusTextMap: Record<string, string> = {
  active: '活跃',
  developing: '开发中',
  paused: '已暂停',
  archived: '已归档',
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { variants } = useAnimationEngine();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { setPageInfo } = usePageInfo();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await API.project.getProjectDetail(id);
        setProject(response.data);
        setPageInfo({
          title: response.data.title,
          tags: response.data.tags || [],
        });
      } catch (error) {
        console.error('加载项目详情失败:', error);
        setPageInfo(null);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
    return () => setPageInfo(null);
  }, [id, setPageInfo]);

  if (loading || !project) {
    return <ProjectDetailSkeleton />;
  }

  // 侧边栏内容 - 复用逻辑
  const SidebarContent = () => (
    <>
      {/* 项目主要操作 */}
      <SidebarSection>
        <ActionButtons>
          {project.demoUrl && (
            <ActionButton href={project.demoUrl} target="_blank" rel="noopener noreferrer" variant="primary">
              <FiGlobe /> 在线演示
            </ActionButton>
          )}
          {project.githubUrl && (
            <ActionButton href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <FiGithub /> 源码仓库
            </ActionButton>
          )}
          {project.docsUrl && (
            <ActionButton href={project.docsUrl} target="_blank" rel="noopener noreferrer">
              <FiBook /> 项目文档
            </ActionButton>
          )}
        </ActionButtons>
      </SidebarSection>

      {/* 项目简介 */}
      {project.description && (
        <SidebarSection>
          <SidebarTitle>简介</SidebarTitle>
          <SidebarDescription>{project.description}</SidebarDescription>
        </SidebarSection>
      )}

      <SidebarSection>
        <SidebarTitle>项目信息</SidebarTitle>
        <MetaItem>
          <StatusBadge status={project.status}>{statusTextMap[project.status]}</StatusBadge>
        </MetaItem>
        {project.language && (
          <MetaItem>
            <FiCode /> {project.language}
          </MetaItem>
        )}
        {project.isOpenSource && (
          <MetaItem>
            <FiCode /> 开源项目
          </MetaItem>
        )}
        <MetaItem>
          <FiCalendar /> {formatDate(project.createdAt, 'YYYY-MM-DD')}
        </MetaItem>
      </SidebarSection>

      {/* 技术栈 */}
      {project.techStack && project.techStack.length > 0 && (
        <SidebarSection>
          <SidebarTitle>技术栈</SidebarTitle>
          <TagsWrapper>
            {project.techStack.map((tech, idx) => (
              <Tag key={idx}>{tech}</Tag>
            ))}
          </TagsWrapper>
        </SidebarSection>
      )}

      {/* 标签 */}
      {project.tags && project.tags.length > 0 && (
        <SidebarSection>
          <SidebarTitle>标签</SidebarTitle>
          <TagsWrapper>
            {project.tags.map((tag, idx) => (
              <Tag key={idx}>#{tag}</Tag>
            ))}
          </TagsWrapper>
        </SidebarSection>
      )}
    </>
  );

  return (
    <DetailPageLayout showBackground={false} mainContent={<></>}>
      <SEO
        title={project.title}
        description={project.description || '查看项目详情'}
        keywords={project.tags?.join(', ')}
        type="article"
      />

      <DetailNoiseBackground />
      <PageHeadGradient />

      <PageContainer>
        <LayoutGrid>
          {/* 左侧固定侧边栏 */}
          <Sidebar initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING_PRESETS.gentle}>
            <BackLink to="/projects">
              <FiArrowLeft /> 返回项目列表
            </BackLink>
            <SidebarContent />
          </Sidebar>

          {/* 右侧主内容 */}
          <MainContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...SPRING_PRESETS.gentle }}
          >
            <HeaderArea>
              <MobileBackLinkWrapper>
                <BackLink to="/projects">
                  <FiArrowLeft /> 返回项目列表
                </BackLink>
              </MobileBackLinkWrapper>

              <Title>{project.title}</Title>

              <StatsRow>
                {project.stars > 0 && (
                  <StatItem>
                    <FiStar /> <strong>{project.stars}</strong> Stars
                  </StatItem>
                )}
                {project.forks > 0 && (
                  <StatItem>
                    <FiGitBranch /> <strong>{project.forks}</strong> Forks
                  </StatItem>
                )}
                {project.viewCount > 0 && (
                  <StatItem>
                    <FiEye /> <strong>{project.viewCount}</strong> Views
                  </StatItem>
                )}
              </StatsRow>
            </HeaderArea>

            <ContentCard>
              <RichTextContent className="rich-text-content">
                {project.content ? (
                  <LazyRichTextRenderer
                    content={project.content}
                    mode="article"
                    chunkSize={1000}
                    enableCodeHighlight={true}
                    enableImagePreview={true}
                  />
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem' }}>暂无详细介绍</p>
                )}
              </RichTextContent>
            </ContentCard>

            {/* 移动端底部侧边栏内容 */}
            <MobileSidebar>
              <SidebarContent />
            </MobileSidebar>

            <div style={{ marginTop: '4rem' }}>
              <CommentSection targetId={Number(project.id)} targetType="project" />
            </div>
          </MainContent>
        </LayoutGrid>
      </PageContainer>
    </DetailPageLayout>
  );
};

export default ProjectDetail;
