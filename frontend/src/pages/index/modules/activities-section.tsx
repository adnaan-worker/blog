import React, { useState, useCallback, useRef } from 'react';
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
import { useAnimationEngine, useSmartInView, useSpringInteractions } from '@/utils/ui/animation';
import { API } from '@/utils/api';
import { FadeScrollContainer } from '@/components/common';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import type { UserActivity } from '@/types';

// Styled Components
const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
  overflow-x: hidden; /* 防止横向滚动条 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
  & * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  & *::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
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
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ActivityGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 0 0 10px; /* 左侧留出时间线空间 */
  position: relative;
  min-height: 100%;

  /* 连续的时间线 */
  &::before {
    content: '';
    position: absolute;
    left: 21px; /* 对齐图标中心 */
    top: 1.5rem;
    bottom: 1rem;
    width: 1px;
    background: linear-gradient(
      180deg,
      rgba(var(--accent-rgb), 0.1) 0%,
      rgba(var(--accent-rgb), 0.2) 50%,
      rgba(var(--accent-rgb), 0.1) 100%
    );
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 0; /* 移动端去除额外内边距 */
  }
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem 0; /* 更紧凑 */
  position: relative;
  cursor: pointer;
  z-index: 1;

  @media (max-width: 768px) {
    padding-left: 0.5rem; /* 移动端整体左移一点 */
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap; /* 不换行，保持单行 */

  @media (max-width: 768px) {
    gap: 0.5rem;
    flex-wrap: wrap; /* 移动端允许换行 */
  }
`;

const ActivityIcon = styled.div<{ color?: string }>`
  width: 22px; /* 稍微调小 */
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid ${({ color }) => color || 'var(--accent-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-primary); /* 遮挡时间线 */
  box-shadow: 0 0 0 3px var(--bg-primary); /* 外圈间隙 */
  color: ${({ color }) => color || 'var(--accent-color)'};
  font-size: 0.7rem;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;

  ${ActivityItem}:hover & {
    transform: scale(1.15);
    box-shadow:
      0 0 0 3px var(--bg-primary),
      0 0 10px
        ${({ color }) =>
          color
            ? `rgba(${color.startsWith('#') ? parseInt(color.slice(1, 3), 16) + ',' + parseInt(color.slice(3, 5), 16) + ',' + parseInt(color.slice(5, 7), 16) : 'var(--accent-rgb)'}, 0.2)`
            : 'rgba(var(--accent-rgb), 0.2)'};
  }
`;

const ActivityHeaderContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  flex-wrap: wrap; /* 移动端允许换行 */
`;

const ActivityAuthor = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    flex-wrap: wrap;
    white-space: normal;
  }
`;

const ActivityTime = styled.span`
  font-size: 0.7rem;
  color: var(--text-secondary);
  opacity: 0.6;
  flex-shrink: 0;
  margin-left: auto;
  font-family: monospace;
`;

const ActivityBubble = styled.div`
  margin-left: calc(22px + 0.75rem); /* 对齐图标右侧 */
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border-top-left-radius: 0.1rem;
  background: rgba(107, 114, 126, 0.04);
  color: var(--text-primary);
  font-size: 0.8rem;
  line-height: 1.5;
  position: relative;

  & > .clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 限制为2行，更紧凑 */
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  transition: background 0.2s ease;

  [data-theme='dark'] & {
    background: rgba(75, 85, 99, 0.15);
  }

  ${ActivityItem}:hover & {
    background: rgba(107, 114, 126, 0.08);
    [data-theme='dark'] & {
      background: rgba(75, 85, 99, 0.25);
    }
  }

  @media (max-width: 768px) {
    margin-left: calc(22px + 0.5rem);
    padding: 0.4rem 0.6rem;
  }
`;

const ActivitySecondary = styled.div`
  margin-left: calc(22px + 0.75rem);
  font-size: 0.8rem;
  color: var(--text-secondary);

  & > .clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1; /* 限制为1行 */
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    margin-left: calc(22px + 0.5rem);
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
interface ActivitiesSectionProps {}

// 主组件
export const ActivitiesSection: React.FC<ActivitiesSectionProps> = () => {
  // 使用动画引擎 - Spring 系统
  const { variants, springPresets } = useAnimationEngine();
  const navigate = useNavigate();
  const itemInteractions = useSpringInteractions({ hoverScale: 1.002 });

  // 使用智能视口检测 - 修复刷新时可见度问题
  const containerView = useSmartInView({ amount: 0.2, lcpOptimization: true });
  const titleView = useSmartInView({ amount: 0.3 });

  // 内部状态管理
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasInitializedRef = useRef(false); // 标记是否已经进行过初始加载
  const scrollRef = useRef<HTMLDivElement>(null);

  // 使用虚拟滚动 Hook
  const {
    visibleItems,
    visibleRange,
    topSpacer,
    bottomSpacer,
    handleScroll: handleVirtualScroll,
    recordItemHeight,
  } = useVirtualScroll({
    items: activities,
    threshold: 30, // 提高阈值，只有数据量大时才启用虚拟滚动
    estimatedHeight: 100,
    overscan: 8,
  });

  // 加载活动数据
  const loadActivities = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.activity.getRecentActivities({ page: pageNum, limit: 10 });
      const newActivities = Array.isArray(response.data) ? response.data : [];
      const pagination = (response as any).pagination;

      if (append) {
        setActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const uniqueNew = newActivities.filter((a) => !existingIds.has(a.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setActivities(newActivities);
      }

      if (pagination) {
        setHasMore(pageNum < pagination.totalPages);
      } else {
        // 如果返回的数据少于 limit，说明没有更多数据了
        setHasMore(newActivities.length === 10);
      }

      // 如果没有数据且不是追加模式，确保 hasMore 为 false
      if (!append && newActivities.length === 0) {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error('加载活动失败:', err);
      setError(err instanceof Error ? err : new Error(err?.message || '加载失败'));
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载 - 只在组件挂载时执行一次
  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadActivities(1, false);
    }
  }, [loadActivities]);

  // 滚动处理（虚拟滚动 + 加载更多）
  const handleScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollEl;

    // 虚拟滚动计算
    handleVirtualScroll(scrollTop, clientHeight);

    // 距离底部200px时触发加载
    if (!loading && hasMore && scrollTop + clientHeight >= scrollHeight - 200) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadActivities(nextPage, true);
    }
  }, [loading, hasMore, page, loadActivities, handleVirtualScroll]);

  // 重新加载
  const reload = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadActivities(1, false);
  }, [loadActivities]);

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
        <ScrollWrapper ref={scrollRef} onScroll={handleScroll}>
          {activities.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>暂无活动</div>
          ) : (
            <ActivityGrid initial="hidden" animate="visible" variants={variants.stagger}>
              {/* 顶部占位 */}
              {topSpacer > 0 && <div style={{ height: topSpacer }} />}

              {visibleItems.map((activity, index) => {
                const actualIndex = visibleRange.start + index;
                const formatted = formatActivityText(activity);
                const activityTime = getTimeAgo(activity.timestamp);
                const IconComponent = formatted.icon || FiMapPin;

                return (
                  <ActivityItem
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.link)}
                    custom={actualIndex}
                    {...itemInteractions}
                    ref={(el) => {
                      if (el) {
                        recordItemHeight(activity.id, el.offsetHeight);
                      }
                    }}
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
                          <ActivityBubble>
                            <span className="clamp-3">{formatted.content}</span>
                          </ActivityBubble>
                        ) : (
                          <ActivitySecondary>
                            <span className="clamp-2">{formatted.content}</span>
                          </ActivitySecondary>
                        )}
                      </>
                    )}
                  </ActivityItem>
                );
              })}

              {/* 底部占位 */}
              {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}

              {/* 加载状态 */}
              {loading && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)' }}>加载中...</div>
              )}

              {/* 没有更多提示 */}
              {!hasMore && activities.length > 0 && (
                <div
                  style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}
                >
                  已加载全部活动
                </div>
              )}
            </ActivityGrid>
          )}
        </ScrollWrapper>
      </FadeScrollContainer>
    </ContentSection>
  );
};

export default ActivitiesSection;
