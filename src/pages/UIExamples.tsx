import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiInfo, FiAlertCircle, FiEdit, FiTrash, FiRefreshCw } from 'react-icons/fi';
import {
  Alert,
  ConfirmDialog,
  ToastProvider,
  useToast,
  Tooltip,
  Badge,
  Tabs,
  Button,
} from '../components/UIComponents';

// 页面容器样式
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  margin: 2rem 0 1rem;
  font-size: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
`;

const ComponentContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-large);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const ExampleCard = styled.div`
  background-color: var(--bg-primary);
  border-radius: var(--radius-medium);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
`;

const ExampleTitle = styled.h3`
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

// 组件示例展示页面
const UIExamples: React.FC = () => {
  const { success, info, warning, error } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Tab示例数据
  const tabItems = [
    {
      key: '1',
      label: '标签一',
      content: (
        <div>
          <h3>标签一内容</h3>
          <p>这是标签一的详细内容，您可以在这里放置任何组件或文本。</p>
          <Button variant="primary">标签一按钮</Button>
        </div>
      ),
    },
    {
      key: '2',
      label: '标签二',
      content: (
        <div>
          <h3>标签二内容</h3>
          <p>这是一个不同的内容区域，属于标签二。</p>
          <Alert type="info" title="信息提示" message="这是一个嵌套在标签内的提示框示例。" />
        </div>
      ),
    },
    {
      key: '3',
      label: '标签三',
      content: (
        <div>
          <h3>标签三内容</h3>
          <p>这是第三个标签的内容区域，可以包含任何组件。</p>
          <ButtonGroup>
            <Button variant="primary">保存</Button>
            <Button variant="secondary">取消</Button>
          </ButtonGroup>
        </div>
      ),
    },
    {
      key: '4',
      label: '禁用标签',
      disabled: true,
      content: <div>此内容不会显示，因为标签被禁用</div>,
    },
  ];

  return (
    <PageContainer>
      <Title>UI组件示例</Title>

      {/* 提示框示例 */}
      <SectionTitle>提示框 Alert</SectionTitle>
      <ComponentContainer>
        <Grid>
          <ExampleCard>
            <ExampleTitle>成功提示</ExampleTitle>
            <Alert type="success" title="操作成功" message="您的文章已成功发布，现在可以在博客页面查看。" />
          </ExampleCard>

          <ExampleCard>
            <ExampleTitle>信息提示</ExampleTitle>
            <Alert type="info" message="系统将于今晚22:00进行例行维护，预计耗时2小时。" />
          </ExampleCard>

          <ExampleCard>
            <ExampleTitle>警告提示</ExampleTitle>
            <Alert type="warning" title="注意" message="您的存储空间不足，请及时清理不必要的文件。" closable={false} />
          </ExampleCard>

          <ExampleCard>
            <ExampleTitle>错误提示</ExampleTitle>
            <Alert type="error" title="提交失败" message="表单验证未通过，请检查输入内容是否符合要求。" />
          </ExampleCard>
        </Grid>
      </ComponentContainer>

      {/* 确认对话框示例 */}
      <SectionTitle>确认对话框 ConfirmDialog</SectionTitle>
      <ComponentContainer>
        <ButtonGroup>
          <Button variant="secondary" onClick={() => setConfirmDialogOpen(true)}>
            打开确认对话框
          </Button>
        </ButtonGroup>

        <ConfirmDialog
          title="确认删除"
          message="您确定要删除这篇文章吗？此操作无法撤销，删除后数据将无法恢复。"
          confirmText="确认删除"
          cancelText="取消"
          confirmVariant="danger"
          open={confirmDialogOpen}
          onConfirm={() => {
            setConfirmDialogOpen(false);
            error('文章已删除', '操作成功');
          }}
          onCancel={() => setConfirmDialogOpen(false)}
        />
      </ComponentContainer>

      {/* Toast通知示例 */}
      <SectionTitle>Toast通知</SectionTitle>
      <ComponentContainer>
        <ButtonGroup>
          <Button variant="primary" onClick={() => success('操作已完成', '成功')}>
            成功通知
          </Button>

          <Button variant="secondary" onClick={() => info('有新消息，请查看', '通知')}>
            信息通知
          </Button>

          <Button variant="secondary" onClick={() => warning('系统资源占用过高', '警告')}>
            警告通知
          </Button>

          <Button variant="danger" onClick={() => error('网络连接失败', '错误')}>
            错误通知
          </Button>
        </ButtonGroup>
      </ComponentContainer>

      {/* Tooltip提示工具示例 */}
      <SectionTitle>Tooltip提示</SectionTitle>
      <ComponentContainer>
        <Grid>
          <ExampleCard>
            <ExampleTitle>基础提示</ExampleTitle>
            <ButtonGroup>
              <Tooltip content="编辑此项目" placement="top">
                <Button variant="secondary">
                  <FiEdit size={18} />
                </Button>
              </Tooltip>

              <Tooltip content="删除此项目" placement="bottom">
                <Button variant="danger">
                  <FiTrash size={18} />
                </Button>
              </Tooltip>

              <Tooltip content="刷新数据" placement="right">
                <Button variant="secondary">
                  <FiRefreshCw size={18} />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </ExampleCard>

          <ExampleCard>
            <ExampleTitle>延迟显示</ExampleTitle>
            <Tooltip content="这个提示会延迟500毫秒显示" placement="top" delay={500}>
              <Button variant="primary">延迟提示</Button>
            </Tooltip>
          </ExampleCard>
        </Grid>
      </ComponentContainer>

      {/* Badge徽章示例 */}
      <SectionTitle>Badge徽章</SectionTitle>
      <ComponentContainer>
        <Grid>
          <ExampleCard>
            <ExampleTitle>数字徽章</ExampleTitle>
            <ButtonGroup>
              <div style={{ position: 'relative', marginRight: '20px' }}>
                <Button variant="secondary">消息</Button>
                <div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                  <Badge count={5} type="error" />
                </div>
              </div>

              <div style={{ position: 'relative', marginRight: '20px' }}>
                <Button variant="secondary">通知</Button>
                <div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                  <Badge count={99} overflowCount={99} type="warning" />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Button variant="secondary">更新</Button>
                <div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                  <Badge count={200} type="success" />
                </div>
              </div>
            </ButtonGroup>
          </ExampleCard>

          <ExampleCard>
            <ExampleTitle>点状徽章</ExampleTitle>
            <ButtonGroup>
              <div style={{ position: 'relative', marginRight: '20px' }}>
                <Tooltip content="有新消息" placement="top">
                  <Button variant="secondary">
                    <FiInfo size={18} />
                  </Button>
                </Tooltip>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                  <Badge dot type="info" />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Tooltip content="有新提醒" placement="top">
                  <Button variant="secondary">
                    <FiAlertCircle size={18} />
                  </Button>
                </Tooltip>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                  <Badge dot type="error" />
                </div>
              </div>
            </ButtonGroup>
          </ExampleCard>
        </Grid>
      </ComponentContainer>

      {/* Tabs标签页示例 */}
      <SectionTitle>Tabs标签页</SectionTitle>
      <ComponentContainer>
        <Tabs items={tabItems} defaultActiveKey="1" />
      </ComponentContainer>
    </PageContainer>
  );
};

// 导出组件并包装在ToastProvider中
const UIExamplesWithToast: React.FC = () => (
  <ToastProvider>
    <UIExamples />
  </ToastProvider>
);

export default UIExamplesWithToast;
