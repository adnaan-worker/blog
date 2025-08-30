import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import {
  FiEdit,
  FiEdit3,
  FiCalendar,
  FiMapPin,
  FiMail,
  FiGlobe,
  FiGithub,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiCamera,
} from 'react-icons/fi';
import { Button } from '@/components/ui';
import type { UserProfile } from './types';

interface UserInfoCardProps {
  user: UserProfile;
  onEditProfile: () => void;
  onAvatarChange: (file: File) => void;
  isLoading?: boolean;
}

// 卡片基础样式
const Card = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  text-align: center;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  margin: 0 auto 1rem;
  width: 120px;
  height: 120px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--accent-color-alpha);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    opacity: 1;
  }

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
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const UserBio = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  text-align: center;
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

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background: var(--accent-color);
    color: white;
    transform: translateY(-2px);
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
    <Card>
      {isLoading && (
        <LoadingOverlay>
          <div>更新中...</div>
        </LoadingOverlay>
      )}

      <AvatarContainer>
        <Avatar>
          <img src={user.avatar || '/api/placeholder/120/120'} alt="用户头像" />
          <AvatarOverlay onClick={handleAvatarClick}>
            <FiCamera size={24} />
          </AvatarOverlay>
        </Avatar>
        <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
      </AvatarContainer>

      <UserName>{user.username}</UserName>
      {user.bio && <UserBio>{user.bio}</UserBio>}

      <UserDetails>
        {user.location && (
          <DetailItem>
            <FiMapPin size={16} />
            <span>{user.location}</span>
          </DetailItem>
        )}

        <DetailItem>
          <FiMail size={16} />
          <span>{user.email}</span>
        </DetailItem>

        {user.website && (
          <DetailItem>
            <FiGlobe size={16} />
            <a href={user.website} target="_blank" rel="noopener noreferrer">
              {user.website}
            </a>
          </DetailItem>
        )}

        <DetailItem>
          <FiCalendar size={16} />
          <span>加入于 {formatDate(user.joinDate)}</span>
        </DetailItem>
      </UserDetails>

      {/* 社交链接 */}
      <SocialLinks>
        {Object.entries(user.socialLinks).map(([platform, url]) => {
          if (!url) return null;
          return (
            <SocialLink key={platform} href={url} target="_blank" rel="noopener noreferrer" title={platform}>
              {getSocialIcon(platform)}
            </SocialLink>
          );
        })}
      </SocialLinks>

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
