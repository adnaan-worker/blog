import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { FiFolder, FiExternalLink, FiGithub, FiTag, FiCalendar, FiCode } from 'react-icons/fi';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 50px 1rem;
`;

// 页面标题
const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

// 页面副标题
const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  max-width: 700px;
`;

// 过滤器容器
const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

// 过滤器标签
const FilterTag = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 40px;
  border: none;
  background-color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? 'var(--accent-color-dark)' : 'var(--bg-tertiary)')};
    transform: translateY(-2px);
  }
`;

// 项目网格布局
const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// 项目卡片
const ProjectCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color);
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  [data-theme='dark'] & {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    
    &:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    }
  }
`;

// 项目封面图
const ProjectImage = styled.div`
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
`;

// 项目内容
const ProjectContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// 项目标题
const ProjectTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

// 项目描述
const ProjectDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
  flex: 1;
`;

// 项目底部信息
const ProjectFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

// 技术标签
const TechTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(81, 131, 245, 0.1);
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

// 技术标签容器
const TechTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

// 项目元数据
const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

// 项目链接
const ProjectLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

// 链接按钮
const LinkButton = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color);
    color: white;
    transform: translateY(-3px);
  }
`;

// 项目分类徽章
const CategoryBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.35rem 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  backdrop-filter: blur(5px);
`;

// 分页容器
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

// 分页按钮
const PaginationButton = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  border: none;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-tertiary)')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 页面过渡动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// 卡片动画
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// 示例项目数据
const DUMMY_PROJECTS = [
  {
    id: 1,
    title: '智能客服助手',
    description: '基于自然语言处理的智能客服系统，支持多轮对话和知识库问答，大幅提升客服效率。',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470&auto=format&fit=crop',
    category: '人工智能',
    date: '2025-03',
    technologies: ['React', 'TypeScript', 'NLP', 'Python', 'TensorFlow'],
    demoLink: 'https://example.com/demo',
    githubLink: 'https://github.com/example/project1',
  },
  {
    id: 2,
    title: '企业级数据可视化平台',
    description: '为企业提供实时数据监控和分析的可视化平台，支持多种图表类型和数据源集成。',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
    category: '数据可视化',
    date: '2024-12',
    technologies: ['Vue', 'D3.js', 'Echarts', 'Node.js', 'MongoDB'],
    demoLink: 'https://example.com/demo2',
    githubLink: 'https://github.com/example/project2',
  },
  {
    id: 3,
    title: '移动健康追踪应用',
    description: '帮助用户追踪健康指标、设定目标并获得个性化建议的移动应用，支持多种可穿戴设备数据集成。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop',
    category: '移动应用',
    date: '2024-10',
    technologies: ['React Native', 'Redux', 'Firebase', 'HealthKit', 'Google Fit'],
    demoLink: 'https://example.com/demo3',
    githubLink: 'https://github.com/example/project3',
  },
  {
    id: 4,
    title: '去中心化金融应用',
    description: '基于区块链的去中心化金融应用，提供借贷、流动性挖矿和资产交换等功能。',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1632&auto=format&fit=crop',
    category: '区块链',
    date: '2024-08',
    technologies: ['Solidity', 'Web3.js', 'React', 'Truffle', 'Ethereum'],
    demoLink: 'https://example.com/demo4',
    githubLink: 'https://github.com/example/project4',
  },
  {
    id: 5,
    title: '工业物联网监控系统',
    description: '实时监控工业设备运行状态、预测维护需求并自动生成报告的智能物联网系统。',
    image: 'https://images.unsplash.com/photo-1581092921461-39b00d4533e8?q=80&w=1470&auto=format&fit=crop',
    category: '物联网',
    date: '2024-06',
    technologies: ['MQTT', 'Node.js', 'InfluxDB', 'Flutter', 'TensorFlow'],
    demoLink: 'https://example.com/demo5',
    githubLink: 'https://github.com/example/project5',
  },
  {
    id: 6,
    title: '在线教育平台',
    description: '提供课程发布、学习路径规划、在线考试和社区讨论功能的综合性教育平台。',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1532&auto=format&fit=crop',
    category: '教育科技',
    date: '2024-04',
    technologies: ['React', 'Next.js', 'MongoDB', 'AWS', 'WebRTC'],
    demoLink: 'https://example.com/demo6',
    githubLink: 'https://github.com/example/project6',
  },
];

// 获取所有唯一的项目分类
const allCategories = ['全部', ...new Set(DUMMY_PROJECTS.map((project) => project.category))];

const Projects: React.FC = () => {
  // 过滤器状态
  const [activeFilter, setActiveFilter] = useState<string>('全部');
  
  // 根据过滤器筛选项目
  const filteredProjects = activeFilter === '全部' 
    ? DUMMY_PROJECTS 
    : DUMMY_PROJECTS.filter(project => project.category === activeFilter);
  
  // 处理过滤器变化
  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
  };

  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <PageTitle>我的项目</PageTitle>
        <PageSubtitle>探索我近期完成的各类项目作品，包括Web应用、移动应用、人工智能和数据可视化等不同领域的实践。</PageSubtitle>
        
        {/* 分类过滤器 */}
        <FilterContainer>
          {allCategories.map((category) => (
            <FilterTag 
              key={category} 
              active={activeFilter === category} 
              onClick={() => handleFilterChange(category)}
            >
              {category}
            </FilterTag>
          ))}
        </FilterContainer>
        
        {/* 项目网格 */}
        <ProjectGrid>
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={index}
            >
              <ProjectImage style={{ backgroundImage: `url(${project.image})` }}>
                <CategoryBadge>
                  <FiFolder size={14} />
                  {project.category}
                </CategoryBadge>
              </ProjectImage>
              
              <ProjectContent>
                <ProjectTitle>{project.title}</ProjectTitle>
                
                <ProjectMeta>
                  <span>
                    <FiCalendar size={14} />
                    {project.date}
                  </span>
                  <span>
                    <FiTag size={14} />
                    {project.category}
                  </span>
                </ProjectMeta>
                
                <ProjectDescription>{project.description}</ProjectDescription>
                
                <TechTagsContainer>
                  {project.technologies.map((tech) => (
                    <TechTag key={tech}>
                      <FiCode size={12} style={{ marginRight: '4px' }} />
                      {tech}
                    </TechTag>
                  ))}
                </TechTagsContainer>
                
                <ProjectFooter>
                  <Link to={`/projects/${project.id}`} style={{ color: 'var(--accent-color)', fontWeight: 500, fontSize: '0.9rem' }}>
                    查看详情
                  </Link>
                  
                  <ProjectLinks>
                    {project.demoLink && (
                      <LinkButton href={project.demoLink} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink size={16} />
                      </LinkButton>
                    )}
                    {project.githubLink && (
                      <LinkButton href={project.githubLink} target="_blank" rel="noopener noreferrer">
                        <FiGithub size={16} />
                      </LinkButton>
                    )}
                  </ProjectLinks>
                </ProjectFooter>
              </ProjectContent>
            </ProjectCard>
          ))}
        </ProjectGrid>
        
        {/* 分页 - 简单版 */}
        <Pagination>
          <PaginationButton disabled>
            &laquo;
          </PaginationButton>
          <PaginationButton active>1</PaginationButton>
          <PaginationButton>2</PaginationButton>
          <PaginationButton>3</PaginationButton>
          <PaginationButton disabled>
            &raquo;
          </PaginationButton>
        </Pagination>
      </motion.div>
    </PageContainer>
  );
};

export default Projects; 