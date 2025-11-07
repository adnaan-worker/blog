import { useState, useEffect, useCallback } from 'react';
import { useSocketEvent } from './useSocket';

/**
 * 在线人数Hook
 * 监听服务器广播的在线人数更新
 */
export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 监听在线人数更新事件
  useSocketEvent(
    'online_users_update',
    useCallback((data: { count: number; timestamp: number }) => {
      setOnlineCount(data.count);
      setLastUpdate(new Date(data.timestamp));
    }, []),
  );

  return {
    onlineCount,
    lastUpdate,
  };
};

export default useOnlineUsers;
