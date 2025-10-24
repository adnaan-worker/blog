import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiGithub, FiCode, FiCalendar, FiFolderPlus, FiExternalLink } from 'react-icons/fi';
import { SiGitee } from 'react-icons/si';
import { formatDate } from '@/utils';
import { useAnimationEngine } from '@/utils/animation-engine';
import { Icon } from '@/components/common/Icon';
import { RadarChart } from '@/components/charts/radar-chart';
import { getLanguageIcon, calculateProjectRadarData } from '@/utils/language-icons';
import { ProjectsSectionProps } from './types';

// Styled Components
const ProjectsWrapper = styled(motion.section)`
  margin: 3rem 0 4rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb), 0.03) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }
`;

const CreativeSectionHeader = styled.div`
  text-align: center;
  margin: 3.5rem 0 2.5rem;

  @media (max-width: 768px) {
    margin: 2.5rem 0 2rem;
  }
`;

const CreativeSectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ProjectsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  padding: 2rem 0;
  position: relative;
  min-height: 500px;
  width: 100%;
  max-width: 100%;

  &::before {
    content: '';
    position: absolute;
    left: 60%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 100px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--border-color) 15%,
      var(--border-color) 85%,
      transparent 100%
    );
    opacity: 0.6;

    @media (max-width: 968px) {
      display: none;
    }
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    min-height: auto;
    box-sizing: border-box;
  }
`;

const ProjectMainCard = styled(motion.div)`
  position: relative;
  height: 100%;

  @media (max-width: 968px) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: visible;
  }
`;

const ProjectDetailContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  cursor: ew-resize;

  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;

  @media (max-width: 968px) {
    width: 100%;
    max-width: 100%;
    touch-action: pan-y pinch-zoom;
    gap: 1rem;
    box-sizing: border-box;
  }
`;

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;

  @media (max-width: 968px) {
    gap: 0.75rem;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-right: 6rem;
  width: 100%;
  max-width: 100%;

  @media (max-width: 968px) {
    flex-direction: row;
    padding-right: 0;
    gap: 0.7rem;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }
`;

const ProjectIcon = styled.div<{ size?: 'large' | 'small' }>`
  width: ${(props) => (props.size === 'small' ? '32px' : '56px')};
  height: ${(props) => (props.size === 'small' ? '32px' : '56px')};
  border-radius: ${(props) => (props.size === 'small' ? '10px' : '14px')};
  background: rgba(var(--accent-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  font-size: ${(props) => (props.size === 'small' ? '1rem' : '1.75rem')};
  flex-shrink: 0;
  border: 1px solid rgba(var(--accent-rgb), 0.2);

  @media (max-width: 968px) {
    width: ${(props) => (props.size === 'small' ? '28px' : '42px')};
    height: ${(props) => (props.size === 'small' ? '28px' : '42px')};
    border-radius: ${(props) => (props.size === 'small' ? '8px' : '10px')};
    font-size: ${(props) => (props.size === 'small' ? '0.9rem' : '1.3rem')};
  }
`;

const ProjectTitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 100%;
`;

const ProjectTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  transition: color 0.2s ease;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 968px) {
    font-size: 0.9rem;
    margin: 0 0 0.3rem 0;
    line-height: 1.3;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 968px) {
    font-size: 0.75rem;
    line-height: 1.4;
    -webkit-line-clamp: 2;
  }
`;

const ViewDetailLink = styled(Link)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.8rem;
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;

  &:hover {
    color: var(--accent-color);
    opacity: 0.8;
    transform: translateX(2px);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(2px);
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

const ProjectDataSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 100%;

  @media (max-width: 968px) {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    margin-top: 0.75rem;
    align-items: flex-start;
    box-sizing: border-box;
  }
`;

const DataCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;

  @media (max-width: 968px) {
    flex: 1;
    min-width: 0;
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const RadarChartWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 968px) {
    width: 110px;
    flex-shrink: 0;

    canvas {
      width: 110px !important;
      height: 110px !important;
    }
  }
`;

const DataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.5);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 968px) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0.2rem;
    padding: 0.5rem 0.45rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: rgba(var(--accent-rgb), 0.03);
    border-bottom: none !important;
    min-height: auto;
  }
`;

const DataLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 968px) {
    font-size: 0.6rem;
    opacity: 0.85;
    font-weight: 500;

    svg {
      width: 10px;
      height: 10px;
    }
  }
`;

const DataValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);

  @media (max-width: 968px) {
    font-size: 0.5rem;
    font-weight: 700;
    word-break: break-word;
    width: 100%;
  }
`;

const LanguageTag = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => props.color};
  }
  @media (max-width: 968px) {
    font-size: 0.5rem;
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 968px) {
    grid-column: 1 / -1;
    margin-top: 0.5rem;
    padding-top: 0.6rem;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const ProjectLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  color: var(--text-secondary);
  background: transparent;

  &:hover {
    color: var(--accent-color);
    background: rgba(var(--accent-rgb), 0.08);
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 968px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.65rem;
    border-radius: 5px;

    svg {
      width: 11px;
      height: 11px;
    }
  }
`;

const MobileProjectIndicator = styled.div`
  display: none;

  @media (max-width: 968px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;

    .dots {
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }
  }
`;

const Dot = styled(motion.div)<{ active?: boolean }>`
  width: ${(props) => (props.active ? '20px' : '6px')};
  height: 6px;
  border-radius: 3px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--border-color)')};
  transition: all 0.3s ease;
`;

// 右侧几何拼图容器
const GeometryGridContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;

  @media (max-width: 968px) {
    display: none; /* 手机端隐藏 */
  }
`;

// 几何块标题（悬停显示）- 需要在 GeometryBlock 之前声明
const GeometryBlockTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(
    to top,
    rgba(var(--accent-rgb), 0.95) 0%,
    rgba(var(--accent-rgb), 0.85) 50%,
    transparent 100%
  );
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(4px);

  /* 默认隐藏 */
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

// 几何块 - 不规则尺寸
const GeometryBlock = styled(motion.div)<{
  isActive: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}>`
  position: absolute;
  left: calc(${(props) => props.x}% + 4px);
  top: calc(${(props) => props.y}% + 4px);
  width: calc(${(props) => props.width}% - 8px);
  height: calc(${(props) => props.height}% - 8px);
  background: ${(props) => (props.isActive ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(var(--accent-rgb), 0.06)')};
  border-radius: 8px;
  border: 2px solid ${(props) => (props.isActive ? 'var(--accent-color)' : 'transparent')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  /* 扁平化装饰 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(var(--accent-rgb), 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(var(--accent-rgb), 0.12);
    border-color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.4)')};
    z-index: 10;

    &::before {
      opacity: 1;
    }

    /* 悬停时显示标题 */
    ${GeometryBlockTitle} {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 968px) {
    border-radius: 6px;
  }
`;

const GeometryBlockContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--accent-color);
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  min-height: 420px;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.4;
  }

  p {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.7;
  }
`;

// 生成几何布局
const generateGeometryLayout = (count: number) => {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0, width: 100, height: 100 }];

  const layouts: Array<{ x: number; y: number; width: number; height: number }> = [];

  const splitArea = (x: number, y: number, width: number, height: number, remaining: number): void => {
    if (remaining === 1) {
      layouts.push({ x, y, width, height });
      return;
    }

    const aspectRatio = width / height;
    const shouldCutVertically = aspectRatio > 1.2 ? Math.random() > 0.3 : Math.random() < 0.3;

    if (shouldCutVertically) {
      const minRatio = 0.3;
      const maxRatio = 0.7;
      const splitRatio = minRatio + Math.random() * (maxRatio - minRatio);
      const splitPos = width * splitRatio;

      const leftCount = Math.max(1, Math.min(remaining - 1, Math.round(remaining * splitRatio)));
      const rightCount = remaining - leftCount;

      splitArea(x, y, splitPos, height, leftCount);
      splitArea(x + splitPos, y, width - splitPos, height, rightCount);
    } else {
      const minRatio = 0.3;
      const maxRatio = 0.7;
      const splitRatio = minRatio + Math.random() * (maxRatio - minRatio);
      const splitPos = height * splitRatio;

      const topCount = Math.max(1, Math.min(remaining - 1, Math.round(remaining * splitRatio)));
      const bottomCount = remaining - topCount;

      splitArea(x, y, width, splitPos, topCount);
      splitArea(x, y + splitPos, width, height - splitPos, bottomCount);
    }
  };

  splitArea(0, 0, 100, 100, count);

  return layouts;
};

// 主组件
export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  selectedProjectIndex,
  onProjectChange,
}) => {
  // 使用动画引擎 - Spring 系统
  const { variants, springPresets } = useAnimationEngine();

  // 使用 useMemo 根据 projects.length 动态计算布局
  const geometryLayouts = useMemo(() => {
    return generateGeometryLayout(projects.length);
  }, [projects.length]);

  const handlePrevProject = () => {
    if (selectedProjectIndex > 0) {
      onProjectChange(selectedProjectIndex - 1);
    }
  };

  const handleNextProject = () => {
    if (selectedProjectIndex < projects.length - 1) {
      onProjectChange(selectedProjectIndex + 1);
    }
  };

  return (
    <ProjectsWrapper
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants.stagger}
    >
      <CreativeSectionHeader>
        <CreativeSectionTitle variants={variants.fadeIn}>开源项目</CreativeSectionTitle>
        <SectionSubtitle variants={variants.fadeIn}>用代码构建更美好的世界</SectionSubtitle>
      </CreativeSectionHeader>

      <ProjectsGrid>
        {/* 左侧：选中项目的详细信息 */}
        <ProjectMainCard>
          {projects.length === 0 ? (
            <EmptyState>
              <FiFolderPlus />
              <p>暂无精选项目</p>
            </EmptyState>
          ) : projects[selectedProjectIndex] ? (
            <ProjectDetailContainer
              key={projects[selectedProjectIndex].id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={springPresets.bouncy}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -500) {
                  handleNextProject();
                } else if (swipe > 500) {
                  handlePrevProject();
                }
              }}
            >
              {/* 项目基本信息 */}
              <ProjectInfo>
                <ProjectHeader>
                  <ProjectIcon size="large">
                    {getLanguageIcon(projects[selectedProjectIndex].language).icon === 'code' ? (
                      <FiCode size={28} />
                    ) : (
                      <Icon
                        name={getLanguageIcon(projects[selectedProjectIndex].language).icon}
                        size={28}
                        color={getLanguageIcon(projects[selectedProjectIndex].language).color}
                      />
                    )}
                  </ProjectIcon>
                  <ProjectTitleWrapper>
                    <ProjectTitle>{projects[selectedProjectIndex].title}</ProjectTitle>
                    <ProjectDescription>{projects[selectedProjectIndex].description}</ProjectDescription>
                  </ProjectTitleWrapper>
                  <ViewDetailLink to={`/projects/${projects[selectedProjectIndex].slug}`}>
                    查看详情
                    <FiArrowRight size={12} />
                  </ViewDetailLink>
                </ProjectHeader>
              </ProjectInfo>

              {/* 项目数据和雷达图 */}
              <ProjectDataSection>
                {/* 左侧：项目数据 */}
                <DataCard>
                  <DataItem>
                    <DataLabel>
                      <FiStar size={16} />
                      Stars
                    </DataLabel>
                    <DataValue>{projects[selectedProjectIndex].stars || 0}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>
                      <FiGithub size={16} />
                      Forks
                    </DataLabel>
                    <DataValue>{projects[selectedProjectIndex].forks || 0}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>
                      <FiCode size={16} />
                      语言
                    </DataLabel>
                    <DataValue>
                      <LanguageTag color={getLanguageIcon(projects[selectedProjectIndex].language).color}>
                        {projects[selectedProjectIndex].language || 'N/A'}
                      </LanguageTag>
                    </DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>
                      <FiCalendar size={16} />
                      更新时间
                    </DataLabel>
                    <DataValue>
                      {projects[selectedProjectIndex].updatedAt
                        ? formatDate(projects[selectedProjectIndex].updatedAt, 'YYYY-MM-DD')
                        : '最近'}
                    </DataValue>
                  </DataItem>

                  {/* 项目链接 */}
                  <ProjectLinks>
                    {projects[selectedProjectIndex].githubUrl && (
                      <ProjectLink
                        href={projects[selectedProjectIndex].githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiGithub />
                        GitHub
                      </ProjectLink>
                    )}
                    {projects[selectedProjectIndex].giteeUrl && (
                      <ProjectLink
                        href={projects[selectedProjectIndex].giteeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiGitee />
                        Gitee
                      </ProjectLink>
                    )}
                    {projects[selectedProjectIndex].demoUrl && (
                      <ProjectLink
                        href={projects[selectedProjectIndex].demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiExternalLink />
                        Demo
                      </ProjectLink>
                    )}
                  </ProjectLinks>
                </DataCard>

                {/* 雷达图 */}
                <RadarChartWrapper>
                  <RadarChart data={calculateProjectRadarData(projects[selectedProjectIndex], projects)} size={280} />
                </RadarChartWrapper>
              </ProjectDataSection>

              {/* 手机端项目指示器 */}
              <MobileProjectIndicator>
                <div className="dots">
                  {projects.map((_, index) => (
                    <Dot key={index} active={index === selectedProjectIndex} initial={false} animate={{ opacity: 1 }} />
                  ))}
                </div>
              </MobileProjectIndicator>
            </ProjectDetailContainer>
          ) : null}
        </ProjectMainCard>

        {/* 右侧：几何拼图 */}
        <GeometryGridContainer>
          {projects.map((project, index) => {
            const layout = geometryLayouts[index];
            if (!layout) {
              console.error(`Layout missing for project ${index}`);
              return null;
            }

            const blockArea = layout.width * layout.height;
            const iconSize = blockArea > 1000 ? 36 : blockArea > 600 ? 28 : blockArea > 350 ? 22 : 16;

            return (
              <GeometryBlock
                key={project.id}
                isActive={selectedProjectIndex === index}
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                onClick={() => onProjectChange(index)}
              >
                <GeometryBlockContent>
                  {getLanguageIcon(project.language).icon === 'code' ? (
                    <FiCode size={iconSize} style={{ color: getLanguageIcon(project.language).color }} />
                  ) : (
                    <Icon
                      name={getLanguageIcon(project.language).icon}
                      size={iconSize}
                      color={getLanguageIcon(project.language).color}
                    />
                  )}

                  {/* 悬停显示标题 - 只在块足够大时显示 */}
                  {blockArea > 400 && <GeometryBlockTitle>{project.title}</GeometryBlockTitle>}
                </GeometryBlockContent>
              </GeometryBlock>
            );
          })}
        </GeometryGridContainer>
      </ProjectsGrid>
    </ProjectsWrapper>
  );
};

export default ProjectsSection;
