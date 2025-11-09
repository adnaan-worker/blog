import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiEdit3,
  FiBookmark,
  FiMessageCircle,
  FiAward,
  FiTrendingUp,
  FiStar,
  FiMapPin,
  FiTrash2,
  FiHeart,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiBell,
  FiUserPlus,
  FiTarget,
  FiThumbsUp,
} from 'react-icons/fi';
import { getTimeAgo, RichTextParser, truncateText } from '@/utils';
import { useAnimationEngine, useSmartInView } from '@/utils/ui/animation';
import { InfiniteScroll } from 'adnaan-ui';
import { API } from '@/utils/api';
import { FadeScrollContainer } from '@/components/common';
import type { UserActivity } from '@/types';

// Styled Components
const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
  overflow-x: hidden; /* 防止横向滚动条 */
`;

const SectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1.25rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    border-radius: 3px;
  }
`;

const ScrollWrapper = styled.div`
  max-height: 500px;
`;

const ActivityGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 12px;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  position: relative;
  cursor: pointer;
  /* 优化性能，防止抖动 */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;

  &:last-of-type {
    border-bottom: none;
  }

  [data-theme='dark'] & {
    border-bottom-color: rgba(75, 85, 99, 0.5);
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
`;

const ActivityIcon = styled.div<{ color?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid ${({ color }) => color || 'var(--accent-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ color }) => {
    if (color && color.startsWith('var(')) {
      return `rgba(var(--accent-rgb, 59, 130, 246), 0.1)`;
    }
    if (color && color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'rgba(var(--accent-rgb, 59, 130, 246), 0.1)';
  }};
  color: ${({ color }) => color || 'var(--accent-color)'};
  font-size: 0.75rem;
  transition: all 0.2s ease;
  opacity: 0.8;

  ${ActivityItem}:hover & {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const ActivityHeaderContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActivityAuthor = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

const ActivityTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  transition: color 0.2s ease;

  ${ActivityItem}:hover & {
    color: var(--accent-color);
  }
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
  opacity: 0.7;
  flex-shrink: 0;
  margin-left: auto;
`;

const ActivityBubble = styled.div`
  margin-left: 2rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  border-top-left-radius: 0.25rem;
  background: rgba(107, 114, 126, 0.05);
  color: var(--text-primary);
  font-size: 0.8125rem;
  line-height: 1.5;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  transition: background 0.2s ease;

  [data-theme='dark'] & {
    background: rgba(75, 85, 99, 0.2);
  }

  ${ActivityItem}:hover & {
    background: rgba(107, 114, 126, 0.08);

    [data-theme='dark'] & {
      background: rgba(75, 85, 99, 0.3);
    }
  }
`;

const ActivitySecondary = styled.div`
  margin-left: 2rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-primary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  word-break: break-word;
  transition: color 0.2s ease;

  ${ActivityItem}:hover & {
    color: var(--accent-color);
  }
`;

// 标题最大长度（用于在标题行显示）
const MAX_TITLE_LENGTH = 15;

// 格式化活动文本和图标
const formatActivityText = (activity: UserActivity) => {
  const username = activity.user?.username;
  const metadata = activity.metadata || {};

  switch (activity.type) {
    case 'post_created': {
      const title = metadata.postTitle || activity.title || '无标题';
      return {
        header: (
          <>
            <span style={{ color: 'var(--accent-color)' }}>{username}</span>
            <span>发布了文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiFileText,
        color: 'var(--accent-color)',
      };
    }
    case 'post_updated': {
      const title = metadata.postTitle || activity.title || '无标题';
      return {
        header: (
          <>
            <span style={{ color: '#10b981' }}>{username}</span>
            <span>更新了文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiEdit3,
        color: '#10b981',
      };
    }
    case 'post_deleted': {
      const title = metadata.postTitle || activity.title || '无标题';
      return {
        header: (
          <>
            <span style={{ color: '#ef4444' }}>{username}</span>
            <span>删除了文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiTrash2,
        color: '#ef4444',
      };
    }
    case 'note_created': {
      // 手记内容应该显示在气泡中
      const rawContent = activity.description || '';
      const cleanContent = RichTextParser.extractText(rawContent).trim();

      return {
        header: (
          <>
            <span style={{ color: '#f59e0b' }}>{username}</span>
            <span>发布了手记</span>
          </>
        ),
        content: cleanContent,
        showBubble: cleanContent.length > 0, // 有内容就显示气泡
        icon: FiBookmark,
        color: '#f59e0b',
      };
    }
    case 'note_updated': {
      const rawContent = activity.description || '';
      const cleanContent = RichTextParser.extractText(rawContent).trim();
      return {
        header: (
          <>
            <span style={{ color: '#10b981' }}>{username}</span>
            <span>更新了手记</span>
          </>
        ),
        content: cleanContent,
        showBubble: cleanContent.length > 0,
        icon: FiEdit3,
        color: '#10b981',
      };
    }
    case 'note_deleted': {
      return {
        header: (
          <>
            <span style={{ color: '#ef4444' }}>{username}</span>
            <span>删除了手记</span>
          </>
        ),
        content: '',
        showBubble: false,
        icon: FiTrash2,
        color: '#ef4444',
      };
    }
    case 'comment_created': {
      const postTitle = metadata.postTitle || activity.title || '';
      const displayTitle = postTitle ? truncateText(postTitle, MAX_TITLE_LENGTH) : '';
      const rawContent = activity.description || '';
      const cleanContent = RichTextParser.extractText(rawContent).trim();

      return {
        header: (
          <>
            <span style={{ color: '#8b5cf6' }}>{username}</span>
            <span>在</span>
            {displayTitle && <strong style={{ color: '#8b5cf6' }}>{displayTitle}</strong>}
            <span>说：</span>
          </>
        ),
        content: cleanContent,
        showBubble: cleanContent.length > 0,
        icon: FiMessageCircle,
        color: '#8b5cf6',
      };
    }
    case 'comment_updated': {
      const postTitle = metadata.postTitle || activity.title || '';
      const displayTitle = postTitle ? truncateText(postTitle, MAX_TITLE_LENGTH) : '';
      const rawContent = activity.description || '';
      const cleanContent = RichTextParser.extractText(rawContent).trim();

      return {
        header: (
          <>
            <span style={{ color: '#10b981' }}>{username}</span>
            <span>更新了在</span>
            {displayTitle && <strong style={{ color: '#10b981' }}>{displayTitle}</strong>}
            <span>的评论</span>
          </>
        ),
        content: cleanContent,
        showBubble: cleanContent.length > 0,
        icon: FiEdit3,
        color: '#10b981',
      };
    }
    case 'comment_deleted': {
      const postTitle = metadata.postTitle || activity.title || '';
      const displayTitle = postTitle ? truncateText(postTitle, MAX_TITLE_LENGTH) : '';
      return {
        header: (
          <>
            <span style={{ color: '#ef4444' }}>{username}</span>
            <span>删除了在</span>
            {displayTitle && <strong style={{ color: '#ef4444' }}>{displayTitle}</strong>}
            <span>的评论</span>
          </>
        ),
        content: '',
        showBubble: false,
        icon: FiTrash2,
        color: '#ef4444',
      };
    }
    case 'achievement_unlocked':
      return {
        header: (
          <>
            <span style={{ color: '#f59e0b' }}>{username}</span>
            <span>解锁了成就</span>
            <strong style={{ color: '#f59e0b' }}>{metadata.achievementName || activity.description || ''}</strong>
          </>
        ),
        content: metadata.achievementName || activity.description || '',
        showBubble: false,
        icon: FiAward,
        color: '#f59e0b',
      };
    case 'level_up': {
      const level = metadata.level || activity.description || '';
      return {
        header: (
          <>
            <span style={{ color: '#8b5cf6' }}>{username}</span>
            <span>升级了</span>
            {level && <strong style={{ color: '#8b5cf6' }}>Lv.{level}</strong>}
          </>
        ),
        content: level ? `达到 ${level} 级` : '',
        showBubble: false,
        icon: FiTrendingUp,
        color: '#8b5cf6',
      };
    }
    case 'milestone_reached': {
      const milestone = metadata.milestoneName || activity.description || '';
      return {
        header: (
          <>
            <span style={{ color: '#f59e0b' }}>{username}</span>
            <span>达到了里程碑</span>
            {milestone && <strong style={{ color: '#f59e0b' }}>{milestone}</strong>}
          </>
        ),
        content: milestone,
        showBubble: false,
        icon: FiTarget,
        color: '#f59e0b',
      };
    }
    case 'post_trending': {
      const title = metadata.postTitle || activity.title || '';
      const displayTitle = truncateText(title, MAX_TITLE_LENGTH);
      return {
        header: (
          <>
            <span style={{ color: '#ef4444' }}>{username}</span>
            <span>的</span>
            <strong style={{ color: '#ef4444' }}>{displayTitle}</strong>
            <span>🔥 上热门了</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiTrendingUp,
        color: '#ef4444',
      };
    }
    case 'post_featured': {
      const title = metadata.postTitle || activity.title || '';
      const displayTitle = truncateText(title, MAX_TITLE_LENGTH);
      return {
        header: (
          <>
            <span style={{ color: '#06b6d4' }}>{username}</span>
            <span>的</span>
            <strong style={{ color: '#06b6d4' }}>{displayTitle}</strong>
            <span>✨ 被精选了</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiStar,
        color: '#06b6d4',
      };
    }
    // 审核类
    case 'post_approved': {
      const title = metadata.postTitle || activity.title || '文章';
      return {
        header: (
          <>
            <span style={{ color: '#10b981' }}>系统</span>
            <span>审核通过了你的文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiCheckCircle,
        color: '#10b981',
      };
    }
    case 'post_rejected': {
      const title = metadata.postTitle || activity.title || '文章';
      const reason = metadata.reason || activity.description || '内容不符合规范';
      return {
        header: (
          <>
            <span style={{ color: '#ef4444' }}>系统</span>
            <span>审核未通过你的文章</span>
          </>
        ),
        content: `${title} - ${reason}`,
        showBubble: false,
        icon: FiXCircle,
        color: '#ef4444',
      };
    }
    case 'comment_approved': {
      return {
        header: (
          <>
            <span style={{ color: '#10b981' }}>系统</span>
            <span>审核通过了你的评论</span>
          </>
        ),
        content: '',
        showBubble: false,
        icon: FiCheckCircle,
        color: '#10b981',
      };
    }
    case 'comment_rejected': {
      const reason = metadata.reason || activity.description || '内容不符合规范';
      return {
        header: (
          <>
            <span style={{ color: '#ef4444' }}>系统</span>
            <span>审核未通过你的评论</span>
          </>
        ),
        content: reason,
        showBubble: false,
        icon: FiXCircle,
        color: '#ef4444',
      };
    }
    // 系统通知类
    case 'system_notice': {
      const notice = activity.description || activity.title || '';
      const cleanNotice = RichTextParser.extractText(notice).trim();
      return {
        header: (
          <>
            <span style={{ color: '#06b6d4' }}>系统</span>
            <span>通知</span>
          </>
        ),
        content: cleanNotice,
        showBubble: cleanNotice.length > 0,
        icon: FiBell,
        color: '#06b6d4',
      };
    }
    case 'account_warning': {
      const warning = activity.description || activity.title || '';
      const cleanWarning = RichTextParser.extractText(warning).trim();
      return {
        header: (
          <>
            <span style={{ color: '#f59e0b' }}>系统</span>
            <span>账户警告</span>
          </>
        ),
        content: cleanWarning,
        showBubble: cleanWarning.length > 0,
        icon: FiAlertCircle,
        color: '#f59e0b',
      };
    }
    case 'welcome': {
      const welcomeMsg = activity.description || activity.title || '欢迎加入！';
      const cleanMsg = RichTextParser.extractText(welcomeMsg).trim();
      return {
        header: (
          <>
            <span style={{ color: '#10b981' }}>系统</span>
            <span>欢迎</span>
          </>
        ),
        content: cleanMsg,
        showBubble: cleanMsg.length > 0,
        icon: FiUserPlus,
        color: '#10b981',
      };
    }
    case 'like_received': {
      const targetTitle = metadata.postTitle || metadata.noteTitle || activity.title || '你的内容';
      const displayTitle = truncateText(targetTitle, MAX_TITLE_LENGTH);
      return {
        header: (
          <>
            <span style={{ color: '#ec4899' }}>{metadata.username || '有人'}</span>
            <span>点赞了</span>
            <strong style={{ color: '#ec4899' }}>{displayTitle}</strong>
          </>
        ),
        content: targetTitle,
        showBubble: false,
        icon: FiAward,
        color: '#ec4899',
      };
    }
    case 'comment_received': {
      const postTitle = metadata.postTitle || activity.title || '';
      const displayTitle = postTitle ? truncateText(postTitle, MAX_TITLE_LENGTH) : '';
      const rawContent = activity.description || '';
      const cleanContent = RichTextParser.extractText(rawContent).trim();

      return {
        header: (
          <>
            <span style={{ color: '#8b5cf6' }}>{metadata.username || '有人'}</span>
            <span>在</span>
            {displayTitle && <strong style={{ color: '#8b5cf6' }}>{displayTitle}</strong>}
            <span>说：</span>
          </>
        ),
        content: cleanContent,
        showBubble: cleanContent.length > 0,
        icon: FiMessageCircle,
        color: '#8b5cf6',
      };
    }
    case 'bookmark_received': {
      const postTitle = metadata.postTitle || activity.title || '你的文章';
      const displayTitle = truncateText(postTitle, MAX_TITLE_LENGTH);
      return {
        header: (
          <>
            <span style={{ color: '#06b6d4' }}>{metadata.username || '有人'}</span>
            <span>收藏了</span>
            <strong style={{ color: '#06b6d4' }}>{displayTitle}</strong>
          </>
        ),
        content: postTitle,
        showBubble: false,
        icon: FiStar,
        color: '#06b6d4',
      };
    }
    // 互动类 - 点赞和收藏
    case 'post_liked': {
      const title = metadata.postTitle || activity.title || '文章';
      return {
        header: (
          <>
            <span style={{ color: '#ec4899' }}>{username}</span>
            <span>点赞了文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiHeart,
        color: '#ec4899',
      };
    }
    case 'post_unliked': {
      const title = metadata.postTitle || activity.title || '文章';
      return {
        header: (
          <>
            <span style={{ color: '#9ca3af' }}>{username}</span>
            <span>取消点赞文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiX,
        color: '#9ca3af',
      };
    }
    case 'note_liked': {
      return {
        header: (
          <>
            <span style={{ color: '#ec4899' }}>{username}</span>
            <span>点赞了手记</span>
          </>
        ),
        content: '',
        showBubble: false,
        icon: FiHeart,
        color: '#ec4899',
      };
    }
    case 'note_unliked': {
      return {
        header: (
          <>
            <span style={{ color: '#9ca3af' }}>{username}</span>
            <span>取消点赞手记</span>
          </>
        ),
        content: '',
        showBubble: false,
        icon: FiX,
        color: '#9ca3af',
      };
    }
    case 'post_bookmarked': {
      const title = metadata.postTitle || activity.title || '文章';
      return {
        header: (
          <>
            <span style={{ color: '#06b6d4' }}>{username}</span>
            <span>收藏了文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiStar,
        color: '#06b6d4',
      };
    }
    case 'post_unbookmarked': {
      const title = metadata.postTitle || activity.title || '文章';
      return {
        header: (
          <>
            <span style={{ color: '#9ca3af' }}>{username}</span>
            <span>取消收藏文章</span>
          </>
        ),
        content: title,
        showBubble: false,
        icon: FiX,
        color: '#9ca3af',
      };
    }
    default: {
      // 对于其他类型，使用简洁的默认展示
      const rawContent = activity.description || '';
      const cleanContent = RichTextParser.extractText(rawContent).trim();
      const title = activity.title || '进行了操作';
      const displayTitle = truncateText(title, MAX_TITLE_LENGTH);

      return {
        header: (
          <span>
            {username || '用户'} {displayTitle}
          </span>
        ),
        content: cleanContent,
        showBubble: cleanContent.length > 0,
        icon: FiMapPin,
        color: 'var(--text-secondary)',
      };
    }
  }
};

// Props 接口
interface ActivitiesSectionProps {
  activities?: UserActivity[]; // 可选，如果传入则使用，否则组件内部管理
  loading?: boolean;
}

// 主组件
export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities: externalActivities,
  loading: externalLoading,
}) => {
  // 使用动画引擎 - Spring 系统
  const { variants, springPresets } = useAnimationEngine();
  const navigate = useNavigate();

  // 使用智能视口检测 - 修复刷新时可见度问题
  const containerView = useSmartInView({ amount: 0.2, lcpOptimization: true });
  const titleView = useSmartInView({ amount: 0.3 });

  // 内部状态管理（如果外部没有传入数据）
  const [internalActivities, setInternalActivities] = useState<UserActivity[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 决定使用外部数据还是内部数据
  const isExternal = externalActivities !== undefined;
  const activities = isExternal ? externalActivities : internalActivities;
  const loading = isExternal ? externalLoading || false : internalLoading;

  // 加载活动数据
  const loadActivities = useCallback(
    async (pageNum: number, append = false) => {
      if (isExternal) return; // 如果使用外部数据，不加载

      try {
        setInternalLoading(true);
        setError(null);

        const response = await API.activity.getRecentActivities({ page: pageNum, limit: 10 });
        const newActivities = Array.isArray(response.data) ? response.data : [];
        const pagination = (response as any).pagination;

        // 后端已按时间排序，直接使用
        if (append) {
          // 追加模式：合并数据并去重
          setInternalActivities((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const uniqueNew = newActivities.filter((a) => !existingIds.has(a.id));
            // 后端已排序，直接追加即可
            return [...prev, ...uniqueNew];
          });
        } else {
          // 初始加载或刷新
          setInternalActivities(newActivities);
        }

        // 更新分页状态
        if (pagination) {
          setHasMore(pageNum < pagination.totalPages);
        } else {
          setHasMore(newActivities.length === 10); // 如果返回10条，可能还有更多
        }
      } catch (err: any) {
        console.error('加载活动失败:', err);
        setError(err instanceof Error ? err : new Error(err?.message || '加载失败'));
        setHasMore(false);
      } finally {
        setInternalLoading(false);
      }
    },
    [isExternal],
  );

  // 初始加载
  React.useEffect(() => {
    if (!isExternal && internalActivities.length === 0 && !internalLoading) {
      loadActivities(1, false);
    }
  }, [isExternal, internalActivities.length, internalLoading, loadActivities]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (isExternal || loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadActivities(nextPage, true);
  }, [isExternal, loading, hasMore, page, loadActivities]);

  // 重新加载
  const reload = useCallback(() => {
    if (isExternal) return;
    setPage(1);
    setHasMore(true);
    loadActivities(1, false);
  }, [isExternal, loadActivities]);

  // 处理活动点击
  const handleActivityClick = (link: string | null | undefined) => {
    if (link && link !== '#') {
      navigate(link);
    }
  };

  return (
    <ContentSection
      ref={containerView.ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={containerView.isInView ? 'visible' : 'hidden'}
      variants={variants.fadeIn}
    >
      <SectionTitle
        ref={titleView.ref as React.RefObject<HTMLHeadingElement>}
        initial="hidden"
        animate={titleView.isInView ? 'visible' : 'hidden'}
        variants={variants.slideInLeft}
        transition={springPresets.gentle}
      >
        文字的「茉莉雨」
      </SectionTitle>

      <FadeScrollContainer dependencies={[activities.length, loading]}>
        <ScrollWrapper>
          <InfiniteScroll
            hasMore={!isExternal && hasMore}
            loading={loading}
            error={error}
            onLoadMore={loadMore}
            onRetry={reload}
            itemCount={activities.length}
            maxHeight="500px"
            threshold={200}
            enableSkeleton={activities.length === 0}
            emptyComponent={
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>暂无活动</div>
            }
          >
            <ActivityGrid initial="hidden" animate="visible" variants={variants.stagger}>
              {activities.map((activity, index) => {
                const formatted = formatActivityText(activity);
                const activityTime = getTimeAgo(activity.timestamp);
                const IconComponent = formatted.icon || FiMapPin;

                return (
                  <ActivityItem
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.link)}
                    variants={variants.listItem}
                    custom={index}
                    whileHover={{ scale: 1.002 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <ActivityHeader>
                      <ActivityIcon color={formatted.color}>
                        <IconComponent size={12} />
                      </ActivityIcon>
                      <ActivityHeaderContent>
                        <ActivityAuthor>{formatted.header}</ActivityAuthor>
                        <ActivityTime>{activityTime}</ActivityTime>
                      </ActivityHeaderContent>
                    </ActivityHeader>
                    {formatted.content && formatted.content.trim() && (
                      <>
                        {formatted.showBubble ? (
                          <ActivityBubble>{formatted.content}</ActivityBubble>
                        ) : (
                          <ActivitySecondary>{formatted.content}</ActivitySecondary>
                        )}
                      </>
                    )}
                  </ActivityItem>
                );
              })}
            </ActivityGrid>
          </InfiniteScroll>
        </ScrollWrapper>
      </FadeScrollContainer>
    </ContentSection>
  );
};

export default ActivitiesSection;
