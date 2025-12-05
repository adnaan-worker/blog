import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import isPropValid from '@emotion/is-prop-valid';

// 定义菜单项接口
interface MenuItem {
  path: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  isExternal?: boolean;
  isDropdown?: boolean;
  children?: MenuItem[];
}

// 导航链接容器
const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem; /* 增加间距 */
  position: relative;
  padding: 0 0.5rem;
`;

// 单个导航项包装器
const NavItemWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

// 通用样式
const commonItemStyles = (isActive: boolean) => `
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  font-weight: ${isActive ? '600' : '500'};
  color: ${isActive ? 'var(--accent-color)' : 'var(--text-secondary)'};
  text-decoration: none;
  transition: color 0.2s ease;
  z-index: 1;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--accent-color);
  }
`;

// 链接类型的导航项 (使用 shouldForwardProp 过滤 isActive)
const NavLinkItem = styled(Link, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'isActive',
})<{ isActive: boolean }>`
  ${(props) => commonItemStyles(props.isActive)}
`;

// 触发器类型的导航项（用于下拉菜单）
const NavTriggerItem = styled('div', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'isActive',
})<{ isActive: boolean }>`
  ${(props) => commonItemStyles(props.isActive)}
`;

// 激活状态指示器（下划线）
const ActiveIndicator = styled(motion.div)`
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, var(--underline-bg));
  border-radius: 3px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(var(--accent-rgb), 0.2);
`;

// 下拉菜单容器
const DropdownContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  background: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  border-radius: 16px;
  padding: 6px;
  box-shadow:
    0 10px 40px -10px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  z-index: 100;
  overflow: hidden;
  transform-origin: top center;
`;

// 下拉菜单项
const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;

  &:hover {
    background: rgba(var(--bg-tertiary-rgb), 0.6);
    color: var(--text-primary);
    transform: translateX(4px);
  }

  svg {
    color: var(--text-tertiary);
    transition: color 0.2s;
  }

  &:hover svg {
    color: var(--accent-color);
  }
`;

interface NavLinksProps {
  mainNavItems: MenuItem[];
  onLinkClick: () => void;
  onDropdownItemClick?: (item: MenuItem) => void;
  // Compatibility props
  activeDropdown?: string | null;
  onDropdownOpen?: (path: string) => void;
  onDropdownClose?: () => void;
  dropdownRef?: React.RefObject<HTMLDivElement>;
}

const NavLinks: React.FC<NavLinksProps> = ({ mainNavItems, onLinkClick, onDropdownItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 检查是否激活
  const isItemActive = (item: MenuItem) => {
    const currentPath = location.pathname;

    // 首页必须精确匹配
    if (item.path === '/') {
      return currentPath === '/';
    }

    // 检查自身 (作为前缀匹配，但排除首页)
    const isSelfActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path + '/'));

    // 检查子项
    const isChildActive = item.children?.some(
      (child) => currentPath === child.path || (child.path !== '/' && currentPath.startsWith(child.path + '/')),
    );

    return isSelfActive || isChildActive || false;
  };

  return (
    <NavContainer>
      {mainNavItems.map((item) => {
        const isActive = isItemActive(item);
        const isDropdownOpen = activeDropdown === item.path;

        return (
          <NavItemWrapper
            key={item.path}
            onMouseEnter={() => {
              if (item.children) setActiveDropdown(item.path);
            }}
            onMouseLeave={() => {
              if (item.children) setActiveDropdown(null);
            }}
          >
            {item.children ? (
              // 下拉菜单触发器
              <div style={{ position: 'relative' }}>
                <NavTriggerItem
                  isActive={isActive}
                  onClick={() => {
                    // 如果直接点击多级菜单，默认跳转到第一个子项
                    if (item.children && item.children.length > 0) {
                      const firstChild = item.children[0];
                      navigate(firstChild.path);
                      if (onDropdownItemClick) {
                        onDropdownItemClick(firstChild);
                      } else {
                        onLinkClick();
                      }
                      setActiveDropdown(null);
                    }
                  }}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, marginRight: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginRight: 8 }}
                        exit={{ width: 0, opacity: 0, marginRight: 0 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}
                      >
                        <item.icon size={16} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span>{item.title}</span>

                  {/* 选中指示器 */}
                  {isActive && (
                    <ActiveIndicator
                      layoutId="nav-underline"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </NavTriggerItem>

                {/* 下拉菜单内容 */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <DropdownContainer
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                    >
                      {item.children.map((child) => (
                        <DropdownItem
                          key={child.path}
                          to={child.path}
                          onClick={() => {
                            if (onDropdownItemClick) {
                              onDropdownItemClick(child);
                            } else {
                              onLinkClick();
                            }
                            setActiveDropdown(null);
                          }}
                        >
                          <child.icon size={16} />
                          {child.title}
                        </DropdownItem>
                      ))}
                    </DropdownContainer>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // 普通链接
              <NavLinkItem to={item.path} isActive={isActive} onClick={onLinkClick}>
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0, marginRight: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginRight: 8 }}
                      exit={{ width: 0, opacity: 0, marginRight: 0 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}
                    >
                      <item.icon size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <span>{item.title}</span>

                {/* 选中指示器 */}
                {isActive && (
                  <ActiveIndicator
                    layoutId="nav-underline"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </NavLinkItem>
            )}
          </NavItemWrapper>
        );
      })}
    </NavContainer>
  );
};

export default NavLinks;
