import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useSocket, useSocketEvent } from '@/hooks/useSocketManager';
import { checkSocketConfig } from '@/utils/socket-config';
import {
  FiChrome,
  FiCode,
  FiMusic,
  FiMonitor,
  FiPlay,
  FiHeadphones,
  FiActivity,
  FiImage,
  FiZap,
  FiMessageCircle,
  FiVideo,
} from 'react-icons/fi';

// 应用图标映射 - 使用更通用的图标
const APP_ICON_MAP: Record<string, React.ReactNode> = {
  chrome: <FiChrome />,
  firefox: <FiChrome />,
  edge: <FiChrome />,
  vscode: <FiCode />,
  notepad: <FiCode />,
  sublime: <FiCode />,
  photoshop: <FiImage />,
  steam: <FiZap />,
  discord: <FiMessageCircle />,
  telegram: <FiMessageCircle />,
  spotify: <FiMusic />,
  netease: <FiMusic />,
  qqmusic: <FiMusic />,
  foobar: <FiMusic />,
  winamp: <FiMusic />,
  potplayer: <FiVideo />,
  vlc: <FiVideo />,
  kugou: <FiMusic />,
  kuwo: <FiMusic />,
  aimp: <FiMusic />,
  music: <FiMusic />,
  default: <FiMonitor />,
};

// 应用颜色映射
const APP_COLOR_MAP: Record<string, string> = {
  chrome: '#4285F4',
  firefox: '#FF7139',
  edge: '#0078D4',
  vscode: '#007ACC',
  notepad: '#90EE90',
  sublime: '#FF9800',
  photoshop: '#31A8FF',
  steam: '#1B2838',
  discord: '#5865F2',
  telegram: '#0088CC',
  spotify: '#1DB954',
  netease: '#C20C0C',
  qqmusic: '#31C27C',
  foobar: '#FF6B35',
  winamp: '#FF6600',
  potplayer: '#1976D2',
  vlc: '#FF8800',
  kugou: '#2196F3',
  kuwo: '#FF5722',
  aimp: '#9C27B0',
  music: '#FF6B6B',
  default: '#666666',
};

// 状态数据接口
interface StatusData {
  active_app?: string;
  music_info?: string;
  timestamp: string;
  computer_name: string;
  appIcon: string; // 修改为驼峰命名
  appType: 'app' | 'music'; // 修改为驼峰命名
  appName: string; // 修改为驼峰命名
  displayInfo: string; // 修改为驼峰命名
  created_at: string;
}

interface StatusResponse {
  success: boolean;
  data: {
    current: StatusData | null;
    history: StatusData[];
    total_history: number;
  };
}

// 动画定义
const slideIn = keyframes`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-30px);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(29, 185, 84, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 容器样式
const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 50;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

// 应用图标样式
const AppIcon = styled.div<{
  color: string;
  isActive?: boolean;
  isEntering?: boolean;
  isLeaving?: boolean;
  index: number;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.index === 0 ? '36px' : props.index === 1 ? '28px' : '24px')};
  height: ${(props) => (props.index === 0 ? '36px' : props.index === 1 ? '28px' : '24px')};
  border-radius: ${(props) => (props.index === 0 ? '10px' : '8px')};
  background: ${(props) => props.color}${(props) => (props.index === 0 ? '20' : '15')};
  color: ${(props) => props.color};
  font-size: ${(props) => (props.index === 0 ? '18px' : props.index === 1 ? '14px' : '12px')};
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  border: 2px solid ${(props) => (props.isActive ? props.color : 'transparent')};
  opacity: ${(props) => (props.index === 0 ? 1 : props.index === 1 ? 0.8 : 0.6)};

  animation: ${(props) => {
    if (props.isEntering)
      return css`
        ${slideIn} 0.3s ease forwards
      `;
    if (props.isLeaving)
      return css`
        ${slideOut} 0.3s ease forwards
      `;
    if (props.isActive)
      return css`
        ${pulse} 2s ease-in-out infinite
      `;
    return 'none';
  }};

  &:hover {
    transform: translateY(-2px) scale(${(props) => (props.index === 0 ? 1.05 : 1.1)});
    background: ${(props) => props.color}${(props) => (props.index === 0 ? '30' : '25')};
    box-shadow: 0 4px 12px ${(props) => props.color}30;
    opacity: 1;
  }

  // 音乐播放动画
  ${(props) =>
    props.isActive &&
    props.color === APP_COLOR_MAP.spotify &&
    css`
      svg {
        animation: ${rotate} 3s linear infinite;
      }
    `}

  @media (max-width: 768px) {
    width: ${(props) => (props.index === 0 ? '32px' : props.index === 1 ? '26px' : '22px')};
    height: ${(props) => (props.index === 0 ? '32px' : props.index === 1 ? '26px' : '22px')};
    font-size: ${(props) => (props.index === 0 ? '16px' : props.index === 1 ? '13px' : '11px')};
  }

  @media (max-width: 480px) {
    width: ${(props) => (props.index === 0 ? '28px' : props.index === 1 ? '24px' : '20px')};
    height: ${(props) => (props.index === 0 ? '28px' : props.index === 1 ? '24px' : '20px')};
    font-size: ${(props) => (props.index === 0 ? '14px' : props.index === 1 ? '12px' : '10px')};
  }
`;

// 工具提示样式
const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: normal;
  margin-top: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: max-content;
  max-width: 200px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  z-index: 100;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: translateX(-50%) translateY(${(props) => (props.visible ? '0' : '10px')});
  border: 1px solid var(--border-color);

  &:before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
  }
`;

// 状态指示器
const StatusIndicator = styled.div<{ isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.isOnline ? '#10B981' : '#EF4444')};
  position: absolute;
  top: -2px;
  right: -2px;
  border: 2px solid var(--bg-primary);
`;

// Socket连接状态指示器
const SocketIndicator = styled.div<{ connected: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(props) => (props.connected ? '#10B981' : '#F59E0B')};
  position: absolute;
  top: -1px;
  left: -1px;
  border: 1px solid var(--bg-primary);
  opacity: 0.8;

  ${(props) =>
    props.connected &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

// 应用状态组件
const AppStatus: React.FC = () => {
  const [statusData, setStatusData] = useState<StatusResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatingIcons, setAnimatingIcons] = useState<Set<number>>(new Set());

  // 使用优化后的Socket管理器
  const { isConnected, isConnecting, error, connect, emit, getStats } = useSocket();

  // 使用useRef保存稳定的函数引用
  const connectRef = useRef(connect);
  const emitRef = useRef(emit);

  // 更新函数引用
  connectRef.current = connect;
  emitRef.current = emit;

  // 使用useCallback稳定事件处理器
  const handleStatusUpdate = useCallback((data: StatusResponse['data']) => {
    console.log('📊 收到状态更新:', data);
    setStatusData(data);
    setIsLoading(false);
  }, []);

  const handleStatusCurrent = useCallback((data: StatusResponse['data']) => {
    console.log('📊 收到当前状态:', data);
    setStatusData(data);
    setIsLoading(false);
  }, []);

  const handleConnected = useCallback(() => {
    console.log('✅ Socket连接成功，请求状态');
    emitRef.current('status:request');
  }, []); // 移除emit依赖，使用稳定的ref

  const handleHeartbeat = useCallback((data: { serverTime: number; clientTime: number }) => {
    const latency = data.serverTime - data.clientTime;
    if (latency > 5000) {
      console.warn('⚠️ 网络延迟较高:', latency + 'ms');
    }
  }, []);

  const handleServerShutdown = useCallback((data: { message: string }) => {
    console.warn('⚠️ 服务器即将关闭:', data.message);
    setIsLoading(true);
  }, []);

  const handleConnectError = useCallback((error: any) => {
    console.error('❌ Socket连接错误:', error);
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    console.warn('🔌 Socket连接断开:', reason);
    setIsLoading(true);
  }, []);

  // 监听Socket事件
  useSocketEvent('status:updated', handleStatusUpdate);
  useSocketEvent('status:current', handleStatusCurrent);
  useSocketEvent('connected', handleConnected);
  useSocketEvent('heartbeat_ack', handleHeartbeat);
  useSocketEvent('server_shutdown', handleServerShutdown);
  useSocketEvent('connect_error', handleConnectError);
  useSocketEvent('disconnect', handleDisconnect);

  // 初始化连接和状态获取
  useEffect(() => {
    console.log('🔄 AppStatus初始化，连接状态:', isConnected, '连接中:', isConnecting);

    // 检查Socket配置
    const configCheck = checkSocketConfig();
    if (!configCheck.isValid) {
      console.error('❌ Socket.IO配置不完整，可能导致连接失败');
    }

    // 检查是否有错误状态，如果有则不再尝试连接
    if (error) {
      console.log('🚫 检测到错误状态，跳过连接尝试:', error);
      return;
    }

    let isMounted = true;
    let initializeTimeout: NodeJS.Timeout;

    const initializeConnection = async () => {
      if (!isMounted) return;

      try {
        if (isConnected) {
          // 已连接，直接请求状态
          console.log('✅ Socket已连接，请求状态');
          emitRef.current('status:request');
          setIsLoading(false);
        } else if (!isConnecting) {
          // 未连接且不在连接中，尝试连接
          console.log('🔗 尝试建立Socket连接...');
          const success = await connectRef.current();

          if (!isMounted) return;

          if (success) {
            console.log('✅ Socket连接成功，请求状态');
            // 延迟请求，确保连接稳定
            initializeTimeout = setTimeout(() => {
              if (isMounted) {
                emitRef.current('status:request');
              }
            }, 200);
          } else {
            console.warn('❌ Socket连接失败，等待自动重连');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ 连接初始化失败:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // 防抖：避免快速重复调用
    const debounceTimeout = setTimeout(() => {
      if (isMounted) {
        initializeConnection();
      }
    }, 100);

    // 清理函数
    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
      if (initializeTimeout) {
        clearTimeout(initializeTimeout);
      }
      console.log('🧹 AppStatus组件卸载');
    };
  }, [isConnected, isConnecting, error]); // 添加error依赖，以便在错误状态改变时重新评估

  // 处理状态变化动画
  useEffect(() => {
    if (statusData?.current) {
      // 触发新图标进入动画
      setAnimatingIcons(new Set([0]));
      const timer = setTimeout(() => {
        setAnimatingIcons(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [statusData?.current?.timestamp]);

  if (isLoading || !statusData?.current) {
    return null;
  }

  // 构建显示的应用列表（当前 + 最近2个历史）
  const displayApps = [statusData.current, ...statusData.history.slice(0, 2)].filter(Boolean);

  const getTooltipContent = (app: StatusData, index: number) => {
    const isActive = index === 0;
    const prefix = isActive ? '正在使用' : '最近使用';
    const realtimeStatus = isConnected ? '实时推送' : '离线状态';

    // 统一显示逻辑，不再区分音乐和普通应用
    const displayText = app.displayInfo || app.appName;
    const icon = app.appType === 'music' ? '🎵' : '🖥️';

    return `${prefix}: ${icon} ${displayText}\n${realtimeStatus}`;
  };

  return (
    <StatusContainer>
      {displayApps.map((app, index) => {
        const isActive = index === 0;
        const color = APP_COLOR_MAP[app.appIcon] || APP_COLOR_MAP.default;
        const icon = APP_ICON_MAP[app.appIcon] || APP_ICON_MAP.default;
        const isEntering = animatingIcons.has(index);

        return (
          <AppIcon
            key={`${app.timestamp}-${index}`}
            color={color}
            index={index}
            isActive={isActive}
            isEntering={isEntering}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {icon}
            {isActive && <StatusIndicator isOnline={true} />}
            <SocketIndicator connected={isConnected} />
            <Tooltip visible={hoveredIndex === index}>{getTooltipContent(app, index)}</Tooltip>
          </AppIcon>
        );
      })}
    </StatusContainer>
  );
};

export default AppStatus;
