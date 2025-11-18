/**
 * Socket.IO 相关类型定义
 */

// ==================== 基础响应类型 ====================

export interface SocketResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
  source?: string;
}

// ==================== 状态相关类型 ====================

export interface StatusData {
  appName: string;
  appIcon: string;
  appType: 'app' | 'music';
  displayInfo: string;
  action: string;
  timestamp: string;
  computer_name: string;
  active_app?: string;
}

export interface StatusResponse {
  current: StatusData | null;
  history: StatusData[];
  total_history?: number;
}

// ==================== 访客相关类型 ====================

export interface VisitorActivity {
  id: string;
  location: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  page: string;
  pageTitle: string;
  count: number;
}

export interface VisitorStats {
  onlineCount: number;
  activities: VisitorActivity[];
  roomCount?: Record<string, number>;
  timestamp: number;
}

export interface VisitorActivityData {
  location: string;
  device: string;
  browser?: string;
  page: string;
  pageTitle: string;
}

export interface VisitorPageChangeData {
  page: string;
  pageTitle: string;
}

export interface VisitorRoomData {
  room: string;
}

// ==================== AI 相关类型 ====================

export interface AIStreamRequest {
  content: string;
  taskId?: string;
  options?: Record<string, any>;
}

export interface AIChunkData {
  taskId?: string;
  sessionId?: string; // 支持 chat 功能
  chunk: string;
  type?: string;
  action?: string;
}

export interface AIDoneData {
  taskId?: string;
  sessionId?: string; // 支持 chat 功能
  action?: string;
}

export interface AIErrorData {
  taskId?: string;
  sessionId?: string; // 支持 chat 功能
  error: string;
}

export interface AICancelData {
  taskId: string;
}

// ==================== 连接相关类型 ====================

export interface ConnectedData {
  socketId: string;
  serverTime: number;
  message: string;
}

export interface HeartbeatData {
  timestamp: number;
}

export interface HeartbeatAckData {
  serverTime: number;
  clientTime: number;
}

export interface SocketErrorData {
  handler?: string;
  event?: string;
  message: string;
  code?: string;
  type?: string;
}

// ==================== 事件映射类型 ====================

export interface SocketEventMap {
  // 连接事件
  connect: void;
  disconnect: void;
  connected: ConnectedData;
  error: SocketErrorData;

  // 心跳事件
  ping: HeartbeatData;
  pong: HeartbeatData;
  heartbeat: HeartbeatData;
  heartbeat_ack: HeartbeatAckData;

  // 状态事件
  'status:request': void;
  'status:updated': SocketResponse<StatusResponse>;
  'status:push': StatusData;
  'status:inactive': { message: string };

  // 访客事件
  visitor_activity: VisitorActivityData;
  visitor_page_change: VisitorPageChangeData;
  visitor_stats_update: VisitorStats;
  get_visitor_stats: void;
  join: VisitorRoomData;
  leave: VisitorRoomData;

  // AI 事件
  'ai:stream_chat': AIStreamRequest;
  'ai:stream_polish': AIStreamRequest;
  'ai:stream_improve': AIStreamRequest;
  'ai:stream_expand': AIStreamRequest;
  'ai:stream_summarize': AIStreamRequest;
  'ai:stream_translate': AIStreamRequest;
  'ai:chunk': AIChunkData;
  'ai:done': AIDoneData;
  'ai:error': AIErrorData;
  'ai:cancel': AICancelData;
}

// ==================== 类型辅助工具 ====================

/**
 * 获取事件的数据类型
 */
export type SocketEventData<E extends keyof SocketEventMap> = SocketEventMap[E];

/**
 * 事件监听器类型
 */
export type SocketEventListener<E extends keyof SocketEventMap> = (data: SocketEventData<E>) => void;
