import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiCode, FiEye } from 'react-icons/fi';
import CodeBlock from '@/components/common/code-block';

// 样式组件
const PreviewContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  background: var(--bg-primary);
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const PreviewTitle = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const PreviewActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: ${({ active }) => (active ? 'var(--accent-color)' : 'var(--bg-primary)')};
  color: ${({ active }) => (active ? 'white' : 'var(--text-secondary)')};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) => (active ? 'var(--accent-color-hover)' : 'var(--bg-secondary)')};
    border-color: var(--accent-color);
  }
`;

const PreviewContent = styled.div`
  position: relative;
`;

const DemoArea = styled.div`
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100px;

  /* 为演示组件提供基础样式变量 */
  --demo-bg: var(--bg-secondary);
  --demo-border: var(--border-color);
  --demo-text: var(--text-primary);
  --demo-accent: var(--accent-color);

  /* 演示区域内的组件间距 */
  > * + * {
    margin-top: 1rem;
  }

  /* 水平排列的组件 */
  &.horizontal {
    > * {
      display: inline-block;
      margin-right: 1rem;
      margin-top: 0;
    }
  }
`;

const CodeArea = styled.div<{ visible: boolean }>`
  max-height: ${({ visible }) => (visible ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
  border-top: ${({ visible }) => (visible ? '1px solid var(--border-color)' : 'none')};
`;

const Description = styled.p`
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

// 组件接口
interface CodePreviewProps {
  title: string;
  description?: string;
  code: string;
  preview?: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
  language?: string;
  className?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  title,
  description,
  code,
  preview,
  layout = 'vertical',
  language = 'tsx',
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <PreviewContainer className={className}>
      <PreviewHeader>
        <PreviewTitle>{title}</PreviewTitle>
        <PreviewActions>
          <ActionButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>
            <FiEye size={14} />
            预览
          </ActionButton>
          <ActionButton active={activeTab === 'code'} onClick={() => setActiveTab('code')}>
            <FiCode size={14} />
            代码
          </ActionButton>
        </PreviewActions>
      </PreviewHeader>

      <PreviewContent>
        {description && (
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <Description>{description}</Description>
          </div>
        )}

        {activeTab === 'preview' && preview && (
          <DemoArea className={layout === 'horizontal' ? 'horizontal' : ''}>{preview}</DemoArea>
        )}

        <CodeArea visible={activeTab === 'code'}>
          <CodeBlock code={code} language={language} showLineNumbers={true} allowCopy={true} allowFullscreen={false} />
        </CodeArea>
      </PreviewContent>
    </PreviewContainer>
  );
};

export default CodePreview;
