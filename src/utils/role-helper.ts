/**
 * 用户角色工具函数
 */

export type UserRole = 'admin' | 'moderator' | 'vip' | 'user';

/**
 * 获取用户角色的中文显示名称
 * @param role 用户角色
 * @returns 中文角色名称
 */
export const getRoleDisplayName = (role?: string): string => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'moderator':
      return '版主';
    case 'vip':
      return 'VIP用户';
    case 'user':
    default:
      return '普通用户';
  }
};

/**
 * 获取用户角色的颜色
 * @param role 用户角色
 * @returns CSS 颜色值
 */
export const getRoleColor = (role?: string): string => {
  switch (role) {
    case 'admin':
      return 'var(--danger-color)';
    case 'moderator':
      return 'var(--accent-color)';
    case 'vip':
      return 'var(--warning-color)';
    case 'user':
    default:
      return 'var(--text-secondary)';
  }
};

/**
 * 检查用户是否为管理员
 * @param role 用户角色
 * @returns 是否为管理员
 */
export const isAdmin = (role?: string): boolean => {
  return role === 'admin';
};

/**
 * 检查用户是否为版主或管理员
 * @param role 用户角色
 * @returns 是否为版主或管理员
 */
export const isModerator = (role?: string): boolean => {
  return role === 'admin' || role === 'moderator';
};

/**
 * 检查用户是否为VIP用户
 * @param role 用户角色
 * @returns 是否为VIP用户
 */
export const isVip = (role?: string): boolean => {
  return role === 'vip' || role === 'admin' || role === 'moderator';
};
