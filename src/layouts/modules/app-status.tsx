import React, { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useSocket, useSocketEvents } from '@/hooks/useSocket';
import { FiChrome, FiCode, FiMusic, FiMonitor, FiImage, FiZap, FiMessageCircle, FiVideo } from 'react-icons/fi';

// 应用图标和颜色映射
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
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  min-width: 200px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  z-index: 100;
  transition: opacity 0.2s ease;
  border: 1px solid var(--border-color);
  text-align: left;
  line-height: 1.6;

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

const TooltipHeader = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const TooltipApp = styled.div`
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 2px;
`;

const TooltipDetail = styled.div`
  opacity: 0.8;
  font-size: 0.7rem;
  color: var(--text-secondary);
`;

// 主组件
const AppStatus: React.FC = () => {
  const { isConnected, emit } = useSocket();

  const [statusData, setStatusData] = useState<StatusResponse>({ current: null, history: [] });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 使用useCallback优化事件处理器
  const handleStatusUpdated = useCallback((response: SocketResponse<StatusResponse>) => {
    if (response.success && response.data) {
      setStatusData(response.data);
    }
  }, []);

  const handleStatusCurrent = useCallback((response: SocketResponse<StatusResponse> & { isInactive?: boolean }) => {
    if (response.success && response.data) {
      setStatusData(response.data);
    }
  }, []);

  const handleConnect = useCallback(() => {
    emit('status:request');
  }, [emit]);

  // 使用批量事件监听
  const socketEvents = useMemo(
    () => ({
      'status:updated': handleStatusUpdated,
      'status:current': handleStatusCurrent,
      connect: handleConnect,
    }),
    [handleStatusUpdated, handleStatusCurrent, handleConnect],
  );

  useSocketEvents(socketEvents);

  // 构建显示数据
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

  const userName = 'adnaan';

  // 格式化Tooltip内容
  const getTooltipContent = useCallback(
    (app: StatusData, index: number) => {
      const prefix = index === 0 ? '正在使用' : '最近使用';

      // 获取应用状态（编辑/播放等）
      const getAppAction = () => {
        if (app.appType === 'music') return '播放';
        if (app.appName.toLowerCase().includes('code') || app.appName.toLowerCase().includes('editor')) return '编辑';
        if (app.appName.toLowerCase().includes('chrome') || app.appName.toLowerCase().includes('browser'))
          return '浏览';
        return '使用中';
      };

      return {
        header: `${userName} ${prefix}:`,
        app: `${app.appName} ${getAppAction()}`,
        detail: app.displayInfo,
      };
    },
    [userName],
  );

  // 如果没有数据，不渲染
  if (!statusData.current) {
    return null;
  }

  return (
    <StatusContainer>
      {displayApps.map((app, index) => {
        const tooltipContent = getTooltipContent(app, index);

        return (
          <AppIcon
            key={`${app.timestamp}-${index}`}
            color={app.color}
            size={app.size as 'large' | 'medium' | 'small'}
            isActive={app.isActive}
            isNew={index === 0}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {app.icon}
            {app.isActive && <StatusIndicator connected={isConnected} />}
            <Tooltip visible={hoveredIndex === index}>
              <TooltipHeader>{tooltipContent.header}</TooltipHeader>
              <TooltipApp>{tooltipContent.app}</TooltipApp>
              <TooltipDetail>{tooltipContent.detail}</TooltipDetail>
            </Tooltip>
          </AppIcon>
        );
      })}
    </StatusContainer>
  );
};

export default React.memo(AppStatus);
