import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag, FiMapPin, FiCloud, FiHeart, FiEdit3, FiClock } from 'react-icons/fi';
import styled from '@emotion/styled';
import { API, Note } from '@/utils/api';
import RichTextRenderer from '@/components/common/rich-text-renderer';
import RichTextStats from '@/components/common/rich-text-stats';
import ImagePreview from '@/components/common/image-preview';
import PageLoading from '@/components/common/page-loading';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 1.5rem 4rem;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    padding: 60px 1rem 3rem;
  }
`;

// 返回链接 - 优化样式
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 0;

  svg {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--accent-color);

    svg {
      transform: translateX(-4px);
    }
  }
`;

// 手记布局
const NoteLayout = styled.div`
  display: flex;
  gap: 2rem;
  position: relative;

  @media (max-width: 860px) {
    flex-direction: column;
    gap: 2.5rem;
  }
`;

// 手记主内容
const NoteMain = styled.div`
  flex: 1;
  min-width: 0;
`;

// 手记侧边栏 - 使用 sticky 定位
const NoteSidebar = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 150px;
  width: 300px;
  height: fit-content;
  align-self: flex-start;

  @media (max-width: 860px) {
    position: static;
    width: 100%;
  }
`;

// 手记头部卡片 - 新增，包含标题和元数据
const NoteHeader = styled.div`
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);

  [data-theme='dark'] & {
    background: rgba(var(--bg-secondary-rgb, 30, 30, 30), 0.6);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

// 手记标题
const NoteTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  line-height: 1.4;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 1.6rem;
  }
`;

// 手记元数据 - 优化布局
const NoteMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-secondary);
    font-size: 0.85rem;

    svg {
      color: var(--accent-color);
      opacity: 0.7;
    }
  }

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

// 手记内容包装器 - 优化背景
const NoteContentWrapper = styled.div`
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;

  [data-theme='dark'] & {
    background: rgba(var(--bg-secondary-rgb, 30, 30, 30), 0.6);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

// 手记信息卡片 - 优化样式
const NoteInfoCard = styled.div`
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  [data-theme='dark'] & {
    background: rgba(var(--bg-secondary-rgb, 30, 30, 30), 0.6);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    box-shadow: 0 6px 32px rgba(0, 0, 0, 0.08);

    [data-theme='dark'] & {
      box-shadow: 0 6px 32px rgba(0, 0, 0, 0.3);
    }
  }
`;

// 卡片标题
const CardTitle = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
`;

// 信息列表
const InfoList = styled.ul`
  list-style: none;
  padding: 1.25rem 1.5rem;
  margin: 0;
`;

// 信息项 - 优化间距和样式
const InfoItem = styled.li`
  padding: 0.875rem 0;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(var(--border-color-rgb, 200, 200, 200), 0.5);
  }

  &:first-of-type {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

// 信息标签
const InfoLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-tertiary);
  min-width: 60px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;

  svg {
    color: var(--accent-color);
    opacity: 0.8;
  }
`;

// 信息值
const InfoValue = styled.div`
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

// 标签容器
const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// 标签 - 优化样式
const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: default;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.2em;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.2);
  }
`;

// 心情指示器 - 优化样式
const MoodIndicator = styled.div<{ mood: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: default;

  ${(props) => {
    switch (props.mood) {
      case '开心':
        return `
          background: var(--success-bg);
          color: var(--success-color);
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
          }
        `;
      case '平静':
        return `
          background: var(--info-bg);
          color: var(--info-color);
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
          }
        `;
      case '思考':
        return `
          background: var(--accent-color-alpha);
          color: var(--accent-color);
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.3);
          }
        `;
      case '感慨':
        return `
          background: var(--warning-bg);
          color: var(--warning-color);
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
          }
        `;
      default:
        return `
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          &:hover {
            transform: scale(1.05);
          }
        `;
    }
  }}
`;

// 相关手记容器
const RelatedNotes = styled.div`
  margin-top: 3rem;
`;

// 相关手记标题
const RelatedTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

// 相关手记列表
const RelatedList = styled.div`
  display: grid;
  gap: 1rem;
`;

// 相关手记卡片 - 优化样式
const RelatedCard = styled(Link)`
  display: block;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  [data-theme='dark'] & {
    background: rgba(var(--bg-secondary-rgb, 30, 30, 30), 0.6);
  }

  /* 悬停效果装饰条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-color);
    transform: scaleY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  h4 {
    font-size: 0.95rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    transition: color 0.2s ease;
  }

  p {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .date {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;

    svg {
      opacity: 0.6;
    }
  }

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

    [data-theme='dark'] & {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    &::before {
      transform: scaleY(1);
    }

    h4 {
      color: var(--accent-color);
    }
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
  mask-image: linear-gradient(var(--mask-gradient-start), var(--mask-gradient-end) 70%);
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
    background: linear-gradient(
      180deg,
      var(--paper-bg-light-start) 0%,
      var(--paper-bg-light-mid) 50%,
      var(--paper-bg-light-end) 100%
    );

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
      /* 深色纸张基底 */
        linear-gradient(
          180deg,
          var(--paper-bg-dark-start) 0%,
          var(--paper-bg-dark-mid) 50%,
          var(--paper-bg-dark-end) 100%
        );

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
      adnaan.toast.error(error.message || '加载手记失败');
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
      <>
        <PageHeadGradient />
        <PaperBackground />
        <PageContainer>
          <motion.div variants={pageVariants} initial="initial" animate="animate">
            <BackLink to="/notes">
              <FiArrowLeft size={16} /> 返回手记列表
            </BackLink>
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <h2>手记未找到</h2>
              <p>抱歉，找不到您请求的手记</p>
            </div>
          </motion.div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageHeadGradient />
      <PaperBackground />

      <PageContainer>
        <motion.div variants={pageVariants} initial="initial" animate="animate">
          <BackLink to="/notes">
            <FiArrowLeft size={16} /> 返回手记列表
          </BackLink>

          <NoteLayout>
            {/* 主内容区 */}
            <NoteMain>
              {/* 标题和元数据卡片 */}
              <NoteHeader>
                <NoteTitle>{note.title}</NoteTitle>
                <NoteMeta>
                  <span>
                    <FiCalendar size={15} /> {formatDateUtil(note.createdAt, 'YYYY-MM-DD')}
                  </span>
                  <span>
                    <FiClock size={15} /> {formatTime(note.createdAt)}
                  </span>
                </NoteMeta>
              </NoteHeader>

              {/* 内容统计 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <RichTextStats content={note.content} showDetailed={true} />
              </div>

              {/* 手记内容 */}
              <NoteContentWrapper>
                <RichTextRenderer
                  content={note.content}
                  mode="note"
                  enableCodeHighlight={true}
                  enableImagePreview={true}
                  enableTableOfContents={false}
                  onImageClick={handleImageClick}
                />
              </NoteContentWrapper>

              {/* 相关手记 */}
              {note.relatedNotes && note.relatedNotes.length > 0 && (
                <RelatedNotes>
                  <RelatedTitle>相关手记</RelatedTitle>
                  <RelatedList>
                    {note.relatedNotes.map((relatedNote) => (
                      <RelatedCard key={relatedNote.id} to={`/notes/${relatedNote.id}`}>
                        <h4>{relatedNote.title || '生活随记'}</h4>
                        <p>{relatedNote.content.substring(0, 100)}...</p>
                        <div className="date">
                          <FiCalendar size={12} />
                          {formatDateUtil(relatedNote.createdAt, 'YYYY-MM-DD')}
                        </div>
                      </RelatedCard>
                    ))}
                  </RelatedList>
                </RelatedNotes>
              )}
            </NoteMain>

            {/* 侧边栏 */}
            <NoteSidebar>
              <NoteInfoCard>
                <CardTitle>手记信息</CardTitle>
                <InfoList>
                  <InfoItem>
                    <InfoLabel>
                      <FiCalendar size={13} />
                      日期
                    </InfoLabel>
                    <InfoValue>{formatDateUtil(note.createdAt, 'YYYY-MM-DD')}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>
                      <FiClock size={13} />
                      时间
                    </InfoLabel>
                    <InfoValue>{formatTime(note.createdAt)}</InfoValue>
                  </InfoItem>
                  {note.mood && (
                    <InfoItem>
                      <InfoLabel>
                        <FiHeart size={13} />
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
                        <FiCloud size={13} />
                        天气
                      </InfoLabel>
                      <InfoValue>{note.weather}</InfoValue>
                    </InfoItem>
                  )}
                  {note.location && (
                    <InfoItem>
                      <InfoLabel>
                        <FiMapPin size={13} />
                        地点
                      </InfoLabel>
                      <InfoValue>{note.location}</InfoValue>
                    </InfoItem>
                  )}
                  {note.readingTime && (
                    <InfoItem>
                      <InfoLabel>
                        <FiEdit3 size={13} />
                        阅读
                      </InfoLabel>
                      <InfoValue>约 {note.readingTime} 分钟</InfoValue>
                    </InfoItem>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <InfoItem>
                      <InfoLabel>
                        <FiTag size={13} />
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
