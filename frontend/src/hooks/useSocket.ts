import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket状态接口
export interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnected: Date | null;
}

import { getSocketConfig } from '@/utils/config/socket';
import { getDeviceId } from '@/utils/core/device-id';

// Socket配置 - 使用统一的配置管理
const SOCKET_CONFIG = {
  ...getSocketConfig(),
  reconnectDelay: 2000,
  maxReconnectAttempts: 2,
  timeout: 15000,
};

// 全局Socket管理器类
class SocketManager {
  private socket: Socket | null = null;
  private state: SocketState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnected: null,
  };

  // 状态监听器
  private stateListeners = new Set<(state: SocketState) => void>();

  // 事件监听器
  private eventListeners = new Map<string, Set<(...args: any[]) => void>>();

  // 重连定时器
  private reconnectTimer: NodeJS.Timeout | null = null;

  // 连接Promise（防止重复连接）
  private connectPromise: Promise<boolean> | null = null;

  // 连接监控
  private connectionMonitor: NodeJS.Timeout | null = null;
  private lastActivity: Date = new Date();

  // ✅ 引用计数和自动清理
  private refCount = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;

  // 更新状态并通知所有监听器
  private updateState(updates: Partial<SocketState>) {
    this.state = { ...this.state, ...updates };
    this.stateListeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        // 静默处理监听器错误，避免影响其他监听器
      }
    });
  }

  // 触发事件监听器
  private triggerEventListeners(event: string, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          // 静默处理监听器错误，避免影响其他监听器
        }
      });
    }
  }

  // 设置Socket事件监听
  private setupSocketEvents(socket: Socket) {
    socket.on('connect', () => {
      this.updateState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0,
        lastConnected: new Date(),
      });
      this.clearReconnectTimer();
      this.startConnectionMonitor();
      this.triggerEventListeners('connect');
    });

    socket.on('disconnect', (reason) => {
      this.updateState({
        isConnected: false,
        isConnecting: false,
      });

      this.triggerEventListeners('disconnect', reason);

      // 非主动断开时安排重连
      if (reason !== 'io client disconnect' && this.state.reconnectAttempts < SOCKET_CONFIG.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    });

    socket.on('connect_error', (error) => {
      // 检查是否是认证错误
      const isAuthError =
        error.message?.includes('Authentication') || error.message?.includes('Invalid authentication');

      if (isAuthError) {
        this.updateState({
          isConnected: false,
          isConnecting: false,
          error: `认证失败: ${error.message}`,
        });
        this.triggerEventListeners('connect_error', error);
        return; // 认证错误不重连
      }

      this.updateState({
        isConnected: false,
        isConnecting: false,
        error: `连接失败: ${error.message}`,
      });

      this.triggerEventListeners('connect_error', error);
      this.scheduleReconnect();
    });

    // 处理pong响应
    socket.on('pong', () => {
      this.lastActivity = new Date();
    });

    // 转发所有其他事件（优化：减少 Date 对象创建）
    socket.onAny((event, ...args) => {
      // 只有特定事件才更新活跃时间，减少对象创建
      if (event === 'pong' || event === 'visitor_stats_update' || event === 'room_count_update') {
        this.lastActivity = new Date();
      }
      this.triggerEventListeners(event, ...args);
    });
  }

  // 清理重连定时器
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // 启动连接监控
  private startConnectionMonitor() {
    this.clearConnectionMonitor();

    this.connectionMonitor = setInterval(() => {
      if (this.socket?.connected) {
        // 检查连接活跃度
        const timeSinceActivity = Date.now() - this.lastActivity.getTime();

        // 如果超过60秒没有活动，发送ping测试连接
        if (timeSinceActivity > 60000) {
          this.socket.emit('ping', { timestamp: Date.now() });
        }

        // 如果超过120秒没有活动，认为连接可能有问题，断开重连
        if (timeSinceActivity > 120000) {
          this.socket.disconnect();
        }
      }
    }, 30000); // 每30秒检查一次
  }

  // 清理连接监控
  private clearConnectionMonitor() {
    if (this.connectionMonitor) {
      clearInterval(this.connectionMonitor);
      this.connectionMonitor = null;
    }
  }

  // 安排重连
  private scheduleReconnect() {
    if (this.state.reconnectAttempts >= SOCKET_CONFIG.maxReconnectAttempts) {
      this.updateState({
        error: '达到最大重连次数',
        isConnecting: false,
      });
      return;
    }

    this.clearReconnectTimer();

    const delay = Math.min(SOCKET_CONFIG.reconnectDelay * Math.pow(2, this.state.reconnectAttempts), 30000);

    this.reconnectTimer = setTimeout(() => {
      this.updateState({
        reconnectAttempts: this.state.reconnectAttempts + 1,
        isConnecting: true,
      });
      this.connect();
    }, delay);
  }

  // 连接Socket
  public async connect(): Promise<boolean> {
    // 如果已连接，直接返回成功
    if (this.socket?.connected) {
      return true;
    }

    // 如果正在连接，返回现有Promise
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise<boolean>((resolve) => {
      this.updateState({ isConnecting: true, error: null });

      // 清理旧连接
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // 获取设备唯一ID
      const deviceId = getDeviceId();

      // 创建新连接
      const socket = io(SOCKET_CONFIG.url, {
        transports: ['polling', 'websocket'],
        timeout: SOCKET_CONFIG.timeout,
        forceNew: true,
        reconnection: false, // 禁用自动重连，手动管理
        auth: {
          token: SOCKET_CONFIG.authKey,
          client_type: 'web_client',
          device_id: deviceId, // 添加设备ID用于精准统计在线人数
        },
        extraHeaders: {
          Authorization: SOCKET_CONFIG.authKey,
        },
        // 如果配置了 WebSocket URL，使用它作为 WebSocket 传输的目标
        ...(SOCKET_CONFIG.wsUrl && {
          upgrade: true,
          rememberUpgrade: true,
        }),
      });

      this.socket = socket;
      this.setupSocketEvents(socket);

      // 连接超时处理
      const timeout = setTimeout(() => {
        if (!socket.connected) {
          this.updateState({
            isConnecting: false,
            error: '连接超时',
          });
          resolve(false);
        }
      }, SOCKET_CONFIG.timeout);

      // 监听连接结果
      const onConnect = () => {
        clearTimeout(timeout);
        this.connectPromise = null;
        resolve(true);
      };

      const onError = () => {
        clearTimeout(timeout);
        this.connectPromise = null;
        resolve(false);
      };

      socket.once('connect', onConnect);
      socket.once('connect_error', onError);
    });

    return this.connectPromise;
  }

  // 断开连接
  public disconnect() {
    this.clearReconnectTimer();
    this.clearConnectionMonitor();
    this.clearCleanupTimer();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    });

    this.connectPromise = null;
  }

  // 发送消息
  public emit(event: string, ...args: any[]): boolean {
    if (!this.socket || !this.state.isConnected) {
      return false;
    }
    this.socket.emit(event, ...args);
    return true;
  }

  // ✅ 清理自动断开定时器
  private clearCleanupTimer() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ✅ 启动自动清理定时器
  private startCleanupTimer() {
    this.clearCleanupTimer();

    // 60秒后如果没有监听器，自动断开连接
    this.cleanupTimer = setTimeout(() => {
      const totalListeners = this.stateListeners.size + this.eventListeners.size;
      if (totalListeners === 0 && this.refCount === 0) {
        this.disconnect();
      }
    }, 60000);
  }

  // 添加状态监听器（✅ 带引用计数）
  public addStateListener(listener: (state: SocketState) => void): () => void {
    this.stateListeners.add(listener);
    this.refCount++;
    this.clearCleanupTimer(); // 有新监听器，取消自动清理

    // 立即调用一次，提供当前状态
    listener(this.state);

    return () => {
      this.stateListeners.delete(listener);
      this.refCount--;

      // 如果没有监听器了，启动自动清理定时器
      if (this.stateListeners.size === 0 && this.eventListeners.size === 0) {
        this.startCleanupTimer();
      }
    };
  }

  // 添加事件监听器（✅ 带引用计数）
  public addEventListener(event: string, listener: (...args: any[]) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);
    this.refCount++;
    this.clearCleanupTimer(); // 有新监听器，取消自动清理

    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
      this.refCount--;

      // 如果没有监听器了，启动自动清理定时器
      if (this.stateListeners.size === 0 && this.eventListeners.size === 0) {
        this.startCleanupTimer();
      }
    };
  }

  // 获取当前状态
  public getState(): SocketState {
    return { ...this.state };
  }

  // 获取Socket实例
  public getSocket(): Socket | null {
    return this.socket;
  }

  // 重置状态（用于手动重试）
  public reset() {
    this.clearReconnectTimer();
    this.updateState({
      error: null,
      reconnectAttempts: 0,
    });
  }
}

// 全局Socket管理器实例
const socketManager = new SocketManager();

// 主要的Socket Hook
export const useSocket = () => {
  const [state, setState] = useState<SocketState>(socketManager.getState());

  useEffect(() => {
    const cleanup = socketManager.addStateListener(setState);
    return cleanup;
  }, []);

  const connect = useCallback(() => socketManager.connect(), []);
  const disconnect = useCallback(() => socketManager.disconnect(), []);
  const emit = useCallback((event: string, ...args: any[]) => socketManager.emit(event, ...args), []);
  const reset = useCallback(() => socketManager.reset(), []);

  // 计算连接状态
  const status = useMemo(() => {
    if (state.error) return 'error';
    if (state.isConnecting) return 'connecting';
    if (state.isConnected) return 'connected';
    return 'disconnected';
  }, [state.error, state.isConnecting, state.isConnected]);

  return {
    // 状态
    ...state,
    status,

    // 方法
    connect,
    disconnect,
    emit,
    reset,

    // Socket实例（高级用法，不推荐直接使用）
    socket: socketManager.getSocket(),
  };
};

// Socket事件监听Hook
export const useSocketEvent = (
  event: string | null,
  handler: (...args: any[]) => void,
  options: { enabled?: boolean; deps?: any[] } = {},
) => {
  const { enabled = true, deps = [] } = options;
  const handlerRef = useRef(handler);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 更新handler引用
  handlerRef.current = handler;

  useEffect(() => {
    // 清理之前的监听器
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // 条件监听：event为null或enabled为false时不监听
    if (!event || !enabled) {
      return;
    }

    const stableHandler = (...args: any[]) => {
      try {
        handlerRef.current(...args);
      } catch (error) {
        console.error(`❌ 事件处理器执行失败 (${event}):`, error);
      }
    };

    cleanupRef.current = socketManager.addEventListener(event, stableHandler);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [event, enabled, ...deps]);
};

// 自动连接Hook（可选）
export const useAutoConnect = (enabled: boolean = true) => {
  const { isConnected, isConnecting, error, connect } = useSocket();
  const connectAttemptedRef = useRef(false);

  useEffect(() => {
    // 防止多个组件同时触发连接
    if (enabled && !isConnected && !isConnecting && !error && !connectAttemptedRef.current) {
      connectAttemptedRef.current = true;

      connect().finally(() => {
        // 连接完成后重置标志，允许重新连接
        setTimeout(() => {
          connectAttemptedRef.current = false;
        }, 1000);
      });
    }
  }, [enabled, isConnected, isConnecting, error, connect]);

  // 重置连接标志当enabled变化时
  useEffect(() => {
    if (!enabled) {
      connectAttemptedRef.current = false;
    }
  }, [enabled]);

  return { isConnected, isConnecting, error };
};

// 批量事件监听Hook（简化版）
export const useSocketEvents = (events: Record<string, (...args: any[]) => void>) => {
  const handlersRef = useRef(events);
  handlersRef.current = events;

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const eventKeys = Object.keys(events);

    eventKeys.forEach((event) => {
      const handler = handlersRef.current[event];
      if (event && typeof handler === 'function') {
        const stableHandler = (...args: any[]) => {
          try {
            handlersRef.current[event]?.(...args);
          } catch (error) {
            // 静默处理事件处理器错误
          }
        };

        const cleanup = socketManager.addEventListener(event, stableHandler);
        cleanups.push(cleanup);
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [Object.keys(events).join(',')]); // 只在事件名称变化时重新注册
};

// 导出Socket管理器实例（高级用法）
export { socketManager };
export default useSocket;
