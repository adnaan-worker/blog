import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiLogOut, FiX } from 'react-icons/fi';
import type { RootState } from '@/store';
import { scrollLock } from '@/utils/scroll-lock';

// 修改移动端菜单样式
const MobileMenuContainer = styled(motion.div)`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: none; /* 禁用触摸滚动 */

  [data-theme='dark'] & {
    background: var(--bg-primary);
  }
`;

const MobileMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-top: calc(var(--header-height) + 1rem);
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MobileMenuHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 1;

  [data-theme='dark'] & {
    background: var(--bg-primary);
  }
`;

const MobileMenuCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
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
  handleLogout?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  menuGroups,
  accountItems,
  onLinkClick,
  handleLogin,
  handleRegister,
  handleLogout,
}) => {
  const location = useLocation();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.user);

  // 当菜单打开时锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      // 使用统一的滚动锁定管理器
      scrollLock.lock();

      return () => {
        scrollLock.unlock();
      };
    }
  }, [isOpen]);

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
                        <MobileNavLink to="#" active="false" onClick={() => {}}>
                          {item.icon}
                          {item.title}
                        </MobileNavLink>

                        {/* 渲染子菜单项，稍微缩进 */}
                        <div style={{ paddingLeft: '1.5rem' }}>
                          {item.children.map((childItem) => (
                            <MobileNavLink
                              key={childItem.path}
                              to={childItem.path}
                              active={(
                                location.pathname === childItem.path ||
                                (childItem.path !== '/' && location.pathname.includes(childItem.path))
                              ).toString()}
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
                      active={
                        location.pathname === item.path || (item.path !== '/' && location.pathname.includes(item.path))
                          ? 'true'
                          : 'false'
                      }
                      onClick={() =>
                        item.isExternal || item.path.startsWith('#') ? handleSpecialPathClick(item.path) : onLinkClick()
                      }
                    >
                      {item.icon}
                      {item.title}
                    </MobileNavLink>
                  );
                })}
              </MobileMenuSection>
            </React.Fragment>
          ))}

          {/* 渲染账户菜单项 */}
          <MobileMenuDivider />
          <MobileMenuSection>
            <MobileMenuTitle>账户</MobileMenuTitle>
            {isLoggedIn ? (
              // 已登录用户显示用户信息和退出登录
              <>
                <div
                  style={{
                    padding: '0.75rem 0.5rem',
                    margin: '0.25rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid var(--accent-color-alpha)',
                    }}
                  >
                    <img
                      src={
                        user?.avatar ||
                        'https://foruda.gitee.com/avatar/1745582574310382271/5352827_adnaan_1745582574.png!avatar30'
                      }
                      alt="用户头像"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {user?.username || 'adnaan'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      普通用户
                    </div>
                  </div>
                </div>

                <MobileAuthButton
                  onClick={() => {
                    if (handleLogout) {
                      handleLogout();
                    }
                    onLinkClick();
                  }}
                >
                  <FiLogOut size={16} />
                  退出登录
                </MobileAuthButton>
              </>
            ) : (
              // 未登录用户显示登录和注册
              accountItems &&
              accountItems.map((item) => (
                <MobileAuthButton key={item.path} onClick={() => handleSpecialPathClick(item.path)}>
                  {item.icon}
                  {item.title}
                </MobileAuthButton>
              ))
            )}
          </MobileMenuSection>
        </MobileMenuContent>
      </MobileMenuContainer>
    </>
  );
};

export default MobileMenu;
