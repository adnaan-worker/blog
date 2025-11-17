import React, { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useSocket, useSocketEvents } from '@/hooks/useSocket';
import {
  FiChrome,
  FiCode,
  FiMusic,
  FiMonitor,
  FiImage,
  FiZap,
  FiMessageCircle,
  FiVideo,
  FiMoon,
  FiSun,
  FiCoffee,
  FiStar,
} from 'react-icons/fi';
import { getAppIcon, getAppColor } from '@/utils/ui/icons';

// 备用图标（当图片加载失败时使用）
const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  Cursor: <FiCode />,
  Windsurf: <FiCode />,
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
  // 默认状态图标
  深夜休息: <FiMoon />,
  早晨时光: <FiCoffee />,
  工作状态: <FiCode />,
  午间休息: <FiSun />,
  夜间时光: <FiMoon />,
  深夜时光: <FiStar />,
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
  active_app?: string; // 原始应用窗口标题（包含歌曲信息等）
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
  min-width: ${(props) => (props.size === 'large' ? '32px' : props.size === 'medium' ? '26px' : '22px')};
  min-height: ${(props) => (props.size === 'large' ? '32px' : props.size === 'medium' ? '26px' : '22px')};
  max-width: ${(props) => (props.size === 'large' ? '32px' : props.size === 'medium' ? '26px' : '22px')};
  max-height: ${(props) => (props.size === 'large' ? '32px' : props.size === 'medium' ? '26px' : '22px')};
  border-radius: ${(props) => (props.size === 'large' ? '8px' : '6px')};
  background: ${(props) => props.color}20;
  color: ${(props) => props.color};
  font-size: ${(props) => (props.size === 'large' ? '16px' : props.size === 'medium' ? '13px' : '11px')};
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
  opacity: ${(props) => (props.size === 'large' ? 1 : props.size === 'medium' ? 0.8 : 0.6)};
  overflow: visible;

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
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    padding: ${(props) => (props.size === 'large' ? '4px' : '3px')};
    border-radius: inherit;
    display: block;
  }

  @media (max-width: 768px) {
    width: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    height: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    min-width: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    min-height: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    max-width: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
    max-height: ${(props) => (props.size === 'large' ? '28px' : props.size === 'medium' ? '24px' : '20px')};
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
  background: var(--bg-secondary, #f7f9fb);
  color: var(--text-primary, #252525);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  min-width: 200px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  pointer-events: none; /* 始终穿透鼠标事件，避免触发父元素的 onMouseLeave */
  z-index: 1000;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
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
    background: var(--bg-secondary, #f7f9fb);
    border-left: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
    border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  }
`;

const TooltipHeader = styled.div`
  font-weight: 500;
  color: var(--text-primary, #252525);
  margin-bottom: 2px;
`;

const TooltipApp = styled.div`
  font-weight: 600;
  color: var(--accent-color, #5183f5);
  margin-bottom: 2px;
`;

const TooltipDetail = styled.div`
  opacity: 0.8;
  font-size: 0.7rem;
  color: var(--text-secondary, #606060);
`;

// 获取默认状态（当没有实时推送时）
const getDefaultStatus = (): StatusData => {
  const now = new Date();
  const hour = now.getHours();

  // 定义时间段和对应状态
  if (hour >= 0 && hour < 6) {
    // 深夜 0-6点
    return {
      appName: '深夜休息',
      appIcon: 'rest',
      appType: 'app',
      displayInfo: '夜深了，梦中编织着明天的代码~ 😴',
      action: '休息中',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  } else if (hour >= 6 && hour < 9) {
    // 早晨 6-9点
    return {
      appName: '早晨时光',
      appIcon: 'morning',
      appType: 'app',
      displayInfo: '晨光微熹，新的一天即将开启~ ☕',
      action: '准备中',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  } else if (hour >= 9 && hour < 12) {
    // 上午工作 9-12点
    return {
      appName: '工作状态',
      appIcon: 'work',
      appType: 'app',
      displayInfo: '上午工作时光，专注创造价值~ 💻',
      action: '工作中',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  } else if (hour >= 12 && hour < 14) {
    // 午休 12-14点
    return {
      appName: '午间休息',
      appIcon: 'lunch',
      appType: 'app',
      displayInfo: '享受午餐，为下午储备能量~ 🍱',
      action: '午休中',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  } else if (hour >= 14 && hour < 18) {
    // 下午工作 14-18点
    return {
      appName: '工作状态',
      appIcon: 'work',
      appType: 'app',
      displayInfo: '下午时光，让代码如诗般优雅~ ⌨️',
      action: '工作中',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  } else if (hour >= 18 && hour < 22) {
    // 傍晚 18-22点
    return {
      appName: '夜间时光',
      appIcon: 'evening',
      appType: 'app',
      displayInfo: '夜幕降临，是学习充电还是放松娱乐？🌙',
      action: '自由时间',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  } else {
    // 深夜 22-24点
    return {
      appName: '深夜时光',
      appIcon: 'late',
      appType: 'app',
      displayInfo: '夜深了，要不要早点休息呀？✨',
      action: '夜猫子',
      timestamp: new Date().toISOString(),
      computer_name: 'Default',
    };
  }
};

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
    // 如果没有实时数据，使用默认状态
    const currentStatus = statusData.current || getDefaultStatus();

    // 合并当前状态和历史记录
    const allApps = [currentStatus, ...statusData.history];

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
      color: getAppColor(app.appName),
      imageUrl: getAppIcon(app.appName),
      fallbackIcon: FALLBACK_ICONS[app.appName] || FALLBACK_ICONS.default,
      hasImageError: imageErrors.has(app.appName),
    }));
  }, [statusData, imageErrors]);

  const userName = 'adnaan';

  // 格式化Tooltip内容
  const getTooltipContent = useCallback(
    (app: StatusData, index: number) => {
      // 判断是否是默认状态（没有实时推送）
      const isDefaultStatus = app.computer_name === 'Default';

      // 默认状态使用特殊文案
      if (isDefaultStatus) {
        return {
          header: `${userName} 当前状态:`,
          app: app.action, // 直接显示状态（如"休息中"、"工作中"）
          detail: app.displayInfo,
        };
      }

      // 实时状态使用原有逻辑
      const prefix = index === 0 ? '正在使用' : '最近使用';

      // 直接使用小工具解析的动作状态
      const getAppAction = () => {
        return app.action || '使用中'; // 使用小工具推送的action字段
      };

      // 对于音乐类应用，提取歌曲信息
      const getDetailInfo = () => {
        if (app.appType === 'music' && app.active_app) {
          // 从 active_app 中提取歌曲信息
          // 格式: "QQ音乐 - 一千年以后 (2025王者荣耀共创之夜现场) - 林俊杰"
          const parts = app.active_app.split(' - ');
          if (parts.length >= 2) {
            // parts[0]: 应用名, parts[1]: 歌曲名, parts[2]: 艺术家
            const songName = parts[1] || '';
            const artist = parts.slice(2).join(' - ') || '';
            return artist ? `${songName} - ${artist}` : songName;
          }
        }
        return app.displayInfo;
      };

      return {
        header: `${userName} ${prefix}:`,
        app: `${app.appName} ${getAppAction()}`,
        detail: getDetailInfo(),
      };
    },
    [userName],
  );

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
              <img src={app.imageUrl} alt={app.appName} onError={() => handleImageError(app.appName)} />
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
