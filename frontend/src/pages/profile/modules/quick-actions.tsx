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
  FiMessageSquare,
  FiUsers,
  FiFolder,
  FiTag,
  FiLayers,
  FiShield,
  FiBookmark,
  FiHeart,
} from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';
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

// 内容容器
const Container = styled.div`
  padding: 1.5rem;
  position: relative;
  z-index: 1;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.01em;
`;

const ActionsList = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
`;

// 高级操作卡片
const ActionCard = styled(motion.div)`
  position: relative;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.05) 0%, rgba(var(--accent-rgb), 0.02) 100%);
  border: 1px solid rgba(var(--accent-rgb), 0.12);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;

  /* 图标容器 */
  display: flex;
  align-items: center;
  gap: 1rem;

  /* 悬浮光效 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    border-color: rgba(var(--accent-rgb), 0.3);
    box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.15);
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(var(--accent-rgb), 0.04) 100%);

    &::before {
      left: 100%;
    }

    .action-icon {
      transform: scale(1.1) rotate(5deg);
      color: var(--accent-color);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(var(--accent-rgb), 0.03) 100%);
    border-color: rgba(var(--accent-rgb), 0.2);

    &:hover {
      background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.12) 0%, rgba(var(--accent-rgb), 0.06) 100%);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--accent-rgb), 0.1);
  border-radius: 12px;
  color: var(--accent-color);
  font-size: 1.25rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex-shrink: 0;
`;

const ActionLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
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

  const getIconByKey = (key: string): React.ReactNode => {
    switch (key) {
      case 'notes':
      case 'note-likes':
        return <FiBookOpen />;
      case 'articles':
      case 'article-likes':
        return <FiFileText />;
      case 'comments':
        return <FiMessageSquare />;
      case 'users':
        return <FiUsers />;
      case 'categories':
        return <FiFolder />;
      case 'tags':
        return <FiTag />;
      case 'projects':
        return <FiLayers />;
      case 'security':
        return <FiShield />;
      case 'site-settings':
        return <FiSettings />;
      case 'bookmarks':
        return <FiBookmark />;
      case 'logout':
        return <FiLogOut />;
      case 'article-likes-alt':
        return <FiHeart />;
      default:
        return <FiBarChart />;
    }
  };

  // 转换 QuickActionConfig 为 QuickAction
  const convertedActions: QuickAction[] =
    actions?.map((config) => ({
      id: config.id,
      label: config.label,
      icon: getIconByKey(config.icon),
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
        {convertedActions.map((action, index) => (
          <ActionCard
            key={action.id}
            onClick={action.onClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon className="action-icon">{action.icon}</ActionIcon>
            <ActionLabel>{action.label}</ActionLabel>
          </ActionCard>
        ))}
      </ActionsList>
    </Container>
  );
};
