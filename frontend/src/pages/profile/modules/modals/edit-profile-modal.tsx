import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiSave, FiUpload, FiUser } from 'react-icons/fi';
import { Button, Input, Textarea } from 'adnaan-ui';
import { Modal } from 'adnaan-ui';
import type { UserProfile, EditProfileForm } from '../types';

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

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
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

const ErrorMessage = styled.div`
  color: var(--error-color);
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
    fullName: '',
    email: '',
    bio: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [errors, setErrors] = useState<Partial<EditProfileForm>>({});

  // 初始化表单数据
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData, avatarFile || undefined);
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
          <SectionTitle>头像</SectionTitle>
          <AvatarSection>
            <AvatarPreview>
              {avatarPreview && avatarPreview.trim() ? (
                <img key={avatarPreview} src={avatarPreview} alt="头像预览" />
              ) : (
                <AvatarFallback>
                  <FiUser size={32} />
                </AvatarFallback>
              )}
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
          <SectionTitle>基本信息</SectionTitle>

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
              <Label>姓名</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="请输入真实姓名"
              />
            </FormField>
          </FormRow>

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

          <FormField>
            <Label>个人简介</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="介绍一下自己..."
              maxLength={500}
              size="small"
              style={{ minHeight: '80px', fontSize: '0.875rem' }}
            />
          </FormField>
        </FormSection>
      </ModalContent>
    </Modal>
  );
};
