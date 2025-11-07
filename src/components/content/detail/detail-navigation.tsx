import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const NavButton = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  max-width: 300px;
  text-decoration: none;

  &:hover {
    background: var(--accent-color-hover);
    color: var(--text-primary);
    transform: translateY(-2px);
  }

  &.prev {
    padding-left: 1rem;
  }

  &.next {
    padding-right: 1rem;
    text-align: right;
    margin-left: auto;
  }

  .nav-text {
    display: flex;
    flex-direction: column;

    .title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 250px;
    }

    .label {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }

  svg {
    min-width: 20px;
  }

  &.prev svg {
    margin-right: 0.5rem;
  }

  &.next svg {
    margin-left: 0.5rem;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;

    &.next {
      margin-left: 0;
    }
  }
`;

interface NavigationItem {
  id: string | number;
  title: string;
}

interface DetailNavigationProps {
  prevItem?: NavigationItem;
  nextItem?: NavigationItem;
  basePath: string;
  prevLabel?: string;
  nextLabel?: string;
}

export const DetailNavigation: React.FC<DetailNavigationProps> = ({
  prevItem,
  nextItem,
  basePath,
  prevLabel = '上一篇',
  nextLabel = '下一篇',
}) => {
  if (!prevItem && !nextItem) {
    return null;
  }

  return (
    <Navigation>
      {prevItem ? (
        <NavButton to={`${basePath}/${prevItem.id}`} className="prev">
          <FiChevronLeft size={20} />
          <div className="nav-text">
            <span className="label">{prevLabel}</span>
            <span className="title">{prevItem.title}</span>
          </div>
        </NavButton>
      ) : (
        <div />
      )}

      {nextItem ? (
        <NavButton to={`${basePath}/${nextItem.id}`} className="next">
          <div className="nav-text">
            <span className="label">{nextLabel}</span>
            <span className="title">{nextItem.title}</span>
          </div>
          <FiChevronRight size={20} />
        </NavButton>
      ) : (
        <div />
      )}
    </Navigation>
  );
};

export default DetailNavigation;
