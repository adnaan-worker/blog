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

import { getSocketConfig } from '@/utils/socket-config';

// Socket配置 - 使用统一的配置管理
const SOCKET_CONFIG = {
  ...getSocketConfig(),
  reconnectDelay: 2000,
  maxReconnectAttempts: 5,
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

  // 更新状态并通知所有监听器
  private updateState(updates: Partial<SocketState>) {
    this.state = { ...this.state, ...updates };
    this.stateListeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('❌ 状态监听器执行失败:', error);
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
          console.error(`❌ 事件监听器执行失败 (${event}):`, error);
        }
      });
    }
  }

  // 设置Socket事件监听
  private setupSocketEvents(socket: Socket) {
    socket.on('connect', () => {
      console.log('✅ Socket连接成功');
      this.updateState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0,
        lastConnected: new Date(),
      });
      this.clearReconnectTimer();
      this.startConnectionMonitor(); // 启动连接监控
      this.triggerEventListeners('connect');
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔌 Socket断开连接:', reason);
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
      console.error('❌ Socket连接错误:', error.message);

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

    // 转发所有其他事件
    socket.onAny((event, ...args) => {
      this.lastActivity = new Date(); // 更新活跃时间
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

        // 如果超过120秒没有活动，认为连接可能有问题
        if (timeSinceActivity > 120000) {
          console.warn('⚠️ Socket连接可能异常，准备重连');
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
    console.log(`🔄 ${delay}ms后尝试重连 (第${this.state.reconnectAttempts + 1}次)`);

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

      // 创建新连接
      const socket = io(SOCKET_CONFIG.url, {
        transports: ['polling', 'websocket'],
        timeout: SOCKET_CONFIG.timeout,
        forceNew: true,
        reconnection: false, // 禁用自动重连，手动管理
        auth: {
          token: SOCKET_CONFIG.authKey,
          client_type: 'web_client',
        },
        extraHeaders: {
          Authorization: SOCKET_CONFIG.authKey,
        },
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
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
      console.log(`📤 发送事件: ${event}`, args);
      return true;
    }
    console.warn(`⚠️ Socket未连接，无法发送事件: ${event}`);
    return false;
  }

  // 添加状态监听器
  public addStateListener(listener: (state: SocketState) => void): () => void {
    this.stateListeners.add(listener);
    // 立即调用一次，提供当前状态
    listener(this.state);

    return () => {
      this.stateListeners.delete(listener);
    };
  }

  // 添加事件监听器
  public addEventListener(event: string, listener: (...args: any[]) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);

    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
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

  return {
    // 状态
    ...state,

    // 方法
    connect,
    disconnect,
    emit,
    reset,

    // Socket实例（高级用法）
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
      console.log('🔗 自动连接Socket...');
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

// Socket连接状态管理Hook
export const useSocketStatus = () => {
  const { isConnected, isConnecting, error, lastConnected, reconnectAttempts } = useSocket();

  const status = useMemo(() => {
    if (error) return 'error';
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  }, [isConnected, isConnecting, error]);

  const statusText = useMemo(() => {
    switch (status) {
      case 'connected':
        return '已连接';
      case 'connecting':
        return '连接中...';
      case 'error':
        return `连接错误: ${error}`;
      case 'disconnected':
        return '未连接';
      default:
        return '未知状态';
    }
  }, [status, error]);

  const connectionInfo = useMemo(
    () => ({
      status,
      statusText,
      isOnline: isConnected,
      lastConnected,
      reconnectAttempts,
      hasError: !!error,
    }),
    [status, statusText, isConnected, lastConnected, reconnectAttempts, error],
  );

  return connectionInfo;
};

// 批量事件监听Hook
export const useSocketEvents = (events: Record<string, (...args: any[]) => void>) => {
  const handlersRef = useRef(events);
  handlersRef.current = events;

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    Object.entries(events).forEach(([event, handler]) => {
      if (event && typeof handler === 'function') {
        const stableHandler = (...args: any[]) => {
          try {
            handlersRef.current[event]?.(...args);
          } catch (error) {
            console.error(`❌ 批量事件处理器执行失败 (${event}):`, error);
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

// Socket性能监控Hook
export const useSocketPerformance = () => {
  const [metrics, setMetrics] = useState({
    latency: 0,
    messageCount: 0,
    errorCount: 0,
    uptime: 0,
  });

  const startTime = useRef(Date.now());
  const messageCountRef = useRef(0);
  const errorCountRef = useRef(0);

  useSocketEvent(
    'pong',
    useCallback((data: { timestamp: number }) => {
      const latency = Date.now() - data.timestamp;
      messageCountRef.current++;

      setMetrics((prev) => ({
        ...prev,
        latency,
        messageCount: messageCountRef.current,
        uptime: Date.now() - startTime.current,
      }));
    }, []),
  );

  useSocketEvent(
    'connect_error',
    useCallback(() => {
      errorCountRef.current++;
      setMetrics((prev) => ({
        ...prev,
        errorCount: errorCountRef.current,
      }));
    }, []),
  );

  // 发送ping测试延迟
  const { emit } = useSocket();
  const measureLatency = useCallback(() => {
    emit('ping', { timestamp: Date.now() });
  }, [emit]);

  return {
    metrics,
    measureLatency,
    resetMetrics: useCallback(() => {
      startTime.current = Date.now();
      messageCountRef.current = 0;
      errorCountRef.current = 0;
      setMetrics({
        latency: 0,
        messageCount: 0,
        errorCount: 0,
        uptime: 0,
      });
    }, []),
  };
};

// 导出Socket管理器实例（高级用法）
export { socketManager };
export default useSocket;
