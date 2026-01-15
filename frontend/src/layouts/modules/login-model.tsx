import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiUser, FiLock } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/modules/userSlice';
import type { RootState, AppDispatch } from '@/store';
import { Modal, Input } from 'adnaan-ui';
import OAuthButtons from '@/components/auth/OAuthButtons';

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

// 分隔线
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }

  span {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
`;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, isLoggedIn } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // 在登录状态变化时处理模态框关闭
  React.useEffect(() => {
    if (isLoggedIn) {
      onClose();
    }
  }, [isLoggedIn, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login(formData.username, formData.password));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <Title>登录账号</Title>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            size="small"
            placeholder="用户名"
            value={formData.username}
            onChange={handleChange}
            required
            leftIcon={<FiUser size={18} />}
          />

          <Input
            type="password"
            name="password"
            size="small"
            placeholder="密码"
            value={formData.password}
            onChange={handleChange}
            required
            leftIcon={<FiLock size={18} />}
          />

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '处理中...' : '登录'}
          </SubmitButton>

          <ToggleForm type="button" onClick={onSwitchToRegister}>
            没有账号？立即注册
          </ToggleForm>
        </Form>

        <Divider>
          <span>或使用第三方登录</span>
        </Divider>
        <OAuthButtons mode="login" />
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
