import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiSave } from 'react-icons/fi';
import { Button, Input, Textarea } from 'adnaan-ui';
import { Modal } from 'adnaan-ui';
import type { SiteSettings } from '@/types';

interface EditSiteSettingsModalProps {
  isOpen: boolean;
  settings: SiteSettings | null;
  onClose: () => void;
  onSave: (settings: Partial<SiteSettings>) => Promise<void>;
  isLoading?: boolean;
}

const ModalContent = styled.div`
  width: 100%;
  padding: 0;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const StyledTextarea = styled(Textarea)`
  min-height: 80px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  min-height: 50px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--accent-color);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const TagRemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    opacity: 0.8;
  }
`;

const AddTagRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const EditSiteSettingsModal: React.FC<EditSiteSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        authorName: settings.authorName || '',
        authorTitle: settings.authorTitle || '',
        authorBio: settings.authorBio || '',
        mbti: settings.mbti || '',
        location: settings.location || '',
        occupation: settings.occupation || '',
        skills: settings.skills || [],
        socialLinks: settings.socialLinks || {},
        quote: settings.quote || '',
        quoteAuthor: settings.quoteAuthor || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const addSkill = () => {
    if (newSkill.trim()) {
      const skills = formData.skills || [];
      setFormData((prev) => ({
        ...prev,
        skills: [...skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const skills = formData.skills || [];
    setFormData((prev) => ({
      ...prev,
      skills: skills.filter((_, i) => i !== index),
    }));
  };

  // 移除技能标签相关函数（不再需要）

  const handleSubmit = async () => {
    await onSave(formData);
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        取消
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        leftIcon={<FiSave size={16} />}
        isLoading={isLoading}
        disabled={isLoading}
      >
        保存设置
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" title="👤 编辑个人信息" footer={footer}>
      <ModalContent>
        <Section>
          <SectionTitle>👤 个人信息</SectionTitle>
          <FormGroup>
            <Input
              label="作者名称"
              value={formData.authorName || ''}
              onChange={(e) => handleChange('authorName', e.target.value)}
              placeholder="adnaan"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="职位/称号"
              value={formData.authorTitle || ''}
              onChange={(e) => handleChange('authorTitle', e.target.value)}
              placeholder="Web 全栈开发者 & 设计爱好者"
            />
          </FormGroup>
          <FormGroup>
            <Label>个人简介</Label>
            <Textarea
              value={formData.authorBio || ''}
              onChange={(e) => handleChange('authorBio', e.target.value)}
              placeholder="热衷于探索前沿Web技术..."
              rows={3}
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="MBTI类型"
              value={formData.mbti || ''}
              onChange={(e) => handleChange('mbti', e.target.value)}
              placeholder="INFJ-T"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="所在地"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="大连, 中国"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="职业"
              value={formData.occupation || ''}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="全栈开发者"
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>💼 技能</SectionTitle>
          <FormGroup>
            <Label>技能列表</Label>
            <TagsContainer>
              {(formData.skills || []).map((skill, index) => (
                <Tag key={index}>
                  {skill}
                  <TagRemoveButton type="button" onClick={() => removeSkill(index)}>
                    ×
                  </TagRemoveButton>
                </Tag>
              ))}
            </TagsContainer>
            <AddTagRow>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="添加技能..."
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill}>添加</Button>
            </AddTagRow>
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>🔗 社交链接</SectionTitle>
          <FormGroup>
            <Input
              label="Email"
              value={formData.socialLinks?.email || ''}
              onChange={(e) => handleSocialLinkChange('email', e.target.value)}
              placeholder="example@example.com"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="GitHub"
              value={formData.socialLinks?.github || ''}
              onChange={(e) => handleSocialLinkChange('github', e.target.value)}
              placeholder="https://github.com/username"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="Bilibili"
              value={formData.socialLinks?.bilibili || ''}
              onChange={(e) => handleSocialLinkChange('bilibili', e.target.value)}
              placeholder="https://bilibili.com"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="Twitter"
              value={formData.socialLinks?.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="RSS"
              value={formData.socialLinks?.rss || ''}
              onChange={(e) => handleSocialLinkChange('rss', e.target.value)}
              placeholder="/rss.xml"
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>💭 座右铭</SectionTitle>
          <FormGroup>
            <Label>座右铭内容</Label>
            <Textarea
              value={formData.quote || ''}
              onChange={(e) => handleChange('quote', e.target.value)}
              placeholder="请保持理性，冰冷的数字总是比七彩门的炫法走得更久。"
              rows={2}
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="座右铭作者"
              value={formData.quoteAuthor || ''}
              onChange={(e) => handleChange('quoteAuthor', e.target.value)}
              placeholder="猴哥蔡嵩"
            />
          </FormGroup>
        </Section>
      </ModalContent>
    </Modal>
  );
};
