import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiExternalLink, FiArrowUpRight } from 'react-icons/fi';
import { Friend } from '../data';

// ==================== 3D Card Container ====================

const CardWrapper = styled(motion.div)`
  perspective: 1000px;
  height: 100%;
  width: 100%;
`;

const CardBody = styled(motion.a)`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  text-decoration: none;
  transform-style: preserve-3d;
  isolation: isolate;

  /* Noise Texture */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 1;
  }

  /* Light Mode Adaptation */
  [data-theme='light'] & {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  }
`;

// ==================== Lighting & Glow ====================

const GlowGradient = styled(motion.div)`
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  z-index: 0;
  background: radial-gradient(
    800px circle at var(--mouse-x) var(--mouse-y),
    rgba(var(--accent-rgb), 0.15),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;

const BorderHighlight = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  z-index: 10;
  pointer-events: none;
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y),
    rgba(var(--accent-rgb), 0.4),
    transparent 40%
  );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 1px; /* Border width */
  opacity: 0;
  transition: opacity 0.5s;

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;

// ==================== Content Elements ====================

const Content = styled.div`
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  transform-style: preserve-3d;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  transform-style: preserve-3d;
`;

const AvatarBox = styled(motion.div)`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
  background: var(--bg-tertiary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoBox = styled(motion.div)`
  flex: 1;
  min-width: 0;
`;

const Name = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Url = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-family: monospace;
  opacity: 0.8;
`;

const Desc = styled(motion.p)`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.9;
  flex: 1;
`;

const Footer = styled(motion.div)`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent-color);
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const ActionIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);

  ${CardWrapper}:hover & {
    background: var(--accent-color);
    color: #fff;
  }
`;

// ==================== Component ====================

interface FriendCardProps {
  friend: Friend;
  index: number;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    // Update CSS variables for lighting
    (currentTarget as HTMLElement).style.setProperty('--mouse-x', `${clientX - left}px`);
    (currentTarget as HTMLElement).style.setProperty('--mouse-y', `${clientY - top}px`);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <CardWrapper style={{ perspective: 1000 }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <CardBody
        href={friend.url}
        target="_blank"
        rel="noopener noreferrer"
        style={
          {
            rotateX,
            rotateY,
            '--accent-color': friend.color || 'var(--primary-color)',
            '--accent-rgb': friend.color ? 'var(--accent-rgb)' : 'var(--primary-rgb)',
          } as any
        }
      >
        <GlowGradient />
        <BorderHighlight />

        <Content>
          <Header>
            <AvatarBox style={{ translateZ: 40 }}>
              <img src={friend.avatar} alt={friend.name} />
            </AvatarBox>
            <InfoBox style={{ translateZ: 20 }}>
              <Name>{friend.name}</Name>
              <Url>{new URL(friend.url).hostname}</Url>
            </InfoBox>
          </Header>

          <Desc style={{ translateZ: 10 }}>{friend.desc}</Desc>

          <Footer style={{ translateZ: 10 }}>
            <Tags>
              {friend.tags?.slice(0, 2).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Tags>
            <ActionIcon whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FiArrowUpRight />
            </ActionIcon>
          </Footer>
        </Content>
      </CardBody>
    </CardWrapper>
  );
};
