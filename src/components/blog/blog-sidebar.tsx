import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiSearch, FiBarChart2 } from 'react-icons/fi';
import { Input, Button } from 'adnaan-ui';
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

// 视图切换按钮
const ViewToggleContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 1rem;
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
        <Input
          size="small"
          style={{ fontSize: '0.9rem' }}
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
            <Button
              variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => onViewModeChange('timeline')}
              style={{ flex: 1 }}
            >
              时间线视图
            </Button>
            <Button
              variant={viewMode === 'card' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => onViewModeChange('card')}
              style={{ flex: 1 }}
            >
              卡片视图
            </Button>
          </ViewToggleContainer>
        </SidebarCard>
      )}

      <SidebarCard>
        <h3>文章分类</h3>
        <CategoryList>
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="ghost"
              size="small"
              onClick={() => onCategoryClick(category.name)}
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '0.6rem 0.8rem',
                fontSize: '0.9rem',
                textAlign: 'left',
                background: selectedCategory === category.name ? 'var(--accent-color-alpha)' : 'transparent',
                color: selectedCategory === category.name ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: selectedCategory === category.name ? '500' : 'normal',
              }}
            >
              <span>{category.name}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{category.count}</span>
            </Button>
          ))}
        </CategoryList>
      </SidebarCard>

      <SidebarCard>
        <h3>热门标签</h3>
        <TagCloud>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'primary' : 'secondary'}
              size="small"
              onClick={() => onTagClick(tag)}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                borderRadius: '20px',
              }}
            >
              {tag}
            </Button>
          ))}
        </TagCloud>
      </SidebarCard>

      <SidebarCard>
        <h3>排序方式</h3>
        <CategoryList>
          {sortOptions.map((option) => (
            <Button
              key={option}
              variant="ghost"
              size="small"
              onClick={() => onSortClick(option)}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.6rem 0.8rem',
                fontSize: '0.9rem',
                background: sortBy === option ? 'var(--accent-color-alpha)' : 'transparent',
                color: sortBy === option ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: sortBy === option ? '500' : 'normal',
              }}
              leftIcon={<FiBarChart2 size={14} />}
            >
              {option}
            </Button>
          ))}
        </CategoryList>
      </SidebarCard>
    </SidebarContainer>
  );
};

export default BlogSidebar;
