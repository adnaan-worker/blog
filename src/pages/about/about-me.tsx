import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiGithub, FiMail, FiLink } from 'react-icons/fi';
import { SEO, WordCloud, type WordCloudItem } from '@/components/common';
import { personalInfo, skillTags, experiences, projects, contactInfo } from '@/data/about-me.data';
import type { ExperienceItem } from '@/data/about-me.data';
import { SPRING_PRESETS, useAnimationEngine, useSmartInView } from '@/utils/ui/animation';
import { formatDate } from '@/utils';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);

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
  margin-bottom: 2rem;
`;

const ProfileName = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.375rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ProfileTitle = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const ProfileSlogan = styled.div`
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-style: italic;
  margin-bottom: 1rem;
`;

const ProfileBio = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 1.5rem 0;
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
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(var(--accent-rgb), 0.05);
  }

  svg {
    font-size: 1rem;
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
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.4);
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
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

// 项目列表
const ProjectsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 3rem;
`;

const ProjectItem = styled(motion.div)`
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.4);
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
  flex-wrap: wrap;
`;

const ProjectTitle = styled.h3<{ $featured?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;

  &::after {
    content: ${(props) => (props.$featured ? '"⭐"' : '""')};
    margin-left: 0.5rem;
    font-size: 0.875rem;
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ProjectLink = styled.a`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;

  svg {
    font-size: 0.85rem;
  }

  &:hover {
    color: var(--accent-color);
  }
`;

const ProjectDesc = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 0.625rem 0;
`;

const ProjectTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const AboutMe: React.FC = () => {
  const { variants } = useAnimationEngine();

  const timelineView = useSmartInView({ amount: 0.1 });
  const projectsView = useSmartInView({ amount: 0.1 });

  // 转换技能数据为词云格式
  const skillWords: WordCloudItem[] = skillTags.map((skill) => ({
    text: skill.name,
    weight: skill.level === 'expert' ? 5 : skill.level === 'advanced' ? 4 : 3,
    category: skill.level,
  }));

  return (
    <>
      <SEO title="自述" description={personalInfo.bio} keywords="全栈开发,React,Node.js,个人简介" />
      <PageContainer>
        <LayoutGrid>
          {/* 左侧边栏 - 个人信息和技能 */}
          <Sidebar initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={SPRING_PRESETS.gentle}>
            {/* 个人信息 */}
            <ProfileCard>
              <ProfileName>{personalInfo.name}</ProfileName>
              <ProfileTitle>{personalInfo.title}</ProfileTitle>
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

            {/* 项目作品 */}
            <SectionTitle initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING_PRESETS.gentle}>
              项目作品
            </SectionTitle>
            <ProjectsList
              ref={projectsView.ref as React.RefObject<HTMLDivElement>}
              initial="hidden"
              animate={projectsView.isInView ? 'visible' : 'hidden'}
              variants={variants.stagger}
            >
              {projects.map((project) => (
                <ProjectItem key={project.id} variants={variants.listItem}>
                  <ProjectHeader>
                    <ProjectTitle $featured={project.featured}>{project.title}</ProjectTitle>
                    <ProjectLinks>
                      {project.link ? (
                        <ProjectLink href={project.link} target="_blank" rel="noopener noreferrer">
                          <FiLink />
                          <span>访问</span>
                        </ProjectLink>
                      ) : null}
                      {project.github ? (
                        <ProjectLink href={project.github} target="_blank" rel="noopener noreferrer">
                          <FiGithub />
                          <span>源码</span>
                        </ProjectLink>
                      ) : null}
                    </ProjectLinks>
                  </ProjectHeader>
                  <ProjectDesc>{project.description}</ProjectDesc>
                  <ProjectTags>
                    {project.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </ProjectTags>
                </ProjectItem>
              ))}
            </ProjectsList>
          </MainContent>
        </LayoutGrid>
      </PageContainer>
    </>
  );
};

export default AboutMe;
