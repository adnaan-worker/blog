import React from 'react';
import styled from '@emotion/styled';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiMoreHorizontal } from 'react-icons/fi';

// 样式组件
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 0.25rem;
  }
`;

const PaginationButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'outline';
  active?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);

  @media (max-width: 640px) {
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 0.85rem;
  }

  ${({ active, variant = 'outline' }) => {
    if (active) {
      return `
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
        box-shadow: 0 2px 8px rgba(var(--accent-color-rgb), 0.3);
      `;
    }

    switch (variant) {
      case 'primary':
        return `
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          
          &:hover:not(:disabled) {
            background: var(--accent-color-hover);
            border-color: var(--accent-color-hover);
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--border-color);
          
          &:hover:not(:disabled) {
            background: var(--bg-tertiary);
            border-color: var(--accent-color);
            transform: translateY(-1px);
          }
        `;
      default: // outline
        return `
          background: transparent;
          color: var(--text-secondary);
          border-color: var(--border-color);
          
          &:hover:not(:disabled) {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border-color: var(--accent-color);
            transform: translateY(-1px);
          }
        `;
    }
  }}

  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}

  &:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const PaginationEllipsis = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: var(--text-tertiary);
  font-size: 0.9rem;

  @media (max-width: 640px) {
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 0.85rem;
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    margin: 0 0.5rem;
    font-size: 0.85rem;
    gap: 0.5rem;
  }
`;

const PageSizeSelector = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  option {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
`;

// 组件接口
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  showInfo?: boolean;
  pageSizeOptions?: number[];
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

// 生成页码数组的辅助函数
const generatePageNumbers = (current: number, total: number, delta: number = 2): (number | 'ellipsis')[] => {
  if (total <= 1) return [1];

  const range: (number | 'ellipsis')[] = [];
  const rangeWithDots: (number | 'ellipsis')[] = [];

  // 始终显示第一页
  range.push(1);

  // 计算当前页周围的页码范围
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  // 如果开始位置距离第一页有间隔，添加省略号
  if (start > 2) {
    range.push('ellipsis');
  }

  // 添加中间页码
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== total) {
      range.push(i);
    }
  }

  // 如果结束位置距离最后一页有间隔，添加省略号
  if (end < total - 1) {
    range.push('ellipsis');
  }

  // 始终显示最后一页（如果总页数大于1）
  if (total > 1) {
    range.push(total);
  }

  return range;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showQuickJumper = false,
  showSizeChanger = true,
  showTotal = true,
  showInfo = true,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  className,
  size = 'medium',
}) => {
  const [jumpPage, setJumpPage] = React.useState('');

  // 计算显示的页码
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  // 计算当前显示的数据范围
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // 处理页码点击
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  // 处理快速跳转
  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumpPage);
      if (page >= 1 && page <= totalPages) {
        handlePageClick(page);
        setJumpPage('');
      }
    }
  };

  // 处理页面大小变化
  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
      // 调整当前页以保持大致相同的数据位置
      const newPage = Math.ceil(startItem / newPageSize);
      if (newPage !== currentPage) {
        onPageChange(newPage);
      }
    }
  };

  if (totalPages <= 1 && !showInfo) return null;

  return (
    <PaginationContainer className={className}>
      {/* 信息显示 */}
      {showInfo && (
        <PaginationInfo>
          {showTotal && (
            <span>
              共 <strong>{totalItems}</strong> 条， 显示 <strong>{startItem}</strong> - <strong>{endItem}</strong> 条
            </span>
          )}

          {showSizeChanger && onPageSizeChange && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              每页
              <PageSizeSelector
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                disabled={disabled}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </PageSizeSelector>
              条
            </label>
          )}
        </PaginationInfo>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <>
          {/* 第一页 */}
          <PaginationButton
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1 || disabled}
            title="第一页"
            aria-label="第一页"
          >
            <FiChevronsLeft size={16} />
          </PaginationButton>

          {/* 上一页 */}
          <PaginationButton
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            title="上一页"
            aria-label="上一页"
          >
            <FiChevronLeft size={16} />
          </PaginationButton>

          {/* 页码 */}
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <PaginationEllipsis key={`ellipsis-${index}`}>
                  <FiMoreHorizontal size={16} />
                </PaginationEllipsis>
              );
            }

            return (
              <PaginationButton
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                active={pageNum === currentPage}
                disabled={disabled}
                aria-label={`第 ${pageNum} 页`}
                aria-current={pageNum === currentPage ? 'page' : undefined}
              >
                {pageNum}
              </PaginationButton>
            );
          })}

          {/* 下一页 */}
          <PaginationButton
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            title="下一页"
            aria-label="下一页"
          >
            <FiChevronRight size={16} />
          </PaginationButton>

          {/* 最后一页 */}
          <PaginationButton
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages || disabled}
            title="最后一页"
            aria-label="最后一页"
          >
            <FiChevronsRight size={16} />
          </PaginationButton>

          {/* 快速跳转 */}
          {showQuickJumper && (
            <PaginationInfo>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                跳至
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onKeyDown={handleQuickJump}
                  disabled={disabled}
                  style={{
                    width: '60px',
                    padding: '0.25rem 0.5rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                  }}
                  placeholder="页码"
                />
                页
              </label>
            </PaginationInfo>
          )}
        </>
      )}
    </PaginationContainer>
  );
};

export default Pagination;
