import React from 'react';
import styled from '@emotion/styled';

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
`;

export const LoadingState: React.FC = () => {
  return (
    <LoadingContainer>
      <div>加载中...</div>
    </LoadingContainer>
  );
};
