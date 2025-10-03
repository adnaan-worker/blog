import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

// 定义菜单项接口
interface MenuItem {
  path: string;
  title: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  isDropdown?: boolean;
  children?: MenuItem[];
}

// 定义导航链接样式
const NavLink = styled(Link)<{ active: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 0.75rem;
  margin: 0 0.5rem;
  font-size: 0.95rem;
  font-weight: ${(props) => (props.active === 'true' ? '600' : '500')};
  color: ${(props) => (props.active === 'true' ? 'var(--accent-color)' : 'var(--text-secondary)')};
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;

  &:hover {
    color: var(--accent-color);
  }

  svg {
    opacity: ${(props) => (props.active === 'true' ? '1' : '0')};
    transition: opacity 0.2s ease;
  }

  &:hover svg {
    opacity: 0.5;
  }
`;

// 下拉菜单样式
const DropdownContent = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 220px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;

  [data-theme='dark'] & {
    background: var(--bg-secondary);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 0.95rem;
  gap: 8px;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  [data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    opacity: 1;
  }
`;

// NavLink组件包含悬停效果
export const NavLinkWithHover: React.FC<{
  to: string;
  active: boolean;
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ to, active, onClick, children, icon }) => {
  return (
    <NavLink to={to} active={active ? 'true' : 'false'} onClick={onClick} className="nav-link-hover">
      {active ? icon : <></>}
      {children}
      <div className="bg-effect" />
      {active ? <div className="underline" /> : <></>}
    </NavLink>
  );
};

interface NavLinksProps {
  mainNavItems: MenuItem[];
  onLinkClick: () => void;
  moreDropdownOpen: boolean;
  toggleMoreDropdown: (e: React.MouseEvent<Element, MouseEvent>) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const NavLinks: React.FC<NavLinksProps> = ({
  mainNavItems,
  onLinkClick,
  moreDropdownOpen,
  toggleMoreDropdown,
  dropdownRef,
}) => {
  const location = useLocation();

  // 检查菜单项是否激活
  const isItemActive = (item: MenuItem) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }

    if (item.isDropdown && item.children) {
      return item.children.some((child) => location.pathname.includes(child.path));
    }

    return location.pathname.includes(item.path);
  };

  return (
    <>
      {/* 渲染所有导航菜单项 */}
      {mainNavItems.map((item) => {
        if (item.isDropdown && item.children) {
          // 渲染下拉菜单
          return (
            <div key={item.path} ref={dropdownRef} style={{ position: 'relative' }}>
              <NavLinkWithHover
                to="javascript:void(0)"
                active={isItemActive(item)}
                onClick={toggleMoreDropdown}
                icon={item.icon}
              >
                {item.title}
              </NavLinkWithHover>

              {moreDropdownOpen && (
                <DropdownContent>
                  {item.children.map((childItem) => (
                    <DropdownItem key={childItem.path} to={childItem.path} onClick={onLinkClick}>
                      {childItem.icon}
                      {childItem.title}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              )}
            </div>
          );
        } else {
          // 渲染普通菜单项
          return (
            <NavLinkWithHover
              key={item.path}
              to={item.path}
              active={isItemActive(item)}
              onClick={onLinkClick}
              icon={item.icon}
            >
              {item.title}
            </NavLinkWithHover>
          );
        }
      })}
    </>
  );
};

export default NavLinks;
