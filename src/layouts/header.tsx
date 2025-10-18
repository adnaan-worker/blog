import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import {
  FiMenu,
  FiX,
  FiHome,
  FiBookOpen,
  FiCode,
  FiInfo,
  FiMail,
  FiLogIn,
  FiUserPlus,
  FiUser,
  FiEdit,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/modules/userSlice';
import type { AppDispatch, RootState } from '@/store';
import LoginModal from './modules/login-model';
import RegisterModal from './modules/register-modal';
import NavLinks from './modules/nav-links';
import UserMenu, { MobileAvatar } from './modules/user-menu';
import ThemeToggle from './modules/theme-toggle';
import MobileMenu from './modules/mobile-menu';
import AppStatus from './modules/app-status';
import AnimatedLogo from './modules/animated-logo';

// 定义菜单数据类型
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

// 定义Header容器组件样式
const HeaderContainer = styled.header<{ scrolled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  height: var(--header-height);
  padding: 0 5rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
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

// 定义主导航菜单数据
const mainNavItems: MenuItem[] = [
  {
    path: '/',
    title: '首页',
    icon: <FiHome size={16} />,
  },
  {
    path: '/blog',
    title: '文稿',
    icon: <FiBookOpen size={16} />,
  },
  {
    path: '/notes',
    title: '手记',
    icon: <FiEdit size={16} />,
  },
  {
    path: '/projects',
    title: '项目',
    icon: <FiCode size={16} />,
  },
  {
    path: '#',
    title: '更多',
    icon: <FiInfo size={16} />,
    isDropdown: true,
    children: [
      {
        path: '/code',
        title: '开发字体',
        icon: <FiCode size={16} />,
      },
      {
        path: '/about',
        title: '关于我',
        icon: <FiInfo size={16} />,
      },
      {
        path: '/contact',
        title: '联系方式',
        icon: <FiMail size={16} />,
      },
    ],
  },
];

// 定义基础移动端菜单分组数据
const getBaseMobileMenuGroups = (): MenuGroup[] => [
  {
    title: '主导航',
    items: mainNavItems,
  },
];

// 定义账户菜单项
const accountMenuItems: MenuItem[] = [
  {
    path: '#login',
    title: '登录',
    icon: <FiLogIn size={16} />,
  },
  {
    path: '#register',
    title: '注册',
    icon: <FiUserPlus size={16} />,
  },
];

// Header组件
const Header: React.FC<HeaderProps> = ({ scrolled = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.user);
  const [internalScrolled, setInternalScrolled] = useState(scrolled);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navCardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // 根据登录状态动态生成移动端菜单分组
  const mobileMenuGroups: MenuGroup[] = isLoggedIn
    ? [
        ...getBaseMobileMenuGroups(),
        {
          title: '用户中心',
          items: [
            {
              path: '/profile',
              title: '个人中心',
              icon: <FiUser size={16} />,
            },
          ],
        },
      ]
    : getBaseMobileMenuGroups();

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

  // 高性能鼠标跟随聚光灯效果
  useEffect(() => {
    const navCard = navCardRef.current;
    if (!navCard || internalScrolled) return;

    let mouseX = 0;
    let mouseY = 0;

    const updateSpotlight = () => {
      // 使用 CSS 变量更新位置，性能优于直接修改 background
      navCard.style.setProperty('--spotlight-x', `${mouseX}px`);
      navCard.style.setProperty('--spotlight-y', `${mouseY}px`);
      rafRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = navCard.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // 使用 requestAnimationFrame 优化性能
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateSpotlight);
      }
    };

    navCard.addEventListener('mousemove', handleMouseMove);

    return () => {
      navCard.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [internalScrolled]);

  // 关闭所有下拉菜单和移动菜单
  const handleLinkClick = () => {
    setMoreDropdownOpen(false);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // 切换更多下拉菜单
  const toggleMoreDropdown = (e?: React.MouseEvent<Element, MouseEvent>) => {
    e?.stopPropagation();
    setMoreDropdownOpen(!moreDropdownOpen);
  };

  // 切换用户下拉菜单
  const toggleUserDropdown = (e?: React.MouseEvent<Element, MouseEvent>) => {
    e?.stopPropagation();
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

  return (
    <div className={`header ${internalScrolled ? 'scrolled' : ''}`}>
      <HeaderContainer scrolled={internalScrolled}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AnimatedLogo />

          {/* Logo右侧的应用状态 */}
          <AppStatus />
        </div>

        {/* 桌面导航 */}
        <div className="nav-card" ref={navCardRef}>
          <NavLinks
            mainNavItems={mainNavItems}
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
          <MobileAvatar onClick={(e) => toggleUserDropdown(e)} hasImage={!!user?.avatar}>
            {isLoggedIn && user?.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <FiUser color="var(--text-secondary)" />
            )}
          </MobileAvatar>

          <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </MenuButton>
        </div>
      </HeaderContainer>

      {/* 移动端菜单 */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        menuGroups={mobileMenuGroups}
        accountItems={accountMenuItems}
        onLinkClick={handleLinkClick}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleLogout={() => {
          dispatch(logoutUser());
          handleLinkClick();
        }}
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
