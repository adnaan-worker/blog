import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiEdit3, FiBarChart2, FiZap, FiSettings, FiUser, FiGrid } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import type { UserProfile, UserStats } from '@/types';

const MobileHeaderContainer = styled(motion.div)`
  position: relative;
  margin-bottom: 1.5rem;
  display: none;

  @media (max-width: 1024px) {
    display: block;
  }
`;

// 主卡片容器
const MainCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--border-rgb), 0.5);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);

  /* 顶部装饰光晕 - 更柔和 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, rgba(var(--accent-rgb), 0.5), var(--accent-color), rgba(var(--accent-rgb), 0.5));
    opacity: 0.8;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const AvatarContainer = styled(motion.div)`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--bg-primary);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15);
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UserName = styled.h1`
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.2;
`;

const UserBio = styled.p`
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
`;

// 数据统计行
const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.25rem 0.5rem;
  border-top: 1px dashed rgba(var(--border-rgb), 0.5);
  border-bottom: 1px dashed rgba(var(--border-rgb), 0.5);
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  position: relative;
  /* 移除竖线，改用自然间距 */
`;

const StatValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  font-family: var(--font-heading);
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
`;

// 功能导航网格 (金刚区)
const NavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
`;

const NavItem = styled(motion.button)<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  .icon-box {
    width: 46px;
    height: 46px;
    border-radius: 18px;
    /* 激活态使用浅色背景，而非实色 */
    background: ${(props) => (props.active ? 'rgba(var(--accent-rgb), 0.1)' : 'rgba(var(--bg-tertiary-rgb), 0.5)')};
    color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-secondary)')};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid ${(props) => (props.active ? 'rgba(var(--accent-rgb), 0.2)' : 'transparent')};
  }

  .label {
    font-size: 0.75rem;
    color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-tertiary)')};
    font-weight: ${(props) => (props.active ? '600' : '400')};
    transition: color 0.3s ease;
  }

  &:hover .icon-box {
    transform: translateY(-2px);
    background: rgba(var(--accent-rgb), 0.08);
    color: var(--accent-color);
  }

  &:active .icon-box {
    transform: scale(0.92);
  }
`;

interface MobileProfileHeaderProps {
  user: UserProfile | null;
  stats: UserStats[];
  onEdit: () => void;
  onSwitchTab: (tab: string) => void;
  onOpenQuickActions: () => void;
  activeTab: string;
  isAdmin?: boolean;
}

export const MobileProfileHeader: React.FC<MobileProfileHeaderProps> = ({
  user,
  stats,
  onEdit,
  onSwitchTab,
  onOpenQuickActions,
  activeTab,
  isAdmin,
}) => {
  if (!user) return null;

  // 过滤出核心数据展示 (取前3个)
  const displayStats = stats.slice(0, 3);

  return (
    <MobileHeaderContainer initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <MainCard>
        {/* 1. 头部信息 */}
        <HeaderTop>
          <AvatarContainer whileTap={{ scale: 0.95 }}>
            <Avatar src={user.avatar || '/default-avatar.png'} alt={user.username} />
          </AvatarContainer>

          <UserInfo>
            <UserName>
              {user.username}
              {isAdmin && <FiZap size={16} style={{ color: '#FFC107', fill: '#FFC107' }} />}
            </UserName>
            <UserBio>{user.bio || '编辑个性签名...'}</UserBio>
          </UserInfo>
        </HeaderTop>

        {/* 2. 数据统计 */}
        <StatsRow>
          {displayStats.map((stat, index) => (
            <StatItem key={index}>
              <StatValue>{stat.value || stat.count || 0}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatItem>
          ))}
        </StatsRow>

        {/* 3. 功能导航 (金刚区) */}
        <NavGrid>
          {/* 仪表盘 */}
          <NavItem active={activeTab === 'dashboard'} onClick={() => onSwitchTab('dashboard')}>
            <div className="icon-box">
              <FiBarChart2 />
            </div>
            <span className="label">概览</span>
          </NavItem>

          {/* 快捷操作 */}
          <NavItem onClick={onOpenQuickActions}>
            <div className="icon-box">
              <FiGrid />
            </div>
            <span className="label">功能</span>
          </NavItem>

          {/* 编辑资料 */}
          <NavItem onClick={onEdit}>
            <div className="icon-box">
              <FiEdit3 />
            </div>
            <span className="label">编辑</span>
          </NavItem>

          {/* 更多/设置 */}
          <NavItem active={activeTab === 'site-settings'} onClick={() => onSwitchTab('site-settings')}>
            <div className="icon-box">
              <FiSettings />
            </div>
            <span className="label">设置</span>
          </NavItem>
        </NavGrid>
      </MainCard>
    </MobileHeaderContainer>
  );
};
