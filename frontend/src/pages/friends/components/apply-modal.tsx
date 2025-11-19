import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Input, Button, Toast, Textarea } from 'adnaan-ui';
import { FiUser, FiLink, FiImage, FiMessageSquare, FiSend } from 'react-icons/fi';

interface ApplyModalProps {
  visible: boolean;
  onClose: () => void;
}

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
`;

const Tip = styled.div`
  background: rgba(var(--accent-rgb), 0.05);
  border: 1px solid rgba(var(--accent-rgb), 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;

  strong {
    color: var(--accent-color);
  }
`;

export const ApplyModal: React.FC<ApplyModalProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    avatar: '',
    desc: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.url || !formData.desc) {
      adnaan.toast.error('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      // TODO: 替换为真实API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      adnaan.toast.success('申请已提交，请等待审核');
      onClose();
      setFormData({ name: '', url: '', avatar: '', desc: '' });
    } catch (error) {
      adnaan.toast.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={onClose}
      title="申请友链"
      width={500}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button onClick={onClose} variant="ghost">
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={loading}
            leftIcon={loading ? undefined : <FiSend />}
          >
            {loading ? '提交中...' : '提交申请'}
          </Button>
        </div>
      }
    >
      <Tip>
        <strong>申请须知：</strong>
        <br />
        1. 您的网站需内容健康，无违规信息
        <br />
        2. 优先通过具有原创内容的博客
        <br />
        3. 请先在贵站添加本站链接
      </Tip>

      <Form>
        <FormItem>
          <label>网站名称</label>
          <Input
            placeholder="请输入您的网站名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<FiUser />}
          />
        </FormItem>

        <FormItem>
          <label>网站链接</label>
          <Input
            placeholder="https://"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            leftIcon={<FiLink />}
          />
        </FormItem>

        <FormItem>
          <label>头像地址</label>
          <Input
            placeholder="https://"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            leftIcon={<FiImage />}
          />
        </FormItem>

        <FormItem>
          <label>网站描述</label>
          <Textarea
            placeholder="一句话介绍您的网站..."
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            rows={3}
          />
        </FormItem>
      </Form>
    </Modal>
  );
};
