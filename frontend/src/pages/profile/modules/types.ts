export interface UserProfile {
  id: string | number;
  username: string;
  fullName?: string; // 对应数据库的 full_name 字段
  email: string;
  avatar?: string;
  bio?: string;
  role?: string;
  status?: string;
  joinDate: string;
  lastLoginTime?: string;
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

// QuickAction配置接口
export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
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
  fullName: string;
  email: string;
  bio: string;
}
