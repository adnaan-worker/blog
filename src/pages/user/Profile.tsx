import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiFileText, FiHeart, FiEye, FiMessageSquare, FiUsers, FiBookmark, FiEdit, FiTrendingUp } from 'react-icons/fi';
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
import type { EditProfileForm } from '@/components/profile/types';
import { ProfileLayout } from './modules/ProfileLayout';
import { LoadingState } from './modules/LoadingState';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;



const Profile: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
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

  // 如果没有用户数据，显示加载状态
  if (!user) {
    return (
      <ProfileContainer>
        <LoadingState />
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileLayout
        sidebar={
          <UserInfoCard
            user={user}
            onEditProfile={handleEditProfile}
            onAvatarChange={handleAvatarChange}
            isLoading={isUserLoading}
          />
        }
        mainContent={
          <>
            <DataStatsGrid stats={userStats} onStatClick={handleStatClick} isLoading={isStatsLoading} />
            <ActivityFeed
              activities={activities}
              onActivityClick={handleActivityClick}
              onRefresh={handleRefreshActivities}
              onLoadMore={handleLoadMoreActivities}
              hasMore={hasMoreActivities}
              isLoading={isActivitiesLoading}
              isRefreshing={isRefreshing}
            />
          </>
        }
        rightSidebar={
          <>
            <QuickActions
              onCreateArticle={handleCreateArticle}
              onEditProfile={handleEditProfile}
              onExportData={handleExportData}
              onViewAnalytics={handleViewAnalytics}
              onHelp={handleHelp}
              onLogout={handleLogout}
            />
            <AchievementBadges achievements={achievements} onBadgeClick={handleBadgeClick} maxDisplay={6} />
          </>
        }
      />

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
