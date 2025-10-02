import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiSave, FiUpload, FiGithub, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { Button, Input } from '@/components/ui';
import { Modal } from '@/ui/modal';
import type { UserProfile, EditProfileForm } from './types';

interface EditProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (formData: EditProfileForm, avatarFile?: File) => void;
  isLoading?: boolean;
}

const ModalContent = styled.div`
  width: 100%;
  height: 500px;
  padding: 0;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AvatarPreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarUploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormField = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const SocialLinksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const SocialInputWrapper = styled.div`
  position: relative;
`;

const SocialIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-color);
  z-index: 1;
`;

const SocialInput = styled(Input)`
  padding-left: 2.5rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EditProfileForm>({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [errors, setErrors] = useState<Partial<EditProfileForm>>({});

  // 初始化表单数据
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
          github: user.socialLinks.github || '',
          twitter: user.socialLinks.twitter || '',
          linkedin: user.socialLinks.linkedin || '',
          instagram: user.socialLinks.instagram || '',
        },
      });
      setAvatarPreview(user.avatar || '');
      setErrors({});
      setAvatarFile(null);
    }
  }, [user, isOpen]);

  const handleInputChange = (field: keyof EditProfileForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setAvatarFile(file);

      // 生成预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditProfileForm> = {};

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少需要2个字符';
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = '网站地址应以http://或https://开头';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData, avatarFile || undefined);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <FiGithub size={16} />;
      case 'twitter':
        return <FiTwitter size={16} />;
      case 'linkedin':
        return <FiLinkedin size={16} />;
      case 'instagram':
        return <FiInstagram size={16} />;
      default:
        return null;
    }
  };

  const getSocialPlaceholder = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'https://github.com/username';
      case 'twitter':
        return 'https://twitter.com/username';
      case 'linkedin':
        return 'https://linkedin.com/in/username';
      case 'instagram':
        return 'https://instagram.com/username';
      default:
        return '';
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        取消
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        leftIcon={<FiSave size={16} />}
        isLoading={isLoading}
        disabled={isLoading}
      >
        保存更改
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium" title="编辑个人资料" footer={footer}>
      <ModalContent>
        {/* 头像部分 */}
        <FormSection>
          <SectionTitle>👤 头像</SectionTitle>
          <AvatarSection>
            <AvatarPreview>
              <img src={avatarPreview || '/api/placeholder/80/80'} alt="头像预览" />
            </AvatarPreview>
            <div>
              <AvatarUploadButton onClick={() => document.getElementById('avatar-upload')?.click()}>
                <FiUpload size={16} />
                更换头像
              </AvatarUploadButton>
              <HiddenFileInput id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>
          </AvatarSection>
        </FormSection>

        {/* 基本信息 */}
        <FormSection>
          <SectionTitle>📝 基本信息</SectionTitle>

          <FormRow>
            <FormField>
              <Label>用户名 *</Label>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="请输入用户名"
                isInvalid={!!errors.username}
              />
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            </FormField>

            <FormField>
              <Label>邮箱 *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="请输入邮箱地址"
                isInvalid={!!errors.email}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormField>
          </FormRow>

          <FormRow>
            <FormField>
              <Label>所在地</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="请输入所在地"
              />
            </FormField>

            <FormField>
              <Label>个人网站</Label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                isInvalid={!!errors.website}
              />
              {errors.website && <ErrorMessage>{errors.website}</ErrorMessage>}
            </FormField>
          </FormRow>

          <FormField>
            <Label>个人简介</Label>
            <TextArea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="介绍一下自己..."
              maxLength={500}
            />
          </FormField>
        </FormSection>

        {/* 社交链接 */}
        <FormSection>
          <SectionTitle>🔗 社交链接</SectionTitle>
          <SocialLinksGrid>
            {Object.entries(formData.socialLinks).map(([platform, url]) => (
              <FormField key={platform}>
                <Label>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Label>
                <SocialInputWrapper>
                  <SocialIcon>{getSocialIcon(platform)}</SocialIcon>
                  <SocialInput
                    value={url}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                    placeholder={getSocialPlaceholder(platform)}
                  />
                </SocialInputWrapper>
              </FormField>
            ))}
          </SocialLinksGrid>
        </FormSection>
      </ModalContent>
    </Modal>
  );
};
