import React, { useEffect, useLayoutEffect, useState, useRef, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiTag, FiBookOpen } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useMotionValue,
  animate,
} from 'framer-motion';
import { logoutUser } from '@/store/modules/userSlice';
import type { AppDispatch, RootState } from '@/store';
import { storage } from '@/utils';
import { useModalScrollLock, useClickOutside } from '@/hooks';
import { useAnimationEngine } from '@/utils/ui/animation';
import { LazyImage } from '@/components/common';
import LoginModal from './modules/login-model';
import RegisterModal from './modules/register-modal';
import NavLinks from './modules/nav-links';
import UserMenu, { MobileAvatar } from './modules/user-menu';
import ThemeToggle from './modules/theme-toggle';
import MobileMenu from './modules/mobile-menu';
import AppStatus from './modules/app-status';
import AnimatedLogo from './modules/animated-logo';
import {
  mainNavItems as defaultMainNavItems,
  accountMenuItems,
  getBaseMobileMenuGroups,
  type MenuItem,
  type MenuGroup,
} from '@/config/menu.config';

/* ==================== 类型定义 ==================== */

export interface PageInfo {
  title?: string;
  subtitle?: string; // 副标题
  tags?: (string | { id?: string | number; name?: string })[];
  category?: string;
}

interface HeaderProps {
  scrolled?: boolean;
  pageInfo?: PageInfo;
}

/* ==================== 样式组件 ==================== */

const HeaderContainer = styled.header<{ scrolled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--header-height);
  padding: 0 5rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const DesktopNavWrapper = styled.div`
  display: flex;
  margin-left: auto;

  @media (max-width: 768px) {
    display: none !important;
  }
`;

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

// 桌面端页面信息样式
const PageInfoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 2rem;
  padding-left: 2rem;
  border-left: 1px solid rgba(var(--accent-rgb), 0.15);
  /* 宽度由动画控制，防止内容溢出 */
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const PageTitle = styled.h1`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PageSubtitle = styled.p`
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-tertiary);
  margin: 0.25rem 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
  line-height: 1.3;
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;

  svg {
    font-size: 0.7rem;
  }
`;

// 移动端页面信息样式
const MobilePageInfo = styled(motion.div)`
  display: none;
  position: fixed;
  top: calc(var(--header-height) + 10px);
  left: 20px;
  right: 20px;
  z-index: 45;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border-radius: 16px;
  border: 1px solid rgba(var(--accent-rgb), 0.12);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);

  @media (max-width: 1024px) {
    display: block;
  }

  /* 暗色模式 */
  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(30, 30, 35, 0.92) 0%, rgba(20, 20, 25, 0.88) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const MobilePageTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    flex-shrink: 0;
    color: var(--accent-color);
    opacity: 0.8;
  }
`;

const MobilePageSubtitle = styled.div`
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-tertiary);
  margin-top: 0.375rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
`;

const MobileTagsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid rgba(var(--border-rgb, 226, 232, 240), 0.3);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* 暗色模式 */
  [data-theme='dark'] & {
    border-top-color: rgba(255, 255, 255, 0.08);
  }
`;

const MobileTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.625rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;

  svg {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  /* 暗色模式 */
  [data-theme='dark'] & {
    background: rgba(var(--accent-rgb), 0.15);
  }
`;

/* ==================== 常量配置 ==================== */

// LocalStorage 键
const STORAGE_KEYS = {
  SELECTED_MENU: 'header_selected_menu_item',
} as const;

// 滚动动画配置 - 增加滚动范围，让转场更从容
const SCROLL_CONFIG = {
  start: 0,
  end: 150,
} as const;

/* ==================== 辅助函数 ==================== */

/**
 * 提取标签文本和键
 */
const extractTagInfo = (tag: string | any, index: number) => {
  const tagText = typeof tag === 'string' ? tag : tag?.name || '';
  const tagKey = typeof tag === 'string' ? tag : tag?.id || index;
  return { tagText, tagKey };
};

/**
 * 替换菜单中的"更多"项为选中的子菜单项
 */
const replaceMoreMenuItem = (items: MenuItem[], selectedChild: MenuItem): MenuItem[] => {
  return items.map((item) => {
    if (item.isDropdown && item.children) {
      // 将选中的子项放到父级位置，保留下拉功能
      return {
        ...selectedChild,
        isDropdown: true,
        children: item.children,
      };
    }
    return item;
  });
};

/* ==================== Header 组件 ==================== */

const Header: React.FC<HeaderProps> = ({ scrolled = false, pageInfo }) => {
  // Router
  const location = useLocation();

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.user);

  // 菜单状态 - 从 localStorage 恢复选中的菜单项
  const [mainNavItems, setMainNavItems] = useState<MenuItem[]>(() => {
    const savedPath = storage.local.get<string>(STORAGE_KEYS.SELECTED_MENU);

    if (!savedPath) {
      return defaultMainNavItems;
    }

    // 根据保存的 path 查找对应的菜单项
    let foundItem: MenuItem | undefined;

    for (const item of defaultMainNavItems) {
      if (item.path === savedPath) {
        foundItem = item;
        break;
      }
      // 检查子菜单
      if (item.children) {
        const childItem = item.children.find((child) => child.path === savedPath);
        if (childItem) {
          foundItem = childItem;
          break;
        }
      }
    }

    // 如果找到了匹配的菜单项，替换父菜单
    if (foundItem) {
      return replaceMoreMenuItem(defaultMainNavItems, foundItem);
    }

    // 如果找不到，清理缓存并使用默认值
    storage.local.remove(STORAGE_KEYS.SELECTED_MENU);
    return defaultMainNavItems;
  });

  // 其他状态
  const [internalScrolled, setInternalScrolled] = useState(scrolled);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navCardRef = useRef<HTMLDivElement>(null);
  const isRouteChangingRef = useRef(false);

  // ==================== 滚动锁定管理 ====================
  // 当任意模态框打开时自动锁定滚动
  useModalScrollLock(loginModalOpen || registerModalOpen);

  // ==================== 动画引擎 ====================
  const { springPresets } = useAnimationEngine();

  // ==================== 滚动动画 ====================
  const { scrollY } = useScroll();

  // 创建可手动控制的 motion value
  const smoothProgress = useMotionValue(0);

  // 监听滚动变化，更新 smoothProgress
  useEffect(() => {
    const updateProgress = (latest: number) => {
      // 路由切换期间不更新动画进度
      if (isRouteChangingRef.current) {
        return;
      }

      // 计算滚动进度
      const progress = Math.max(
        0,
        Math.min(1, (latest - SCROLL_CONFIG.start) / (SCROLL_CONFIG.end - SCROLL_CONFIG.start)),
      );

      // 使用 Spring 动画更新进度
      animate(smoothProgress, progress, {
        ...springPresets.microRebound,
        restDelta: 0.001,
        restSpeed: 0.01,
      });
    };

    const unsubscribe = scrollY.on('change', updateProgress);

    // 初始化
    updateProgress(scrollY.get());

    return unsubscribe;
  }, [scrollY, springPresets.microRebound, smoothProgress]);

  // 导航栏动画属性 - 添加更丰富的动画效果
  const borderRadius = useTransform(smoothProgress, [0, 1], [28, 24]);
  const paddingXValue = useTransform(smoothProgress, [0, 1], [20, 16]);
  // 添加微妙的 scale 变化，增强 Q弹 效果
  const scale = useTransform(smoothProgress, [0, 1], [1, 0.98]);

  // 页面信息显示状态 - 与导航栏收缩同步
  const [pageInfoShouldShow, setPageInfoShouldShow] = useState(false);

  // ==================== 页面信息动画系统 ====================
  // 统一的 Spring 配置 - 确保所有动画协调一致，符合物理运动规律
  // restDelta 和 restSpeed 设置为极小值，确保动画完全停止后才结束，避免抖动
  const unifiedSpringConfig = useMemo(
    () => ({
      ...springPresets.microRebound,
      restDelta: 0.001,
      restSpeed: 0.01,
    }),
    [springPresets.microRebound],
  );

  // 动画编排：使用三段式关键帧实现流畅的物理运动
  // 1️⃣ 导航链接先向左移动 (0 → 0.6 → 1) - 为页面信息让出空间
  const navLinksXRaw = useTransform(smoothProgress, [0, 0.6, 1], [0, -15, -18]);
  const navLinksX = useSpring(navLinksXRaw, unifiedSpringConfig);

  // 2️⃣ 页面信息宽度展开 (0 → 0.3 → 1) - 稍后展开，创造层次感
  const pageInfoWidthRaw = useTransform(smoothProgress, [0, 0.3, 1], [0, 200, 380]);
  const pageInfoWidth = useSpring(pageInfoWidthRaw, unifiedSpringConfig);

  // 3️⃣ 页面信息透明度渐显 (0 → 0.4 → 1) - 配合宽度展开
  const pageInfoOpacityRaw = useTransform(smoothProgress, [0, 0.4, 1], [0, 0.5, 1]);
  const pageInfoOpacity = useSpring(pageInfoOpacityRaw, unifiedSpringConfig);

  // 4️⃣ 页面信息纵向滑入 (0 → 0.5 → 1) - 最后从上到下出现，打造诗意效果
  const pageInfoYRaw = useTransform(smoothProgress, [0, 0.5, 1], [-12, -6, 0]);
  const pageInfoY = useSpring(pageInfoYRaw, unifiedSpringConfig);

  // 监听 smoothProgress 变化，同步显示/隐藏状态
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    // 路由切换时不更新状态，避免闪烁
    if (!isRouteChangingRef.current) {
      setPageInfoShouldShow(latest > 0.2);
    }
  });

  // ==================== 移动端菜单配置 ====================
  // 使用 useMemo 缓存菜单配置，避免不必要的重新计算
  const mobileMenuGroups = useMemo<MenuGroup[]>(() => {
    const baseGroups = getBaseMobileMenuGroups();
    if (!isLoggedIn) return baseGroups;

    return [
      ...baseGroups,
      {
        title: '用户中心',
        items: [{ path: '/profile', title: '个人中心', icon: FiUser }],
      },
    ];
  }, [isLoggedIn]);

  // ==================== 辅助函数 ====================

  /**
   * 检查路径是否在主导航菜单中（使用与 NavLinks 一致的匹配规则）
   */
  const isPathInMainNav = useCallback((path: string): boolean => {
    return defaultMainNavItems.some((item) => {
      // 首页需要精确匹配
      if (item.path === '/') {
        return path === '/';
      }

      // 其他路径使用包含匹配
      if (path.includes(item.path)) {
        return true;
      }

      // 检查子菜单
      if (item.children) {
        return item.children.some((child) => {
          // 子菜单也需要考虑首页的情况
          if (child.path === '/') {
            return path === '/';
          }
          return path.includes(child.path);
        });
      }

      return false;
    });
  }, []);

  /**
   * 重置主导航菜单到默认状态
   */
  const resetMainNavMenu = useCallback(() => {
    setMainNavItems(defaultMainNavItems);
    storage.local.remove(STORAGE_KEYS.SELECTED_MENU);
    setMoreDropdownOpen(false);
  }, []);

  // ==================== 回调函数 ====================

  /**
   * 处理下拉菜单项点击 - 替换父菜单
   */
  const handleDropdownItemClick = useCallback((item: MenuItem) => {
    const newMainNavItems = replaceMoreMenuItem(defaultMainNavItems, item);
    setMainNavItems(newMainNavItems);
    // 只保存 path，避免函数类型的 icon 被 JSON 序列化后丢失
    storage.local.set(STORAGE_KEYS.SELECTED_MENU, item.path);
    setMoreDropdownOpen(false);
  }, []);

  // 使用 useLayoutEffect 在浏览器绘制前同步执行，避免视觉闪烁
  useLayoutEffect(() => {
    const currentPath = location.pathname;

    // 标记路由正在切换（在所有状态更新之前设置）
    isRouteChangingRef.current = true;

    // 立即重置所有状态，确保在浏览器绘制前完成
    setPageInfoShouldShow(false);
    setInternalScrolled(false);

    // 立即重置动画进度为 0，强制所有基于 smoothProgress 的动画立即回到初始状态
    smoothProgress.set(0);

    // 如果当前路径不在主导航菜单中（如 /profile），重置主导航菜单
    if (!isPathInMainNav(currentPath)) {
      resetMainNavMenu();
    }

    // 延迟恢复，确保新页面完全渲染后才允许页面信息显示
    const timeoutId = setTimeout(() => {
      isRouteChangingRef.current = false;
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, isPathInMainNav, resetMainNavMenu]);

  // 监听滚动位置 - 优化性能，减少不必要的状态更新
  useEffect(() => {
    const currentScroll = window.scrollY;
    // 路由切换期间不更新滚动状态
    if (!isRouteChangingRef.current) {
      setInternalScrolled(scrolled !== undefined ? scrolled : currentScroll > 10);
    }

    const unsubscribe = scrollY.on('change', (latest) => {
      // 路由切换期间不更新滚动状态，避免闪烁
      if (isRouteChangingRef.current) {
        return;
      }

      // 只在状态真正需要改变时才更新，避免不必要的重渲染
      const shouldScroll = scrolled !== undefined ? scrolled : latest > 10;
      setInternalScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
    });

    return unsubscribe;
  }, [scrollY, scrolled]);

  // 点击外部关闭用户下拉菜单
  useClickOutside(userDropdownRef, () => setUserDropdownOpen(false), userDropdownOpen);

  // 鼠标聚光灯效果 - 使用 RAF 优化性能
  useEffect(() => {
    const navCard = navCardRef.current;
    if (!navCard || internalScrolled) return;

    let mouseX = 0;
    let mouseY = 0;
    let rafId: number | null = null;

    const updateSpotlight = () => {
      if (navCard) {
        navCard.style.setProperty('--spotlight-x', `${mouseX}px`);
        navCard.style.setProperty('--spotlight-y', `${mouseY}px`);
      }
      rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = navCard.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      if (!rafId) {
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    navCard.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      navCard.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [internalScrolled]);

  // ==================== 事件处理 ====================

  const handleLinkClick = useCallback(() => {
    // 点击普通菜单项时，重置主导航菜单到默认状态
    resetMainNavMenu();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [resetMainNavMenu]);

  const toggleUserDropdown = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUserDropdownOpen((prev) => !prev);
  }, []);

  const handleLogin = useCallback(() => {
    setLoginModalOpen(true);
    setUserDropdownOpen(false);
  }, []);

  const handleRegister = useCallback(() => {
    setRegisterModalOpen(true);
    setUserDropdownOpen(false);
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    handleLinkClick();
  }, [dispatch, handleLinkClick]);

  // ==================== 渲染 ====================

  return (
    <div className={`header ${internalScrolled ? 'scrolled' : ''}`}>
      <HeaderContainer scrolled={internalScrolled}>
        {/* Logo 和状态 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AnimatedLogo />
          <AppStatus />
        </div>

        {/* 桌面导航 */}
        <DesktopNavWrapper>
          <motion.div
            className="nav-card"
            ref={navCardRef}
            layout="position"
            transition={{
              layout: unifiedSpringConfig,
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius,
              paddingLeft: paddingXValue,
              paddingRight: paddingXValue,
              scale,
            }}
          >
            <div
              className="nav-card-inner"
              style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}
            >
              {/* 导航链接 - 向左移动为页面信息让出空间 */}
              <motion.div style={{ x: navLinksX, display: 'flex', alignItems: 'center' }}>
                <NavLinks
                  mainNavItems={mainNavItems}
                  onLinkClick={handleLinkClick}
                  moreDropdownOpen={moreDropdownOpen}
                  onDropdownOpen={() => setMoreDropdownOpen(true)}
                  onDropdownClose={() => setMoreDropdownOpen(false)}
                  onDropdownItemClick={handleDropdownItemClick}
                  dropdownRef={dropdownRef as React.RefObject<HTMLDivElement>}
                />
              </motion.div>

              {/* 桌面端页面信息 - 纵向滑入，宽度展开 */}
              {pageInfo && (pageInfo.title || pageInfo.tags) && pageInfoShouldShow && (
                <PageInfoContainer
                  layout={false}
                  style={{
                    opacity: pageInfoOpacity,
                    y: pageInfoY,
                    width: pageInfoWidth,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {pageInfo.title && <PageTitle>{pageInfo.title}</PageTitle>}
                    {pageInfo.subtitle && <PageSubtitle>{pageInfo.subtitle}</PageSubtitle>}
                  </div>

                  {pageInfo.tags && pageInfo.tags.length > 0 && (
                    <TagsContainer>
                      {pageInfo.tags.slice(0, 2).map((tag, index) => {
                        const { tagText, tagKey } = extractTagInfo(tag, index);
                        return (
                          <Tag key={tagKey}>
                            <FiTag />
                            {tagText}
                          </Tag>
                        );
                      })}
                      {pageInfo.tags.length > 2 && <Tag>+{pageInfo.tags.length - 2}</Tag>}
                    </TagsContainer>
                  )}
                </PageInfoContainer>
              )}

              {/* 主题切换和用户菜单 */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ThemeToggle />
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
          </motion.div>
        </DesktopNavWrapper>

        {/* 移动端按钮 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MobileAvatar onClick={toggleUserDropdown} hasImage={!!user?.avatar}>
            {isLoggedIn && user?.avatar && user.avatar.trim() ? (
              <LazyImage src={user.avatar} alt={user.username || '用户头像'} />
            ) : (
              <FiUser color="var(--text-secondary)" />
            )}
          </MobileAvatar>
          <MenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </MenuButton>
        </div>
      </HeaderContainer>

      {/* 移动端页面信息 */}
      <AnimatePresence>
        {pageInfo && (pageInfo.title || pageInfo.tags) && internalScrolled && (
          <MobilePageInfo
            key="mobile-page-info"
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={springPresets.smooth}
          >
            {pageInfo.title && (
              <MobilePageTitle>
                <FiBookOpen size={14} />
                {pageInfo.title}
              </MobilePageTitle>
            )}

            {pageInfo.subtitle && <MobilePageSubtitle>{pageInfo.subtitle}</MobilePageSubtitle>}

            {pageInfo.tags && pageInfo.tags.length > 0 && (
              <MobileTagsRow>
                {pageInfo.tags.slice(0, 3).map((tag, index) => {
                  const { tagText, tagKey } = extractTagInfo(tag, index);
                  return (
                    <MobileTag key={tagKey}>
                      <FiTag />
                      {tagText}
                    </MobileTag>
                  );
                })}
                {pageInfo.tags.length > 3 && <MobileTag>+{pageInfo.tags.length - 3}</MobileTag>}
              </MobileTagsRow>
            )}
          </MobilePageInfo>
        )}
      </AnimatePresence>

      {/* 移动端菜单 */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        scrolled={internalScrolled}
        menuGroups={mobileMenuGroups}
        accountItems={accountMenuItems}
        onLinkClick={handleLinkClick}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleLogout={handleLogout}
        themeToggle={<ThemeToggle />}
      />

      {/* 模态框 */}
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
