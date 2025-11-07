import { useMemo } from 'react';
import type { UserProfile } from '@/types';

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin', // 管理员
  USER = 'user', // 普通用户
}

/**
 * 标签页配置
 */
export interface TabConfig {
  id: string;
  label: string;
  closable: boolean;
}

/**
 * 快捷操作配置
 */
export interface QuickActionConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: string;
}

/**
 * 权限配置接口
 */
export interface RolePermissions {
  // 可见的标签页
  visibleTabs: TabConfig[];
  // 可见的快捷操作
  quickActions: QuickActionConfig[];
  // 权限检查
  canManageUsers: boolean;
  canManageCategories: boolean;
  canManageTags: boolean;
  canManagePosts: boolean;
  canPublishPosts: boolean;
  canManageNotes: boolean;
  canManageComments: boolean;
  canViewLikes: boolean;
  canViewBookmarks: boolean;
  canViewAllComments: boolean; // 查看所有评论
  canViewOwnData: boolean; // 查看自己的数据
}

/**
 * 用户角色权限管理Hook
 */
export const useUserRole = (user: UserProfile | null) => {
  // 当前用户角色
  const currentRole = useMemo(() => {
    if (!user) return null;
    return user.role as UserRole;
  }, [user]);

  // 是否为管理员
  const isAdmin = useMemo(() => {
    return currentRole === UserRole.ADMIN;
  }, [currentRole]);

  // 是否为普通用户
  const isUser = useMemo(() => {
    return currentRole === UserRole.USER;
  }, [currentRole]);

  // 获取权限配置
  const permissions: RolePermissions = useMemo(() => {
    if (!currentRole) {
      return {
        visibleTabs: [],
        quickActions: [],
        canManageUsers: false,
        canManageCategories: false,
        canManageTags: false,
        canManagePosts: false,
        canPublishPosts: false,
        canManageNotes: false,
        canManageComments: false,
        canViewLikes: false,
        canViewBookmarks: false,
        canViewAllComments: false,
        canViewOwnData: false,
      };
    }

    // 管理员权限
    if (isAdmin) {
      return {
        visibleTabs: [{ id: 'dashboard', label: '📊 数据概览', closable: false }],
        quickActions: [
          {
            id: 'view-notes',
            label: '手记管理',
            icon: '📝',
            description: '查看和管理所有手记',
            action: 'view-notes',
          },
          {
            id: 'view-articles',
            label: '文章管理',
            icon: '📰',
            description: '查看和管理所有文章',
            action: 'view-articles',
          },
          {
            id: 'view-comments',
            label: '评论管理',
            icon: '💬',
            description: '查看和管理所有评论',
            action: 'view-comments',
          },
          {
            id: 'view-users',
            label: '用户管理',
            icon: '👥',
            description: '管理所有用户',
            action: 'view-users',
          },
          {
            id: 'view-categories',
            label: '分类管理',
            icon: '📂',
            description: '管理文章分类',
            action: 'view-categories',
          },
          {
            id: 'view-tags',
            label: '标签管理',
            icon: '🏷️',
            description: '管理文章标签',
            action: 'view-tags',
          },
          {
            id: 'view-projects',
            label: '项目管理',
            icon: '💼',
            description: '管理项目及同步GitHub',
            action: 'view-projects',
          },
          {
            id: 'view-security',
            label: '账户安全',
            icon: '🔒',
            description: '修改密码、数据导出',
            action: 'view-security',
          },
          {
            id: 'edit-site-settings',
            label: '网站设置',
            icon: '⚙️',
            description: '编辑网站配置',
            action: 'edit-site-settings',
          },
          {
            id: 'logout',
            label: '退出登录',
            icon: '🚪',
            description: '退出当前账号',
            action: 'logout',
          },
        ],
        canManageUsers: true,
        canManageCategories: true,
        canManageTags: true,
        canManagePosts: true,
        canPublishPosts: true,
        canManageNotes: true,
        canManageComments: true,
        canViewLikes: true,
        canViewBookmarks: true,
        canViewAllComments: true,
        canViewOwnData: true,
      };
    }

    // 普通用户权限
    return {
      visibleTabs: [{ id: 'dashboard', label: '📊 数据概览', closable: false }],
      quickActions: [
        {
          id: 'view-likes',
          label: '文章点赞',
          icon: '❤️',
          description: '查看我的文章点赞记录',
          action: 'view-likes',
        },
        {
          id: 'view-note-likes',
          label: '手记点赞',
          icon: '💝',
          description: '查看我的手记点赞记录',
          action: 'view-note-likes',
        },
        {
          id: 'view-bookmarks',
          label: '我的收藏',
          icon: '🔖',
          description: '查看我的收藏内容',
          action: 'view-bookmarks',
        },
        {
          id: 'view-comments',
          label: '我的评论',
          icon: '💬',
          description: '查看我的评论记录',
          action: 'view-comments',
        },
        {
          id: 'view-security',
          label: '账户安全',
          icon: '🔒',
          description: '修改密码、数据导出',
          action: 'view-security',
        },
        {
          id: 'logout',
          label: '退出登录',
          icon: '🚪',
          description: '退出当前账号',
          action: 'logout',
        },
      ],
      canManageUsers: false,
      canManageCategories: false,
      canManageTags: false,
      canManagePosts: false,
      canPublishPosts: false,
      canManageNotes: false,
      canManageComments: false,
      canViewLikes: true,
      canViewBookmarks: true,
      canViewAllComments: false,
      canViewOwnData: true,
    };
  }, [currentRole, isAdmin]);

  return {
    currentRole,
    isAdmin,
    isUser,
    permissions,
  };
};
