import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { FiHome, FiBookOpen, FiCode, FiInfo, FiMail } from 'react-icons/fi';

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
    opacity: 0;
  }

  &:hover svg {
    opacity: 0.5;
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
  onLinkClick: () => void;
  moreDropdownOpen: boolean;
  toggleMoreDropdown: (e: React.MouseEvent<Element, MouseEvent>) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const NavLinks: React.FC<NavLinksProps> = ({ onLinkClick, moreDropdownOpen, toggleMoreDropdown, dropdownRef }) => {
  const location = useLocation();

  return (
    <>
      <NavLinkWithHover to="/" active={location.pathname === '/'} onClick={onLinkClick} icon={<FiHome size={16} />}>
        首页
      </NavLinkWithHover>

      <NavLinkWithHover
        to="/blog"
        active={location.pathname.includes('/blog')}
        onClick={onLinkClick}
        icon={<FiBookOpen size={16} />}
      >
        博客
      </NavLinkWithHover>

      <NavLinkWithHover
        to="/projects"
        active={location.pathname.includes('/projects')}
        onClick={onLinkClick}
        icon={<FiCode size={16} />}
      >
        项目
      </NavLinkWithHover>

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <NavLinkWithHover
          to="#"
          active={
            location.pathname.includes('/about') ||
            location.pathname.includes('/contact') ||
            location.pathname.includes('/code')
          }
          onClick={toggleMoreDropdown}
          icon={<FiInfo size={16} />}
        >
          更多
        </NavLinkWithHover>

        {moreDropdownOpen && (
          <DropdownContent>
            <DropdownItem to="/ui-examples" onClick={onLinkClick}>
              <FiInfo size={16} />
              组件使用示例
            </DropdownItem>
            <DropdownItem to="/about" onClick={onLinkClick}>
              <FiInfo size={16} />
              关于我
            </DropdownItem>
            <DropdownItem to="/contact" onClick={onLinkClick}>
              <FiMail size={16} />
              联系方式
            </DropdownItem>
            <DropdownItem to="/code" onClick={onLinkClick}>
              <FiCode size={16} />
              开发字体
            </DropdownItem>
          </DropdownContent>
        )}
      </div>
    </>
  );
};

export default NavLinks;
