import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@/hooks/useTheme';

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  background: transparent;
  opacity: 0.8;
`;

// 天文学恒星光谱颜色 (大致模拟)
const STAR_COLORS = [
  '#9bb0ff', // O - 蓝
  '#aabfff', // B - 蓝白
  '#cad7ff', // A - 白
  '#f8f7ff', // F - 黄白
  '#fff4ea', // G - 黄 (太阳)
  '#ffd2a1', // K - 橙
  '#ffcc6f', // M - 红
];

interface Star {
  distance: number; // 距离旋转中心的距离
  angle: number; // 当前角度
  speed: number; // 角速度
  radius: number; // 星星半径
  color: string; // 颜色
}

const MeteorBackground: React.FC = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>(0);

  // 旋转中心 (北天极)
  const centerRef = useRef({ x: 0, y: 0 });
  // 鼠标位置
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (theme !== 'dark') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.scale(dpr, dpr);

      centerRef.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.3,
      };
      initStars();
    };

    const initStars = () => {
      const starCount = 600;
      const stars: Star[] = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      const maxDist = Math.sqrt(width * width + height * height);

      for (let i = 0; i < starCount; i++) {
        const distance = Math.random() * maxDist;
        const speed = 0.0002 + Math.random() * 0.0004;

        stars.push({
          distance,
          angle: Math.random() * Math.PI * 2,
          speed: speed * (Math.random() > 0.5 ? 1 : -1),
          radius: Math.random() * 1.2 + 0.3,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
      starsRef.current = stars;
    };

    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const center = centerRef.current;
      const mouse = mouseRef.current;
      const threshold = 250;
      const thresholdSq = threshold * threshold;

      starsRef.current.forEach((star) => {
        star.angle -= star.speed;

        const orbitX = center.x + Math.cos(star.angle) * star.distance;
        const orbitY = center.y + Math.sin(star.angle) * star.distance;

        let x = orbitX;
        let y = orbitY;
        let isRepelled = false;

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < thresholdSq) {
          const dist = Math.sqrt(distSq);
          const force = (threshold - dist) / threshold;
          const power = force * force * 150;

          if (dist > 0) {
            x += (dx / dist) * power;
            y += (dy / dist) * power;
            isRepelled = true;
          }
        }

        ctx.beginPath();
        const trailAngle = star.speed > 0 ? 0.1 : -0.1;

        ctx.arc(center.x, center.y, star.distance, star.angle, star.angle + trailAngle, star.speed < 0);

        ctx.strokeStyle = star.color;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = star.radius * 0.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.globalAlpha = isRepelled ? 0.8 : Math.random() * 0.3 + 0.5;
        ctx.fillStyle = star.color;
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme]);

  if (theme !== 'dark') return null;

  return <Canvas ref={canvasRef} />;
};

export default React.memo(MeteorBackground);
