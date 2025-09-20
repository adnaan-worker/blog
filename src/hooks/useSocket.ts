import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnectionDelay?: number;
  maxReconnectionAttempts?: number;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  reconnect: () => void;
  getStats: () => {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
    lastConnected: Date | null;
    lastError: string | null;
  };
}

// 获取 Socket.IO URL（优先使用环境变量，其次使用代理）
const getSocketUrl = (): string => {
  // 优先使用环境变量配置的Socket URL
  if (import.meta.env.VITE_SOCKET_URL) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL.replace('ws://', 'http://').replace('/socket.io', '');
    return socketUrl;
  }

  // 开发环境：通过 Vite 代理连接（推荐）
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 使用当前域名和端口，通过 /socket.io 代理到后端
    const proxyUrl = window.location.origin;
    return proxyUrl; // http://localhost:3000，通过 /socket.io 代理到后端
  }

  // 生产环境：使用当前域名
  const productionUrl = window.location.origin;
  return productionUrl;
};

// 默认配置
const DEFAULT_CONFIG: Required<SocketConfig> = {
  url: getSocketUrl(),
  autoConnect: true,
  reconnectionDelay: 2000,
  maxReconnectionAttempts: 5,
};

export const useSocket = (config: SocketConfig = {}): UseSocketReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectedRef = useRef<Date | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  // 清理重连定时器
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // 连接Socket
  const connect = useCallback(async (): Promise<boolean> => {
    // 严格的连接状态检查
    if (socketRef.current?.connected) {
      return true;
    }

    if (isConnecting) {
      return false;
    }

    return new Promise((resolve) => {
      setIsConnecting(true);
      setError(null);

      // 如果已有socket实例且未连接，先断开
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // 创建新的socket实例
      socketRef.current = io(finalConfig.url, {
        transports: ['polling', 'websocket'], // 先polling后websocket
        timeout: 10000,
        forceNew: true,
        reconnection: false, // 我们自己处理重连
        upgrade: true,
        rememberUpgrade: false,
      });

      const socket = socketRef.current;

      // 连接成功
      socket.on('connect', () => {
        console.log('✅ Socket 连接成功');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        lastConnectedRef.current = new Date();
        lastErrorRef.current = null;
        resolve(true);
      });

      // 连接失败
      socket.on('connect_error', (err) => {
        console.error('❌ Socket 连接失败:', err.message);
        setIsConnected(false);
        setIsConnecting(false);
        const errorMessage = `连接失败: ${err.message}`;
        setError(errorMessage);
        lastErrorRef.current = errorMessage;
        resolve(false);
      });

      // 断开连接
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket 断开连接:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        // 如果不是主动断开，尝试重连
        if (reason !== 'io client disconnect') {
          // 直接调用重连逻辑，避免循环依赖
          if (reconnectAttemptsRef.current < finalConfig.maxReconnectionAttempts) {
            clearReconnectTimeout();
            const delay = finalConfig.reconnectionDelay * Math.pow(2, reconnectAttemptsRef.current);
            console.log(`🔄 ${delay}ms 后尝试重连 (第 ${reconnectAttemptsRef.current + 1} 次)`);

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            console.log('🚫 达到最大重连次数，停止重连');
            setError(`重连失败，已达到最大尝试次数 (${finalConfig.maxReconnectionAttempts})`);
          }
        }
      });

      // 通用错误处理
      socket.on('error', (err) => {
        console.error('❌ Socket 错误:', err);
        const errorMessage = typeof err === 'string' ? err : err.message || '未知错误';
        setError(errorMessage);
        lastErrorRef.current = errorMessage;
      });

      // 连接超时处理
      setTimeout(() => {
        if (!socket.connected) {
          console.warn('⏰ Socket 连接超时');
          setIsConnecting(false);
          setError('连接超时');
          lastErrorRef.current = '连接超时';
          resolve(false);
        }
      }, 10000);
    });
  }, [finalConfig.url, isConnecting, finalConfig.maxReconnectionAttempts, finalConfig.reconnectionDelay]);

  // 断开连接
  const disconnect = useCallback(() => {
    clearReconnectTimeout();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimeout]);

  // 发送消息
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 发送事件: ${event}`, data);
    } else {
      console.warn('⚠️ Socket 未连接，无法发送消息');
    }
  }, []);

  // 手动重连
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    clearReconnectTimeout();
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect, clearReconnectTimeout]);

  // 获取统计信息
  const getStats = useCallback(
    () => ({
      connected: isConnected,
      connecting: isConnecting,
      reconnectAttempts: reconnectAttemptsRef.current,
      lastConnected: lastConnectedRef.current,
      lastError: lastErrorRef.current,
    }),
    [isConnected, isConnecting],
  );

  // 自动连接
  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      if (finalConfig.autoConnect && mounted) {
        console.log('🔄 初始化Socket连接...');
        try {
          await connect();
        } catch (error) {
          console.error('❌ 初始连接失败:', error);
        }
      }
    };

    // 延迟初始化，避免React严格模式的双重渲染问题
    const timer = setTimeout(() => {
      initializeConnection();
    }, 100);

    // 清理函数
    return () => {
      mounted = false;
      clearTimeout(timer);
      clearReconnectTimeout();

      // 只在组件卸载时断开连接，不在依赖变化时断开
      if (socketRef.current && socketRef.current.connected) {
        console.log('🔌 组件卸载，断开Socket连接');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [finalConfig.autoConnect]); // 只依赖autoConnect配置

  // 页面可见性变化时的处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && !isConnecting) {
        console.log('📱 页面变为可见，尝试重连');
        reconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, isConnecting, reconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    reconnect,
    getStats,
  };
};

// Socket事件监听Hook
export const useSocketEvent = (eventName: string, handler: (data: any) => void) => {
  const { socket } = useSocket({ autoConnect: false }); // 不自动连接，使用主Hook的连接

  useEffect(() => {
    if (socket && typeof handler === 'function') {
      console.log(`📝 注册事件监听: ${eventName}`);
      socket.on(eventName, handler);

      return () => {
        console.log(`🗑️ 移除事件监听: ${eventName}`);
        socket.off(eventName, handler);
      };
    }
  }, [socket, eventName, handler]);
};

export default useSocket;
