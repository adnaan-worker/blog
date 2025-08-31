import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiFileText, FiHeart, FiEye, FiMessageSquare, FiUsers, FiBookmark, FiEdit, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/ui';
import {
  UserInfoCard,
  DataStatsGrid,
  ActivityFeed,
  QuickActions,
  AchievementBadges,
  EditProfileModal,
} from '@/components/profile';
import type { UserProfile, UserStats, Activity, Achievement, EditProfileForm } from '@/components/profile/types';

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

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 模拟用户数据
  const [user, setUser] = useState<UserProfile>({
    id: 'user-1',
    username: '张三',
    email: 'zhangsan@example.com',
    avatar: '/api/placeholder/120/120',
    bio: '热爱技术分享的前端开发者，专注于React生态系统',
    location: '北京市',
    website: 'https://zhangsan.dev',
    joinDate: '2022-03-15',
    socialLinks: {
      github: 'https://github.com/zhangsan',
      twitter: 'https://twitter.com/zhangsan',
      linkedin: 'https://linkedin.com/in/zhangsan',
      instagram: '',
    },
  });

  // 统计数据
  const [userStats, setUserStats] = useState<UserStats[]>([
    {
      label: '发布文章',
      value: 24,
      icon: <FiFileText />,
      highlight: true,
      trend: { direction: 'up', percentage: 12 },
    },
    {
      label: '总阅读量',
      value: '3.2K',
      icon: <FiEye />,
      trend: { direction: 'up', percentage: 8 },
    },
    {
      label: '获得点赞',
      value: 128,
      icon: <FiHeart />,
      trend: { direction: 'up', percentage: 15 },
    },
    {
      label: '评论回复',
      value: 89,
      icon: <FiMessageSquare />,
      trend: { direction: 'down', percentage: 3 },
    },
    {
      label: '关注者',
      value: 67,
      icon: <FiUsers />,
      trend: { direction: 'up', percentage: 5 },
    },
    {
      label: '收藏数',
      value: 45,
      icon: <FiBookmark />,
    },
  ]);

  // 活动数据
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 'activity-1',
      type: 'article_published',
      title: '发布了新文章《React 18 新特性详解》',
      description: '深入探讨React 18引入的并发渲染机制',
      timestamp: '2024-01-15T10:30:00Z',
      icon: <FiEdit />,
      link: '/blog/detail/1',
    },
    {
      id: 'activity-2',
      type: 'like_received',
      title: '收到了来自用户的点赞',
      description: '文章《TypeScript 高级类型》获得了新的点赞',
      timestamp: '2024-01-15T08:15:00Z',
      icon: <FiHeart />,
    },
    {
      id: 'activity-3',
      type: 'comment_received',
      title: '回复了文章评论',
      description: '在《Vue3 实践指南》下回复了用户提问',
      timestamp: '2024-01-14T16:45:00Z',
      icon: <FiMessageSquare />,
    },
    {
      id: 'activity-4',
      type: 'article_trending',
      title: '文章《Next.js 最佳实践》进入热门',
      description: '获得了大量阅读和讨论',
      timestamp: '2024-01-13T14:20:00Z',
      icon: <FiTrendingUp />,
    },
  ]);

  // 成就数据
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'achievement-1',
      name: '作者',
      description: '发布第一篇文章',
      icon: '📝',
      unlocked: true,
      unlockedAt: '2022-03-20',
    },
    {
      id: 'achievement-2',
      name: '热门',
      description: '文章获得100+点赞',
      icon: '⭐',
      unlocked: true,
      unlockedAt: '2022-05-15',
    },
    {
      id: 'achievement-3',
      name: '高产',
      description: '发布50篇文章',
      icon: '🚀',
      unlocked: false,
      progress: { current: 24, target: 50 },
    },
    {
      id: 'achievement-4',
      name: '影响力',
      description: '获得1000+关注者',
      icon: '🏆',
      unlocked: false,
      progress: { current: 67, target: 1000 },
    },
    {
      id: 'achievement-5',
      name: '活跃',
      description: '连续7天发布内容',
      icon: '🔥',
      unlocked: false,
      progress: { current: 3, target: 7 },
    },
    {
      id: 'achievement-6',
      name: '社交达人',
      description: '回复100条评论',
      icon: '💬',
      unlocked: false,
      progress: { current: 89, target: 100 },
    },
  ]);

  // 处理函数
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (formData: EditProfileForm, avatarFile?: File) => {
    setIsUserLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 更新用户数据
      setUser((prev) => ({
        ...prev,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks,
        // 如果有新头像，这里应该是上传后的URL
        avatar: avatarFile ? URL.createObjectURL(avatarFile) : prev.avatar,
      }));

      toast.success('个人资料更新成功！');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('更新失败，请重试');
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    setIsUserLoading(true);
    try {
      // 模拟头像上传
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 更新头像
      setUser((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(file),
      }));

      toast.success('头像更新成功！');
    } catch (error) {
      toast.error('头像上传失败，请重试');
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleStatClick = (stat: UserStats) => {
    // 根据统计项跳转到对应页面
    switch (stat.label) {
      case '发布文章':
        navigate('/user/dashboard');
        break;
      case '关注者':
        navigate('/user/followers');
        break;
      default:
        console.log('查看详细统计:', stat.label);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  const handleRefreshActivities = async () => {
    setIsRefreshing(true);
    try {
      // 模拟刷新数据
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 可以在这里重新获取活动数据
      toast.success('活动数据已更新');
    } catch (error) {
      toast.error('刷新失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMoreActivities = async () => {
    setIsActivitiesLoading(true);
    try {
      // 模拟加载更多数据
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 这里可以添加更多活动数据
      console.log('加载更多活动');
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setIsActivitiesLoading(false);
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
    navigate('/user/settings');
  };

  const handleExportData = () => {
    // 模拟数据导出
    toast.success('数据导出已开始，完成后将发送到您的邮箱');
  };

  const handleHelp = () => {
    window.open('/help', '_blank');
  };

  const handleLogout = () => {
    // 处理退出登录
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  const handleBadgeClick = (achievement: Achievement) => {
    toast.info(`${achievement.name}: ${achievement.description}`);
  };

  return (
    <ProfileContainer>
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
            hasMore={true}
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
