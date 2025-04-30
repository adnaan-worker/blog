import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiLock, FiMail, FiGithub, FiTwitter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '@/store/userSlice';
import type { RootState, AppDispatch } from '@/store';

// 弹窗背景遮罩
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 弹窗容器
const ModalContainer = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  
  [data-theme='dark'] & {
    background: var(--bg-secondary);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

// 关闭按钮
const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
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
    if (formData.password !== formData.confirmPassword) {
      // 处理密码不匹配的情况
      return;
    }
    await dispatch(register(formData.username, formData.email, formData.password));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FiX size={20} />
            </CloseButton>
            
            <Title>注册账号</Title>
            
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
                  <FiMail size={18} />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="邮箱"
                  value={formData.email}
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

              <InputGroup>
                <InputIcon>
                  <FiLock size={18} />
                </InputIcon>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              
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
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal; 