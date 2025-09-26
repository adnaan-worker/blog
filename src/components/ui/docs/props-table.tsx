import React from 'react';
import styled from '@emotion/styled';
import { FiStar } from 'react-icons/fi';
import { ComponentProp } from '@/utils/doc-generator';

// 样式组件
const TableContainer = styled.div`
  margin: 2rem 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-primary);
`;

const TableHeader = styled.div`
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const TableTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '📋';
    font-size: 1rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
`;

const TableHead = styled.thead`
  background: var(--bg-secondary);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-secondary);
  }
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  border-right: 1px solid var(--border-color);

  &:last-child {
    border-right: none;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  border-right: 1px solid var(--border-color);
  vertical-align: top;

  &:last-child {
    border-right: none;
  }
`;

const PropName = styled.code`
  background: var(--bg-secondary);
  color: var(--accent-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const PropType = styled.code`
  background: rgba(var(--accent-color-rgb), 0.1);
  color: var(--text-primary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: pre-wrap;
  line-height: 1.4;
  border: 1px solid rgba(var(--accent-color-rgb), 0.2);
`;

const DefaultValue = styled.code`
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const RequiredIcon = styled(FiStar)`
  color: var(--error-color);
  width: 10px;
  height: 10px;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.9rem;
`;

// 组件接口
interface PropsTableProps {
  props: ComponentProp[];
  title?: string;
  className?: string;
}

const PropsTable: React.FC<PropsTableProps> = ({ props, title = 'Props', className }) => {
  if (!props || props.length === 0) {
    return (
      <TableContainer className={className}>
        <TableHeader>
          <TableTitle>{title}</TableTitle>
        </TableHeader>
        <EmptyState>暂无属性信息</EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer className={className}>
      <TableHeader>
        <TableTitle>{title}</TableTitle>
      </TableHeader>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell>类型</TableHeaderCell>
            <TableHeaderCell>默认值</TableHeaderCell>
            <TableHeaderCell>说明</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell>
                <PropName>
                  {prop.name}
                  {prop.required && <RequiredIcon />}
                </PropName>
              </TableCell>
              <TableCell>
                <PropType>{prop.type}</PropType>
              </TableCell>
              <TableCell>
                {prop.defaultValue ? (
                  <DefaultValue>{prop.defaultValue}</DefaultValue>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>-</span>
                )}
              </TableCell>
              <TableCell>
                <span style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {prop.description || '暂无说明'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PropsTable;
