import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiUser, FiLock, FiGithub, FiTwitter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/modules/userSlice';
import type { RootState, AppDispatch } from '@/store';
import { Modal } from 'adnaan-ui';

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

// 输入框容器
const InputGroup = styled.div`
  position: relative;
`;

// 输入框
const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
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

// 图标
const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
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

// 社交登录按钮组
const SocialLoginGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
`;

// 社交登录按钮
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
          <InputGroup>
            <InputIcon>
              <FiUser size={18} />
            </InputIcon>
            <Input
              type="text"
              name="username"
              placeholder="用户名"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock size={18} />
            </InputIcon>
            <Input
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '处理中...' : '登录'}
          </SubmitButton>

          <ToggleForm type="button" onClick={onSwitchToRegister}>
            没有账号？立即注册
          </ToggleForm>
        </Form>

        <SocialLoginGroup>
          <SocialButton type="button">
            <FiGithub size={20} />
          </SocialButton>
          <SocialButton type="button">
            <FiTwitter size={20} />
          </SocialButton>
        </SocialLoginGroup>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
