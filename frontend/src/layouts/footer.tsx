import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiMail, FiRss } from 'react-icons/fi';
import React, { useState, useRef, useEffect } from 'react';
import { useAnimationEngine } from '@/utils/ui/animation';
import { useOnlineUsers } from '@/hooks/useSocket';
import { useSiteSettings } from './index';
import VisitorStatsTooltip from '@/components/common/visitor-stats-tooltip';
import { useClickOutside } from '@/hooks';

// === 样式组件 ===

const FooterContainer = styled.footer`
  width: 100%;
  /* Light mode: Subtle semi-transparent secondary background */
  background-color: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  margin-top: 6rem;
  font-family: var(--font-sans);
  position: relative;
  z-index: 10;

  /* Dark mode: More transparent to show galaxy background */
  [data-theme='dark'] & {
    background-color: rgba(var(--bg-secondary-rgb), 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const FooterContent = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 4rem 2rem 2rem;

  @media (max-width: 768px) {
    padding: 3rem 1.5rem 1.5rem;
  }
`;

// === 上半部分：网格布局 ===
const TopSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 4rem;
  padding-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

// 品牌区域
const BrandColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-column: 1 / -1;
    max-width: 100%;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 2rem;
    margin-bottom: 1rem;
  }
`;

const LogoLink = styled(Link)`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;

  &:hover {
    color: var(--accent-color);
  }
`;

const Slogan = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 320px;
  margin: 0;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialIcon = styled.a`
  color: var(--text-tertiary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--text-primary);
    transform: translateY(-1px);
  }
`;

// 链接列
const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ColumnTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLink = styled(Link)`
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  width: fit-content;

  &:hover {
    color: var(--accent-color);
  }
`;

const ExternalFooterLink = styled.a`
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  width: fit-content;

  &:hover {
    color: var(--accent-color);
  }
`;

// === 下半部分：底部栏 ===
const BottomBar = styled.div`
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem; /* 13px */
  color: var(--text-tertiary);

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 1.5rem;
    align-items: flex-start;
  }
`;

const CopyrightInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  a {
    color: var(--text-tertiary);
    &:hover {
      color: var(--text-secondary);
    }
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem;
  }
`;

const OnlineStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--text-secondary);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #10b981;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 1px solid #10b981;
      opacity: 0.4;
    }
  }
`;

// 数字时钟
const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span style={{ fontFamily: 'var(--font-mono)' }}>
      {time.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
      <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>
        {time.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' })}
      </span>
    </span>
  );
};

const Footer = () => {
  const { variants } = useAnimationEngine();
  const { onlineCount } = useOnlineUsers();
  const { siteSettings, loading } = useSiteSettings();

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const onlineUsersRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useClickOutside(tooltipRef, () => setIsTooltipVisible(false), {
    enabled: isTooltipVisible,
    excludeRefs: onlineUsersRef,
    excludeSelectors: ['[data-tooltip-container]'],
    useCapture: true,
    delay: 100,
  });

  if (loading) return null;

  return (
    <FooterContainer>
      <FooterContent>
        <TopSection>
          {/* 品牌栏 */}
          <BrandColumn>
            <LogoLink to="/">Turn of The Page</LogoLink>
            <Slogan>
              用代码丈量世界，以文字记录流年。
              <br />
              保持热爱，奔赴山海。
            </Slogan>
            <SocialIcons>
              <SocialIcon href={siteSettings?.socialLinks?.github} target="_blank" title="GitHub">
                <FiGithub size={18} />
              </SocialIcon>
              <SocialIcon href={`mailto:${siteSettings?.socialLinks?.email}`} title="Email">
                <FiMail size={18} />
              </SocialIcon>
              <SocialIcon href="/rss.xml" title="RSS">
                <FiRss size={18} />
              </SocialIcon>
            </SocialIcons>
          </BrandColumn>

          {/* 链接栏 1 */}
          <LinkColumn>
            <ColumnTitle>发现</ColumnTitle>
            <LinkList>
              <FooterLink to="/blog">博客文章</FooterLink>
              <FooterLink to="/notes">生活手记</FooterLink>
              <FooterLink to="/projects">我的项目</FooterLink>
            </LinkList>
          </LinkColumn>

          {/* 链接栏 2 */}
          <LinkColumn>
            <ColumnTitle>关于</ColumnTitle>
            <LinkList>
              <FooterLink to="/about-me">关于我</FooterLink>
              <FooterLink to="/about-site">关于本站</FooterLink>
              <FooterLink to="/friends">友情链接</FooterLink>
            </LinkList>
          </LinkColumn>

          {/* 链接栏 3 */}
          <LinkColumn>
            <ColumnTitle>更多</ColumnTitle>
            <LinkList>
              <FooterLink to="/guestbook">留言板</FooterLink>
              <ExternalFooterLink href="/sitemap.xml" target="_blank">
                网站地图
              </ExternalFooterLink>
              <ExternalFooterLink href="/rss.xml" target="_blank">
                RSS 订阅
              </ExternalFooterLink>
            </LinkList>
          </LinkColumn>
        </TopSection>

        <BottomBar>
          <CopyrightInfo>
            <div className="row">
              <span>
                &copy; {new Date().getFullYear()} {siteSettings?.authorName || 'Adnaan'}. All rights reserved.
              </span>
            </div>
            <div className="row">
              <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
                陇ICP备2025016896号
              </a>
              <span>·</span>
              <span>Designed with code & love</span>
            </div>
          </CopyrightInfo>

          <StatusInfo>
            <DigitalClock />

            <div style={{ position: 'relative' }}>
              <OnlineStatus
                ref={onlineUsersRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTooltipVisible((prev) => !prev);
                }}
              >
                <div className="dot" />
                <span>{onlineCount} 在线</span>
              </OnlineStatus>

              <div ref={tooltipRef}>
                <VisitorStatsTooltip
                  isVisible={isTooltipVisible}
                  targetRef={onlineUsersRef}
                  onlineCount={onlineCount}
                />
              </div>
            </div>
          </StatusInfo>
        </BottomBar>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
