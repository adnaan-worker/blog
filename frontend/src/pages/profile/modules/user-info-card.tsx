import React, { useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  FiEdit,
  FiEdit3,
  FiCalendar,
  FiUser,
  FiMail,
  FiGithub,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiCamera,
} from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';
import type { UserProfile } from './types';

interface UserInfoCardProps {
  user: UserProfile;
  onEditProfile: () => void;
  onAvatarChange: (file: File) => void;
  isLoading?: boolean;
}

// 高级卡片容器 - 主题色渐变背景
const Card = styled(motion.div)`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb), 0.08) 0%,
    rgba(var(--accent-rgb), 0.03) 50%,
    var(--bg-primary) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(var(--accent-rgb), 0.15);
  padding: 2rem 1.5rem;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(var(--accent-rgb), 0.12);

  /* 动态光效 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  [data-theme='dark'] & {
    background: linear-gradient(
      135deg,
      rgba(var(--accent-rgb), 0.12) 0%,
      rgba(var(--accent-rgb), 0.05) 50%,
      var(--bg-secondary) 100%
    );
    border-color: rgba(var(--accent-rgb), 0.25);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const AvatarContainer = styled(motion.div)`
  position: relative;
  margin: 0 auto 1.5rem;
  width: 140px;
  height: 140px;
  z-index: 1;

  /* 主题色光晕 */
  &::before {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(var(--accent-rgb), 0.3) 0%,
      rgba(var(--accent-rgb), 0.1) 50%,
      transparent 70%
    );
    filter: blur(20px);
    opacity: 0.6;
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
`;

const Avatar = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(var(--accent-rgb), 0.3);
  position: relative;
  background: var(--bg-tertiary);
  box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    border-color: rgba(var(--accent-rgb), 0.6);
    box-shadow: 0 12px 32px rgba(var(--accent-rgb), 0.3);
  }
`;

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 2.5rem;
`;

const AvatarOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;

  svg {
    color: white;
  }
`;

const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const UserName = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;
`;

const UserBio = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;

  svg {
    color: var(--accent-color);
    flex-shrink: 0;
  }

  a {
    color: var(--accent-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  z-index: 10;
`;

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  onEditProfile,
  onAvatarChange,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { variants, springPresets } = useAnimationEngine();

  const avatarSrc = useMemo(() => {
    if (!user.avatar) {
      return null;
    }

    return user.avatar;
  }, [user.avatar]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }

      onAvatarChange(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <FiGithub size={18} />;
      case 'twitter':
        return <FiTwitter size={18} />;
      case 'linkedin':
        return <FiLinkedin size={18} />;
      case 'instagram':
        return <FiInstagram size={18} />;
      default:
        return null;
    }
  };

  return (
    <Card
      variants={variants.card}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)' }}
      transition={springPresets.gentle}
    >
      {isLoading && (
        <LoadingOverlay>
          <div>更新中...</div>
        </LoadingOverlay>
      )}

      <AvatarContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springPresets.bouncy}
      >
        <Avatar>
          {avatarSrc && avatarSrc.trim() ? (
            <img key={avatarSrc} src={avatarSrc} alt="用户头像" />
          ) : (
            <AvatarFallback>
              <FiUser size={48} />
            </AvatarFallback>
          )}
          <AvatarOverlay
            onClick={handleAvatarClick}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={springPresets.snappy}
          >
            <FiCamera size={24} />
          </AvatarOverlay>
        </Avatar>
        <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
      </AvatarContainer>

      <UserName>{user.username}</UserName>
      {user.bio && <UserBio>{user.bio}</UserBio>}

      <UserDetails>
        <DetailItem>
          <FiMail size={16} />
          <span>{user.email}</span>
        </DetailItem>

        {user.fullName && (
          <DetailItem>
            <FiUser size={16} />
            <span>{user.fullName}</span>
          </DetailItem>
        )}

        <DetailItem>
          <FiCalendar size={16} />
          <span>加入于 {formatDate(user.joinDate)}</span>
        </DetailItem>
      </UserDetails>

      <Button
        variant="primary"
        size="medium"
        fullWidth
        leftIcon={<FiEdit3 size={16} />}
        onClick={onEditProfile}
        disabled={isLoading}
      >
        编辑资料
      </Button>
    </Card>
  );
};
