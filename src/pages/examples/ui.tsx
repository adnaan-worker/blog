import React from 'react';
import styled from '@emotion/styled';
import { toast } from '@/ui';
import { Button } from '@/components/ui';

const Container = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const CodeExample = styled.pre`
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const TestUI: React.FC = () => {
  // Toast 示例
  const showSuccessToast = () => {
    toast.success('操作已成功完成！', '成功');
  };

  const showErrorToast = () => {
    toast.error('操作失败，请重试！', '错误');
  };

  const showInfoToast = () => {
    toast.info('系统将在10分钟后进行维护', '通知');
  };

  const showWarningToast = () => {
    toast.warning('您的会话即将过期', '警告');
  };

  return (
    <Container>
      <Title>UI组件测试</Title>
      <Section>
        <SectionTitle>Toast 通知</SectionTitle>
        <ButtonGroup>
          <Button variant="primary" onClick={showSuccessToast}>成功提示</Button>
          <Button variant="danger" onClick={showErrorToast}>错误提示</Button>
          <Button onClick={showInfoToast}>信息提示</Button>
          <Button onClick={showWarningToast}>警告提示</Button>
        </ButtonGroup>
      </Section>
    </Container>
  );
};

export default TestUI; 