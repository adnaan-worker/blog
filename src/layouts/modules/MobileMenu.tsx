import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiHome, FiBookOpen, FiCode, FiInfo, FiMail, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

// 修改移动端菜单样式
const MobileMenuContainer = styled(motion.div)`
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  [data-theme='dark'] & {
    background: var(--bg-primary);
  }
`;

const MobileMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MobileMenuSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MobileMenuTitle = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
`;

const MobileNavLink = styled(Link)<{ active: string }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;
  margin: 0.25rem 0;
  font-size: 1rem;
  font-weight: ${(props) => (props.active === 'true' ? '600' : '500')};
  color: ${(props) => (props.active === 'true' ? 'var(--text-primary)' : 'var(--text-secondary)')};
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 0.75rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  svg {
    font-size: 1.25rem;
    opacity: ${(props) => (props.active === 'true' ? '1' : '0.7')};
    transition: opacity 0.2s ease;
  }
`;

const MobileMenuDivider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
`;

// 定义动画变体
export const mobileMenuVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const MobileAuthButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 0.5rem;
  margin: 0.25rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.75rem;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  svg {
    font-size: 1.25rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
`;

interface MobileMenuProps {
  isOpen: boolean;
  onLinkClick: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onLinkClick, handleLogin, handleRegister }) => {
  const location = useLocation();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  if (!isOpen) return null;

  return (
    <>
      <MobileMenuContainer initial="hidden" animate="visible" exit="exit" variants={mobileMenuVariants}>
        <MobileMenuContent>
          <MobileMenuSection>
            <MobileMenuTitle>主导航</MobileMenuTitle>
            <MobileNavLink to="/" active={location.pathname === '/' ? 'true' : 'false'} onClick={onLinkClick}>
              <FiHome />
              首页
            </MobileNavLink>

            <MobileNavLink
              to="/blog"
              active={location.pathname.includes('/blog') ? 'true' : 'false'}
              onClick={onLinkClick}
            >
              <FiBookOpen />
              博客
            </MobileNavLink>

            <MobileNavLink
              to="/projects"
              active={location.pathname.includes('/projects') ? 'true' : 'false'}
              onClick={onLinkClick}
            >
              <FiCode />
              项目
            </MobileNavLink>
          </MobileMenuSection>

          <MobileMenuDivider />

          <MobileMenuSection>
            <MobileMenuTitle>更多</MobileMenuTitle>
            <MobileNavLink
              to="/ui-examples"
              active={location.pathname.includes('/ui-examples') ? 'true' : 'false'}
              onClick={onLinkClick}
            >
              <FiInfo />
              组件使用示例
            </MobileNavLink>
            <MobileNavLink
              to="/about"
              active={location.pathname.includes('/about') ? 'true' : 'false'}
              onClick={onLinkClick}
            >
              <FiInfo />
              关于我
            </MobileNavLink>
            <MobileNavLink
              to="/contact"
              active={location.pathname.includes('/contact') ? 'true' : 'false'}
              onClick={onLinkClick}
            >
              <FiMail />
              联系方式
            </MobileNavLink>
            <MobileNavLink
              to="/code"
              active={location.pathname.includes('/code') ? 'true' : 'false'}
              onClick={onLinkClick}
            >
              <FiCode />
              开发字体
            </MobileNavLink>
          </MobileMenuSection>

          {!isLoggedIn && (
            <>
              <MobileMenuDivider />
              <MobileMenuSection>
                <MobileMenuTitle>账户</MobileMenuTitle>
                <MobileAuthButton onClick={() => {
                  if (handleLogin) {
                    handleLogin();
                    onLinkClick();
                  }
                }}>
                  <FiLogIn />
                  登录
                </MobileAuthButton>
                <MobileAuthButton onClick={() => {
                  if (handleRegister) {
                    handleRegister();
                    onLinkClick();
                  }
                }}>
                  <FiUserPlus />
                  注册
                </MobileAuthButton>
              </MobileMenuSection>
            </>
          )}
        </MobileMenuContent>
      </MobileMenuContainer>
    </>
  );
};

export default MobileMenu;