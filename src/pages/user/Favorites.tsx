import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import {
  FiHeart,
  FiCalendar,
  FiClock,
  FiTag,
  FiTrash2,
  FiUser,
  FiSearch,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// 定义样式组件
const FavoritesContainer = styled.div`
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

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  font-weight: ${(props) => (props.active ? '600' : '500')};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
  }
`;

const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FavoriteCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FavoriteImageContainer = styled.div`
  height: 180px;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }

  ${FavoriteCard}:hover & img {
    transform: scale(1.05);
  }
`;

const FavoriteRemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--danger-color);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;

  ${FavoriteCard}:hover & {
    opacity: 1;
  }

  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const FavoriteContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FavoriteTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  line-height: 1.4;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent-color);
    }
  }
`;

const FavoriteExcerpt = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const FavoriteMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--accent-color-alpha);
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

// 示例收藏数据
const DUMMY_FAVORITES = [
  {
    id: 1,
    title: 'Vue3 + TypeScript 开发实践与优化技巧',
    date: '2025-04-15',
    author: '张三',
    category: '前端开发',
    tags: ['Vue', 'TypeScript', '前端'],
    views: 842,
    comments: 12,
    readTime: 8,
    excerpt: '深入探讨Vue3与TypeScript结合的最佳实践，包括组件设计、状态管理优化、性能调优以及常见陷阱的规避方法。',
    image: 'https://via.placeholder.com/800x450?text=Vue+TypeScript',
    type: '文章',
  },
  {
    id: 2,
    title: 'React 18新特性解析：并发渲染与Suspense',
    date: '2025-04-10',
    author: '李四',
    category: '前端开发',
    tags: ['React', 'JavaScript', '前端'],
    views: 756,
    comments: 9,
    readTime: 6,
    excerpt: '详细解读React 18中的并发渲染机制，以及Suspense组件如何简化异步数据加载和提升用户体验。',
    image: 'https://via.placeholder.com/800x450?text=React+18',
    type: '文章',
  },
  {
    id: 3,
    title: '使用Next.js构建高性能企业级应用',
    date: '2025-04-02',
    author: '王五',
    category: '前端开发',
    tags: ['Next.js', 'React', 'SSR'],
    views: 689,
    comments: 8,
    readTime: 10,
    excerpt: '探索如何使用Next.js框架构建企业级应用，包括SSR/SSG优化、路由管理、状态管理以及与后端服务的集成方案。',
    image: 'https://via.placeholder.com/800x450?text=Next.js',
    type: '文章',
  },
  {
    id: 4,
    title: 'Flutter跨平台应用开发：性能优化与实践',
    date: '2025-03-28',
    author: '赵六',
    category: '移动开发',
    tags: ['Flutter', 'Dart', '移动开发'],
    views: 512,
    comments: 6,
    readTime: 9,
    excerpt: '探讨Flutter应用开发中的性能优化策略，包括渲染优化、状态管理、资源加载等方面的实践经验。',
    image: 'https://via.placeholder.com/800x450?text=Flutter+Performance',
    type: '文章',
  },
  {
    id: 5,
    title: 'GraphQL API设计：最佳实践与常见误区',
    date: '2025-03-20',
    author: '孙七',
    category: '后端开发',
    tags: ['GraphQL', 'API', '后端'],
    views: 487,
    comments: 5,
    readTime: 7,
    excerpt: '基于实际项目经验，分享GraphQL API设计过程中的最佳实践和常见误区，帮助开发者构建更优雅的API。',
    image: 'https://via.placeholder.com/800x450?text=GraphQL+API',
    type: '文章',
  },
  {
    id: 6,
    title: 'DevOps实践：持续集成与部署工作流设计',
    date: '2025-03-15',
    author: '周八',
    category: 'DevOps',
    tags: ['CI/CD', 'Docker', 'Kubernetes'],
    views: 423,
    comments: 4,
    readTime: 11,
    excerpt: '从需求分析到实施落地，详细介绍企业级DevOps持续集成与部署工作流的设计与实现方案。',
    image: 'https://via.placeholder.com/800x450?text=DevOps',
    type: '文章',
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// 定义标签类型
type TabType = '全部' | '文章' | '项目' | '话题';

const Favorites: React.FC = () => {
  const [favorites] = useState(DUMMY_FAVORITES);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('全部');

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 切换标签
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // 确认移除收藏
  const confirmRemoveFavorite = (id: number) => {
    if (window.confirm('确定要移除此收藏吗？')) {
      // 这里添加从收藏中移除的逻辑
      alert(`将移除收藏ID: ${id}`);
    }
  };

  // 根据选中的标签和搜索词过滤收藏内容
  const filteredFavorites = favorites.filter((fav) => {
    const matchesTab = activeTab === '全部' || fav.type === activeTab;
    const matchesSearch =
      fav.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fav.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <FavoritesContainer>
          <div>
            <PageTitle>我的收藏</PageTitle>
            <PageDescription>您收藏的所有内容都在这里</PageDescription>
          </div>

          <SearchContainer>
            <SearchIcon>
              <FiSearch size={16} />
            </SearchIcon>
            <SearchInput type="text" placeholder="搜索收藏..." value={searchTerm} onChange={handleSearchChange} />
          </SearchContainer>

          <TabsContainer>
            <Tab active={activeTab === '全部'} onClick={() => handleTabChange('全部')}>
              全部
            </Tab>
            <Tab active={activeTab === '文章'} onClick={() => handleTabChange('文章')}>
              文章
            </Tab>
            <Tab active={activeTab === '项目'} onClick={() => handleTabChange('项目')}>
              项目
            </Tab>
            <Tab active={activeTab === '话题'} onClick={() => handleTabChange('话题')}>
              话题
            </Tab>
          </TabsContainer>

          {filteredFavorites.length > 0 ? (
            <FavoritesGrid>
              {filteredFavorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                >
                  <FavoriteCard>
                    <FavoriteImageContainer>
                      <img src={favorite.image} alt={favorite.title} />
                      <FavoriteRemoveButton onClick={() => confirmRemoveFavorite(favorite.id)}>
                        <FiTrash2 size={16} />
                      </FavoriteRemoveButton>
                    </FavoriteImageContainer>

                    <FavoriteContent>
                      <FavoriteTitle>
                        <Link to={`/blog/${favorite.id}`}>{favorite.title}</Link>
                      </FavoriteTitle>

                      <FavoriteExcerpt>{favorite.excerpt}</FavoriteExcerpt>

                      <FavoriteMeta>
                        <MetaItem>
                          <FiUser size={14} /> {favorite.author}
                        </MetaItem>
                        <MetaItem>
                          <FiCalendar size={14} /> {favorite.date}
                        </MetaItem>
                        <MetaItem>
                          <FiClock size={14} /> {favorite.readTime}分钟
                        </MetaItem>
                        <MetaItem>
                          <FiTag size={14} /> {favorite.category}
                        </MetaItem>
                      </FavoriteMeta>
                    </FavoriteContent>
                  </FavoriteCard>
                </motion.div>
              ))}
            </FavoritesGrid>
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <FiHeart />
              </EmptyStateIcon>
              <h3>没有找到收藏</h3>
              <p>您目前没有收藏任何{activeTab === '全部' ? '内容' : activeTab}，或没有符合搜索条件的收藏</p>
            </EmptyState>
          )}

          {filteredFavorites.length > 0 && (
            <Pagination>
              <PaginationButton disabled>上一页</PaginationButton>
              <PaginationButton active>1</PaginationButton>
              <PaginationButton>2</PaginationButton>
              <PaginationButton disabled>下一页</PaginationButton>
            </Pagination>
          )}
        </FavoritesContainer>
      </motion.div>
    </>
  );
};

export default Favorites;
