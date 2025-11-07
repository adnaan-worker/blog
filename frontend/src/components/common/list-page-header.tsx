/**
 * 📋 列表页统一 Header 组件
 * 用于手记、文章、项目等列表页的头部
 * 支持集成筛选功能
 */

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiChevronDown } from 'react-icons/fi';
import { Input, Button } from 'adnaan-ui';
import { SPRING_PRESETS } from '@/utils/ui/animation';
import { usePageInfo } from '@/hooks/usePageInfo';

// ============= 筛选相关类型 =============

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
  icon?: React.ReactNode;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: 'single' | 'multiple' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  allowClear?: boolean;
}

export interface FilterValues {
  [key: string]: string | number | string[] | undefined;
}

/**
 * 清理筛选参数 - 移除空字符串、空数组、undefined
 * @param values 原始筛选值
 * @returns 清理后的筛选值
 */
export const cleanFilterValues = (values: FilterValues): Record<string, any> => {
  const cleaned: Record<string, any> = {};

  Object.entries(values).forEach(([key, value]) => {
    // 跳过 undefined 和 null
    if (value === undefined || value === null) {
      return;
    }

    // 处理字符串
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        cleaned[key] = trimmed;
      }
      return;
    }

    // 处理数组
    if (Array.isArray(value)) {
      if (value.length > 0) {
        cleaned[key] = value;
      }
      return;
    }

    // 处理数字（包括 0）
    if (typeof value === 'number') {
      cleaned[key] = value;
      return;
    }

    // 其他类型直接保留
    cleaned[key] = value;
  });

  return cleaned;
};

// Header 容器 - 左右两栏布局
const Header = styled(motion.div)`
  display: grid;
  grid-template-columns: minmax(0, 600px) 1fr;
  gap: 3rem;
  align-items: start;
  margin-bottom: 2.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// 左侧内容区
const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
`;

// 页面标题
const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    white-space: normal;
    overflow: visible;
  }
`;

// 副标题/描述
const Subtitle = styled.p`
  font-size: 0.95rem;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

// 统计信息
const StatsInfo = styled.div`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;

  .count {
    color: var(--accent-color);
    font-weight: 600;
    font-family: var(--font-code, 'Consolas', 'Monaco', monospace);
    font-size: 0.9rem;
  }

  .text {
    opacity: 0.8;
  }
`;

// 右侧筛选区域
const FilterArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
  width: 100%;
  max-width: 100%;

  @media (max-width: 968px) {
    align-items: stretch;
  }
`;

// 筛选折叠按钮

const FilterContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.75rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterLabel = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 45px;
  flex-shrink: 0;
`;

const FilterOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  display: flex;
  align-items: center;

  svg {
    font-size: 0.9rem;
  }
`;

const ClearButton = styled(motion.button)`
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }

  svg {
    font-size: 0.75rem;
  }
`;

interface ListPageHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  countUnit?: string; // 如：'篇文章'、'篇手记'、'个项目'
  showStats?: boolean;
  children?: React.ReactNode;
  // 筛选相关
  filterGroups?: FilterGroup[];
  filterValues?: FilterValues;
  onFilterChange?: (values: FilterValues) => void;
  /** 筛选值变化回调（自动清理空值） - 推荐使用 */
  onCleanFilterChange?: (cleanedValues: Record<string, any>) => void;
  defaultFilterCollapsed?: boolean; // 默认是否折叠筛选
}

/**
 * 列表页统一 Header 组件
 */
export const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  title,
  subtitle,
  count,
  countUnit = '项',
  showStats = true,
  children,
  filterGroups = [],
  filterValues = {},
  onFilterChange,
  onCleanFilterChange,
  defaultFilterCollapsed = true,
}) => {
  const { setPageInfo } = usePageInfo();
  const [searchDebounceTimers, setSearchDebounceTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(!defaultFilterCollapsed);

  // 设置页面信息到 Header（用于滚动后显示）
  useEffect(() => {
    setPageInfo({
      title,
      subtitle,
    });

    // 组件卸载时清除页面信息
    return () => {
      setPageInfo(null);
    };
  }, [title, subtitle, setPageInfo]);

  // 清理定时器
  useEffect(() => {
    return () => {
      Object.values(searchDebounceTimers).forEach((timer) => clearTimeout(timer));
    };
  }, [searchDebounceTimers]);

  // 当筛选值变化时，自动清理并通知
  useEffect(() => {
    if (onCleanFilterChange) {
      const cleaned = cleanFilterValues(filterValues);
      onCleanFilterChange(cleaned);
    }
  }, [filterValues, onCleanFilterChange]);

  // 处理单选筛选
  const handleSingleSelect = (key: string, value: string | number) => {
    if (!onFilterChange) return;
    const currentValue = filterValues[key];
    const newValue = currentValue === value ? undefined : value;
    onFilterChange({ ...filterValues, [key]: newValue });
  };

  // 处理搜索（带防抖）
  const handleSearch = (key: string, value: string) => {
    if (!onFilterChange) return;

    // 清除之前的定时器
    if (searchDebounceTimers[key]) {
      clearTimeout(searchDebounceTimers[key]);
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      onFilterChange({ ...filterValues, [key]: value.trim() || undefined });
    }, 300);

    setSearchDebounceTimers({ ...searchDebounceTimers, [key]: timer });
  };

  // 清除单个搜索框
  const handleClearSearch = (key: string) => {
    if (!onFilterChange) return;
    onFilterChange({ ...filterValues, [key]: undefined });
  };

  // 渲染筛选组
  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'single':
        return (
          <FilterGroup key={group.key}>
            <FilterLabel>{group.label}</FilterLabel>
            <FilterOptions>
              {group.options?.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="small"
                  onClick={() => handleSingleSelect(group.key, option.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    background:
                      filterValues[group.key] === option.value ? 'rgba(var(--accent-rgb), 0.12)' : 'transparent',
                    color: filterValues[group.key] === option.value ? 'var(--accent-color)' : 'var(--text-secondary)',
                    fontWeight: filterValues[group.key] === option.value ? '600' : '400',
                  }}
                  leftIcon={option.icon}
                >
                  {option.label}
                </Button>
              ))}
            </FilterOptions>
          </FilterGroup>
        );

      case 'search':
        const searchValue = (filterValues[group.key] as string) || '';
        return (
          <FilterGroup key={group.key}>
            <FilterLabel>{group.label}</FilterLabel>
            <SearchContainer>
              <Input
                type="text"
                placeholder={group.placeholder || '搜索...'}
                value={searchValue || ''}
                onChange={(e) => handleSearch(group.key, e.target.value)}
                variant="filled"
                size="small"
                rightElement={
                  searchValue ? (
                    <ClearButton
                      onClick={() => handleClearSearch(group.key)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <FiX size={16} />
                    </ClearButton>
                  ) : (
                    <SearchIcon>
                      <FiSearch size={16} />
                    </SearchIcon>
                  )
                }
                style={{
                  fontSize: '0.8rem',
                  background: 'rgba(var(--border-color-rgb, 229, 231, 235), 0.1)',
                }}
              />
            </SearchContainer>
          </FilterGroup>
        );

      default:
        return null;
    }
  };

  const hasFilters = filterGroups.length > 0;

  // 计算已激活的筛选数量
  const activeFilterCount = Object.entries(filterValues).reduce((count, [key, value]) => {
    const group = filterGroups.find((g) => g.key === key);
    if (group?.type === 'search') return count; // 不计入搜索
    if (!value || value === '') return count;
    if (Array.isArray(value)) return count + value.length;
    return count + 1;
  }, 0);

  return (
    <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_PRESETS.gentle}>
      {/* 左侧：标题区域 */}
      <LeftContent>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        {showStats && count !== undefined && (
          <StatsInfo>
            <span className="text">共</span>
            <span className="count"> {count} </span>
            <span className="text">{countUnit}</span>
          </StatsInfo>
        )}
        {children}
      </LeftContent>

      {/* 右侧：筛选区域 */}
      {hasFilters && (
        <FilterArea>
          <Button
            variant="ghost"
            size="small"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              background: 'rgba(var(--border-color-rgb, 229, 231, 235), 0.1)',
              color: 'var(--text-secondary)',
            }}
            leftIcon={<FiFilter />}
            rightIcon={
              <motion.div
                animate={{ rotate: isFilterExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex' }}
              >
                <FiChevronDown />
              </motion.div>
            }
          >
            筛选{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>

          <AnimatePresence>
            {isFilterExpanded && (
              <FilterContent
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {filterGroups.map((group) => renderFilterGroup(group))}
              </FilterContent>
            )}
          </AnimatePresence>
        </FilterArea>
      )}
    </Header>
  );
};

export default ListPageHeader;
