// Dashboard Components
export { UserInfoCard } from './user-info-card';
export { DataStatsGrid } from './data-stats-grid';
export { ActivityFeed } from './activity-feed';
export { QuickActions } from './quick-actions';
export { AchievementBadges } from './achievement-badges';

// Modals
export { EditProfileModal } from './modals/edit-profile-modal';
export { EditSiteSettingsModal } from './modals/edit-site-settings-modal';

// Common Components
export { default as ManagementLayout } from './common/management-layout';
export {
  ItemCard,
  ItemHeader,
  ItemTitle,
  ItemActions,
  ActionButton,
  ItemContent,
  ItemMeta,
  MetaItem,
  StatusBadge,
  TagsContainer,
  Tag,
  EmptyState,
  getMetaIcon,
  getActionIcon,
} from './common/item-card';
export { usePagination, useSearch, useFilter, useManagementPage } from './common/management-hooks';
export type { StatItemData, FilterOption } from './common/management-layout';

// Management Pages
export { default as NoteManagement } from './management/note-management';
export { default as ArticleManagement } from './management/article-management';
export { default as CommentManagement } from './management/comment-management';
export { default as BookmarkManagement } from './management/bookmark-management';
export { default as LikeManagement } from './management/like-management';
export { default as NoteLikeManagement } from './management/note-like-management';
export { default as SecuritySettings } from './management/security-settings';
export { default as SiteSettingsManagement } from './management/site-settings-management';
export { default as UserManagement } from './management/user-management';
export { default as CategoryManagement } from './management/category-management';
export { default as TagManagement } from './management/tag-management';
export { default as ProjectManagement } from './management/project-management';

// Types
export type { UserProfile, UserStats, Activity, Achievement } from './types';
