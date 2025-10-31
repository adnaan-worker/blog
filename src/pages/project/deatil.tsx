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
  FiArrowLeft,
  FiPackage,
  FiBook,
  FiCode,
  FiDownload,
  FiAlertCircle,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAward,
} from 'react-icons/fi';
import { API, Project } from '@/utils/api';
import { formatDate } from '@/utils';
import RichTextRenderer from '@/components/rich-text/rich-text-renderer';
import { RichTextContent } from '@/components/rich-text/rich-text-content';
import { DetailPageLayout, DetailMainContent, DetailSidebar } from '@/components/common/detail-page-layout';
import DetailNoiseBackground from '@/components/common/detail-noise-background';
import { usePageInfo } from '@/hooks/usePageInfo';
import { SEO, AutoSkeleton } from '@/components/common';

// 样式组件
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 20px 1.5rem 4rem;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    padding: 15px 1rem 3rem;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
    transform: translateX(-3px);
  }
`;

const ProjectHeader = styled.div`
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.5);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
  }
`;

const ProjectHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  justify-content: center;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--text-tertiary);
  opacity: 0.8;

  svg {
    font-size: 0.85rem;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
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

const ProjectLanguage = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  opacity: 0.9;
  font-family: var(--font-code, 'Consolas', 'Monaco', monospace);

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) => props.color || '#6b7280'};
  }
`;

const ProjectTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.875rem;
  border-radius: 4px;
  font-size: 0.8rem;
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
    font-size: 0.9rem;
  }
`;

// 项目布局容器 - 参考文章详情页的 ArticleLayout
const ProjectLayout = styled.div`
  display: flex;
  gap: 2rem;
  position: relative;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 2.5rem;
  }
`;

// 项目主内容区 - 参考文章详情页的 ArticleMain
const ProjectMain = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 1024px) {
    margin-right: 0;
  }
`;

// 侧边栏容器 - 参考文章详情页的 ArticleSidebar
const ProjectSidebar = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 150px;
  width: 280px;
  height: fit-content;
  align-self: flex-start;
  overflow-y: auto;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }

  @media (max-width: 1024px) {
    position: static;
    width: 100%;
    height: auto;
    max-height: none;
    margin-top: 0;
  }
`;

const InfoCard = styled.div`
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

  &:last-child {
    border-bottom: none;
  }

  /* 移动端隐藏（作者、统计、时间线在移动端显示在内容上方） */
  &.mobile-hidden {
    @media (max-width: 1024px) {
      display: none;
    }
  }
`;

const InfoTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;

  svg {
    color: var(--accent-color);
    font-size: 0.95rem;
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-secondary);

  svg {
    font-size: 0.95rem;
    flex-shrink: 0;
    opacity: 0.7;
  }

  strong {
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const TagsSection = styled.div`
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

const HeaderCoverImage = styled.img`
  width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    order: -1;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.6;

  svg {
    font-size: 0.95rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: var(--accent-color);
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
`;

// 移动端信息卡片（作者、统计、时间线）
const MobileInfoCard = styled.div`
  display: none;
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  [data-theme='dark'] & {
    background: rgba(var(--bg-secondary-rgb, 30, 30, 30), 0.6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 1024px) {
    display: block;
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

const MobileInfoSection = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

  &:first-of-type {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const MobileSectionTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    font-size: 0.85rem;
  }
`;

const MobileAuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MobileAuthorAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
`;

const MobileAuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const MobileAuthorName = styled.div`
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 600;
`;

const MobileAuthorUsername = styled.div`
  font-size: 0.8rem;
  color: var(--text-tertiary);
  opacity: 0.8;
`;

const AuthorAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const AuthorName = styled.span`
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const AuthorUsername = styled.span`
  font-size: 0.7rem;
  color: var(--text-tertiary);
  opacity: 0.8;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
`;

const statusTextMap: Record<string, string> = {
  active: '活跃',
  developing: '开发中',
  paused: '暂停',
  archived: '已归档',
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // 使用智能导航栏
  const { setPageInfo } = usePageInfo();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await API.project.getProjectDetail(id);
        setProject(response.data);

        // 设置智能导航栏信息
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

    // 组件卸载时重置页面信息
    return () => {
      setPageInfo(null);
    };
  }, [id, setPageInfo]);

  return (
    <>
      <SEO
        title={project?.title || '加载中...'}
        description={project?.description || '查看项目详情'}
        keywords={project?.tags?.join(', ')}
        type="article"
      />
      <AutoSkeleton loading={loading || !project} cacheKey={`project-detail-${id}`} minLoadingTime={800}>
        {project && (
          <DetailPageLayout showBackground={true} mainContent={<></>}>
            {/* 噪点背景 - 仅详情页使用 */}
            <DetailNoiseBackground />
            <PageContainer>
              <BackLink to="/projects">
                <FiArrowLeft /> 返回项目列表
              </BackLink>

              {/* 项目布局 - 参考手记详情页结构 */}
              <ProjectLayout>
                {/* 左侧：项目内容 */}
                <DetailMainContent>
                  <ProjectMain>
                    {/* 项目头部卡片 */}
                    <ProjectHeader>
                      <ProjectHeaderContent>
                        <ProjectMeta>
                          <StatusBadge status={project.status}>{statusTextMap[project.status]}</StatusBadge>
                          {project.language && (
                            <ProjectLanguage color={project.languageColor}>{project.language}</ProjectLanguage>
                          )}
                          {project.isOpenSource && (
                            <MetaBadge title="开源项目">
                              <FiCode /> 开源
                            </MetaBadge>
                          )}
                          {project.isFeatured && (
                            <MetaBadge title="精选项目">
                              <FiAward /> 精选
                            </MetaBadge>
                          )}
                        </ProjectMeta>

                        <ProjectTitle>{project.title}</ProjectTitle>

                        {project.description && <ProjectDescription>{project.description}</ProjectDescription>}

                        <ProjectActions>
                          {project.githubUrl && (
                            <ActionButton
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="primary"
                            >
                              <FiGithub /> GitHub
                            </ActionButton>
                          )}
                          {project.giteeUrl && (
                            <ActionButton
                              href={project.giteeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="primary"
                            >
                              <FiGithub /> Gitee
                            </ActionButton>
                          )}
                          {project.demoUrl && (
                            <ActionButton
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="secondary"
                            >
                              <FiExternalLink /> 在线演示
                            </ActionButton>
                          )}
                          {project.docsUrl && (
                            <ActionButton
                              href={project.docsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="secondary"
                            >
                              <FiBook /> 文档
                            </ActionButton>
                          )}
                          {project.npmPackage && (
                            <ActionButton
                              href={`https://www.npmjs.com/package/${project.npmPackage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="secondary"
                            >
                              <FiPackage /> NPM
                            </ActionButton>
                          )}
                        </ProjectActions>
                      </ProjectHeaderContent>

                      {project.coverImage && <HeaderCoverImage src={project.coverImage} alt={project.title} />}
                    </ProjectHeader>

                    {/* 移动端信息卡片：作者、统计、时间线 */}
                    <MobileInfoCard>
                      {/* 作者信息 */}
                      {project.author && (
                        <MobileInfoSection>
                          <MobileSectionTitle>
                            <FiUser />
                            作者
                          </MobileSectionTitle>
                          <MobileAuthorInfo>
                            <MobileAuthorAvatar
                              src={project.author.avatar}
                              alt={project.author.fullName || project.author.username}
                            />
                            <MobileAuthorDetails>
                              <MobileAuthorName>{project.author.fullName || project.author.username}</MobileAuthorName>
                              <MobileAuthorUsername>@{project.author.username}</MobileAuthorUsername>
                            </MobileAuthorDetails>
                          </MobileAuthorInfo>
                        </MobileInfoSection>
                      )}

                      {/* 项目统计 */}
                      {(project.stars > 0 ||
                        project.forks > 0 ||
                        project.watchers > 0 ||
                        project.issues > 0 ||
                        project.downloads > 0 ||
                        project.viewCount > 0) && (
                        <MobileInfoSection>
                          <MobileSectionTitle>
                            <FiStar />
                            项目统计
                          </MobileSectionTitle>
                          <InfoList>
                            {project.stars > 0 && (
                              <InfoItem>
                                <FiStar />
                                <strong>{project.stars}</strong> Stars
                              </InfoItem>
                            )}
                            {project.forks > 0 && (
                              <InfoItem>
                                <FiGitBranch />
                                <strong>{project.forks}</strong> Forks
                              </InfoItem>
                            )}
                            {project.watchers > 0 && (
                              <InfoItem>
                                <FiEye />
                                <strong>{project.watchers}</strong> Watchers
                              </InfoItem>
                            )}
                            {project.issues > 0 && (
                              <InfoItem>
                                <FiAlertCircle />
                                <strong>{project.issues}</strong> Issues
                              </InfoItem>
                            )}
                            {project.downloads > 0 && (
                              <InfoItem>
                                <FiDownload />
                                <strong>{project.downloads}</strong> 下载量
                              </InfoItem>
                            )}
                            {project.viewCount > 0 && (
                              <InfoItem>
                                <FiEye />
                                <strong>{project.viewCount}</strong> 浏览
                              </InfoItem>
                            )}
                          </InfoList>
                        </MobileInfoSection>
                      )}

                      {/* 时间线 */}
                      {(project.startedAt || project.createdAt || project.updatedAt) && (
                        <MobileInfoSection>
                          <MobileSectionTitle>
                            <FiClock />
                            时间线
                          </MobileSectionTitle>
                          <InfoList>
                            {project.startedAt && (
                              <InfoItem>
                                <FiCalendar />
                                开始于 <strong>{formatDate(project.startedAt, 'YYYY-MM-DD')}</strong>
                              </InfoItem>
                            )}
                            {project.createdAt && (
                              <InfoItem>
                                <FiCalendar />
                                创建于 <strong>{formatDate(project.createdAt, 'YYYY-MM-DD')}</strong>
                              </InfoItem>
                            )}
                            {project.updatedAt && (
                              <InfoItem>
                                <FiClock />
                                更新于 <strong>{formatDate(project.updatedAt, 'YYYY-MM-DD')}</strong>
                              </InfoItem>
                            )}
                          </InfoList>
                        </MobileInfoSection>
                      )}
                    </MobileInfoCard>

                    {/* 项目内容 */}
                    {project.content ? (
                      <RichTextContent className="rich-text-content">
                        <RichTextRenderer content={project.content} mode="article" />
                      </RichTextContent>
                    ) : (
                      <RichTextContent className="rich-text-content">
                        <p>暂无详细介绍</p>
                      </RichTextContent>
                    )}
                  </ProjectMain>
                </DetailMainContent>

                {/* 右侧：项目信息 */}
                <DetailSidebar>
                  <ProjectSidebar>
                    {/* 作者信息 - 桌面端显示，移动端隐藏 */}
                    {project.author && (
                      <InfoCard className="mobile-hidden">
                        <InfoTitle>
                          <FiUser />
                          作者
                        </InfoTitle>
                        <AuthorInfo>
                          <AuthorAvatar
                            src={project.author.avatar}
                            alt={project.author.fullName || project.author.username}
                          />
                          <AuthorDetails>
                            <AuthorName>{project.author.fullName || project.author.username}</AuthorName>
                            <AuthorUsername>@{project.author.username}</AuthorUsername>
                          </AuthorDetails>
                        </AuthorInfo>
                      </InfoCard>
                    )}

                    {/* 项目统计 - 桌面端显示，移动端隐藏 */}
                    <InfoCard className="mobile-hidden">
                      <InfoTitle>
                        <FiStar />
                        项目统计
                      </InfoTitle>
                      <InfoList>
                        {project.stars > 0 && (
                          <InfoItem>
                            <FiStar />
                            <strong>{project.stars}</strong> Stars
                          </InfoItem>
                        )}
                        {project.forks > 0 && (
                          <InfoItem>
                            <FiGitBranch />
                            <strong>{project.forks}</strong> Forks
                          </InfoItem>
                        )}
                        {project.watchers > 0 && (
                          <InfoItem>
                            <FiEye />
                            <strong>{project.watchers}</strong> Watchers
                          </InfoItem>
                        )}
                        {project.issues > 0 && (
                          <InfoItem>
                            <FiAlertCircle />
                            <strong>{project.issues}</strong> Issues
                          </InfoItem>
                        )}
                        {project.downloads > 0 && (
                          <InfoItem>
                            <FiDownload />
                            <strong>{project.downloads}</strong> 下载量
                          </InfoItem>
                        )}
                        {project.viewCount > 0 && (
                          <InfoItem>
                            <FiEye />
                            <strong>{project.viewCount}</strong> 浏览
                          </InfoItem>
                        )}
                      </InfoList>
                    </InfoCard>

                    {/* 时间信息 - 桌面端显示，移动端隐藏 */}
                    <InfoCard className="mobile-hidden">
                      <InfoTitle>
                        <FiClock />
                        时间线
                      </InfoTitle>
                      <InfoList>
                        {project.startedAt && (
                          <InfoItem>
                            <FiCalendar />
                            开始于 <strong>{formatDate(project.startedAt, 'YYYY-MM-DD')}</strong>
                          </InfoItem>
                        )}
                        {project.createdAt && (
                          <InfoItem>
                            <FiCalendar />
                            创建于 <strong>{formatDate(project.createdAt, 'YYYY-MM-DD')}</strong>
                          </InfoItem>
                        )}
                        {project.updatedAt && (
                          <InfoItem>
                            <FiClock />
                            更新于 <strong>{formatDate(project.updatedAt, 'YYYY-MM-DD')}</strong>
                          </InfoItem>
                        )}
                      </InfoList>
                    </InfoCard>

                    {/* 功能特性 */}
                    {project.features && project.features.length > 0 && (
                      <InfoCard>
                        <InfoTitle>
                          <FiCheckCircle />
                          功能特性
                        </InfoTitle>
                        <FeaturesList>
                          {project.features.map((feature, idx) => (
                            <FeatureItem key={idx}>
                              <FiCheckCircle />
                              <span>{feature}</span>
                            </FeatureItem>
                          ))}
                        </FeaturesList>
                      </InfoCard>
                    )}

                    {/* 技术栈 */}
                    {project.techStack && project.techStack.length > 0 && (
                      <InfoCard>
                        <InfoTitle>
                          <FiCode />
                          技术栈
                        </InfoTitle>
                        <TagsSection>
                          {project.techStack.map((tech, idx) => (
                            <Tag key={idx}>{tech}</Tag>
                          ))}
                        </TagsSection>
                      </InfoCard>
                    )}

                    {/* 标签 */}
                    {project.tags && project.tags.length > 0 && (
                      <InfoCard>
                        <InfoTitle>标签</InfoTitle>
                        <TagsSection>
                          {project.tags.map((tag, idx) => (
                            <Tag key={idx}>{tag}</Tag>
                          ))}
                        </TagsSection>
                      </InfoCard>
                    )}
                  </ProjectSidebar>
                </DetailSidebar>
              </ProjectLayout>
            </PageContainer>
          </DetailPageLayout>
        )}
      </AutoSkeleton>
    </>
  );
};

export default ProjectDetail;
