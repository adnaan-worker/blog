import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMapPin, FiClock, FiGlobe, FiCpu, FiChevronDown, FiChevronUp, FiEdit3 } from 'react-icons/fi';
import { Button } from 'adnaan-ui';
import { PageHeader, SEO, GuestbookSkeleton, GuestbookAvatar, RandomAvatar } from '@/components/common';
import { useAnimationEngine } from '@/utils/ui/animation';
import { getTimeAgo, storage } from '@/utils';
import { API } from '@/utils/api';
import type { GuestbookMessage, CreateGuestbookMessageData } from '@/types';

// ============================================================================
// 工具函数 & 数据
// ============================================================================

// 真实数据改为从后端获取，这里保留原结构示例作为设计参考

// ============================================================================
// Styled Components
// ============================================================================
const PageContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const MainContent = styled.div`
  width: 100%;
`;

// 写留言表单容器（用于 PageHeader 右侧）
const WriteMessageForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const WriteButton = styled(Button)`
  width: 100%;
  justify-content: center;
`;

// 展开的表单卡片 - 轻盈设计
const ExpandedFormCard = styled(motion.div)`
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  margin-top: 1rem;
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
`;

// 极简输入框 - 底部边框风格
const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.3);
  font-size: 0.95rem;
  color: var(--text-primary);
  resize: vertical;
  line-height: 1.6;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    border-bottom-color: var(--accent-color);
  }

  &::placeholder {
    color: var(--text-tertiary);
    opacity: 0.6;
  }
`;

const MetaInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.65rem 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.3);
  font-size: 0.85rem;
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-bottom-color: var(--accent-color);
  }

  &::placeholder {
    color: var(--text-tertiary);
    opacity: 0.6;
    font-size: 0.8rem;
  }
`;

// 便签式瀑布流容器
const MessageList = styled.div`
  flex: 1;
  column-count: 3;
  column-gap: 1.5rem;

  @media (max-width: 1200px) {
    column-count: 2;
  }

  @media (max-width: 768px) {
    column-count: 1;
  }
`;

// 便签卡片 - 带随机渐变背景
const MessageCard = styled(motion.div)<{ colorIndex: number }>`
  break-inside: avoid;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: ${(props) => {
    const colors = [
      'linear-gradient(135deg, #FFF9E6 0%, #FFF4D6 100%)', // 淡黄
      'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', // 淡绿
      'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', // 淡蓝
      'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)', // 淡粉
      'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)', // 淡紫
      'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', // 淡橙
    ];
    return colors[props.colorIndex % colors.length];
  }};
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: default;
  position: relative;

  /* 便签纸质感 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      transparent,
      transparent 24px,
      rgba(0, 0, 0, 0.02) 24px,
      rgba(0, 0, 0, 0.02) 25px
    );
    pointer-events: none;
    border-radius: inherit;
  }

  &:hover {
    transform: translateY(-4px) rotate(0.5deg);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  /* 暗色模式 - 柔和低饱和度配色 */
  [data-theme='dark'] & {
    background: ${(props) => {
      const darkColors = [
        'linear-gradient(135deg, rgba(139, 117, 90, 0.15) 0%, rgba(121, 101, 74, 0.2) 100%)', // 暖棕调
        'linear-gradient(135deg, rgba(76, 110, 87, 0.15) 0%, rgba(65, 95, 74, 0.2) 100%)', // 墨绿调
        'linear-gradient(135deg, rgba(66, 99, 132, 0.15) 0%, rgba(55, 84, 112, 0.2) 100%)', // 深蓝调
        'linear-gradient(135deg, rgba(121, 85, 108, 0.15) 0%, rgba(105, 72, 93, 0.2) 100%)', // 紫红调
        'linear-gradient(135deg, rgba(94, 84, 121, 0.15) 0%, rgba(80, 71, 105, 0.2) 100%)', // 深紫调
        'linear-gradient(135deg, rgba(139, 99, 76, 0.15) 0%, rgba(121, 84, 63, 0.2) 100%)', // 橙棕调
      ];
      return darkColors[props.colorIndex % darkColors.length];
    }};
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;

    &::before {
      background: repeating-linear-gradient(
        transparent,
        transparent 24px,
        rgba(255, 255, 255, 0.02) 24px,
        rgba(255, 255, 255, 0.02) 25px
      );
    }

    &:hover {
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow:
        0 8px 28px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.08) inset;
    }
  }
`;

// 卡片内部容器
const MessageInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// 用户留言行（包含头像、元信息、气泡）
const UserMessageRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const MessageContentColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
`;

const UserMetaRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-left: 0.2rem;
`;

const UserName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  opacity: 0.8;
`;

// 用户留言气泡
const UserBubble = styled.div`
  position: relative;
  display: inline-block;
  padding: 0.75rem 1rem;
  background: rgba(var(--text-primary-rgb), 0.04);
  border-radius: 4px 16px 16px 16px; /* 左上角直角，模拟气泡源头 */
  line-height: 1.6;
  color: var(--text-secondary);
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 0.9rem;
  align-self: flex-start;

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }
`;

// 博主回复区域（保持右对齐风格）
const AuthorReply = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding-left: 3rem; /* 缩进，体现层级 */
`;

const AuthorLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-color);
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 0.2rem;
`;

const AuthorMessageRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  flex-direction: row-reverse;
`;

const AuthorBubble = styled.div`
  position: relative;
  display: inline-block;
  padding: 0.75rem 1rem;
  background: rgba(var(--accent-rgb), 0.12);
  border-radius: 16px 4px 16px 16px; /* 右上角直角 */
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 0.9rem;
  text-align: left;

  [data-theme='dark'] & {
    background: rgba(var(--accent-rgb), 0.2);
    color: rgba(255, 255, 255, 0.95);
  }
`;

// 网站链接按钮
const WebsiteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    color: rgba(0, 0, 0, 0.8);
  }

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const Guestbook: React.FC = () => {
  const { variants } = useAnimationEngine();
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false); // 默认折叠

  const [name, setName] = useState(() => storage.local.get<string>('guest_name') || '');
  const [email, setEmail] = useState(() => storage.local.get<string>('guest_email') || '');
  const [website, setWebsite] = useState(() => storage.local.get<string>('guest_website') || '');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await API.guestbook.getMessages({ page: 1, limit: 50 });
        setMessages(response.data || []);
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('加载留言失败:', error);
        adnaan.toast.error(error.message || '加载留言失败');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || !name.trim()) return;
    setSubmitting(true);

    const payload: CreateGuestbookMessageData = {
      content: content.trim(),
      guestName: name.trim(),
      guestEmail: email.trim() || undefined,
      guestWebsite: website.trim() || undefined,
    };

    try {
      const response = await API.guestbook.createMessage(payload);
      const created = response.data;

      storage.local.set('guest_name', name);
      storage.local.set('guest_email', email);
      storage.local.set('guest_website', website);

      setContent('');
      setIsFormExpanded(false);

      const approvedImmediately = created?.status === 'approved';
      adnaan.toast.success(approvedImmediately ? '留言成功' : '留言已提交，审核通过后会展示');

      if (approvedImmediately) {
        setMessages((prev) => [created, ...prev]);
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('发送留言失败:', error);
      adnaan.toast.error(error.message || '发送留言失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 渲染写留言表单（用于 PageHeader 右侧）
  const renderWriteForm = () => (
    <WriteMessageForm>
      <Button
        variant={isFormExpanded ? 'primary' : 'ghost'}
        size="small"
        onClick={() => setIsFormExpanded(!isFormExpanded)}
        leftIcon={<FiEdit3 />}
        rightIcon={
          <motion.div
            animate={{ rotate: isFormExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex' }}
          >
            <FiChevronDown />
          </motion.div>
        }
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          background: isFormExpanded ? 'var(--accent-color)' : 'rgba(var(--border-color-rgb, 229, 231, 235), 0.2)',
          color: isFormExpanded ? '#fff' : 'var(--text-secondary)',
          border: 'none',
          boxShadow: isFormExpanded ? '0 4px 12px rgba(var(--accent-rgb), 0.25)' : 'none',
        }}
      >
        写留言
      </Button>

      <AnimatePresence>
        {isFormExpanded && (
          <ExpandedFormCard
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FormBody>
              <TextArea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <MetaInputs>
                <InputWrapper>
                  <InputField placeholder="昵称 *" value={name} onChange={(e) => setName(e.target.value)} />
                </InputWrapper>
                <InputWrapper>
                  <InputField
                    placeholder="邮箱 (仅博主可见)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <InputField placeholder="个人网站" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </InputWrapper>
              </MetaInputs>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={submitting}
                disabled={!content.trim() || !name.trim()}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  background: 'var(--accent-color)',
                  color: 'var(--bg-primary)',
                  fontWeight: 600,
                  height: '44px',
                }}
              >
                发送留言 <FiSend style={{ marginLeft: 8 }} />
              </Button>
            </FormBody>
          </ExpandedFormCard>
        )}
      </AnimatePresence>
    </WriteMessageForm>
  );

  return (
    <>
      <SEO title="留言" description="Leave a trace" />
      <PageContainer>
        <Container>
          <PageHeader
            title="暖笺"
            subtitle="以留言作暖融的信笺，记下技术交流的热忱与共情，在互联的经纬里，留存一段治愈的同行印记。"
            count={messages.length}
            countUnit="条留言"
            rightContent={renderWriteForm()}
          />

          <MainContent>
            {/* 右侧：便签式瀑布流 */}
            <MessageList>
              {loading ? (
                <div style={{ columnSpan: 'all' }}>
                  <GuestbookSkeleton count={6} />
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const author =
                      (msg.user && ((msg.user as any).nickname || msg.user.username)) || msg.guestName || '访客';
                    const createdAt = msg.createdAt || msg.updatedAt;
                    const location = msg.location;
                    const reply = msg.replyContent;
                    const website = msg.guestWebsite;

                    return (
                      <MessageCard
                        key={msg.id}
                        colorIndex={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                      >
                        <MessageInner>
                          {/* 用户留言行（头像 + 信息 + 气泡） */}
                          <UserMessageRow>
                            <GuestbookAvatar seed={author} />

                            <MessageContentColumn>
                              {/* 第一行：用户信息 */}
                              <UserMetaRow>
                                <UserName>{author}</UserName>
                                <UserMeta>
                                  <FiClock size={10} /> {createdAt ? getTimeAgo(createdAt) : '刚刚'}
                                  {location && (
                                    <>
                                      {' '}
                                      • <FiMapPin size={10} /> {location}
                                    </>
                                  )}
                                </UserMeta>
                              </UserMetaRow>

                              {/* 第二行：留言气泡 */}
                              <UserBubble>{msg.content}</UserBubble>
                            </MessageContentColumn>
                          </UserMessageRow>

                          {/* 博主回复（气泡 + 头像，右对齐）*/}
                          {reply && (
                            <AuthorReply>
                              <AuthorLabel>
                                <FiCpu size={10} /> Author Reply
                              </AuthorLabel>
                              <AuthorMessageRow>
                                <RandomAvatar seed="博主" size={32} style="personas" />
                                <AuthorBubble>{reply}</AuthorBubble>
                              </AuthorMessageRow>
                            </AuthorReply>
                          )}
                        </MessageInner>

                        {/* 网站链接按钮（右上角） */}
                        {website && (
                          <WebsiteButton onClick={() => window.open(website, '_blank')}>
                            <FiGlobe size={12} /> Visit
                          </WebsiteButton>
                        )}
                      </MessageCard>
                    );
                  })}
                </>
              )}
            </MessageList>
          </MainContent>
        </Container>
      </PageContainer>
    </>
  );
};

export default Guestbook;
