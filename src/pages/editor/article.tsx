import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { FiSave, FiX, FiEye, FiUpload } from 'react-icons/fi';
import ModernEditor from '@/components/common/modern-editor';
import { API } from '@/utils/api';
import { Button, Input } from '@/components/ui';

interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  typeId?: number;
  tagIds?: number[];
  status: number;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

const ArticleEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<number>(0); // 0: 草稿, 1: 已发布
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // 加载文章数据（如果是编辑模式）
  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) return;

      setIsLoading(true);
      try {
        const response = await API.article.getArticleDetail(Number(articleId));
        const article = response.data;

        setTitle(article.title);
        setContent(article.content);
        setSummary(article.summary || '');
        setCoverImage(article.coverImage || '');
        setCategoryId(article.typeId || null);
        setSelectedTagIds(article.tagIds || []);
        setStatus(article.status || 0);
      } catch (error: any) {
        window.UI.toast.error(error.message || '加载文章失败');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [articleId, navigate]);

  // 加载分类和标签
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, tagRes] = await Promise.all([API.category.getCategories(), API.tag.getTags()]);

        const categoriesData: Category[] = Array.isArray(categoryRes.data)
          ? categoryRes.data
          : (categoryRes.data as any)?.data || [];
        const tagsData: Tag[] = Array.isArray(tagRes.data) ? tagRes.data : (tagRes.data as any)?.data || [];

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error: any) {
        console.error('加载分类和标签失败:', error);
      }
    };

    loadData();
  }, []);

  // 保存文章
  const handleSave = async (isDraft: boolean = true) => {
    if (!title.trim()) {
      window.UI.toast.error('请输入文章标题');
      return;
    }

    if (!content.trim()) {
      window.UI.toast.error('请输入文章内容');
      return;
    }

    setIsSaving(true);

    try {
      const articleData = {
        title: title.trim(),
        content,
        summary: summary.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        typeId: categoryId || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        status: isDraft ? 0 : 1,
      };

      if (articleId) {
        await API.article.updateArticle(Number(articleId), articleData);
        window.UI.toast.success('文章更新成功');
      } else {
        await API.article.createArticle(articleData as any);
        window.UI.toast.success('文章创建成功');
      }

      navigate('/profile');
    } catch (error: any) {
      window.UI.toast.error(error.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 切换标签选择
  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <div>加载中...</div>
      </LoadingContainer>
    );
  }

  return (
    <EditorContainer>
      {/* 顶部工具栏 */}
      <TopBar>
        <LeftSection>
          <BackButton onClick={() => navigate('/profile')}>
            <FiX />
            <span>退出</span>
          </BackButton>
          <Title>
            <input
              type="text"
              placeholder="请输入文章标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Title>
        </LeftSection>

        <RightSection>
          <Button variant="outline" size="small" onClick={() => handleSave(true)} disabled={isSaving}>
            <FiSave />
            <span>保存草稿</span>
          </Button>
          <Button variant="primary" size="small" onClick={() => handleSave(false)} disabled={isSaving}>
            <FiUpload />
            <span>发布</span>
          </Button>
        </RightSection>
      </TopBar>

      {/* 主编辑区 */}
      <MainContent>
        {/* 编辑器 */}
        <EditorSection>
          <ModernEditor content={content} onChange={setContent} placeholder="开始编写你的文章..." />
        </EditorSection>

        {/* 右侧边栏 */}
        <Sidebar>
          <SidebarSection>
            <SectionTitle>文章设置</SectionTitle>

            {/* 摘要 */}
            <Field>
              <Label>摘要</Label>
              <textarea
                placeholder="请输入文章摘要..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </Field>

            {/* 封面图 */}
            <Field>
              <Label>封面图</Label>
              <Input
                placeholder="请输入封面图地址..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              {coverImage && (
                <CoverPreview>
                  <img src={coverImage} alt="封面预览" />
                </CoverPreview>
              )}
            </Field>

            {/* 分类 */}
            <Field>
              <Label>分类</Label>
              <select value={categoryId || ''} onChange={(e) => setCategoryId(Number(e.target.value) || null)}>
                <option value="">请选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* 标签 */}
            <Field>
              <Label>标签</Label>
              <TagsList>
                {tags.map((tag) => (
                  <TagItem key={tag.id} selected={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)}>
                    {tag.name}
                  </TagItem>
                ))}
              </TagsList>
            </Field>
          </SidebarSection>
        </Sidebar>
      </MainContent>
    </EditorContainer>
  );
};

// 样式组件
const EditorContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: var(--text-primary);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  gap: 16px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: var(--bg-secondary);
  }

  svg {
    font-size: 18px;
  }
`;

const Title = styled.div`
  flex: 1;
  min-width: 0;

  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
      background: var(--bg-secondary);
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      background: var(--bg-primary);
    }

    &::placeholder {
      color: var(--text-secondary);
      font-weight: normal;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const EditorSection = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
`;

const Sidebar = styled.div`
  width: 320px;
  border-left: 1px solid var(--border-color);
  background: var(--bg-secondary);
  overflow-y: auto;
  padding: 24px;

  @media (max-width: 1024px) {
    width: 280px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  textarea,
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
    font-family: inherit;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }

  select {
    cursor: pointer;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const CoverPreview = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

interface TagItemProps {
  selected: boolean;
}

const TagItem = styled.div<TagItemProps>`
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? 'var(--primary-color)' : 'var(--bg-primary)')};
  color: ${(props) => (props.selected ? '#fff' : 'var(--text-primary)')};
  border-color: ${(props) => (props.selected ? 'var(--primary-color)' : 'var(--border-color)')};

  &:hover {
    border-color: var(--primary-color);
  }
`;

export default ArticleEditorPage;
