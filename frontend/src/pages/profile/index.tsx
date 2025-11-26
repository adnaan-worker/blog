import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationEngine, SPRING_PRESETS } from '@/utils/ui/animation';
import { SEO } from '@/components/common';
import { Button } from 'adnaan-ui';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';

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
  FiLogOut,
  FiGrid,
  FiActivity,
  FiSettings,
  FiBarChart2,
  FiZap,
  FiAlertCircle,
  FiTag,
  FiFolder,
  FiLayers,
  FiShield,
  FiHome,
} from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import { API } from '@/utils/api';
import type { UserProfile, UserStats, UserActivity, UserAchievement, SiteSettings } from '@/types';
import { storage } from '@/utils';
import { useModalScrollLock } from '@/hooks';
import {
  UserInfoCard,
  ActivityFeed,
  AchievementListModal,
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

const Card = styled.div`
  background: rgba(var(--bg-primary-rgb), 0.85);
  backdrop-filter: blur(20px);
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

// 仪表盘相关
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
    grid-column: span 12 !important;
  }
`;

const StatCardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  z-index: 1;
  color: var(--text-primary);
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;

  .icon-box {
    width: 48px;
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
  min-height: ${(props) => (props.height > 0 ? '8px' : '0')};
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

  // UI State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSiteSettingsLoading, setIsSiteSettingsLoading] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false); // Used for BottomSheet on mobile

  const { isAdmin, permissions } = useUserRole(user);

  const [activeTab, setActiveTab] = useState(() => {
    const savedActiveTab = storage.local.get<string>('profile_active_tab');
    return savedActiveTab || 'dashboard';
  });

  const [activitiesPage, setActivitiesPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
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

  // 数据加载
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const trendResponse = await API.user.getPublishTrend();
      const trendData = (trendResponse.data || []).map((item: any) => ({
        date: item.month,
        count: item.value,
      }));
      setPublishTrend(trendData);

      if (isAdmin) {
        const todoResponse = await API.user.getAdminTodoItems();
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
    }
  }, [user, isAdmin]);

  const loadUserProfile = async () => {
    setIsUserLoading(true);
    try {
      const response = await API.user.getProfile();
      setUser(response.data);
      syncGlobalUser(response.data);
    } catch (error) {
      console.error('加载用户资料失败:', error);
    } finally {
      setIsUserLoading(false);
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

  const loadUserStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await API.user.getStats();
      const statsWithIcons = response.data.map((stat: UserStats) => ({
        ...stat,
        icon: getStatIcon(stat.label),
      }));
      setUserStats(statsWithIcons);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

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

  const loadUserActivities = async (page = 1, append = false) => {
    if (page === 1) setIsActivitiesLoading(true);
    try {
      const response = await API.user.getActivities({ page, limit: 10 });
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
    } catch (error) {
      console.error('加载活动记录失败:', error);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const loadUserAchievements = async () => {
    try {
      const response = await API.user.getAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('加载成就数据失败:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await API.siteSettings.getSiteSettings();
      setSiteSettings(response.data);
    } catch (error) {}
  };

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
    loadUserActivities();
    loadUserAchievements();
    loadSiteSettings();
  }, []);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, loadDashboardData]);

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
      // adnaan.toast.success('个人资料更新成功！');
    } catch (error: any) {
      // adnaan.toast.error(error.message || '更新失败');
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
      // adnaan.toast.success('头像更新成功！');
    } catch (error: any) {
      // adnaan.toast.error(error.message || '头像上传失败');
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
      // adnaan.toast.error(error.message);
    } finally {
      setIsSiteSettingsLoading(false);
    }
  };

  const handleActivityClick = (activity: UserActivity | any) => {
    if (activity.link) navigate(activity.link);
  };

  const handleRefreshActivities = async () => {
    setIsRefreshing(true);
    try {
      await loadUserActivities(1, false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMoreActivities = async () => {
    if (hasMoreActivities && !isActivitiesLoading) {
      await loadUserActivities(activitiesPage + 1, true);
    }
  };

  // 渲染内容
  const renderTabContent = () => {
    const pageTransition: any = {
      initial: { opacity: 0, y: 20, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.98 },
      transition: { duration: 0.3, ease: 'easeInOut' },
    };

    // 移动端 Dashboard 简化视图
    if (activeTab === 'dashboard' && isMobile) {
      return (
        <DashboardSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {todoItems.length > 0 && (
            <Card style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <SectionHeader>
                <SectionTitle style={{ fontSize: '1rem' }}>
                  <FiAlertCircle /> 待办提醒
                </SectionTitle>
                <TodoBadge style={{ background: 'var(--accent-color)', color: 'white' }}>{todoItems.length}</TodoBadge>
              </SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {todoItems.slice(0, 3).map((item) => (
                  <TodoItem
                    key={item.id}
                    onClick={() => item.link && navigate(item.link)}
                    style={{ padding: '0.5rem 0', border: 'none' }}
                  >
                    <TodoContent>
                      <TodoTitle style={{ fontSize: '0.85rem' }}>{item.content}</TodoTitle>
                    </TodoContent>
                    <TodoBadge variant={item.priority === 'high' ? 'error' : 'primary'}>
                      {item.priority === 'high' ? '!' : '•'}
                    </TodoBadge>
                  </TodoItem>
                ))}
              </div>
            </Card>
          )}

          <SectionHeader>
            <SectionTitle style={{ fontSize: '1rem' }}>
              <FiActivity /> 最近动态
            </SectionTitle>
          </SectionHeader>
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '0.5rem',
              minHeight: '200px',
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
        </DashboardSection>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardGrid initial="hidden" animate="visible" variants={staggerContainerVariants}>
            {userStats.map((stat: any, index) => (
              <DashboardCard
                key={index}
                colSpan={3}
                variants={fadeInUpVariants}
                whileHover={{
                  y: -5,
                  boxShadow: '0 12px 40px -10px rgba(var(--accent-rgb), 0.15)',
                  borderColor: 'rgba(var(--accent-rgb), 0.3)',
                }}
              >
                <DecorCircle
                  color={`rgba(var(--accent-rgb), ${0.1 + index * 0.05})`}
                  size={120}
                  top="-30%"
                  right="-30%"
                />
                <StatCardContent>
                  <StatHeader>
                    <div
                      className="icon-box"
                      style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-color)' }}
                    >
                      {stat.icon || <FiZap />}
                    </div>
                    <div className="label" style={{ color: 'var(--text-secondary)' }}>
                      {stat.title || stat.label || '数据'}
                    </div>
                  </StatHeader>
                  <div>
                    <StatValue
                      style={{
                        color: 'var(--text-primary)',
                        filter: 'drop-shadow(0 0 1px rgba(var(--accent-rgb), 0.2))',
                      }}
                    >
                      {(stat.count !== undefined ? stat.count : stat.value) ?? '-'}
                    </StatValue>
                    {stat.trend && (
                      <StatTrend
                        isPositive={stat.trend.direction === 'up'}
                        style={{
                          background:
                            stat.trend.direction === 'up' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        }}
                      >
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

            <DashboardCard colSpan={8} rowSpan={2} variants={fadeInUpVariants}>
              <SectionHeader>
                <SectionTitle style={{ color: 'var(--text-primary)' }}>
                  <FiBarChart2 style={{ color: 'var(--accent-color)' }} /> 内容发布趋势
                </SectionTitle>
              </SectionHeader>
              {publishTrend.length > 0 ? (
                <ChartCard style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                  <Chart>
                    {publishTrend.map((item, index) => (
                      <ChartBar
                        key={index}
                        height={
                          item.count > 0
                            ? Math.max((item.count / Math.max(...publishTrend.map((d) => d.count), 1)) * 100, 5)
                            : 0
                        }
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        title={`${item.date}: ${item.count}篇`}
                        style={{
                          background:
                            'linear-gradient(180deg, var(--accent-color) 0%, rgba(var(--accent-rgb), 0.2) 100%)',
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    ))}
                  </Chart>
                  <ChartLabels>
                    {publishTrend.map((item, index) => (
                      <span key={index} style={{ color: 'var(--text-tertiary)' }}>
                        {item.date}
                      </span>
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

            <DashboardCard colSpan={4} rowSpan={2} variants={fadeInUpVariants}>
              <SectionHeader>
                <SectionTitle style={{ color: 'var(--text-primary)' }}>
                  <FiAlertCircle style={{ color: 'var(--accent-color)' }} /> 待办提醒
                </SectionTitle>
                {todoItems.length > 0 && (
                  <TodoBadge style={{ background: 'var(--accent-color)', color: 'white' }}>
                    {todoItems.length}
                  </TodoBadge>
                )}
              </SectionHeader>
              <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem', paddingRight: '0.5rem' }}>
                {todoItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {todoItems.map((item) => (
                      <TodoItem
                        key={item.id}
                        onClick={() => item.link && navigate(item.link)}
                        variants={cardVariants}
                        whileHover={{ x: 4, backgroundColor: 'rgba(var(--text-primary-rgb), 0.05)' }}
                        style={{
                          border: '1px solid rgba(var(--border-rgb), 0.1)',
                          borderRadius: '12px',
                          background: 'rgba(var(--bg-tertiary-rgb), 0.3)',
                        }}
                      >
                        <TodoContent>
                          <TodoTitle style={{ color: 'var(--text-primary)' }}>{item.content}</TodoTitle>
                          <TodoMeta style={{ color: 'var(--text-tertiary)' }}>{item.time}</TodoMeta>
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
                    <FiZap size={24} style={{ opacity: 0.5, color: 'var(--accent-color)' }} />
                    <span>所有事项已完成</span>
                  </div>
                )}
              </div>
            </DashboardCard>

            <DashboardCard
              colSpan={12}
              variants={fadeInUpVariants}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                boxShadow: 'none',
                backdropFilter: 'none',
                overflow: 'visible',
              }}
            >
              <div
                style={{
                  ['--card-bg' as any]: 'rgba(var(--bg-secondary-rgb), 0.4)',
                  ['--card-border' as any]: '1px solid rgba(var(--border-rgb), 0.1)',
                  ['--accent' as any]: 'var(--accent-color)',
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
            <CommonPage type="comments" />
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
              onSwitchTab={(tab) => setActiveTab(tab)}
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
