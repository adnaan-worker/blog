import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationEngine, SPRING_PRESETS } from '@/utils/ui/animation';
import { SEO } from '@/components/common';
import { Button, Input } from 'adnaan-ui';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';

import {
  FiEdit,
  FiHeart,
  FiMessageSquare,
  FiTrendingUp,
  FiUsers,
  FiBookmark,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiFolder,
  FiGithub,
  FiExternalLink,
  FiCalendar,
  FiStar,
  FiEye,
  FiThumbsUp,
  FiMessageCircle,
  FiBarChart2,
  FiTrendingDown,
  FiCode,
  FiTag,
  FiEdit3,
  FiTrash2,
  FiLayers,
  FiSettings,
  FiShield,
  FiLogOut,
  FiCheck,
  FiHome,
  FiX,
} from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/api';
import type { UserProfile, UserStats, UserActivity, UserAchievement, SiteSettings, Project } from '@/types';
import { storage } from '@/utils';
import { useModalScrollLock } from '@/hooks';
import {
  EditProfileModal,
  CommonPage,
  ProfileHero,
  SecuritySettings,
  SiteSettingsManagement,
  MobileProfileHeader,
} from './modules';
import type { EditProfileForm } from './modules/types';
import { useUserRole } from '@/hooks/useUserRole';
import { useAppDispatch } from '@/store';
import { updateUser } from '@/store/modules/userSlice';

// 动作到 Tab ID 的映射
const ACTION_TO_TAB_MAP: Record<string, string> = {
  'view-articles': 'articles',
  'view-notes': 'notes',
  'view-comments': 'comments',
  'view-guestbook': 'guestbook',
  'view-friends': 'friends',
  'view-users': 'users',
  'view-tags': 'tags',
  'view-categories': 'categories',
  'view-projects': 'projects',
  'edit-site-settings': 'site-settings',
  'view-security': 'security',
};

// 获取快捷操作图标
const getQuickActionIcon = (actionId: string, defaultIcon: string) => {
  switch (actionId) {
    case 'view-likes':
      return <FiHeart />;
    case 'view-note-likes':
      return <FiHeart />;
    case 'view-bookmarks':
      return <FiBookmark />;
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
    case 'view-guestbook':
      return <FiMessageCircle />;
    case 'view-friends':
      return <FiUsers />;
    case 'edit-site-settings':
      return <FiSettings />;
    case 'view-security':
      return <FiShield />;
    case 'logout':
      return <FiLogOut />;
    default:
      return <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{defaultIcon}</span>;
  }
};

// ==================== 样式组件 ====================

const ProfileWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
`;

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2.5rem;
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 8rem;
  min-height: 100vh;
  position: relative;
  z-index: 1;

  @media (max-width: 1200px) {
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    padding-bottom: 7rem;
  }
`;

const IdentityColumn = styled.div`
  position: sticky;
  top: 2rem;
  height: fit-content;
  max-height: calc(100vh - 4rem);
  z-index: 10;
  width: 100%;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const UnifiedIdentityCard = styled(motion.div)`
  position: relative;
  background: rgba(var(--bg-primary-rgb), 0.6);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);

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

const StageArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

const ControlDock = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) !important;
  background: rgba(var(--bg-secondary-rgb), 0.4);
  backdrop-filter: blur(24px) saturate(180%);
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
    display: none;
  }
`;

const DockSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.25rem;
`;

const DockItem = styled(motion.button)<{ active?: boolean }>`
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 16px;
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
    transform: translateY(-8px) scale(1.15);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    z-index: 10;
    text-shadow: 0 0 15px var(--accent-color);

    &::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;

const TabContent = styled.div`
  width: 100%;
  min-width: 0;
  min-height: calc(100vh - 300px);
  display: flex;
  flex-direction: column;
`;

// 底部弹出面板 (Bottom Sheet)
const BottomSheet = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;

  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    opacity: 0.5;
  }
`;

const BottomSheetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem 1rem;
  margin-top: 1.5rem;
`;

const BottomSheetItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  .icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 20px;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  span {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  &:active {
    transform: scale(0.95);
    .icon-wrapper {
      background: var(--bg-tertiary);
    }
  }
`;

const DrawerOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

// ==================== 仪表盘新布局 (Enterprise Glass) ====================

const DashboardLayout = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

// 分组卡片 (Grouped Card) - 对应 "业务核心数据"
const GroupedCard = styled(motion.div)`
  background: rgba(var(--bg-secondary-rgb), 0.4);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);

  /* 顶部光效 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.5), transparent);
    opacity: 0.6;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const GroupTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--accent-color);
  }
`;

// 核心数据三列布局
const DataOverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 2rem;
  align-items: stretch;

  @media (max-width: 1400px) {
    grid-template-columns: 1fr 1fr;
    /* 环形图在窄屏下可能需要单独一行或隐藏 */
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// 左侧：关键指标 (Key Metrics)
const MetricBox = styled.div`
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.05) 0%, rgba(var(--accent-rgb), 0.01) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(var(--accent-rgb), 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  position: relative;

  /* 装饰图标背景 */
  &::after {
    content: '';
    position: absolute;
    right: -10px;
    bottom: -10px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  font-family: var(--font-code); /* 使用数字字体 */
`;

const MetricTrend = styled.div<{ isPositive: boolean }>`
  font-size: 0.8rem;
  color: ${(props) => (props.isPositive ? '#10b981' : '#ef4444')};
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
`;

// 中间：简单柱状图 (Simple Bar Chart)
const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
  padding-top: 1rem;
`;

const BarChartTitle = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
`;

const BarsRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 12px;
`;

const BarColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
`;

const Bar = styled(motion.div)<{ height: number; color?: string }>`
  width: 100%;
  max-width: 24px;
  height: ${(props) => props.height}%;
  background: ${(props) => props.color || 'var(--accent-color)'};
  border-radius: 6px 6px 0 0;
  opacity: 0.8;
  position: relative;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const BarLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
`;

// 右侧：环形图 (Donut Chart)
const DonutChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 180px;
`;

const DonutLegend = styled.div`
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: ${(props) => props.color};
  }
`;

// 侧边栏列表 (Side List) - 对应 "审批"
const SideListCard = styled(GroupedCard)`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: fit-content;
`;

const SideListHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SideListItem = styled(motion.div)`
  padding: 1rem 1.5rem;
  padding-left: 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.05);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  /* 时间轴连接线 */
  &::before {
    content: '';
    position: absolute;
    left: 2.25rem;
    top: 3.5rem;
    bottom: -1rem;
    width: 2px;
    background: rgba(var(--border-rgb), 0.15);
  }

  &:last-child {
    border-bottom: none;
    &::before {
      display: none;
    }
  }

  &:hover {
    background: rgba(var(--bg-secondary-rgb), 0.5);
    transform: translateX(4px);
  }
`;

const ItemAvatar = styled.div<{ src?: string; iconColor?: string; iconBg?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) =>
    props.src ? `url(${props.src}) center/cover` : props.iconBg || 'rgba(var(--accent-rgb), 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.iconColor || 'var(--accent-color)'};
  flex-shrink: 0;
  font-size: 1.1rem;
  border: 2px solid var(--bg-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 2;
  position: relative;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitleText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
`;

const ItemDesc = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  .highlight {
    color: var(--accent-color);
    font-weight: 600;
  }

  .action {
    color: var(--text-secondary);
    font-weight: 400;
  }
`;

const ItemTime = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
`;

// 项目表格行 (Project Row)
const ProjectRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 100px 120px 100px 1fr;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.05);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ProjectName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusTag = styled.span<{ status: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.status) {
      case 'active':
        return 'background: rgba(16, 185, 129, 0.1); color: #10b981;';
      case 'pending':
        return 'background: rgba(245, 158, 11, 0.1); color: #f59e0b;';
      default:
        return 'background: rgba(107, 114, 128, 0.1); color: #6b7280;';
    }
  }}
`;

const ContentGlassCard = styled(motion.div)`
  background: rgba(var(--bg-secondary-rgb), 0.4);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  padding: 2rem;
  min-height: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(var(--accent-rgb), 0.5),
      var(--accent-color),
      rgba(var(--accent-rgb), 0.5),
      transparent
    );
    opacity: 0.6;
  }

  h1,
  h2,
  h3 {
    color: var(--text-primary);
  }
  p,
  span {
    color: var(--text-secondary);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--accent-rgb), 0.2);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--accent-rgb), 0.4);
  }
`;

// 类型定义
interface TodoItemType {
  id: string;
  content: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
  action?: string;
  count?: number;
  type?: string;
}

// ==================== 主组件 ====================

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

  const { variants } = useAnimationEngine();
  const fadeInUpVariants = variants.fadeIn;
  const staggerContainerVariants = variants.stagger;
  const cardVariants = variants.card;

  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [publishTrend, setPublishTrend] = useState<{ date: string; count: number }[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItemType[]>([]);
  const [commentStatusFilter, setCommentStatusFilter] = useState<string | undefined>(undefined);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [categoryStats, setCategoryStats] = useState<{ name: string; value: number; color: string }[]>([]);

  // UI State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isSiteSettingsLoading, setIsSiteSettingsLoading] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false); // Used for BottomSheet on mobile

  const { isAdmin, permissions } = useUserRole(user);

  const [activeTab, setActiveTab] = useState(() => {
    const savedActiveTab = storage.local.get<string>('profile_active_tab');
    return savedActiveTab || 'dashboard';
  });

  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Tab 切换时关闭抽屉
  useEffect(() => {
    setRightDrawerOpen(false);
  }, [activeTab]);

  useModalScrollLock(isEditModalOpen || rightDrawerOpen);

  useEffect(() => {
    storage.local.set('profile_active_tab', activeTab);
  }, [activeTab]);

  // 统一 Dashboard 数据加载
  const loadDashboard = useCallback(async () => {
    setIsUserLoading(true);

    try {
      const response = await API.user.getDashboard();
      const data: any = response.data;

      // 用户基础信息
      if (data.user) {
        setUser(data.user);
        syncGlobalUser(data.user);
      }

      // 核心统计卡片
      const statsArray = (data.stats || []) as UserStats[];
      const statsWithIcons = statsArray.map((stat: UserStats) => ({
        ...stat,
        icon: getStatIcon(stat.label),
      }));
      setUserStats(statsWithIcons);

      // 发布趋势 -> 柱状图
      const trendData = (data.publishTrend || []).map((item: any) => ({
        date: item.month,
        count: item.value,
      }));
      setPublishTrend(trendData);

      // 最近活动（仅用于右侧列表，取前若干条）
      const activitiesData = (data.activities || []) as any[];
      const activitiesWithConfig = activitiesData.map((activity: any) => {
        const config = getActivityConfig(activity.type);
        return {
          ...activity,
          content: stripHtml(activity.description) || activity.title,
          createdAt: activity.timestamp,
          icon: config.icon,
          iconColor: config.color,
          iconBg: config.bg,
        };
      });
      setActivities(activitiesWithConfig);

      // 成就列表（用于头像卡片徽章）
      setAchievements((data.achievements || []) as any);

      // 分类占比 -> 环形图
      const rawCategoryStats = (data.categoryStats || []) as Array<{ name: string; value: number }>;
      const sorted = [...rawCategoryStats].sort((a, b) => b.value - a.value);
      const top = sorted.slice(0, 4);
      const colors = ['var(--accent-color)', '#10b981', '#f59e0b', '#6366f1', 'rgba(var(--border-rgb), 0.3)'];

      const coloredTop = top.map((item, index) => ({
        name: item.name,
        value: item.value,
        color: colors[index % colors.length],
      }));

      const totalCount = rawCategoryStats.reduce((sum, item) => sum + item.value, 0);
      const topCount = top.reduce((sum, item) => sum + item.value, 0);
      if (totalCount > topCount) {
        coloredTop.push({ name: '其他', value: totalCount - topCount, color: colors[4] });
      }
      setCategoryStats(coloredTop);

      // 最近项目
      setRecentProjects((data.recentProjects || []) as Project[]);

      // 待办事项 / 审批
      const todoSource = (data.todoItems || []) as Array<{
        id: string;
        title: string;
        count: number;
        type?: string;
        priority?: 'high' | 'medium' | 'low';
        action?: string;
      }>;
      const todos: TodoItemType[] = todoSource.map((item) => ({
        id: item.id,
        content: item.title,
        count: item.count,
        type: item.type,
        priority: item.priority || 'medium',
        action: item.action,
        time: '',
      }));
      setTodoItems(todos);
    } catch (error: any) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setIsUserLoading(false);
    }
  }, [syncGlobalUser]);

  const handleTodoClick = (item: TodoItemType) => {
    if (item.action === 'view-pending-comments') {
      setCommentStatusFilter('pending');
      setActiveTab('comments');
      return;
    }

    if (item.action === 'view-draft-posts') {
      setActiveTab('articles');
      return;
    }

    if (item.link) {
      navigate(item.link);
    }
  };

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

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'comment_created':
        return {
          icon: <FiMessageSquare />,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)',
        };
      case 'note_created':
        return {
          icon: <FiEdit3 />,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
        };
      case 'note_updated':
        return {
          icon: <FiEdit3 />,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
        };
      case 'post_created':
        return {
          icon: <FiFileText />,
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.1)',
        };
      case 'post_updated':
        return {
          icon: <FiFileText />,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
        };
      case 'post_deleted':
        return {
          icon: <FiTrash2 />,
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
        };
      case 'article_published':
        return {
          icon: <FiFileText />,
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.1)',
        };
      case 'like_received':
        return {
          icon: <FiHeart />,
          color: '#ec4899',
          bg: 'rgba(236, 72, 153, 0.1)',
        };
      case 'comment_received':
        return {
          icon: <FiMessageSquare />,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.1)',
        };
      case 'article_trending':
        return {
          icon: <FiTrendingUp />,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
        };
      case 'follow_received':
        return {
          icon: <FiUsers />,
          color: '#6366f1',
          bg: 'rgba(99, 102, 241, 0.1)',
        };
      case 'achievement_unlocked':
        return {
          icon: <FiBookmark />,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
        };
      default:
        return {
          icon: <FiActivity />,
          color: 'var(--accent-color)',
          bg: 'var(--accent-color-alpha)',
        };
    }
  };

  // 去除HTML标签
  const stripHtml = (html?: string) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // 格式化活动标题
  const formatActivityTitle = (activity: any) => {
    const { type, title, metadata } = activity;

    switch (type) {
      case 'comment_created':
        return (
          <>
            在文章 <span className="highlight">《{metadata?.postTitle || title}》</span>{' '}
            <span className="action">发表了评论</span>
          </>
        );
      case 'note_created':
        return (
          <>
            发布了手记 <span className="highlight">《{title}》</span>
          </>
        );
      case 'note_updated':
        return (
          <>
            更新了手记 <span className="highlight">《{title}》</span>
          </>
        );
      case 'post_created':
        return (
          <>
            发布了文章 <span className="highlight">《{title}》</span>
          </>
        );
      case 'post_updated':
        return (
          <>
            更新了文章 <span className="highlight">《{title}》</span>
          </>
        );
      case 'post_deleted':
        return (
          <>
            删除了文章 <span className="highlight">《{metadata?.postTitle || title}》</span>
          </>
        );
      default:
        return activity.content || title;
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await API.siteSettings.getSiteSettings();
      setSiteSettings(response.data);
    } catch (error) {}
  };

  useEffect(() => {
    loadDashboard();
    loadSiteSettings();
  }, [loadDashboard]);

  // Actions
  const handleSaveProfile = async (formData: EditProfileForm, avatarFile?: File) => {
    if (!user) return;
    setIsUserLoading(true);
    try {
      let avatarUrl = user.avatar;
      if (avatarFile) {
        const avatarResponse = await API.user.uploadAvatar(avatarFile);
        avatarUrl = withCacheBust(avatarResponse.data.data.url);
      }
      const updateData = { fullName: formData.fullName, email: formData.email, bio: formData.bio };
      const response = await API.user.updateProfile(updateData);
      const updatedUser: UserProfile = { ...user, ...response.data, avatar: avatarUrl };
      setUser(updatedUser);
      syncGlobalUser(updatedUser);
      setIsEditModalOpen(false);
    } catch (error: any) {
      // Error handling
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!user) return;
    setIsUserLoading(true);
    try {
      const response = await API.user.uploadAvatar(file);
      const updatedUser: UserProfile = { ...user, avatar: withCacheBust(response.data.data.url) };
      setUser(updatedUser);
      syncGlobalUser(updatedUser);
    } catch (error: any) {
      // Error handling
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'view-notes':
        setActiveTab('notes');
        break;
      case 'view-articles':
        setActiveTab('articles');
        break;
      case 'view-comments':
        setActiveTab('comments');
        break;
      case 'view-guestbook':
        if (isAdmin) setActiveTab('guestbook');
        break;
      case 'view-friends':
        if (isAdmin) setActiveTab('friends');
        break;
      case 'view-likes':
        setActiveTab('likes');
        break;
      case 'view-note-likes':
        setActiveTab('note-likes');
        break;
      case 'view-bookmarks':
        setActiveTab('bookmarks');
        break;
      case 'view-security':
        setActiveTab('security');
        break;
      case 'view-users':
        if (isAdmin) setActiveTab('users');
        break;
      case 'view-categories':
        if (isAdmin) setActiveTab('categories');
        break;
      case 'view-tags':
        if (isAdmin) setActiveTab('tags');
        break;
      case 'view-projects':
        if (isAdmin) setActiveTab('projects');
        break;
      case 'edit-site-settings':
        setActiveTab('site-settings');
        break;
      case 'logout':
        if (window.confirm('确定要退出登录吗？')) {
          API.user
            .logout()
            .then(() => navigate('/'))
            .catch(() => navigate('/'));
        }
        break;
      default:
        console.warn('未知的操作:', actionId);
    }
  };

  const handleSaveSiteSettings = async (settings: Partial<SiteSettings>) => {
    setIsSiteSettingsLoading(true);
    try {
      const response = await API.siteSettings.updateSiteSettings(settings);
      setSiteSettings(response.data);
      await loadSiteSettings();
    } catch (error: any) {
      // Error handling
    } finally {
      setIsSiteSettingsLoading(false);
    }
  };

  const handleActivityClick = (activity: UserActivity | any) => {
    if (activity.link) navigate(activity.link);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 渲染内容
  const renderTabContent = () => {
    const pageTransition: any = {
      initial: { opacity: 0, y: 20, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.98 },
      transition: { duration: 0.3, ease: 'easeInOut' },
    };

    // 仪表盘视图 (Enterprise Glass)
    if (activeTab === 'dashboard') {
      return (
        <DashboardLayout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <MainColumn>
            {/* 核心数据概览 */}
            <GroupedCard>
              <GroupHeader>
                <GroupTitle>
                  <FiBarChart2 /> 业务核心数据
                </GroupTitle>
                <Button variant="secondary" size="small" style={{ fontSize: '0.8rem' }}>
                  查看详情
                </Button>
              </GroupHeader>

              <DataOverviewGrid>
                {/* 1. 关键指标 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <MetricBox>
                    <MetricLabel>总阅读量</MetricLabel>
                    <MetricValue>{userStats.find((s) => s.label === '总阅读量')?.value || 0}</MetricValue>
                    {/* 后端仅提供了文章和评论的趋势，阅读量暂无趋势数据 */}
                    <div style={{ height: '1.2em' }}></div>
                  </MetricBox>
                  <MetricBox>
                    <MetricLabel>总互动数</MetricLabel>
                    <MetricValue>
                      {parseInt(String(userStats.find((s) => s.label === '获得点赞')?.value || 0)) +
                        parseInt(String(userStats.find((s) => s.label === '评论回复')?.value || 0))}
                    </MetricValue>
                    {/* 尝试显示评论的趋势作为参考 */}
                    {userStats.find((s) => s.label === '评论回复')?.trend ? (
                      <MetricTrend
                        isPositive={userStats.find((s) => s.label === '评论回复')?.trend?.direction === 'up'}
                      >
                        <FiTrendingUp /> 评论环比 {userStats.find((s) => s.label === '评论回复')?.trend?.percentage}%
                      </MetricTrend>
                    ) : (
                      <div style={{ height: '1.2em' }}></div>
                    )}
                  </MetricBox>
                </div>

                {/* 2. 发布趋势 (柱状图) */}
                <BarChartContainer>
                  <BarChartTitle>近6个月发布趋势</BarChartTitle>
                  <BarsRow>
                    {publishTrend.length > 0 ? (
                      publishTrend.slice(-6).map((item, i) => {
                        const maxVal = Math.max(...publishTrend.map((d) => d.count), 1); // 避免除以0
                        const height = (item.count / maxVal) * 100;
                        return (
                          <BarColumn key={i}>
                            <Bar
                              height={height}
                              initial={{ height: 0 }}
                              animate={{ height: height + '%' }}
                              transition={{ delay: i * 0.1, duration: 0.5 }}
                              data-tooltip={`${item.count} 篇`}
                            />
                            <BarLabel>{item.date}</BarLabel>
                          </BarColumn>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          color: 'var(--text-tertiary)',
                          alignSelf: 'center',
                        }}
                      >
                        暂无数据
                      </div>
                    )}
                  </BarsRow>
                </BarChartContainer>

                {/* 3. 内容分布 (环形图) */}
                <DonutChartContainer>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(var(--border-rgb), 0.1)" strokeWidth="12" />
                    {/* 模拟数据段 */}
                    {categoryStats.length > 0 ? (
                      categoryStats.map((item, i) => {
                        const total = categoryStats.reduce((acc, cur) => acc + cur.value, 0);
                        const percentage = (item.value / total) * 100;
                        const dashArray = 2 * Math.PI * 70; // 周长
                        const strokeDasharray = `${(percentage / 100) * dashArray} ${dashArray}`;

                        // 计算偏移量: 前面所有项的百分比之和
                        const prevPercentage =
                          categoryStats.slice(0, i).reduce((acc, cur) => acc + cur.value, 0) / total;
                        const strokeDashoffset = -prevPercentage * dashArray;

                        return (
                          <motion.circle
                            key={item.name}
                            cx="80"
                            cy="80"
                            r="70"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="12"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="butt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.2, duration: 0.5 }}
                            transform="rotate(-90 80 80)"
                          />
                        );
                      })
                    ) : (
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="rgba(var(--border-rgb), 0.05)"
                        strokeWidth="12"
                      />
                    )}
                    <text x="80" y="75" textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
                      总文章
                    </text>
                    <text x="80" y="100" textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="bold">
                      {userStats.find((s) => s.label === '发布文章')?.value || 0}
                    </text>
                  </svg>
                  <DonutLegend>
                    {categoryStats.map((item, i) => (
                      <LegendItem key={i} color={item.color}>
                        {item.name} (
                        {Math.round((item.value / (categoryStats.reduce((a, b) => a + b.value, 0) || 1)) * 100)}%)
                      </LegendItem>
                    ))}
                    {categoryStats.length === 0 && (
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>暂无分类数据</div>
                    )}
                  </DonutLegend>
                </DonutChartContainer>
              </DataOverviewGrid>
            </GroupedCard>

            {/* 项目/任务管理 */}
            <GroupedCard>
              <GroupHeader>
                <GroupTitle>
                  <FiLayers /> 重点项目
                </GroupTitle>
                <Button variant="secondary" size="small" onClick={() => setActiveTab('projects')}>
                  管理项目
                </Button>
              </GroupHeader>

              <div style={{ padding: '0.5rem 0' }}>
                <ProjectRow
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-tertiary)',
                    borderBottom: 'none',
                    paddingBottom: '0.5rem',
                  }}
                >
                  <div>项目名称</div>
                  <div>可见性</div>
                  <div>创建时间</div>
                  <div>状态</div>
                  <div>操作</div>
                </ProjectRow>

                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <ProjectRow key={project.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <ProjectName>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'rgba(var(--accent-rgb), 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-color)',
                          }}
                        >
                          <FiFolder size={16} />
                        </div>
                        {project.title}
                      </ProjectName>
                      <span
                        style={{
                          background: project.visibility === 'public' ? '#eff6ff' : '#fff7ed',
                          color: project.visibility === 'public' ? '#1d4ed8' : '#c2410c',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {project.visibility === 'public' ? '公开' : '私密'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {formatTime(project.createdAt)}
                      </span>
                      <StatusTag status={project.status}>
                        {project.status === 'active'
                          ? '进行中'
                          : project.status === 'developing'
                            ? '开发中'
                            : project.status === 'paused'
                              ? '暂停'
                              : '已归档'}
                      </StatusTag>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => window.open(project.demoUrl || project.githubUrl, '_blank')}
                        >
                          查看
                        </Button>
                      </div>
                    </ProjectRow>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    暂无项目，快去创建一个吧！
                  </div>
                )}
              </div>
            </GroupedCard>
          </MainColumn>

          <SideColumn>
            {/* 待办事项 / 审批 */}
            <SideListCard>
              <SideListHeader>
                <GroupTitle style={{ fontSize: '1rem' }}>
                  <FiCheck /> 待办事项
                </GroupTitle>
                <Button variant="ghost" size="small" style={{ color: 'var(--accent-color)' }}>
                  查看全部
                </Button>
              </SideListHeader>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid rgba(var(--border-rgb), 0.05)',
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {todoItems.reduce((acc, item) => acc + (item.count || 0), 0)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>待处理</span>
                </div>
                <div style={{ width: 1, height: 30, background: 'rgba(var(--border-rgb), 0.1)' }}></div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>0</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>已完成</span>
                </div>
              </div>

              {todoItems.length > 0 ? (
                todoItems.map((item) => (
                  <SideListItem key={item.id} onClick={() => handleTodoClick(item)}>
                    <ItemAvatar
                      style={{
                        background:
                          item.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--accent-rgb), 0.1)',
                        color: item.priority === 'high' ? '#ef4444' : 'var(--accent-color)',
                      }}
                    >
                      {item.id === 'pending-posts' ? <FiFileText /> : <FiMessageSquare />}
                    </ItemAvatar>
                    <ItemInfo style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.content}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {item.priority === 'high' ? '需立即处理' : '待处理'}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'white',
                          background: item.priority === 'high' ? '#ef4444' : 'var(--accent-color)',
                          padding: '2px 8px',
                          borderRadius: 12,
                          minWidth: '24px',
                          textAlign: 'center',
                        }}
                      >
                        {item.count}
                      </div>
                    </ItemInfo>
                  </SideListItem>
                ))
              ) : (
                <div
                  style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}
                >
                  暂无待办事项
                </div>
              )}
            </SideListCard>

            {/* 最近动态 */}
            <SideListCard>
              <SideListHeader>
                <GroupTitle style={{ fontSize: '1rem' }}>
                  <FiActivity /> 最近动态
                </GroupTitle>
              </SideListHeader>
              {activities.slice(0, 6).map((activity: any, i) => (
                <SideListItem key={i} onClick={() => handleActivityClick(activity)}>
                  <ItemAvatar iconColor={activity.iconColor} iconBg={activity.iconBg}>
                    {activity.icon || <FiActivity />}
                  </ItemAvatar>
                  <ItemInfo>
                    <ItemDesc>{formatActivityTitle(activity)}</ItemDesc>
                    <ItemTime>{formatTime(activity.createdAt)}</ItemTime>
                  </ItemInfo>
                </SideListItem>
              ))}
            </SideListCard>
          </SideColumn>
        </DashboardLayout>
      );
    }

    switch (activeTab) {
      case 'notes':
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="notes" />
          </ContentGlassCard>
        );
      case 'articles':
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="articles" />
          </ContentGlassCard>
        );
      case 'comments':
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="comments" initialStatusFilter={commentStatusFilter} />
          </ContentGlassCard>
        );
      case 'guestbook':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="guestbook" />
          </ContentGlassCard>
        );
      case 'likes':
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="likes" />
          </ContentGlassCard>
        );
      case 'note-likes':
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="likes" />
          </ContentGlassCard>
        );
      case 'bookmarks':
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="bookmarks" />
          </ContentGlassCard>
        );
      case 'security':
        return (
          <ContentGlassCard {...pageTransition}>
            <SecuritySettings />
          </ContentGlassCard>
        );
      case 'site-settings':
        return (
          <ContentGlassCard {...pageTransition}>
            <SiteSettingsManagement
              settings={siteSettings}
              onSave={handleSaveSiteSettings}
              isLoading={isSiteSettingsLoading}
            />
          </ContentGlassCard>
        );
      case 'projects':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="projects" />
          </ContentGlassCard>
        );
      case 'friends':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="friends" />
          </ContentGlassCard>
        );
      case 'users':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="users" />
          </ContentGlassCard>
        );
      case 'categories':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="categories" />
          </ContentGlassCard>
        );
      case 'tags':
        if (!isAdmin) return <div>无权限访问</div>;
        return (
          <ContentGlassCard {...pageTransition}>
            <CommonPage type="tags" />
          </ContentGlassCard>
        );
      default:
        return <div>页面未找到</div>;
    }
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
          <IdentityColumn>
            {user && (
              <UnifiedIdentityCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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

          <StageArea>
            <MobileProfileHeader
              user={user}
              stats={userStats}
              onEdit={() => setIsEditModalOpen(true)}
              onSwitchTab={(tab: React.SetStateAction<string>) => setActiveTab(tab)}
              onOpenQuickActions={() => setRightDrawerOpen(true)}
              activeTab={activeTab}
              isAdmin={isAdmin}
            />

            <TabContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ width: '100%', minHeight: 'inherit' }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </TabContent>
          </StageArea>
        </LayoutContainer>

        {!isMobile && (
          <ControlDock
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, ...SPRING_PRESETS.bouncy }}
          >
            <DockItem
              onClick={() => navigate('/')}
              active={false}
              data-tooltip="返回首页"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiHome />
            </DockItem>
            <DockSeparator />
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
            {permissions.quickActions.map((action) => {
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
                  {getQuickActionIcon(action.action, action.icon)}
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
          </ControlDock>
        )}

        {user && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            user={user}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
            isLoading={isUserLoading}
          />
        )}

        <AnimatePresence>
          {rightDrawerOpen && (
            <>
              <DrawerOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRightDrawerOpen(false)}
              />
              <BottomSheet
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    功能导航
                  </h3>
                  <div
                    onClick={() => setRightDrawerOpen(false)}
                    style={{
                      padding: '8px',
                      borderRadius: '50%',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FiX size={18} color="var(--text-secondary)" />
                  </div>
                </div>

                <BottomSheetGrid>
                  {permissions.quickActions.map((action) => (
                    <BottomSheetItem
                      key={action.id}
                      onClick={() => {
                        setRightDrawerOpen(false);
                        handleQuickAction(action.action);
                      }}
                    >
                      <div className="icon-wrapper">{getQuickActionIcon(action.action, action.icon)}</div>
                      <span>{action.label}</span>
                    </BottomSheetItem>
                  ))}
                </BottomSheetGrid>
              </BottomSheet>
            </>
          )}
        </AnimatePresence>
      </ProfileWrapper>
    </>
  );
};

export default Profile;
