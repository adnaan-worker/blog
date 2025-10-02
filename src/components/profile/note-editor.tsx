import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {
  FiSave,
  FiEye,
  FiEyeOff,
  FiHash,
  FiMapPin,
  FiCloud,
  FiHeart,
  FiPlus,
  FiMinus,
  FiMonitor,
} from 'react-icons/fi';
import { Button, Input } from '@/components/ui';
import { Modal } from '@/ui/modal';
import TextEditor from '@/components/common/text-editor';
import AITaskMonitor from '@/components/common/ai-task-monitor';
import { toast } from '@/ui';
import { API, Note, CreateNoteParams, UpdateNoteParams } from '@/utils/api';
import { RichTextParser } from '@/utils/rich-text-parser';
import RichTextStats from '@/components/common/rich-text-stats';

// 样式组件
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
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid var(--accent-color);
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const StatsDisplay = styled.div`
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const PrivacyToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-color);
  }

  span {
    font-size: 0.9rem;
  }
`;

// 组件Props
interface NoteEditorProps {
  isOpen: boolean;
  note?: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
}

interface FormData {
  title: string;
  content: string;
  mood: string;
  weather: string;
  location: string;
  tags: string[];
  isPrivate: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, note, onClose, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    mood: '',
    weather: '',
    location: '',
    tags: [],
    isPrivate: false,
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskMonitor, setShowTaskMonitor] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content,
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

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  // 保存手记
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入手记标题');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('请输入手记内容');
      return;
    }

    setIsLoading(true);

    try {
      const noteData: CreateNoteParams | UpdateNoteParams = {
        title: formData.title.trim(),
        content: formData.content,
        mood: formData.mood || undefined,
        weather: formData.weather || undefined,
        location: formData.location || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isPrivate: formData.isPrivate,
      };

      let savedNote: Note;
      if (note) {
        // 更新现有手记
        const response = await API.note.updateNote(note.id, noteData as UpdateNoteParams);
        savedNote = response.data;
        toast.success('手记更新成功');
      } else {
        // 创建新手记
        const response = await API.note.createNote(noteData as CreateNoteParams);
        savedNote = response.data;
        toast.success('手记创建成功');
      }

      onSave(savedNote);
      onClose();
    } catch (error: any) {
      toast.error(error.message || (note ? '更新失败' : '创建失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理AI任务完成
  const handleAITaskComplete = (taskId: string, result: string) => {
    setFormData((prev) => ({ ...prev, content: result }));
    toast.success('AI任务完成');
  };

  // Modal底部按钮
  const footerButtons = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="outline" onClick={() => setShowTaskMonitor(true)} title="AI任务监控" disabled={isLoading}>
          <FiMonitor size={14} />
          <span style={{ marginLeft: '0.5rem' }}>任务监控</span>
        </Button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          取消
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isLoading || !formData.title.trim()}>
          <FiSave size={14} />
          <span style={{ marginLeft: '0.5rem' }}>{note ? '更新' : '保存'}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? '编辑手记' : '创建手记'}
      size="large"
      closeOnOverlayClick={false}
      footer={footerButtons}
    >
      <FormGroup>
        <Label>标题 *</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="给你的手记取个标题..."
          maxLength={100}
        />
      </FormGroup>

      <FormGroup>
        <Label>内容 *</Label>
        <TextEditor
          content={formData.content}
          onChange={(content) => handleInputChange('content', content)}
          placeholder="记录下你的想法..."
          showPreview={true}
          showStats={false}
        />
      </FormGroup>

      <MetaRow>
        <FormGroup>
          <Label>心情</Label>
          <Input
            value={formData.mood}
            onChange={(e) => handleInputChange('mood', e.target.value)}
            placeholder="今天的心情..."
            maxLength={20}
          />
        </FormGroup>

        <FormGroup>
          <Label>天气</Label>
          <Input
            value={formData.weather}
            onChange={(e) => handleInputChange('weather', e.target.value)}
            placeholder="今天的天气..."
            maxLength={20}
          />
        </FormGroup>
      </MetaRow>

      <FormGroup>
        <Label>地点</Label>
        <Input
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="在哪里写下这篇手记..."
          maxLength={50}
        />
      </FormGroup>

      <FormGroup>
        <Label>标签</Label>
        <TagInput>
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加标签..."
            maxLength={20}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button variant="secondary" onClick={handleAddTag} disabled={!newTag.trim()}>
            <FiPlus size={14} />
          </Button>
        </TagInput>
        {formData.tags.length > 0 && (
          <TagsContainer>
            {formData.tags.map((tag) => (
              <Tag key={tag}>
                <FiHash size={10} />
                {tag}
                <TagRemove onClick={() => handleRemoveTag(tag)}>
                  <FiMinus size={10} />
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

      {formData.content && (
        <FormGroup>
          <Label>内容统计</Label>
          <StatsDisplay>
            <RichTextStats content={formData.content} showDetailed={false} />
          </StatsDisplay>
        </FormGroup>
      )}

      {/* AI任务监控 */}
      <AITaskMonitor tasks={[]} isVisible={showTaskMonitor} onTaskComplete={handleAITaskComplete} />
    </Modal>
  );
};

export default NoteEditor;
