# Socket.IO Hooks 使用指南

## 🚀 快速开始

这个 Socket.IO Hooks 封装提供了简洁、高效的 Socket 通信能力，无需 Context，可以在任何组件中直接使用。

### 基础使用

```tsx
import { useSocket, useSocketEvent, useAutoConnect } from '@/hooks/useSocket';

const MyComponent = () => {
  // 获取Socket状态和方法
  const { isConnected, isConnecting, error, emit, connect, disconnect } = useSocket();

  // 自动连接（可选）
  useAutoConnect(true);

  // 监听事件
  useSocketEvent('message', (data) => {
    console.log('收到消息:', data);
  });

  // 发送消息
  const sendMessage = () => {
    emit('send_message', { text: 'Hello World!' });
  };

  return (
    <div>
      <p>连接状态: {isConnected ? '已连接' : '未连接'}</p>
      {error && <p>错误: {error}</p>}
      <button onClick={sendMessage} disabled={!isConnected}>
        发送消息
      </button>
    </div>
  );
};
```

## 📖 API 文档

### useSocket()

主要的 Socket Hook，返回 Socket 状态和操作方法。

```tsx
const {
  // 状态
  isConnected, // 是否已连接
  isConnecting, // 是否正在连接
  error, // 错误信息
  reconnectAttempts, // 重连次数
  lastConnected, // 最后连接时间

  // 方法
  connect, // 手动连接
  disconnect, // 断开连接
  emit, // 发送事件
  reset, // 重置状态

  // 高级
  socket, // Socket实例
} = useSocket();
```

### useSocketEvent(event, handler)

监听 Socket 事件的 Hook。

```tsx
// 基础用法
useSocketEvent('user_joined', (user) => {
  console.log('用户加入:', user);
});

// 使用useCallback优化
const handleMessage = useCallback((message) => {
  setMessages((prev) => [...prev, message]);
}, []);

useSocketEvent('new_message', handleMessage);
```

### useAutoConnect(enabled)

自动连接 Hook，组件挂载时自动建立连接。

```tsx
// 启用自动连接
const { isConnected } = useAutoConnect(true);

// 条件自动连接
const { isConnected } = useAutoConnect(user.isLoggedIn);
```

## 🎯 使用场景

### 1. 聊天应用

```tsx
const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const { isConnected, emit } = useSocket();

  // 自动连接
  useAutoConnect();

  // 监听新消息
  useSocketEvent(
    'new_message',
    useCallback((message) => {
      setMessages((prev) => [...prev, message]);
    }, []),
  );

  // 监听用户状态
  useSocketEvent(
    'user_status',
    useCallback((status) => {
      console.log('用户状态变化:', status);
    }, []),
  );

  const sendMessage = (text) => {
    if (isConnected) {
      emit('send_message', { text, timestamp: Date.now() });
    }
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.text}</div>
      ))}
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  );
};
```

### 2. 实时状态监控

```tsx
const StatusMonitor = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const { isConnected } = useSocket();

  // 启用自动连接
  useAutoConnect();

  // 请求初始状态
  useSocketEvent(
    'connect',
    useCallback(() => {
      emit('request_status');
    }, []),
  );

  // 监听状态更新
  useSocketEvent(
    'status_update',
    useCallback((status) => {
      setSystemStatus(status);
    }, []),
  );

  return (
    <div>
      <StatusIndicator connected={isConnected} />
      {systemStatus && <SystemInfo data={systemStatus} />}
    </div>
  );
};
```

### 3. 游戏实时同步

```tsx
const GameComponent = () => {
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const { isConnected, emit } = useSocket();

  useAutoConnect();

  // 游戏状态同步
  useSocketEvent('game_state', setGameState);
  useSocketEvent(
    'player_joined',
    useCallback((player) => {
      setPlayers((prev) => [...prev, player]);
    }, []),
  );

  useSocketEvent(
    'player_left',
    useCallback((playerId) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }, []),
  );

  const makeMove = (move) => {
    emit('player_move', { move, playerId: user.id });
  };

  return <GameBoard state={gameState} players={players} onMove={makeMove} connected={isConnected} />;
};
```

## ⚡ 性能优化

### 1. 使用 useCallback 优化事件处理器

```tsx
// ❌ 不好 - 每次渲染都创建新函数
useSocketEvent('message', (data) => {
  setMessages((prev) => [...prev, data]);
});

// ✅ 好 - 使用useCallback
const handleMessage = useCallback((data) => {
  setMessages((prev) => [...prev, data]);
}, []);

useSocketEvent('message', handleMessage);
```

### 2. 条件性监听事件

```tsx
const ConditionalListener = ({ shouldListen }) => {
  const handleData = useCallback((data) => {
    console.log('收到数据:', data);
  }, []);

  // 只在需要时监听
  useSocketEvent(shouldListen ? 'data_stream' : null, handleData);
};
```

### 3. 组件卸载时自动清理

```tsx
// Hook会自动处理清理，无需手动清理
const MyComponent = () => {
  useSocketEvent('some_event', handler); // 组件卸载时自动清理

  return <div>...</div>;
};
```

## 🛠️ 高级用法

### 1. 直接访问 Socket 实例

```tsx
const AdvancedComponent = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // 直接使用Socket.IO API
      socket.on('special_event', handler);

      return () => {
        socket.off('special_event', handler);
      };
    }
  }, [socket]);
};
```

### 2. 手动连接管理

```tsx
const ManualConnection = () => {
  const { isConnected, connect, disconnect, reset } = useSocket();

  const handleConnect = async () => {
    const success = await connect();
    if (!success) {
      console.log('连接失败');
    }
  };

  const handleReconnect = () => {
    reset(); // 重置错误状态
    connect(); // 重新连接
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={isConnected}>
        连接
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        断开
      </button>
      <button onClick={handleReconnect}>重连</button>
    </div>
  );
};
```

### 3. 全局 Socket 管理器

```tsx
import { socketManager } from '@/hooks/useSocket';

// 在非React组件中使用
export const sendNotification = (message) => {
  socketManager.emit('notification', message);
};

// 监听全局事件
socketManager.addEventListener('global_event', (data) => {
  console.log('全局事件:', data);
});
```

## 🔧 配置

Socket 配置通过环境变量设置：

```env
# .env
VITE_SOCKET_URL=http://localhost:8200
VITE_SOCKET_IO_AUTH_KEY=your-auth-key
```

## 🚨 注意事项

1. **事件处理器优化**: 使用`useCallback`包装事件处理器以避免重复注册
2. **条件监听**: 可以传递`null`作为事件名来条件性地监听事件
3. **自动清理**: Hook 会自动清理事件监听器，无需手动清理
4. **全局单例**: 所有 Hook 共享同一个 Socket 实例
5. **错误处理**: 认证错误会停止自动重连，其他错误会触发重连机制

## 📝 类型定义

```tsx
interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnected: Date | null;
}

// Hook返回类型
interface UseSocketReturn extends SocketState {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  emit: (event: string, ...args: any[]) => boolean;
  reset: () => void;
  socket: Socket | null;
}
```
