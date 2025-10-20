import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
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
import { useAnimationEngine } from '@/utils/animation-engine';
import { storage } from '@/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface QuickActionConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: string;
}

interface QuickActionsProps {
  actions?: QuickActionConfig[];
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

const ActionsList = styled(motion.div)`
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

  // 转换 QuickActionConfig 为 QuickAction
  const convertedActions: QuickAction[] =
    actions?.map((config) => ({
      id: config.id,
      label: config.label,
      icon: <span style={{ fontSize: '1rem' }}>{config.icon}</span>,
      onClick: () => handleAction(config.action),
      variant: 'outline' as const,
    })) || [];

  // 如果没有传入actions，显示默认提示
  if (!actions || actions.length === 0) {
    return (
      <Container>
        <SectionTitle>快捷操作</SectionTitle>
        <ActionsList>
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>暂无可用操作</div>
        </ActionsList>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>快捷操作</SectionTitle>

      <ActionsList>
        {convertedActions.map((action) => (
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
