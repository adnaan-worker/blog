import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag, FiMapPin, FiCloud, FiHeart, FiEdit3, FiClock } from 'react-icons/fi';
import styled from '@emotion/styled';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 50px 1rem;
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
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 3rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

// 手记主内容
const NoteMain = styled.div``;

// 手记侧边栏
const NoteSidebar = styled.div`
  @media (max-width: 860px) {
    grid-row: 1;
    margin-bottom: 2rem;
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
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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

  &:first-child {
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
  background: rgba(81, 131, 245, 0.1);
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
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        `;
      case '平静':
        return `
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        `;
      case '思考':
        return `
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        `;
      case '感慨':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
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
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 500px;
  width: 100%;
  background: linear-gradient(to right, rgb(var(--gradient-from) / 0.3) 0, rgb(var(--gradient-to) / 0.3) 100%);
  mask-image: linear-gradient(#000, #ffffff00 70%);
  animation: fade-in 1s ease 0.2s both;
  @keyframes fade-in {
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

// 手记数据类型
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  weather?: string;
  location?: string;
  tags?: string[];
  readingTime?: number;
}

// 模拟手记数据
const DUMMY_NOTES: Note[] = [
  {
    id: '1',
    title: '晨光初现',
    content: `今天早上六点就醒了，推开窗户，看到远山如黛，晨光熹微。空气中还带着昨夜雨水的清香，让人心情格外舒畅。

泡了一壶茶，坐在阳台上静静地看着这座城市慢慢苏醒。远处传来鸟儿的啁啾声，偶尔有早起的行人匆匆走过。这样的时刻总是让我觉得特别珍贵，仿佛整个世界都属于自己。

想起昨天读到的一句话："生活不是等待暴风雨过去，而是学会在雨中起舞。" 或许这就是生活的真谛吧，不管遇到什么困难，都要保持一颗平静而坚韧的心。

> "每一个清晨都是新的开始，每一次日出都是希望的象征。"

今天要开始新的项目了，虽然有些紧张，但更多的是期待。相信只要用心去做，一定会有好的结果。`,
    createdAt: '2025-01-15T06:30:00Z',
    mood: '平静',
    weather: '晴',
    location: '家中阳台',
    tags: ['生活', '感悟', '晨光'],
    readingTime: 2,
  },
  {
    id: '2',
    title: '午后阳光',
    content: `下午的阳光透过百叶窗洒在桌案上，形成一道道金色的光影。手中的咖啡还冒着热气，书页在微风中轻轻翻动。

这样的午后总是让人想起很多往事。记得小时候，也是这样的阳光，奶奶总是坐在院子里纳鞋底，我在一旁写作业。那时候觉得时间过得很慢，现在却觉得那些日子过得太快了。

人总是这样，拥有的时候不懂得珍惜，失去了才知道可贵。但这也许就是成长的代价吧，我们在失去中学会珍惜，在回忆中学会感恩。

今天读了几页《瓦尔登湖》，梭罗说："我步入丛林，因为我希望生活得有意义。" 这句话让我思考了很久，什么才是有意义的生活呢？

也许就是像现在这样，在平凡的日子里找到属于自己的节奏，在简单的事物中发现美好。`,
    createdAt: '2025-01-14T14:20:00Z',
    mood: '思考',
    weather: '晴',
    location: '书房',
    tags: ['阅读', '回忆', '思考'],
    readingTime: 3,
  },
  {
    id: '3',
    title: '夜晚思考',
    content: `夜深了，城市的喧嚣渐渐平息。坐在窗前，看着远处零星的灯火，心情格外宁静。

今天遇到了一些挫折，项目进展不如预期，心情有些低落。但静下心来想想，这些困难其实都是成长路上必经的风景。每一次跌倒都是为了更好地站起来，每一次失败都是为了下一次的成功积累经验。

想起一位朋友曾经说过的话："困难就像弹簧，你弱它就强，你强它就弱。" 面对挫折，最重要的是保持积极的心态，相信自己有能力克服一切困难。

明天又是新的一天，要带着今天的经验和教训，继续前行。相信只要不放弃，总会找到解决问题的方法。

> "黑夜给了我黑色的眼睛，我却用它寻找光明。"`,
    createdAt: '2025-01-13T23:45:00Z',
    mood: '感慨',
    weather: '阴',
    location: '卧室',
    tags: ['反思', '成长', '坚持'],
    readingTime: 2,
  },
];

// 工具函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);

  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    const foundNote = DUMMY_NOTES.find((note) => note.id === id);
    setNote(foundNote || null);

    // 获取相关手记（同标签或时间相近的手记）
    if (foundNote) {
      const related = DUMMY_NOTES.filter(
        (n) =>
          n.id !== foundNote.id &&
          (n.tags?.some((tag) => foundNote.tags?.includes(tag)) ||
            Math.abs(new Date(n.createdAt).getTime() - new Date(foundNote.createdAt).getTime()) <
              7 * 24 * 60 * 60 * 1000),
      ).slice(0, 3);
      setRelatedNotes(related);
    }

    // 滚动到页面顶部
    window.scrollTo(0, 0);
  }, [id]);

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
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <NoteLayout>
          {/* 主内容区 */}
          <NoteMain>
            <NoteTitle>{note.title}</NoteTitle>

            <NoteMeta>
              <span>
                <FiCalendar size={16} /> {formatDate(note.createdAt)}
              </span>
              <span>
                <FiClock size={16} /> {formatTime(note.createdAt)}
              </span>
              {note.readingTime && (
                <span>
                  <FiEdit3 size={16} /> 约 {note.readingTime} 分钟阅读
                </span>
              )}
            </NoteMeta>

            <NoteContent>
              {note.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('> ')) {
                  return <blockquote key={index}>{paragraph.substring(2)}</blockquote>;
                }
                return <p key={index}>{paragraph}</p>;
              })}
            </NoteContent>

            {/* 相关手记 */}
            {relatedNotes.length > 0 && (
              <RelatedNotes>
                <RelatedTitle>相关手记</RelatedTitle>
                {relatedNotes.map((relatedNote) => (
                  <RelatedCard key={relatedNote.id} to={`/notes/${relatedNote.id}`}>
                    <h4>{relatedNote.title}</h4>
                    <p>{relatedNote.content.substring(0, 100)}...</p>
                    <div className="date">{formatDate(relatedNote.createdAt)}</div>
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
                  <InfoValue>{formatDate(note.createdAt)}</InfoValue>
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
      <PageHeadGradient />
    </PageContainer>
  );
};

export default NoteDetail;
