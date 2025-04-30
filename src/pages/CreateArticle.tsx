import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { FiImage, FiX, FiTag, FiCalendar, FiClock, FiUser, FiArrowLeft, FiSave, FiEye } from 'react-icons/fi';
import { PageContainer } from '../components/blog/BlogComponents';
import TextEditor from '../components/TextEditor';

// 样式组件
const EditorContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: var(--bg-secondary);
  }
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: var(--text-primary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${(props) => (props.primary ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  color: ${(props) => (props.primary ? 'white' : 'var(--text-primary)')};
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.primary ? 'var(--accent-color-hover)' : 'var(--bg-tertiary)')};
  }
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(81, 131, 245, 0.1);
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  border-radius: 20px;
  font-size: 0.85rem;
`;

const TagRemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
`;

const ImageUploadContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  margin-bottom: 1.5rem;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
  }
`;

const UploadPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);

  svg {
    margin-bottom: 1rem;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewSection = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
`;

const PreviewTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const ArticlePreview = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-primary);
`;

// 页面变体
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const CreateArticle: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 标签输入处理
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 处理图片上传
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 删除封面图片
  const removeImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };

  // 保存文章
  const saveArticle = () => {
    if (!title.trim()) {
      alert('请输入文章标题');
      return;
    }

    if (!content.trim()) {
      alert('请输入文章内容');
      return;
    }

    if (!coverImage) {
      alert('请上传封面图片');
      return;
    }

    // 这里可以添加保存文章的逻辑
    alert('文章保存成功！');
    // 保存成功后可以跳转到文章详情页或返回列表页
    navigate('/dashboard');
  };

  // 切换预览
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // 处理内容变化
  const handleContentChange = (html: string) => {
    setContent(html);
  };

  // 自动生成摘要
  useEffect(() => {
    if (content) {
      // 去除HTML标签，获取纯文本内容
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const textContent = tempDiv.textContent || '';

      // 使用前100个字符作为摘要
      const autoExcerpt = textContent.trim().substring(0, 100) + (textContent.length > 100 ? '...' : '');
      setExcerpt(autoExcerpt);
    }
  }, [content]);

  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <EditorContainer>
          <PageHeader>
            <BackButton onClick={goBack}>
              <FiArrowLeft size={16} /> 返回
            </BackButton>
            <PageTitle>创建新文章</PageTitle>
            <ActionButtons>
              <Button onClick={togglePreview}>
                <FiEye size={16} /> {showPreview ? '继续编辑' : '预览'}
              </Button>
              <Button primary onClick={saveArticle}>
                <FiSave size={16} /> 发布文章
              </Button>
            </ActionButtons>
          </PageHeader>

          {!showPreview ? (
            <>
              <FormSection>
                <FormLabel htmlFor="title">文章标题</FormLabel>
                <FormInput
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入文章标题"
                />
              </FormSection>

              <FormSection>
                <FormLabel htmlFor="category">文章分类</FormLabel>
                <FormInput
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="输入文章分类，如：前端开发"
                />
              </FormSection>

              <FormSection>
                <FormLabel htmlFor="tags">文章标签</FormLabel>
                <FormInput
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="输入标签后按回车添加"
                />
                {tags.length > 0 && (
                  <TagContainer>
                    {tags.map((tag, index) => (
                      <Tag key={index}>
                        {tag}
                        <TagRemoveButton onClick={() => removeTag(tag)}>
                          <FiX size={14} />
                        </TagRemoveButton>
                      </Tag>
                    ))}
                  </TagContainer>
                )}
              </FormSection>

              <FormSection>
                <FormLabel htmlFor="cover">文章封面</FormLabel>
                <ImageUploadContainer onClick={handleImageUpload}>
                  {coverImage ? (
                    <>
                      <PreviewImage src={coverImage} alt="文章封面" />
                      <RemoveImageButton
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        <FiX size={18} />
                      </RemoveImageButton>
                    </>
                  ) : (
                    <UploadPlaceholder>
                      <FiImage size={48} />
                      <p>点击上传封面图片</p>
                    </UploadPlaceholder>
                  )}
                  <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
                </ImageUploadContainer>
              </FormSection>

              <FormSection>
                <FormLabel htmlFor="excerpt">文章摘要</FormLabel>
                <FormInput
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="文章摘要会在列表中显示，如不填写将自动根据内容生成"
                />
              </FormSection>

              <FormSection>
                <FormLabel>文章内容</FormLabel>
                <TextEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder="开始写作吧..."
                  minHeight="500px"
                />
              </FormSection>
            </>
          ) : (
            <PreviewSection>
              <PreviewTitle>文章预览</PreviewTitle>

              {/* 文章标题 */}
              <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
                {title || '文章标题'}
              </h1>

              {/* 文章元信息 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiUser size={16} /> 作者名
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiCalendar size={16} /> {new Date().toISOString().split('T')[0]}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiClock size={16} /> {Math.max(1, Math.ceil(content.length / 1000))} 分钟阅读
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiTag size={16} /> {category || '未分类'}
                </span>
              </div>

              {/* 封面图片 */}
              {coverImage && (
                <div
                  style={{
                    marginBottom: '2rem',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <img src={coverImage} alt={title} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                </div>
              )}

              {/* 文章内容 */}
              <ArticlePreview dangerouslySetInnerHTML={{ __html: content }} />

              {/* 文章标签 */}
              {tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                    marginTop: '2rem',
                  }}
                >
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.3rem 0.6rem',
                        background: 'rgba(81, 131, 245, 0.1)',
                        color: 'var(--accent-color)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </PreviewSection>
          )}
        </EditorContainer>
      </motion.div>
    </PageContainer>
  );
};

export default CreateArticle;
