import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FiSearch, FiPlus, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { Empty, Button, Input } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';

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
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  background: transparent;
  /* 移除旧的卡片样式，因为外部已经包裹了 ContentGlassCard */
`;

const Header = styled.div<{ showCard?: boolean }>`
  padding: 0 0 1.5rem 0;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: transparent;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  letter-spacing: -0.02em;

  svg {
    color: var(--accent-color);
    filter: drop-shadow(0 0 5px rgba(var(--accent-rgb), 0.4));
  }
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: rgba(var(--bg-tertiary-rgb), 0.3);
  padding: 0.4rem 1rem;
  border-radius: 100px;
  border: 1px solid rgba(var(--border-rgb), 0.1);

  @media (max-width: 640px) {
    display: none; /* 移动端为了简洁隐藏统计 */
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  .number {
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const TotalCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-tertiary);
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
`;

const SearchBox = styled.div`
  min-width: 200px;
  flex: 1;
  max-width: 300px;

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
`;

const FilterBar = styled.div<{ showCard?: boolean }>`
  padding: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: transparent;
`;

const Content = styled.div<{ showCard?: boolean }>`
  flex: 1;
  min-height: 400px;
  padding: 1.5rem 0 0 0;
  background: transparent;
`;

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
  const { variants } = useAnimationEngine();
  const fadeInUpVariants = variants.fadeIn;
  const hoverScale = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } };

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
            <Button variant="primary" size="small" onClick={onAdd} leftIcon={<FiPlus />}>
              添加
            </Button>
          )}
        </HeaderTop>

        <HeaderRight>
          <SearchBox>
            <Input
              variant="filled"
              size="small"
              style={{ fontSize: '0.875rem' }}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<FiSearch />}
            />
          </SearchBox>
          {onToggleFilters && (
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="small"
              onClick={onToggleFilters}
              leftIcon={<FiFilter size={14} />}
            >
              筛选
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={onRefresh}
            disabled={loading}
            leftIcon={<FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />}
          >
            刷新
          </Button>
        </HeaderRight>
      </Header>

      <AnimatePresence>
        {showFilters && filterOptions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <FilterBar showCard={showCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>状态：</span>
                <Button
                  variant={selectedFilter === '' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => onFilterChange?.('')}
                  style={{
                    padding: '0.3rem 0.8rem',
                    fontSize: '0.8rem',
                    borderRadius: '20px',
                  }}
                >
                  全部
                </Button>
                {filterOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={selectedFilter === option.key ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => onFilterChange?.(selectedFilter === option.key ? '' : option.key)}
                    style={{
                      padding: '0.3rem 0.8rem',
                      fontSize: '0.8rem',
                      borderRadius: '20px',
                    }}
                  >
                    {option.label}
                  </Button>
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
