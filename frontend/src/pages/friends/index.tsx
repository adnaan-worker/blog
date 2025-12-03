import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiPlus, FiLink } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import MeteorBackground from '@/components/common/meteor-background';
import { PageHeader } from '@/components/common/page-header';
import { FriendCard } from './components/friend-card';
import { ApplyModal } from './components/apply-modal';
import { MOCK_FRIENDS } from './data';
import { useAnimationEngine } from '@/utils/ui/animation';

const Container = styled.div`
  min-height: 100vh;
  position: relative;
  background: var(--bg-primary);
  overflow-x: hidden;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  position: relative;
  z-index: 1;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: var(--text-tertiary);
  gap: 1rem;
  text-align: center;

  svg {
    font-size: 3rem;
    opacity: 0.5;
  }
`;

const Friends = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const { variants } = useAnimationEngine();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container>
      <MeteorBackground />

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
        <PageHeader
          title="友情链接"
          subtitle="探索数字宇宙的邻居们。连接思想，分享见解。"
          count={MOCK_FRIENDS.length}
          countUnit="个伙伴"
        >
          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="primary" leftIcon={<FiPlus />} onClick={() => setIsApplyModalOpen(true)}>
              申请友链
            </Button>
          </div>
        </PageHeader>

        {MOCK_FRIENDS.length > 0 ? (
          <Grid variants={containerVariants} initial="hidden" animate="visible">
            {MOCK_FRIENDS.map((friend, index) => (
              <FriendCard key={friend.id} friend={friend} index={index} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <FiLink />
            <p>暂无友链，成为第一个伙伴吧！</p>
          </EmptyState>
        )}
      </Content>

      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </Container>
  );
};

export default Friends;
