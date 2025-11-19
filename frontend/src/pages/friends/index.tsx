import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import MeteorBackground from '@/components/common/meteor-background';
import { FadeScrollContainer } from '@/components/common/fade-scroll-container';
import { FriendCard, ApplyCard } from './components/friend-card';
import { MOCK_FRIENDS, POETIC_TITLES } from './data';
import { ListPageHeader } from '@/components/common';

const Container = styled.div`
  min-height: 100vh;
  position: relative;
`;

const Content = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 1;
`;

// Bento Grid 布局
const BentoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 240px; /* 稍微增加高度 */
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 0 2rem 2rem;
  grid-auto-flow: dense; /* 关键：自动填补空隙 */

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
`;

// 容器 variants，用于控制子元素的交错动画
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// 子元素 variants，定义进场效果
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const Friends = () => {
  const [randomTitle] = useState(() => POETIC_TITLES[Math.floor(Math.random() * POETIC_TITLES.length)]);

  return (
    <Container>
      <MeteorBackground />

      <FadeScrollContainer>
        <Content>
          <ListPageHeader
            title="遇声"
            subtitle="以链接为桥，赴一场声息相契的遇见，每枚友联都是藏在数字世界的和弦，在敲击键盘的晨昏里，听见同频者的温柔应答。"
          />

          <BentoGrid variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} style={{ display: 'contents' }}>
              <ApplyCard />
            </motion.div>

            {MOCK_FRIENDS.map((friend, index) => (
              <motion.div key={friend.id} variants={itemVariants} style={{ display: 'contents' }}>
                <FriendCard friend={friend} index={index} />
              </motion.div>
            ))}
          </BentoGrid>
        </Content>
      </FadeScrollContainer>
    </Container>
  );
};

export default Friends;
