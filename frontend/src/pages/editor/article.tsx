import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiEye, FiUpload, FiCpu, FiChevronLeft, FiChevronRight, FiSettings, FiZap } from 'react-icons/fi';
import RichTextEditor from '@/components/rich-text/rich-text-editor';
import { AIFloatingTask } from '@/components/ai-floating-task';
import { useAITasks } from '@/hooks/useAITasks';
import { API } from '@/utils/api';
import { Button, Input, Textarea, Select } from 'adnaan-ui';
import { SEO } from '@/components/common';
import { PAGE_SEO_CONFIG } from '@/config/seo.config';
import { useAnimationEngine } from '@/utils/ui/animation';
import { useSocket } from '@/hooks/useSocket';

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
  const { variants, level } = useAnimationEngine();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 初始化 Socket 连接（用于 AI 助手）
  useSocket();
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // AI 任务管理
  const { tasks, createTask, deleteTask, clearCompleted } = useAITasks();
  const [originalData, setOriginalData] = useState({
    title: '',
    content: '',
    summary: '',
    coverImage: '',
    categoryId: null as number | null,
    selectedTagIds: [] as number[],
  });

  // 监听内容变化
  useEffect(() => {
    const hasChanges =
      title !== originalData.title ||
      content !== originalData.content ||
      summary !== originalData.summary ||
      coverImage !== originalData.coverImage ||
      categoryId !== originalData.categoryId ||
      JSON.stringify(selectedTagIds) !== JSON.stringify(originalData.selectedTagIds);

    setHasUnsavedChanges(hasChanges);
  }, [title, content, summary, coverImage, categoryId, selectedTagIds, originalData]);

  // 阻止页面关闭提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 加载文章数据（如果是编辑模式）
  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) return;

      setIsLoading(true);
      try {
        const response = await API.article.getArticleDetail(Number(articleId));
        const article = response.data;

        // 从tags数组中提取tagIds
        const tagIds = Array.isArray(article.tags) ? article.tags.map((tag: any) => tag.id) : [];

        const loadedData = {
          title: article.title,
          content: article.content,
          summary: article.summary || '',
          coverImage: article.coverImage || '',
          categoryId: article.typeId || null,
          selectedTagIds: tagIds,
        };

        setTitle(loadedData.title);
        setContent(loadedData.content);
        setSummary(loadedData.summary);
        setCoverImage(loadedData.coverImage);
        setCategoryId(loadedData.categoryId);
        setSelectedTagIds(loadedData.selectedTagIds);
        setStatus(article.status || 0);
        setOriginalData(loadedData);
      } catch (error: any) {
        adnaan.toast.error(error.message || '加载文章失败');
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

  // 检查富文本内容是否为空
  const isContentEmpty = (htmlContent: string): boolean => {
    // 移除所有HTML标签
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    // 移除所有空白字符和&nbsp;
    const cleanContent = textContent.replace(/&nbsp;/g, '').replace(/\s/g, '');
    return cleanContent.length === 0;
  };

  // 保存文章
  const handleSave = async (isDraft: boolean = true) => {
    // 校验标题
    if (!title.trim()) {
      adnaan.toast.error('请输入文章标题');
      return;
    }

    // 校验内容（判断富文本是否为空）
    if (!content || isContentEmpty(content)) {
      adnaan.toast.error('请输入文章内容');
      return;
    }

    // 校验分类（必填项，草稿和发布都需要）
    if (!categoryId) {
      adnaan.toast.error('请选择文章分类');
      return;
    }

    // 发布时的额外校验
    if (!isDraft) {
      // 校验标签（发布时建议至少选择一个）
      if (selectedTagIds.length === 0) {
        const confirmed = await adnaan.confirm.confirm(
          '未选择标签',
          '发布文章建议至少选择一个标签，这有助于读者找到你的文章。确定要继续发布吗？',
          '继续发布',
          '取消',
        );
        if (!confirmed) return;
      }

      // 校验摘要（发布时建议填写）
      if (!summary.trim()) {
        const confirmed = await adnaan.confirm.confirm(
          '未填写摘要',
          '发布文章建议填写摘要，这有助于读者快速了解文章内容。确定要继续发布吗？',
          '继续发布',
          '取消',
        );
        if (!confirmed) return;
      }
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
        adnaan.toast.success('文章更新成功！', '保存成功', 3000);
      } else {
        await API.article.createArticle(articleData as any);
        adnaan.toast.success('文章创建成功！', '保存成功', 3000);
      }

      // 重置未保存状态
      setHasUnsavedChanges(false);
      setOriginalData({
        title: title.trim(),
        content,
        summary: summary.trim(),
        coverImage: coverImage.trim(),
        categoryId,
        selectedTagIds,
      });

      // 保存成功后，延迟返回，让用户看到成功提示
      setTimeout(() => {
        // 返回上一页或个人中心
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/profile');
        }
      }, 2000); // 给用户2秒时间看到成功提示
    } catch (error: any) {
      adnaan.toast.error(error.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 切换标签选择
  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  // 处理退出
  const handleExit = async () => {
    if (hasUnsavedChanges) {
      const confirmed = await adnaan.confirm.confirm('确认退出', '您有未保存的修改，确定要退出吗？', '退出', '取消');
      if (!confirmed) return;
    }

    navigate(-1);
  };

  // 生成标题
  const handleGenerateTitle = async () => {
    if (!content) {
      adnaan.toast.error('请先输入文章内容');
      return;
    }

    try {
      await createTask('generate_title', { content });
      adnaan.toast.success('标题生成任务已创建');
    } catch (error: any) {
      adnaan.toast.error(error.message || '创建任务失败');
    }
  };

  // 生成摘要
  const handleGenerateSummary = async () => {
    if (!content) {
      adnaan.toast.error('请先输入文章内容');
      return;
    }

    try {
      await createTask('generate_summary', { content });
      adnaan.toast.success('摘要生成任务已创建');
    } catch (error: any) {
      adnaan.toast.error(error.message || '创建任务失败');
    }
  };

  // 应用AI生成结果（直接应用，不弹窗）
  const handleApplyResult = (taskId: string, result: any) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.type === 'generate_title' && result?.titles?.[0]) {
      setTitle(result.titles[0]);
      deleteTask(taskId);
      adnaan.toast.success('标题已应用');
    } else if (task.type === 'generate_summary' && result?.summary) {
      setSummary(result.summary);
      deleteTask(taskId);
      adnaan.toast.success('摘要已应用');
    }
  };

  // 加载状态由路由级别的Suspense处理，不需要额外显示
  return (
    <>
      <SEO
        title={articleId ? '编辑文章' : PAGE_SEO_CONFIG.articleEditor.title}
        description={PAGE_SEO_CONFIG.articleEditor.description}
        keywords={PAGE_SEO_CONFIG.articleEditor.keywords}
        type="website"
        index={false}
        follow={false}
      />
      <EditorContainer initial="hidden" animate="visible" variants={variants.fadeIn}>
        {/* 顶部工具栏 */}
        <TopBar>
          <LeftSection>
            <Button variant="outline" size="small" onClick={handleExit} leftIcon={<FiX />}>
              退出
            </Button>
            <Title>
              <TitleInputWrapper>
                <TitleInput
                  type="text"
                  placeholder="请输入文章标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <AIGenerateButton onClick={handleGenerateTitle} disabled={!content} title="AI 生成标题">
                  <FiZap />
                </AIGenerateButton>
              </TitleInputWrapper>
            </Title>
          </LeftSection>

          <RightSection>
            <Button
              variant={showSidebar ? 'primary' : 'outline'}
              size="small"
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? '隐藏设置面板' : '显示设置面板'}
            >
              <FiSettings />
              <span>设置</span>
            </Button>
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
            <RichTextEditor content={content} onChange={setContent} placeholder="开始编写你的文章..." />
          </EditorSection>

          {/* 右侧边栏 - 可折叠 */}
          {showSidebar && (
            <Sidebar>
              <SidebarSection>
                <SectionTitle>文章设置</SectionTitle>

                {/* 摘要 */}
                <Field>
                  <LabelWithButton>
                    <Label>
                      摘要
                      <OptionalTag>（建议填写）</OptionalTag>
                    </Label>
                    <AIGenerateButton onClick={handleGenerateSummary} disabled={!content} title="AI 生成摘要">
                      <FiZap />
                    </AIGenerateButton>
                  </LabelWithButton>
                  <Textarea
                    placeholder="请输入文章摘要，帮助读者快速了解文章内容..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    size="small"
                    rows={3}
                  />
                </Field>

                {/* 封面图 */}
                <Field>
                  <Label>
                    封面图
                    <OptionalTag>（选填）</OptionalTag>
                  </Label>
                  <Input
                    placeholder="请输入封面图地址..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                  {coverImage && coverImage.trim() && (
                    <CoverPreview>
                      <img src={coverImage} alt="封面预览" />
                    </CoverPreview>
                  )}
                </Field>

                {/* 分类 */}
                <Field>
                  <Label>
                    分类
                    <RequiredTag>*</RequiredTag>
                  </Label>
                  <Select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(Number(e.target.value) || null)}
                    error={!categoryId}
                  >
                    <option value="">请选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                  {!categoryId && <FieldHint className="error">必须选择文章分类</FieldHint>}
                </Field>

                {/* 标签 */}
                <Field>
                  <Label>
                    标签
                    <OptionalTag>（建议至少选择1个）</OptionalTag>
                  </Label>
                  <TagsList>
                    {tags.map((tag) => (
                      <TagItem
                        key={tag.id}
                        selected={selectedTagIds.includes(tag.id)}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </TagItem>
                    ))}
                  </TagsList>
                  {selectedTagIds.length === 0 && <FieldHint>标签有助于读者找到你的文章</FieldHint>}
                </Field>
              </SidebarSection>
            </Sidebar>
          )}
        </MainContent>

        {/* AI 悬浮任务条 */}
        <AIFloatingTask tasks={tasks} onApply={handleApplyResult} onClose={deleteTask} onCloseAll={clearCompleted} />
      </EditorContainer>
    </>
  );
};

// 样式组件
const EditorContainer = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  gap: 16px;

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-wrap: wrap;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  flex: 1;
  min-width: 0;
`;

// 标题输入框包装器
const TitleInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 2px solid var(--border-color);
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--accent-color);
  }
`;

// 标题输入框
const TitleInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 18px;
  font-weight: 600;
  padding: 8px 0;
  color: var(--text-primary);
  min-width: 0;

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

// AI 生成按钮
const AIGenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    color: var(--accent-color);
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 8px;

    /* 在小屏幕上隐藏按钮文字，只显示图标 */
    button span {
      display: none;
    }

    button {
      min-width: auto;
      padding: 8px 12px;
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const EditorSection = styled.div`
  flex: 1;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  overflow: hidden; /* 避免创建新的滚动上下文 */
`;

const AIAssistantPanel = styled.div`
  width: 320px;
  border-left: 1px solid var(--border-color);
  background: var(--bg-secondary);
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 1280px) {
    width: 280px;
  }

  @media (max-width: 1024px) {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 360px;
    z-index: 1000;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    border-left: 1px solid var(--border-color);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100vw;
  }
`;

const Sidebar = styled.div`
  width: 320px;
  border-left: 1px solid var(--border-color);
  background: var(--bg-secondary);
  overflow-y: auto;
  padding: 24px;
  flex-shrink: 0;
  animation: slideInRight 0.2s ease-out;

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 1280px) {
    width: 280px;
    padding: 20px;
  }

  @media (max-width: 1024px) {
    width: 100%;
    max-height: 40vh;
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding: 16px;
    animation: slideInBottom 0.2s ease-out;

    @keyframes slideInBottom {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  @media (max-width: 768px) {
    max-height: 50vh;
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
  margin-bottom: 8px;
  display: block;
`;

// Label 和按钮的容器
const LabelWithButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

// 必填标记
const RequiredTag = styled.span`
  color: var(--error-color, #f56c6c);
  font-size: 14px;
  font-weight: 600;
  margin-left: 2px;
`;

// 可选标记
const OptionalTag = styled.span`
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
`;

// 字段提示
const FieldHint = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
  line-height: 1.5;

  /* 如果是错误提示，使用红色 */
  &.error {
    color: var(--error-color, #f56c6c);
  }
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
  background: ${(props) => (props.selected ? 'rgba(var(--accent-rgb, 81, 131, 245), 0.12)' : 'var(--bg-primary)')};
  color: ${(props) => (props.selected ? 'var(--accent-color)' : 'var(--text-primary)')};
  border-color: ${(props) => (props.selected ? 'var(--accent-color)' : 'var(--border-color)')};
  font-weight: ${(props) => (props.selected ? '600' : '400')};

  &:hover {
    border-color: var(--accent-color);
    background: ${(props) =>
      props.selected ? 'rgba(var(--accent-rgb, 81, 131, 245), 0.15)' : 'rgba(var(--accent-rgb, 81, 131, 245), 0.06)'};
  }
`;

export default ArticleEditorPage;
