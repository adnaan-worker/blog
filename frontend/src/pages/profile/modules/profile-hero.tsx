import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiCamera, FiEdit3, FiMapPin, FiCalendar, FiMail, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';
import type { UserProfile, UserAchievement } from '@/types';

interface ProfileHeroProps {
  user: UserProfile;
  achievements?: UserAchievement[];
  onEditProfile: () => void;
  onAvatarChange: (file: File) => void;
  isLoading?: boolean;
}

const HeroContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  width: 100%;
  padding: 2rem 1rem;
`;

const AvatarWrapper = styled(motion.div)`
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, transparent, var(--accent-color), transparent);
    animation: rotate 4s linear infinite;
    mask: radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px));
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--bg-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: relative;
  background: var(--bg-tertiary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const AvatarOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  color: white;
  border-radius: 50%;

  &:hover {
    opacity: 1;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const Name = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  word-break: break-word;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Bio = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 100%;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
  padding: 0 0.5rem;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 480px) {
    gap: 1rem;
    font-size: 0.9rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-tertiary);

  svg {
    color: var(--accent-color);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled(motion.a)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--bg-primary-rgb), 0.5);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-color-alpha);
    color: var(--accent-color);
    transform: translateY(-4px);
    border-color: var(--accent-color);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const BadgeItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  background: rgba(var(--accent-rgb), 0.1);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--accent-color);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  cursor: default;

  img {
    width: 16px;
    height: 16px;
  }
`;

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  achievements = [],
  onEditProfile,
  onAvatarChange,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { variants, springPresets } = useAnimationEngine();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <HeroContainer variants={variants.listItemUp} initial="hidden" animate="visible" transition={springPresets.gentle}>
      <AvatarWrapper whileHover={{ scale: 1.05 }} transition={springPresets.bouncy}>
        <Avatar>
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg-tertiary)' }} />
          )}
          <AvatarOverlay onClick={handleAvatarClick}>
            <FiCamera size={32} />
          </AvatarOverlay>
        </Avatar>
        <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
      </AvatarWrapper>

      <InfoContainer>
        <Name>{user.fullName || user.username}</Name>

        {achievements.length > 0 && (
          <BadgeContainer>
            {achievements.slice(0, 4).map((badge, index) => (
              <BadgeItem
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                title={badge.name}
              >
                <span>{badge.icon || '成就'}</span>
                <span>{badge.name}</span>
              </BadgeItem>
            ))}
          </BadgeContainer>
        )}

        {user.bio && <Bio>{user.bio}</Bio>}

        <MetaRow>
          <MetaItem>
            <FiCalendar size={16} />
            <span>加入于 {formatDate(user.joinDate)}</span>
          </MetaItem>
          <MetaItem>
            <FiMail size={16} />
            <span>{user.email}</span>
          </MetaItem>
        </MetaRow>

        <SocialLinks>
          <SocialLink href="#" whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}>
            <FiGithub />
          </SocialLink>
          <SocialLink href="#" whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}>
            <FiTwitter />
          </SocialLink>
          <SocialLink href="#" whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}>
            <FiInstagram />
          </SocialLink>
        </SocialLinks>

        <ActionButtons>
          <Button
            variant="primary"
            leftIcon={<FiEdit3 />}
            onClick={onEditProfile}
            disabled={isLoading}
            style={{ borderRadius: '100px', padding: '0.6rem 1.5rem' }}
          >
            编辑资料
          </Button>
        </ActionButtons>
      </InfoContainer>
    </HeroContainer>
  );
};
