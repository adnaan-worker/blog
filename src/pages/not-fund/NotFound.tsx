import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - 4rem);
  padding: 2rem;
`;

const Content = styled(motion.div)`
  max-width: 480px;
  text-align: left;
`;

const ErrorCode = styled.span`
  display: block;
  font-size: 5rem;
  font-weight: 500;
  color: var(--accent-color);
  margin-bottom: 1rem;
  font-family: monospace;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--accent-color);
  transition: all 0.2s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 1px;
    background-color: var(--accent-color);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: var(--accent-hover);
    
    &::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }
`;

const NotFoundPage: React.FC = () => {
  return (
    <Container>
      <Content
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ErrorCode>404</ErrorCode>
        <Title>页面未找到</Title>
        <Description>
          您访问的页面不存在或已被删除。请返回首页继续浏览。
        </Description>
        <BackLink to="/">
          <FiArrowLeft size={16} />
          返回首页
        </BackLink>
      </Content>
    </Container>
  );
};

export default NotFoundPage;
