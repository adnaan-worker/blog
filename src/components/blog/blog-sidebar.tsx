import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiSearch, FiBarChart2 } from 'react-icons/fi';
import { Input } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';

const SidebarContainer = styled(motion.div)`
  width: 300px;
  flex-shrink: 0;

  @media (max-width: 860px) {
    width: 100%;
    margin-bottom: 2rem;
  }
`;

// 侧边栏卡片
const SidebarCard = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    position: relative;
    padding-bottom: 0.5rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 30px;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-color), transparent);
      border-radius: 2px;
    }
  }
`;

// 搜索输入框
const StyledSearchInput = styled(Input)`
  font-size: 0.9rem;
  width: 100%;
`;

// 分类列表
const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// 分类项
const CategoryItem = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: left;
  background: ${(props) => (props.active ? 'var(--accent-color-alpha)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  font-weight: ${(props) => (props.active ? '500' : 'normal')};
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
  }

  span:last-child {
    font-size: 0.8rem;
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
    color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    min-width: 24px;
    text-align: center;
  }
`;

// 标签云
const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

// 标签项
const TagItem = styled.button<{ active?: boolean }>`
  padding: 0.4rem 0.8rem;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background: var(--accent-color);
    color: white;
  }
`;

// 视图切换按钮
const ViewToggleContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 1rem;
`;

const ViewToggleButton = styled.button<{ active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  border-radius: 4px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--accent-color-alpha)')};
    color: ${(props) => (props.active ? 'white' : 'var(--accent-color)')};
  }
`;

interface BlogSidebarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
  categories: { name: string; count: number }[];
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
  tags: string[];
  sortBy: string;
  onSortClick: (sort: string) => void;
  sortOptions: string[];
  viewMode?: 'timeline' | 'card';
  onViewModeChange?: (mode: 'timeline' | 'card') => void;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryClick,
  categories,
  selectedTag,
  onTagClick,
  tags,
  sortBy,
  onSortClick,
  sortOptions,
  viewMode = 'timeline',
  onViewModeChange,
}) => {
  const { variants } = useAnimationEngine();

  return (
    <SidebarContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
      <SidebarCard>
        <h3>搜索文章</h3>
        <StyledSearchInput
          type="text"
          placeholder="搜索文章..."
          value={searchQuery}
          onChange={onSearchChange}
          leftIcon={<FiSearch />}
        />
      </SidebarCard>

      {onViewModeChange && (
        <SidebarCard>
          <h3>查看方式</h3>
          <ViewToggleContainer>
            <ViewToggleButton active={viewMode === 'timeline'} onClick={() => onViewModeChange('timeline')}>
              时间线视图
            </ViewToggleButton>
            <ViewToggleButton active={viewMode === 'card'} onClick={() => onViewModeChange('card')}>
              卡片视图
            </ViewToggleButton>
          </ViewToggleContainer>
        </SidebarCard>
      )}

      <SidebarCard>
        <h3>文章分类</h3>
        <CategoryList>
          {categories.map((category) => (
            <CategoryItem
              key={category.name}
              active={selectedCategory === category.name}
              onClick={() => onCategoryClick(category.name)}
            >
              <span>{category.name}</span>
              <span>{category.count}</span>
            </CategoryItem>
          ))}
        </CategoryList>
      </SidebarCard>

      <SidebarCard>
        <h3>热门标签</h3>
        <TagCloud>
          {tags.map((tag) => (
            <TagItem key={tag} active={selectedTag === tag} onClick={() => onTagClick(tag)}>
              {tag}
            </TagItem>
          ))}
        </TagCloud>
      </SidebarCard>

      <SidebarCard>
        <h3>排序方式</h3>
        <CategoryList>
          {sortOptions.map((option) => (
            <CategoryItem key={option} active={sortBy === option} onClick={() => onSortClick(option)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiBarChart2 size={14} /> {option}
              </span>
            </CategoryItem>
          ))}
        </CategoryList>
      </SidebarCard>
    </SidebarContainer>
  );
};

export default BlogSidebar;
