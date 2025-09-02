import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  FiFileText,
  FiHeart,
  FiEye,
  FiMessageSquare,
  FiUsers,
  FiBookmark,
  FiEdit,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/ui';
import { API, UserProfile, UserStats, UserActivity, UserAchievement } from '@/utils/api';
import {
  UserInfoCard,
  DataStatsGrid,
  ActivityFeed,
  QuickActions,
  AchievementBadges,
  EditProfileModal,
} from '@/components/profile';
import SettingsPanel from '@/components/profile/settings-panel';
import type { EditProfileForm } from '@/components/profile/types';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

// 页面标题区域
const PageHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 1.875rem;
    font-weight: 300;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
`;

// 网格布局容器
const GridLayout = styled.div`
  display: grid;
  gap: 1.5rem;

  /* 移动端：单列 */
  grid-template-columns: 1fr;

  /* 平板及以上：两列 */
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }

  /* 大屏：三列 */
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr 1fr;
  }
`;

// 侧边栏区域
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 主内容区域
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 右侧边栏
const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1023px) {
    display: none;
  }
`;

// 标签页导航
const TabNavigation = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: ${({ active }) => (active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  font-weight: ${({ active }) => (active ? '600' : '500')};
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => (active ? 'var(--accent-color)' : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
  }
`;

// 标签页内容
const TabContent = styled.div`
  min-height: 400px;
`;

// 加载状态容器
const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
`;

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 用户数据
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);

  // 分页状态
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);

  // 初始化数据
  useEffect(() => {
    loadUserProfile();
    loadUserStats();
    loadUserActivities();
    loadUserAchievements();
  }, []);

  // 加载用户资料
  const loadUserProfile = async () => {
    setIsUserLoading(true);
    try {
      const response = await API.user.getProfile();
      setUser(response.data);
    } catch (error: any) {
      toast.error(error.message || '加载用户资料失败');
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
      toast.error(error.message || '加载统计数据失败');
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
      const activitiesWithIcons = response.data.data.map((activity: UserActivity) => ({
        ...activity,
        icon: getActivityIcon(activity.type),
      }));

      if (append) {
        setActivities((prev) => [...prev, ...activitiesWithIcons]);
      } else {
        setActivities(activitiesWithIcons);
      }

      setHasMoreActivities(response.data.data.length === 10);
      setActivitiesPage(page);
    } catch (error: any) {
      toast.error(error.message || '加载活动记录失败');
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
      toast.error(error.message || '加载成就数据失败');
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
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

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
        nickname: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks,
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

      toast.success('个人资料更新成功！');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || '更新失败，请重试');
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

      toast.success('头像更新成功！');
    } catch (error: any) {
      toast.error(error.message || '头像上传失败，请重试');
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

  const handleActivityClick = (activity: UserActivity) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  const handleRefreshActivities = async () => {
    setIsRefreshing(true);
    try {
      await loadUserActivities(1, false);
      toast.success('活动数据已更新');
    } catch (error) {
      toast.error('刷新失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMoreActivities = async () => {
    if (hasMoreActivities && !isActivitiesLoading) {
      await loadUserActivities(activitiesPage + 1, true);
    }
  };

  // 快捷操作处理
  const handleCreateArticle = () => {
    navigate('/user/create-article');
  };

  const handleViewAnalytics = () => {
    navigate('/user/analytics');
  };

  const handleSettings = () => {
    setActiveTab('settings');
  };

  const handleExportData = async () => {
    try {
      const response = await API.user.exportData();
      // 创建下载链接
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('数据导出已开始');
    } catch (error: any) {
      toast.error(error.message || '导出失败，请重试');
    }
  };

  const handleHelp = () => {
    window.open('/help', '_blank');
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      API.user
        .logout()
        .then(() => {
          navigate('/');
        })
        .catch(() => {
          navigate('/');
        });
    }
  };

  const handleBadgeClick = (achievement: UserAchievement) => {
    toast.info(`${achievement.name}: ${achievement.description}`);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUser(profile);
  };

  // 如果没有用户数据，显示加载状态
  if (!user) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          <div>加载中...</div>
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <PageHeader>
        <h1>个人中心</h1>
        <p>管理您的个人信息、设置和偏好</p>
      </PageHeader>

      {/* 标签页导航 */}
      <TabNavigation>
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          概览
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          <FiSettings size={16} style={{ marginRight: '0.5rem' }} />
          设置
        </TabButton>
      </TabNavigation>

      {/* 标签页内容 */}
      <TabContent>
        {activeTab === 'overview' ? (
          <GridLayout>
            {/* 左侧边栏 - 用户信息 */}
            <Sidebar>
              <UserInfoCard
                user={user}
                onEditProfile={handleEditProfile}
                onAvatarChange={handleAvatarChange}
                isLoading={isUserLoading}
              />
            </Sidebar>

            {/* 主内容区域 */}
            <MainContent>
              {/* 数据统计 */}
              <DataStatsGrid stats={userStats} onStatClick={handleStatClick} isLoading={isStatsLoading} />

              {/* 最近活动 */}
              <ActivityFeed
                activities={activities}
                onActivityClick={handleActivityClick}
                onRefresh={handleRefreshActivities}
                onLoadMore={handleLoadMoreActivities}
                hasMore={hasMoreActivities}
                isLoading={isActivitiesLoading}
                isRefreshing={isRefreshing}
              />
            </MainContent>

            {/* 右侧边栏 - 快捷操作和成就 */}
            <RightSidebar>
              <QuickActions
                onCreateArticle={handleCreateArticle}
                onEditProfile={handleEditProfile}
                onSettings={handleSettings}
                onExportData={handleExportData}
                onViewAnalytics={handleViewAnalytics}
                onHelp={handleHelp}
                onLogout={handleLogout}
              />

              <AchievementBadges achievements={achievements} onBadgeClick={handleBadgeClick} maxDisplay={6} />
            </RightSidebar>
          </GridLayout>
        ) : (
          <SettingsPanel user={user} onUpdateProfile={handleUpdateProfile} />
        )}
      </TabContent>

      {/* 编辑资料模态框 */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        user={user}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
        isLoading={isUserLoading}
      />
    </ProfileContainer>
  );
};

export default Profile;
