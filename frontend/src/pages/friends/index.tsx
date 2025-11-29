import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import MeteorBackground from '@/components/common/meteor-background';
import { ListPageHeader } from '@/components/common/list-page-header';
import { FriendCard } from './components/friend-card';
import { ApplyModal } from './components/apply-modal';
import { MOCK_FRIENDS, Friend } from './data';

const Container = styled.div`
  min-height: 100vh;
  position: relative;
  background: var(--bg-primary);
  overflow-x: hidden;

  /* Deep space gradient overlay for dark mode */
  [data-theme='dark'] & {
    background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #050505 100%);
  }
`;

const AmbientOrb = styled(motion.div)`
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.3;
  pointer-events: none;
  mix-blend-mode: screen;
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

// ==================== Parallax Layout ====================

const ParallaxContainer = styled.div`
  display: flex;
  gap: 4rem; /* Increased gap for spacious cosmic feel */
  padding-bottom: 8rem;
  align-items: flex-start;
  justify-content: center;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
    gap: 2rem;
  }
`;

const Column = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 4rem; /* Increased vertical gap */
  flex: 1;
  min-width: 0;
`;

// ==================== Responsive Visibility ====================

const DesktopView = styled.div`
  display: block;
  @media (max-width: 1024px) {
    display: none;
  }
`;

const MobileView = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: block;
  }
`;

const Friends = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Parallax Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  // Column Transforms - More subtle movement for "floating" effect
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), springConfig);
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -200]), springConfig);
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), springConfig);

  // Split friends into 3 columns
  const [columns, setColumns] = useState<Friend[][]>([[], [], []]);

  useEffect(() => {
    const cols: Friend[][] = [[], [], []];
    MOCK_FRIENDS.forEach((friend, i) => {
      cols[i % 3].push(friend);
    });
    setColumns(cols);
  }, []);

  return (
    <Container ref={containerRef}>
      <MeteorBackground />

      {/* Ambient Orbs - Cosmic Colors */}
      <AmbientOrb
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          top: '-10%',
          left: '-10%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 70%)', // Violet
        }}
      />
      <AmbientOrb
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{
          bottom: '10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent 70%)', // Cyan
        }}
      />

      <Content>
        <ListPageHeader
          title="Stellar Nodes"
          subtitle="Explore the digital cosmos. Connect with like-minded creators."
          count={MOCK_FRIENDS.length}
          countUnit="Nodes"
        >
          <div style={{ marginTop: '2rem' }}>
            <Button
              variant="primary"
              size="medium"
              leftIcon={<FiPlus />}
              onClick={() => setIsApplyModalOpen(true)}
              style={{
                borderRadius: '999px',
                padding: '0.8rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                border: 'none',
              }}
            >
              Establish Connection
            </Button>
          </div>
        </ListPageHeader>

        {/* Desktop Parallax Grid */}
        <DesktopView>
          <ParallaxContainer>
            <Column style={{ y: y1 }}>
              {columns[0].map((friend, i) => (
                <FriendCard key={friend.id} friend={friend} index={i} />
              ))}
            </Column>
            <Column style={{ y: y2, paddingTop: '8rem' }}>
              {columns[1].map((friend, i) => (
                <FriendCard key={friend.id} friend={friend} index={i} />
              ))}
            </Column>
            <Column style={{ y: y3, paddingTop: '4rem' }}>
              {columns[2].map((friend, i) => (
                <FriendCard key={friend.id} friend={friend} index={i} />
              ))}
            </Column>
          </ParallaxContainer>
        </DesktopView>

        {/* Mobile/Tablet Simple Grid */}
        <MobileView>
          <ParallaxContainer>
            <Column>
              {MOCK_FRIENDS.map((friend, i) => (
                <FriendCard key={friend.id} friend={friend} index={i} />
              ))}
            </Column>
          </ParallaxContainer>
        </MobileView>
      </Content>

      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </Container>
  );
};

export default Friends;
