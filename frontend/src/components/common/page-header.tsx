/**
 * 📋 列表页统一 Header 组件
 * 用于手记、文章、项目等列表页的头部
 * 支持集成筛选功能
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { Input, Button } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';
import { usePageInfo, useMediaQuery } from '@/hooks';
import { debounce } from '@/utils';

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
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.4);
  position: relative;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// 左侧内容区
const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  max-width: 100%;
`;

// 页面标题
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.2;

  background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

// 副标题/描述
const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  line-height: 1.6;
  opacity: 0.85;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

// 统计信息
const StatsInfo = styled.div`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .count {
    color: var(--accent-color);
    font-weight: 600;
    font-family: var(--font-code, 'Consolas', 'Monaco', monospace);
    font-size: 1rem;
    background: rgba(var(--accent-rgb), 0.1);
    padding: 0 0.4rem;
    border-radius: 4px;
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
  min-width: 300px;
  max-width: 100%;

  @media (max-width: 968px) {
    align-items: stretch;
    min-width: auto;
    width: 100%;
  }
`;

const AnimationWrapper = styled(motion.div)`
  width: 100%;
  overflow: hidden;
  margin-top: 1rem;
`;

const FilterContentInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  background: var(--bg-secondary);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FilterLabel = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 60px;
  flex-shrink: 0;
  padding-top: 0.4rem; // 对齐按钮文字
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
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  svg {
    font-size: 1rem;
  }
`;

const ClearButton = styled(motion.button)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(var(--text-primary-rgb), 0.1);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: rgba(var(--text-primary-rgb), 0.2);
    color: var(--text-primary);
  }

  svg {
    font-size: 0.75rem;
  }
`;

// 激活的筛选标签区域
const ActiveFiltersSection = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(var(--border-color-rgb), 0.5);
  width: 100%;
`;

const ActiveTag = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(var(--accent-rgb), 0.15);
    border-color: rgba(var(--accent-rgb), 0.3);
  }

  span {
    opacity: 0.7;
    font-weight: normal;
  }

  strong {
    font-weight: 600;
  }

  .close-icon {
    display: flex;
    align-items: center;
    opacity: 0.6;
    margin-left: 0.1rem;

    &:hover {
      opacity: 1;
    }
  }
`;

const ClearAllButton = styled.button`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.2rem 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: var(--text-secondary);
  }
`;

interface PageHeaderProps {
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
  // 自定义右侧内容（优先级高于筛选）
  rightContent?: React.ReactNode;
}

/**
 * 列表页统一 Header 组件
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
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
  rightContent,
}) => {
  const { setPageInfo } = usePageInfo();
  const { variants, springPresets } = useAnimationEngine();
  const isMobile = useMediaQuery('(max-width: 768px)');
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

  // 处理搜索（带防抖）- 使用 useMemo 避免重复创建
  const handleSearch = useMemo(
    () =>
      debounce((key: string, value: string) => {
        if (!onFilterChange) return;
        onFilterChange({ ...filterValues, [key]: value.trim() || undefined });
      }, 300),
    [onFilterChange, filterValues],
  );

  // 清除单个筛选条件
  const handleClearFilter = (key: string) => {
    if (!onFilterChange) return;
    onFilterChange({ ...filterValues, [key]: undefined });
  };

  // 清除所有筛选
  const handleClearAll = () => {
    if (!onFilterChange) return;
    onFilterChange({});
  };

  // 渲染筛选组
  const renderFilterGroup = (group: FilterGroup) => {
    switch (group.type) {
      case 'single':
        return (
          <FilterGroup key={group.key}>
            <FilterLabel>{group.label}</FilterLabel>
            <FilterOptions>
              {group.options?.map((option) => {
                const isActive = filterValues[group.key] === option.value;
                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="small"
                    onClick={() => handleSingleSelect(group.key, option.value)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      background: isActive ? 'var(--accent-color)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontWeight: isActive ? '600' : '400',
                      borderRadius: '6px',
                      border: isActive ? 'none' : '1px solid transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(var(--accent-rgb), 0.3)' : 'none',
                    }}
                    leftIcon={option.icon}
                    className={isActive ? 'active-filter-btn' : ''}
                  >
                    {option.label}
                  </Button>
                );
              })}
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
                defaultValue={searchValue}
                onChange={(e) => handleSearch(group.key, e.target.value)}
                variant="filled"
                size="small"
                rightElement={
                  searchValue ? (
                    <ClearButton
                      onClick={() => {
                        const input = document.querySelector(
                          `input[placeholder="${group.placeholder || '搜索...'}"]`,
                        ) as HTMLInputElement;
                        if (input) input.value = '';
                        handleClearFilter(group.key);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX />
                    </ClearButton>
                  ) : (
                    <SearchIcon>
                      <FiSearch />
                    </SearchIcon>
                  )
                }
                style={{
                  fontSize: '0.85rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid transparent',
                  paddingRight: '2rem',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'var(--bg-primary)';
                  e.target.style.borderColor = 'var(--accent-color)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.borderColor = 'transparent';
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

  // 计算已激活的筛选数量和列表
  const activeFilters = useMemo(() => {
    const active: { key: string; label: string; valueLabel: string }[] = [];

    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value || value === '') return;

      const group = filterGroups.find((g) => g.key === key);
      if (!group) return;

      let valueLabel = String(value);

      if (group.type === 'single') {
        const option = group.options?.find((o) => o.value === value);
        if (option) valueLabel = option.label;
      } else if (group.type === 'search') {
        valueLabel = `"${value}"`;
      }

      active.push({
        key,
        label: group.label,
        valueLabel,
      });
    });

    return active;
  }, [filterValues, filterGroups]);

  return (
    <Header variants={variants.fadeIn}>
      {/* 左侧：标题区域 */}
      <LeftContent>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        {showStats && count !== undefined && (
          <StatsInfo>
            {!isMobile && <span className="text">共收录</span>}
            <span className="count">{count}</span>
            <span className="text">{countUnit}</span>
          </StatsInfo>
        )}
        {children}
      </LeftContent>

      {/* 右侧：自定义内容或筛选区域 */}
      {rightContent ? (
        <FilterArea>{rightContent}</FilterArea>
      ) : (
        hasFilters && (
          <FilterArea>
            <Button
              variant={isFilterExpanded ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                background: isFilterExpanded
                  ? 'var(--accent-color)'
                  : 'rgba(var(--border-color-rgb, 229, 231, 235), 0.2)',
                color: isFilterExpanded ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: isFilterExpanded ? '0 4px 12px rgba(var(--accent-rgb), 0.25)' : 'none',
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
              筛选检索 {activeFilters.length > 0 && `(${activeFilters.length})`}
            </Button>

            <AnimatePresence>
              {isFilterExpanded && (
                <AnimationWrapper
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <FilterContentInner>
                    {filterGroups.map((group) => renderFilterGroup(group))}

                    {/* 已选条件展示区 */}
                    {activeFilters.length > 0 && (
                      <ActiveFiltersSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>已选条件：</span>
                          <ClearAllButton onClick={handleClearAll}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiTrash2 size={12} /> 清空筛选
                            </span>
                          </ClearAllButton>
                        </div>

                        {activeFilters.map((filter) => (
                          <ActiveTag
                            key={filter.key}
                            onClick={() => handleClearFilter(filter.key)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            layout
                          >
                            <span>{filter.label}:</span>
                            <strong>{filter.valueLabel}</strong>
                            <div className="close-icon">
                              <FiX size={12} />
                            </div>
                          </ActiveTag>
                        ))}
                      </ActiveFiltersSection>
                    )}
                  </FilterContentInner>
                </AnimationWrapper>
              )}
            </AnimatePresence>
          </FilterArea>
        )
      )}
    </Header>
  );
};

export default PageHeader;
