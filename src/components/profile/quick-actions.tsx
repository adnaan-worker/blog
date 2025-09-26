import React from 'react';
import styled from '@emotion/styled';
import { FiEdit, FiSettings, FiDownload, FiPlus, FiBarChart, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { Button } from '@/components/ui';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onCreateArticle?: () => void;
  onEditProfile?: () => void;
  onSettings?: () => void;
  onExportData?: () => void;
  onViewAnalytics?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
}

// 内容容器（不包含边框和背景，因为外层已有Card）
const Container = styled.div`
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚡';
    font-size: 1.2rem;
  }
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActionButton = styled(Button)`
  justify-content: flex-start;
  text-align: left;

  svg {
    flex-shrink: 0;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
`;

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onCreateArticle,
  onEditProfile,
  onSettings,
  onExportData,
  onViewAnalytics,
  onHelp,
  onLogout,
}) => {
  // 默认操作列表
  const defaultActions: QuickAction[] = [
    {
      id: 'create-article',
      label: '创建文章',
      icon: <FiPlus size={16} />,
      onClick: onCreateArticle || (() => {}),
      variant: 'primary',
    },
    {
      id: 'edit-profile',
      label: '编辑资料',
      icon: <FiEdit size={16} />,
      onClick: onEditProfile || (() => {}),
      variant: 'outline',
    },
    {
      id: 'view-analytics',
      label: '数据分析',
      icon: <FiBarChart size={16} />,
      onClick: onViewAnalytics || (() => {}),
      variant: 'outline',
    },
    {
      id: 'settings',
      label: '账户设置',
      icon: <FiSettings size={16} />,
      onClick: onSettings || (() => {}),
      variant: 'outline',
    },
    {
      id: 'export-data',
      label: '数据导出',
      icon: <FiDownload size={16} />,
      onClick: onExportData || (() => {}),
      variant: 'outline',
    },
  ];

  const bottomActions: QuickAction[] = [
    {
      id: 'help',
      label: '帮助中心',
      icon: <FiHelpCircle size={16} />,
      onClick: onHelp || (() => {}),
      variant: 'outline',
    },
    {
      id: 'logout',
      label: '退出登录',
      icon: <FiLogOut size={16} />,
      onClick: onLogout || (() => {}),
      variant: 'outline',
    },
  ];

  const actionsToRender = actions || defaultActions;

  return (
    <Container>
      <SectionTitle>快捷操作</SectionTitle>

      <ActionsList>
        {actionsToRender.map((action) => (
          <ActionButton
            key={action.id}
            variant={action.variant || 'outline'}
            size="small"
            fullWidth
            leftIcon={action.icon}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </ActionButton>
        ))}

        <Divider />

        {bottomActions.map((action) => (
          <ActionButton
            key={action.id}
            variant={action.variant || 'outline'}
            size="small"
            fullWidth
            leftIcon={action.icon}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </ActionButton>
        ))}
      </ActionsList>
    </Container>
  );
};
