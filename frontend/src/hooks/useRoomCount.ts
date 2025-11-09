import { useState, useEffect, useCallback } from 'react';
import { useSocketEvent, useSocket } from './useSocket';

/**
 * 获取房间在线人数 Hook
 * @param roomName - 房间名称（如 "article_123"）
 * @returns 房间在线人数
 */
export const useRoomCount = (roomName: string | null) => {
  const [count, setCount] = useState<number>(0);
  const { isConnected, emit } = useSocket();

  // 监听房间人数更新（实时更新）
  useSocketEvent(
    'room_count_update',
    useCallback(
      (data: { room: string; count: number; timestamp: number }) => {
        if (data.room === roomName) {
          setCount(data.count);
        }
      },
      [roomName],
    ),
  );

  // 监听访客统计更新（包含房间人数，用于初始化和批量更新）
  useSocketEvent(
    'visitor_stats_update',
    useCallback(
      (data: { roomCount?: Record<string, number> }) => {
        if (roomName && data.roomCount?.[roomName] !== undefined) {
          setCount(data.roomCount[roomName]);
        }
      },
      [roomName],
    ),
  );

  // 连接后主动请求房间信息（使用防抖，避免频繁请求）
  useEffect(() => {
    if (!isConnected || !roomName) return;

    const timer = setTimeout(() => {
      emit('get_visitor_stats');
    }, 300); // 延迟 300ms，避免频繁请求

    return () => clearTimeout(timer);
  }, [isConnected, roomName, emit]);

  return count;
};

/**
 * 从 URL 路径中提取文章/手记 ID
 * 注意：只有详情页（/blog/:id 或 /notes/:id）才会有 ID，列表页（/blog 或 /notes）返回 null
 * @param pathname - 路径名（如 "/blog/123" 或 "/notes/456"）
 * @returns 文章/手记 ID，如果不是详情页则返回 null
 */
export const extractArticleId = (pathname: string): number | null => {
  // 匹配 /blog/:id 或 /notes/:id 格式（只匹配数字ID）
  const blogMatch = pathname.match(/^\/blog\/(\d+)/);
  if (blogMatch) {
    return parseInt(blogMatch[1], 10);
  }

  const noteMatch = pathname.match(/^\/notes\/(\d+)/);
  if (noteMatch) {
    return parseInt(noteMatch[1], 10);
  }

  return null;
};

/**
 * 获取当前页面的房间名称
 * 注意：只有详情页才会有房间，列表页返回 null
 * @param pathname - 路径名
 * @returns 房间名称（如 "article_123"），如果不是详情页则返回 null
 */
export const getRoomName = (pathname: string): string | null => {
  const articleId = extractArticleId(pathname);
  if (articleId) {
    return `article_${articleId}`;
  }
  return null;
};

export default useRoomCount;
