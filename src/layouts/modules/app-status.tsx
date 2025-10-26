import React, { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useSocket, useSocketEvents } from '@/hooks/useSocket';
import { FiChrome, FiCode, FiMusic, FiMonitor, FiImage, FiZap, FiMessageCircle, FiVideo } from 'react-icons/fi';

// 应用图片映射（根据 appName 匹配）
const APP_IMAGES: Record<string, string> = {
  Cursor: 'https://cursor.com/marketing-static/favicon.svg',
  'VS Code': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  PyCharm: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pycharm/pycharm-original.svg',
  'IntelliJ IDEA': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg',
  WebStorm: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webstorm/webstorm-original.svg',
  'Sublime Text': 'https://www.sublimetext.com/images/icon.svg',
  Chrome: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg',
  Firefox: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg',
  Edge: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
  Spotify: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg',
  Discord:
    'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.svg',
  网易云音乐:
    'https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/12494165869/fe27/1e09/1dbe/2e61d7d2bd06b1dad7cd892c21d55b74.png',
  QQ音乐: 'https://y.qq.com/favicon.ico',
  PotPlayer: 'https://potplayer.daum.net/img/logo.png',
  VLC: 'https://images.videolan.org/images/vlc-ios-icon.png',
  微信: 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico',
};

// 应用颜色映射
const APP_COLORS: Record<string, string> = {
  Cursor: '#007ACC',
  'VS Code': '#007ACC',
  PyCharm: '#FCF84A',
  'IntelliJ IDEA': '#fe315d',
  WebStorm: '#00CDD7',
  'Sublime Text': '#FF9800',
  Chrome: '#4285F4',
  Firefox: '#FF7139',
  Edge: '#0078D4',
  Spotify: '#1DB954',
  Discord: '#5865F2',
  网易云音乐: '#C20C0C',
  QQ音乐: '#31C27C',
  PotPlayer: '#0090C6',
  VLC: '#FF8800',
  微信: '#09B83E',
  default: '#666666',
};

// 备用图标（当图片加载失败时使用）
const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  Cursor: <FiCode />,
  'VS Code': <FiCode />,
  PyCharm: <FiCode />,
  'IntelliJ IDEA': <FiCode />,
  WebStorm: <FiCode />,
  'Sublime Text': <FiCode />,
  Chrome: <FiChrome />,
  Firefox: <FiChrome />,
  Edge: <FiChrome />,
  Spotify: <FiMusic />,
  Discord: <FiMessageCircle />,
  网易云音乐: <FiMusic />,
  QQ音乐: <FiMusic />,
  PotPlayer: <FiVideo />,
  VLC: <FiVideo />,
  微信: <FiMessageCircle />,
  default: <FiMonitor />,
};

// 状态数据接口
interface StatusData {
  appName: string;
  appIcon: string;
  appType: 'app' | 'music';
  displayInfo: string;
  action: string; // 添加动作状态
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

  /* 图片样式 */
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: ${(props) => (props.size === 'large' ? '4px' : '3px')};
    border-radius: inherit;
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
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  z-index: 1000;
  transition: all 0.2s ease;
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

  // 图片加载错误处理
  const handleImageError = useCallback((appName: string) => {
    setImageErrors((prev) => new Set(prev).add(appName));
  }, []);

  // 构建显示数据（去重：只显示不同的应用）
  const displayApps = useMemo(() => {
    if (!statusData.current) return [];

    // 合并当前状态和历史记录
    const allApps = [statusData.current, ...statusData.history];

    // 去重：只保留应用名称不同的记录
    const uniqueApps: StatusData[] = [];
    const seenApps = new Set<string>();

    for (const app of allApps) {
      if (!seenApps.has(app.appName)) {
        seenApps.add(app.appName);
        uniqueApps.push(app);
        // 最多显示3个不同的应用
        if (uniqueApps.length >= 3) break;
      }
    }

    // 映射为显示数据
    return uniqueApps.map((app, index) => ({
      ...app,
      size: index === 0 ? 'large' : index === 1 ? 'medium' : 'small',
      isActive: index === 0,
      color: APP_COLORS[app.appName] || APP_COLORS.default,
      imageUrl: APP_IMAGES[app.appName],
      fallbackIcon: FALLBACK_ICONS[app.appName] || FALLBACK_ICONS.default,
      hasImageError: imageErrors.has(app.appName),
    }));
  }, [statusData, imageErrors]);

  const userName = 'adnaan';

  // 格式化Tooltip内容
  const getTooltipContent = useCallback(
    (app: StatusData, index: number) => {
      const prefix = index === 0 ? '正在使用' : '最近使用';

      // 直接使用小工具解析的动作状态
      const getAppAction = () => {
        return app.action || '使用中'; // 使用小工具推送的action字段
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
            {/* 优先显示图片，加载失败则显示备用图标 */}
            {app.imageUrl && !app.hasImageError ? (
              <img src={app.imageUrl} alt={app.appName} onError={() => handleImageError(app.appName)} loading="lazy" />
            ) : (
              app.fallbackIcon
            )}
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
