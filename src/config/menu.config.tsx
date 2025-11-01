/**
 * 菜单配置文件
 * 统一管理导航菜单配置
 */

import React from 'react';
import { FiHome, FiBookOpen, FiCode, FiInfo, FiMail, FiLogIn, FiUserPlus, FiUser, FiEdit } from 'react-icons/fi';

/* ==================== 类型定义 ==================== */

export interface MenuItem {
  path: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  isExternal?: boolean;
  isDropdown?: boolean;
  children?: MenuItem[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

/* ==================== 主导航菜单 ==================== */

export const mainNavItems: MenuItem[] = [
  {
    path: '/',
    title: '首页',
    icon: FiHome,
  },
  {
    path: '/blog',
    title: '文稿',
    icon: FiBookOpen,
  },
  {
    path: '/notes',
    title: '手记',
    icon: FiEdit,
  },
  {
    path: '/projects',
    title: '项目',
    icon: FiCode,
  },
  {
    path: '#',
    title: '关于',
    icon: FiInfo,
    isDropdown: true,
    children: [
      {
        path: '/about-site',
        title: '此站点',
        icon: FiInfo,
      },
      {
        path: '/about-me',
        title: '自述',
        icon: FiMail,
      },
    ],
  },
];

/* ==================== 账户菜单 ==================== */

export const accountMenuItems: MenuItem[] = [
  {
    path: '#login',
    title: '登录',
    icon: FiLogIn,
  },
  {
    path: '#register',
    title: '注册',
    icon: FiUserPlus,
  },
];

/* ==================== 用户中心菜单 ==================== */

export const userCenterMenuItem: MenuItem = {
  path: '/profile',
  title: '个人中心',
  icon: FiUser,
};

/* ==================== 移动端菜单配置 ==================== */

/**
 * 获取基础移动端菜单分组
 */
export const getBaseMobileMenuGroups = (): MenuGroup[] => [
  {
    title: '主导航',
    items: mainNavItems,
  },
];

/**
 * 获取登录后的移动端菜单分组
 */
export const getLoggedInMobileMenuGroups = (): MenuGroup[] => [
  ...getBaseMobileMenuGroups(),
  {
    title: '用户中心',
    items: [userCenterMenuItem],
  },
];
