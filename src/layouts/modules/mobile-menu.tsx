import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiLogOut, FiX, FiUser } from 'react-icons/fi';
import type { RootState } from '@/store';
import { scrollLock } from '@/utils/scroll-lock';
import { getRoleDisplayName, getRoleColor } from '@/utils/role-helper';

// Spring 动画配置 - 使用统一的配置
const SPRING_CONFIGS = {
  menu: {
    stiffness: 300,
    damping: 30,
    mass: 0.3,
    restDelta: 0.01,
    restSpeed: 0.5,
  },
} as const;

// 修改移动端菜单样式 - 响应式胶囊扩展效果
const MobileMenuContainer = styled(motion.div)<{ scrolled?: boolean }>`
  position: fixed;
  z-index: 50; /* 与 header 相同层级 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: none;

  /* 背景和模糊效果 - 增强模糊，防止内容穿透 */
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.7);
  backdrop-filter: saturate(180%) blur(40px);
  -webkit-backdrop-filter: saturate(180%) blur(40px);

  /* 阴影效果 - 与 header.scrolled 一致 */
  box-shadow:
    0 4px 16px 0 rgba(var(--accent-rgb, 81, 131, 245), 0.08),
    0 2px 8px 0 rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);

  /* 滚动状态：从胶囊位置扩展 */
  ${(props) =>
    props.scrolled
      ? `
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 500px; /* 限制最大高度为视口的70% */
    border-radius: 24px;
    padding-top: var(--header-height);
  `
      : `
    /* 非滚动状态：从 header 底部展开 */
    top: calc(var(--header-height) + 10px);
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100vw;
    max-height: 65vh; /* 限制最大高度为视口的65% */
    border-radius: 0 0 24px 24px;
    padding-top: 0;
  `}

  /* 暗色模式 - 增强模糊 */
  [data-theme='dark'] & {
    background: rgba(var(--bg-primary-rgb, 0, 0, 0), 0.75);
    box-shadow:
      0 6px 24px 0 rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 2px 8px 0 rgba(var(--accent-rgb, 81, 131, 245), 0.2);
  }
`;

const MobileMenuContent = styled(motion.div)`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  /* 暗色模式遮罩 */
  [data-theme='dark'] &::after {
    background: linear-gradient(
      to top,
      var(--bg-primary) 0%,
      var(--bg-primary) 15%,
      rgba(var(--bg-primary-rgb, 0, 0, 0), 0.85) 50%,
      transparent 100%
    );
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 2px;

    &:hover {
      background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
    }
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

// 定义动画变体 - 使用封装的 Spring 配置
// 滚动状态：胶囊向下扩展（限制高度）
export const mobileMenuScrolledVariants = {
  hidden: {
    height: 'var(--header-height)',
    opacity: 1,
  },
  visible: {
    height: '500px',
    opacity: 1,
    transition: {
      height: {
        type: 'spring' as const,
        ...SPRING_CONFIGS.menu,
      },
      opacity: {
        duration: 0.3,
      },
    },
  },
  exit: {
    height: 'var(--header-height)',
    opacity: 0,
    transition: {
      height: {
        type: 'spring' as const,
        ...SPRING_CONFIGS.menu,
        stiffness: 400, // 退出时稍快
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
};

// 非滚动状态：从 header 底部展开（限制高度）
export const mobileMenuNormalVariants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: '65vh',
    opacity: 1,
    transition: {
      height: {
        type: 'spring' as const,
        ...SPRING_CONFIGS.menu,
      },
      opacity: {
        duration: 0.3,
        delay: 0.1,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        type: 'spring' as const,
        ...SPRING_CONFIGS.menu,
        stiffness: 400, // 退出时稍快
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
};

// 背景遮罩动画 - 平滑淡入淡出
export const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
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
  scrolled?: boolean; // 是否滚动状态
  menuGroups: MenuGroup[];
  accountItems?: MenuItem[];
  onLinkClick: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
  handleLogout?: () => void;
  themeToggle?: React.ReactNode; // 添加主题切换组件
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  scrolled = false,
  menuGroups,
  accountItems,
  onLinkClick,
  handleLogin,
  handleRegister,
  handleLogout,
  themeToggle,
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

  // 根据滚动状态选择不同的动画变体
  const menuVariants = scrolled ? mobileMenuScrolledVariants : mobileMenuNormalVariants;

  return (
    <>
      <MobileMenuContainer scrolled={scrolled} initial="hidden" animate="visible" exit="exit" variants={menuVariants}>
        <MobileMenuContent
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              delay: scrolled ? 0.2 : 0.15,
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] as any,
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.15,
            },
          }}
        >
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
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: user?.avatar ? '2px solid var(--accent-color-alpha)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: user?.avatar ? 'transparent' : 'var(--bg-secondary)',
                    }}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="用户头像"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FiUser size={18} color="var(--text-secondary)" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {user?.username || '用户'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: getRoleColor(user?.role),
                        fontWeight: '500',
                      }}
                    >
                      {getRoleDisplayName(user?.role)}
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

          {/* 主题切换 */}
          {themeToggle && (
            <>
              <MobileMenuDivider />
              <MobileMenuSection>
                <MobileMenuTitle>外观</MobileMenuTitle>
                <div style={{ padding: '0.5rem' }}>{themeToggle}</div>
              </MobileMenuSection>
            </>
          )}
        </MobileMenuContent>
      </MobileMenuContainer>
    </>
  );
};

export default MobileMenu;
