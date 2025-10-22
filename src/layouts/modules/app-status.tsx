import React, { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useSocket, useSocketEvent, useSocketEvents } from '@/hooks/useSocket';
import { FiChrome, FiCode, FiMusic, FiMonitor, FiImage, FiZap, FiMessageCircle, FiVideo } from 'react-icons/fi';

// 应用图标和颜色映射（简化版）
const APP_ICONS: Record<string, React.ReactNode> = {
  chrome: <FiChrome />,
  firefox: <FiChrome />,
  edge: <FiChrome />,
  vscode: <FiCode />,
  notepad: <FiCode />,
  sublime: <FiCode />,
  photoshop: <FiImage />,
  steam: <FiZap />,
  discord: <FiMessageCircle />,
  spotify: <FiMusic />,
  netease: <FiMusic />,
  qqmusic: <FiMusic />,
  potplayer: <FiVideo />,
  vlc: <FiVideo />,
  default: <FiMonitor />,
};

const APP_COLORS: Record<string, string> = {
  chrome: '#4285F4',
  firefox: '#FF7139',
  edge: '#0078D4',
  vscode: '#007ACC',
  photoshop: '#31A8FF',
  steam: '#1B2838',
  discord: '#5865F2',
  spotify: '#1DB954',
  netease: '#C20C0C',
  default: '#666666',
};

// 状态数据接口
interface StatusData {
  appName: string;
  appIcon: string;
  appType: 'app' | 'music';
  displayInfo: string;
  timestamp: string;
  computer_name: string;
}

// 统一的Socket响应格式
interface SocketResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  source?: string;
}

interface StatusResponse {
  current: StatusData | null;
  history: StatusData[];
}

// 动画定义
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(29, 185, 84, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(29, 185, 84, 0); }
`;

const slideIn = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// 样式组件
const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 50;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const AppIcon = styled.div<{
  color: string;
  size: 'large' | 'medium' | 'small';
  isActive?: boolean;
  isNew?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.size === 'large' ? '32px' : props.size === 'medium' ? '26px' : '22px')};
  height: ${(props) => (props.size === 'large' ? '32px' : props.size === 'medium' ? '26px' : '22px')};
  border-radius: ${(props) => (props.size === 'large' ? '8px' : '6px')};
  background: ${(props) => props.color}20;
  color: ${(props) => props.color};
  font-size: ${(props) => (props.size === 'large' ? '16px' : props.size === 'medium' ? '13px' : '11px')};
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
  opacity: ${(props) => (props.size === 'large' ? 1 : props.size === 'medium' ? 0.8 : 0.6)};
  border: 2px solid ${(props) => (props.isActive ? props.color : 'transparent')};

  ${(props) =>
    props.isNew &&
    css`
      animation: ${slideIn} 0.3s ease forwards;
    `}

  ${(props) =>
    props.isActive &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}

  &:hover {
    transform: translateY(-1px) scale(1.05);
    background: ${(props) => props.color}30;
    box-shadow: 0 2px 8px ${(props) => props.color}40;
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    height: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    font-size: ${(props) => (props.size === 'large' ? '14px' : props.size === 'medium' ? '12px' : '10px')};
  }
`;

const StatusIndicator = styled.div<{ connected: boolean }>`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.connected ? 'var(--success-color)' : 'var(--warning-color)')};
  border: 1px solid var(--bg-primary);

  ${(props) =>
    props.connected &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  z-index: 100;
  transition: opacity 0.2s ease;
  border: 1px solid var(--border-color);

  &:before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
  }
`;

// 主组件
const AppStatus: React.FC = () => {
  // 使用新的Socket Hooks（连接由RootLayout统一管理）
  const { isConnected, emit, error } = useSocket();

  const [statusData, setStatusData] = useState<StatusResponse>({ current: null, history: [] });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // 使用批量事件监听，更简洁
  const socketEvents = useMemo(
    () => ({
      'status:updated': (response: SocketResponse<StatusResponse>) => {
        console.log('📊 收到状态更新:', response);
        if (response.success && response.data) {
          setStatusData(response.data);
          setLastError(null); // 清除错误状态
        } else {
          const errorMsg = response.error || response.message || '状态更新失败';
          console.error('状态更新失败:', errorMsg);
          setLastError(errorMsg);
        }
      },

      'status:current': (response: SocketResponse<StatusResponse> & { isInactive?: boolean }) => {
        console.log('📊 收到当前状态:', response);
        if (response.success && response.data) {
          setStatusData(response.data);
          setLastError(null); // 清除错误状态

          // 如果系统处于不活跃状态，显示相应信息
          if (response.isInactive) {
            console.log('⏸️ 系统处于不活跃状态');
          }
        } else {
          const errorMsg = response.error || response.message || '获取状态失败';
          console.error('获取状态失败:', errorMsg);
          setLastError(errorMsg);
        }
      },

      connect: () => {
        console.log('✅ Socket已连接，请求状态');
        emit('status:request');
      },
    }),
    [emit],
  );

  // 批量注册事件监听
  useSocketEvents(socketEvents);

  // 构建显示数据 - 使用useMemo优化
  const displayApps = useMemo(() => {
    if (!statusData.current) return [];

    const apps = [statusData.current, ...statusData.history.slice(0, 2)];
    return apps.map((app, index) => ({
      ...app,
      size: index === 0 ? 'large' : index === 1 ? 'medium' : 'small',
      isActive: index === 0,
      color: APP_COLORS[app.appIcon] || APP_COLORS.default,
      icon: APP_ICONS[app.appIcon] || APP_ICONS.default,
    }));
  }, [statusData]);

  // 工具提示内容
  const getTooltipContent = useCallback(
    (app: StatusData, index: number) => {
      const prefix = index === 0 ? '正在使用' : '最近使用';
      const icon = app.appType === 'music' ? '🎵' : '🖥️';
      const status = isConnected ? '实时推送' : '离线状态';
      return `${prefix}: ${icon} ${app.displayInfo}\n${status}`;
    },
    [isConnected],
  );

  // 如果没有数据，不渲染
  if (!statusData.current) {
    return null;
  }

  return (
    <StatusContainer>
      {displayApps.map((app, index) => (
        <AppIcon
          key={`${app.timestamp}-${index}`}
          color={app.color}
          size={app.size as 'large' | 'medium' | 'small'}
          isActive={app.isActive}
          isNew={index === 0} // 第一个总是新的
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {app.icon}
          {app.isActive && <StatusIndicator connected={isConnected} />}
          <Tooltip visible={hoveredIndex === index}>{getTooltipContent(app, index)}</Tooltip>
        </AppIcon>
      ))}
    </StatusContainer>
  );
};

export default React.memo(AppStatus);
