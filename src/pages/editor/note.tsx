import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import {
  FiSave,
  FiX,
  FiLock,
  FiUnlock,
  FiMapPin,
  FiCloud,
  FiSmile,
  FiTag,
  FiX as FiClose,
  FiCpu,
  FiSettings,
} from 'react-icons/fi';
import ModernEditor from '@/components/common/modern-editor';
import EditorAIAssistant from '@/components/common/editor-ai-assistant';
import { API } from '@/utils/api';
import { Button, Input } from 'adnaan-ui';
import PageLoading from '@/components/common/page-loading';

interface Note {
  id: number;
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
  isPrivate: boolean;
}

const NoteEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState({
    title: '',
    content: '',
    mood: '',
    weather: '',
    location: '',
    tags: [] as string[],
    isPrivate: false,
  });

  // 监听内容变化
  useEffect(() => {
    const hasChanges =
      title !== originalData.title ||
      content !== originalData.content ||
      mood !== originalData.mood ||
      weather !== originalData.weather ||
      location !== originalData.location ||
      JSON.stringify(tags) !== JSON.stringify(originalData.tags) ||
      isPrivate !== originalData.isPrivate;

    setHasUnsavedChanges(hasChanges);
  }, [title, content, mood, weather, location, tags, isPrivate, originalData]);

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

  // 加载手记数据（如果是编辑模式）
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) return;

      setIsLoading(true);
      try {
        const response = await API.note.getNoteDetail(Number(noteId));
        const note = response.data;

        const loadedData = {
          title: note.title || '',
          content: note.content,
          mood: note.mood || '',
          weather: note.weather || '',
          location: note.location || '',
          tags: note.tags || [],
          isPrivate: note.isPrivate || false,
        };

        setTitle(loadedData.title);
        setContent(loadedData.content);
        setMood(loadedData.mood);
        setWeather(loadedData.weather);
        setLocation(loadedData.location);
        setTags(loadedData.tags);
        setIsPrivate(loadedData.isPrivate);
        setOriginalData(loadedData);
      } catch (error: any) {
        adnaan.toast.error(error.message || '加载手记失败');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [noteId, navigate]);

  // 保存手记
  const handleSave = async () => {
    if (!title.trim()) {
      adnaan.toast.error('请输入手记标题');
      return;
    }

    if (!content.trim()) {
      adnaan.toast.error('请输入手记内容');
      return;
    }

    setIsSaving(true);

    try {
      const noteData = {
        title: title.trim(),
        content,
        mood: mood.trim() || undefined,
        weather: weather.trim() || undefined,
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isPrivate,
      };

      if (noteId) {
        await API.note.updateNote(Number(noteId), noteData);
        adnaan.toast.success('手记更新成功！', '保存成功', 3000);
      } else {
        await API.note.createNote(noteData);
        adnaan.toast.success('手记创建成功！', '保存成功', 3000);
      }

      // 重置未保存状态
      setHasUnsavedChanges(false);
      setOriginalData({
        title: title.trim(),
        content,
        mood: mood.trim(),
        weather: weather.trim(),
        location: location.trim(),
        tags,
        isPrivate,
      });

      // 保存成功后，延迟关闭，让用户看到成功提示
      setTimeout(() => {
        try {
          window.close();
        } catch (error) {
          // 如果无法关闭窗口，则返回上一页
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigate('/profile');
          }
        }
      }, 3500); // 给用户3.5秒时间看到成功提示
    } catch (error: any) {
      adnaan.toast.error(error.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 处理退出
  const handleExit = async () => {
    if (hasUnsavedChanges) {
      const confirmed = await adnaan.confirm.confirm('确认退出', '您有未保存的修改，确定要退出吗？', '退出', '取消');
      if (!confirmed) return;
    }

    // 尝试关闭当前窗口，如果无法关闭则返回上一页
    try {
      window.close();
    } catch (error) {
      // 如果无法关闭窗口（比如不是通过window.open打开的），则返回上一页
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate('/profile');
      }
    }
  };

  // 心情选项
  const moodOptions = ['😊 开心', '😢 难过', '😡 愤怒', '😌 平静', '😴 困倦', '🤔 思考'];
  const weatherOptions = ['☀️ 晴天', '☁️ 多云', '🌧️ 雨天', '❄️ 下雪', '🌈 彩虹'];

  if (isLoading) {
    return <PageLoading message="加载手记编辑器" fullScreen />;
  }

  return (
    <EditorContainer>
      {/* 顶部工具栏 */}
      <TopBar>
        <LeftSection>
          <BackButton onClick={handleExit}>
            <FiX />
            <span>退出</span>
          </BackButton>
          <Title>
            <input
              type="text"
              placeholder="请输入手记标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Title>
        </LeftSection>

        <RightSection>
          <Button
            variant={showSidebar ? 'primary' : 'outline'}
            size="small"
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? '隐藏属性面板' : '显示属性面板'}
          >
            <FiSettings />
            <span>属性</span>
          </Button>
          <Button
            variant={showAIAssistant ? 'primary' : 'outline'}
            size="small"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            <FiCpu />
            <span>AI助手</span>
          </Button>
          <Button variant={isPrivate ? 'outline' : 'outline'} size="small" onClick={() => setIsPrivate(!isPrivate)}>
            {isPrivate ? <FiLock /> : <FiUnlock />}
            <span>{isPrivate ? '私密' : '公开'}</span>
          </Button>
          <Button variant="primary" size="small" onClick={handleSave} disabled={isSaving}>
            <FiSave />
            <span>保存</span>
          </Button>
        </RightSection>
      </TopBar>

      {/* 主编辑区 */}
      <MainContent>
        {/* 编辑器 */}
        <EditorSection>
          <ModernEditor content={content} onChange={setContent} placeholder="记录此刻的心情..." />
        </EditorSection>

        {/* AI助手面板 */}
        {showAIAssistant && (
          <AIAssistantPanel>
            <EditorAIAssistant
              content={content}
              onContentUpdate={setContent}
              isVisible={showAIAssistant}
              onToggle={() => setShowAIAssistant(false)}
            />
          </AIAssistantPanel>
        )}

        {/* 右侧边栏 - 可折叠 */}
        {showSidebar && (
          <Sidebar>
            <SidebarSection>
              <SectionTitle>手记属性</SectionTitle>

              {/* 心情 */}
              <Field>
                <Label>
                  <FiSmile />
                  <span>心情</span>
                </Label>
                <MoodGrid>
                  {moodOptions.map((option) => (
                    <MoodItem
                      key={option}
                      selected={mood === option}
                      onClick={() =>
                        setMood(
                          mood === option
                            ? ''
                            : option
                                .replace('😊 ', '')
                                .replace('😢 ', '')
                                .replace('😡 ', '')
                                .replace('😌 ', '')
                                .replace('😴 ', '')
                                .replace('🤔 ', ''),
                        )
                      }
                    >
                      {option}
                    </MoodItem>
                  ))}
                </MoodGrid>
              </Field>

              {/* 天气 */}
              <Field>
                <Label>
                  <FiCloud />
                  <span>天气</span>
                </Label>
                <WeatherGrid>
                  {weatherOptions.map((option) => (
                    <WeatherItem
                      key={option}
                      selected={weather === option}
                      onClick={() => setWeather(weather === option ? '' : option)}
                    >
                      {option}
                    </WeatherItem>
                  ))}
                </WeatherGrid>
              </Field>

              {/* 位置 */}
              <Field>
                <Label>
                  <FiMapPin />
                  <span>位置</span>
                </Label>
                <Input placeholder="记录当前位置..." value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>

              {/* 标签 */}
              <Field>
                <Label>
                  <FiTag />
                  <span>标签</span>
                </Label>
                <TagInput>
                  <input
                    type="text"
                    placeholder="添加标签..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button onClick={handleAddTag}>添加</button>
                </TagInput>
                <TagsList>
                  {tags.map((tag) => (
                    <TagItem key={tag}>
                      <span>{tag}</span>
                      <button onClick={() => handleRemoveTag(tag)}>
                        <FiClose />
                      </button>
                    </TagItem>
                  ))}
                </TagsList>
              </Field>
            </SidebarSection>
          </Sidebar>
        )}
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
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);

  svg {
    font-size: 16px;
  }
`;

const MoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

interface MoodItemProps {
  selected: boolean;
}

const MoodItem = styled.div<MoodItemProps>`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? 'var(--primary-color)' : 'var(--bg-primary)')};
  color: ${(props) => (props.selected ? '#fff' : 'var(--text-primary)')};
  border-color: ${(props) => (props.selected ? 'var(--primary-color)' : 'var(--border-color)')};
  font-size: 14px;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

interface WeatherItemProps {
  selected: boolean;
}

const WeatherItem = styled.div<WeatherItemProps>`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? 'var(--primary-color)' : 'var(--bg-primary)')};
  color: ${(props) => (props.selected ? '#fff' : 'var(--text-primary)')};
  border-color: ${(props) => (props.selected ? 'var(--primary-color)' : 'var(--border-color)')};
  font-size: 14px;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: var(--primary-color);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--bg-primary);
  font-size: 13px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;

    &:hover {
      color: var(--error-color);
    }

    svg {
      font-size: 12px;
    }
  }
`;

export default NoteEditorPage;
