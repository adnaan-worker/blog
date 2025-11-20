/**
 * Socket Hook - 性能优化版
 * 单例模式 + 事件总线 + 自动清理
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketConfig } from '@/utils/config/socket';
import { getDeviceId } from '@/utils/core/device-id';
import { storage } from '@/utils';
import type {
  SocketResponse,
  StatusResponse,
  VisitorStats,
  VisitorActivityData,
  VisitorPageChangeData,
  AIChunkData,
  AIDoneData,
  AIErrorData,
} from '@/types';

// Socket 连接状态枚举
enum SocketStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

// Socket 配置
const SOCKET_CONFIG = {
  ...getSocketConfig(),
  reconnectDelay: 2000,
  maxReconnectAttempts: 2,
  timeout: 15000,
} as const;

// 全局 Socket 管理器（单例 + 事件总线）
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isConnected = false;
  private isConnecting = false;
  private listeners = new Map<string, Set<Function>>();
  private refCount = 0; // 引用计数
  private reconnectAttempts = 0; // 当前重连次数
  private maxReconnectAttempts = 10; // 最大重连次数（增加到10次）
  private reconnectBackoff = 1; // 重连退避倍数
  private heartbeatTimer: NodeJS.Timeout | null = null; // 心跳定时器
  private heartbeatInterval = 25000; // 心跳间隔 25秒
  private inactivityTimer: NodeJS.Timeout | null = null; // 不活跃定时器
  private inactivityTimeout = 300000; // 5分钟无活动后断开
  private lastActivityTime = Date.now(); // 最后活动时间
  private visibilityHandler: (() => void) | null = null; // 可见性监听器

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // 增加引用
  addRef() {
    this.refCount++;
    if (this.refCount === 1) {
      this.connect();
    }
  }

  // 减少引用
  removeRef() {
    this.refCount--;
    if (this.refCount < 0) {
      this.refCount = 0;
    }

    // 如果没有组件使用，启动不活跃检测
    if (this.refCount === 0) {
      this.startInactivityTimer();
    }
  }

  // 连接 Socket
  private connect() {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;
    const token = storage.local.get('token');
    const deviceId = getDeviceId();

    this.socket = io(SOCKET_CONFIG.url, {
      transports: ['websocket', 'polling'],
      auth: {
        token: SOCKET_CONFIG.authKey,
        jwtToken: token || '',
        device_id: deviceId,
      },
      reconnection: true,
      reconnectionDelay: SOCKET_CONFIG.reconnectDelay,
      reconnectionDelayMax: 10000, // 最大延迟10秒
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: SOCKET_CONFIG.timeout,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectBackoff = 1; // 重置退避倍数
      this.lastActivityTime = Date.now();
      this.stopInactivityTimer(); // 停止不活跃定时器
      this.startHeartbeat();
      this.setupVisibilityListener();
      this.emit('_internal:connect');
      console.log('[Socket] 连接成功');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.isConnecting = false;
      this.emit('_internal:disconnect');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;

      // 指数退避策略
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('[Socket] 达到最大重连次数，5分钟后重置');
        this.socket?.disconnect();

        // 5分钟后重置重连次数，允许再次尝试
        setTimeout(() => {
          this.reconnectAttempts = 0;
          this.reconnectBackoff = 1;
          console.log('[Socket] 重连次数已重置，可以再次尝试');
        }, 300000); // 5分钟
      } else {
        // 指数退避
        this.reconnectBackoff = Math.min(this.reconnectBackoff * 1.5, 10);
      }
    });

    // 注册已有的监听器
    this.listeners.forEach((callbacks, event) => {
      if (!event.startsWith('_internal:')) {
        callbacks.forEach((callback) => {
          this.socket?.on(event, callback as any);
        });
      }
    });
  }

  // 断开连接
  private disconnect() {
    this.stopHeartbeat();
    this.stopInactivityTimer();
    this.removeVisibilityListener();

    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners(); // 清理所有监听器
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
  }

  // 启动心跳
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
        this.updateActivity();
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        // 只在未达到最大重连次数时尝试重连
        console.warn('[Socket] 心跳检测到断开，尝试重连');
        this.reconnect();
      }
    }, this.heartbeatInterval);
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 启动不活跃定时器
  private startInactivityTimer() {
    this.stopInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      const inactiveTime = Date.now() - this.lastActivityTime;
      if (inactiveTime >= this.inactivityTimeout && this.refCount === 0) {
        console.log('[Socket] 5分钟无活动，断开连接以节省资源');
        this.disconnect();
      }
    }, this.inactivityTimeout);
  }

  // 停止不活跃定时器
  private stopInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  // 更新活动时间
  private updateActivity() {
    this.lastActivityTime = Date.now();
    this.stopInactivityTimer(); // 有活动时停止不活跃定时器
  }

  // 监听页面可见性变化
  private setupVisibilityListener() {
    if (typeof document === 'undefined' || this.visibilityHandler) return;

    this.visibilityHandler = () => {
      if (document.hidden) {
        console.log('[Socket] 页面隐藏');
        // 页面隐藏时启动不活跃检测
        this.startInactivityTimer();
      } else {
        console.log('[Socket] 页面可见');
        this.updateActivity();

        // 检查连接状态
        if (!this.socket?.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.warn('[Socket] 检测到断开，尝试重连');
          this.reconnect();
        } else if (this.socket?.connected) {
          // 立即发送心跳确认连接
          this.socket.emit('ping');
        }
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  // 移除可见性监听器
  private removeVisibilityListener() {
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  // 手动重连（暴露给外部使用）
  reconnect() {
    console.log('[Socket] 手动重连');
    this.reconnectAttempts = 0;
    this.reconnectBackoff = 1;
    this.disconnect();
    setTimeout(() => this.connect(), 100); // 延迟100ms再连接
  }

  // 监听事件（自动去重）
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event)!;

    // 防止重复添加
    if (callbacks.has(callback)) {
      return () => this.off(event, callback);
    }

    callbacks.add(callback);

    // 只有非内部事件才注册到 socket
    if (!event.startsWith('_internal:')) {
      this.socket?.on(event, callback as any);
    }

    return () => this.off(event, callback);
  }

  // 移除监听
  private off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (!event.startsWith('_internal:')) {
        this.socket?.off(event, callback as any);
      }
      // 如果该事件没有监听器了，删除整个 Set
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // 发送事件
  emit(event: string, data?: any) {
    // 内部事件直接触发本地监听器
    if (event.startsWith('_internal:')) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach((callback) => callback(data));
      }
    } else if (this.socket?.connected) {
      this.socket.emit(event, data);
      this.updateActivity(); // 发送消息时更新活动时间
    } else {
      console.warn('[Socket] 未连接，无法发送消息:', event);
    }
  }

  // 获取连接状态
  getConnected() {
    return this.isConnected;
  }
}

const socketManager = SocketManager.getInstance();

// ==================== Hooks ====================

/**
 * 基础 Socket Hook（性能优化版）
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(socketManager.getConnected());

  useEffect(() => {
    // 增加引用计数
    socketManager.addRef();

    // 监听连接状态变化
    const unsubConnect = socketManager.on('_internal:connect', () => setIsConnected(true));
    const unsubDisconnect = socketManager.on('_internal:disconnect', () => setIsConnected(false));

    return () => {
      unsubConnect();
      unsubDisconnect();
      socketManager.removeRef();
    };
  }, []); // 空依赖，只执行一次

  // 使用 useCallback 缓存函数，避免子组件重渲染
  const emit = useCallback((event: string, ...args: any[]) => {
    socketManager.emit(event, ...args);
  }, []);

  const on = useCallback((event: string, callback: Function) => {
    return socketManager.on(event, callback);
  }, []);

  const reconnect = useCallback(() => {
    socketManager.reconnect();
  }, []);

  return useMemo(
    () => ({
      isConnected,
      emit,
      on,
      reconnect,
    }),
    [isConnected, emit, on, reconnect],
  );
}

/**
 * 状态服务 Hook（性能优化版）
 */
export function useStatus() {
  const { isConnected, emit, on } = useSocket();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!isConnected) return;

    // 监听状态更新
    const unsub = on('status:updated', (response: SocketResponse<StatusResponse>) => {
      if (response.success && response.data) {
        setStatus(response.data);
      }
    });

    // 只在首次连接时请求一次
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      // 延迟请求，避免与连接事件冲突
      setTimeout(() => emit('status:request'), 100);
    }

    return unsub;
  }, [isConnected]); // 移除 emit 和 on 依赖

  return useMemo(() => ({ status, isConnected }), [status, isConnected]);
}

/**
 * 访客服务 Hook（性能优化版）
 */
export function useVisitor() {
  const { isConnected, emit, on } = useSocket();

  // 使用 useCallback 缓存所有方法
  const reportActivity = useCallback((data: VisitorActivityData) => emit('visitor_activity', data), [emit]);

  const reportPageChange = useCallback((data: VisitorPageChangeData) => emit('visitor_page_change', data), [emit]);

  const joinRoom = useCallback((room: string) => emit('join', { room }), [emit]);

  const leaveRoom = useCallback((room: string) => emit('leave', { room }), [emit]);

  const requestStats = useCallback(() => emit('get_visitor_stats'), [emit]);

  const onStatsUpdate = useCallback(
    (callback: (stats: VisitorStats) => void) => on('visitor_stats_update', callback),
    [on],
  );

  const onOnlineUpdate = useCallback(
    (callback: (data: { count: number; timestamp: number }) => void) => on('online_users_update', callback),
    [on],
  );

  const onRoomUpdate = useCallback(
    (callback: (data: { room: string; count: number }) => void) => on('room_count_update', callback),
    [on],
  );

  return useMemo(
    () => ({
      isConnected,
      reportActivity,
      reportPageChange,
      joinRoom,
      leaveRoom,
      requestStats,
      onStatsUpdate,
      onOnlineUpdate,
      onRoomUpdate,
    }),
    [
      isConnected,
      reportActivity,
      reportPageChange,
      joinRoom,
      leaveRoom,
      requestStats,
      onStatsUpdate,
      onOnlineUpdate,
      onRoomUpdate,
    ],
  );
}

/**
 * AI 服务 Hook（性能优化版）
 */
export function useAI() {
  const { isConnected, emit, on } = useSocket();

  // 缓存所有方法
  const chat = useCallback(
    (message: string, sessionId: string) => emit('ai:stream_chat', { message, sessionId }),
    [emit],
  );

  const polish = useCallback(
    (content: string, taskId: string, style?: string) => emit('ai:stream_polish', { content, taskId, style }),
    [emit],
  );

  const improve = useCallback(
    (content: string, taskId: string, improvements?: string) =>
      emit('ai:stream_improve', { content, taskId, improvements }),
    [emit],
  );

  const expand = useCallback(
    (content: string, taskId: string, length?: string) => emit('ai:stream_expand', { content, taskId, length }),
    [emit],
  );

  const summarize = useCallback(
    (content: string, taskId: string, length?: string) => emit('ai:stream_summarize', { content, taskId, length }),
    [emit],
  );

  const translate = useCallback(
    (content: string, taskId: string, targetLang: string) =>
      emit('ai:stream_translate', { content, taskId, targetLang }),
    [emit],
  );

  const cancel = useCallback((taskId: string) => emit('ai:cancel', { taskId }), [emit]);

  const onChunk = useCallback((callback: (data: AIChunkData) => void) => on('ai:chunk', callback), [on]);

  const onDone = useCallback((callback: (data: AIDoneData) => void) => on('ai:done', callback), [on]);

  const onError = useCallback((callback: (data: AIErrorData) => void) => on('ai:error', callback), [on]);

  return useMemo(
    () => ({
      isConnected,
      chat,
      polish,
      improve,
      expand,
      summarize,
      translate,
      cancel,
      onChunk,
      onDone,
      onError,
    }),
    [isConnected, chat, polish, improve, expand, summarize, translate, cancel, onChunk, onDone, onError],
  );
}

/**
 * AI 流式输出 Hook（高级封装）
 */
export function useAIStream() {
  const ai = useAI();
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const taskIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubChunk = ai.onChunk((data) => {
      if (data.taskId === taskIdRef.current) {
        setContent((prev) => prev + data.chunk);
      }
    });

    const unsubDone = ai.onDone((data) => {
      if (data.taskId === taskIdRef.current) {
        setIsStreaming(false);
      }
    });

    const unsubError = ai.onError((data) => {
      if (data.taskId === taskIdRef.current) {
        setIsStreaming(false);
        setError(data.error);
      }
    });

    return () => {
      unsubChunk();
      unsubDone();
      unsubError();
    };
  }, [ai]);

  const start = useCallback(
    (action: 'polish' | 'improve' | 'expand' | 'summarize' | 'translate', text: string, options?: any) => {
      const taskId = `task_${Date.now()}`;
      taskIdRef.current = taskId;
      setIsStreaming(true);
      setContent('');
      setError(null);

      switch (action) {
        case 'polish':
          ai.polish(text, taskId, options?.style);
          break;
        case 'improve':
          ai.improve(text, taskId, options?.improvements);
          break;
        case 'expand':
          ai.expand(text, taskId, options?.length);
          break;
        case 'summarize':
          ai.summarize(text, taskId, options?.length);
          break;
        case 'translate':
          ai.translate(text, taskId, options?.targetLang);
          break;
      }

      return taskId;
    },
    [ai],
  );

  const stop = useCallback(() => {
    if (taskIdRef.current) {
      ai.cancel(taskIdRef.current);
      setIsStreaming(false);
    }
  }, [ai]);

  const reset = useCallback(() => {
    setContent('');
    setError(null);
    setIsStreaming(false);
    taskIdRef.current = null;
  }, []);

  return useMemo(
    () => ({
      isConnected: ai.isConnected,
      isStreaming,
      content,
      error,
      start,
      stop,
      reset,
    }),
    [ai.isConnected, isStreaming, content, error, start, stop, reset],
  );
}

/**
 * 在线人数 Hook
 */
export function useOnlineUsers() {
  const { onOnlineUpdate } = useVisitor();
  const [onlineCount, setOnlineCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const unsub = onOnlineUpdate((data) => {
      setOnlineCount(data.count);
      setLastUpdate(new Date(data.timestamp));
    });
    return unsub;
  }, [onOnlineUpdate]);

  return useMemo(() => ({ onlineCount, lastUpdate }), [onlineCount, lastUpdate]);
}

/**
 * 房间人数 Hook
 */
export function useRoomCount(roomName: string | null) {
  const { onRoomUpdate, onStatsUpdate } = useVisitor();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubRoom = onRoomUpdate((data) => {
      if (data.room === roomName) {
        setCount(data.count);
      }
    });

    const unsubStats = onStatsUpdate((stats) => {
      if (roomName && stats.roomCount && stats.roomCount[roomName] !== undefined) {
        setCount(stats.roomCount[roomName]);
      }
    });

    return () => {
      unsubRoom();
      unsubStats();
    };
  }, [roomName, onRoomUpdate, onStatsUpdate]);

  return count;
}

/**
 * 工具函数：根据路径获取房间名
 */
export function getRoomName(pathname: string): string | null {
  if (pathname === '/' || pathname === '/home') return 'home';
  if (pathname.startsWith('/blog/')) {
    const id = pathname.split('/')[2];
    return id ? `blog_${id}` : null;
  }
  if (pathname === '/blog') return 'blog_list';
  if (pathname.startsWith('/notes/')) {
    const id = pathname.split('/')[2];
    return id ? `note_${id}` : null;
  }
  if (pathname === '/notes') return 'notes_list';
  if (pathname.startsWith('/projects/')) {
    const id = pathname.split('/')[2];
    return id ? `project_${id}` : null;
  }
  if (pathname === '/projects') return 'projects_list';
  if (pathname === '/profile') return 'profile';
  if (pathname.startsWith('/editor')) return 'editor';
  if (pathname === '/about') return 'about';
  return null;
}
