import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiMail, FiRss } from 'react-icons/fi';

// 使用motion组件增强动画效果
const MotionFooter = motion.footer;
const MotionDiv = motion.div;

const FooterContainer = styled(MotionFooter)`
  width: 100%;
  padding: 2rem 0 1rem;
  background: var(--bg-primary);
  margin-top: auto;
  position: relative;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const LinkGroup = styled(MotionDiv)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  a, span {
    color: var(--text-secondary);
    font-size: 0.85rem;
    position: relative;
    &:hover {
      color: var(--accent-color);
    }
  }
  
  span {
    color: var(--text-secondary);
    opacity: 0.6;
    margin-right: 0.2rem;
  }
  
  a:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -0.7rem;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--border-color);
  }
`;

const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.85rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const Copyright = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  opacity: 0.8;
  
  a {
    color: var(--text-secondary);
    transition: color 0.2s ease;
    &:hover {
      color: var(--accent-color);
    }
  }
  
  span {
    position: relative;
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -0.5rem;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background-color: var(--border-color);
    }
  }
`;

const PoweredBy = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.8;
  
  a {
    color: var(--accent-color);
    transition: color 0.2s ease;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const DirectorySection = styled.div`
  margin-bottom: 2rem;
`;

const DirectoryTitle = styled(motion.h3)`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 600;
`;

const DirectoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DirectoryItem = styled(motion(Link))`
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.25s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: var(--accent-color);
  }
  
  &::before {
    content: '•';
    color: var(--accent-color);
    opacity: 0.7;
  }
`;

const StatsDisplay = styled(motion.div)`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.6;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const SocialLink = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--accent-color);
    border-color: var(--accent-color);
    transform: translateY(-2px);
  }
`;

// 动画变量
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const Footer = () => {
  return (
    <FooterContainer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <FooterContent>
        <DirectorySection>
          <DirectoryTitle variants={itemVariants}>风向标</DirectoryTitle>
          <DirectoryGrid>
            <DirectoryItem to="/blog" variants={itemVariants} whileHover={{ x: 3 }}>文稿</DirectoryItem>
            <DirectoryItem to="/notes" variants={itemVariants} whileHover={{ x: 3 }}>手记</DirectoryItem>
            <DirectoryItem to="/timeline" variants={itemVariants} whileHover={{ x: 3 }}>度过的时光呀</DirectoryItem>
            <DirectoryItem to="/friends" variants={itemVariants} whileHover={{ x: 3 }}>朋友们</DirectoryItem>
            <DirectoryItem to="/thoughts" variants={itemVariants} whileHover={{ x: 3 }}>写下一点思考</DirectoryItem>
            <DirectoryItem to="/projects" variants={itemVariants} whileHover={{ x: 3 }}>看看我做些啥</DirectoryItem>
            <DirectoryItem to="/words" variants={itemVariants} whileHover={{ x: 3 }}>记录下一言</DirectoryItem>
            <DirectoryItem to="/blog" variants={itemVariants} whileHover={{ x: 3 }}>跃迁</DirectoryItem>
          </DirectoryGrid>
        </DirectorySection>
        
        <FooterLinks>
          <LinkGroup variants={itemVariants}>
            <span>关于</span>
            <Link to="/about">关于本站</Link>
            <Link to="/about/me">关于我</Link>
            <Link to="/projects">关于此项目</Link>
          </LinkGroup>
          
          <LinkGroup variants={itemVariants}>
            <span>更多</span>
            <Link to="/timeline">时间线</Link>
            <Link to="/friends">友链</Link>
            <Link to="/analytics">埋点监控</Link>
          </LinkGroup>
          
          <LinkGroup variants={itemVariants}>
            <span>联系</span>
            <Link to="/message">写留言</Link>
            <a href="mailto:example@example.com">发邮件</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          </LinkGroup>
          
          <SocialLinks>
            <SocialLink 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiGithub size={16} />
            </SocialLink>
            <SocialLink 
              href="mailto:example@example.com"
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiMail size={16} />
            </SocialLink>
            <SocialLink 
              href="/rss.xml"
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRss size={16} />
            </SocialLink>
          </SocialLinks>
        </FooterLinks>
        
        <FooterBottom>
          <Copyright>
            <span>© {new Date().getFullYear()} Innei</span>
            <a href="/rss.xml">RSS</a>
            <a href="/sitemap.xml">站点地图</a>
            <a href="/feed">订阅</a>
            <span>Stay hungry. Stay foolish.</span>
          </Copyright>
          
          <PoweredBy>
            Powered by <a href="#" target="_blank" rel="noopener noreferrer">Mix Space</a>&nbsp;&&nbsp;<a href="#" target="_blank" rel="noopener noreferrer">白い</a> | <a href="#" target="_blank" rel="noopener noreferrer">萌ICP备20236136号</a>
          </PoweredBy>
        </FooterBottom>
      </FooterContent>
      
      <StatsDisplay
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
      >
        正在被 {Math.floor(Math.random() * 10)} 人看爆
      </StatsDisplay>
    </FooterContainer>
  );
};

export default Footer;