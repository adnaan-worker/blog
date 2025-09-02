import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { Button, Input } from '@/components/ui';
import { toast } from '@/ui';
import { API, ChangePasswordParams } from '@/utils/api';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const PasswordInput = styled.div`
  position: relative;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-secondary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PasswordStrengthIndicator = styled.div<{ strength: 'weak' | 'medium' | 'strong' }>`
  height: 4px;
  border-radius: 2px;
  background: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return 'var(--danger-color)';
      case 'medium':
        return 'var(--warning-color)';
      case 'strong':
        return 'var(--success-color)';
      default:
        return 'var(--border-color)';
    }
  }};
  transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.div<{ strength: 'weak' | 'medium' | 'strong' }>`
  font-size: 0.75rem;
  color: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return 'var(--danger-color)';
      case 'medium':
        return 'var(--warning-color)';
      case 'strong':
        return 'var(--success-color)';
      default:
        return 'var(--text-secondary)';
    }
  }};
  margin-top: 0.25rem;
`;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<ChangePasswordParams>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ChangePasswordParams>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordParams> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '新密码至少8位';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = '新密码不能与当前密码相同';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLetter && hasNumber && hasSpecial) return 'strong';
    if ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial)) return 'medium';
    return 'weak';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await API.user.changePassword(formData);
      toast.success('密码修改成功！');
      onClose();
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || '密码修改失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ChangePasswordParams, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <ModalContent
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>修改密码</ModalTitle>
              <CloseButton onClick={onClose}>
                <FiX size={20} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>当前密码</Label>
                <PasswordInput>
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder="请输入当前密码"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    error={errors.currentPassword}
                    icon={<FiLock />}
                  />
                  <TogglePasswordButton type="button" onClick={() => togglePasswordVisibility('current')}>
                    {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </TogglePasswordButton>
                </PasswordInput>
              </FormGroup>

              <FormGroup>
                <Label>新密码</Label>
                <PasswordInput>
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="请输入新密码（至少8位）"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    error={errors.newPassword}
                    icon={<FiLock />}
                  />
                  <TogglePasswordButton type="button" onClick={() => togglePasswordVisibility('new')}>
                    {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </TogglePasswordButton>
                </PasswordInput>
                {formData.newPassword && (
                  <>
                    <PasswordStrengthIndicator strength={passwordStrength} />
                    <PasswordStrengthText strength={passwordStrength}>
                      {passwordStrength === 'weak' && '密码强度：弱'}
                      {passwordStrength === 'medium' && '密码强度：中等'}
                      {passwordStrength === 'strong' && '密码强度：强'}
                    </PasswordStrengthText>
                  </>
                )}
              </FormGroup>

              <FormGroup>
                <Label>确认新密码</Label>
                <PasswordInput>
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="请再次输入新密码"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    icon={<FiLock />}
                  />
                  <TogglePasswordButton type="button" onClick={() => togglePasswordVisibility('confirm')}>
                    {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </TogglePasswordButton>
                </PasswordInput>
              </FormGroup>

              <ButtonGroup>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} style={{ flex: 1 }}>
                  取消
                </Button>
                <Button type="submit" loading={isLoading} style={{ flex: 1 }}>
                  确认修改
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
