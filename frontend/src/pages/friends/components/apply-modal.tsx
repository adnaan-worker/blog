import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiLink, FiUser } from 'react-icons/fi';
import { Input, Button, Textarea } from 'adnaan-ui';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const ModalContainer = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background: var(--bg-secondary);
  border-radius: 24px;
  border: 1px solid rgba(var(--border-color-rgb), 0.2);
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;

  @media (max-width: 640px) {
    border-radius: 24px 24px 0 0;
    max-width: 100%;
    border-bottom: none;
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(var(--bg-primary-rgb), 0.5);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-left: 0.25rem;
  }
`;

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', desc: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      setFormData({ name: '', url: '', desc: '' });
      // adnaan.toast.success('申请已提交');
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <ModalContainer
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Header>
              <Title>
                <span style={{ fontSize: '1.5rem' }}>🤝</span> 申请友链
              </Title>
              <Button
                variant="ghost"
                size="small"
                onClick={onClose}
                leftIcon={<FiX />}
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              />
            </Header>

            <Content>
              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <label>网站名称</label>
                  <Input
                    placeholder="例如：Adnaan's Blog"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </InputGroup>

                <InputGroup>
                  <label>网站链接</label>
                  <Input
                    placeholder="https://"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </InputGroup>

                <InputGroup>
                  <label>简介 (选填)</label>
                  <Textarea
                    placeholder="一句话介绍你的网站..."
                    rows={3}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </InputGroup>

                <div style={{ marginTop: '0.5rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    style={{ width: '100%' }}
                    disabled={loading}
                    leftIcon={loading ? undefined : <FiSend />}
                  >
                    {loading ? '提交申请...' : '发送申请'}
                  </Button>
                </div>
              </Form>
            </Content>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
