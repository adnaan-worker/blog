import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiUsers, FiActivity, FiHeart, FiCoffee, FiStar } from 'react-icons/fi';
import { API } from '@/utils/api';
import { useAnimationEngine } from '@/utils/ui/animation';

// ==================== 类型定义 ====================
interface VisitorActivity {
  id: string;
  location: string; // 地区：如 "北京", "上海", "广东深圳"
  device: 'desktop' | 'mobile' | 'tablet'; // 设备类型
  page: string; // 页面路径
  pageTitle: string; // 页面标题
  count: number; // 该组合的人数
}

interface VisitorStats {
  onlineCount: number;
  activities: VisitorActivity[]; // 实时访客动态列表
  timestamp: number;
}

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
  left: 50px;
  z-index: 10000;
  padding: 1rem;
  min-width: 340px;
  max-width: 400px;
  border-radius: 12px;
  margin-bottom: 8px;

  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);

  /* 边框和阴影 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  /* 显示/隐藏 */
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  transition: all 0.2s ease;

  /* 深色模式 */
  [data-theme='dark'] & {
    background: rgba(28, 28, 32, 0.9);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  /* 移动端优化 */
  @media (max-width: 768px) {
    min-width: 280px;
    max-width: 92vw;
    padding: 0.875rem;
    /* 移动端也显示在触发元素左上角 */
    position: absolute;
    bottom: 100%;
    left: 0;
    transform: none;
    margin-bottom: 8px;
    /* 确保在最顶层 */
    z-index: 99999;
  }
`;

// 小三角指示器
const Arrow = styled.div`
  position: absolute;
  bottom: -6px;
  left: 20px;
  transform: rotate(45deg);
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: none;
  border-left: none;
  z-index: -1;

  [data-theme='dark'] & {
    background: rgba(28, 28, 32, 0.9);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* 移动端也显示箭头（相对定位需要箭头） */
  @media (max-width: 768px) {
    display: block;
  }
`;

// 头部
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.875rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 226, 232, 240), 0.3);
`;

const Title = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  svg {
    color: var(--accent-color);
  }
`;

const OnlineCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-color);

  .pulse-dot {
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

    &::before {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background: var(--accent-color);
      border-radius: 50%;
      opacity: 0.6;
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`;

// 活动列表
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  max-height: 320px;
  overflow-y: auto;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }

  @media (max-width: 768px) {
    max-height: 260px;
  }
`;

// 活动项
const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.06), rgba(var(--accent-rgb), 0.02));
  border-radius: 12px;
  border: 1px solid rgba(var(--accent-rgb), 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.12), rgba(var(--accent-rgb), 0.06));
    border-color: rgba(var(--accent-rgb), 0.25);
    transform: translateX(4px) translateY(-1px);
    box-shadow:
      0 4px 12px rgba(var(--accent-rgb), 0.15),
      0 2px 4px rgba(0, 0, 0, 0.05);

    &::before {
      left: 100%;
    }
  }

  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), rgba(var(--accent-rgb), 0.04));
    border-color: rgba(var(--accent-rgb), 0.15);

    &:hover {
      background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--accent-rgb), 0.08));
      border-color: rgba(var(--accent-rgb), 0.3);
      box-shadow:
        0 4px 12px rgba(var(--accent-rgb), 0.2),
        0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  @media (max-width: 768px) {
    padding: 0.625rem;
    gap: 0.5rem;

    &:hover {
      transform: translateX(2px) translateY(-1px);
    }
  }
`;

// 图标容器
const IconWrapper = styled.div<{ deviceType: 'desktop' | 'mobile' | 'tablet' }>`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    switch (props.deviceType) {
      case 'desktop':
        return 'rgba(59, 130, 246, 0.15)';
      case 'mobile':
        return 'rgba(16, 185, 129, 0.15)';
      case 'tablet':
        return 'rgba(245, 158, 11, 0.15)';
      default:
        return 'rgba(107, 114, 126, 0.15)';
    }
  }};
  color: ${(props) => {
    switch (props.deviceType) {
      case 'desktop':
        return '#3b82f6';
      case 'mobile':
        return '#10b981';
      case 'tablet':
        return '#f59e0b';
      default:
        return 'var(--text-secondary)';
    }
  }};

  svg {
    font-size: 14px;
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;

    svg {
      font-size: 12px;
    }
  }
`;

// 活动内容
const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityText = styled.div`
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 0.25rem;

  .location {
    font-weight: 700;
    color: var(--accent-color);
    text-shadow: 0 1px 2px rgba(var(--accent-rgb), 0.2);
  }

  .page {
    font-weight: 600;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--text-primary), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    line-height: 1.5;
  }
`;

// 人数标签
const CountBadge = styled.div`
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-rgb), 0.8));
  color: white;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  box-shadow:
    0 2px 8px rgba(var(--accent-rgb), 0.3),
    0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
  }
`;

// 空状态
const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.6;

  svg {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    opacity: 0.6;
    color: var(--accent-color);
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
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
  const location = activity.location;
  const pageTitle = activity.pageTitle;
  const device = activity.device;

  // 根据设备类型选择不同的文案风格
  const deviceEmojis = {
    desktop: '💻',
    mobile: '📱',
    tablet: '📱',
  };

  const deviceTexts = {
    desktop: '在电脑前',
    mobile: '用手机',
    tablet: '用平板',
  };

  const templates = [
    `✨ <span class="location">${location}</span> 的${deviceTexts[device]}朋友正在 <span class="page">${pageTitle}</span> 里漫游`,
    `🌟 来自 <span class="location">${location}</span> 的访客${deviceTexts[device]}探索着 <span class="page">${pageTitle}</span>`,
    `💫 <span class="location">${location}</span> 的小伙伴${deviceTexts[device]}在 <span class="page">${pageTitle}</span> 中寻找灵感`,
    `🎯 有朋友从 <span class="location">${location}</span> 来，${deviceTexts[device]}正在 <span class="page">${pageTitle}</span> 里闲逛`,
    `🚀 <span class="location">${location}</span> 的访客${deviceTexts[device]}在 <span class="page">${pageTitle}</span> 中发现新世界`,
    `🎨 来自 <span class="location">${location}</span> 的创意者${deviceTexts[device]}在 <span class="page">${pageTitle}</span> 中汲取养分`,
    `🌙 <span class="location">${location}</span> 的夜猫子${deviceTexts[device]}在 <span class="page">${pageTitle}</span> 里寻找共鸣`,
    `☀️ <span class="location">${location}</span> 的阳光访客${deviceTexts[device]}在 <span class="page">${pageTitle}</span> 中享受时光`,
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

  // 使用动画引擎
  const { variants, springPresets } = useAnimationEngine();

  // 不再需要位置计算，使用相对定位

  // 点击时获取数据
  useEffect(() => {
    if (isVisible) {
      setLoading(true);

      // 通过 HTTP 接口获取访客统计数据
      API.visitorStats
        .getVisitorStats()
        .then((response) => {
          if (response.success && response.data) {
            setStats(response.data);
            console.log('✅ 获取访客统计数据成功:', response.data);
          } else {
            console.warn('⚠️ 获取访客统计数据失败:', response.message);
          }
        })
        .catch((error) => {
          console.error('❌ 获取访客统计数据失败:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 隐藏时重置数据
      setStats(null);
      setLoading(false);
    }
  }, [isVisible]);

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
          <FiActivity size={12} />
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
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <FiCoffee size={24} />
            </motion.div>
            <div>正在泡咖啡，稍等片刻...</div>
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

              {activity.count > 1 && (
                <CountBadge>
                  <FiUsers size={10} style={{ marginRight: '2px', display: 'inline' }} />
                  {activity.count}
                </CountBadge>
              )}
            </ActivityItem>
          ))}
        </ActivityList>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springPresets.gentle}>
          <EmptyState>
            <motion.div
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
              <FiHeart size={24} />
            </motion.div>
            <div>
              暂时没有访客足迹
              <br />
              期待你的第一个访客！
            </div>
          </EmptyState>
        </motion.div>
      )}
    </TooltipContainer>
  );
};

export default VisitorStatsTooltip;
