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

const Description = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CodeExample = styled.pre`
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  color: var(--text-primary);
  font-family: monospace;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TestToast: React.FC = () => {
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

  const showLongToast = () => {
    toast.info(
      '这是一条比较长的消息，用于测试Toast组件对长文本的处理能力。Toast组件应该能够适当地显示较长的文本内容。',
      '长消息测试',
      5000
    );
  };

  return (
    <Container>
      <Title>全局Toast测试页面</Title>
      
      <Description>
        这个页面演示如何在任何组件或函数中使用全局Toast通知。
        通过使用事件总线模式，我们可以在没有React上下文的情况下显示Toast通知。
      </Description>
      
      <CodeExample>{`// 如何在任何地方导入和使用toast
import toast from '@/utils/toast';

// 使用示例
toast.success('操作成功!', '成功');
toast.error('操作失败!', '错误');
toast.info('系统通知', '通知');
toast.warning('警告信息', '警告');
`}</CodeExample>
      
      <ButtonGroup>
        <Button variant="primary" onClick={showSuccessToast}>
          成功提示
        </Button>
        <Button variant="danger" onClick={showErrorToast}>
          错误提示
        </Button>
        <Button onClick={showInfoToast}>
          信息提示
        </Button>
        <Button onClick={showWarningToast}>
          警告提示
        </Button>
        <Button onClick={showLongToast}>
          长文本提示
        </Button>
      </ButtonGroup>
      
      <Description>
        您也可以在非React代码中使用此Toast API，例如在API请求函数、工具函数或Redux中间件中。
        无需访问组件上下文，就可以轻松地显示通知。
      </Description>
    </Container>
  );
};

export default TestToast; 