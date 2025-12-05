import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';
import { Friend } from '../data';

const CardContainer = styled(motion.a)<{ themeColor?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 200px; /*稍微增加高度以容纳更多内容*/
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    border-color: ${(props) => props.themeColor || 'var(--accent-color)'};
    box-shadow: 0 20px 40px -10px ${(props) => props.themeColor || 'var(--accent-color)'}20;

    .preview-layer {
      opacity: 1;
      transform: scale(1.05);
    }

    /* Hover 时面板下沉并变为实色背景 */
    .info-panel {
      transform: translateY(calc(100% - 72px)); /* 只保留底部 72px 高度 */
      background: var(--bg-secondary); /* 实色背景，遮挡下方 */
      border-top: 1px solid var(--border-color);
    }

    /* 隐藏描述和标签，为预览图腾空间 */
    .description,
    .tags-row {
      opacity: 0;
      height: 0;
      margin: 0;
    }

    /* 调整头像大小适应小面板 */
    .avatar {
      width: 40px;
      height: 40px;
      border-color: transparent;
    }

    .link-icon {
      opacity: 1;
      color: var(--text-secondary);
      background: var(--bg-primary);
      padding: 4px;
      border-radius: 50%;
    }
  }
`;

const PreviewLayer = styled.div<{ url: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 70px); /* 预留底部空间，防止图片被遮挡 */
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: top center;
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  background-color: var(--bg-primary); /* 图片加载前的底色 */
`;

// 信息面板：包含所有文字内容
const InfoPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  justify-content: flex-start;
`;

const TopSection = styled.div`
  display: flex;
  align-items: flex-start; /* 改为顶部对齐，配合布局变化 */
  gap: 1rem;
  width: 100%;
  transition: all 0.3s ease;
`;

const Avatar = styled.div<{ src: string }>`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
  border: 2px solid var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  background-color: var(--bg-secondary);
  transition: all 0.3s ease;
`;

const TextInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-content: center;
  height: 52px; /* 与头像高度一致 */
`;

const Name = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
  line-height: 1.2;
`;

const TagsRow = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid transparent;
  transition: all 0.3s;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 1rem 0 0 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 1;
`;

const LinkIcon = styled(FiExternalLink)`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: var(--text-tertiary);
  opacity: 0; /* 默认隐藏，Hover时显示 */
  transition: all 0.3s ease;
  z-index: 2;
  font-size: 1.2rem;
`;

interface FriendCardProps {
  friend: Friend;
  index: number;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, index }) => {
  // 使用 thum.io 获取更清晰的实时截图
  const previewUrl =
    friend.url && friend.url.startsWith('http')
      ? `https://s0.wp.com/mshots/v1/${encodeURIComponent(friend.url)}?w=600&h=400`
      : '';

  return (
    <CardContainer
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      themeColor={friend.theme}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* 纯净的预览层，无任何遮罩 */}
      {previewUrl && <PreviewLayer url={previewUrl} className="preview-layer" />}

      <InfoPanel className="info-panel">
        <TopSection>
          <Avatar src={friend.avatar} className="avatar" />
          <TextInfo>
            <Name>{friend.name}</Name>
            <TagsRow className="tags-row">
              {friend.tags?.slice(0, 2).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagsRow>
          </TextInfo>
          <LinkIcon className="link-icon" />
        </TopSection>

        <Description className="description">{friend.description}</Description>
      </InfoPanel>
    </CardContainer>
  );
};
