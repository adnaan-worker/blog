import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { FiSearch, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Empty } from 'adnaan-ui';

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
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: 1.25rem;
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

const TotalCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 0.5rem;
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
  width: 250px;
  max-width: 100%;
  flex: 1;
  min-width: 150px;

  @media (max-width: 768px) {
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

const Content = styled.div`
  flex: 1;
  min-height: 300px;
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
}) => {
  return (
    <Container>
      <Header>
        <Title>
          {icon}
          {title}
          {total > 0 && <TotalCount>（{total}）</TotalCount>}
        </Title>
        <Actions>
          <SearchBox>
            <FiSearch />
            <SearchInput
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </SearchBox>
          <ActionButton variant="secondary" onClick={onRefresh} disabled={loading} whileHover={{ scale: 1.02 }}>
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            刷新
          </ActionButton>
          <ActionButton variant="primary" onClick={onAdd} whileHover={{ scale: 1.02 }}>
            <FiPlus />
            添加
          </ActionButton>
        </Actions>
      </Header>

      <Content>
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
