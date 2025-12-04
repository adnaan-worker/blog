import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiMail, FiRss, FiHeart } from 'react-icons/fi';
import React, { useState, useRef, useEffect } from 'react';
import { useAnimationEngine } from '@/utils/ui/animation';
import { useOnlineUsers } from '@/hooks/useSocket';
import { useSiteSettings } from './index';
import VisitorStatsTooltip from '@/components/common/visitor-stats-tooltip';
import { useClickOutside } from '@/hooks';

// 使用motion组件增强动画效果
const MotionFooter = motion.footer;

const FooterContainer = styled(MotionFooter)`
  width: 100%;
  padding: 3rem 0 1.5rem;
  background: transparent;
  margin-top: 3rem;
  position: relative;
  border-top: 1px solid var(--border-color);
  z-index: 4;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// 使用自定义组件包装
const MotionLinkContainer = styled(motion.div)`
  display: inline-block;
`;

const StyledLink = styled(Link)`
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;

  &:hover {
    color: var(--accent-color);
    transform: translateX(3px);
  }

  &::before {
    content: '';
    width: 4px;
    height: 4px;
    background-color: var(--accent-color);
    opacity: 0.6;
    border-radius: 50%;
  }
`;

// 自定义Logo组件
const LogoContainer = styled(motion.div)`
  display: inline-block;
`;

const StyledLogo = styled(Link)`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);

  &:hover {
    color: var(--accent-color);
  }
`;

// 新的FooterLink组件
interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
  variants?: any;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children, variants, ...props }) => (
  <MotionLinkContainer variants={variants} {...props}>
    <StyledLink to={to}>{children}</StyledLink>
  </MotionLinkContainer>
);

// 新的FooterLogo组件
interface FooterLogoProps {
  to: string;
  children: React.ReactNode;
  variants?: any;
}

const FooterLogo: React.FC<FooterLogoProps> = ({ to, children, variants, ...props }) => (
  <LogoContainer variants={variants} {...props}>
    <StyledLogo to={to}>{children}</StyledLogo>
  </LogoContainer>
);

const FooterDescription = styled(motion.p)`
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 420px;
`;

const FooterRight = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLinkTitle = styled(motion.h4)`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.25rem;
    width: 24px;
    height: 2px;
    background: var(--accent-color);
    border-radius: 4px;
  }
`;

const FooterExternalLink = styled(motion.a)`
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;

  &:hover {
    color: var(--accent-color);
    transform: translateX(3px);
  }

  &::before {
    content: '';
    width: 4px;
    height: 4px;
    background-color: var(--accent-color);
    opacity: 0.6;
    border-radius: 50%;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 0.5rem;
`;

const SocialLink = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-color);
    background-color: rgba(81, 131, 245, 0.1);
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Copyright = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);

  a {
    color: var(--text-secondary);
    transition: color 0.2s ease;
    &:hover {
      color: var(--accent-color);
    }
  }
`;

const PoweredBy = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-wrap: wrap;

  a {
    color: var(--text-secondary);
    transition: color 0.2s ease;
    border-bottom: 1px dashed transparent;

    &:hover {
      color: var(--accent-color);
      border-bottom-color: var(--accent-color);
    }
  }

  .divider {
    color: var(--border-color);
    margin: 0 0.2rem;
  }
`;

const OnlineUsers = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(var(--accent-rgb), 0.04);
  border: 1px solid rgba(var(--accent-rgb), 0.08);
  border-radius: 14px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  height: 28px;
  white-space: nowrap;

  &:hover {
    background: rgba(var(--accent-rgb), 0.08);
    border-color: rgba(var(--accent-rgb), 0.2);
    color: var(--text-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -2px rgba(var(--accent-rgb), 0.12);
  }

  .pulse-dot {
    position: relative;
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;

    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      background: #10b981;
      opacity: 0.4;
      animation: ripple 1.5s infinite cubic-bezier(0, 0, 0.2, 1);
      z-index: -1;
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  .count {
    font-weight: 600;
    color: var(--accent-color);
    font-family: var(--font-mono);
    margin: 0 2px;
  }

  .full-text {
    display: inline;
  }

  .short-text {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 4px 10px;

    .full-text {
      display: none;
    }
    .short-text {
      display: inline;
    }
  }
`;

const Footer = () => {
  // 使用动画引擎
  const { variants, springPresets } = useAnimationEngine();

  // 使用在线人数Hook
  const { onlineCount } = useOnlineUsers();

  // 使用网站设置Hook - 增加加载状态检查
  const { siteSettings, loading } = useSiteSettings();

  // 访客统计 Tooltip 状态
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const onlineUsersRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 使用增强版 useClickOutside，排除触发器和 tooltip 本身
  useClickOutside(tooltipRef, () => setIsTooltipVisible(false), {
    enabled: isTooltipVisible,
    excludeRefs: onlineUsersRef,
    excludeSelectors: ['[data-tooltip-container]'],
    useCapture: true,
    delay: 100,
  });

  // 如果还在加载中，返回 null 或显示加载占位符
  if (loading) {
    return null;
  }

  // 动画变量 - 使用动画引擎的配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        ...springPresets.gentle,
      },
    },
  };

  const itemVariants = variants.fadeIn;

  return (
    <>
      <FooterContainer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <FooterContent>
          <FooterTop>
            <FooterLeft>
              <motion.div variants={itemVariants}>
                <FooterLogo to="/">Turn of The Page</FooterLogo>
              </motion.div>

              <motion.div variants={itemVariants}>
                <FooterDescription>
                  "分享编程知识、设计理念与生活感悟。一个记录思考与成长的空间，希望能为你带来一些启发和帮助。"
                </FooterDescription>
              </motion.div>

              <SocialLinks>
                <SocialLink
                  href={siteSettings?.socialLinks?.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="GitHub"
                >
                  <FiGithub size={18} />
                </SocialLink>
                <SocialLink
                  href={`mailto:${siteSettings?.socialLinks?.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Email"
                >
                  <FiMail size={18} />
                </SocialLink>
                <SocialLink
                  href="/rss.xml"
                  variants={itemVariants}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="RSS Feed"
                >
                  <FiRss size={18} />
                </SocialLink>
              </SocialLinks>
            </FooterLeft>

            <FooterRight>
              <FooterLinks>
                <motion.div variants={itemVariants}>
                  <FooterLinkTitle>导航</FooterLinkTitle>
                </motion.div>
                <FooterLink to="/" variants={itemVariants}>
                  首页
                </FooterLink>
                <FooterLink to="/blog" variants={itemVariants}>
                  博客
                </FooterLink>
                <FooterLink to="/notes" variants={itemVariants}>
                  手记
                </FooterLink>
                <FooterLink to="/projects" variants={itemVariants}>
                  项目
                </FooterLink>
                <FooterLink to="/profile" variants={itemVariants}>
                  个人中心
                </FooterLink>
              </FooterLinks>

              <FooterLinks>
                <motion.div variants={itemVariants}>
                  <FooterLinkTitle>关于</FooterLinkTitle>
                </motion.div>
                <FooterLink to="/about-me" variants={itemVariants}>
                  关于我
                </FooterLink>
                <FooterLink to="/about-site" variants={itemVariants}>
                  关于本站
                </FooterLink>
                <FooterLink to="/friends" variants={itemVariants}>
                  友情链接
                </FooterLink>
                <FooterExternalLink href="/sitemap.xml" target="_blank" variants={itemVariants}>
                  网站地图
                </FooterExternalLink>
                <FooterExternalLink href="/rss.xml" target="_blank" variants={itemVariants}>
                  RSS订阅
                </FooterExternalLink>
              </FooterLinks>
            </FooterRight>
          </FooterTop>

          <FooterBottom>
            <Copyright>
              <span>© {new Date().getFullYear()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Design by {siteSettings?.authorName || 'adnaan'}.
                <FiHeart style={{ color: 'var(--error-color)' }} size={12} />
              </span>
            </Copyright>
            <PoweredBy>
              {/* 在线人数显示 - 响应式文案 */}
              {onlineCount > 0 && (
                <>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <OnlineUsers
                      ref={onlineUsersRef}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      title={`当前有 ${onlineCount} 位访客在线`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTooltipVisible((prev) => !prev);
                      }}
                    >
                      <span className="pulse-dot" />
                      {/* 桌面端：完整文案 */}
                      <span className="full-text">
                        正在与 <span className="count">{onlineCount}</span> 位同路人共赏此刻
                      </span>
                      {/* 移动端：简短文案 */}
                      <span className="short-text">
                        与 <span className="count">{onlineCount}</span> 人同行
                      </span>
                    </OnlineUsers>

                    {/* 访客统计 Tooltip - 相对定位 */}
                    <div ref={tooltipRef}>
                      <VisitorStatsTooltip
                        isVisible={isTooltipVisible}
                        targetRef={onlineUsersRef}
                        onlineCount={onlineCount}
                      />
                    </div>
                  </div>
                  <span className="divider"></span>
                </>
              )}
              <span>
                由{' '}
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                  React
                </a>{' '}
                强力驱动
              </span>
              <span className="divider">|</span>
              <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
                陇ICP备2025016896号
              </a>
            </PoweredBy>
          </FooterBottom>
        </FooterContent>
      </FooterContainer>
    </>
  );
};

export default Footer;
