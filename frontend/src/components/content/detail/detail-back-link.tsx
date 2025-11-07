import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { FiArrowLeft } from 'react-icons/fi';

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 0;

  svg {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--accent-color);

    svg {
      transform: translateX(-4px);
    }
  }
`;

interface DetailBackLinkProps {
  to: string;
  label?: string;
}

export const DetailBackLink: React.FC<DetailBackLinkProps> = ({ to, label = '返回列表' }) => {
  return (
    <BackLink to={to}>
      <FiArrowLeft size={18} />
      <span>{label}</span>
    </BackLink>
  );
};

export default DetailBackLink;
