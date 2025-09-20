import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket状态类型
export interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnected: Date | null;
  lastHeartbeat: Date | null;
}

// Socket管理器接口
export interface SocketManager {
  socket: Socket | null;
  state: SocketState;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  emit: (event: string, data?: any) => boolean;
  reconnect: () => void;
  resetReconnectionState: () => void;
  addEventListener: (event: string, handler: Function) => () => void;
  removeEventListener: (event: string, handler: Function) => void;
  getStats: () => SocketState & { uptime: number };
}

// 配置接口
interface SocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnectionDelay?: number;
  maxReconnectionAttempts?: number;
  heartbeatInterval?: number;
}

// 获取Socket URL
const getSocketUrl = (): string => {
  // 优先使用专门的Socket URL环境变量
  if (import.meta.env.VITE_SOCKET_URL) {
    let socketUrl = import.meta.env.VITE_SOCKET_URL;

    // Socket.IO客户端使用HTTP/HTTPS协议连接，会自动升级到WebSocket
    if (socketUrl.startsWith('ws://')) {
      socketUrl = socketUrl.replace('ws://', 'http://');
    } else if (socketUrl.startsWith('wss://')) {
      socketUrl = socketUrl.replace('wss://', 'https://');
    }

    // 移除路径后缀，让Socket.IO自动处理
    return socketUrl.replace('/socket.io', '');
  }

  // 如果在浏览器环境中
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    // 开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 开发环境通常使用代理，直接使用当前域名
      return window.location.origin;
    }

    // 生产环境，使用当前协议和域名
    const socketProtocol = protocol === 'https:' ? 'https:' : 'http:';
    return `${socketProtocol}//${hostname}${port ? ':' + port : ''}`;
  }

  // 默认回退
  return 'http://localhost:3001';
};

// 默认配置
const DEFAULT_CONFIG: Required<SocketConfig> = {
  url: getSocketUrl(),
  autoConnect: true,
  reconnectionDelay: 2000,
  maxReconnectionAttempts: 10,
  heartbeatInterval: 30000, // 30秒心跳
};

// 全局Socket管理器类
class GlobalSocketManager {
  private socket: Socket | null = null;
  private config: Required<SocketConfig>;
  private state: SocketState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnected: null,
    lastHeartbeat: null,
  };

  private eventListeners = new Map<string, Set<Function>>();
  private stateListeners = new Set<(state: SocketState) => void>();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<boolean> | null = null;
  private startTime = Date.now();

  constructor(config: SocketConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 更新状态并通知监听器
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
  private triggerEventListeners(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`❌ 事件监听器执行失败 (${event}):`, error);
        }
      });
    }
  }

  // 设置Socket事件监听器
  private setupSocketEvents(socket: Socket) {
    // 连接成功
    socket.on('connect', () => {
      console.log('✅ Socket连接成功');
      this.updateState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0,
        lastConnected: new Date(),
        lastHeartbeat: new Date(),
      });
      this.startHeartbeat();
      this.triggerEventListeners('connected', { socketId: socket.id });
    });

    // 连接失败
    socket.on('connect_error', (error) => {
      console.error('❌ Socket连接失败:', error.message);

      // 检查是否是鉴权错误
      const isAuthError =
        error.message &&
        (error.message.includes('Authentication required') || error.message.includes('Invalid authentication token'));

      if (isAuthError) {
        console.error('🔐 鉴权失败，停止重连尝试');
        this.updateState({
          isConnected: false,
          isConnecting: false,
          error: `鉴权失败: ${error.message}`,
          reconnectAttempts: this.config.maxReconnectionAttempts, // 设置为最大值以停止重连
        });
        this.connectionPromise = null;
        this.triggerEventListeners('connect_error', error);
        return; // 不再尝试重连
      }

      this.updateState({
        isConnected: false,
        isConnecting: false,
        error: `连接失败: ${error.message}`,
        reconnectAttempts: this.state.reconnectAttempts + 1,
      });
      this.triggerEventListeners('connect_error', error);
      this.scheduleReconnect();
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.warn('🔌 Socket断开连接:', reason);
      this.updateState({
        isConnected: false,
        isConnecting: false,
      });
      this.stopHeartbeat();
      this.triggerEventListeners('disconnect', reason);

      // 非主动断开时自动重连
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    // 心跳响应
    socket.on('heartbeat_ack', (data) => {
      this.updateState({ lastHeartbeat: new Date() });
      this.triggerEventListeners('heartbeat_ack', data);
    });

    // 服务器关闭通知
    socket.on('server_shutdown', (data) => {
      console.warn('⚠️ 服务器即将关闭:', data.message);
      this.triggerEventListeners('server_shutdown', data);
    });

    // 通用错误处理
    socket.on('error', (error) => {
      console.error('❌ Socket错误:', error);
      this.updateState({ error: typeof error === 'string' ? error : error.message });
      this.triggerEventListeners('error', error);
    });

    // 转发所有其他事件
    const originalOn = socket.on.bind(socket);
    const originalEmit = socket.emit.bind(socket);

    // 拦截所有事件
    socket.onAny((event, ...args) => {
      this.triggerEventListeners(event, args.length === 1 ? args[0] : args);
    });
  }

  // 启动心跳检测
  private startHeartbeat() {
    this.stopHeartbeat();

    const sendHeartbeat = () => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() });

        // 检查心跳超时
        const now = new Date();
        if (this.state.lastHeartbeat) {
          const timeSinceHeartbeat = now.getTime() - this.state.lastHeartbeat.getTime();
          if (timeSinceHeartbeat > 90000) {
            // 90秒超时
            console.warn('⚠️ 心跳超时，重新连接');
            this.reconnect();
            return;
          }
        }

        this.heartbeatTimer = setTimeout(sendHeartbeat, this.config.heartbeatInterval);
      }
    };

    // 立即发送第一次心跳
    sendHeartbeat();
  }

  // 停止心跳检测
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 安排重连
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.state.reconnectAttempts >= this.config.maxReconnectionAttempts) {
      console.error('❌ 达到最大重连次数，停止重连');
      this.updateState({
        error: `重连失败，已达到最大尝试次数 (${this.config.maxReconnectionAttempts})`,
        isConnecting: false,
      });
      this.connectionPromise = null; // 清理连接Promise
      return;
    }

    const delay = Math.min(
      this.config.reconnectionDelay * Math.pow(2, this.state.reconnectAttempts),
      30000, // 最大30秒
    );

    console.log(`🔄 ${delay}ms后尝试重连 (第${this.state.reconnectAttempts + 1}次)`);

    this.reconnectTimer = setTimeout(() => {
      // 再次检查是否超过最大次数
      if (this.state.reconnectAttempts < this.config.maxReconnectionAttempts) {
        this.connect();
      }
    }, delay);
  }

  // 连接Socket
  public async connect(): Promise<boolean> {
    // 如果已达到最大重连次数，拒绝连接
    if (this.state.reconnectAttempts >= this.config.maxReconnectionAttempts) {
      console.log('🚫 已达到最大重连次数，拒绝连接');
      return false;
    }

    // 如果已经在连接中，返回现有Promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // 如果已连接，直接返回成功
    if (this.socket?.connected) {
      return true;
    }

    this.connectionPromise = new Promise<boolean>((resolve) => {
      this.updateState({ isConnecting: true, error: null });

      // 清理旧连接
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // 获取鉴权令牌 - 添加调试信息
      const authToken = import.meta.env.VITE_SOCKET_IO_AUTH_KEY || 'default-socket-key-2024';
      console.log('🔑 使用Socket.IO鉴权令牌:', authToken.substring(0, 8) + '...');

      // 创建新连接
      this.socket = io(this.config.url, {
        transports: ['polling', 'websocket'],
        timeout: 15000,
        forceNew: true,
        reconnection: false,
        upgrade: true,
        rememberUpgrade: false,
        auth: {
          token: authToken,
          client_type: 'web_client',
          version: '1.0',
        },
        extraHeaders: {
          Authorization: authToken,
        },
      });

      this.setupSocketEvents(this.socket);

      // 连接超时处理
      const timeout = setTimeout(() => {
        if (!this.socket?.connected) {
          console.warn('⏰ Socket连接超时');
          this.updateState({
            isConnecting: false,
            error: '连接超时',
            reconnectAttempts: this.state.reconnectAttempts + 1,
          });
          resolve(false);
        }
      }, 15000);

      // 等待连接结果
      const cleanup = () => {
        clearTimeout(timeout);
        this.connectionPromise = null;
      };

      this.socket.on('connect', () => {
        cleanup();
        resolve(true);
      });

      this.socket.on('connect_error', () => {
        cleanup();
        resolve(false);
      });
    });

    return this.connectionPromise;
  }

  // 断开连接
  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

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

    this.connectionPromise = null;
  }

  // 重连
  public reconnect() {
    this.updateState({ reconnectAttempts: 0 });
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  // 发送消息
  public emit(event: string, data?: any): boolean {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      console.log(`📤 发送事件: ${event}`, data);
      return true;
    } else {
      console.warn(`⚠️ Socket未连接，无法发送事件: ${event}`);
      return false;
    }
  }

  // 添加事件监听器
  public addEventListener(event: string, handler: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(handler);
    console.log(`📝 注册事件监听: ${event}`);

    // 返回清理函数
    return () => this.removeEventListener(event, handler);
  }

  // 移除事件监听器
  public removeEventListener(event: string, handler: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
      console.log(`🗑️ 移除事件监听: ${event}`);
    }
  }

  // 添加状态监听器
  public addStateListener(listener: (state: SocketState) => void): () => void {
    this.stateListeners.add(listener);
    // 立即调用一次，提供当前状态
    listener(this.state);

    return () => this.stateListeners.delete(listener);
  }

  // 重置重连状态（用于手动重新开始连接）
  public resetReconnectionState() {
    this.updateState({
      reconnectAttempts: 0,
      error: null,
    });
    console.log('🔄 重置重连状态');
  }

  // 获取统计信息
  public getStats() {
    return {
      ...this.state,
      uptime: Date.now() - this.startTime,
    };
  }

  // 获取当前状态
  public getState(): SocketState {
    return { ...this.state };
  }

  // 获取Socket实例（用于外部访问）
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// 全局Socket管理器实例
const globalSocketManager = new GlobalSocketManager();

// React Context
const SocketContext = createContext<SocketManager | null>(null);

// Hook: 使用Socket管理器
export const useSocketManager = (): SocketManager => {
  const [state, setState] = useState<SocketState>(globalSocketManager.getState());

  useEffect(() => {
    // 监听状态变化
    const cleanup = globalSocketManager.addStateListener(setState);
    return cleanup;
  }, []);

  return {
    socket: globalSocketManager.getSocket(),
    state,
    connect: globalSocketManager.connect.bind(globalSocketManager),
    disconnect: globalSocketManager.disconnect.bind(globalSocketManager),
    emit: globalSocketManager.emit.bind(globalSocketManager),
    reconnect: globalSocketManager.reconnect.bind(globalSocketManager),
    resetReconnectionState: globalSocketManager.resetReconnectionState.bind(globalSocketManager),
    addEventListener: globalSocketManager.addEventListener.bind(globalSocketManager),
    removeEventListener: globalSocketManager.removeEventListener.bind(globalSocketManager),
    getStats: globalSocketManager.getStats.bind(globalSocketManager),
  };
};

// Hook: 监听Socket事件
export const useSocketEvent = (event: string, handler: (data: any) => void) => {
  // 使用useRef保存最新的handler，避免依赖变化
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // 创建稳定的包装函数
    const stableHandler = (data: any) => {
      handlerRef.current(data);
    };

    // 直接使用全局管理器，避免useSocketManager的依赖变化
    const cleanup = globalSocketManager.addEventListener(event, stableHandler);
    return cleanup;
  }, [event]); // 只依赖event，移除socketManager依赖
};

// Hook: 简化的Socket使用（向后兼容）
export const useSocket = () => {
  const socketManager = useSocketManager();

  // 创建稳定的函数引用
  const connect = useCallback(() => socketManager.connect(), [socketManager]);
  const disconnect = useCallback(() => socketManager.disconnect(), [socketManager]);
  const emit = useCallback((event: string, data?: any) => socketManager.emit(event, data), [socketManager]);
  const reconnect = useCallback(() => socketManager.reconnect(), [socketManager]);
  const getStats = useCallback(() => socketManager.getStats(), [socketManager]);

  return {
    socket: socketManager.socket,
    isConnected: socketManager.state.isConnected,
    isConnecting: socketManager.state.isConnecting,
    error: socketManager.state.error,
    connect,
    disconnect,
    emit,
    reconnect,
    getStats,
  };
};

export default globalSocketManager;
