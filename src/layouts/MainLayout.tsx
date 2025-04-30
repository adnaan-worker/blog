import React from 'react';
import styled from '@emotion/styled';
import { Outlet } from 'react-router-dom';

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.25rem;
  }
`;

const MainLayout: React.FC = () => {
  return (
    <ContentContainer>
      <Outlet />
    </ContentContainer>
  );
};

export default MainLayout; 