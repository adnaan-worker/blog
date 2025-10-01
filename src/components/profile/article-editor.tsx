import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiSave, FiImage, FiHash, FiTag, FiPlus, FiMinus, FiFolder } from 'react-icons/fi';
import { Button, Input } from '@/components/ui';
import { Modal } from '@/ui/modal';
import TextEditor from '@/components/common/text-editor';
import { toast } from '@/ui';
import { API, Article, Category } from '@/utils/api';
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

  .required {
    color: var(--error-color);
    margin-left: 0.25rem;
  }
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
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

const StatusToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const StatusButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-primary)')};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'rgba(var(--accent-color-rgb), 0.1)')};
  }
`;

// 组件Props
interface ArticleEditorProps {
  isOpen: boolean;
  article?: Article | null;
  onClose: () => void;
  onSave: (article: Article) => void;
}

interface FormData {
  title: string;
  content: string;
  summary: string;
  cover: string;
  categoryId: number | null;
  tags: string[];
  status: 'draft' | 'published';
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ isOpen, article, onClose, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    summary: '',
    cover: '',
    categoryId: null,
    tags: [],
    status: 'draft',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // 加载分类和标签列表
  useEffect(() => {
    const loadCategoriesAndTags = async () => {
      try {
        // 加载分类
        const categoryResponse = await API.category.getCategories();
        const categoriesData: Category[] = Array.isArray(categoryResponse.data) 
          ? categoryResponse.data 
          : ((categoryResponse.data as any)?.data || []);
        setCategories(categoriesData);

        // 加载标签
        const tagResponse = await API.tag.getTags();
        const tagsData = Array.isArray(tagResponse.data)
          ? tagResponse.data
          : ((tagResponse.data as any)?.data || []);
        setAvailableTags(tagsData);
      } catch (error: any) {
        console.error('加载分类和标签失败:', error);
        setCategories([]);
        setAvailableTags([]);
      }
    };
    loadCategoriesAndTags();
  }, []);

  // 初始化表单数据
  useEffect(() => {
    if (article) {
      // 处理状态：数字 1=已发布, 0=草稿
      const status = article.status === 1 ? 'published' : 'draft';
      
      // 处理标签 - 提取标签ID
      let tagIds: number[] = [];
      let tagNames: string[] = [];
      if (Array.isArray(article.tags)) {
        article.tags.forEach((tag: any) => {
          if (typeof tag === 'object' && tag.id) {
            tagIds.push(tag.id);
            tagNames.push(tag.name || '');
          }
        });
      }

      setSelectedTagIds(tagIds);
      setFormData({
        title: article.title || '',
        content: article.content || '',
        summary: article.summary || '',
        cover: article.coverImage || '',
        categoryId: article.typeId || null,
        tags: tagNames,
        status: status,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        summary: '',
        cover: '',
        categoryId: null,
        tags: [],
        status: 'draft',
      });
    }
  }, [article]);

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 切换标签选择
  const handleToggleTag = (tagId: number, tagName: string) => {
    if (selectedTagIds.includes(tagId)) {
      // 取消选择
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
      handleInputChange('tags', formData.tags.filter(name => name !== tagName));
    } else {
      // 添加选择
      setSelectedTagIds([...selectedTagIds, tagId]);
      handleInputChange('tags', [...formData.tags, tagName]);
    }
  };

  // 创建新分类
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    try {
      const response = await API.category.createCategory({
        name: newCategoryName.trim(),
      });
      const newCategory = response.data;
      setCategories([...categories, newCategory]);
      handleInputChange('categoryId', newCategory.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      toast.success('分类创建成功');
    } catch (error: any) {
      toast.error(error.message || '创建分类失败');
    }
  };

  // 创建新标签
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('请输入标签名称');
      return;
    }

    try {
      const response = await API.tag.createTag({
        name: newTagName.trim(),
      });
      const newTag = response.data;
      setAvailableTags([...availableTags, newTag]);
      // 自动选中新创建的标签
      setSelectedTagIds([...selectedTagIds, newTag.id]);
      handleInputChange('tags', [...formData.tags, newTag.name]);
      setNewTagName('');
      setShowNewTagInput(false);
      toast.success('标签创建成功');
    } catch (error: any) {
      toast.error(error.message || '创建标签失败');
    }
  };

  // 保存文章
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入文章标题');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('请输入文章内容');
      return;
    }

    setIsLoading(true);

    try {
      const articleData: any = {
        title: formData.title.trim(),
        content: formData.content,
        summary: formData.summary.trim() || undefined,
        coverImage: formData.cover.trim() || undefined,
        typeId: formData.categoryId || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined, // 使用标签ID数组
        status: formData.status === 'published' ? 1 : 0, // 转换为数字
      };

      let savedArticle: Article;
      if (article) {
        // 更新现有文章
        const response = await API.article.updateArticle(article.id, articleData);
        savedArticle = response.data;
        toast.success('文章更新成功');
      } else {
        // 创建新文章
        const response = await API.article.createArticle(articleData as Omit<Article, 'id'>);
        savedArticle = response.data;
        toast.success('文章创建成功');
      }

      onSave(savedArticle);
      onClose();
    } catch (error: any) {
      toast.error(error.message || (article ? '更新失败' : '创建失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // Modal底部按钮
  const footerButtons = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        取消
      </Button>
      <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
        <FiSave size={14} />
        <span style={{ marginLeft: '0.5rem' }}>{article ? '更新' : '发布'}</span>
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={article ? '编辑文章' : '创建文章'}
      size="large"
      closeOnOverlayClick={false}
      footer={footerButtons}
    >
      <FormGroup>
        <Label>
          标题 <span className="required">*</span>
        </Label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="输入文章标题..."
          maxLength={200}
        />
      </FormGroup>

      <FormGroup>
        <Label>
          内容 <span className="required">*</span>
        </Label>
        <TextEditor
          content={formData.content}
          onChange={(content) => handleInputChange('content', content)}
          placeholder="开始编写你的文章..."
          showPreview={true}
          showStats={false}
        />
      </FormGroup>

      <FormGroup>
        <Label>摘要</Label>
        <TextArea
          value={formData.summary}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          placeholder="输入文章摘要（选填）..."
          maxLength={500}
        />
      </FormGroup>

      <MetaRow>
        <FormGroup>
          <Label>封面图</Label>
          <Input
            value={formData.cover}
            onChange={(e) => handleInputChange('cover', e.target.value)}
            placeholder="输入封面图URL..."
            type="url"
          />
        </FormGroup>

        <FormGroup>
          <Label>分类</Label>
          {!showNewCategoryInput ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Select
                value={formData.categoryId || ''}
                onChange={(e) => handleInputChange('categoryId', e.target.value ? Number(e.target.value) : null)}
                style={{ flex: 1 }}
              >
                <option value="">选择分类...</option>
                {categories && Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Button variant="secondary" onClick={() => setShowNewCategoryInput(true)}>
                <FiPlus size={14} />
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入新分类名称..."
                maxLength={50}
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
              <Button variant="primary" onClick={handleCreateCategory}>
                <FiSave size={14} />
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName('');
              }}>
                取消
              </Button>
            </div>
          )}
        </FormGroup>
      </MetaRow>

      <FormGroup>
        <Label>标签</Label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            {formData.tags.length > 0 ? `已选择: ${formData.tags.join(', ')}` : '点击选择标签'}
          </span>
          <Button 
            variant="secondary" 
            onClick={() => setShowNewTagInput(!showNewTagInput)}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          >
            <FiPlus size={12} />
            <span style={{ marginLeft: '0.3rem' }}>新建标签</span>
          </Button>
        </div>
        
        {showNewTagInput && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="输入新标签名称..."
              maxLength={50}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
            <Button variant="primary" onClick={handleCreateTag}>
              <FiSave size={14} />
            </Button>
            <Button variant="secondary" onClick={() => {
              setShowNewTagInput(false);
              setNewTagName('');
            }}>
              取消
            </Button>
          </div>
        )}

        <TagsContainer>
          {availableTags.map((tag) => (
            <Tag
              key={tag.id}
              style={{
                cursor: 'pointer',
                opacity: selectedTagIds.includes(tag.id) ? 1 : 0.5,
                background: selectedTagIds.includes(tag.id) 
                  ? 'var(--accent-color)' 
                  : 'var(--accent-color-alpha)',
                color: selectedTagIds.includes(tag.id) ? 'white' : 'var(--accent-color)',
              }}
              onClick={() => handleToggleTag(tag.id, tag.name)}
            >
              <FiHash size={10} />
              {tag.name}
              {selectedTagIds.includes(tag.id) && (
                <span style={{ marginLeft: '0.3rem' }}>✓</span>
              )}
            </Tag>
          ))}
        </TagsContainer>
      </FormGroup>

      <FormGroup>
        <Label>发布状态</Label>
        <StatusToggle>
          <StatusButton active={formData.status === 'draft'} onClick={() => handleInputChange('status', 'draft')}>
            草稿
          </StatusButton>
          <StatusButton
            active={formData.status === 'published'}
            onClick={() => handleInputChange('status', 'published')}
          >
            发布
          </StatusButton>
        </StatusToggle>
      </FormGroup>

      {formData.content && (
        <FormGroup>
          <Label>内容统计</Label>
          <StatsDisplay>
            <RichTextStats content={formData.content} showDetailed={false} />
          </StatsDisplay>
        </FormGroup>
      )}
    </Modal>
  );
};

export default ArticleEditor; 