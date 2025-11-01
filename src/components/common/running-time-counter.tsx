import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { SPRING_PRESETS, useAnimationEngine, EASING } from '@/utils/ui/animation';

// 站点上线时间 - 根据数据文件中的第一个里程碑
const SITE_LAUNCH_TIME = new Date('2024-01-15T00:00:00.000Z').getTime();

interface RunningTimeCounterProps {
  className?: string;
}

interface TimeDisplay {
  days: number;
  totalSeconds: number;
}

// 数字显示容器
const NumberDisplay = styled(motion.span)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
`;

// 单个数字容器 - 用于滚动动画
const DigitContainer = styled.span`
  display: inline-block;
  position: relative;
  overflow: hidden;
  width: 0.65em;
  height: 1.2em;
  vertical-align: baseline;
`;

// 数字滚动容器
const DigitScrollWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// 单个数字项
const DigitItem = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 1.2em;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`;

// 标签文本 - 与 StatLabel 样式一致
const LabelText = styled.span`
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--text-secondary);
  display: inline-block;
  vertical-align: baseline;
  margin-right: 0.25rem;
`;

// 数字文本 - 保持大号
const NumberText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  display: inline-block;
  vertical-align: baseline;
`;

/**
 * 运行时间计数器组件
 * 特性：
 * - 精确到秒的实时更新
 * - 炫酷的数字滚动切换动画
 * - 内存管理：自动清理定时器，防止内存泄漏
 * - 性能优化：React.memo + useMemo + useCallback
 */
const RunningTimeCounter: React.FC<RunningTimeCounterProps> = ({ className }) => {
  // 初始化时间显示
  const [timeDisplay, setTimeDisplay] = useState<TimeDisplay>(() => {
    const now = Date.now();
    const diff = Math.floor((now - SITE_LAUNCH_TIME) / 1000);
    const days = Math.floor(diff / 86400);
    return {
      days,
      totalSeconds: diff,
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousDaysRef = useRef<number>(timeDisplay.days);
  const previousSecondsRef = useRef<number>(timeDisplay.totalSeconds);

  // 将数字拆分为单个数字数组
  const daysDigits = useMemo(() => {
    return String(timeDisplay.days).split('').map(Number);
  }, [timeDisplay.days]);

  const secondsDigits = useMemo(() => {
    return String(timeDisplay.totalSeconds).split('').map(Number);
  }, [timeDisplay.totalSeconds]);

  // 存储每个位置的旧值，用于滚动动画
  const previousDigitsRef = useRef<{ days: number[]; seconds: number[] }>({
    days: daysDigits,
    seconds: secondsDigits,
  });

  // 更新旧值引用（延迟一个周期，这样在动画时可以获取旧值）
  useEffect(() => {
    const timer = setTimeout(() => {
      previousDigitsRef.current = {
        days: daysDigits,
        seconds: secondsDigits,
      };
    }, 0);
    return () => clearTimeout(timer);
  }, [daysDigits, secondsDigits]);

  // 更新时间的函数
  const updateTime = useCallback(() => {
    const now = Date.now();
    const diff = Math.floor((now - SITE_LAUNCH_TIME) / 1000);
    const days = Math.floor(diff / 86400);

    // 只在天数或总秒数变化时更新状态
    if (days !== previousDaysRef.current || diff !== previousSecondsRef.current) {
      previousDaysRef.current = days;
      previousSecondsRef.current = diff;
      setTimeDisplay({ days, totalSeconds: diff });
    }
  }, []);

  // 设置定时器
  useEffect(() => {
    // 立即更新一次
    updateTime();

    // 设置每秒更新一次
    intervalRef.current = setInterval(() => {
      updateTime();
    }, 1000);

    // 清理函数 - 确保内存不泄漏
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [updateTime]);

  // 渲染单个数字（带滚动动画）
  const renderDigit = useCallback(
    (digit: number, index: number, isSeconds: boolean = false) => {
      const uniqueKey = isSeconds ? `s-${index}-${timeDisplay.totalSeconds}` : `d-${index}-${timeDisplay.days}`;

      // 获取该位置的旧数字
      const prevDigits = previousDigitsRef.current;
      const oldDigit = isSeconds ? (prevDigits.seconds[index] ?? digit) : (prevDigits.days[index] ?? digit);

      // 计算Y偏移量：每个数字高度是 1.2em
      const initialY = -oldDigit * 1.2;
      const animateY = -digit * 1.2;

      return (
        <DigitContainer key={uniqueKey}>
          <DigitScrollWrapper
            initial={{ y: `${initialY}em` }}
            animate={{ y: `${animateY}em` }}
            transition={{
              type: 'tween',
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1], // 弹性效果
            }}
          >
            {/* 生成0-9的数字列表 */}
            {Array.from({ length: 10 }, (_, i) => (
              <DigitItem key={i}>{i}</DigitItem>
            ))}
          </DigitScrollWrapper>
        </DigitContainer>
      );
    },
    [timeDisplay.days, timeDisplay.totalSeconds],
  );

  return (
    <NumberDisplay className={className}>
      <LabelText>已运行</LabelText>
      {daysDigits.map((digit, index) => renderDigit(digit, index, false))}
      <NumberText>.</NumberText>
      {secondsDigits.map((digit, index) => renderDigit(digit, index, true))}
    </NumberDisplay>
  );
};

// 使用 memo 优化性能，避免不必要的重渲染
export default memo(RunningTimeCounter);
