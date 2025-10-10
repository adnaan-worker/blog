import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  FiSettings,
  FiHeart,
  FiEdit,
  FiUser,
  FiMonitor,
} from 'react-icons/fi';
import { keyframes } from '@emotion/react';
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

// Logo动画效果
const glowAnimation = keyframes`
  0% {
    text-shadow: 0 0 10px rgba(81, 131, 245, 0);
  }
  50% {
    text-shadow: 0 0 10px rgba(81, 131, 245, 0.5);
  }
  100% {
    text-shadow: 0 0 10px rgba(81, 131, 245, 0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Logo容器样式
const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Fira Code', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  z-index: 60;
  transition: all 0.3s ease;
  position: relative;
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
    color: var(--accent-color);

    .logo-icon {
      animation: ${rotate} 5s linear infinite;
      color: var(--accent-color);
      box-shadow: 0 0 15px var(--accent-color-hover);
    }

    .logo-text {
      animation: ${glowAnimation} 2s ease-in-out infinite;
    }

    .logo-highlight {
      animation: ${bounce} 0.6s ease infinite;
    }
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    gap: 0.4rem;
  }
`;

// Logo提示框
const LogoTooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: normal;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: max-content;
  max-width: 200px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  z-index: 100;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  transform: translateY(${(props) => (props.visible ? '0' : '10px')});
  animation: ${(props) => (props.visible ? fadeIn : 'none')} 0.3s ease forwards;
  border: 1px solid var(--border-color);

  &:before {
    content: '';
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: var(--bg-secondary);
    transform: rotate(45deg);
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
  }
`;

// Logo图标容器
const LogoIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(81, 131, 245, 0.2);
  animation: ${pulse} 3s ease-in-out infinite;

  [data-theme='dark'] & {
    box-shadow: 0 0 15px rgba(81, 131, 245, 0.3);
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    border-radius: 8px;

    img {
      width: 16px;
      height: 16px;
    }
  }
`;

// Logo文字样式
const LogoText = styled.span`
  position: relative;
  transition: all 0.3s ease;
  color: var(--text-primary);

  &:hover {
    color: var(--accent-color);
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

// Logo强调部分
const LogoHighlight = styled.span`
  color: var(--accent-color);
  transition: all 0.3s ease;
  position: relative;
  font-weight: 700;
  text-shadow: 0 0 1px var(--accent-color-hover);
  display: inline-block;
  padding: 0 2px;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--accent-color);
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s ease;
    opacity: 0.7;
  }

  ${LogoContainer}:hover &:after {
    transform: scaleX(1);
    transform-origin: bottom left;
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

// 有趣的Logo提示消息数组
const logoMessages = [
  '欢迎来到adnaan的博客! ✨',
  '今天有什么好消息吗? 🎉',
  '知识是无穷的宝藏 📚',
  '每天学习一点点 💡',
  '技术改变世界 🌍',
  '编程创造未来 🚀',
];

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
  const [showLogoTooltip, setShowLogoTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const logoTooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

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

  // 处理Logo悬停效果
  const handleLogoMouseEnter = () => {
    // 随机选择一条消息
    const randomMessage = logoMessages[Math.floor(Math.random() * logoMessages.length)];
    setTooltipMessage(randomMessage);

    // 设置定时器，延迟显示提示
    logoTooltipTimer.current = setTimeout(() => {
      setShowLogoTooltip(true);
    }, 500); // 500ms后显示提示
  };

  const handleLogoMouseLeave = () => {
    // 清除定时器
    if (logoTooltipTimer.current) {
      clearTimeout(logoTooltipTimer.current);
      logoTooltipTimer.current = null;
    }

    // 立即隐藏提示
    setShowLogoTooltip(false);
  };

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
          <LogoContainer to="/" onMouseEnter={handleLogoMouseEnter} onMouseLeave={handleLogoMouseLeave}>
            <LogoIconContainer className="logo-icon">
              <img src="/logo.png" alt="" />
            </LogoIconContainer>
            <LogoText className="logo-text">
              <LogoHighlight className="logo-highlight">a</LogoHighlight>dnaan's
              <LogoHighlight className="logo-highlight"> blog</LogoHighlight>
            </LogoText>
            <LogoTooltip visible={showLogoTooltip}>{tooltipMessage}</LogoTooltip>
          </LogoContainer>

          {/* Logo右侧的应用状态 */}
          <AppStatus />
        </div>

        {/* 桌面导航 */}
        <div className="nav-card">
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
