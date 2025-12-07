import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiPlus, FiLink } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { PageHeader } from '@/components/common/page-header';
import { FriendCard } from './components/friend-card';
import { ApplyModal } from './components/apply-modal';
import { MOCK_FRIENDS } from './data';
import { useAnimationEngine } from '@/utils/ui/animation';

const PageContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
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
    <PageContainer>
      <Container>
        <PageHeader
          title="拾音"
          subtitle="把同好的链接拾成散落的音符，以技术为谱、热爱为弦，在互联的时光里轻轻弹奏，让编程之路的孤独，都化作彼此呼应的细腻回响。"
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
      </Container>

      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </PageContainer>
  );
};

export default Friends;
