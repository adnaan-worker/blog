import React from 'react';
import styled from '@emotion/styled';

// 网格布局容器
const GridLayout = styled.div`
  display: grid;
  gap: 1.5rem;

  /* 移动端：单列 */
  grid-template-columns: 1fr;

  /* 平板及以上：两列 */
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }

  /* 大屏：三列 */
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr 1fr;
  }
`;

// 侧边栏区域
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 主内容区域
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 右侧边栏
const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1023px) {
    display: none;
  }
`;

interface ProfileLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ sidebar, mainContent, rightSidebar }) => {
  return (
    <GridLayout>
      <Sidebar>{sidebar}</Sidebar>
      <MainContent>{mainContent}</MainContent>
      <RightSidebar>{rightSidebar}</RightSidebar>
    </GridLayout>
  );
};
