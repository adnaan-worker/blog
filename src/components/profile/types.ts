export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface UserStats {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  highlight?: boolean;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export interface Activity {
  id: string;
  type: 'article_published' | 'comment_received' | 'like_received' | 'article_trending' | 'follow_received';
  title: string;
  description?: string;
  timestamp: string;
  icon: React.ReactNode;
  link?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
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
  };
}
