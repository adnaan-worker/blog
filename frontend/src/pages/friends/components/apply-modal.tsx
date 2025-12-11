import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Input, Button, Textarea } from 'adnaan-ui';
import { API } from '@/utils/api';
import type { FriendLinkApplyData } from '@/types';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FriendLinkApplyData>({
    name: '',
    url: '',
    description: '',
    avatar: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.url.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await API.friends.applyFriend({
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description?.trim(),
        avatar: formData.avatar?.trim(),
      });

      adnaan.toast.success('友链申请已提交，审核通过后会展示');
      setFormData({ name: '', url: '', description: '', avatar: '' });
      onClose();
      onSuccess?.();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('提交友链申请失败:', error);
      adnaan.toast.error(error.message || '提交友链申请失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="申请友链" width="500px" footer={null}>
      <Form onSubmit={handleSubmit}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          欢迎交换友链！请确保你的网站内容健康积极。
          <br />
          本站信息：名称 [光阴副本] / 描述 [记录思考与成长]
        </div>

        <FormGroup>
          <Label>网站名称</Label>
          <Input
            placeholder="你的网站名称"
            value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>网站地址 (URL)</Label>
          <Input
            placeholder="https://example.com"
            value={formData.url}
            onChange={(e: any) => setFormData({ ...formData, url: e.target.value })}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>头像地址</Label>
          <Input
            placeholder="https://example.com/avatar.png"
            value={formData.avatar}
            onChange={(e: any) => setFormData({ ...formData, avatar: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>网站描述</Label>
          <Textarea
            placeholder="一句话介绍你的网站..."
            value={formData.description}
            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </FormGroup>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button onClick={onClose} variant="secondary">
            取消
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting}>
            发送申请
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
