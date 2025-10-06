import React from 'react';
import styled from '@emotion/styled';
import {
  FiEdit,
  FiSettings,
  FiDownload,
  FiPlus,
  FiBarChart,
  FiHelpCircle,
  FiLogOut,
  FiBookOpen,
  FiFileText,
  FiGlobe,
} from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { storage } from '@/utils';

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
  onAction?: (actionId: string) => void;
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

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onAction }) => {
  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    }
  };

  // 获取用户信息检查是否是管理员
  const userInfo = storage.local.get<any>('user');
  const isAdmin = userInfo?.role === 'admin';

  // 默认操作列表
  const defaultActions: QuickAction[] = [
    {
      id: 'view-notes',
      label: '我的手记',
      icon: <FiBookOpen size={16} />,
      onClick: () => handleAction('view-notes'),
      variant: 'outline',
    },
    {
      id: 'view-articles',
      label: '我的文章',
      icon: <FiFileText size={16} />,
      onClick: () => handleAction('view-articles'),
      variant: 'outline',
    },
    // 仅管理员可见
    ...(isAdmin
      ? [
          {
            id: 'edit-site-settings',
            label: '网站设置',
            icon: <FiGlobe size={16} />,
            onClick: () => handleAction('edit-site-settings'),
            variant: 'outline' as const,
          },
        ]
      : []),
  ];

  const bottomActions: QuickAction[] = [
    {
      id: 'help',
      label: '帮助中心',
      icon: <FiHelpCircle size={16} />,
      onClick: () => handleAction('help'),
      variant: 'outline',
    },
    {
      id: 'logout',
      label: '退出登录',
      icon: <FiLogOut size={16} />,
      onClick: () => handleAction('logout'),
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
