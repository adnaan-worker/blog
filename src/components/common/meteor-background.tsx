import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@/hooks/useTheme';

// 流星数据接口
interface Meteor {
  id: number;
  left: number; // 水平起始位置（百分比）
  top: number; // 垂直起始位置（百分比）
  delay: number; // 延迟出现时间
  duration: number; // 持续时间
}

// 容器
const MeteorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

// 单个流星
const MeteorItem = styled.div<{ left: number; top: number; delay: number; duration: number }>`
  position: absolute;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, rgba(var(--accent-rgb), 0.9), transparent);
  opacity: 0;
  animation: meteorFall ${(props) => props.duration}s ease-out forwards;
  animation-delay: ${(props) => props.delay}s;
  will-change: transform, opacity;

  /* 流星尾迹 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120%;
    background: linear-gradient(to bottom, rgba(var(--accent-rgb), 0.5), transparent);
    filter: blur(1px);
  }

  @keyframes meteorFall {
    0% {
      opacity: 0;
      transform: translateX(0) translateY(0) rotate(-45deg);
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: translateX(300px) translateY(300px) rotate(-45deg);
    }
  }
`;

const MeteorBackground: React.FC = () => {
  const { theme } = useTheme();
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [showMeteors, setShowMeteors] = useState(false);

  useEffect(() => {
    if (theme !== 'dark') {
      setShowMeteors(false);
      setMeteors([]);
      return;
    }

    // 生成一场流星雨
    const generateMeteorShower = () => {
      const meteorCount = Math.floor(Math.random() * 3) + 3; // 3-5颗流星
      const newMeteors: Meteor[] = [];

      for (let i = 0; i < meteorCount; i++) {
        newMeteors.push({
          id: Date.now() + i,
          left: Math.random() * 60 + 10, // 10-70% 从左侧开始
          top: Math.random() * 30 - 10, // -10% 到 20% 高低错落
          delay: Math.random() * 2.5, // 0-2.5秒的延迟，避免并排
          duration: Math.random() * 0.8 + 1.2, // 1.2-2秒持续时间
        });
      }

      setMeteors(newMeteors);
      setShowMeteors(true);

      // 流星雨结束后清理
      setTimeout(() => {
        setShowMeteors(false);
        setTimeout(() => setMeteors([]), 1000);
      }, 5000); // 5秒后结束这场流星雨
    };

    // 随机间隔触发流星雨（30-90秒）
    const scheduleNextShower = () => {
      const interval = Math.random() * 60000 + 30000; // 30-90秒
      return setTimeout(() => {
        generateMeteorShower();
        scheduleNextShower();
      }, interval);
    };

    // 首次延迟10秒后开始
    const initialTimer = setTimeout(() => {
      generateMeteorShower();
      const timer = scheduleNextShower();
      return () => clearTimeout(timer);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
    };
  }, [theme]);

  if (theme !== 'dark' || !showMeteors) return null;

  return (
    <MeteorContainer>
      {meteors.map((meteor) => (
        <MeteorItem
          key={meteor.id}
          left={meteor.left}
          top={meteor.top}
          delay={meteor.delay}
          duration={meteor.duration}
        />
      ))}
    </MeteorContainer>
  );
};

export default React.memo(MeteorBackground);
