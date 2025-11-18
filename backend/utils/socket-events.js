/**
 * Socket.IO 事件名称常量
 * 统一管理所有 Socket 事件名称，避免硬编码
 */

// ==================== 连接相关事件 ====================
const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTED: 'connected',
  PING: 'ping',
  PONG: 'pong',
  HEARTBEAT: 'heartbeat',
  HEARTBEAT_ACK: 'heartbeat_ack',
  ERROR: 'error',
};

// ==================== 状态相关事件 ====================
const STATUS_EVENTS = {
  REQUEST: 'status:request',
  UPDATED: 'status:updated',
  PUSH: 'status:push',
  RESPONSE: 'status:response',
  INACTIVE: 'status:inactive',
};

// ==================== 访客相关事件 ====================
const VISITOR_EVENTS = {
  ACTIVITY: 'visitor_activity',
  PAGE_CHANGE: 'visitor_page_change',
  STATS_UPDATE: 'visitor_stats_update',
  GET_STATS: 'get_visitor_stats',
  JOIN: 'join',
  LEAVE: 'leave',
};

// ==================== AI 相关事件 ====================
const AI_EVENTS = {
  STREAM_CHAT: 'ai:stream_chat',
  STREAM_POLISH: 'ai:stream_polish',
  STREAM_IMPROVE: 'ai:stream_improve',
  STREAM_EXPAND: 'ai:stream_expand',
  STREAM_SUMMARIZE: 'ai:stream_summarize',
  STREAM_TRANSLATE: 'ai:stream_translate',
  CHUNK: 'ai:chunk',
  DONE: 'ai:done',
  ERROR: 'ai:error',
  CANCEL: 'ai:cancel',
  CANCELLED: 'ai:cancelled',
};

// ==================== 在线用户相关事件 ====================
const ONLINE_EVENTS = {
  USERS_UPDATE: 'online_users_update',
  ROOM_COUNT_UPDATE: 'room_count_update',
};

// ==================== 导出所有事件常量 ====================
module.exports = {
  CONNECTION_EVENTS,
  STATUS_EVENTS,
  VISITOR_EVENTS,
  AI_EVENTS,
  ONLINE_EVENTS,

  // 扁平化导出（方便直接使用）
  EVENTS: {
    ...CONNECTION_EVENTS,
    ...STATUS_EVENTS,
    ...VISITOR_EVENTS,
    ...AI_EVENTS,
    ...ONLINE_EVENTS,
  },
};
