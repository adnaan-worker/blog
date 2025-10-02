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
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/ui';
import { API, UserProfile, UserStats, UserActivity, UserAchievement, SiteSettings } from '@/utils/api';
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
} from '@/components/profile';
import type { EditProfileForm } from '@/components/profile/types';

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
  isolation: isolate; /* 创建新的层叠上下文 */

  @media (min-width: 768px) {
    grid-template-columns: 320px 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 320px 1fr 280px;
  }
`;

// 左侧用户卡片区域
const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 主内容区域
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 600px;
`;

// 右侧快捷操作区域
const QuickActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

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
`;

const TabsList = styled.div`
  display: flex;
  background: var(--bg-secondary);
  padding: 0.5rem;
  gap: 0.25rem;
  border-radius: 8px;
  margin: 1rem;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }
`;

const TabButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: ${(props) => (props.active ? 'var(--bg-primary)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--text-primary)' : 'var(--text-secondary)')};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none')};
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    background: ${(props) => (props.active ? 'var(--bg-primary)' : 'rgba(var(--accent-color-rgb), 0.1)')};
    color: ${(props) => (props.active ? 'var(--text-primary)' : 'var(--accent-color)')};
  }

  [data-theme='dark'] & {
    box-shadow: ${(props) => (props.active ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none')};
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 0.5rem;
  border: none;
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
  padding: 1.5rem;
  min-height: 500px;
`;

const Profile: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSiteSettingsModalOpen, setIsEditSiteSettingsModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSiteSettingsLoading, setIsSiteSettingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openTabs, setOpenTabs] = useState([{ id: 'dashboard', label: '📊 数据概览', closable: false }]);

  // 用户数据
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

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

  // 统一的快捷操作处理
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'view-notes':
        addTab('notes', '📝 我的手记');
        break;
      case 'view-articles':
        addTab('articles', '📰 我的文章');
        break;
      case 'edit-site-settings':
        setIsEditSiteSettingsModalOpen(true);
        break;
      case 'logout':
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
      toast.success('网站设置更新成功！');
      setIsEditSiteSettingsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || '更新失败，请重试');
    } finally {
      setIsSiteSettingsLoading(false);
    }
  };

  const handleBadgeClick = (achievement: UserAchievement) => {
    toast.info(`${achievement.name}: ${achievement.description}`);
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

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DataStatsGrid stats={userStats} onStatClick={handleStatClick} isLoading={isStatsLoading} />

            {/* 移动端显示成就徽章 */}
            {isMobile && (
              <div
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <AchievementBadges achievements={achievements} onBadgeClick={handleBadgeClick} maxDisplay={6} />
              </div>
            )}

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
        );

      case 'notes':
        return <NoteManagement />;

      case 'articles':
        return <ArticleManagement />;
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
          <MobileQuickActions>
            <Card>
              <QuickActions onAction={handleQuickAction} />
            </Card>
          </MobileQuickActions>

          {/* 标签页容器 */}
          <TabsContainer>
            <TabsList>
              {openTabs.map((tab) => (
                <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
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

            <TabContent>{renderTabContent()}</TabContent>
          </TabsContainer>
        </MainContent>

        {/* 右侧快捷操作区域（大屏显示） */}
        <QuickActionsSection>
          <Card>
            <QuickActions onAction={handleQuickAction} />
          </Card>
        </QuickActionsSection>
      </ModernLayout>

      <EditProfileModal
        isOpen={isEditModalOpen}
        user={user}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
        isLoading={isUserLoading}
      />

      <EditSiteSettingsModal
        isOpen={isEditSiteSettingsModalOpen}
        settings={siteSettings}
        onClose={() => setIsEditSiteSettingsModalOpen(false)}
        onSave={handleSaveSiteSettings}
        isLoading={isSiteSettingsLoading}
      />
    </ProfileContainer>
  );
};

export default Profile;
