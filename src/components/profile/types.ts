export interface UserProfile {
  id: string | number;
  username: string;
  nickname?: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  lastLoginTime?: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    weibo?: string;
    zhihu?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'zh-CN' | 'en-US';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
  stats?: {
    articleCount: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    followerCount: number;
    followingCount: number;
    bookmarkCount: number;
  };
}

export interface UserStats {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  highlight?: boolean;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  link?: string;
}

export interface Activity {
  id: string | number;
  type:
    | 'article_published'
    | 'comment_received'
    | 'like_received'
    | 'article_trending'
    | 'follow_received'
    | 'achievement_unlocked';
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  link?: string;
  metadata?: any;
}

export interface Achievement {
  id: string | number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
  category?: 'content' | 'social' | 'engagement' | 'milestone';
}

export interface EditProfileForm {
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    weibo?: string;
    zhihu?: string;
  };
}

// 新增类型定义
export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  emailNotifications: boolean;
  pushNotifications: boolean;
}
