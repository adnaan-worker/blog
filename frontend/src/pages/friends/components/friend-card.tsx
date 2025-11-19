import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiSend, FiX } from 'react-icons/fi';
import { Input, Button, Textarea } from 'adnaan-ui';
import { useAnimationEngine } from '@/utils/ui/animation';
import { Friend } from '../data';

// ==================== 基础样式 ====================

const CardBase = styled(motion.div)<{ size?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 1.5rem;
  overflow: hidden;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* Bento Grid 跨度控制 */
  &.size-large {
    grid-column: span 2;
    grid-row: span 2;
    @media (max-width: 768px) {
      grid-column: span 1;
      grid-row: span 2;
    }
  }

  &.size-wide {
    grid-column: span 2;
    grid-row: span 1;
    @media (max-width: 768px) {
      grid-column: span 1;
      grid-row: span 1;
    }
  }

  &.size-tall {
    grid-column: span 1;
    grid-row: span 2;
  }

  /* 浅色模式适配 */
  [data-theme='light'] & {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(0, 0, 0, 0.05);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px -1px rgba(0, 0, 0, 0.02);
  }
`;

// ==================== FriendCard 样式 ====================

const FriendLink = styled(CardBase)`
  cursor: pointer;
  text-decoration: none;

  /* 悬停效果 */
  &:hover {
    transform: translateY(-8px);
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.06);
    box-shadow:
      0 20px 40px -5px rgba(0, 0, 0, 0.2),
      0 10px 20px -5px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(var(--accent-rgb), 0.3),
      0 0 30px -10px rgba(var(--accent-rgb), 0.3);

    [data-theme='light'] & {
      background: rgba(255, 255, 255, 0.9);
      box-shadow:
        0 20px 40px -5px rgba(0, 0, 0, 0.1),
        0 10px 20px -5px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(var(--accent-rgb), 0.2),
        0 0 30px -10px rgba(var(--accent-rgb), 0.2);
    }

    .avatar-ring {
      transform: rotate(180deg) scale(1.1);
      opacity: 1;
    }

    .link-icon {
      opacity: 1;
      transform: translate(0, 0) scale(1.1);
    }

    .card-name {
      color: var(--accent-color);
    }

    /* 光泽扫过效果 */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
      transform: skewX(-25deg);
      animation: shine 0.75s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  @keyframes shine {
    from {
      left: -100%;
    }
    to {
      left: 200%;
    }
  }
`.withComponent(motion.a);

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AvatarWrapper = styled.div<{ size?: string }>`
  position: relative;
  width: ${(props) => (props.size === 'large' ? '64px' : '48px')};
  height: ${(props) => (props.size === 'large' ? '64px' : '48px')};
  flex-shrink: 0;
  transition: transform 0.3s ease;

  ${FriendLink}:hover & {
    transform: scale(1.05);
  }
`;

const AvatarRing = styled.div`
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, var(--accent-color), transparent);
  opacity: 0;
  transition: all 0.5s ease;
  z-index: 1;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-secondary);
  position: relative;
  z-index: 2;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease;

  [data-theme='light'] & {
    border-color: rgba(0, 0, 0, 0.05);
  }

  ${FriendLink}:hover & {
    border-color: var(--accent-color);
  }
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 0.25rem;
`;

const Name = styled.h3<{ size?: string }>`
  font-size: ${(props) => (props.size === 'large' ? '1.5rem' : '1.1rem')};
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  transition: color 0.3s ease;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Desc = styled.p<{ size?: string }>`
  font-size: ${(props) => (props.size === 'large' ? '1rem' : '0.875rem')};
  color: var(--text-secondary);
  margin: 0.5rem 0 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: ${(props) => (props.size === 'large' ? 4 : props.size === 'wide' ? 2 : 3)};
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.9;
  transition: color 0.3s ease;

  ${FriendLink}:hover & {
    color: var(--text-primary);
    opacity: 1;
  }
`;

const BottomSection = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent-color);
  font-weight: 600;
  border: 1px solid rgba(var(--accent-rgb), 0.1);
  transition: all 0.3s ease;

  ${FriendLink}:hover & {
    background: var(--accent-color);
    color: #fff;
    border-color: var(--accent-color);
  }
`;

const LinkIcon = styled(motion.div)`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate(-4px, 4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  cursor: pointer;
  z-index: 20;

  &:hover {
    background: var(--accent-color) !important;
    color: #fff !important;
    box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.4);
  }
`;

// ==================== ApplyCard 样式 ====================

const ApplyCardContainer = styled(motion.div)`
  perspective: 1000px;

  /* 默认占 2 列 */
  grid-column: span 2;
  grid-row: span 1;

  @media (max-width: 768px) {
    grid-column: span 1;
    grid-row: span 1;
  }
`;

const ApplyCardInner = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
`;

const ApplyCardFace = styled(CardBase)`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
`;

const ApplyCardFront = styled(ApplyCardFace)`
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.05), rgba(var(--accent-rgb), 0.01));
  border-style: dashed;
  border-color: rgba(var(--accent-rgb), 0.3);
  flex-direction: column;
  cursor: pointer;

  &:hover {
    border-color: var(--accent-color);
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.05));
  }
`;

const ApplyCardBack = styled(ApplyCardFace)`
  background: var(--bg-secondary);
  transform: rotateY(180deg);
  padding: 1.5rem;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  border: 1px solid var(--accent-color);
`;

const FormTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== 组件实现 ====================

interface FriendCardProps {
  friend: Friend;
  index: number;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, index }) => {
  const isLarge = friend.size === 'large';

  return (
    <FriendLink
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`size-${friend.size || 'small'}`}
      style={
        {
          '--accent-color': friend.color || 'var(--primary-color)',
          '--accent-rgb': friend.color ? 'var(--accent-rgb)' : 'var(--primary-rgb)',
        } as any
      }
      whileTap={{ scale: 0.98 }}
    >
      <LinkIcon className="link-icon">
        <FiExternalLink size={16} />
      </LinkIcon>

      <CardContent>
        <TopSection>
          <AvatarWrapper size={friend.size}>
            <AvatarRing className="avatar-ring" />
            <Avatar src={friend.avatar} alt={friend.name} />
          </AvatarWrapper>
          {!isLarge && (
            <Info>
              <Name size={friend.size} className="card-name">
                <span>{friend.name}</span>
              </Name>
            </Info>
          )}
        </TopSection>

        {isLarge && (
          <Name size={friend.size} className="card-name" style={{ marginBottom: '0.5rem' }}>
            <span>{friend.name}</span>
          </Name>
        )}

        <Desc size={friend.size} title={friend.desc}>
          {friend.desc}
        </Desc>

        <BottomSection>
          <Tags>
            {friend.tags?.slice(0, isLarge ? 4 : 2).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
        </BottomSection>
      </CardContent>
    </FriendLink>
  );
};

// 申请入口卡片 (翻转交互)
export const ApplyCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', desc: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.stopPropagation();
    if (!formData.name || !formData.url) {
      adnaan.toast.error('请填写名称和链接');
      return;
    }

    setLoading(true);
    // 模拟提交
    setTimeout(() => {
      setLoading(false);
      setIsFlipped(false);
      setFormData({ name: '', url: '', desc: '' });
      adnaan.toast.success('申请已提交，请等待审核');
    }, 1500);
  };

  return (
    <ApplyCardContainer
      className="size-wide"
      style={
        {
          '--accent-color': 'var(--primary-color)',
          '--accent-rgb': 'var(--primary-rgb)',
        } as any
      }
    >
      <ApplyCardInner
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* 正面：引导 */}
        <ApplyCardFront onClick={() => setIsFlipped(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <motion.div
            animate={{
              y: [0, -6, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(var(--accent-rgb), 0.1)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(var(--accent-rgb), 0.2)',
            }}
          >
            <FiExternalLink size={28} />
          </motion.div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent-color)' }}>
            加入我们
          </h3>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>成为邻居，交换友链</p>
        </ApplyCardFront>

        {/* 背面：表单 */}
        <ApplyCardBack>
          <FormTitle>
            <h3>申请友链</h3>
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              leftIcon={<FiX />}
              style={{ padding: '4px', minWidth: 'auto' }}
            />
          </FormTitle>

          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
          >
            <FormGrid>
              <Input
                placeholder="网站名称"
                size="small"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              />
              <Input
                placeholder="网站链接"
                size="small"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              />
            </FormGrid>
            <Textarea
              placeholder="一句话介绍（选填）"
              size="small"
              rows={2}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={{ resize: 'none' }}
            />
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="small"
                onClick={handleSubmit}
                disabled={loading}
                leftIcon={loading ? undefined : <FiSend />}
              >
                {loading ? '提交中...' : '提交申请'}
              </Button>
            </div>
          </form>
        </ApplyCardBack>
      </ApplyCardInner>
    </ApplyCardContainer>
  );
};
