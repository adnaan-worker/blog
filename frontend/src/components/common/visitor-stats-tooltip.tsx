import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiUsers, FiActivity, FiHeart, FiCoffee, FiStar } from 'react-icons/fi';
import { useVisitor } from '@/hooks/useSocket';
import { useAnimationEngine } from '@/utils/ui/animation';
import type { VisitorStats, VisitorActivity } from '@/types';

interface VisitorStatsTooltipProps {
  isVisible: boolean;
  targetRef: React.RefObject<HTMLElement | null>;
  onlineCount: number;
}

// ==================== 样式组件 ====================

// Tooltip 容器 - 毛玻璃效果
const TooltipContainer = styled(motion.div)<{ visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0; /* Align to the start of the parent wrapper */
  z-index: 1000;
  padding: 0;
  min-width: 320px;
  max-width: 380px;
  border-radius: 16px;
  margin-bottom: 12px;

  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 边框和阴影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  overflow: hidden;

  /* 显示/隐藏 */
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};

  /* 深色模式 */
  [data-theme='dark'] & {
    background: rgba(20, 20, 23, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
      0 20px 40px -10px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    position: fixed; /* Use fixed on mobile for better positioning */
    bottom: 80px; /* Above footer */
    left: 50%;
    transform: translateX(-50%) !important;
    width: 90vw;
    max-width: 400px;
    min-width: auto;
    margin-bottom: 0;
  }
`;

// 小三角指示器 - 移除（移动端不需要，桌面端左对齐不需要）
const Arrow = styled.div`
  display: none;
`;

// 头部
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(var(--bg-secondary-rgb), 0.3);
  border-bottom: 1px solid rgba(var(--border-rgb), 0.1);
`;

const Title = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OnlineCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #10b981;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;

  .pulse-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: #10b981;
      opacity: 0.4;
      animation: ripple 1.5s infinite ease-out;
    }
  }
`;

// 活动列表
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-rgb), 0.1);
    border-radius: 2px;
  }
`;

// 活动项
const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  margin-bottom: 2px;

  &:hover {
    background: rgba(var(--bg-tertiary-rgb), 0.6);
  }
`;

// 图标容器
const IconWrapper = styled.div<{ deviceType: 'desktop' | 'mobile' | 'tablet' }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bg-secondary-rgb), 0.5);
  color: var(--text-secondary);
  border: 1px solid rgba(var(--border-rgb), 0.1);

  svg {
    font-size: 15px;
  }
`;

// 活动内容
const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.div`
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-primary);

  .location {
    font-weight: 600;
    color: var(--text-primary);
  }

  .page {
    color: var(--accent-color);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

// 人数标签
const CountBadge = styled.div`
  flex-shrink: 0;
  padding: 2px 6px;
  background: rgba(var(--text-rgb), 0.05);
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`;

// 空状态
const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: rgba(var(--accent-rgb), 0.08);
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;

    svg {
      font-size: 24px;
    }
  }
`;

// ==================== 工具函数 ====================

// 获取设备图标
const getDeviceIcon = (device: 'desktop' | 'mobile' | 'tablet') => {
  switch (device) {
    case 'desktop':
      return <FiMonitor />;
    case 'mobile':
      return <FiSmartphone />;
    case 'tablet':
      return <FiSmartphone />;
    default:
      return <FiMonitor />;
  }
};

// 生成有趣的文案
const generateActivityText = (activity: VisitorActivity): string => {
  const location = activity.location || '未知星球';
  const pageTitle = activity.pageTitle || '某个角落';

  // 移除设备文字描述，因为左侧已有图标展示，且容易导致文案生硬
  // 专注于"地点"和"行为"的描述，让文案更流畅自然

  const templates = [
    `来自 <span class="location">${location}</span> 的朋友正在浏览 <span class="page">${pageTitle}</span>`,
    `<span class="location">${location}</span> 的访客在 <span class="page">${pageTitle}</span> 驻足`,
    `一位 <span class="location">${location}</span> 的小伙伴正在阅读 <span class="page">${pageTitle}</span>`,
    `有朋友从 <span class="location">${location}</span> 来，正在看 <span class="page">${pageTitle}</span>`,
    `<span class="page">${pageTitle}</span> 吸引了一位 <span class="location">${location}</span> 的客人`,
    `来自 <span class="location">${location}</span> 的读者正在 <span class="page">${pageTitle}</span> 寻找答案`,
  ];

  // 随机选择模板
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
};

// ==================== 主组件 ====================
const VisitorStatsTooltip: React.FC<VisitorStatsTooltipProps> = ({ isVisible, targetRef, onlineCount }) => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { isConnected, requestStats, onStatsUpdate } = useVisitor();

  // 使用动画引擎
  const { variants, springPresets } = useAnimationEngine();

  // 监听访客统计更新
  useEffect(() => {
    const unsub = onStatsUpdate((data) => {
      if (data) {
        setStats(data);
        setLoading(false);
      }
    });
    return unsub;
  }, [onStatsUpdate]);

  // 显示时主动请求数据（使用防抖，避免频繁请求）
  useEffect(() => {
    if (!isVisible) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 延迟请求，避免频繁触发
    const requestTimer = setTimeout(() => {
      if (isConnected) {
        requestStats();
      }
    }, 100);

    // 设置超时，避免一直加载
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(requestTimer);
      clearTimeout(loadingTimeout);
    };
  }, [isVisible, isConnected, requestStats]);

  if (!isVisible) return null;

  // 使用系统动画引擎的变体
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: springPresets.smooth,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 5,
      transition: {
        ...springPresets.snappy,
        damping: springPresets.snappy.damping! * 1.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 2, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...springPresets.snappy,
        delay: i * 0.03,
      },
    }),
  };

  return (
    <TooltipContainer
      ref={tooltipRef}
      visible={isVisible}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      exit="exit"
      variants={tooltipVariants}
      data-tooltip-container
      onClick={(e) => {
        // 阻止点击事件冒泡，防止关闭 tooltip
        e.stopPropagation();
      }}
    >
      <Arrow />

      <Header>
        <Title>
          <FiActivity size={14} />
          访客足迹
        </Title>
        <OnlineCount>
          <span className="pulse-dot" />
          {onlineCount}
        </OnlineCount>
      </Header>

      {loading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springPresets.gentle}
        >
          <EmptyState>
            <motion.div
              className="icon-box"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <FiCoffee />
            </motion.div>
            <div>正在加载实时数据...</div>
          </EmptyState>
        </motion.div>
      ) : stats && stats.activities.length > 0 ? (
        <ActivityList>
          {stats.activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              whileHover={{
                transition: springPresets.snappy,
              }}
            >
              <IconWrapper deviceType={activity.device}>{getDeviceIcon(activity.device)}</IconWrapper>

              <ActivityContent>
                <ActivityText dangerouslySetInnerHTML={{ __html: generateActivityText(activity) }} />
              </ActivityContent>

              {activity.count > 1 && <CountBadge>+{activity.count}</CountBadge>}
            </ActivityItem>
          ))}
        </ActivityList>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}>
          <EmptyState>
            <motion.div
              className="icon-box"
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <FiHeart />
            </motion.div>
            <div>
              暂无访客足迹
              <br />
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>也许下一秒就会有人来敲门</span>
            </div>
          </EmptyState>
        </motion.div>
      )}
    </TooltipContainer>
  );
};

export default VisitorStatsTooltip;
