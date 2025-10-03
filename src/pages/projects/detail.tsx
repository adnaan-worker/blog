import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag, FiExternalLink, FiGithub, FiCode, FiLink } from 'react-icons/fi';
import styled from '@emotion/styled';
import { scrollLock } from '@/utils/scroll-lock';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 50px 1rem;
`;

// 返回链接
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

// 项目布局
const ProjectLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 3rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

// 项目主内容
const ProjectMain = styled.div``;

// 项目侧边栏
const ProjectSidebar = styled.div`
  @media (max-width: 860px) {
    grid-row: 1;
    margin-bottom: 2rem;
  }
`;

// 项目标题
const ProjectTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);

  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

// 项目元数据
const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`;

// 项目描述
const ProjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

// 项目概览卡片
const ProjectOverviewCard = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;

  [data-theme='dark'] & {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

// 项目封面图
const ProjectCover = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-size: cover;
  background-position: center;
`;

// 信息列表
const InfoList = styled.ul`
  list-style: none;
  padding: 1.5rem;
  margin: 0;
`;

// 信息项
const InfoItem = styled.li`
  padding: 0.75rem 0;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }
`;

// 信息标签
const InfoLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-tertiary);
  width: 100px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// 信息值
const InfoValue = styled.div`
  flex: 1;
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

// 链接按钮
const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-right: 1rem;
  margin-bottom: 1rem;

  &:hover {
    background: var(--accent-color-dark);
    transform: translateY(-3px);
  }

  &.secondary {
    background: var(--bg-secondary);
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-tertiary);
    }
  }
`;

// 技术标签
const TechTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border-radius: 40px;
  background: rgba(81, 131, 245, 0.1);
  color: var(--accent-color);
  font-size: 0.85rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

// 项目内容区
const ContentSection = styled.section`
  margin-bottom: 3rem;
`;

// 分节标题
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 4px;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

// 功能列表
const FeatureList = styled.ul`
  padding-left: 1.5rem;
  margin-bottom: 2rem;

  li {
    margin-bottom: 0.75rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
`;

// 图片网格
const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

// 项目图片
const ProjectImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

// 图片模态框背景
const ModalBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
`;

// 模态框图片
const ModalImage = styled.img`
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;

// 相关项目容器
const RelatedProjects = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

// 相关项目标题
const RelatedTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 4px;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

// 相关项目卡片
const RelatedCard = styled(Link)`
  display: block;
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  h4 {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
  }

  &:hover {
    background: var(--bg-tertiary);
    transform: translateX(5px);
  }
`;

// 页面动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// 项目数据（来自路由页面的示例数据）
const DUMMY_PROJECTS = [
  {
    id: 1,
    title: '智能客服助手',
    description: '基于自然语言处理的智能客服系统，支持多轮对话和知识库问答，大幅提升客服效率。',
    longDescription:
      '智能客服助手是一款基于最新自然语言处理技术的客服系统，能够理解客户复杂的问题，并提供精准的回答。系统通过深度学习模型分析用户意图，结合企业知识库提供个性化的回复，同时支持多轮对话，让交流更加自然流畅。系统还具备情感分析功能，能够识别客户情绪，适时调整回复的语气和内容，提高客户满意度。',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470&auto=format&fit=crop',
    category: '人工智能',
    date: '2025-03',
    technologies: ['React', 'TypeScript', 'NLP', 'Python', 'TensorFlow'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/example/project1',
    projectLink: 'https://example.com/project1',
    client: '某科技公司',
    duration: '6个月',
    role: '前端开发 & 机器学习工程师',
    features: [
      '智能意图识别，准确理解用户需求',
      '多轮对话能力，提供连贯的交互体验',
      '知识库集成，支持快速查询和回答',
      '情感分析，根据用户情绪调整回复风格',
      '多语言支持，覆盖中英日韩等主流语言',
      '数据分析仪表盘，帮助企业了解客户需求',
    ],
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1632&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092921461-39b00d4533e8?q=80&w=1470&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    title: '企业级数据可视化平台',
    description: '为企业提供实时数据监控和分析的可视化平台，支持多种图表类型和数据源集成。',
    longDescription:
      '企业级数据可视化平台是一个强大的数据分析工具，帮助企业快速理解复杂数据，做出明智决策。平台提供丰富的可视化组件，从基础柱状图、折线图到高级散点图、热力图，满足不同分析需求。系统支持实时数据监控，当关键指标达到预设阈值时，及时发出警报。企业可以自定义仪表盘，关注最重要的业务指标，也可以创建详细的数据报告，分享给团队成员。',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
    category: '数据可视化',
    date: '2024-12',
    technologies: ['Vue', 'D3.js', 'Echarts', 'Node.js', 'MongoDB'],
    demoLink: 'https://example.com/demo2',
    githubLink: 'https://github.com/example/project2',
    projectLink: 'https://example.com/project2',
    client: '某金融科技公司',
    duration: '8个月',
    role: '全栈开发工程师',
    features: [
      '支持30+种图表类型，满足各类数据可视化需求',
      '实时数据监控，设置阈值触发警报',
      '多种数据源集成，包括SQL数据库、NoSQL、API等',
      '自定义仪表盘，关注重要业务指标',
      '强大的筛选和钻取功能，深入分析数据',
      '报表导出和分享功能，支持PDF、Excel等格式',
    ],
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1632&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092921461-39b00d4533e8?q=80&w=1470&auto=format&fit=crop',
    ],
  },
  // 其他项目数据
];

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    const foundProject = DUMMY_PROJECTS.find((project) => project.id === Number(id));
    setProject(foundProject || null);

    // 获取相关项目（同类别或技术相似的项目）
    if (foundProject) {
      const related = DUMMY_PROJECTS.filter(
        (p) =>
          p.id !== foundProject.id &&
          (p.category === foundProject.category ||
            p.technologies.some((tech: string) => foundProject.technologies.includes(tech))),
      ).slice(0, 2);
      setRelatedProjects(related);
    }

    // 滚动到页面顶部
    window.scrollTo(0, 0);
  }, [id]);

  // 打开图片预览
  const openImagePreview = (image: string) => {
    setSelectedImage(image);
    // 使用统一的滚动锁定管理器
    scrollLock.lock();
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setSelectedImage(null);
    // 使用统一的滚动锁定管理器
    scrollLock.unlock();
  };

  // 项目未找到
  if (!project) {
    return (
      <PageContainer>
        <BackLink to="/projects">
          <FiArrowLeft /> 返回项目列表
        </BackLink>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>项目未找到</h2>
          <p>抱歉，找不到您请求的项目</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <BackLink to="/projects">
          <FiArrowLeft /> 返回项目列表
        </BackLink>

        <ProjectLayout>
          {/* 主内容区 */}
          <ProjectMain>
            <ProjectTitle>{project.title}</ProjectTitle>

            <ProjectMeta>
              <span>
                <FiCalendar size={16} /> {project.date}
              </span>
              <span>
                <FiTag size={16} /> {project.category}
              </span>
            </ProjectMeta>

            <ProjectDescription>{project.longDescription || project.description}</ProjectDescription>

            {/* 项目链接 */}
            <div style={{ marginBottom: '2rem' }}>
              {project.demoLink && (
                <LinkButton href={project.demoLink} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink size={16} /> 查看演示
                </LinkButton>
              )}
              {project.githubLink && (
                <LinkButton href={project.githubLink} target="_blank" rel="noopener noreferrer" className="secondary">
                  <FiGithub size={16} /> 查看源码
                </LinkButton>
              )}
              {project.projectLink && (
                <LinkButton href={project.projectLink} target="_blank" rel="noopener noreferrer" className="secondary">
                  <FiLink size={16} /> 项目主页
                </LinkButton>
              )}
            </div>

            {/* 功能特点 */}
            <ContentSection>
              <SectionTitle>功能特点</SectionTitle>
              <FeatureList>
                {project.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </FeatureList>
            </ContentSection>

            {/* 项目截图 */}
            <ContentSection>
              <SectionTitle>项目截图</SectionTitle>
              <ImageGrid>
                {project.images.map((image: string, index: number) => (
                  <ProjectImage
                    key={index}
                    style={{ backgroundImage: `url(${image})` }}
                    onClick={() => openImagePreview(image)}
                  />
                ))}
              </ImageGrid>
            </ContentSection>

            {/* 相关项目 */}
            {relatedProjects.length > 0 && (
              <RelatedProjects>
                <RelatedTitle>相关项目</RelatedTitle>
                {relatedProjects.map((relatedProject) => (
                  <RelatedCard key={relatedProject.id} to={`/projects/${relatedProject.id}`}>
                    <h4>{relatedProject.title}</h4>
                    <p>{relatedProject.description}</p>
                  </RelatedCard>
                ))}
              </RelatedProjects>
            )}
          </ProjectMain>

          {/* 侧边栏 */}
          <ProjectSidebar>
            <ProjectOverviewCard>
              <ProjectCover style={{ backgroundImage: `url(${project.image})` }} />
              <InfoList>
                <InfoItem>
                  <InfoLabel>
                    <FiCalendar size={14} />
                    日期
                  </InfoLabel>
                  <InfoValue>{project.date}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FiTag size={14} />
                    分类
                  </InfoLabel>
                  <InfoValue>{project.category}</InfoValue>
                </InfoItem>
                {project.client && (
                  <InfoItem>
                    <InfoLabel>客户</InfoLabel>
                    <InfoValue>{project.client}</InfoValue>
                  </InfoItem>
                )}
                {project.duration && (
                  <InfoItem>
                    <InfoLabel>周期</InfoLabel>
                    <InfoValue>{project.duration}</InfoValue>
                  </InfoItem>
                )}
                {project.role && (
                  <InfoItem>
                    <InfoLabel>角色</InfoLabel>
                    <InfoValue>{project.role}</InfoValue>
                  </InfoItem>
                )}
              </InfoList>
            </ProjectOverviewCard>

            {/* 技术栈 */}
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>技术栈</h3>
              <div>
                {project.technologies.map((tech: string) => (
                  <TechTag key={tech}>
                    <FiCode size={12} style={{ marginRight: '4px' }} />
                    {tech}
                  </TechTag>
                ))}
              </div>
            </div>
          </ProjectSidebar>
        </ProjectLayout>

        {/* 图片预览模态框 */}
        <ModalBackdrop isOpen={!!selectedImage} onClick={closeImagePreview}>
          {selectedImage && <ModalImage src={selectedImage} alt="项目截图" />}
        </ModalBackdrop>
      </motion.div>
    </PageContainer>
  );
};

export default ProjectDetail;
