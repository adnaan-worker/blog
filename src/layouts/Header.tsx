import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { FiMenu, FiX } from 'react-icons/fi';
import LoginModal from './modules/LoginModal';
import RegisterModal from './modules/RegisterModal';
import NavLinks from './modules/NavLinks';
import UserMenu, { MobileAvatar } from './modules/UserMenu';
import ThemeToggle from './modules/ThemeToggle';
import MobileMenu from './modules/MobileMenu';

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
  font-family: 'Fira Code';
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  z-index: 60;

  &:hover {
    color: var(--accent-color);
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

// Header组件接口定义
interface HeaderProps {
  scrolled?: boolean;
}

// Header组件
const Header: React.FC<HeaderProps> = ({ scrolled = false }) => {
  const [internalScrolled, setInternalScrolled] = useState(scrolled);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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
        setMoreDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
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
    setUserDropdownOpen(false);
  };

  // 切换更多下拉菜单
  const toggleMoreDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setMoreDropdownOpen(!moreDropdownOpen);
  };

  // 切换用户下拉菜单
  const toggleUserDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setUserDropdownOpen(!userDropdownOpen);
  };

  // 处理登录
  const handleLogin = () => {
    setLoginModalOpen(true);
    setUserDropdownOpen(false);
  };

  // 处理注册
  const handleRegister = () => {
    setRegisterModalOpen(true);
    setUserDropdownOpen(false);
  };

  // 切换到注册
  const handleSwitchToRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };

  // 切换到登录
  const handleSwitchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  // 处理移动菜单打开时的页面滚动
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className={`header ${internalScrolled ? 'scrolled' : ''}`}>
      <HeaderContainer scrolled={internalScrolled}>
        <Logo to="/">adnaan's blog</Logo>

        {/* 桌面导航 */}
        <div className="nav-card">
          <NavLinks
            onLinkClick={handleLinkClick}
            moreDropdownOpen={moreDropdownOpen}
            toggleMoreDropdown={toggleMoreDropdown}
            dropdownRef={dropdownRef as React.RefObject<HTMLDivElement>}
          />

          {/* 桌面版主题切换和用户头像 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />

            {/* 用户头像 */}
            <UserMenu
              userDropdownOpen={userDropdownOpen}
              toggleUserDropdown={toggleUserDropdown}
              userDropdownRef={userDropdownRef as React.RefObject<HTMLDivElement>}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              handleLinkClick={handleLinkClick}
            />
          </div>
        </div>

        {/* 移动端菜单按钮和头像 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MobileAvatar onClick={toggleUserDropdown}>
            <img
              src="https://foruda.gitee.com/avatar/1745582574310382271/5352827_adnaan_1745582574.png!avatar30"
              alt="用户头像"
            />
          </MobileAvatar>

          <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </MenuButton>
        </div>
      </HeaderContainer>

      {/* 移动端菜单 */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onLinkClick={handleLinkClick} 
        handleLogin={handleLogin}
        handleRegister={handleRegister}
      />

      {/* 登录和注册模态框 */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default Header;
