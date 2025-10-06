import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
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
  FiTrash2,
  FiLayers,
  FiZap,
  FiBarChart2,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API, UserProfile, UserStats, UserActivity, UserAchievement, SiteSettings } from '@/utils/api';
import { storage } from '@/utils';
import {
  UserInfoCard,
  DataStatsGrid,
  ActivityFeed,
  QuickActions,
  AchievementBadges,
  EditProfileModal,
  EditSiteSettingsModal,
  NoteManagement,
  ArticleManagement,
  CommentManagement,
  BookmarkManagement,
  LikeManagement,
} from '@/components/profile';
import type { EditProfileForm } from '@/components/profile/types';
import { useUserRole } from '@/hooks/useUserRole';

const ProfileContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  min-height: calc(100vh - 120px);

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

// 新的现代布局
const ModernLayout = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  position: relative;
  isolation: isolate;

  @media (min-width: 768px) {
    grid-template-columns: 320px 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 320px 1fr 280px;
  }
`;

// 左侧用户卡片区域 - 页面滚动时吸顶
const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 80px; /* header高度 + 一点间距 */
  align-self: start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;

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

  @media (max-width: 767px) {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
`;

// 主内容区域 - 正常流动
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  min-height: 600px;
`;

// 右侧快捷操作区域 - 页面滚动时吸顶
const QuickActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 80px; /* header高度 + 一点间距 */
  align-self: start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;

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

  @media (max-width: 1199px) {
    display: none;
  }
`;

// 移动端快捷操作（在主内容顶部显示）
const MobileQuickActions = styled.div`
  display: block;
  margin-bottom: 1.5rem;

  @media (min-width: 1200px) {
    display: none;
  }
`;

// 卡片容器
const Card = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  [data-theme='dark'] & {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

// 标签页容器
const TabsContainer = styled(Card)`
  margin-bottom: 0;
  min-width: 0; /* 允许容器收缩 */
  width: 100%; /* 占满父容器宽度 */
`;

const TabsList = styled.div`
  display: flex;
  background: var(--bg-secondary);
  padding: 0.5rem;
  gap: 0.25rem;
  border-radius: 8px;
  margin: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  width: calc(100% - 2rem); /* 减去左右margin */
  min-width: 0; /* 允许收缩 */
  min-height: 50px; /* 保持最小高度 */

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  /* 滚动条悬浮时显示 */
  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
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
  background: linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.1) 0%, rgba(var(--accent-color-rgb), 0.05) 100%);
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

const TabButton = styled.button<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  background: ${(props) => (props.active ? 'var(--bg-primary)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--text-primary)' : 'var(--text-secondary)')};
  font-size: 0.875rem;
  font-weight: ${(props) => (props.active ? '600' : '500')};
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) => (props.active ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none')};
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
  max-width: 180px;
  position: relative;
  user-select: none;

  /* 活动tab底部指示条 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(${(props) => (props.active ? '1' : '0')});
    width: calc(100% - 1rem);
    height: 2px;
    background: var(--accent-color);
    border-radius: 2px 2px 0 0;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Tab标签文本溢出处理 */
  > span:first-of-type {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  &:hover {
    background: ${(props) => (props.active ? 'var(--bg-primary)' : 'rgba(var(--accent-color-rgb), 0.08)')};
    color: var(--text-primary);

    &::after {
      transform: translateX(-50%) scaleX(${(props) => (props.active ? '1' : '0.5')});
    }
  }

  &:active {
    transform: scale(0.98);
  }

  [data-theme='dark'] & {
    box-shadow: ${(props) => (props.active ? '0 1px 3px rgba(0, 0, 0, 0.2)' : 'none')};
  }
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
  padding: 0;
  width: 100%;
  min-width: 0;
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
  height: ${(props) => props.height}%;
  background: linear-gradient(180deg, var(--accent-color) 0%, rgba(var(--accent-color-rgb), 0.6) 100%);
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
        return 'rgba(var(--accent-color-rgb), 0.1)';
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);

  svg {
    font-size: 3rem;
    opacity: 0.3;
    margin-bottom: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;

// 动画变体定义
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

// Tab类型定义
interface Tab {
  id: string;
  label: string;
  closable: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // 用户数据
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // 权限管理
  const { isAdmin, permissions } = useUserRole(user);

  // 状态管理
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSiteSettingsModalOpen, setIsEditSiteSettingsModalOpen] = useState(false);
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
    return savedTabs || permissions.visibleTabs;
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

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // 加载用户资料
  const loadUserProfile = async () => {
    setIsUserLoading(true);
    try {
      const response = await API.user.getProfile();
      setUser(response.data);
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
        pageSize: 10,
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
        avatarUrl = avatarResponse.data.avatar;
      }

      // 更新用户资料
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        bio: formData.bio,
      };

      const response = await API.user.updateProfile(updateData);

      // 更新本地状态
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...response.data,
              avatar: avatarUrl,
            }
          : null,
      );

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
      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatar: response.data.avatar,
            }
          : null,
      );

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
        addTab('likes', '❤️ 我的点赞');
        break;
      case 'view-bookmarks':
        addTab('bookmarks', '🔖 我的收藏');
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
      case 'edit-site-settings':
        setIsEditSiteSettingsModalOpen(true);
        break;
      case 'logout':
        adnaan.confirm('确定要退出登录吗？').then((confirmed) => {
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
      setIsEditSiteSettingsModalOpen(false);
    } catch (error: any) {
      adnaan.toast.error(error.message || '更新失败，请重试');
    } finally {
      setIsSiteSettingsLoading(false);
    }
  };

  const handleBadgeClick = (achievement: UserAchievement | any) => {
    adnaan.toast.info(`${achievement.name}: ${achievement.description}`);
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
    setOpenTabs(filteredTabs);

    // 如果关闭的是当前活动标签页，切换到第一个标签页
    if (activeTab === tabId && filteredTabs.length > 0) {
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
    setOpenTabs(unclosableTabs);
    // 切换到仪表盘
    setActiveTab('dashboard');
    setContextMenu(null);
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // 模拟图表数据
        const chartData = [
          { month: '05月', value: 35 },
          { month: '06月', value: 42 },
          { month: '07月', value: 55 },
          { month: '08月', value: 48 },
          { month: '09月', value: 68 },
          { month: '10月', value: 75 },
        ];

        // 模拟待办事项
        const todoItems = [
          { id: 1, title: '待审核文章', count: 3, type: 'warning', action: () => addTab('articles', '📰 文章管理') },
          { id: 2, title: '未读评论', count: 12, type: 'primary', action: () => addTab('comments', '💬 评论管理') },
        ];

        return (
          <DashboardContainer initial="hidden" animate="visible" variants={staggerContainerVariants}>
            {/* 数据统计 */}
            <DataStatsGrid stats={userStats} onStatClick={handleStatClick} isLoading={isStatsLoading} />

            {/* 待办提醒 - 只对管理员显示 */}
            {isAdmin && todoItems.length > 0 && (
              <DashboardSection variants={fadeInUpVariants}>
                <SectionHeader>
                  <SectionTitle>
                    <FiAlertCircle />
                    待办提醒
                  </SectionTitle>
                </SectionHeader>
                <TodoCard>
                  <TodoList>
                    {todoItems.map((item) => (
                      <TodoItem key={item.id} onClick={item.action} variants={cardVariants} whileHover={{ x: 2 }}>
                        <TodoContent>
                          <TodoTitle>{item.title}</TodoTitle>
                          <TodoMeta>需要处理</TodoMeta>
                        </TodoContent>
                        <TodoBadge variant={item.type as any}>{item.count} 项</TodoBadge>
                      </TodoItem>
                    ))}
                  </TodoList>
                </TodoCard>
              </DashboardSection>
            )}

            {/* 数据趋势图表 */}
            <DashboardSection variants={fadeInUpVariants}>
              <SectionHeader>
                <SectionTitle>
                  <FiBarChart2 />
                  内容发布趋势
                </SectionTitle>
              </SectionHeader>
              <ChartCard>
                <Chart>
                  {chartData.map((item, index) => (
                    <ChartBar
                      key={index}
                      height={item.value}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.05,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                      title={`${item.month}: ${item.value}篇`}
                    />
                  ))}
                </Chart>
                <ChartLabels>
                  {chartData.map((item, index) => (
                    <span key={index}>{item.month}</span>
                  ))}
                </ChartLabels>
              </ChartCard>
            </DashboardSection>

            {/* 最近活动 */}
            <DashboardSection variants={fadeInUpVariants}>
              <SectionHeader>
                <SectionTitle>
                  <FiClock />
                  最近动态
                </SectionTitle>
              </SectionHeader>
              <ActivityFeed
                activities={activities}
                onActivityClick={handleActivityClick}
                onRefresh={handleRefreshActivities}
                onLoadMore={handleLoadMoreActivities}
                hasMore={hasMoreActivities}
                isLoading={isActivitiesLoading}
                isRefreshing={isRefreshing}
              />
            </DashboardSection>

            {/* 移动端显示成就徽章 */}
            {isMobile && (
              <DashboardSection variants={fadeInUpVariants}>
                <SectionHeader>
                  <SectionTitle>成就徽章</SectionTitle>
                </SectionHeader>
                <Card>
                  <AchievementBadges achievements={achievements} onBadgeClick={handleBadgeClick} maxDisplay={6} />
                </Card>
              </DashboardSection>
            )}
          </DashboardContainer>
        );

      case 'notes':
        return <NoteManagement />;

      case 'articles':
        return <ArticleManagement />;

      case 'comments':
        return <CommentManagement isAdmin={isAdmin} />;

      case 'likes':
        return <LikeManagement />;

      case 'bookmarks':
        return <BookmarkManagement />;

      case 'users':
        if (!isAdmin) return <div>无权限访问</div>;
        return <div>用户管理功能正在开发中...</div>;

      case 'categories':
        if (!isAdmin) return <div>无权限访问</div>;
        return <div>分类管理功能正在开发中...</div>;

      case 'tags':
        if (!isAdmin) return <div>无权限访问</div>;
        return <div>标签管理功能正在开发中...</div>;

      default:
        return <div>页面未找到</div>;
    }
  };

  return (
    <ProfileContainer>
      <ModernLayout>
        {/* 左侧用户信息区域 */}
        <UserSection>
          <Card>
            {user && (
              <UserInfoCard
                user={user}
                onEditProfile={() => setIsEditModalOpen(true)}
                onAvatarChange={handleAvatarChange}
                isLoading={isUserLoading}
              />
            )}
          </Card>

          {/* 成就徽章 */}
          {!isMobile && (
            <Card>
              <AchievementBadges achievements={achievements} onBadgeClick={handleBadgeClick} maxDisplay={6} />
            </Card>
          )}
        </UserSection>

        {/* 主内容区域 */}
        <MainContent>
          {/* 移动端快捷操作 */}
          {permissions.quickActions.length > 0 && (
            <MobileQuickActions>
              <Card>
                <QuickActions onAction={handleQuickAction} actions={permissions.quickActions} />
              </Card>
            </MobileQuickActions>
          )}

          {/* 标签页容器 - 只在有多个tab时显示 */}
          {openTabs.length > 1 && (
            <TabsContainer>
              <TabsList>
                {openTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                    title={tab.label}
                  >
                    <span>{tab.label}</span>
                    {tab.closable && (
                      <CloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      >
                        <FiX size={12} />
                      </CloseButton>
                    )}
                  </TabButton>
                ))}
              </TabsList>
            </TabsContainer>
          )}

          {/* 内容区域 */}
          <TabContent>{renderTabContent()}</TabContent>
        </MainContent>

        {/* 右侧快捷操作区域（大屏显示） */}
        {permissions.quickActions.length > 0 && (
          <QuickActionsSection>
            <Card>
              <QuickActions onAction={handleQuickAction} actions={permissions.quickActions} />
            </Card>
          </QuickActionsSection>
        )}
      </ModernLayout>

      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          user={user}
          onClose={handleCloseEditModal}
          onSave={handleSaveProfile}
          isLoading={isUserLoading}
        />
      )}

      <EditSiteSettingsModal
        isOpen={isEditSiteSettingsModalOpen}
        settings={siteSettings}
        onClose={() => setIsEditSiteSettingsModalOpen(false)}
        onSave={handleSaveSiteSettings}
        isLoading={isSiteSettingsLoading}
      />

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
          <ContextMenuItem onClick={handleCloseRightTabs}>
            <FiChevronsRight size={14} />
            关闭右侧标签
          </ContextMenuItem>
          <ContextMenuItem danger onClick={handleCloseAllTabs}>
            <FiTrash2 size={14} />
            关闭所有标签
          </ContextMenuItem>
        </ContextMenu>
      )}
    </ProfileContainer>
  );
};

export default Profile;
