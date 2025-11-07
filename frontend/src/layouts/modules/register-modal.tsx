import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiUser, FiLock, FiMail, FiGithub, FiTwitter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '@/store/modules/userSlice';
import type { RootState, AppDispatch } from '@/store';
import { Modal, Input } from 'adnaan-ui';

// 模态框内容容器
const ModalContent = styled.div`
  padding: 1.5rem 0;
`;

// 标题
const Title = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// 表单
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// 提交按钮
const SubmitButton = styled.button`
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: var(--accent-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: none;
  }
`;

// 切换表单按钮
const ToggleForm = styled.button`
  background: none;
  border: none;
  color: var(--accent-color);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
    text-decoration: underline;
    filter: brightness(1.2);
  }

  &:active {
    transform: translateY(1px);
    filter: brightness(0.9);
  }
`;

// 社交注册按钮组
const SocialRegisterGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
`;

// 社交注册按钮
const SocialButton = styled.button`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--bg-tertiary);
    transform: translateY(-2px);
  }
`;

// 错误消息
const ErrorMessage = styled.div`
  color: var(--danger-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证密码是否匹配
    if (formData.password !== formData.confirmPassword) {
      adnaan.toast.error('两次输入的密码不一致', '请检查');
      return;
    }

    // 验证密码长度
    if (formData.password.length < 6) {
      adnaan.toast.error('密码长度至少为6位', '请检查');
      return;
    }

    // 执行注册，成功后关闭模态框
    await dispatch(
      register(formData.username, formData.email, formData.password, formData.confirmPassword, () => {
        onClose();
      }),
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <Title>注册账号</Title>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="用户名"
            value={formData.username}
            onChange={handleChange}
            required
            leftIcon={<FiUser size={18} />}
          />

          <Input
            type="email"
            name="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={handleChange}
            required
            leftIcon={<FiMail size={18} />}
          />

          <Input
            type="password"
            name="password"
            placeholder="密码"
            value={formData.password}
            onChange={handleChange}
            required
            leftIcon={<FiLock size={18} />}
          />

          <Input
            type="password"
            name="confirmPassword"
            placeholder="确认密码"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            leftIcon={<FiLock size={18} />}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '处理中...' : '注册'}
          </SubmitButton>

          <ToggleForm type="button" onClick={onSwitchToLogin}>
            已有账号？立即登录
          </ToggleForm>
        </Form>

        <SocialRegisterGroup>
          <SocialButton type="button">
            <FiGithub size={20} />
          </SocialButton>
          <SocialButton type="button">
            <FiTwitter size={20} />
          </SocialButton>
        </SocialRegisterGroup>
      </ModalContent>
    </Modal>
  );
};

export default RegisterModal;
