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
  hours: number;
  minutes: number;
  seconds: number;
}

// 数字显示容器
const NumberDisplay = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
`;

// 单个数字容器 - 用于滚动动画
const DigitContainer = styled.span`
  display: inline-block;
  position: relative;
  overflow: hidden;
  width: 1em;
  height: 1.2em;
  vertical-align: baseline;
  text-align: center;
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
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`;

// 数值区域
const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  flex-wrap: wrap;
  justify-content: start;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// 标签文本
const LabelText = styled.span`
  display: block;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// 分隔符
const Separator = styled.span`
  font-size: 0.7rem;
  opacity: 0.5;
  margin: 0 0.15rem;
  font-weight: 400;
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
    const remainingSeconds = diff % 86400;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return {
      days,
      hours,
      minutes,
      seconds,
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousTimeRef = useRef<TimeDisplay>(timeDisplay);

  // 将数字拆分为单个数字数组（补0确保2位数）
  const daysDigits = useMemo(() => {
    return String(timeDisplay.days).split('').map(Number);
  }, [timeDisplay.days]);

  const hoursDigits = useMemo(() => {
    return String(timeDisplay.hours).padStart(2, '0').split('').map(Number);
  }, [timeDisplay.hours]);

  const minutesDigits = useMemo(() => {
    return String(timeDisplay.minutes).padStart(2, '0').split('').map(Number);
  }, [timeDisplay.minutes]);

  const secondsDigits = useMemo(() => {
    return String(timeDisplay.seconds).padStart(2, '0').split('').map(Number);
  }, [timeDisplay.seconds]);

  // 存储每个位置的旧值，用于滚动动画
  const previousDigitsRef = useRef<{ days: number[]; hours: number[]; minutes: number[]; seconds: number[] }>({
    days: daysDigits,
    hours: hoursDigits,
    minutes: minutesDigits,
    seconds: secondsDigits,
  });

  // 更新旧值引用（延迟一个周期，这样在动画时可以获取旧值）
  useEffect(() => {
    const timer = setTimeout(() => {
      previousDigitsRef.current = {
        days: daysDigits,
        hours: hoursDigits,
        minutes: minutesDigits,
        seconds: secondsDigits,
      };
    }, 0);
    return () => clearTimeout(timer);
  }, [daysDigits, hoursDigits, minutesDigits, secondsDigits]);

  // 更新时间的函数
  const updateTime = useCallback(() => {
    const now = Date.now();
    const diff = Math.floor((now - SITE_LAUNCH_TIME) / 1000);
    const days = Math.floor(diff / 86400);
    const remainingSeconds = diff % 86400;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const newTimeDisplay = { days, hours, minutes, seconds };

    // 只在时间变化时更新状态
    if (
      days !== previousTimeRef.current.days ||
      hours !== previousTimeRef.current.hours ||
      minutes !== previousTimeRef.current.minutes ||
      seconds !== previousTimeRef.current.seconds
    ) {
      previousTimeRef.current = newTimeDisplay;
      setTimeDisplay(newTimeDisplay);
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
    (digit: number, index: number, type: 'days' | 'hours' | 'minutes' | 'seconds') => {
      const uniqueKey = `${type}-${index}`;

      // 获取该位置的旧数字
      const prevDigits = previousDigitsRef.current[type];
      const oldDigit = prevDigits[index] ?? digit;

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
    [timeDisplay.days, timeDisplay.hours, timeDisplay.minutes, timeDisplay.seconds],
  );

  return (
    <NumberDisplay className={className}>
      <ValueRow>
        {daysDigits.map((digit, index) => renderDigit(digit, index, 'days'))}
        <Separator>天</Separator>
        {hoursDigits.map((digit, index) => renderDigit(digit, index, 'hours'))}
        <Separator>时</Separator>
        {minutesDigits.map((digit, index) => renderDigit(digit, index, 'minutes'))}
        <Separator>分</Separator>
        {secondsDigits.map((digit, index) => renderDigit(digit, index, 'seconds'))}
        <Separator>秒</Separator>
      </ValueRow>
      <LabelText>运行时间</LabelText>
    </NumberDisplay>
  );
};

// 使用 memo 优化性能，避免不必要的重渲染
export default memo(RunningTimeCounter);
