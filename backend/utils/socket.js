const { Server } = require('socket.io');
const { logger } = require('./logger');
const visitorStatsService = require('../services/visitor-stats.service');

class SocketManager {
  constructor() {
    this.io = null;
    this.connections = new Map(); // 存储连接信息
    this.onlineDevices = new Map(); // 存储在线设备ID及最后活跃时间
    this.eventHandlers = new Map();
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      startTime: Date.now(),
    };
    // 广播节流控制
    this.broadcastTimer = null;
    this.pendingBroadcast = false;
    this.timers = [];
  }

  initialize(server, options = {}) {
    // 从环境变量获取CORS配置
    const allowedOrigins = process.env.SOCKET_IO_CORS_ORIGIN
      ? process.env.SOCKET_IO_CORS_ORIGIN.split(',').map(origin => origin.trim())
      : process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
          ];

    // 添加WebSocket协议的URL
    const wsOrigins = allowedOrigins.map(origin =>
      origin.replace('http://', 'ws://').replace('https://', 'wss://')
    );
    const allOrigins = [...allowedOrigins, ...wsOrigins];

    // 如果是开发环境，添加本地开发的正则匹配
    if (process.env.NODE_ENV === 'development') {
      allOrigins.push(
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^ws:\/\/localhost:\d+$/,
        /^ws:\/\/127\.0\.0\.1:\d+$/
      );
    }

    // 优化的Socket.IO配置
    const defaultOptions = {
      // CORS配置
      cors: {
        origin: allOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
      },

      // 连接配置优化 - 从环境变量读取
      pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT) || 60000,
      pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL) || 25000,
      upgradeTimeout: parseInt(process.env.SOCKET_IO_UPGRADE_TIMEOUT) || 30000,
      maxHttpBufferSize: parseInt(process.env.SOCKET_IO_MAX_HTTP_BUFFER_SIZE) || 1e6,

      // 传输方式 - 从环境变量读取
      transports: process.env.SOCKET_IO_TRANSPORTS
        ? process.env.SOCKET_IO_TRANSPORTS.split(',').map(t => t.trim())
        : ['polling', 'websocket'],
      allowUpgrades: true,

      // 路径配置
      path: process.env.SOCKET_IO_PATH || '/socket.io',

      // 连接限制
      maxConnections: 1000,

      // Engine.IO配置
      allowEIO3: true,

      // 序列化配置
      parser: require('socket.io-parser'),

      // 适配器配置（如果需要集群）
      // adapter: require("@socket.io/redis-adapter")
    };

    const finalOptions = { ...defaultOptions, ...options };

    this.io = new Server(server, finalOptions);

    // 设置中间件
    this.setupMiddleware();

    // 设置连接处理
    this.setupConnectionHandlers();

    // 设置错误处理
    this.setupErrorHandlers();

    // 启动健康检查
    this.startHealthCheck();

    // 静默初始化（日志由 app.js 统一输出）
  }

  setupMiddleware() {
    // Socket.IO 鉴权中间件 - 第一道防线
    this.io.use((socket, next) => {
      const authToken = socket.handshake.auth.token || socket.handshake.headers.authorization;
      const socketAuthKey = process.env.SOCKET_IO_AUTH_KEY || 'duyong-socket-328';

      // 检查鉴权令牌
      if (!authToken) {
        logger.warn('❌ Socket.IO连接被拒绝: 缺少鉴权令牌', {
          ip: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent'],
        });
        return next(new Error('Authentication required'));
      }

      // 验证令牌
      if (authToken !== socketAuthKey) {
        logger.warn('❌ Socket.IO连接被拒绝: 鉴权令牌无效', {
          ip: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent'],
          providedToken: authToken.substring(0, 8) + '...', // 只记录前8位用于调试
        });
        return next(new Error('Invalid authentication token'));
      }

      logger.info('✅ Socket.IO鉴权通过', {
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'],
      });

      next();
    });

    // 连接认证中间件
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      const userAgent = socket.handshake.headers['user-agent'];
      const deviceId = socket.handshake.auth.device_id; // 获取设备ID

      // 记录连接信息
      socket.clientInfo = {
        ip: socket.handshake.address,
        userAgent: userAgent,
        connectTime: Date.now(),
        isStatusMonitor: userAgent && userAgent.includes('StatusMonitor'),
        authToken: token ? token.substring(0, 8) + '...' : 'none', // 记录令牌前缀用于调试
        deviceId: deviceId || null, // 存储设备ID
      };

      logger.info('🔗 新的Socket.IO连接尝试（已通过鉴权）', {
        socketId: socket.id,
        ip: socket.clientInfo.ip,
        userAgent: userAgent,
        isStatusMonitor: socket.clientInfo.isStatusMonitor,
        deviceId: deviceId ? deviceId.substring(0, 8) + '...' : 'none',
      });

      next();
    });

    // 速率限制中间件
    this.io.use((socket, next) => {
      const clientKey = socket.handshake.address;
      const now = Date.now();

      if (!this.rateLimitMap) {
        this.rateLimitMap = new Map();
      }

      const clientData = this.rateLimitMap.get(clientKey) || {
        connections: 0,
        lastReset: now,
      };

      // 每分钟重置计数
      if (now - clientData.lastReset > 60000) {
        clientData.connections = 0;
        clientData.lastReset = now;
      }

      // 限制每个IP每分钟最多10个连接
      if (clientData.connections >= 10) {
        logger.warn('⚠️ 连接频率限制', { ip: clientKey });
        return next(new Error('连接过于频繁'));
      }

      clientData.connections++;
      this.rateLimitMap.set(clientKey, clientData);

      next();
    });
  }

  setupConnectionHandlers() {
    this.io.on('connection', socket => {
      this.stats.totalConnections++;
      this.stats.activeConnections++;

      // 存储连接信息
      this.connections.set(socket.id, {
        socket,
        connectTime: Date.now(),
        lastActivity: Date.now(),
        messageCount: 0,
        clientInfo: socket.clientInfo,
      });

      logger.info('✅ Socket.IO客户端连接成功', {
        socketId: socket.id,
        totalConnections: this.stats.totalConnections,
        activeConnections: this.stats.activeConnections,
        clientType: socket.clientInfo.isStatusMonitor ? 'StatusMonitor' : 'WebClient',
      });

      // 发送连接确认
      socket.emit('connected', {
        socketId: socket.id,
        serverTime: Date.now(),
        message: '连接成功',
      });

      // 添加设备到在线列表并广播
      this.addOnlineDevice(socket.clientInfo.deviceId, socket.clientInfo.isStatusMonitor);
      this.broadcastOnlineUsers();
      // 设置心跳检测
      this.setupHeartbeat(socket);

      // 注册基础事件处理器
      this.registerBasicHandlers(socket);

      // 注册自定义事件处理器
      this.registerCustomHandlers(socket);

      // 处理断开连接
      socket.on('disconnect', reason => {
        this.handleDisconnect(socket, reason);
      });

      // 处理连接错误
      socket.on('error', error => {
        logger.error('❌ Socket连接错误', {
          socketId: socket.id,
          error: error.message,
        });
      });
    });
  }

  setupHeartbeat(socket) {
    // 心跳检测
    socket.on('heartbeat', data => {
      const connection = this.connections.get(socket.id);
      if (connection) {
        connection.lastActivity = Date.now();
      }

      // 刷新设备活跃时间
      this.refreshDeviceActivity(socket.clientInfo.deviceId, socket.clientInfo.isStatusMonitor);

      // 回复心跳
      socket.emit('heartbeat_ack', {
        serverTime: Date.now(),
        clientTime: data?.timestamp,
      });
    });

    // 定期检查连接活跃度
    const heartbeatInterval = setInterval(() => {
      const connection = this.connections.get(socket.id);
      if (!connection) {
        clearInterval(heartbeatInterval);
        return;
      }

      const now = Date.now();
      const timeSinceActivity = now - connection.lastActivity;

      // 如果超过2分钟没有活动，主动断开
      if (timeSinceActivity > 120000) {
        logger.warn('⚠️ 连接超时，主动断开', {
          socketId: socket.id,
          timeSinceActivity: Math.round(timeSinceActivity / 1000),
        });
        socket.disconnect(true);
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 每30秒检查一次

    // 连接断开时清理定时器
    socket.on('disconnect', () => {
      clearInterval(heartbeatInterval);
    });
  }

  registerBasicHandlers(socket) {
    // 处理ping消息
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // 处理客户端状态查询
    socket.on('status', () => {
      socket.emit('server_status', this.getStats());
    });

    // 处理访客活动上报（前端主动发送完整数据）
    socket.on('visitor_activity', async data => {
      try {
        const { location, device, browser, page, pageTitle } = data;
        const deviceId = socket.clientInfo?.deviceId;

        if (deviceId && !socket.clientInfo.isStatusMonitor) {
          await visitorStatsService.recordActivity({
            deviceId,
            location,
            device,
            browser,
            page,
            pageTitle,
          });

          logger.debug(`📊 收到访客活动: ${location} - ${device} - ${pageTitle}`);
        }
      } catch (error) {
        logger.error('处理访客活动上报失败:', error);
      }
    });

    // 处理页面切换事件（前端提供完整数据）
    socket.on('page_change', async data => {
      try {
        const { page, pageTitle } = data;
        const deviceId = socket.clientInfo?.deviceId;

        if (deviceId && page) {
          await visitorStatsService.updateVisitorPage(deviceId, page, pageTitle);
          logger.debug(`📄 访客切换页面: ${deviceId} -> ${page}`);
        }
      } catch (error) {
        logger.error('处理页面切换事件失败:', error);
      }
    });

    // 处理获取访客统计请求
    socket.on('get_visitor_stats', async () => {
      try {
        const stats = await visitorStatsService.getStats();
        socket.emit('visitor_stats_update', stats);
      } catch (error) {
        logger.error('获取访客统计失败:', error);
      }
    });
  }

  registerCustomHandlers(socket) {
    // 注册所有自定义事件处理器
    for (const [event, handler] of this.eventHandlers) {
      socket.on(event, async data => {
        try {
          const connection = this.connections.get(socket.id);
          if (connection) {
            connection.lastActivity = Date.now();
            connection.messageCount++;
          }

          this.stats.totalMessages++;

          // 执行处理器
          await handler(socket, this.io, data);
        } catch (error) {
          logger.error(`❌ 事件处理失败: ${event}`, {
            socketId: socket.id,
            error: error.message,
            stack: error.stack,
          });

          socket.emit('error', {
            event,
            message: '事件处理失败',
            error: error.message,
          });
        }
      });
    }
  }

  handleDisconnect(socket, reason) {
    this.stats.activeConnections--;

    const connection = this.connections.get(socket.id);
    const duration = connection ? Date.now() - connection.connectTime : 0;

    logger.info('🔌 Socket.IO客户端断开连接', {
      socketId: socket.id,
      reason,
      duration: Math.round(duration / 1000),
      messageCount: connection?.messageCount || 0,
      activeConnections: this.stats.activeConnections,
    });

    // 清理连接记录
    this.connections.delete(socket.id);

    // 检查是否还有该设备的其他连接
    const deviceId = socket.clientInfo?.deviceId;
    const isStatusMonitor = socket.clientInfo?.isStatusMonitor;
    const hasOtherConnections = deviceId
      ? Array.from(this.connections.values()).some(
          conn => conn.clientInfo.deviceId === deviceId && conn.socket.connected
        )
      : false;

    // 从在线列表移除设备（检查是否还有其他连接）并广播
    this.removeOnlineDevice(deviceId, isStatusMonitor);
    this.broadcastOnlineUsers();

    // 移除访客活动（仅在确认没有其他连接时清理，异步，不阻塞断开）
    if (!isStatusMonitor && deviceId && !hasOtherConnections) {
      visitorStatsService.removeActivity(deviceId).catch(err => {
        logger.error('移除访客活动失败:', err);
      });
    }
  }

  setupErrorHandlers() {
    this.io.engine.on('connection_error', err => {
      logger.error('❌ Socket.IO连接错误', {
        code: err.code,
        message: err.message,
        context: err.context,
      });
    });
  }

  startHealthCheck() {
    // ✅ 清理旧定时器（避免内存泄漏）
    this.clearTimers();

    // 每2分钟清理无效连接（降低频率，减少开销）
    this.timers.push(
      setInterval(() => {
        try {
          this.cleanupConnections();
        } catch (error) {
          logger.error('清理连接失败:', error);
        }
      }, 120000)
    );

    // 每5分钟输出统计信息（降低日志频率）
    this.timers.push(
      setInterval(() => {
        try {
          this.logStats();
        } catch (error) {
          logger.error('输出统计信息失败:', error);
        }
      }, 300000)
    );

    // 每90秒清理过期设备（略大于60秒过期时间，确保及时清理）
    this.timers.push(
      setInterval(() => {
        try {
          const cleaned = this.cleanExpiredDevices();
          if (cleaned > 0) {
            // 有设备被清理时才广播更新
            this.broadcastOnlineUsers();
          }
        } catch (error) {
          logger.error('清理过期设备失败:', error);
        }
      }, 90000)
    );

    // 每10分钟清理速率限制缓存
    this.timers.push(
      setInterval(() => {
        try {
          if (this.rateLimitMap) {
            const now = Date.now();
            const toDelete = [];

            // 收集过期的key
            for (const [key, data] of this.rateLimitMap.entries()) {
              if (now - data.lastReset > 600000) {
                toDelete.push(key);
              }
            }

            // 批量删除
            for (const key of toDelete) {
              this.rateLimitMap.delete(key);
            }
          }
        } catch (error) {
          logger.error('清理速率限制缓存失败:', error);
        }
      }, 600000)
    );
  }

  /**
   * 清理所有定时器（防止内存泄漏）
   */
  clearTimers() {
    this.timers.forEach(timer => {
      if (timer) {
        clearInterval(timer);
      }
    });
    this.timers = [];
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    logger.info('🛑 开始关闭 Socket.IO 服务...');

    // 1. 清理所有定时器
    this.clearTimers();

    // 2. 通知所有客户端即将关闭
    this.io.emit('server:shutdown', {
      message: '服务器即将关闭，请重新连接',
      timestamp: Date.now(),
    });

    // 3. 等待1秒让客户端接收消息
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. 断开所有连接
    const sockets = await this.io.fetchSockets();
    for (const socket of sockets) {
      socket.disconnect(true);
    }

    // 5. 关闭 Socket.IO 服务器
    this.io.close();

    logger.info('✅ Socket.IO 服务已关闭');
  }

  cleanupConnections() {
    const now = Date.now();
    let cleaned = 0;

    for (const [socketId, connection] of this.connections.entries()) {
      // 检查socket是否还连接
      if (!connection.socket.connected) {
        this.connections.delete(socketId);
        cleaned++;
        continue;
      }

      // 检查是否超时
      const timeSinceActivity = now - connection.lastActivity;
      if (timeSinceActivity > 300000) {
        // 5分钟
        connection.socket.disconnect(true);
        this.connections.delete(socketId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 清理了 ${cleaned} 个无效连接`);
      this.stats.activeConnections = this.connections.size;
    }
  }

  logStats() {
    const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);

    logger.info('📊 Socket.IO服务状态', {
      activeConnections: this.stats.activeConnections,
      totalConnections: this.stats.totalConnections,
      totalMessages: this.stats.totalMessages,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    });
  }

  // 公共方法
  registerEventHandler(event, handler) {
    this.eventHandlers.set(event, handler);
    // 静默注册（避免日志过多）
  }

  broadcast(event, data, excludeSocket = null) {
    if (excludeSocket) {
      excludeSocket.broadcast.emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }

  // 添加在线设备（内存Map）
  addOnlineDevice(deviceId, isStatusMonitor = false) {
    if (!deviceId || isStatusMonitor) {
      return; // 不统计StatusMonitor
    }

    this.onlineDevices.set(deviceId, Date.now());
    logger.info(`✅ 设备已上线: ${deviceId.substring(0, 8)}... (总计: ${this.onlineDevices.size})`);
  }

  // 移除在线设备（内存Map）
  removeOnlineDevice(deviceId, isStatusMonitor = false) {
    if (!deviceId || isStatusMonitor) {
      return;
    }

    // 检查是否还有该设备的其他连接
    const hasOtherConnections = Array.from(this.connections.values()).some(
      conn => conn.clientInfo.deviceId === deviceId && conn.socket.connected
    );

    if (hasOtherConnections) {
      logger.info(`⚠️ 设备 ${deviceId.substring(0, 8)}... 仍有其他连接，不移除`);
      return;
    }

    this.onlineDevices.delete(deviceId);
    logger.info(`👋 设备已离线: ${deviceId.substring(0, 8)}... (剩余: ${this.onlineDevices.size})`);
  }

  // 刷新设备活跃时间（优化：只在需要时更新）
  refreshDeviceActivity(deviceId, isStatusMonitor = false) {
    if (!deviceId || isStatusMonitor) {
      return;
    }

    // 优化：如果设备存在才更新（避免不必要的Set操作）
    if (this.onlineDevices.has(deviceId)) {
      // 节流优化：只有距离上次更新超过5秒才更新时间戳
      const lastActive = this.onlineDevices.get(deviceId);
      if (Date.now() - lastActive > 5000) {
        this.onlineDevices.set(deviceId, Date.now());
      }
    }
  }

  // 清理过期设备（超过60秒未活跃）- 优化：批量处理
  cleanExpiredDevices() {
    const now = Date.now();
    const expireTime = 60000; // 60秒
    const toDelete = []; // 收集要删除的设备ID

    // 第一遍：收集过期设备ID（避免边遍历边删除）
    for (const [deviceId, lastActive] of this.onlineDevices.entries()) {
      if (now - lastActive > expireTime) {
        toDelete.push(deviceId);
      }
    }

    // 第二遍：批量删除
    if (toDelete.length > 0) {
      for (const deviceId of toDelete) {
        this.onlineDevices.delete(deviceId);
      }
      logger.info(`🧹 清理 ${toDelete.length} 个过期设备 (剩余: ${this.onlineDevices.size})`);
    }

    return toDelete.length;
  }

  // 广播在线人数更新（节流优化，避免频繁广播）
  broadcastOnlineUsers() {
    // 如果已有待执行的广播，标记需要重新广播
    if (this.broadcastTimer) {
      this.pendingBroadcast = true;
      return;
    }

    // 执行广播
    this._doBroadcast();

    // 设置节流：1秒内最多广播1次
    this.broadcastTimer = setTimeout(() => {
      this.broadcastTimer = null;

      // 如果期间有新的广播请求，执行一次
      if (this.pendingBroadcast) {
        this.pendingBroadcast = false;
        this._doBroadcast();
      }
    }, 1000);
  }

  // 实际执行广播的内部方法
  _doBroadcast() {
    // 统计在线设备数（不每次都清理，减少开销）
    const onlineUsers = this.onlineDevices.size;

    this.io.emit('online_users_update', {
      count: onlineUsers,
      timestamp: Date.now(),
    });

    logger.info(`👥 广播在线人数更新: ${onlineUsers}`);
  }

  // 已移除 broadcastVisitorStats 方法
  // 现在只通过 get_visitor_stats 事件按需获取数据

  getStats() {
    return {
      ...this.stats,
      activeConnections: this.connections.size,
      uptime: Date.now() - this.stats.startTime,
    };
  }

  // 获取特定类型的连接
  getConnectionsByType(isStatusMonitor = false) {
    const connections = [];
    for (const connection of this.connections.values()) {
      if (connection.clientInfo.isStatusMonitor === isStatusMonitor) {
        connections.push(connection);
      }
    }
    return connections;
  }

  // 优雅关闭
  async close() {
    logger.info('🔌 正在关闭Socket.IO服务器...');

    // 通知所有客户端即将关闭
    this.io.emit('server_shutdown', {
      message: '服务器即将关闭',
      timestamp: Date.now(),
    });

    // 等待一秒让消息发送完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 关闭所有连接
    for (const connection of this.connections.values()) {
      connection.socket.disconnect(true);
    }

    // 关闭服务器
    this.io.close();

    logger.info('✅ Socket.IO服务器已关闭');
  }
}

module.exports = new SocketManager();
