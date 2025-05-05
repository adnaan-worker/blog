import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

// 修改移动端菜单样式
const MobileMenuContainer = styled(motion.div)`
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  [data-theme='dark'] & {
    background: var(--bg-primary);
  }
`;

const MobileMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MobileMenuSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MobileMenuTitle = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
`;

const MobileNavLink = styled(Link)<{ active: string }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;
  margin: 0.25rem 0;
  font-size: 1rem;
  font-weight: ${(props) => (props.active === 'true' ? '600' : '500')};
  color: ${(props) => (props.active === 'true' ? 'var(--text-primary)' : 'var(--text-secondary)')};
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 0.75rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  svg {
    font-size: 1.25rem;
    opacity: ${(props) => (props.active === 'true' ? '1' : '0.7')};
    transition: opacity 0.2s ease;
  }
`;

const MobileMenuDivider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
`;

// 定义动画变体
export const mobileMenuVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const MobileAuthButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 0.5rem;
  margin: 0.25rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.75rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  svg {
    font-size: 1.25rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
`;

// 定义菜单项接口
interface MenuItem {
  path: string;
  title: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  isDropdown?: boolean;
  children?: MenuItem[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MobileMenuProps {
  isOpen: boolean;
  menuGroups: MenuGroup[];
  accountItems?: MenuItem[];
  onLinkClick: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, menuGroups, accountItems, onLinkClick, handleLogin, handleRegister }) => {
  const location = useLocation();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  if (!isOpen) return null;

  // 处理特殊路径的点击（如登录和注册）
  const handleSpecialPathClick = (path: string) => {
    if (path === '#login' && handleLogin) {
      handleLogin();
      onLinkClick();
    } else if (path === '#register' && handleRegister) {
      handleRegister();
      onLinkClick();
    } else {
      onLinkClick();
    }
  };

  return (
    <>
      <MobileMenuContainer initial="hidden" animate="visible" exit="exit" variants={mobileMenuVariants}>
        <MobileMenuContent>
          {/* 渲染菜单组 */}
          {menuGroups.map((group, groupIndex) => ( 
            <React.Fragment key={group.title}>
              {groupIndex > 0 && <MobileMenuDivider />}
              <MobileMenuSection>
                <MobileMenuTitle>{group.title}</MobileMenuTitle>
                {group.items.map((item) => {
                  // 如果是下拉菜单项且有子菜单
                  if (item.isDropdown && item.children && item.children.length > 0) {
                    return (
                      <React.Fragment key={item.path}>
                        <MobileNavLink
                          to="#"
                          active="false"
                          onClick={() => {}}
                        >
                          {item.icon}
                          {item.title}
                        </MobileNavLink>
                        
                        {/* 渲染子菜单项，稍微缩进 */}
                        <div style={{ paddingLeft: '1.5rem' }}>
                          {item.children.map((childItem) => (
                            <MobileNavLink
                              key={childItem.path}
                              to={childItem.path}
                              active={(location.pathname === childItem.path || (childItem.path !== '/' && location.pathname.includes(childItem.path))).toString()}
                              onClick={() => handleSpecialPathClick(childItem.path)}
                            >
                              {childItem.icon}
                              {childItem.title}
                            </MobileNavLink>
                          ))}
                        </div>
                      </React.Fragment>
                    );
                  }
                  
                  // 普通菜单项
                  return (
                    <MobileNavLink
                      key={item.path}
                    to={item.isExternal || item.path.startsWith('#') ? '#' : item.path}
                    active={location.pathname === item.path || (item.path !== '/' && location.pathname.includes(item.path)) ? 'true' : 'false'}
                    onClick={() => item.isExternal || item.path.startsWith('#') ? handleSpecialPathClick(item.path) : onLinkClick()}
                  >
                    {item.icon}
                    {item.title}
                  </MobileNavLink>
                  )
                })}
              </MobileMenuSection>
            </React.Fragment>
          ))}

          {/* 渲染账户菜单项（如果用户未登录且有账户菜单项） */}
          {!isLoggedIn && accountItems && accountItems.length > 0 && (
            <>
              <MobileMenuDivider />
              <MobileMenuSection>
                <MobileMenuTitle>账户</MobileMenuTitle>
                {accountItems.map((item) => (
                  <MobileAuthButton 
                    key={item.path}
                    onClick={() => handleSpecialPathClick(item.path)}
                  >
                    {item.icon}
                    {item.title}
                  </MobileAuthButton>
                ))}
              </MobileMenuSection>
            </>
          )}
        </MobileMenuContent>
      </MobileMenuContainer>
    </>
  );
};

export default MobileMenu;