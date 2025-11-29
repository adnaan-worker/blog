import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  FiEdit3,
  FiTrash2,
  FiEye,
  FiHeart,
  FiCalendar,
  FiMessageSquare,
  FiCheck,
  FiStar,
  FiMoreHorizontal,
  FiArrowRight,
} from 'react-icons/fi';

// ============================================================================
// Blog Native Design - Based on DashboardCard & UnifiedIdentityCard
// ============================================================================

export const ItemCard = styled(motion.div)`
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 1.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;

  /* 核心：复刻 DashboardCard 的材质感 */
  background: rgba(var(--bg-secondary-rgb), 0.4);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-rgb), 0.08);

  /* 顶部渐变光效 - 呼应 DashboardCard */
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.3), transparent);
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }

  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.005);
    background: rgba(var(--bg-secondary-rgb), 0.6);
    box-shadow:
      0 20px 40px -10px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(var(--accent-rgb), 0.15) inset;
    border-color: rgba(var(--accent-rgb), 0.2);

    &::before {
      opacity: 1;
      background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

// 封面 - 使用 UnifiedIdentityCard 的投影风格
export const ItemCover = styled.div<{ src?: string }>`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: ${(props) => (props.src ? `url(${props.src}) center/cover no-repeat` : 'rgba(var(--accent-rgb), 0.05)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  font-size: 1.5rem;
  border: 1px solid rgba(var(--border-rgb), 0.05);
  position: relative;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 内发光效果 */
  box-shadow: inset 0 0 20px rgba(var(--accent-rgb), 0.05);

  ${ItemCard}:hover & {
    transform: scale(1.1) rotate(-3deg);
    background-color: rgba(var(--accent-rgb), 0.1);
  }

  @media (max-width: 640px) {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    font-size: 1.25rem;
  }
`;

export const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const ItemTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  transition: color 0.2s ease;

  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${ItemCard}:hover & {
    color: var(--accent-color);
  }
`;

export const ItemContent = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  opacity: 0.8;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 0.25rem;

  @media (max-width: 640px) {
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-weight: 500;

  svg {
    font-size: 0.9rem;
    opacity: 0.6;
    transition: transform 0.3s ease;
  }

  ${ItemCard}:hover & svg {
    transform: scale(1.2);
    color: var(--accent-color);
    opacity: 1;
  }
`;

// 操作区 - 类似 Dock 的悬浮感
export const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;

  /* 默认隐藏，Hover 时滑入 */
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  ${ItemCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }

  @media (max-width: 640px) {
    flex-direction: row;
    opacity: 1;
    transform: none;
    justify-content: flex-end;
    border-top: 1px dashed rgba(var(--border-rgb), 0.1);
    padding-top: 1rem;
    margin-top: -0.5rem;
  }
`;

export const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: rgba(var(--bg-primary-rgb), 0.5);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    background: var(--bg-primary);
    color: var(--accent-color);
    transform: scale(1.15);
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--accent-rgb), 0.2);
  }

  &[data-variant='delete']:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);
  }
`;

// 状态胶囊 - 极简圆点风格
export const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(var(--bg-secondary-rgb), 0.8);
  border: 1px solid rgba(var(--border-rgb), 0.1);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  ${(props) => {
    switch (props.status) {
      case 'published':
      case 'approved':
      case 'active':
      case 'public':
        return 'color: #10b981;'; // Emerald 500
      case 'draft':
      case 'pending':
      case 'developing':
      case 'private':
        return 'color: #f59e0b;'; // Amber 500
      case 'rejected':
      case 'spam':
      case 'banned':
        return 'color: #ef4444;'; // Red 500
      default:
        return 'color: var(--text-tertiary);';
    }
  }}
`;

export const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

export const Tag = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(var(--bg-tertiary-rgb), 0.5);
  transition: all 0.2s;

  &:hover {
    background: rgba(var(--accent-rgb), 0.1);
    color: var(--accent-color);
  }
`;

// Empty State - 匹配 UnifiedIdentityCard 的渐变
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  background: rgba(var(--bg-secondary-rgb), 0.2);
  border-radius: 32px;
  border: 2px dashed rgba(var(--border-rgb), 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(180deg, rgba(var(--accent-rgb), 0.05) 0%, transparent 100%);
    pointer-events: none;
  }

  svg {
    font-size: 3rem;
    color: var(--accent-color);
    opacity: 0.3;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 10px 20px rgba(var(--accent-rgb), 0.2));
  }

  h3 {
    font-size: 1.25rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  p {
    color: var(--text-secondary);
    max-width: 300px;
    text-align: center;
    opacity: 0.8;
  }
`;

export const getMetaIcon = (type: string) => {
  switch (type) {
    case 'date':
      return <FiCalendar />;
    case 'view':
      return <FiEye />;
    case 'like':
      return <FiHeart />;
    case 'comment':
      return <FiMessageSquare />;
    default:
      return <FiStar />;
  }
};

export const getActionIcon = (action: string) => {
  switch (action) {
    case 'edit':
      return <FiEdit3 />;
    case 'delete':
      return <FiTrash2 />;
    case 'view':
      return <FiArrowRight />;
    default:
      return <FiMoreHorizontal />;
  }
};

export default {
  ItemCard,
  ItemCover,
  ItemBody,
  ItemHeader,
  ItemTitle,
  ItemContent,
  ItemMeta,
  MetaItem,
  ItemActions,
  ActionButton,
  StatusBadge,
  TagsContainer,
  Tag,
  EmptyState,
  getMetaIcon,
  getActionIcon,
};
