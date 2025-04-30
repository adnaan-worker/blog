import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiFileText,
  FiHeart,
  FiLogOut,
  FiHome,
  FiBookOpen,
  FiCode,
  FiInfo,
  FiMail,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/modules/themeSlice';
import { logoutUser } from '@/store/modules/userSlice';
import type { RootState, AppDispatch } from '../store';
import LoginModal from './modules/LoginModal';
import RegisterModal from './modules/RegisterModal';

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

// 修改移动端菜单样式
const MobileMenu = styled(motion.div)`
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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255);
  backdrop-filter: blur(4px);
  z-index: 40;
`;

// 用户头像样式
const Avatar = styled.div<{ hasImage?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: ${(props) => (props.hasImage ? '2px solid var(--accent-color-alpha)' : 'none')};
  transition: all 0.2s ease;
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    border-color: ${(props) => (props.hasImage ? 'var(--accent-color)' : 'none')};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// 移动端头像样式
const MobileAvatar = styled(Avatar)`
  display: none;
  margin-right: 0.5rem;
  margin-left: 0;

  @media (max-width: 768px) {
    display: block;
  }
`;

// 用户下拉菜单样式
const UserDropdownContent = styled(motion.div)`
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

const UserDropdownHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const UserRole = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const UserDropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 0.95rem;
  gap: 0.75rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  [data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    color: var(--text-tertiary);
  }
`;

const UserDropdownLogout = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  color: var(--danger-color);
  transition: all 0.2s ease;
  font-size: 0.95rem;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  border-top: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-secondary);
  }

  [data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    color: var(--danger-color);
  }
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
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const mobileMenuVariants = {
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

const overlayVariants = {
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

// NavLink组件包含悬停效果
const NavLinkWithHover: React.FC<{
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
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <ThemeToggleButton
      onClick={() => dispatch(toggleTheme())}
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
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.user);
  const [internalScrolled, setInternalScrolled] = useState(scrolled);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 移除未使用的状态变量
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

  // 处理登出
  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdownOpen(false);
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
          <NavLinkWithHover
            to="/"
            active={location.pathname === '/'}
            onClick={handleLinkClick}
            icon={<FiHome size={16} />}
          >
            首页
          </NavLinkWithHover>

          <NavLinkWithHover
            to="/blog"
            active={location.pathname.includes('/blog')}
            onClick={handleLinkClick}
            icon={<FiBookOpen size={16} />}
          >
            博客
          </NavLinkWithHover>

          <NavLinkWithHover
            to="/projects"
            active={location.pathname.includes('/projects')}
            onClick={handleLinkClick}
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
              <DropdownContent initial="hidden" animate="visible" exit="exit" variants={dropdownVariants}>
                <DropdownItem to="/ui-examples" onClick={handleLinkClick}>
                  <FiInfo size={16} />
                  组件使用示例
                </DropdownItem>
                <DropdownItem to="/about" onClick={handleLinkClick}>
                  <FiInfo size={16} />
                  关于我
                </DropdownItem>
                <DropdownItem to="/contact" onClick={handleLinkClick}>
                  <FiMail size={16} />
                  联系方式
                </DropdownItem>
                <DropdownItem to="/code" onClick={handleLinkClick}>
                  <FiCode size={16} />
                  开发字体
                </DropdownItem>
              </DropdownContent>
            )}
          </div>

          <ThemeToggle />

          {/* 用户头像 */}
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            {isLoggedIn ? (
              <Avatar hasImage onClick={toggleUserDropdown}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <FiUser color="var(--text-secondary)" />
                )}
              </Avatar>
            ) : (
              <Avatar onClick={toggleUserDropdown}>
                <FiUser color="var(--text-secondary)" />
              </Avatar>
            )}

            {userDropdownOpen && (
              <UserDropdownContent initial="hidden" animate="visible" exit="exit" variants={dropdownVariants}>
                {isLoggedIn ? (
                  <>
                    <UserDropdownHeader>
                      <Avatar>
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <FiUser color="var(--text-secondary)" />
                        )}
                      </Avatar>
                      <UserInfo>
                        <UserName>{user?.username}</UserName>
                        <UserRole>普通用户</UserRole>
                      </UserInfo>
                    </UserDropdownHeader>

                    <UserDropdownItem to="/profile" onClick={handleLinkClick}>
                      <FiUser size={16} /> 个人资料
                    </UserDropdownItem>

                    <UserDropdownItem to="/dashboard" onClick={handleLinkClick}>
                      <FiFileText size={16} /> 我的文章
                    </UserDropdownItem>

                    <UserDropdownItem to="/favorites" onClick={handleLinkClick}>
                      <FiHeart size={16} /> 我的收藏
                    </UserDropdownItem>

                    <UserDropdownItem to="/settings" onClick={handleLinkClick}>
                      <FiSettings size={16} /> 设置
                    </UserDropdownItem>

                    <UserDropdownLogout onClick={handleLogout}>
                      <FiLogOut size={16} /> 退出登录
                    </UserDropdownLogout>
                  </>
                ) : (
                  <>
                    <UserDropdownItem to="#" onClick={handleLogin}>
                      <FiUser size={16} /> 登录
                    </UserDropdownItem>

                    <UserDropdownItem to="#" onClick={handleRegister}>
                      <FiUser size={16} /> 注册
                    </UserDropdownItem>
                  </>
                )}
              </UserDropdownContent>
            )}
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
      {mobileMenuOpen && (
        <>
          <MobileMenu initial="hidden" animate="visible" exit="exit" variants={mobileMenuVariants}>
            <MobileMenuContent>
              <MobileMenuSection>
                <MobileMenuTitle>主导航</MobileMenuTitle>
                <MobileNavLink to="/" active={location.pathname === '/' ? 'true' : 'false'} onClick={handleLinkClick}>
                  <FiHome />
                  首页
                </MobileNavLink>

                <MobileNavLink
                  to="/blog"
                  active={location.pathname.includes('/blog') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiBookOpen />
                  博客
                </MobileNavLink>

                <MobileNavLink
                  to="/projects"
                  active={location.pathname.includes('/projects') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiCode />
                  项目
                </MobileNavLink>
              </MobileMenuSection>

              <MobileMenuDivider />

              <MobileMenuSection>
                <MobileMenuTitle>更多</MobileMenuTitle>
                <MobileNavLink
                  to="/about"
                  active={location.pathname.includes('/about') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiInfo />
                  关于我
                </MobileNavLink>

                <MobileNavLink
                  to="/contact"
                  active={location.pathname.includes('/contact') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiMail />
                  联系方式
                </MobileNavLink>

                <MobileNavLink
                  to="/code"
                  active={location.pathname.includes('/code') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiCode />
                  开发字体
                </MobileNavLink>
              </MobileMenuSection>

              <MobileMenuDivider />

              <MobileMenuSection>
                <MobileMenuTitle>个人中心</MobileMenuTitle>
                <MobileNavLink
                  to="/profile"
                  active={location.pathname.includes('/profile') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiUser />
                  个人资料
                </MobileNavLink>

                <MobileNavLink
                  to="/dashboard"
                  active={location.pathname.includes('/dashboard') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiFileText />
                  我的文章
                </MobileNavLink>

                <MobileNavLink
                  to="/favorites"
                  active={location.pathname.includes('/favorites') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiHeart />
                  我的收藏
                </MobileNavLink>

                <MobileNavLink
                  to="/settings"
                  active={location.pathname.includes('/settings') ? 'true' : 'false'}
                  onClick={handleLinkClick}
                >
                  <FiSettings />
                  设置
                </MobileNavLink>
              </MobileMenuSection>

              <MobileMenuDivider />

              <MobileMenuSection>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <ThemeToggle />
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    退出登录
                  </button>
                </div>
              </MobileMenuSection>
            </MobileMenuContent>
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

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* 注册弹窗 */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default Header;
