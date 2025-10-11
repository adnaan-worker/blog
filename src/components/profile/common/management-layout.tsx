import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FiSearch, FiPlus, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { Empty, Button } from 'adnaan-ui';

// 统计项接口
export interface StatItemData {
  label: string;
  value: number | string;
  icon?: ReactNode;
}

// 筛选选项接口
export interface FilterOption {
  key: string;
  label: string;
}

interface ManagementLayoutProps {
  title: string;
  icon: ReactNode;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onRefresh: () => void;
  loading?: boolean;
  total?: number;
  children: ReactNode;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  // 新增功能
  stats?: StatItemData[];
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  createButton?: ReactNode;
  // 样式控制
  showCard?: boolean; // 是否显示卡片样式，默认true
}

const Container = styled.div<{ showCard?: boolean }>`
  ${(props) =>
    props.showCard
      ? `
    background: var(--bg-primary);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color);
    overflow: hidden;
  `
      : ''}
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
`;

const Header = styled.div<{ showCard?: boolean }>`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${(props) => (props.showCard ? 'transparent' : 'var(--bg-primary)')};
  border-radius: ${(props) => (props.showCard ? '0' : '12px 12px 0 0')};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  svg {
    color: var(--accent-color);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);

  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;

  .number {
    font-weight: 600;
    color: var(--accent-color);
  }
`;

const TotalCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 0.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;

  @media (min-width: 769px) {
    width: auto;
    flex-wrap: nowrap;
  }
`;

const SearchBox = styled.div`
  position: relative;
  min-width: 150px;
  flex: 1;
  max-width: 100%;

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    background: var(--bg-primary);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.1)')};
  }
`;

const FilterBar = styled.div<{ showCard?: boolean }>`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: ${(props) => (props.showCard ? 'transparent' : 'var(--bg-primary)')};
`;

const FilterTag = styled.button<{ active?: boolean }>`
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-secondary)')};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.1)')};
  }
`;

const ActionButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: var(--accent-color);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--accent-color-hover);
      transform: translateY(-1px);
    }
  `
      : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--accent-color);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Content = styled.div<{ showCard?: boolean }>`
  flex: 1;
  min-height: 400px;
  padding: 1rem 1.5rem;
  background: ${(props) => (props.showCard ? 'transparent' : 'var(--bg-primary)')};
  border-radius: ${(props) => (props.showCard ? '0' : '0 0 12px 12px')};
`;

const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({
  title,
  icon,
  searchPlaceholder = '搜索...',
  searchValue,
  onSearchChange,
  onAdd,
  onRefresh,
  loading = false,
  total = 0,
  children,
  emptyIcon,
  emptyTitle = '暂无数据',
  emptyDescription,
  // 新增功能
  stats = [],
  showFilters = false,
  onToggleFilters,
  filterOptions = [],
  selectedFilter = '',
  onFilterChange,
  createButton,
  showCard = true,
}) => {
  return (
    <Container showCard={showCard}>
      <Header showCard={showCard}>
        <HeaderTop>
          <HeaderLeft>
            <Title>
              {icon}
              {title}
              {total > 0 && <TotalCount>（{total}）</TotalCount>}
            </Title>
            {stats.length > 0 && (
              <StatsContainer>
                {stats.map((stat, index) => (
                  <StatItem key={index}>
                    {stat.icon}
                    <span className="number">{stat.value}</span>
                    <span>{stat.label}</span>
                  </StatItem>
                ))}
              </StatsContainer>
            )}
          </HeaderLeft>
          {createButton || (
            <ActionButton variant="primary" onClick={onAdd} whileHover={{ scale: 1.02 }}>
              <FiPlus />
              添加
            </ActionButton>
          )}
        </HeaderTop>

        <HeaderRight>
          <SearchBox>
            <FiSearch />
            <SearchInput
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </SearchBox>
          {onToggleFilters && (
            <FilterButton active={showFilters} onClick={onToggleFilters}>
              <FiFilter size={14} />
              <span style={{ marginLeft: '0.25rem' }}>筛选</span>
            </FilterButton>
          )}
          <ActionButton variant="secondary" onClick={onRefresh} disabled={loading} whileHover={{ scale: 1.02 }}>
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            刷新
          </ActionButton>
        </HeaderRight>
      </Header>

      <AnimatePresence>
        {showFilters && filterOptions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FilterBar showCard={showCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>状态：</span>
                <FilterTag active={selectedFilter === ''} onClick={() => onFilterChange?.('')}>
                  全部
                </FilterTag>
                {filterOptions.map((option) => (
                  <FilterTag
                    key={option.key}
                    active={selectedFilter === option.key}
                    onClick={() => onFilterChange?.(selectedFilter === option.key ? '' : option.key)}
                  >
                    {option.label}
                  </FilterTag>
                ))}
              </div>
            </FilterBar>
          </motion.div>
        )}
      </AnimatePresence>

      <Content showCard={showCard}>
        {React.Children.count(children) === 0 ? (
          <Empty icon={emptyIcon || icon} title={emptyTitle} description={emptyDescription} />
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeInUpVariants}>
            {children}
          </motion.div>
        )}
      </Content>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Container>
  );
};

export default ManagementLayout;
