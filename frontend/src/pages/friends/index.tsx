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
  background: #050505; /* Deep dark background */
  overflow-x: hidden;
  color: #fff;

  [data-theme='light'] & {
    background: #f5f5f7;
    color: #1d1d1f;
  }
`;

const AmbientOrb = styled(motion.div)`
  position: fixed;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.4;
  pointer-events: none;
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
  gap: 2rem;
  padding-bottom: 6rem;
  align-items: flex-start;
  justify-content: center;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Column = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  min-width: 0; /* Prevent flex overflow */
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

  // Column Transforms
  // Middle column moves faster (or in reverse direction relative to scroll)
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]), springConfig);
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), springConfig); // Moves faster
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]), springConfig);

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

      {/* Ambient Orbs */}
      <AmbientOrb
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          top: '-10%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.3), transparent 70%)',
        }}
      />
      <AmbientOrb
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{
          bottom: '10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)',
        }}
      />

      <Content>
        <ListPageHeader
          title="Friends"
          subtitle="Explore the digital cosmos. Connect with like-minded creators."
          count={MOCK_FRIENDS.length}
          countUnit="Connections"
        >
          <div style={{ marginTop: '1.5rem' }}>
            <Button
              variant="primary"
              size="medium"
              leftIcon={<FiPlus />}
              onClick={() => setIsApplyModalOpen(true)}
              style={{
                borderRadius: '999px',
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              Become a Friend
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
            <Column style={{ y: y2, paddingTop: '4rem' }}>
              {columns[1].map((friend, i) => (
                <FriendCard key={friend.id} friend={friend} index={i} />
              ))}
            </Column>
            <Column style={{ y: y3 }}>
              {columns[2].map((friend, i) => (
                <FriendCard key={friend.id} friend={friend} index={i} />
              ))}
            </Column>
          </ParallaxContainer>
        </DesktopView>

        {/* Mobile/Tablet Simple Grid (No Parallax to avoid UX issues) */}
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
