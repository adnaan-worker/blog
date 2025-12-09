import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLink, FiCheck, FiDownload, FiShare2 } from 'react-icons/fi';
import { RiWeiboLine, RiTwitterXLine, RiWechatLine } from 'react-icons/ri';
import { toPng } from 'html-to-image';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end; /* 移动端底部对齐 */
  }
`;

const ModalContent = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 32px;
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  position: relative;
  display: flex;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 24px 24px 0 0;
    max-height: 90vh; /* 增加高度 */
    height: auto;
    overflow-y: auto; /* 允许滚动 */
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: rotate(90deg);
  }

  /* 移动端调整关闭按钮位置和样式，使其更明显 */
  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.1);
    z-index: 20; /* 确保在最上层 */
  }

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.1);
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const PosterSection = styled.div`
  flex: 1.2;
  background: var(--bg-secondary);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle at 50% 50%, var(--accent-color-alpha) 0%, transparent 50%);
    opacity: 0.15;
    filter: blur(60px);
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem 1rem; /* 减少底部内边距 */
    min-height: auto; /* 移除最小高度限制 */
    flex: none;
    /* 确保背景色延续 */
    background: var(--bg-secondary);
  }
`;

const PolaroidCard = styled.div`
  width: 340px;
  background: #ffffff;
  padding: 16px 16px 24px 16px;
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  transform: rotate(-2deg);
  transition: transform 0.3s ease;
  position: relative;
  color: #1a1a1a;

  &:hover {
    transform: rotate(0deg) scale(1.02);
    z-index: 5;
  }

  @media (max-width: 768px) {
    width: 260px; /* 进一步缩小宽度 */
    transform: rotate(0deg); /* 移动端不旋转 */
    padding: 12px 12px 16px 12px; /* 减小内边距 */
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
    margin: 0 auto; /* 居中 */
  }

  /* 超小屏幕适配 */
  @media (max-width: 360px) {
    width: 240px;
  }

  .image-container {
    width: 100%;
    aspect-ratio: 4/3; /* 稍微压扁一点，或者保持 16/9 ? 这里原样保持 4/3 */
    background: #f0f0f0;
    overflow: hidden;
    margin-bottom: 20px;
    position: relative;

    @media (max-width: 768px) {
      margin-bottom: 12px; /* 减小间距 */
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
    }
  }

  .meta-content {
    padding: 0 8px;
  }

  .date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 8px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .title {
    font-family: var(--font-heading);
    font-size: 1.4rem;
    font-weight: 800;
    line-height: 1.3;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    letter-spacing: -0.02em;
  }

  .excerpt {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #555;
    margin-bottom: 24px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-weight: 400;
  }

  .divider {
    height: 1px;
    background: #eee;
    margin-bottom: 16px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: -2px;
      width: 40px;
      height: 5px;
      background: #000;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .author {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span:first-of-type {
      font-size: 0.9rem;
      font-weight: 700;
    }
    span:last-of-type {
      font-size: 0.7rem;
      color: #999;
    }
  }

  .qrcode-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    img {
      width: 48px;
      height: 48px;
      mix-blend-mode: multiply;
    }

    span {
      font-size: 0.6rem;
      color: #bbb;
      transform: scale(0.9);
      transform-origin: right;
    }
  }
`;

const ActionSection = styled.div`
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  background: var(--bg-primary);

  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 24px 24px 0 0;
    margin-top: -24px;
    position: relative;
    z-index: 5;
    flex: none;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ChannelButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  group: channel;

  .icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 20px;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--text-secondary);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--accent-color);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  span {
    font-size: 0.8rem;
    color: var(--text-secondary);
    transition: color 0.2s;
  }

  &:hover {
    .icon-wrapper {
      transform: translateY(-4px);
      border-color: transparent;
      color: white;
      box-shadow: 0 8px 20px -4px var(--accent-color-alpha);

      &::after {
        opacity: 1;
      }

      svg {
        position: relative;
        z-index: 2;
      }
    }

    span {
      color: var(--text-primary);
    }
  }
`;

const LinkBox = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-alpha);
  }

  .url {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 0.5rem;
  }
`;

const CopyButton = styled.button`
  padding: 0.6rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--text-primary);
    color: var(--bg-primary);
    border-color: var(--text-primary);
  }
`;

const DownloadLargeButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--accent-color) 0%, #a78bfa 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: auto;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 20px -5px var(--accent-color-alpha);

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 15px 30px -5px var(--accent-color-alpha);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(1px);
  }
`;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    excerpt: string;
    author: string;
    coverImage?: string;
    date?: string;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, article }) => {
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // 复制链接
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // 生成海报图片
  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `share-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Poster generation failed', err);
      adnaan.toast.error('海报生成失败，请稍后重试', '出错了');
    }
  };

  // 社交媒体分享
  const handleSocialShare = (platform: 'twitter' | 'weibo' | 'wechat') => {
    const text = `${article.title} - ${article.excerpt}`;
    const url = encodeURIComponent(currentUrl);

    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      weibo: `http://service.weibo.com/share/share.php?url=${url}&title=${encodeURIComponent(text)}&pic=${encodeURIComponent(article.coverImage || '')}`,
      wechat: `javascript:void(0)`,
    };

    if (platform === 'wechat') {
      adnaan.toast.info('请截图海报中的二维码在微信中打开', '微信分享');
    } else {
      window.open(links[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <ModalContent
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <FiX size={20} />
            </CloseButton>

            {/* 左侧：海报预览 */}
            <PosterSection>
              <PolaroidCard ref={posterRef}>
                <div className="image-container">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt="Cover" crossOrigin="anonymous" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    />
                  )}
                </div>
                <div className="meta-content">
                  <div className="date">{new Date().toLocaleDateString()}</div>
                  <h2 className="title">{article.title}</h2>
                  <p className="excerpt">{article.excerpt.slice(0, 60)}...</p>
                  <div className="divider" />
                  <div className="footer">
                    <div className="author">
                      <span>{article.author}</span>
                      <span>Published on adnaan Blog</span>
                    </div>
                    <div className="qrcode-box">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=ffffff&margin=0`}
                        alt="QR Code"
                        crossOrigin="anonymous"
                      />
                      <span>Scan to read</span>
                    </div>
                  </div>
                </div>
              </PolaroidCard>
            </PosterSection>

            {/* 右侧：操作区域 */}
            <ActionSection>
              <div>
                <SectionTitle>分享到</SectionTitle>
                <ChannelGrid>
                  <ChannelButton onClick={() => handleSocialShare('weibo')}>
                    <div className="icon-wrapper">
                      <RiWeiboLine />
                    </div>
                    <span>微博</span>
                  </ChannelButton>
                  <ChannelButton onClick={() => handleSocialShare('twitter')}>
                    <div className="icon-wrapper">
                      <RiTwitterXLine />
                    </div>
                    <span>X</span>
                  </ChannelButton>
                  <ChannelButton onClick={() => handleSocialShare('wechat')}>
                    <div className="icon-wrapper">
                      <RiWechatLine />
                    </div>
                    <span>微信</span>
                  </ChannelButton>
                  <ChannelButton onClick={handleCopy}>
                    <div className="icon-wrapper">
                      <FiLink />
                    </div>
                    <span>复制链接</span>
                  </ChannelButton>
                </ChannelGrid>
              </div>

              <div>
                <SectionTitle>链接分享</SectionTitle>
                <LinkBox>
                  <span className="url">{currentUrl}</span>
                  <CopyButton onClick={handleCopy}>
                    {copied ? (
                      <>
                        <FiCheck /> 已复制
                      </>
                    ) : (
                      '复制'
                    )}
                  </CopyButton>
                </LinkBox>
              </div>

              <DownloadLargeButton onClick={handleDownloadPoster}>
                <FiDownload size={20} /> 保存精美海报
              </DownloadLargeButton>
              <p
                style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '-1rem' }}
              >
                如果不生效，请尝试手动截图
              </p>
            </ActionSection>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
