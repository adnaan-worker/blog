import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import {
  FiEdit2,
  FiEye,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiTag,
  FiHeart,
  FiMessageSquare,
} from 'react-icons/fi';
import { PageContainer } from '../components/blog/BlogComponents';
import { Link, useNavigate } from 'react-router-dom';

// 定义样式组件
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const PageDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${(props) => (props.primary ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.primary ? 'white' : 'var(--text-primary)')};
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.primary ? 'var(--accent-color-dark)' : 'var(--bg-tertiary)')};
  }
`;

const FilterButton = styled(Button)`
  padding: 0.75rem;
`;

const ArticlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ArticleCard = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ArticleImageContainer = styled.div`
  flex: 0 0 200px;
  height: 130px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
  }
`;

const ArticleContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const ArticleMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
`;

const ArticleExcerpt = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ArticleActionContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
`;

const ArticleAction = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  &.edit:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
  }

  &.delete:hover {
    background: var(--danger-color-alpha);
    color: var(--danger-color);
  }
`;

const ArticleStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-left: auto;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-tertiary)')};
    color: ${(props) => (props.active ? 'white' : 'var(--text-primary)')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 模拟文章数据
const DUMMY_ARTICLES = [
  {
    id: 1,
    title: 'Vue3 + TypeScript 开发实践与优化技巧',
    date: '2025-04-15',
    category: '前端开发',
    tags: ['Vue', 'TypeScript', '前端'],
    views: 842,
    likes: 76,
    comments: 12,
    readTime: 8,
    excerpt: '深入探讨Vue3与TypeScript结合的最佳实践，包括组件设计、状态管理优化、性能调优以及常见陷阱的规避方法。',
    image: 'https://via.placeholder.com/800x450?text=Vue+TypeScript',
    status: '已发布',
  },
  {
    id: 2,
    title: 'React 18新特性解析：并发渲染与Suspense',
    date: '2025-04-10',
    category: '前端开发',
    tags: ['React', 'JavaScript', '前端'],
    views: 756,
    likes: 68,
    comments: 9,
    readTime: 6,
    excerpt: '详细解读React 18中的并发渲染机制，以及Suspense组件如何简化异步数据加载和提升用户体验。',
    image: 'https://via.placeholder.com/800x450?text=React+18',
    status: '已发布',
  },
  {
    id: 3,
    title: 'Node.js 微服务架构实战：从零到部署',
    date: '2025-04-05',
    category: '后端开发',
    tags: ['Node.js', '微服务', '后端'],
    views: 635,
    likes: 57,
    comments: 8,
    readTime: 12,
    excerpt: '从架构设计、开发实现到服务部署，全面讲解如何使用Node.js构建高可用的微服务系统。',
    image: 'https://via.placeholder.com/800x450?text=Node.js+Microservices',
    status: '草稿',
  },
  {
    id: 4,
    title: 'Flutter跨平台应用开发：性能优化与实践',
    date: '2025-03-28',
    category: '移动开发',
    tags: ['Flutter', 'Dart', '移动开发'],
    views: 512,
    likes: 42,
    comments: 6,
    readTime: 9,
    excerpt: '探讨Flutter应用开发中的性能优化策略，包括渲染优化、状态管理、资源加载等方面的实践经验。',
    image: 'https://via.placeholder.com/800x450?text=Flutter+Performance',
    status: '已发布',
  },
  {
    id: 5,
    title: 'GraphQL API设计：最佳实践与常见误区',
    date: '2025-03-20',
    category: '后端开发',
    tags: ['GraphQL', 'API', '后端'],
    views: 487,
    likes: 39,
    comments: 5,
    readTime: 7,
    excerpt: '基于实际项目经验，分享GraphQL API设计过程中的最佳实践和常见误区，帮助开发者构建更优雅的API。',
    image: 'https://via.placeholder.com/800x450?text=GraphQL+API',
    status: '草稿',
  },
];

// 页面动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const Dashboard: React.FC = () => {
  const [articles] = useState(DUMMY_ARTICLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const navigate = useNavigate();

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 确认删除文章
  const confirmDelete = (id: number) => {
    if (window.confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      alert(`将删除文章ID: ${id}`);
      // 这里添加删除文章的逻辑
    }
  };

  // 导航到创建文章页面
  const navigateToCreateArticle = () => {
    navigate('/create-article');
  };

  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <DashboardContainer>
          <div>
            <PageTitle>我的文章</PageTitle>
            <PageDescription>管理您创建的所有博客文章</PageDescription>
          </div>

          <ActionBar>
            <SearchContainer>
              <SearchIcon>
                <FiSearch size={16} />
              </SearchIcon>
              <SearchInput type="text" placeholder="搜索文章..." value={searchTerm} onChange={handleSearchChange} />
            </SearchContainer>

            <ButtonGroup>
              <FilterButton>
                <FiFilter size={16} />
              </FilterButton>
              <Button primary onClick={navigateToCreateArticle}>
                <FiPlus size={16} /> 新建文章
              </Button>
            </ButtonGroup>
          </ActionBar>

          <ArticlesContainer>
            {articles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArticleCard>
                  <ArticleImageContainer>
                    <img src={article.image} alt={article.title} />
                  </ArticleImageContainer>

                  <ArticleContent>
                    <ArticleTitle>{article.title}</ArticleTitle>

                    <ArticleMeta>
                      <MetaItem>
                        <FiCalendar size={14} /> {article.date}
                      </MetaItem>
                      <MetaItem>
                        <FiClock size={14} /> {article.readTime} 分钟阅读
                      </MetaItem>
                      <MetaItem>
                        <FiTag size={14} /> {article.category}
                      </MetaItem>
                      <MetaItem
                        style={{
                          color: article.status === '已发布' ? 'var(--success-color)' : 'var(--warning-color)',
                        }}
                      >
                        {article.status}
                      </MetaItem>
                    </ArticleMeta>

                    <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ArticleActionContainer>
                        <ArticleAction className="edit">
                          <FiEdit2 size={14} /> 编辑
                        </ArticleAction>
                        <ArticleAction>
                          <FiEye size={14} /> 预览
                        </ArticleAction>
                        <ArticleAction className="delete" onClick={() => confirmDelete(article.id)}>
                          <FiTrash2 size={14} /> 删除
                        </ArticleAction>
                      </ArticleActionContainer>

                      <ArticleStats>
                        <StatItem>
                          <FiEye size={14} /> {article.views}
                        </StatItem>
                        <StatItem>
                          <FiHeart size={14} /> {article.likes}
                        </StatItem>
                        <StatItem>
                          <FiMessageSquare size={14} /> {article.comments}
                        </StatItem>
                      </ArticleStats>
                    </div>
                  </ArticleContent>
                </ArticleCard>
              </motion.div>
            ))}
          </ArticlesContainer>

          <Pagination>
            <PaginationButton disabled>上一页</PaginationButton>
            <PaginationButton active>1</PaginationButton>
            <PaginationButton>2</PaginationButton>
            <PaginationButton>3</PaginationButton>
            <PaginationButton disabled>下一页</PaginationButton>
          </Pagination>
        </DashboardContainer>
      </motion.div>
    </PageContainer>
  );
};

export default Dashboard;
