import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiChevronDown, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

// 定义Header容器组件样式
const HeaderContainer = styled.header<{ scrolled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--header-height);
  padding: 0 1.5rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

// 定义Logo样式
const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  z-index: 60;
  
  &:hover {
    color: var(--accent-color);
  }
`;

// 定义导航链接样式
const NavLink = styled(Link)<{ active: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 0.75rem;
  margin: 0 0.5rem;
  font-size: 0.95rem;
  font-weight: ${(props) => (props.active === "true" ? '600' : '500')};
  color: ${(props) => (props.active === "true" ? 'var(--text-primary)' : 'var(--text-secondary)')};
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;
  
  &:hover {
    color: var(--text-primary);
  }
`;

// 下拉菜单样式
const DropdownContent = styled(motion.div)`
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
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
  
  [data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

// 移动端菜单按钮样式
const MenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 60;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

// 移动端菜单样式
const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 50;
  padding: 5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  [data-theme='dark'] & {
    background: var(--bg-primary);
  }
`;

const MobileNavLink = styled(Link)<{ active: string }>`
  width: 100%;
  padding: 1rem;
  margin: 0.25rem 0;
  font-size: 1.1rem;
  font-weight: ${(props) => (props.active === "true" ? '600' : '500')};
  color: ${(props) => (props.active === "true" ? 'var(--text-primary)' : 'var(--text-secondary)')};
  text-align: center;
  border-radius: 8px;
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const MobileDropdownContent = styled(motion.div)`
  width: 100%;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileDropdownItem = styled(Link)`
  width: 100%;
  padding: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  font-size: 1rem;
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
`;

// 定义动画变体
const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 0.2, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95, 
    transition: { 
      duration: 0.15, 
      ease: [0.4, 0, 1, 1] 
    } 
  }
};

const mobileMenuVariants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0, 
    transition: { 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1] 
    } 
  },
  exit: { 
    x: '100%', 
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0, 1, 1] 
    } 
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.3 
    } 
  },
  exit: { 
    opacity: 0, 
    transition: { 
      duration: 0.2 
    } 
  }
};

// NavLink组件包含悬停效果
const NavLinkWithHover: React.FC<{
  to: string;
  active: boolean;
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  children: React.ReactNode;
}> = ({ to, active, onClick, children }) => {
  return (
    <NavLink to={to} active={active ? "true" : "false"} onClick={onClick} className="nav-link-hover">
      {children}
      <div className="bg-effect" />
    </NavLink>
  );
};

// 主题切换按钮组件
const ThemeToggleButton = styled(motion.button)`
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.08);
    color: var(--accent-color);
  }
`;

// 简化的ThemeToggle组件
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <ThemeToggleButton 
      onClick={toggleTheme} 
      aria-label="切换主题"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </ThemeToggleButton>
  );
};

// Header组件接口定义
interface HeaderProps {
  scrolled?: boolean;
}

// Header组件
const Header: React.FC<HeaderProps> = ({ scrolled = false }) => {
  const location = useLocation();
  const [internalScrolled, setInternalScrolled] = useState(scrolled);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreDropdownOpen, setMobileMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // 如果scrolled属性被传入，则使用它，否则自行监听滚动
  useEffect(() => {
    setInternalScrolled(scrolled);
  }, [scrolled]);

  useEffect(() => {
    // 如果没有传入scrolled属性，则自行监听滚动
    if (scrolled === undefined) {
      const handleScroll = () => {
        if (window.scrollY > 10) {
          setInternalScrolled(true);
        } else {
          setInternalScrolled(false);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setMobileMoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 关闭所有下拉菜单和移动菜单
  const handleLinkClick = () => {
    setMoreDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileMoreDropdownOpen(false);
  };

  // 切换更多下拉菜单
  const toggleMoreDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setMoreDropdownOpen(!moreDropdownOpen);
  };

  // 切换移动端更多下拉菜单
  const toggleMobileMoreDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setMobileMoreDropdownOpen(!mobileMoreDropdownOpen);
  };

  return (
    <div className={`header ${internalScrolled ? 'scrolled' : ''}`}>
      <HeaderContainer scrolled={internalScrolled}>
        <Logo to="/">adnaan's blog</Logo>
        
        {/* 桌面导航 */}
        <div className="nav-card">
          <NavLinkWithHover 
            to="/" 
            active={location.pathname === '/'} 
            onClick={handleLinkClick}
          >
            首页
          </NavLinkWithHover>
          
          <NavLinkWithHover 
            to="/blog" 
            active={location.pathname.includes('/blog')} 
            onClick={handleLinkClick}
          >
            博客
          </NavLinkWithHover>
          
          <NavLinkWithHover 
            to="/projects" 
            active={location.pathname.includes('/projects')} 
            onClick={handleLinkClick}
          >
            项目
          </NavLinkWithHover>
          
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <NavLinkWithHover 
              to="#" 
              active={location.pathname.includes('/about') || location.pathname.includes('/contact') || location.pathname.includes('/code')} 
              onClick={toggleMoreDropdown}
            >
              更多 <FiChevronDown />
            </NavLinkWithHover>
            
            {moreDropdownOpen && (
              <DropdownContent
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={dropdownVariants}
              >
                <DropdownItem to="/about" onClick={handleLinkClick}>关于我</DropdownItem>
                <DropdownItem to="/contact" onClick={handleLinkClick}>联系方式</DropdownItem>
                <DropdownItem to="/code" onClick={handleLinkClick}>开发字体</DropdownItem>
              </DropdownContent>
            )}
          </div>
          
          <ThemeToggle />
        </div>
        
        {/* 移动菜单按钮 */}
        <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </MenuButton>
      </HeaderContainer>
      
      {/* 移动导航菜单 */}
      {mobileMenuOpen && (
        <>
          <MobileMenu
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <MobileNavLink 
              to="/" 
              active={location.pathname === '/' ? "true" : "false"} 
              onClick={handleLinkClick}
            >
              首页
            </MobileNavLink>
            
            <MobileNavLink 
              to="/blog" 
              active={location.pathname.includes('/blog') ? "true" : "false"} 
              onClick={handleLinkClick}
            >
              博客
            </MobileNavLink>
            
            <MobileNavLink 
              to="/projects" 
              active={location.pathname.includes('/projects') ? "true" : "false"} 
              onClick={handleLinkClick}
            >
              项目
            </MobileNavLink>
            
            <div ref={mobileDropdownRef} style={{ width: '100%',display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MobileNavLink 
                to="#" 
                active={location.pathname.includes('/about') || location.pathname.includes('/contact') || location.pathname.includes('/code') ? "true" : "false"} 
                onClick={toggleMobileMoreDropdown}
              >
                更多
              </MobileNavLink>
              
              {mobileMoreDropdownOpen && (
                <MobileDropdownContent
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MobileDropdownItem to="/about" onClick={handleLinkClick}>关于我</MobileDropdownItem>
                  <MobileDropdownItem to="/contact" onClick={handleLinkClick}>联系方式</MobileDropdownItem>
                  <MobileDropdownItem to="/code" onClick={handleLinkClick}>开发字体</MobileDropdownItem>
                </MobileDropdownContent>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <ThemeToggle />
            </div>
          </MobileMenu>
          
          <Overlay
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={() => setMobileMenuOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default Header;