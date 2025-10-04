import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag, FiMapPin, FiCloud, FiHeart, FiEdit3, FiClock } from 'react-icons/fi';
import styled from '@emotion/styled';
import { API, Note } from '@/utils/api';
import { toast } from '@/ui';
import RichTextRenderer from '@/components/common/rich-text-renderer';
import RichTextStats from '@/components/common/rich-text-stats';
import ImagePreview from '@/components/common/image-preview';
import PageLoading from '@/components/common/page-loading';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 50px;
`;

// 返回链接
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
    transform: translateX(-3px);
  }
`;

// 手记布局
const NoteLayout = styled.div`
  display: flex;
  gap: 2.5rem;
  position: relative;
  z-index: 3;

  @media (max-width: 860px) {
    flex-direction: column;
  }
`;

// 手记主内容
const NoteMain = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 860px) {
    margin-right: 0;
  }
`;

// 手记侧边栏 - 使用 sticky 定位
const NoteSidebar = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 150px;
  width: 280px;
  height: fit-content;
  align-self: flex-start;
  margin-top: 40px;

  @media (max-width: 860px) {
    display: none;
  }
`;

// 手记标题
const NoteTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
  line-height: 1.3;

  @media (max-width: 640px) {
    font-size: 1.8rem;
  }
`;

// 手记元数据
const NoteMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

// 手记内容
const NoteContent = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 3rem;

  p {
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  blockquote {
    border-left: 4px solid var(--accent-color);
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: var(--text-tertiary);
  }

  code {
    background: var(--bg-secondary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: var(--font-code);
    font-size: 0.9em;
  }
`;

// 手记信息卡片
const NoteInfoCard = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;

  [data-theme='dark'] & {
    box-shadow: var(--card-shadow);
  }
`;

// 信息列表
const InfoList = styled.ul`
  list-style: none;
  padding: 1.5rem;
  margin: 0;
`;

// 信息项
const InfoItem = styled.li`
  padding: 0.75rem 0;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }
`;

// 信息标签
const InfoLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-tertiary);
  width: 80px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

// 信息值
const InfoValue = styled.div`
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

// 标签容器
const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// 标签
const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 500;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.2em;
  }
`;

// 心情指示器
const MoodIndicator = styled.div<{ mood: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;

  ${(props) => {
    switch (props.mood) {
      case '开心':
        return `
          background: var(--success-bg);
          color: var(--success-color);
        `;
      case '平静':
        return `
          background: var(--info-bg);
          color: var(--info-color);
        `;
      case '思考':
        return `
          background: var(--accent-color-alpha);
          color: var(--accent-color);
        `;
      case '感慨':
        return `
          background: var(--warning-bg);
          color: var(--warning-color);
        `;
      default:
        return `
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        `;
    }
  }}
`;

// 相关手记容器
const RelatedNotes = styled.div`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
`;

// 相关手记标题
const RelatedTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.25rem;
    bottom: 0.25rem;
    width: 4px;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

// 相关手记卡片
const RelatedCard = styled(Link)`
  display: block;
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  h4 {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .date {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 0.5rem;
  }

  &:hover {
    background: var(--bg-tertiary);
    transform: translateX(5px);
  }
`;

// 页面头部渐变背景
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 500px;
  width: 100%;
  background: linear-gradient(to right, rgba(var(--gradient-from), 0.3) 0%, rgba(var(--gradient-to), 0.3) 100%);
  mask-image: linear-gradient(#000, #ffffff00 70%);
  animation: fade-in 1s ease 0.2s both;
  z-index: 2;
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

// 纸张背景容器 - 完全基于主题系统
const PaperBackground = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;

  /* 亮色模式：羊皮纸效果 */
  [data-theme='light'] & {
    background: 
      /* 纸张基础颜色 - 米白色 */ linear-gradient(180deg, #fdfbf7 0%, #faf8f3 50%, #f8f6f1 100%);

    /* 添加细微噪点 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px);
      opacity: 0.3;
    }
  }

  /* 暗色模式：深色纸张质感 */
  [data-theme='dark'] & {
    background:
      /* 主题色光晕效果 */
      radial-gradient(ellipse 1000px 800px at 50% 0%, rgba(var(--gradient-from), 0.06), transparent 60%),
      /* 深色纸张基底 */ linear-gradient(180deg, #1a1a1a 0%, #151515 50%, #121212 100%);

    /* 添加主题色噪点纹理 */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        /* 细微的主题色网格 */
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(var(--gradient-from), 0.02) 3px,
          rgba(var(--gradient-from), 0.02) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          rgba(var(--gradient-to), 0.02) 3px,
          rgba(var(--gradient-to), 0.02) 4px
        );
      opacity: 0.4;
    }

    /* 添加主题色光斑 */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 30%, rgba(var(--gradient-from), 0.03), transparent 40%),
        radial-gradient(circle at 80% 60%, rgba(var(--gradient-to), 0.03), transparent 40%);
    }
  }

  /* 淡入动画 */
  animation: paper-fade-in 0.8s ease both;

  @keyframes paper-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

// 页面动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// 扩展Note接口以包含相关手记
interface NoteWithRelated extends Note {
  relatedNotes?: Note[];
}

// 导入封装的工具函数
import { formatDate as formatDateUtil } from '@/utils';

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<NoteWithRelated | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadNote();

    // 立即滚动到顶部，这是页面切换的正常行为
    window.scrollTo(0, 0);

    // 延迟处理body样式，确保不与滚动锁定管理器冲突
    const timer = setTimeout(() => {
      // 确保 body 可以滚动，但不要覆盖滚动锁定管理器的状态
      if (!document.body.style.position || document.body.style.position === 'static') {
        document.body.style.overflow = '';
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      // 组件卸载时确保滚动状态正常
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 手记详情页卸载，检查滚动状态');
      }
    };
  }, [id]);

  const loadNote = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await API.note.getNoteDetail(id);
      setNote(response.data);
    } catch (error: any) {
      toast.error(error.message || '加载手记失败');
      setNote(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 使用 useCallback 包装图片点击处理，避免重复渲染
  const handleImageClick = useCallback((src: string) => {
    setPreviewImage(src);
  }, []);

  // 加载中状态
  if (isLoading) {
    return <PageLoading message="加载手记中" />;
  }

  // 手记未找到
  if (!note) {
    return (
      <PageContainer>
        <BackLink to="/notes">
          <FiArrowLeft /> 返回手记列表
        </BackLink>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>手记未找到</h2>
          <p>抱歉，找不到您请求的手记</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageHeadGradient />
      <PaperBackground />

      <PageContainer>
        <motion.div variants={pageVariants} initial="initial" animate="animate">
          <NoteLayout>
            {/* 主内容区 */}
            <NoteMain>
              <NoteTitle>{note.title}</NoteTitle>

              <NoteMeta>
                <span>
                  <FiCalendar size={16} /> {formatDateUtil(note.createdAt, 'YYYY-MM-DD')}
                </span>
                <span>
                  <FiClock size={16} /> {formatTime(note.createdAt)}
                </span>
              </NoteMeta>

              <RichTextStats content={note.content} showDetailed={true} />

              <RichTextRenderer
                content={note.content}
                mode="note"
                enableCodeHighlight={true}
                enableImagePreview={true}
                enableTableOfContents={false}
                onImageClick={handleImageClick}
              />

              {/* 相关手记 */}
              {note.relatedNotes && note.relatedNotes.length > 0 && (
                <RelatedNotes>
                  <RelatedTitle>相关手记</RelatedTitle>
                  {note.relatedNotes.map((relatedNote) => (
                    <RelatedCard key={relatedNote.id} to={`/notes/${relatedNote.id}`}>
                      <h4>{relatedNote.title || '生活随记'}</h4>
                      <p>{relatedNote.content.substring(0, 100)}...</p>
                      <div className="date">{formatDateUtil(relatedNote.createdAt, 'YYYY-MM-DD')}</div>
                    </RelatedCard>
                  ))}
                </RelatedNotes>
              )}
            </NoteMain>

            {/* 侧边栏 */}
            <NoteSidebar>
              <NoteInfoCard>
                <InfoList>
                  <InfoItem>
                    <InfoLabel>
                      <FiCalendar size={14} />
                      日期
                    </InfoLabel>
                    <InfoValue>{formatDateUtil(note.createdAt, 'YYYY-MM-DD')}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>
                      <FiClock size={14} />
                      时间
                    </InfoLabel>
                    <InfoValue>{formatTime(note.createdAt)}</InfoValue>
                  </InfoItem>
                  {note.mood && (
                    <InfoItem>
                      <InfoLabel>
                        <FiHeart size={14} />
                        心情
                      </InfoLabel>
                      <InfoValue>
                        <MoodIndicator mood={note.mood}>{note.mood}</MoodIndicator>
                      </InfoValue>
                    </InfoItem>
                  )}
                  {note.weather && (
                    <InfoItem>
                      <InfoLabel>
                        <FiCloud size={14} />
                        天气
                      </InfoLabel>
                      <InfoValue>{note.weather}</InfoValue>
                    </InfoItem>
                  )}
                  {note.location && (
                    <InfoItem>
                      <InfoLabel>
                        <FiMapPin size={14} />
                        地点
                      </InfoLabel>
                      <InfoValue>{note.location}</InfoValue>
                    </InfoItem>
                  )}
                  {note.readingTime && (
                    <InfoItem>
                      <InfoLabel>
                        <FiEdit3 size={14} />
                        阅读
                      </InfoLabel>
                      <InfoValue>约 {note.readingTime} 分钟</InfoValue>
                    </InfoItem>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <InfoItem>
                      <InfoLabel>
                        <FiTag size={14} />
                        标签
                      </InfoLabel>
                      <InfoValue>
                        <TagsContainer>
                          {note.tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </TagsContainer>
                      </InfoValue>
                    </InfoItem>
                  )}
                </InfoList>
              </NoteInfoCard>
            </NoteSidebar>
          </NoteLayout>
        </motion.div>

        {/* 图片预览模态框 - 使用统一的ImagePreview组件 */}
        {previewImage && <ImagePreview src={previewImage} alt="预览" onClick={() => setPreviewImage(null)} />}
      </PageContainer>
    </>
  );
};

export default NoteDetail;
