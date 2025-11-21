import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAnimationEngine, SPRING_PRESETS } from '@/utils/ui/animation';
import { SEO } from '@/components/common';
import { Button } from 'adnaan-ui';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';
import { useClickOutside } from '@/hooks';

// 动画关键帧
const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 高级动态背景
const PremiumBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background: linear-gradient(
    -45deg,
    var(--bg-primary),
    rgba(var(--bg-secondary-rgb), 0.5),
    rgba(var(--accent-rgb), 0.03),
    var(--bg-primary)
  );
  background-size: 400% 400%;
  animation: ${gradientFlow} 20s ease infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(var(--text-primary-rgb), 0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }
`;

// 抽屉动画变体 - 使用 Spring 系统
const drawerVariants = {
  left: {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        ...SPRING_PRESETS.stiff,
        opacity: { ...SPRING_PRESETS.stiff, damping: 50 },
      },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: SPRING_PRESETS.precise,
    },
  },
  right: {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        ...SPRING_PRESETS.stiff,
        opacity: { ...SPRING_PRESETS.stiff, damping: 50 },
      },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: SPRING_PRESETS.precise,
    },
  },
};

// 遮罩层动画变体 - 使用 Spring
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { ...SPRING_PRESETS.stiff, damping: 60 } },
  exit: { opacity: 0, transition: { ...SPRING_PRESETS.stiff, damping: 60 } },
};

import {
  FiFileText,
  FiHeart,
  FiEye,
  FiMessageSquare,
  FiUsers,
  FiBookmark,
  FiEdit,
  FiTrendingUp,
  FiX,
  FiXCircle,
  FiChevronsRight,
  FiChevronRight,
  FiChevronLeft,
  FiTrash2,
  FiLayers,
  FiZap,
  FiBarChart2,
  FiClock,
  FiAlertCircle,
  FiMenu,
  FiUser,
  FiSettings,
  FiLock,
  FiFolder,
  FiTag,
  FiShield,
  FiLogOut,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/api';
import type { UserProfile, UserStats, UserActivity, UserAchievement, SiteSettings } from '@/types';
import { storage } from '@/utils';
import { useModalScrollLock } from '@/hooks';
import {
  UserInfoCard,
  DataStatsGrid,
  ActivityFeed,
  QuickActions,
  AchievementBadges,
  AchievementListModal,
  EditProfileModal,
  NoteManagement,
  ArticleManagement,
  CommentManagement,
  BookmarkManagement,
  LikeManagement,
  NoteLikeManagement,
  SecuritySettings,
  SiteSettingsManagement,
  UserManagement,
  CategoryManagement,
  TagManagement,
  ProjectManagement,
  ProfileHero,
} from './modules';
import type { EditProfileForm } from './modules/types';
import { useUserRole } from '@/hooks/useUserRole';
import { useAppDispatch } from '@/store';
import { updateUser } from '@/store/modules/userSlice';

// ==================== 核心布局容器 (Bento Style) ====================

// 1. 全屏沉浸式容器
const ProfileWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
`;

// 2. 布局容器 (Spatial HUD Layout) - 两列布局优化
const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr; /* 再次加宽左侧 */
  gap: 2.5rem;
  max-width: 1800px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 8rem;
  min-height: 100vh;
  position: relative;
  z-index: 1;

  @media (max-width: 1200px) {
    grid-template-columns: 340px 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    padding-bottom: 7rem;
  }
`;

// 3. 左侧身份塔 (Identity Tower) - 视觉重构
const IdentityColumn = styled.div`
  position: sticky;
  top: 2rem;
  height: fit-content;
  max-height: calc(100vh - 4rem);
  z-index: 10;
  width: 100%;

  @media (max-width: 1024px) {
    position: relative;
    height: auto;
    top: 0;
    max-height: none;
  }
`;

// 统一身份卡片
const UnifiedIdentityCard = styled(motion.div)`
  position: relative;
  background: rgba(var(--bg-primary-rgb), 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  padding: 0; /* 移除 padding，由 ProfileHero 内部控制 */
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);

  /* 顶部装饰光 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, rgba(var(--accent-rgb), 0.08) 0%, transparent 100%);
    z-index: 0;
    pointer-events: none;
  }
`;

// 4. 中央舞台 (Active Stage)
const StageArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

// 6. 底部控制台 Dock (Control Dock) - 纯净版
const ControlDock = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) !important; /* 强制居中 */
  background: rgba(var(--bg-secondary-rgb), 0.4); /* 更通透的背景 */
  backdrop-filter: blur(24px) saturate(180%); /* 增强毛玻璃效果 */
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  z-index: 1000;
  width: auto;
  max-width: 90vw;

  /* 底部光效增强 */
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 15%;
    width: 70%;
    height: 15px;
    background: var(--accent-color);
    filter: blur(30px);
    opacity: 0.15;
    border-radius: 50%;
    z-index: -1;
  }

  @media (max-width: 768px) {
    bottom: 1.5rem;
    padding: 0.5rem;
    border-radius: 20px;
    overflow-x: auto;
    justify-content: flex-start; /* 移动端允许滚动 */

    /* 隐藏滚动条 */
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const DockSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.25rem;
`;

// 7. Dock 项目 - iOS 风格图标
const DockItem = styled(motion.button)<{ active?: boolean }>`
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 16px; /* 更圆润 */
  border: none;
  background: ${(props) => (props.active ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex-shrink: 0;

  /* 悬浮提示 Tooltip */
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    padding: 0.4rem 0.8rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s ease;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    transform: translateY(-8px) scale(1.15); /* 放大更多 */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    z-index: 10;

    /* 发光文字效果 */
    text-shadow: 0 0 15px var(--accent-color);

    &::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    transition: transform 0.3s ease;
  }
`;

// 高级卡片容器
const Card = styled.div`
  background: rgba(var(--bg-primary-rgb), 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-rgb), 0.5);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--accent-rgb), 0.3);
  }

  [data-theme='dark'] & {
    background: rgba(var(--bg-secondary-rgb), 0.4);
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.2),
      0 1px 0 rgba(255, 255, 255, 0.05) inset;

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
    }
  }
`;

// 标签页容器 - 透明化
const TabsContainer = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
  position: sticky;
  top: 70px; /* 吸顶位置 */
  z-index: 20;
  pointer-events: none; /* 让点击穿透到下方内容，除了TabsList */
`;

// 悬浮胶囊式 Tab 导航栏
const TabsList = styled.div`
  display: inline-flex;
  align-items: center;
  background: rgba(var(--bg-primary-rgb), 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 0.4rem;
  gap: 0.4rem;
  border-radius: 100px;
  border: 1px solid rgba(var(--border-rgb), 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  pointer-events: auto; /* 恢复点击 */

  overflow-x: auto;
  max-width: 100%;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 16px;
    padding: 0.5rem;
    margin: 0;
  }
`;

// 空状态容器
const EmptyTabsState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  gap: 0.75rem;
`;

const EmptyTabsIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.1) 0%, rgba(var(--accent-rgb), 0.05) 100%);
  color: var(--accent-color);

  svg {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;

const EmptyTabsText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const EmptyTabsTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
`;

const EmptyTabsHint = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 0.375rem;

  svg {
    flex-shrink: 0;
  }
`;

// 交互式 Tab 按钮
const TabButton = styled(motion.button)<{ active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  background: transparent;
  color: ${(props) => (props.active ? 'var(--bg-primary)' : 'var(--text-secondary)')};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 100px;
  transition: color 0.2s ease;
  white-space: nowrap;
  z-index: 1;
  outline: none;

  /* 图标样式 */
  svg {
    font-size: 1.1em;
  }

  &:hover {
    color: ${(props) => (props.active ? 'var(--bg-primary)' : 'var(--text-primary)')};
    background: ${(props) => (props.active ? 'transparent' : 'rgba(var(--text-primary-rgb), 0.05)')};
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    flex: 1;
  }
`;

// 选中态背景滑块
const ActiveTabBackground = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: var(--text-primary);
  border-radius: 100px;
  z-index: -1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--error-color-rgb), 0.2);
    color: var(--error-color);
  }
`;

const TabContent = styled.div`
  width: 100%;
  min-width: 0;
  min-height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
`;

// ==================== 移动端抽屉组件 ====================

// 抽屉遮罩
const DrawerOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  /* 移除 backdrop-filter 提升性能 */
  /* backdrop-filter: blur(4px); */

  /* GPU加速 */
  transform: translateZ(0);
  will-change: opacity;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  @media (min-width: 768px) {
    display: none;
  }
`;

// 抽屉容器
const Drawer = styled(motion.div)<{ position: 'left' | 'right' }>`
  position: fixed;
  top: 0;
  ${(props) => (props.position === 'left' ? 'left: 0;' : 'right: 0;')}
  bottom: 0;
  width: 85%;
  max-width: 340px;
  background: var(--bg-primary);
  box-shadow: ${(props) =>
    props.position === 'left' ? '4px 0 24px rgba(0, 0, 0, 0.15)' : '-4px 0 24px rgba(0, 0, 0, 0.15)'};
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  /* GPU加速优化 */
  transform: translateZ(0);
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;

  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }

  [data-theme='dark'] & {
    box-shadow: ${(props) =>
      props.position === 'left' ? '4px 0 24px rgba(0, 0, 0, 0.4)' : '-4px 0 24px rgba(0, 0, 0, 0.4)'};
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

// 抽屉头部
const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
`;

const DrawerTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--accent-color);
  }
`;

// 抽屉关闭按钮
const DrawerCloseButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }
`;

// 侧边箭头按钮（极简风格，只有箭头和光晕）
const SideArrowButton = styled(motion.button)<{ position: 'left' | 'right' }>`
  position: fixed;
  ${(props) => (props.position === 'left' ? 'left: 0;' : 'right: 0;')}
  top: 50%;
  transform: translateY(-50%);
  height: 4rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 998;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent; /* 禁用移动端点击高亮 */

  /* 圆弧光晕效果 - 增强版 */
  &::before {
    content: '';
    position: absolute;
    ${(props) => (props.position === 'left' ? 'left: 0;' : 'right: 0;')}
    top: 50%;
    transform: translateY(-50%);
    width: 3rem;
    height: 4rem;
    background: radial-gradient(
      ellipse ${(props) => (props.position === 'left' ? '120% 60% at 10% 50%' : '120% 60% at 90% 50%')},
      rgba(0, 0, 0, 0.08) 0%,
      rgba(0, 0, 0, 0.04) 30%,
      rgba(0, 0, 0, 0.02) 50%,
      transparent 80%
    );
    border-radius: ${(props) => (props.position === 'left' ? '0 60% 60% 0' : '60% 0 0 60%')};
    opacity: 1;
    transition: all 0.4s ease;
    pointer-events: none;
  }

  svg {
    font-size: 1.2rem;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  &:hover,
  &:active {
    color: var(--accent-color);

    &::before {
      width: 3.5rem;
      background: radial-gradient(
        ellipse ${(props) => (props.position === 'left' ? '120% 60% at 10% 50%' : '120% 60% at 90% 50%')},
        rgba(var(--accent-rgb), 0.15) 0%,
        rgba(var(--accent-rgb), 0.08) 30%,
        rgba(var(--accent-rgb), 0.04) 50%,
        transparent 80%
      );
    }

    svg {
      transform: ${(props) => (props.position === 'left' ? 'translateX(4px)' : 'translateX(-4px)')};
      filter: drop-shadow(0 2px 4px rgba(var(--accent-rgb), 0.3));
    }
  }

  &:active {
    transform: translateY(-50%) scale(0.92);

    svg {
      transform: ${(props) => (props.position === 'left' ? 'translateX(2px)' : 'translateX(-2px)')};
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

// 右键菜单
const ContextMenu = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 160px;
  z-index: 10000;

  [data-theme='dark'] & {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
`;

const ContextMenuItem = styled.div<{ danger?: boolean }>`
  padding: 0.625rem 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.875rem;
  color: ${(props) => (props.danger ? 'var(--error-color)' : 'var(--text-primary)')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props) => (props.danger ? 'rgba(var(--error-color-rgb), 0.1)' : 'var(--bg-secondary)')};
  }

  svg {
    flex-shrink: 0;
  }
`;

// 仪表盘样式
const DashboardContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: calc(100vh - 300px);
  padding-bottom: 2rem;
`;

const DashboardSection = styled(motion.section)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--accent-color);
  }
`;

const SectionLink = styled(motion.a)`
  font-size: 0.85rem;
  color: var(--accent-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// 图表相关
const ChartCard = styled(Card)`
  padding: 1.5rem;
`;

const Chart = styled.div`
  height: 120px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  margin-top: 1rem;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-color);
    opacity: 0.6;
  }
`;

const ChartBar = styled(motion.div)<{ height: number }>`
  width: 100%;
  min-height: ${(props) => (props.height > 0 ? '8px' : '0')}; /* 至少8px高度 */
  height: ${(props) => Math.max(props.height, props.height > 0 ? 5 : 0)}%;
  background: linear-gradient(180deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.6) 100%);
  border-radius: 4px 4px 0 0;
  opacity: 0.8;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    opacity: 1;
    transform: scaleY(1.05);
  }
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
`;

// 待办提醒
const TodoCard = styled(Card)`
  padding: 1.5rem;
`;

const TodoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const TodoItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &:hover {
    &::before {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  }

  &:last-child {
    border-bottom: none;
  }

  [data-theme='dark'] & {
    border-bottom-color: rgba(75, 85, 99, 0.3);
  }
`;

const TodoContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 1.2rem;
`;

const TodoTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const TodoMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
`;

const TodoBadge = styled.div<{ variant?: 'primary' | 'warning' | 'error' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    switch (props.variant) {
      case 'warning':
        return 'rgba(255, 193, 7, 0.1)';
      case 'error':
        return 'rgba(244, 67, 54, 0.1)';
      default:
        return 'rgba(var(--accent-rgb), 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case 'warning':
        return '#ff9800';
      case 'error':
        return 'var(--error-color)';
      default:
        return 'var(--accent-color)';
    }
  }};
`;

// ... (Controls Dock)

// ==================== 新版仪表盘样式 ====================

const DashboardGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  width: 100%;
`;

const DashboardCard = styled(motion.div)<{ colSpan?: number; rowSpan?: number }>`
  grid-column: span ${(props) => props.colSpan || 12};
  grid-row: span ${(props) => props.rowSpan || 1};
  background: rgba(var(--bg-secondary-rgb), 0.3);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* 悬浮光效 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.5), transparent);
    opacity: 0.5;
  }

  @media (max-width: 1200px) {
    grid-column: span 12 !important; /* 小屏全宽 */
  }
`;

const StatCardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  z-index: 1;
  color: var(--text-primary); /* 确保文字颜色 */
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左对齐 */
  gap: 1rem; /* 增加间距 */
  margin-bottom: 1.5rem;

  .icon-box {
    width: 48px; /* 加大图标框 */
    height: 48px;
    border-radius: 14px;
    background: rgba(var(--accent-rgb), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .label {
    font-size: 1rem;
    color: var(--text-secondary);
    font-weight: 600;
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.75rem;
  letter-spacing: -0.03em;
`;

const StatTrend = styled.div<{ isPositive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: ${(props) => (props.isPositive ? '#4caf50' : '#f44336')};
  background: ${(props) => (props.isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)')};
  padding: 0.25rem 0.5rem;
  border-radius: 100px;
  width: fit-content;
`;

// 装饰背景圆
const DecorCircle = styled.div<{ color?: string; size?: number; top?: string; right?: string }>`
  position: absolute;
  width: ${(props) => props.size || 200}px;
  height: ${(props) => props.size || 200}px;
  background: ${(props) => props.color || 'var(--accent-color)'};
  top: ${(props) => props.top || '-50%'};
  right: ${(props) => props.right || '-20%'};
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
`;

// Tab类型定义
interface Tab {
  id: string;
  label: string;
  closable: boolean;
}

interface TodoItemType {
  id: string;
  content: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const syncGlobalUser = useCallback(
    (profile: UserProfile) => {
      dispatch(
        updateUser({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          role: profile.role,
          status: profile.status,
          fullName: profile.fullName,
          bio: profile.bio,
          joinDate: profile.joinDate,
          lastLoginTime: profile.lastLoginTime,
        }),
      );
    },
    [dispatch],
  );

  const withCacheBust = useCallback((url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
  }, []);

  // 动画引擎
  const { variants } = useAnimationEngine();
  const fadeInUpVariants = variants.fadeIn;
  const staggerContainerVariants = variants.stagger;
  const cardVariants = variants.card;

  // 用户数据
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [publishTrend, setPublishTrend] = useState<{ date: string; count: number }[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItemType[]>([]);

  // 权限管理
  const { isAdmin, permissions } = useUserRole(user);

  // 状态管理
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSiteSettingsLoading, setIsSiteSettingsLoading] = useState(false);

  // Tab状态管理 - 从localStorage恢复
  const [activeTab, setActiveTab] = useState(() => {
    const savedActiveTab = storage.local.get<string>('profile_active_tab');
    return savedActiveTab || 'dashboard';
  });
  const [openTabs, setOpenTabs] = useState<Tab[]>(() => {
    const savedTabs = storage.local.get<Tab[]>('profile_open_tabs');
    const defaultTab = { id: 'dashboard', label: '🏠 仪表盘', closable: false };

    // 如果有保存的 tabs 且不为空，使用保存的
    if (savedTabs && savedTabs.length > 0) {
      return savedTabs;
    }

    // 否则使用权限中的 tabs，如果也为空，至少返回仪表盘
    return permissions.visibleTabs.length > 0 ? permissions.visibleTabs : [defaultTab];
  });

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  // 分页状态
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 移动端抽屉状态
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 关闭抽屉当切换tab时
  useEffect(() => {
    setLeftDrawerOpen(false);
    setRightDrawerOpen(false);
  }, [activeTab]);

  // 滚动锁定管理 - 统一管理所有弹窗和抽屉
  useModalScrollLock(isEditModalOpen || leftDrawerOpen || rightDrawerOpen);

  // 确保权限加载后至少有一个仪表盘 tab
  useEffect(() => {
    if (permissions.visibleTabs.length > 0 && openTabs.length === 0) {
      setOpenTabs(permissions.visibleTabs);
      setActiveTab('dashboard');
    }
  }, [permissions.visibleTabs]);

  // 保存tab状态到localStorage
  useEffect(() => {
    storage.local.set('profile_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    storage.local.set('profile_open_tabs', openTabs);
  }, [openTabs]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // 初始化数据
  useEffect(() => {
    loadUserProfile();
    loadUserStats();
    loadUserActivities();
    loadUserAchievements();
    loadSiteSettings();
  }, []);

  // 当用户信息加载完成后，加载仪表盘数据
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // 加载仪表盘数据
  const loadDashboardData = async () => {
    try {
      const trendResponse = await API.user.getPublishTrend();
      // 转换趋势数据
      const trendData = (trendResponse.data || []).map((item: any) => ({
        date: item.month,
        count: item.value,
      }));
      setPublishTrend(trendData);

      // 只有管理员才加载待办事项
      if (user && user.role === 'admin') {
        const todoResponse = await API.user.getAdminTodoItems();
        // 转换待办事项数据
        const todos = (todoResponse.data || []).map((item: any) => ({
          id: item.id,
          content: item.title || item.content,
          time: item.time || item.date,
          priority: item.priority || 'medium',
          link: item.link,
        }));
        setTodoItems(todos);
      } else {
        setTodoItems([]);
      }
    } catch (error: any) {
      console.error('加载仪表盘数据失败:', error);
      adnaan.toast.error('加载仪表盘数据失败');
    }
  };

  // 加载用户资料
  const loadUserProfile = async () => {
    setIsUserLoading(true);
    try {
      const response = await API.user.getProfile();
      setUser(response.data);
      syncGlobalUser(response.data);
    } catch (error: any) {
      console.error('加载用户资料失败:', error);
    } finally {
      setIsUserLoading(false);
    }
  };

  // 加载用户统计
  const loadUserStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await API.user.getStats();
      // 转换统计数据，添加图标
      const statsWithIcons = response.data.map((stat: UserStats) => ({
        ...stat,
        icon: getStatIcon(stat.label),
      }));
      setUserStats(statsWithIcons);
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // 加载用户活动
  const loadUserActivities = async (page = 1, append = false) => {
    if (page === 1) {
      setIsActivitiesLoading(true);
    }

    try {
      const response = await API.user.getActivities({
        page,
        limit: 10,
      });

      // 转换活动数据，添加图标
      const activitiesData = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
      const activitiesWithIcons = activitiesData.map((activity: any) => ({
        ...activity,
        icon: getActivityIcon(activity.type),
      }));

      if (append) {
        setActivities((prev) => [...prev, ...activitiesWithIcons]);
      } else {
        setActivities(activitiesWithIcons);
      }

      setHasMoreActivities(activitiesData.length === 10);
      setActivitiesPage(page);
    } catch (error: any) {
      console.error('加载活动记录失败:', error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  // 加载用户成就
  const loadUserAchievements = async () => {
    try {
      const response = await API.user.getAchievements();
      setAchievements(response.data);
    } catch (error: any) {
      console.error('加载成就数据失败:', error);
    }
  };

  // 加载网站设置
  const loadSiteSettings = async () => {
    try {
      const response = await API.siteSettings.getSiteSettings();
      setSiteSettings(response.data);
    } catch (error: any) {
      // 如果没有设置，不显示错误
      console.log('网站设置未配置');
    }
  };

  // 获取统计图标
  const getStatIcon = (label: string) => {
    switch (label) {
      case '发布文章':
        return <FiFileText />;
      case '总阅读量':
        return <FiEye />;
      case '获得点赞':
        return <FiHeart />;
      case '评论回复':
        return <FiMessageSquare />;
      case '关注者':
        return <FiUsers />;
      case '收藏数':
        return <FiBookmark />;
      default:
        return <FiEdit />;
    }
  };

  // 获取活动图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article_published':
        return <FiEdit />;
      case 'like_received':
        return <FiHeart />;
      case 'comment_received':
        return <FiMessageSquare />;
      case 'article_trending':
        return <FiTrendingUp />;
      case 'follow_received':
        return <FiUsers />;
      case 'achievement_unlocked':
        return <FiBookmark />;
      default:
        return <FiEdit />;
    }
  };

  // 处理函数
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (formData: EditProfileForm, avatarFile?: File) => {
    if (!user) return;

    setIsUserLoading(true);
    try {
      // 如果有新头像，先上传
      let avatarUrl = user.avatar;
      if (avatarFile) {
        const avatarResponse = await API.user.uploadAvatar(avatarFile);
        avatarUrl = withCacheBust(avatarResponse.data.data.url);
      }

      // 更新用户资料
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        bio: formData.bio,
      };

      const response = await API.user.updateProfile(updateData);

      // 更新本地状态
      const updatedUser: UserProfile = {
        ...user,
        ...response.data,
        avatar: avatarUrl,
      };
      setUser(updatedUser);
      syncGlobalUser(updatedUser);

      adnaan.toast.success('个人资料更新成功！');
      setIsEditModalOpen(false);
    } catch (error: any) {
      adnaan.toast.error(error.message || '更新失败，请重试');
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!user) return;

    setIsUserLoading(true);
    try {
      const response = await API.user.uploadAvatar(file);

      // 更新头像
      const updatedUser: UserProfile = {
        ...user,
        avatar: withCacheBust(response.data.data.url),
      };
      setUser(updatedUser);
      syncGlobalUser(updatedUser);

      adnaan.toast.success('头像更新成功！');
    } catch (error: any) {
      adnaan.toast.error(error.message || '头像上传失败，请重试');
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleStatClick = (stat: UserStats) => {
    if (stat.link) {
      navigate(stat.link);
    } else {
      // 根据统计项跳转到对应页面
      switch (stat.label) {
        case '发布文章':
          navigate('/user/articles');
          break;
        case '关注者':
          navigate('/user/followers');
          break;
        default:
          console.log('查看详细统计:', stat.label);
      }
    }
  };

  const handleActivityClick = (activity: UserActivity | any) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  const handleRefreshActivities = async () => {
    setIsRefreshing(true);
    try {
      await loadUserActivities(1, false);
      adnaan.toast.success('活动数据已更新');
    } catch (error) {
      adnaan.toast.error('刷新失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMoreActivities = async () => {
    if (hasMoreActivities && !isActivitiesLoading) {
      await loadUserActivities(activitiesPage + 1, true);
    }
  };

  // 统一的快捷操作处理
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'view-notes':
        addTab('notes', isAdmin ? '📝 手记管理' : '📝 我的手记');
        break;
      case 'view-articles':
        addTab('articles', isAdmin ? '📰 文章管理' : '📰 我的文章');
        break;
      case 'view-comments':
        addTab('comments', isAdmin ? '💬 评论管理' : '💬 我的评论');
        break;
      case 'view-likes':
        addTab('likes', '❤️ 文章点赞');
        break;
      case 'view-note-likes':
        addTab('note-likes', '💝 手记点赞');
        break;
      case 'view-bookmarks':
        addTab('bookmarks', '🔖 我的收藏');
        break;
      case 'view-security':
        addTab('security', '🔒 账户安全');
        break;
      case 'view-users':
        if (isAdmin) {
          addTab('users', '👥 用户管理');
        }
        break;
      case 'view-categories':
        if (isAdmin) {
          addTab('categories', '📂 分类管理');
        }
        break;
      case 'view-tags':
        if (isAdmin) {
          addTab('tags', '🏷️ 标签管理');
        }
        break;
      case 'view-projects':
        if (isAdmin) {
          addTab('projects', '💼 项目管理');
        }
        break;
      case 'edit-site-settings':
        addTab('site-settings', '⚙️ 网站设置');
        break;
      case 'logout':
        adnaan.confirm.confirm('退出登录', '确定要退出登录吗？').then((confirmed) => {
          if (!confirmed) return;
          API.user
            .logout()
            .then(() => {
              adnaan.toast.success('已退出登录');
              navigate('/');
            })
            .catch(() => {
              navigate('/');
            });
        });
        break;
      default:
        console.warn('未知的操作:', actionId);
    }
  };

  // 保存网站设置
  const handleSaveSiteSettings = async (settings: Partial<SiteSettings>) => {
    setIsSiteSettingsLoading(true);
    try {
      const response = await API.siteSettings.updateSiteSettings(settings);
      setSiteSettings(response.data);
      adnaan.toast.success('网站设置更新成功！');
      // 重新加载网站设置
      await loadSiteSettings();
    } catch (error: any) {
      adnaan.toast.error(error.message || '更新失败，请重试');
    } finally {
      setIsSiteSettingsLoading(false);
    }
  };

  const handleBadgeClick = (achievement: UserAchievement | any) => {
    adnaan.toast.info(`${achievement.name}: ${achievement.description}`);
  };

  const handleViewAllAchievements = () => {
    adnaan.modal.info({
      title: '🏆 所有成就',
      content: <AchievementListModal achievements={achievements} />,
      width: 700,
    });
  };

  // 标签页管理
  const addTab = (id: string, label: string, closable = true) => {
    // 检查标签页是否已存在
    if (openTabs.find((tab) => tab.id === id)) {
      setActiveTab(id);
      return;
    }

    setOpenTabs((prev) => [...prev, { id, label, closable }]);
    setActiveTab(id);
  };

  const closeTab = (tabId: string) => {
    const filteredTabs = openTabs.filter((tab) => tab.id !== tabId);

    // 确保至少保留仪表盘 tab
    if (filteredTabs.length === 0) {
      const dashboardTab = { id: 'dashboard', label: '🏠 仪表盘', closable: false };
      setOpenTabs([dashboardTab]);
      setActiveTab('dashboard');
      return;
    }

    setOpenTabs(filteredTabs);

    // 如果关闭的是当前活动标签页，切换到第一个标签页
    if (activeTab === tabId) {
      setActiveTab(filteredTabs[0].id);
    }
  };

  // 右键菜单处理
  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId,
    });
  };

  const handleCloseCurrentTab = () => {
    if (contextMenu) {
      closeTab(contextMenu.tabId);
      setContextMenu(null);
    }
  };

  const handleCloseOtherTabs = () => {
    if (contextMenu) {
      const targetTab = openTabs.find((tab) => tab.id === contextMenu.tabId);
      if (targetTab) {
        // 保留不可关闭的tab和当前右键的tab
        setOpenTabs(openTabs.filter((tab) => !tab.closable || tab.id === contextMenu.tabId));
        setActiveTab(contextMenu.tabId);
      }
      setContextMenu(null);
    }
  };

  const handleCloseRightTabs = () => {
    if (contextMenu) {
      const currentIndex = openTabs.findIndex((tab) => tab.id === contextMenu.tabId);
      if (currentIndex !== -1) {
        // 保留当前tab及其左侧的所有tab，以及不可关闭的tab
        setOpenTabs(openTabs.filter((tab, index) => index <= currentIndex || !tab.closable));
      }
      setContextMenu(null);
    }
  };

  const handleCloseAllTabs = () => {
    // 只保留不可关闭的tab（仪表盘）
    const unclosableTabs = openTabs.filter((tab) => !tab.closable);

    // 如果没有不可关闭的 tab，至少保留仪表盘
    if (unclosableTabs.length === 0) {
      const dashboardTab = { id: 'dashboard', label: '🏠 仪表盘', closable: false };
      setOpenTabs([dashboardTab]);
    } else {
      setOpenTabs(unclosableTabs);
    }

    // 切换到仪表盘
    setActiveTab('dashboard');
    setContextMenu(null);
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardGrid initial="hidden" animate="visible" variants={staggerContainerVariants}>
            {/* 1. 关键指标卡片 */}
            {userStats.map((stat, index) => (
              <DashboardCard
                key={index}
                colSpan={3}
                variants={fadeInUpVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <DecorCircle color={stat.color} size={100} top="-20%" right="-20%" />
                <StatCardContent>
                  <StatHeader>
                    <div className="icon-box">{stat.icon}</div>
                    <div className="label">{stat.label}</div>
                  </StatHeader>
                  <div>
                    <StatValue>{stat.value}</StatValue>
                    {stat.trend && (
                      <StatTrend isPositive={stat.trend.direction === 'up'}>
                        <FiTrendingUp
                          style={{ transform: stat.trend.direction === 'down' ? 'rotate(180deg)' : 'none' }}
                        />
                        {stat.trend.percentage}% 较上月
                      </StatTrend>
                    )}
                  </div>
                </StatCardContent>
              </DashboardCard>
            ))}

            {/* 2. 数据趋势图表 */}
            <DashboardCard colSpan={8} rowSpan={2} variants={fadeInUpVariants}>
              <SectionHeader>
                <SectionTitle>
                  <FiBarChart2 /> 内容发布趋势
                </SectionTitle>
              </SectionHeader>
              {publishTrend.length > 0 ? (
                <ChartCard style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                  <Chart>
                    {publishTrend.map((item, index) => {
                      const maxValue = Math.max(...publishTrend.map((d) => d.count), 1);
                      const heightPercent = item.count > 0 ? Math.max((item.count / maxValue) * 100, 5) : 0;
                      return (
                        <ChartBar
                          key={index}
                          height={heightPercent}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          title={`${item.date}: ${item.count}篇`}
                          style={{
                            background:
                              'linear-gradient(180deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.2) 100%)',
                          }}
                        />
                      );
                    })}
                  </Chart>
                  <ChartLabels>
                    {publishTrend.map((item, index) => (
                      <span key={index}>{item.date}</span>
                    ))}
                  </ChartLabels>
                </ChartCard>
              ) : (
                <div
                  style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  暂无数据
                </div>
              )}
            </DashboardCard>

            {/* 3. 待办事项 */}
            <DashboardCard colSpan={4} rowSpan={2} variants={fadeInUpVariants}>
              <SectionHeader>
                <SectionTitle>
                  <FiAlertCircle /> 待办提醒
                </SectionTitle>
                {todoItems.length > 0 && <TodoBadge>{todoItems.length}</TodoBadge>}
              </SectionHeader>

              <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem', paddingRight: '0.5rem' }}>
                {todoItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {todoItems.map((item) => (
                      <TodoItem
                        key={item.id}
                        onClick={() => item.link && navigate(item.link)}
                        variants={cardVariants}
                        whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                      >
                        <TodoContent>
                          <TodoTitle>{item.content}</TodoTitle>
                          <TodoMeta>{item.time}</TodoMeta>
                        </TodoContent>
                        <TodoBadge variant={item.priority === 'high' ? 'error' : 'primary'}>
                          {item.priority === 'high' ? '高' : '待办'}
                        </TodoBadge>
                      </TodoItem>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <FiZap size={24} style={{ opacity: 0.5 }} />
                    <span>太棒了，所有事项已完成！</span>
                  </div>
                )}
              </div>
            </DashboardCard>

            {/* 4. 最近动态 */}
            <DashboardCard
              colSpan={12}
              variants={fadeInUpVariants}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                boxShadow: 'none',
                backdropFilter: 'none',
                overflow: 'visible', // 允许内容溢出
              }}
            >
              {/* 尝试通过样式穿透隐藏 ActivityFeed 内部的标题，如果它有特定的类名 */}
              <div
                style={{
                  // 这里可以加一些 CSS 变量或者样式来影响子组件
                  ['--card-bg' as any]: 'rgba(var(--bg-secondary-rgb), 0.3)',
                  ['--card-border' as any]: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <ActivityFeed
                  activities={activities as any}
                  onActivityClick={handleActivityClick}
                  onRefresh={handleRefreshActivities}
                  onLoadMore={handleLoadMoreActivities}
                  hasMore={hasMoreActivities}
                  isLoading={isActivitiesLoading}
                  isRefreshing={isRefreshing}
                />
              </div>
            </DashboardCard>
          </DashboardGrid>
        );

      case 'notes':
        return <NoteManagement />;

      case 'articles':
        return <ArticleManagement />;

      case 'comments':
        return <CommentManagement isAdmin={isAdmin} />;

      case 'likes':
        return <LikeManagement />;

      case 'note-likes':
        return <NoteLikeManagement />;

      case 'bookmarks':
        return <BookmarkManagement />;

      case 'security':
        return <SecuritySettings />;

      case 'site-settings':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <SiteSettingsManagement
            settings={siteSettings}
            onSave={handleSaveSiteSettings}
            isLoading={isSiteSettingsLoading}
          />
        );

      case 'users':
        if (!isAdmin) return <div>无权限访问</div>;
        return <UserManagement />;

      case 'categories':
        if (!isAdmin) return <div>无权限访问</div>;
        return <CategoryManagement />;

      case 'tags':
        if (!isAdmin) return <div>无权限访问</div>;
        return <TagManagement />;

      case 'projects':
        if (!isAdmin) return <div>无权限访问</div>;
        return <ProjectManagement />;

      default:
        return <div>页面未找到</div>;
    }
  };

  // 获取快捷操作图标 (增强匹配)
  const getQuickActionIcon = (actionId: string, label: string, defaultIcon: string) => {
    // 优先匹配 ID
    switch (actionId) {
      case 'view-articles':
        return <FiFileText />;
      case 'view-notes':
        return <FiEdit />;
      case 'view-comments':
        return <FiMessageSquare />;
      case 'view-users':
        return <FiUsers />;
      case 'view-tags':
        return <FiTag />;
      case 'view-categories':
        return <FiFolder />;
      case 'view-projects':
        return <FiLayers />;
      case 'edit-site-settings':
        return <FiSettings />;
      case 'view-security':
        return <FiShield />;
      case 'logout':
        return <FiLogOut />;
    }

    // 最后的 fallback
    return <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{defaultIcon}</span>;
  };

  // 动作到 Tab ID 的映射，用于 Dock 高亮
  const ACTION_TO_TAB_MAP: Record<string, string> = {
    'view-articles': 'articles',
    'view-notes': 'notes',
    'view-comments': 'comments',
    'view-users': 'users',
    'view-tags': 'tags',
    'view-categories': 'categories',
    'view-projects': 'projects',
    'edit-site-settings': 'site-settings',
    'view-security': 'security',
  };

  return (
    <>
      <SEO
        title={PAGE_SEO_CONFIG.profile.title}
        description={PAGE_SEO_CONFIG.profile.description}
        keywords={PAGE_SEO_CONFIG.profile.keywords}
        type="profile"
        index={false}
        follow={false}
      />
      <ProfileWrapper>
        <LayoutContainer>
          {/* 1. 左侧身份塔 (Identity Tower) - 一体化设计 */}
          <IdentityColumn>
            {user && (
              <UnifiedIdentityCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* 个人资料区 - 集成了成就展示 */}
                <ProfileHero
                  user={user}
                  achievements={achievements}
                  onEditProfile={() => setIsEditModalOpen(true)}
                  onAvatarChange={handleAvatarChange}
                  isLoading={isUserLoading}
                />
              </UnifiedIdentityCard>
            )}
          </IdentityColumn>

          {/* 2. 中央舞台 (Active Stage) */}
          <StageArea>
            {/* 动态内容区 - 完全由 activeTab 控制 */}
            <TabContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  style={{ width: '100%', minHeight: 'inherit' }}
                >
                  {activeTab === 'dashboard' ? (
                    renderTabContent()
                  ) : (
                    <Card style={{ minHeight: '600px' }}>{renderTabContent()}</Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabContent>
          </StageArea>
        </LayoutContainer>

        {/* 4. 底部控制台 Dock (Control Dock) */}
        {!isMobile && (
          <ControlDock
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, ...SPRING_PRESETS.bouncy }}
          >
            {/* 仪表盘 (Home) */}
            <DockItem
              onClick={() => setActiveTab('dashboard')}
              active={activeTab === 'dashboard'}
              data-tooltip="仪表盘"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiBarChart2 />
            </DockItem>

            <DockSeparator />

            {/* 快捷操作区 */}
            {permissions.quickActions.map((action) => {
              // 判断是否激活：当前 Tab 等于该动作映射的 Tab
              const isActive = activeTab === ACTION_TO_TAB_MAP[action.action];

              return (
                <DockItem
                  key={action.id}
                  onClick={() => handleQuickAction(action.action)}
                  active={isActive}
                  data-tooltip={action.label}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {getQuickActionIcon(action.action, action.label, action.icon)}

                  {/* 激活指示点 */}
                  {isActive && (
                    <motion.div
                      layoutId="dock-active-dot"
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--accent-color)',
                      }}
                    />
                  )}
                </DockItem>
              );
            })}

            {/* 退出登录按钮 (如果 quickActions 里没有，可以单独加，但目前看来 permissions 里应该会有) */}
          </ControlDock>
        )}

        {/* 弹窗和移动端抽屉保持不变 ... */}
        {user && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            user={user}
            onClose={handleCloseEditModal}
            onSave={handleSaveProfile}
            isLoading={isUserLoading}
          />
        )}

        {/* 移动端适配逻辑... (保持原有逻辑，稍作调整以适应新结构) */}
        {isMobile && (
          <>
            {/* 移动端底部导航栏 (替代 Dock) */}
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'var(--bg-primary)',
                borderTop: '1px solid var(--border-color)',
                padding: '0.5rem',
                display: 'flex',
                justifyContent: 'space-around',
                zIndex: 100,
              }}
            >
              <Button variant="ghost" onClick={() => setLeftDrawerOpen(true)}>
                <FiUser />
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>
                <FiBarChart2 />
              </Button>
              {permissions.quickActions.length > 0 && (
                <Button
                  variant="primary"
                  size="small"
                  style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }}
                  onClick={() => setRightDrawerOpen(true)}
                >
                  <FiZap />
                </Button>
              )}
            </div>

            {/* 移动端抽屉... */}
            <AnimatePresence>
              {leftDrawerOpen && (
                <>
                  <DrawerOverlay onClick={() => setLeftDrawerOpen(false)} />
                  <Drawer position="left" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
                    <DrawerHeader>
                      <DrawerTitle>个人资料</DrawerTitle>
                      <FiX onClick={() => setLeftDrawerOpen(false)} />
                    </DrawerHeader>
                    {user && (
                      <UserInfoCard
                        user={user}
                        onEditProfile={() => setIsEditModalOpen(true)}
                        onAvatarChange={handleAvatarChange}
                      />
                    )}
                  </Drawer>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {rightDrawerOpen && (
                <>
                  <DrawerOverlay onClick={() => setRightDrawerOpen(false)} />
                  <Drawer position="right" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
                    <DrawerHeader>
                      <DrawerTitle>快捷操作</DrawerTitle>
                      <FiX onClick={() => setRightDrawerOpen(false)} />
                    </DrawerHeader>
                    <QuickActions
                      onAction={(action) => {
                        setRightDrawerOpen(false);
                        handleQuickAction(action);
                      }}
                      actions={permissions.quickActions}
                    />
                  </Drawer>
                </>
              )}
            </AnimatePresence>
          </>
        )}

        {/* 右键菜单 */}
        {contextMenu && (
          <ContextMenu x={contextMenu.x} y={contextMenu.y}>
            {openTabs.find((tab) => tab.id === contextMenu.tabId)?.closable && (
              <ContextMenuItem onClick={handleCloseCurrentTab}>
                <FiX size={14} />
                关闭当前标签
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={handleCloseOtherTabs}>
              <FiXCircle size={14} />
              关闭其他标签
            </ContextMenuItem>
            <ContextMenuItem danger onClick={handleCloseAllTabs}>
              <FiTrash2 size={14} />
              关闭所有标签
            </ContextMenuItem>
          </ContextMenu>
        )}
      </ProfileWrapper>
    </>
  );
};

export default Profile;
