import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from '@emotion/styled';

export interface WordCloudItem {
  text: string;
  weight: number;
  color?: string;
  category?: string;
  highlighted?: boolean;
}

interface WordCloudProps {
  words: WordCloudItem[];
  className?: string;
  radius?: number; // 球体半径
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
  overflow: hidden;
  /* 增加一点背景装饰 */
  &::before {
    content: '';
    position: absolute;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }
`;

const Tag = styled.div<{
  x: number;
  y: number;
  z: number;
  opacity: number;
  scale: number;
  color: string;
}>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3d(${(props) => props.x}px, ${(props) => props.y}px, ${(props) => props.z}px)
    translate(-50%, -50%) scale(${(props) => props.scale});
  opacity: ${(props) => props.opacity};
  color: ${(props) => props.color};
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  will-change: transform, opacity;
  transition: color 0.3s;
  text-shadow: 0 0 10px rgba(var(--bg-primary-rgb), 0.5); /* 增加一点描边感，防止背景干扰 */

  &:hover {
    color: var(--accent-color);
    text-shadow: 0 0 15px var(--accent-color);
    z-index: 100;
    opacity: 1 !important; /* 悬停时强制不透明 */
  }
`;

// 辅助函数：生成随机颜色（使用主题色系的变体）
const getTagColor = (index: number) => {
  const colors = [
    'var(--text-primary)',
    'var(--text-secondary)',
    'var(--accent-color)',
    '#a78bfa',
    '#34d399',
    '#60a5fa',
    '#f472b6',
  ];
  return colors[index % colors.length];
};

export const WordCloud: React.FC<WordCloudProps> = ({ words, className, radius = 180 }) => {
  const [tags, setTags] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // 旋转参数
  const rotationRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false); // 鼠标是否在组件上

  // 初始化球体分布
  useEffect(() => {
    const phi = Math.PI * (3 - Math.sqrt(5)); // 黄金角度
    const newTags = words.map((word, i) => {
      const y = 1 - (i / (words.length - 1)) * 2; // y 从 1 降到 -1
      const radiusAtY = Math.sqrt(1 - y * y); // 当前y高度切面的半径
      const theta = phi * i; // 黄金角度螺旋

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      return {
        ...word,
        x: x * radius,
        y: y * radius,
        z: z * radius,
        color: word.color || getTagColor(i),
      };
    });
    setTags(newTags);
  }, [words, radius]);

  // 动画循环
  const animate = () => {
    // 基础自转速度
    const baseSpeed = 0.002;

    // 鼠标交互速度 (当鼠标悬停时，跟随鼠标；否则保持基础自转)
    const targetSpeedX = activeRef.current ? mouseRef.current.x * 0.0001 : baseSpeed;
    const targetSpeedY = activeRef.current ? mouseRef.current.y * 0.0001 : baseSpeed;

    // 简单的惯性平滑
    rotationRef.current.x += (targetSpeedX - rotationRef.current.x) * 0.05;
    rotationRef.current.y += (targetSpeedY - rotationRef.current.y) * 0.05;

    const sinX = Math.sin(rotationRef.current.x);
    const cosX = Math.cos(rotationRef.current.x);
    const sinY = Math.sin(rotationRef.current.y);
    const cosY = Math.cos(rotationRef.current.y);

    setTags((prevTags) =>
      prevTags.map((tag) => {
        // 绕Y轴旋转 (左右)
        const rx1 = tag.x * cosY - tag.z * sinY;
        const rz1 = tag.z * cosY + tag.x * sinY;

        // 绕X轴旋转 (上下)
        const ry2 = tag.y * cosX - rz1 * sinX;
        const rz2 = rz1 * cosX + tag.y * sinX;

        return {
          ...tag,
          x: rx1,
          y: ry2,
          z: rz2,
        };
      }),
    );

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // 计算鼠标相对于中心的偏移量
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    // 反转方向，让交互更符合直觉（鼠标往哪边动，球往哪边转）
    mouseRef.current = { x: y, y: -x };
  };

  return (
    <Container
      ref={containerRef}
      className={className}
      onMouseEnter={() => (activeRef.current = true)}
      onMouseLeave={() => {
        activeRef.current = false;
        mouseRef.current = { x: 0, y: 0 }; // 重置鼠标力矩
      }}
      onMouseMove={handleMouseMove}
    >
      {tags.map((tag, i) => {
        // 计算景深效果
        // z 范围大约是 -radius 到 +radius
        // 我们希望 scale 从 0.5 到 1.5
        // opacity 从 0.3 到 1
        const depth = (tag.z + radius) / (2 * radius); // 0 (远) 到 1 (近)
        const scale = 0.6 + depth * 0.8; // 0.6 ~ 1.4
        const opacity = 0.2 + depth * 0.8; // 0.2 ~ 1.0
        // 加上一点模糊
        const blur = (1 - depth) * 2;

        return (
          <Tag
            key={i}
            x={tag.x}
            y={tag.y}
            z={tag.z}
            scale={scale}
            opacity={opacity}
            color={tag.color}
            style={{ filter: `blur(${blur}px)` }}
          >
            {tag.text}
          </Tag>
        );
      })}
    </Container>
  );
};

export default WordCloud;
