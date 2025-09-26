import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiEye, FiEyeOff, FiHash, FiMapPin, FiCloud, FiHeart, FiPlus, FiMinus } from 'react-icons/fi';
import { Button, Input } from '@/components/ui';
import TextEditor from '@/components/common/text-editor';
import { toast } from '@/ui';
import { API, Note, CreateNoteParams, UpdateNoteParams, NoteMetadata } from '@/utils/api';
import { RichTextParser } from '@/utils/rich-text-parser';
import RichTextStats from '@/components/common/rich-text-stats';

// 样式组件
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SelectGroup = styled.div`
  position: relative;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }

  option {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  background: rgba(var(--accent-color-rgb), 0.1);
  color: var(--accent-color);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 0.7rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const PrivacyToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
  }
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// 组件接口
interface NoteEditorProps {
  isOpen: boolean;
  note?: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, note, onClose, onSave }) => {
  const [formData, setFormData] = useState<CreateNoteParams | UpdateNoteParams>({
    title: '',
    content: '',
    mood: '',
    weather: '',
    location: '',
    tags: [],
    isPrivate: false,
  });
  const [metadata, setMetadata] = useState<NoteMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  // 加载元数据
  useEffect(() => {
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // 初始化表单数据
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        mood: note.mood || '',
        weather: note.weather || '',
        location: note.location || '',
        tags: note.tags || [],
        isPrivate: note.isPrivate || false,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        mood: '',
        weather: '',
        location: '',
        tags: [],
        isPrivate: false,
      });
    }
  }, [note]);

  const loadMetadata = async () => {
    try {
      const response = await API.note.getMetadata();
      setMetadata(response.data);
    } catch (error: any) {
      console.error('加载元数据失败:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter((tag) => tag !== tagToRemove) || []);
  };

  const handleSave = async () => {
    if (!formData.content?.trim()) {
      toast.error('请填写手记内容');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (note) {
        response = await API.note.updateNote(note.id, formData as UpdateNoteParams);
      } else {
        response = await API.note.createNote(formData as CreateNoteParams);
      }

      toast.success(note ? '手记更新成功' : '手记创建成功');
      onSave(response.data);
      onClose();
    } catch (error: any) {
      toast.error(error.message || (note ? '更新失败' : '创建失败'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{note ? '编辑手记' : '创建手记'}</Title>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Content>
          <FormGroup>
            <Label>标题（可选）</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="为你的手记起个标题..."
              maxLength={200}
            />
          </FormGroup>

          <FormGroup>
            <Label>内容 *</Label>
            <TextEditor
              content={formData.content}
              onChange={(html) => handleInputChange('content', html)}
              placeholder="写下你的想法、感受或经历..."
              minHeight="200px"
              mode="simple"
              showPreview={true}
              showStats={true}
            />
          </FormGroup>

          <MetaRow>
            <FormGroup>
              <Label>
                <FiHeart size={14} style={{ marginRight: '0.3rem' }} />
                心情
              </Label>
              <SelectGroup>
                <Select value={formData.mood} onChange={(e) => handleInputChange('mood', e.target.value)}>
                  <option value="">选择心情</option>
                  {metadata?.moodOptions.map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </Select>
              </SelectGroup>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiCloud size={14} style={{ marginRight: '0.3rem' }} />
                天气
              </Label>
              <Input
                value={formData.weather}
                onChange={(e) => handleInputChange('weather', e.target.value)}
                placeholder="晴天、多云、下雨..."
                maxLength={20}
                list="weather-suggestions"
              />
              <datalist id="weather-suggestions">
                {metadata?.commonWeathers.map((weather) => (
                  <option key={weather} value={weather} />
                ))}
              </datalist>
            </FormGroup>
          </MetaRow>

          <FormGroup>
            <Label>
              <FiMapPin size={14} style={{ marginRight: '0.3rem' }} />
              地点
            </Label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="记录这个时刻的地点..."
              maxLength={100}
              list="location-suggestions"
            />
            <datalist id="location-suggestions">
              {metadata?.commonLocations.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiHash size={14} style={{ marginRight: '0.3rem' }} />
              标签
            </Label>
            <TagInput>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签..."
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                list="tag-suggestions"
              />
              <Button variant="secondary" size="small" onClick={handleAddTag} disabled={!newTag.trim()}>
                <FiPlus size={14} />
              </Button>
            </TagInput>
            <datalist id="tag-suggestions">
              {metadata?.commonTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            {formData.tags && formData.tags.length > 0 && (
              <TagsContainer>
                {formData.tags.map((tag) => (
                  <Tag key={tag}>
                    #{tag}
                    <TagRemove onClick={() => handleRemoveTag(tag)}>
                      <FiMinus size={12} />
                    </TagRemove>
                  </Tag>
                ))}
              </TagsContainer>
            )}
          </FormGroup>

          <FormGroup>
            <Label>隐私设置</Label>
            <PrivacyToggle onClick={() => handleInputChange('isPrivate', !formData.isPrivate)}>
              {formData.isPrivate ? <FiEyeOff /> : <FiEye />}
              <span>{formData.isPrivate ? '私密手记（仅自己可见）' : '公开手记（他人可见）'}</span>
            </PrivacyToggle>
          </FormGroup>
        </Content>

        <Footer>
          <FooterRight>
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
              <FiSave size={14} />
              {note ? '更新' : '保存'}
            </Button>
          </FooterRight>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default NoteEditor;
