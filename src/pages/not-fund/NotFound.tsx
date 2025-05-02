import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - 16rem);
  text-align: center;
  padding: 2rem;
`;

const ErrorCode = styled(motion.h1)`
  font-size: clamp(5rem, 15vw, 12rem);
  font-weight: 800;
  margin: 0;
  background: linear-gradient(to right, var(--accent-color), #9c88ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -5px;
  line-height: 1;
`;

const Title = styled(motion.h2)`
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 700;
  margin: 1rem 0 2rem;
  color: var(--text-primary);
`;

const Description = styled(motion.p)`
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin-bottom: 2.5rem;
`;

const BackButton = styled(motion.create(Link))`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(81, 131, 245, 0.3);
  }
`;

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <ErrorCode initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        404
      </ErrorCode>
      <Title initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        页面不存在
      </Title>
      <Description
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        抱歉，您要查找的页面不存在或已被移动。请尝试返回首页或使用导航栏查找您需要的内容。
      </Description>
      <BackButton
        to="/"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft />
        返回首页
      </BackButton>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
