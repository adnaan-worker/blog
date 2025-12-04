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
  SocketEventMap,
} from '@/types';

// 使用统一的事件类型定义（来自 @/types/socket.ts）
type SocketEvents = SocketEventMap;

// Socket 配置 - 从环境变量读取
const SOCKET_CONFIG = {
  ...getSocketConfig(),
  reconnectDelay: Number(import.meta.env.VITE_SOCKET_RECONNECT_DELAY) || 2000,
  maxReconnectAttempts: Number(import.meta.env.VITE_SOCKET_MAX_RECONNECT_ATTEMPTS) || 2,
  timeout: Number(import.meta.env.VITE_SOCKET_TIMEOUT) || 15000,
} as const;

// 消息状态枚举
enum MessageStatus {
  PENDING = 'pending', // 等待发送
  SENT = 'sent', // 已发送
  CONFIRMED = 'confirmed', // 已确认
  FAILED = 'failed', // 发送失败
}

// 消息队列项
interface QueuedMessage {
  id: string;
  event: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: MessageStatus;
  persistent: boolean; // 是否需要持久化（如 AI 聊天消息）
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// 全局 Socket 管理器（单例 + 事件总线 + 消息队列）
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isConnected = false;
  private isConnecting = false;
  private listeners = new Map<string, Set<Function>>();
  private refCount = 0; // 引用计数
  private reconnectAttempts = 0; // 当前重连次数
  private maxReconnectAttempts = Number(import.meta.env.VITE_SOCKET_MAX_RECONNECT_ATTEMPTS_INTERNAL) || 10; // 最大重连次数
  private reconnectBackoff = 1; // 重连退避倍数
  private heartbeatTimer: NodeJS.Timeout | null = null; // 心跳定时器
  private heartbeatInterval = Number(import.meta.env.VITE_SOCKET_HEARTBEAT_INTERVAL) || 25000; // 心跳间隔
  private inactivityTimer: NodeJS.Timeout | null = null; // 不活跃定时器
  private inactivityTimeout = Number(import.meta.env.VITE_SOCKET_INACTIVITY_TIMEOUT) || 300000; // 无活动后断开时间
  private lastActivityTime = Date.now(); // 最后活动时间
  private visibilityHandler: (() => void) | null = null; // 可见性监听器

  // 消息队列相关
  private messageQueue: Map<string, QueuedMessage> = new Map(); // 消息队列
  private pendingAcks: Map<string, NodeJS.Timeout> = new Map(); // 等待确认的消息
  private ackTimeout = Number(import.meta.env.VITE_SOCKET_ACK_TIMEOUT) || 10000; // ACK 超时时间
  private readonly STORAGE_KEY = 'socket_message_queue'; // localStorage 键
  private readonly MAX_QUEUE_SIZE = Number(import.meta.env.VITE_SOCKET_MAX_QUEUE_SIZE) || 100; // 最大队列大小
  private readonly MESSAGE_EXPIRE_TIME = Number(import.meta.env.VITE_SOCKET_MESSAGE_EXPIRE_TIME) || 86400000; // 消息过期时间
  private queueCleanupTimer: NodeJS.Timeout | null = null; // 队列清理定时器

  private constructor() {
    // 从 localStorage 恢复持久化消息
    this.restorePersistedMessages();
    // 启动定期清理
    this.startQueueCleanup();
  }

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

  // ==================== 消息队列相关方法 ====================

  // 从 localStorage 恢复持久化消息
  private restorePersistedMessages() {
    try {
      const stored = storage.local.get(this.STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        stored.forEach((msg: QueuedMessage) => {
          // 只恢复 MESSAGE_EXPIRE_TIME 内的消息
          if (Date.now() - msg.timestamp < this.MESSAGE_EXPIRE_TIME) {
            this.messageQueue.set(msg.id, msg);
          }
        });
        console.log(`[Socket] 恢复了 ${this.messageQueue.size} 条持久化消息`);
      }
    } catch (error) {
      console.error('[Socket] 恢复持久化消息失败:', error);
    }
  }

  // 持久化消息到 localStorage
  private persistMessages() {
    try {
      const persistentMessages = Array.from(this.messageQueue.values()).filter((msg) => msg.persistent);
      storage.local.set(this.STORAGE_KEY, persistentMessages);
    } catch (error) {
      console.error('[Socket] 持久化消息失败:', error);
    }
  }

  // 添加消息到队列（带大小限制）
  private addToQueue(message: QueuedMessage) {
    // 检查队列大小
    if (this.messageQueue.size >= this.MAX_QUEUE_SIZE) {
      console.warn(`[Socket] 队列已满 (${this.MAX_QUEUE_SIZE})，移除最旧的非持久化消息`);

      // 找到最旧的非持久化消息
      const oldestNonPersistent = Array.from(this.messageQueue.values())
        .filter((msg) => !msg.persistent && msg.status !== MessageStatus.SENT)
        .sort((a, b) => a.timestamp - b.timestamp)[0];

      if (oldestNonPersistent) {
        this.removeFromQueue(oldestNonPersistent.id);
        console.log(`[Socket] 已移除过期消息: ${oldestNonPersistent.event}`);
      } else {
        // 如果没有非持久化消息，移除最旧的已确认消息
        const oldestConfirmed = Array.from(this.messageQueue.values())
          .filter((msg) => msg.status === MessageStatus.CONFIRMED)
          .sort((a, b) => a.timestamp - b.timestamp)[0];

        if (oldestConfirmed) {
          this.removeFromQueue(oldestConfirmed.id);
        }
      }
    }

    this.messageQueue.set(message.id, message);
    if (message.persistent) {
      this.persistMessages();
    }
  }

  // 从队列中移除消息
  private removeFromQueue(messageId: string) {
    const message = this.messageQueue.get(messageId);
    this.messageQueue.delete(messageId);

    // 清理 ACK 定时器
    const ackTimer = this.pendingAcks.get(messageId);
    if (ackTimer) {
      clearTimeout(ackTimer);
      this.pendingAcks.delete(messageId);
    }

    // 如果是持久化消息，更新 localStorage
    if (message?.persistent) {
      this.persistMessages();
    }
  }

  // 处理消息队列（发送所有待发送的消息）
  private processQueue() {
    if (!this.socket?.connected) return;

    this.messageQueue.forEach((message) => {
      if (message.status === MessageStatus.PENDING || message.status === MessageStatus.FAILED) {
        this.sendQueuedMessage(message);
      }
    });
  }

  // 发送队列中的单条消息
  private sendQueuedMessage(message: QueuedMessage) {
    if (!this.socket?.connected) {
      message.status = MessageStatus.FAILED;
      return;
    }

    try {
      // 发送消息
      this.socket.emit(message.event, {
        ...message.data,
        _messageId: message.id, // 添加消息 ID 用于确认
      });

      message.status = MessageStatus.SENT;
      message.retryCount++;

      // 设置 ACK 超时
      const ackTimer = setTimeout(() => {
        this.handleAckTimeout(message.id);
      }, this.ackTimeout);

      this.pendingAcks.set(message.id, ackTimer);

      console.log(`[Socket] 消息已发送: ${message.event} (${message.id})`);
    } catch (error) {
      console.error(`[Socket] 发送消息失败: ${message.event}`, error);
      this.retryMessage(message);
    }
  }

  // 处理 ACK 超时
  private handleAckTimeout(messageId: string) {
    const message = this.messageQueue.get(messageId);
    if (!message) return;

    console.warn(`[Socket] 消息 ACK 超时: ${message.event} (${messageId})`);
    this.retryMessage(message);
  }

  // 重试消息
  private retryMessage(message: QueuedMessage) {
    if (message.retryCount >= message.maxRetries) {
      console.error(`[Socket] 消息重试次数已达上限: ${message.event} (${message.id})`);
      message.status = MessageStatus.FAILED;
      message.onError?.({ error: '消息发送失败，已达最大重试次数' });
      this.removeFromQueue(message.id);
      return;
    }

    message.status = MessageStatus.PENDING;

    // 指数退避重试
    const baseDelay = Number(import.meta.env.VITE_SOCKET_RETRY_BASE_DELAY) || 1000;
    const maxDelay = Number(import.meta.env.VITE_SOCKET_RETRY_MAX_DELAY) || 10000;
    const delay = Math.min(baseDelay * Math.pow(2, message.retryCount), maxDelay);
    setTimeout(() => {
      if (this.socket?.connected) {
        this.sendQueuedMessage(message);
      }
    }, delay);
  }

  // 处理消息确认
  private handleMessageAck(messageId: string, response?: any) {
    const message = this.messageQueue.get(messageId);
    if (!message) return;

    message.status = MessageStatus.CONFIRMED;
    message.onSuccess?.(response);
    this.removeFromQueue(messageId);

    console.log(`[Socket] 消息已确认: ${message.event} (${messageId})`);
  }

  // 启动队列定期清理（每5分钟清理一次过期消息）
  private startQueueCleanup() {
    this.stopQueueCleanup();
    this.queueCleanupTimer = setInterval(() => {
      this.cleanExpiredMessages();
    }, 300000); // 5分钟
  }

  // 停止队列清理
  private stopQueueCleanup() {
    if (this.queueCleanupTimer) {
      clearInterval(this.queueCleanupTimer);
      this.queueCleanupTimer = null;
    }
  }

  // 清理过期消息
  private cleanExpiredMessages() {
    const now = Date.now();
    let cleanedCount = 0;

    this.messageQueue.forEach((message, id) => {
      // 清理超过24小时的消息
      if (now - message.timestamp > this.MESSAGE_EXPIRE_TIME) {
        this.removeFromQueue(id);
        cleanedCount++;
      }
      // 清理已确认超过1小时的消息
      else if (message.status === MessageStatus.CONFIRMED && now - message.timestamp > 3600000) {
        this.removeFromQueue(id);
        cleanedCount++;
      }
      // 清理失败次数过多的消息
      else if (message.status === MessageStatus.FAILED && message.retryCount >= message.maxRetries) {
        this.removeFromQueue(id);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`[Socket] 清理了 ${cleanedCount} 条过期消息`);
      this.persistMessages();
    }
  }

  // ==================== Socket 连接相关方法 ====================

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
      reconnectionDelayMax: Number(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY_MAX) || 10000, // 最大延迟
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

      // 处理消息队列（重连后重发未确认的消息）
      console.log(`[Socket] 连接成功，队列中有 ${this.messageQueue.size} 条消息待处理`);
      this.processQueue();

      this.emit('_internal:connect');
      console.log('[Socket] 连接成功');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.isConnecting = false;

      // 将已发送但未确认的消息标记为 PENDING，等待重连后重发
      this.messageQueue.forEach((message) => {
        if (message.status === MessageStatus.SENT) {
          message.status = MessageStatus.PENDING;
          console.log(`[Socket] 消息 ${message.id} 标记为待重发`);
        }
      });

      this.emit('_internal:disconnect');
    });

    // 监听消息确认事件（需要后端支持）
    this.socket.on('message:ack', (data: { messageId: string; success: boolean; response?: any }) => {
      if (data.success) {
        this.handleMessageAck(data.messageId, data.response);
      } else {
        const message = this.messageQueue.get(data.messageId);
        if (message) {
          this.retryMessage(message);
        }
      }
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
    this.stopQueueCleanup();
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
    const reconnectDelay = Number(import.meta.env.VITE_SOCKET_MANUAL_RECONNECT_DELAY) || 100;
    setTimeout(() => this.connect(), reconnectDelay); // 延迟再连接
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

  // 发送事件（支持可靠发送 + 类型安全）
  emit<T extends keyof SocketEvents>(
    event: T,
    data?: SocketEvents[T],
    options?: {
      reliable?: boolean; // 是否使用可靠发送（队列+重试）
      persistent?: boolean; // 是否持久化到 localStorage
      maxRetries?: number; // 最大重试次数
      onSuccess?: (response: any) => void; // 成功回调
      onError?: (error: any) => void; // 失败回调
    },
  ) {
    // 内部事件直接触发本地监听器
    if (event.startsWith('_internal:')) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach((callback) => callback(data));
      }
      return;
    }

    // 可靠发送模式：加入队列
    if (options?.reliable) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const queuedMessage: QueuedMessage = {
        id: messageId,
        event,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: options.maxRetries ?? 3,
        status: MessageStatus.PENDING,
        persistent: options.persistent ?? false,
        onSuccess: options.onSuccess,
        onError: options.onError,
      };

      this.addToQueue(queuedMessage);

      // 如果已连接，立即发送
      if (this.socket?.connected) {
        this.sendQueuedMessage(queuedMessage);
      } else {
        console.log(`[Socket] 未连接，消息已加入队列: ${event} (${messageId})`);
      }
    }
    // 普通发送模式
    else if (this.socket?.connected) {
      this.socket.emit(event, data);
      this.updateActivity(); // 发送消息时更新活动时间
    } else {
      console.warn('[Socket] 未连接，无法发送消息:', event);
      options?.onError?.({ error: 'Socket 未连接' });
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
  const emit = useCallback(
    <T extends keyof SocketEvents>(
      event: T,
      data?: SocketEvents[T],
      options?: Parameters<typeof socketManager.emit>[2],
    ) => {
      socketManager.emit(event, data, options);
    },
    [],
  );

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
 * AI 服务 Hook（性能优化版 + 可靠消息）
 */
export function useAI() {
  const { isConnected, emit, on } = useSocket();

  // 缓存所有方法
  const chat = useCallback(
    (message: string, sessionId: string, onSuccess?: (res: any) => void, onError?: (err: any) => void) =>
      emit(
        'ai:stream_chat',
        { message, sessionId },
        {
          reliable: true, // 启用可靠发送
          persistent: true, // 持久化消息
          maxRetries: 5, // 最多重试 5 次
          onSuccess,
          onError,
        },
      ),
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
 * 消息队列状态 Hook
 */
export function useMessageQueue() {
  const { isConnected } = useSocket();
  const [queueSize, setQueueSize] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // 定期更新队列状态
    const timer = setInterval(() => {
      const manager = SocketManager.getInstance() as any;
      const queue = manager.messageQueue as Map<string, QueuedMessage>;

      setQueueSize(queue.size);
      setPendingCount(
        Array.from(queue.values()).filter(
          (msg) => msg.status === MessageStatus.PENDING || msg.status === MessageStatus.FAILED,
        ).length,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const clearQueue = useCallback(() => {
    const manager = SocketManager.getInstance() as any;
    manager.messageQueue.clear();
    manager.persistMessages();
    setQueueSize(0);
    setPendingCount(0);
  }, []);

  return useMemo(
    () => ({
      isConnected,
      queueSize,
      pendingCount,
      clearQueue,
    }),
    [isConnected, queueSize, pendingCount, clearQueue],
  );
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
