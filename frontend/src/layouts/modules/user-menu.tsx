import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/modules/userSlice';
import type { RootState, AppDispatch } from '@/store';
import { getRoleDisplayName, getRoleColor } from '@/utils/helpers/role';
import { useAnimationEngine } from '@/utils/ui/animation';
import { LazyImage } from '@/components/common';

// 用户头像样式
const Avatar = styled.div<{ hasImage?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: ${(props) => (props.hasImage ? '2px solid var(--accent-color-alpha)' : 'none')};
  transition: all 0.2s ease;
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    border-color: ${(props) => (props.hasImage ? 'var(--accent-color)' : 'none')};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// 移动端头像样式
export const MobileAvatar = styled(Avatar)`
  display: none;
  margin-right: 0.5rem;
  margin-left: 0;
`;

// 用户下拉菜单样式
const UserDropdownContent = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 220px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;

  [data-theme='dark'] & {
    background: var(--bg-secondary);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

const UserDropdownHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const UserRole = styled.div<{ roleColor?: string }>`
  font-size: 0.8rem;
  color: ${(props) => props.roleColor || 'var(--text-secondary)'};
  font-weight: 500;
`;

const UserDropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 0.95rem;
  gap: 0.75rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  [data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    color: var(--text-tertiary);
  }
`;

const UserDropdownLogout = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  color: var(--danger-color);
  transition: all 0.2s ease;
  font-size: 0.95rem;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  border-top: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-secondary);
  }

  [data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    color: var(--danger-color);
  }
`;

interface UserMenuProps {
  userDropdownOpen: boolean;
  toggleUserDropdown: (e: React.MouseEvent<Element, MouseEvent>) => void;
  userDropdownRef: React.RefObject<HTMLDivElement>;
  handleLogin: () => void;
  handleRegister: () => void;
  handleLinkClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userDropdownOpen,
  toggleUserDropdown,
  userDropdownRef,
  handleLogin,
  handleRegister,
  handleLinkClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.user);
  const { variants } = useAnimationEngine();
  const avatarSrc = user?.avatar || null;

  // 处理登出
  const handleLogout = () => {
    dispatch(logoutUser());
    handleLinkClick();
  };

  return (
    <div ref={userDropdownRef} style={{ position: 'relative' }}>
      {isLoggedIn ? (
        <Avatar hasImage={Boolean(avatarSrc)} onClick={(e) => toggleUserDropdown(e)}>
          {avatarSrc && avatarSrc.trim() ? (
            <LazyImage key={avatarSrc} src={avatarSrc} alt={user?.username || '用户头像'} />
          ) : (
            <FiUser color="var(--text-secondary)" />
          )}
        </Avatar>
      ) : (
        <Avatar onClick={(e) => toggleUserDropdown(e)}>
          <FiUser color="var(--text-secondary)" />
        </Avatar>
      )}

      <AnimatePresence>
        {userDropdownOpen && (
          <UserDropdownContent initial="hidden" animate="visible" exit="exit" variants={variants.dropdown}>
            {isLoggedIn ? (
              <>
                <UserDropdownHeader>
                  <Avatar>
                    {avatarSrc && avatarSrc.trim() ? (
                      <LazyImage key={`dropdown-${avatarSrc}`} src={avatarSrc} alt={user?.username || '用户头像'} />
                    ) : (
                      <FiUser color="var(--text-secondary)" />
                    )}
                  </Avatar>
                  <UserInfo>
                    <UserName>{user?.username}</UserName>
                    <UserRole roleColor={getRoleColor(user?.role)}>{getRoleDisplayName(user?.role)}</UserRole>
                  </UserInfo>
                </UserDropdownHeader>

                <UserDropdownItem to="/profile" onClick={handleLinkClick}>
                  <FiUser size={16} /> 个人中心
                </UserDropdownItem>

                <UserDropdownLogout onClick={handleLogout}>
                  <FiLogOut size={16} /> 退出登录
                </UserDropdownLogout>
              </>
            ) : (
              <>
                <UserDropdownItem to="#" onClick={handleLogin}>
                  <FiLogIn size={16} /> 登录
                </UserDropdownItem>

                <UserDropdownItem to="#" onClick={handleRegister}>
                  <FiUserPlus size={16} /> 注册
                </UserDropdownItem>
              </>
            )}
          </UserDropdownContent>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
