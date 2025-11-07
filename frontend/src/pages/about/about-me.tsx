import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiGithub, FiMail, FiLink } from 'react-icons/fi';
import { SEO, WordCloud, type WordCloudItem } from '@/components/common';
import { personalInfo, skillTags, experiences, contactInfo } from '@/data/about-me.data';
import { SPRING_PRESETS, useAnimationEngine, useSmartInView } from '@/utils/ui/animation';
import { formatDate } from '@/utils';

// 页面头部渐变背景 - 流光溢彩诗意光晕 ✨
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 700px;
  width: 100%;
  overflow: hidden;
  z-index: 0;

  /* 三层光晕效果叠加 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    will-change: transform;
  }

  /* 第一层：主光晕 - 从左上方扩散 */
  &::before {
    background: radial-gradient(
      ellipse 160% 110% at 15% 10%,
      rgba(var(--accent-rgb), 0.38) 0%,
      rgba(var(--accent-rgb), 0.22) 25%,
      rgba(var(--accent-rgb), 0.08) 50%,
      transparent 75%
    );
    transform-origin: 15% 10%;
    animation: breatheGlow1 25s ease-in-out infinite;
  }

  /* 第二层：次光晕 - 从右上方流动 */
  &::after {
    background: radial-gradient(
      ellipse 140% 95% at 85% 15%,
      rgba(var(--accent-rgb), 0.32) 0%,
      rgba(var(--accent-rgb), 0.18) 30%,
      rgba(var(--accent-rgb), 0.06) 55%,
      transparent 80%
    );
    transform-origin: 85% 15%;
    animation: breatheGlow2 30s ease-in-out infinite;
    animation-delay: 8s;
  }

  /* 第三层：中央光晕 */
  & > div {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse 110% 80% at 50% 20%,
      rgba(var(--accent-rgb), 0.15) 0%,
      rgba(var(--accent-rgb), 0.08) 35%,
      transparent 65%
    );
    mix-blend-mode: screen;
    transform-origin: 50% 20%;
    animation: pulseGlow 20s ease-in-out infinite;
    animation-delay: 4s;
  }

  /* 整体渐变遮罩 */
  mask-image: radial-gradient(
    ellipse 90% 100% at 50% 0%,
    black 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 80%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 90% 100% at 50% 0%,
    black 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 80%
  );

  /* 呼吸动画 - 左侧光晕 */
  @keyframes breatheGlow1 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    33% {
      transform: scale(1.08) rotate(1deg);
      opacity: 0.92;
    }
    66% {
      transform: scale(0.96) rotate(-0.5deg);
      opacity: 0.96;
    }
  }

  /* 呼吸动画 - 右侧光晕 */
  @keyframes breatheGlow2 {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    40% {
      transform: scale(1.06) rotate(-1deg);
      opacity: 0.88;
    }
    75% {
      transform: scale(0.98) rotate(0.8deg);
      opacity: 0.94;
    }
  }

  /* 脉动动画 - 中央光晕 */
  @keyframes pulseGlow {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.65;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.35;
    }
  }

  @media (max-width: 768px) {
    height: 500px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    & > div {
      animation: none;
    }
  }
`;

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

// 左右分栏布局
const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// 左侧边栏 - 固定在顶部
const Sidebar = styled(motion.aside)`
  position: sticky;
  top: 80px;
  align-self: start;
  /* 移除固定高度和滚动条，让内容自然延伸 */
  overflow: visible;

  @media (max-width: 768px) {
    position: static;
  }
`;

// 个人信息卡片
const ProfileCard = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
`;

// 头像和基本信息容器
const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

// 头像
const Avatar = styled(motion.img)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(var(--accent-rgb), 0.2);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15);
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
  }
`;

// 姓名和标题容器
const ProfileNameTitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ProfileTitle = styled.div`
  font-size: 0.95rem;
  color: var(--accent-color);
  font-weight: 500;
  margin-bottom: 0;
`;

const ProfileSlogan = styled.div`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  font-style: italic;
  margin-bottom: 1rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--accent-color);
  opacity: 0.8;
`;

const ProfileBio = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
`;

// 社交链接
const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;

  &:hover {
    color: var(--accent-color);
    border-bottom-color: var(--accent-color);
    transform: translateX(4px);
  }

  svg {
    font-size: 1.1rem;
    color: var(--accent-color);
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  &:hover svg {
    opacity: 1;
  }
`;

// 侧边栏分区
const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SidebarSectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// 联系方式
const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const ContactItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContactLabel = styled.div`
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContactValue = styled.div`
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 500;
`;

// 主内容区
const MainContent = styled.main`
  min-width: 0;
`;

// 分区标题
const SectionTitle = styled(motion.h2)`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: var(--text-primary);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);

  &:not(:first-of-type) {
    margin-top: 3rem;

    @media (max-width: 768px) {
      margin-top: 2rem;
    }
  }

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

// 经历列表
const TimelineList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 3rem;
`;

const TimelineItem = styled(motion.div)`
  padding: 1.5rem 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
  position: relative;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.75rem;
    width: 8px;
    height: 8px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    left: 3.5px;
    top: 2.5rem;
    bottom: -1.5rem;
    width: 1px;
    background: linear-gradient(
      180deg,
      rgba(var(--accent-rgb, 81, 131, 245), 0.3) 0%,
      rgba(var(--accent-rgb, 81, 131, 245), 0.1) 50%,
      transparent 100%
    );
  }

  &:last-child::after {
    display: none;
  }

  &:hover {
    padding-left: 2rem;
    background: rgba(var(--accent-rgb, 81, 131, 245), 0.02);

    &::before {
      opacity: 1;
      transform: scale(1.3);
      box-shadow: 0 0 0 4px rgba(var(--accent-rgb, 81, 131, 245), 0.1);
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
  flex-wrap: wrap;
`;

const TimelineDate = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 500;
`;

const TimelineTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
`;

const TimelineBadge = styled.span<{ type: string }>`
  padding: 0.2rem 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: ${(props) => {
    switch (props.type) {
      case 'work':
        return 'var(--accent-color)';
      case 'education':
        return '#10b981';
      case 'project':
        return '#f59e0b';
      default:
        return 'var(--accent-color)';
    }
  }};
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const TimelineCompany = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const TimelineDesc = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 0.625rem 0;
`;

const TimelineAchievements = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
`;

const TimelineAchievement = styled.li`
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 1rem;
  position: relative;
  margin-bottom: 0.25rem;

  &::before {
    content: '–';
    position: absolute;
    left: 0;
    color: var(--text-tertiary);
  }
`;

const TimelineTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  color: var(--accent-color);
  font-size: 0.7rem;
  opacity: 0.75;

  &::before {
    content: '#';
    opacity: 0.6;
    margin-right: 0.1em;
  }
`;

const AboutMe: React.FC = () => {
  const { variants } = useAnimationEngine();

  const timelineView = useSmartInView({ amount: 0.1 });

  // 转换技能数据为词云格式
  const skillWords: WordCloudItem[] = skillTags.map((skill) => ({
    text: skill.name,
    weight: skill.level === 'expert' ? 5 : skill.level === 'advanced' ? 4 : 3,
    category: skill.level,
  }));

  return (
    <>
      <SEO title="自述" description={personalInfo.bio} keywords="全栈开发,React,Node.js,个人简介" />

      {/* 流光溢彩背景 ✨ */}
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}
        initial={{ opacity: 0, y: -100, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={SPRING_PRESETS.gentle}
      >
        <PageHeadGradient>
          {/* 第三层中央光晕 */}
          <div />
        </PageHeadGradient>
      </motion.div>

      <PageContainer>
        <LayoutGrid>
          {/* 左侧边栏 - 个人信息和技能 */}
          <Sidebar initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING_PRESETS.gentle}>
            {/* 个人信息 */}
            <ProfileCard>
              <ProfileHeader>
                <Avatar
                  src={personalInfo.avatar}
                  alt={personalInfo.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, ...SPRING_PRESETS.gentle }}
                  whileHover={{ scale: 1.05 }}
                />
                <ProfileNameTitleWrapper>
                  <ProfileName>{personalInfo.name}</ProfileName>
                  <ProfileTitle>{personalInfo.title}</ProfileTitle>
                </ProfileNameTitleWrapper>
              </ProfileHeader>
              <ProfileSlogan>"{personalInfo.slogan}"</ProfileSlogan>
              <ProfileBio>{personalInfo.bio}</ProfileBio>
            </ProfileCard>

            {/* 社交链接 */}
            <SocialLinks>
              <SocialLink href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                <FiGithub />
                <span>GitHub</span>
              </SocialLink>
              <SocialLink href={`mailto:${personalInfo.email}`}>
                <FiMail />
                <span>Email</span>
              </SocialLink>
              <SocialLink href={personalInfo.website} target="_blank" rel="noopener noreferrer">
                <FiLink />
                <span>Website</span>
              </SocialLink>
            </SocialLinks>

            {/* 技能词云 */}
            <SidebarSection>
              <SidebarSectionTitle>技能特长</SidebarSectionTitle>
              <WordCloud words={skillWords} minFontSize={0.8} maxFontSize={1.6} />
            </SidebarSection>

            {/* 联系方式 */}
            <SidebarSection>
              <SidebarSectionTitle>联系方式</SidebarSectionTitle>
              <ContactList>
                {contactInfo.map((contact) => (
                  <ContactItem key={contact.id}>
                    <ContactLabel>{contact.label}</ContactLabel>
                    <ContactValue>{contact.value}</ContactValue>
                  </ContactItem>
                ))}
              </ContactList>
            </SidebarSection>
          </Sidebar>

          {/* 右侧主内容 - 经历和项目 */}
          <MainContent>
            {/* 工作经历 */}
            <SectionTitle
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, ...SPRING_PRESETS.gentle }}
            >
              工作与学习经历
            </SectionTitle>
            <TimelineList
              ref={timelineView.ref as React.RefObject<HTMLDivElement>}
              initial="hidden"
              animate={timelineView.isInView ? 'visible' : 'hidden'}
              variants={variants.stagger}
            >
              {experiences.map((exp) => (
                <TimelineItem key={exp.id} variants={variants.listItem}>
                  <TimelineHeader>
                    <TimelineDate>{formatDate(exp.date, 'YYYY-MM')}</TimelineDate>
                    <TimelineTitle>
                      {exp.type === 'work' ? exp.position : exp.type === 'education' ? exp.degree : exp.position}
                    </TimelineTitle>
                    <TimelineBadge type={exp.type}>
                      {exp.type === 'work' ? '工作' : exp.type === 'education' ? '教育' : '项目'}
                    </TimelineBadge>
                  </TimelineHeader>
                  <TimelineCompany>
                    {exp.type === 'work' ? exp.company : exp.type === 'education' ? exp.institution : exp.company}
                  </TimelineCompany>
                  <TimelineDesc>{exp.description}</TimelineDesc>
                  {exp.achievements && exp.achievements.length > 0 && (
                    <TimelineAchievements>
                      {exp.achievements.map((achievement, idx) => (
                        <TimelineAchievement key={idx}>{achievement}</TimelineAchievement>
                      ))}
                    </TimelineAchievements>
                  )}
                  {exp.tags && exp.tags.length > 0 && (
                    <TimelineTags>
                      {exp.tags.map((tag, idx) => (
                        <Tag key={idx}>{tag}</Tag>
                      ))}
                    </TimelineTags>
                  )}
                </TimelineItem>
              ))}
            </TimelineList>
          </MainContent>
        </LayoutGrid>
      </PageContainer>
    </>
  );
};

export default AboutMe;
