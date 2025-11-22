import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  FiEdit3,
  FiTrash2,
  FiEye,
  FiHeart,
  FiCalendar,
  FiClock,
  FiFolder,
  FiTag,
  FiStar,
  FiGitBranch,
  FiCode,
  FiAlertCircle,
  FiDownload,
  FiMapPin,
  FiSmile,
} from 'react-icons/fi';

// 通用卡片样式 - 适配全息风格
export const ItemCard = styled(motion.div)`
  background: rgba(var(--bg-tertiary-rgb), 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(var(--bg-tertiary-rgb), 0.4);
    border-color: rgba(var(--accent-rgb), 0.3);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.1);

    /* 悬停时的光效 */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
        rgba(var(--accent-rgb), 0.1) 0%, 
        transparent 50%
      );
      pointer-events: none;
      opacity: 0.5;
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

export const ItemTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  line-height: 1.4;
  letter-spacing: -0.01em;
`;

export const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;

  ${ItemCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid transparent;
  border-radius: 10px;
  background: rgba(var(--text-primary-rgb), 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
    transform: translateY(-1px);
  }
`;

export const ItemContent = styled.div`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

export const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  svg {
    opacity: 0.7;
  }
`;

export const StatusBadge = styled.div<{ status?: string }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case 'published':
        return 'rgba(34, 197, 94, 0.1)';
      case 'draft':
        return 'rgba(239, 68, 68, 0.1)';
      case 'approved':
        return 'rgba(34, 197, 94, 0.1)';
      case 'pending':
        return 'rgba(255, 193, 7, 0.1)';
      case 'rejected':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'published':
        return '#22c55e';
      case 'draft':
        return '#ef4444';
      case 'approved':
        return '#22c55e';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
`;

export const Tag = styled.span`
  padding: 0.2rem 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;

  &::before {
    content: '#';
    opacity: 0.6;
  }
`;

// 通用图标映射
export const getMetaIcon = (type: string) => {
  switch (type) {
    case 'date':
      return <FiCalendar size={12} />;
    case 'time':
      return <FiClock size={12} />;
    case 'view':
    case 'views':
      return <FiEye size={12} />;
    case 'like':
    case 'likes':
      return <FiHeart size={12} />;
    case 'category':
      return <FiFolder size={12} />;
    case 'tag':
    case 'tags':
      return <FiTag size={12} />;
    case 'star':
    case 'stars':
      return <FiStar size={12} />;
    case 'fork':
    case 'forks':
      return <FiGitBranch size={12} />;
    case 'code':
    case 'language':
      return <FiCode size={12} />;
    case 'alert':
    case 'issue':
    case 'issues':
      return <FiAlertCircle size={12} />;
    case 'download':
    case 'downloads':
      return <FiDownload size={12} />;
    case 'location':
    case 'place':
      return <FiMapPin size={12} />;
    case 'mood':
      return <FiSmile size={12} />;
    default:
      return null;
  }
};

// 通用操作按钮图标映射
export const getActionIcon = (action: string) => {
  switch (action) {
    case 'edit':
      return <FiEdit3 size={14} />;
    case 'delete':
      return <FiTrash2 size={14} />;
    case 'view':
      return <FiEye size={14} />;
    default:
      return null;
  }
};

// 通用空状态组件
export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-tertiary);

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  p {
    font-size: 0.9rem;
    margin-bottom: 2rem;
    opacity: 0.8;
  }
`;

export default {
  ItemCard,
  ItemHeader,
  ItemTitle,
  ItemActions,
  ActionButton,
  ItemContent,
  ItemMeta,
  MetaItem,
  StatusBadge,
  TagsContainer,
  Tag,
  EmptyState,
  getMetaIcon,
  getActionIcon,
};
