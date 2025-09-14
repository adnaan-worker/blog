import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import ErrorImage from '@/assets/images/image-error.png';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiMessageCircle,
  FiGithub,
  FiMail,
  FiExternalLink,
  FiStar,
  FiFolderPlus,
  FiCode,
} from 'react-icons/fi';

// 使用motion直接访问组件
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionH2 = motion.h2;
const MotionP = motion.p;
const MotionSpan = motion.span;

// 动画变体定义
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const iconVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
`;

// 添加首屏容器
const HeroSection = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;

  @media (max-width: 768px) {
    min-height: 100vh;

    padding-bottom: 2rem;
  }
`;

const Hero = styled(MotionDiv)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
  }
`;

const HeroContent = styled(MotionDiv)`
  max-width: 800px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -30px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, var(--accent-color-alpha) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
    z-index: -1;
    filter: blur(10px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: -60px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(var(--gradient-to), 0.08) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
    filter: blur(20px);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    text-align: center;
    order: 2;
    padding: 0;

    &::before {
      left: 50%;
      transform: translateX(-50%);
    }

    &::after {
      right: 50%;
      transform: translateX(50%);
      width: 120px;
      height: 120px;
    }
  }
`;

const HeroImage = styled(MotionDiv)`
  width: 320px;
  height: 450px;
  position: relative;
  z-index: 1;
  perspective: 1000px;

  @media (max-width: 768px) {
    width: 280px;
    height: 380px;
    order: 1;
    margin-bottom: 1rem;
  }
`;

const ProfileCard = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--accent-color-alpha);
  cursor: pointer;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px var(--accent-color-alpha);
  }

  &.flipped {
    transform: rotateY(180deg);
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(81, 131, 245, 0.1) 100%);
  border: 1px solid rgba(81, 131, 245, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  transform: rotateY(0deg);

  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.5) 0%, rgba(81, 131, 245, 0.15) 100%);
    border: 1px solid rgba(81, 131, 245, 0.2);
  }
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(135deg, rgba(81, 131, 245, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(81, 131, 245, 0.1);
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  padding: 1.2rem 1rem;
  overflow-y: auto;

  [data-theme='dark'] & {
    background: linear-gradient(135deg, rgba(81, 131, 245, 0.15) 0%, rgba(30, 30, 30, 0.5) 100%);
    border: 1px solid rgba(81, 131, 245, 0.2);
  }
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(81, 131, 245, 0.3);
  margin-bottom: 1.2rem;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }
`;

const ProfileName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-color-assistant));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
`;

const ProfileTitle = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1.2rem;
  text-align: center;
`;

const ProfileInfoList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ProfileInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px dashed var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  span:first-of-type {
    color: var(--text-secondary);
  }

  span:last-of-type {
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 0.4rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    border-radius: 3px;
  }
`;

const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.7rem;
  margin-bottom: 1.5rem;
`;

const SkillItem = styled.span`
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  background: rgba(81, 131, 245, 0.1);
  border-radius: 4px;
  color: var(--accent-color);

  [data-theme='dark'] & {
    background: rgba(81, 131, 245, 0.15);
  }
`;

const CardFlipHint = styled.div`
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Title = styled(MotionH1)`
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.5px;
  line-height: 1.1;

  &:after {
    content: '';
    display: block;
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 40px;
    height: 4px;
    background: var(--accent-color);
    border-radius: 2px;
    transform: translateY(20px);
    opacity: 0;

    @media (max-width: 768px) {
      left: 50%;
      transform: translateX(-50%) translateY(20px);
    }
  }

  .wave {
    display: inline-block;
    animation: wave 2.5s ease-in-out infinite;
    transform-origin: 70% 70%;
  }

  @keyframes wave {
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(14deg);
    }
    20% {
      transform: rotate(-8deg);
    }
    30% {
      transform: rotate(14deg);
    }
    40% {
      transform: rotate(-4deg);
    }
    50% {
      transform: rotate(10deg);
    }
    60% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    justify-content: center;
  }
`;

const Subtitle = styled(MotionH2)`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  line-height: 1.3;
  position: relative;

  code {
    font-family: var(--font-code);
    background: rgba(81, 131, 245, 0.08);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.85em;
    margin-left: 0.5em;
    border: 1px solid rgba(81, 131, 245, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Description = styled(MotionP)`
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 90%;

  span {
    position: relative;
    display: inline-block;
    padding: 0.2em 0;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-color), transparent);
      opacity: 0.3;
    }
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SocialLinks = styled(MotionDiv)`
  display: flex;
  gap: 0.85rem;
  margin-top: 5rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: -1rem;
    left: 0;
    width: 3rem;
    height: 1px;
    background: var(--border-color);

    @media (max-width: 768px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled(motion.a)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: var(--accent-color);
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: inset 0 0 0 1px rgba(81, 131, 245, 0.1);
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Quote = styled(MotionDiv)`
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
  text-align: center;
  padding: 1rem 0;
  margin-bottom: 0.5rem;
`;

// 新增滚动指示器组件
const ScrollIndicator = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  width: 100%;
  color: var(--text-secondary);
  opacity: 0.7;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5rem;

  svg {
    width: 28px;
    height: 40px;
  }

  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    svg {
      width: 24px;
      height: 32px;
    }
  }
`;

const mouseScrollVariants = {
  initial: { opacity: 0.5, y: 0 },
  animate: {
    opacity: [0.5, 1, 0.5],
    y: [0, 5, 0],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

const scrollWheelVariants = {
  initial: { opacity: 0.5, scaleY: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scaleY: [1, 0.7, 1],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
      delay: 0.2,
    },
  },
};

const SectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1.25rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  a {
    font-size: 0.85rem;
    color: var(--accent-color);
    display: flex;
    align-items: center;
    gap: 0.3rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const ArticleGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: 0 8px 30px rgba(81, 131, 245, 0.1);
    transform: translateY(-3px);
  }
`;

const ArticleImage = styled.div`
  height: 160px;
  background-color: var(--bg-secondary);
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  ${ArticleCard}:hover & img {
    transform: scale(1.08);
  }
`;

const ArticleContent = styled.div`
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ArticleTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  color: var(--text-primary);
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.7rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const ArticleExcerpt = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const ReadMore = styled(MotionSpan)`
  font-size: 0.85rem;
  color: var(--accent-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: auto;
  font-weight: 500;

  svg {
    transition: transform 0.2s ease;
  }

  ${ArticleCard}:hover & svg {
    transform: translateX(4px);
  }
`;

const ActivitySection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const ActivityList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: 0 8px 24px rgba(81, 131, 245, 0.08);
    transform: translateY(-2px) scale(1.01);
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  flex-shrink: 0;
  font-size: 0.9rem;
  border: 1px solid rgba(81, 131, 245, 0.15);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.3rem;

  a {
    color: var(--accent-color);

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const ChartSection = styled(motion.section)`
  margin: 2.5rem 0;
`;

const ChartContainer = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  [data-theme='dark'] & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Chart = styled.div`
  height: 100px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  margin-top: 1rem;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-color);
    opacity: 0.6;
  }
`;

const ChartBar = styled(motion.div)<{ height: number }>`
  width: 6px;
  height: ${(props) => props.height}%;
  background-color: var(--accent-color);
  border-radius: 3px 3px 0 0;
  opacity: 0.8;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    opacity: 1;
    transform: scaleY(1.05);
    background-color: var(--accent-color);
  }
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
`;

// 文章卡片动画变体
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

// 活动项目动画变体
const activityVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// 图表条动画变体
const barVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: (custom) => ({
    scaleY: 1,
    transition: {
      duration: 0.5,
      delay: custom * 0.05,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

// 添加开源项目相关的样式组件
const ProjectsSection = styled(motion.section)`
  margin: 3rem 0 4rem;
`;

const ProjectsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    box-shadow: 0 10px 30px rgba(81, 131, 245, 0.1);
    transform: translateY(-5px);
    border-color: rgba(81, 131, 245, 0.2);
  }
`;

const ProjectHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ProjectIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-color-alpha) 0%, var(--accent-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const ProjectTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
`;

const ProjectContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const ProjectMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const ProjectLanguage = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => props.color};
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ProjectLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &.primary {
    background-color: var(--accent-color);
    color: white;

    &:hover {
      background-color: var(--accent-color-hover);
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background-color: var(--bg-secondary);
    color: var(--text-secondary);

    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      transform: translateY(-2px);
    }
  }

  svg {
    margin-right: 0.3rem;
  }
`;

// 添加演示项目数据
const mockProjects = [
  {
    id: 1,
    title: 'React Native UI Kit',
    description: '一个高度可定制的UI组件库，为React Native应用提供美观且易用的界面元素。支持深色模式和RTL布局。',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 432,
    forks: 89,
    lastUpdated: '3天前',
    repoUrl: 'https://github.com/adnaan/react-native-ui-kit',
    demoUrl: 'https://example.com/demo',
    icon: 'components',
  },
  {
    id: 2,
    title: 'NodeJS API Starter',
    description:
      'Express和TypeScript打造的API启动模板，集成了认证、权限管理、日志记录和自动化测试。快速启动你的Node.js后端项目。',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    stars: 257,
    forks: 63,
    lastUpdated: '1周前',
    repoUrl: 'https://github.com/adnaan/node-api-starter',
    demoUrl: 'https://example.com/node-api',
    icon: 'server',
  },
  {
    id: 3,
    title: 'ByteBlogs CMS',
    description: '专为开发者设计的轻量级内容管理系统，支持Markdown编辑、代码高亮和版本控制。适合技术博客和文档网站。',
    language: 'Vue',
    languageColor: '#41b883',
    stars: 189,
    forks: 41,
    lastUpdated: '2周前',
    repoUrl: 'https://github.com/adnaan/byte-blogs',
    demoUrl: 'https://example.com/byte-blogs',
    icon: 'blog',
  },
];

// 项目卡片动画变体
const projectVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

// 示例数据
// 将使用真实 API 数据替换
const mockArticles = [
  {
    id: 1,
    title: '使用React Native Screens 和 Native Navigation 提升应用性能',
    date: '2025-3-10',
    category: '技术',
    views: 630,
    excerpt: '探索如何利用React Native Screens和Native Navigation优化应用性能，减少启动时间。',
    image: '3',
  },
  {
    id: 2,
    title: 'React Native 构建WebView与原生的深度集成',
    date: '2025-3-5',
    category: '开发',
    views: 415,
    excerpt: '详解React Native WebView组件与原生模块的集成方式，实现更流畅的用户体验。',
    image: '2',
  },
  {
    id: 3,
    title: '在Expo中使用原生模块的完整指南',
    date: '2025-2-28',
    category: '教程',
    views: 527,
    excerpt: '一步步教你如何在Expo项目中集成和使用原生模块，突破Expo的限制。',
    image: '1',
  },
];

const mockActivities = [
  {
    id: 1,
    type: 'comment',
    title: '在《Monthly Issue - 2025.3》中发表了评论',
    time: '3天前',
  },
  {
    id: 2,
    type: 'post',
    title: '发布了新文章《使用React Native Screens 和 Native Navigation 提升应用性能》',
    time: '6天前',
  },
  {
    id: 3,
    type: 'like',
    title: '赞了文章《应用性能优化的12个技巧》',
    time: '1周前',
  },
];

const chartData = [
  { month: '2025.5', value: 35 },
  { month: '2025.6', value: 42 },
  { month: '2025.7', value: 55 },
  { month: '2025.8', value: 40 },
  { month: '2025.9', value: 68 },
  { month: '2025.10', value: 75 },
  { month: '2025.11', value: 82 },
  { month: '2025.12', value: 90 },
  { month: '2026.1', value: 60 },
  { month: '2026.2', value: 78 },
  { month: '2026.3', value: 65 },
  { month: '2026.4', value: 92 },
];

// 项目图标渲染函数
const renderProjectIcon = (iconType: string) => {
  switch (iconType) {
    case 'components':
      return <FiCode size={20} />;
    case 'server':
      return <FiFolderPlus size={20} />;
    case 'blog':
      return <FiCalendar size={20} />;
    default:
      return <FiCode size={20} />;
  }
};

// 添加自定义ArticleLink组件
interface ArticleLinkProps {
  to: string;
  children: React.ReactNode;
  variants?: any;
  custom?: any;
  whileHover?: any;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({ to, children, ...props }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <ArticleCard {...props}>{children}</ArticleCard>
  </Link>
);

const SkillTags = styled(motion.div)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  gap: 0.8rem;
  opacity: 0.85;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

// 组件
const Home = () => {
  // 卡片翻转状态
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <PageContainer>
        <HeroSection>
          <Hero>
            <HeroContent variants={staggerContainerVariants} initial="hidden" animate="visible">
              <Title variants={fadeInUpVariants}>
                欢迎踏入代码与创意交织的<span style={{ color: 'var(--accent-color)' }}>奇幻宇宙</span>
                <motion.span
                  className="wave"
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'inline-block',
                    fontSize: '0.8em',
                  }}
                >
                  🌌
                </motion.span>
              </Title>

              <Subtitle variants={fadeInUpVariants}>
                <span
                  style={{
                    background: 'linear-gradient(90deg, rgb(var(--gradient-from)), rgb(var(--gradient-to)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    position: 'relative',
                  }}
                >
                  在代码与设计的交界，创造数字诗篇
                </span>{' '}
                <code style={{ color: 'var(--accent-color)' }}>@adnaan</code>
              </Subtitle>

              <Description variants={fadeInUpVariants}>
                我是<strong style={{ color: 'var(--accent-color)' }}>全栈工程师</strong>与
                <strong style={{ color: 'var(--accent-color)' }}>UI/UX爱好者</strong>，专注于构建美观且高性能的Web体验。
                <br />
                <span style={{ fontSize: '0.9em', opacity: 0.9 }}>「每一行代码都有诗意，每一个像素都有故事」</span>
              </Description>

              <SkillTags variants={fadeInUpVariants}>
                <span>
                  <FiCode size={14} /> 开发者
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17H12.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{' '}
                  设计爱好者
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.59 13.51L15.42 17.49"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.41 6.51L8.59 10.49"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{' '}
                  终身学习者
                </span>
              </SkillTags>

              <SocialLinks variants={staggerContainerVariants}>
                <SocialLink
                  href="mailto:example@example.com"
                  aria-label="Email"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMail />
                </SocialLink>
                <SocialLink
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiGithub />
                </SocialLink>
                <SocialLink
                  href="https://bilibili.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bilibili"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(var(--gradient-from), 0.08), rgba(var(--gradient-to), 0.08))',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906L17.813 4.653z" />
                  </svg>
                </SocialLink>
                <SocialLink
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.325.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
                  </svg>
                </SocialLink>
                <SocialLink
                  href="/rss.xml"
                  aria-label="RSS Feed"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 20.001C19 11.729 12.271 5 4 5v2c7.168 0 13 5.832 13 13.001h2z"></path>
                    <path d="M12 20.001h2C14 14.486 9.514 10 4 10v2c4.411 0 8 3.589 8 8.001z"></path>
                    <circle cx="6" cy="18" r="2"></circle>
                  </svg>
                </SocialLink>
              </SocialLinks>
            </HeroContent>

            <HeroImage
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="card-container"
            >
              <ProfileCard className={isFlipped ? 'flipped' : ''} onClick={handleCardFlip}>
                <CardFront className="card-face">
                  <ProfileImage>
                    <img
                      src="https://foruda.gitee.com/avatar/1745582574310382271/5352827_adnaan_1745582574.png!avatar100"
                      alt="Adnaan"
                    />
                  </ProfileImage>
                  <ProfileName>adnaan</ProfileName>
                  <ProfileTitle>Web 全栈开发者 & 设计爱好者</ProfileTitle>

                  <ProfileInfoList>
                    <ProfileInfoItem>
                      <span>MBTI</span>
                      <span>INFJ-T</span>
                    </ProfileInfoItem>
                    <ProfileInfoItem>
                      <span>地点</span>
                      <span>大连, 中国</span>
                    </ProfileInfoItem>
                    <ProfileInfoItem>
                      <span>职业</span>
                      <span>全栈开发者</span>
                    </ProfileInfoItem>
                    <ProfileInfoItem>
                      <span>技能</span>
                      <span>Vue, React, Node.js, Python, Java</span>
                    </ProfileInfoItem>
                  </ProfileInfoList>

                  <CardFlipHint>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                    </svg>
                    点击翻转
                  </CardFlipHint>
                </CardFront>

                <CardBack className="card-face card-back">
                  <CardTitle>关于我</CardTitle>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      marginBottom: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    热衷于探索前沿Web技术，专注于打造流畅优雅的用户界面和交互体验，善于将设计理念转化为精美的代码实现。
                  </p>

                  <CardTitle>技能标签</CardTitle>
                  <SkillList>
                    <SkillItem>React</SkillItem>
                    <SkillItem>Node.js</SkillItem>
                    <SkillItem>TypeScript</SkillItem>
                    <SkillItem>MongoDB</SkillItem>
                    <SkillItem>UI设计</SkillItem>
                  </SkillList>

                  <CardFlipHint>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                    返回正面
                  </CardFlipHint>
                </CardBack>
              </ProfileCard>
            </HeroImage>
          </Hero>

          <Quote initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ duration: 0.8, delay: 0.5 }}>
            请保持理性，冰冷的数字总是比七彩门的炫法走得更久。 —— 猴哥蔡嵩
          </Quote>

          {/* 滚动指示器 */}
          <ScrollIndicator>
            <motion.div initial="initial" animate="animate" variants={mouseScrollVariants}>
              <svg viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="26" height="38" rx="13" stroke="currentColor" strokeWidth="2" />
                <motion.rect
                  x="12"
                  y="10"
                  width="4"
                  height="8"
                  rx="2"
                  fill="currentColor"
                  variants={scrollWheelVariants}
                />
              </svg>
            </motion.div>
          </ScrollIndicator>
        </HeroSection>

        {/* 文章部分 */}
        <ContentSection
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <SectionTitle variants={fadeInUpVariants}>
            最近更新的文稿
            <motion.a href="/blog" whileHover={{ x: 5 }} variants={fadeInUpVariants}>
              查看全部 <FiArrowRight size={12} />
            </motion.a>
          </SectionTitle>

          <ArticleGrid variants={staggerContainerVariants}>
            {/* TODO: 替换为真实 API 数据 */}
            {mockArticles.map((article, index) => (
              <ArticleLink
                to={`/blog/${article.id}`}
                key={article.id}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                custom={index}
              >
                <ArticleImage>
                  <img
                    src={article.image}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.src = ErrorImage;
                    }}
                  />
                </ArticleImage>
                <ArticleContent>
                  <ArticleTitle>{article.title}</ArticleTitle>
                  <ArticleMeta>
                    <span>
                      <FiCalendar size={12} /> {article.date}
                    </span>
                    <span>
                      <FiClock size={12} /> {article.views} 次阅读
                    </span>
                  </ArticleMeta>
                  <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
                  <ReadMore>
                    阅读更多 <FiArrowRight size={12} />
                  </ReadMore>
                </ArticleContent>
              </ArticleLink>
            ))}
          </ArticleGrid>
        </ContentSection>

        {/* 活动部分 */}
        <ActivitySection
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <SectionTitle variants={fadeInUpVariants}>
            最近发生的事
            <motion.a href="/activities" whileHover={{ x: 5 }} variants={fadeInUpVariants}>
              查看全部 <FiArrowRight size={12} />
            </motion.a>
          </SectionTitle>

          <ActivityList variants={staggerContainerVariants}>
            {mockActivities.map((activity, index) => (
              <ActivityItem key={activity.id} variants={activityVariants} custom={index} whileHover={{ y: -3, x: 3 }}>
                <ActivityIcon>
                  {activity.type === 'comment' && <FiMessageCircle size={16} />}
                  {activity.type === 'post' && <FiCalendar size={16} />}
                  {activity.type === 'like' && <span>❤️</span>}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        </ActivitySection>

        {/* 图表部分 */}
        <ChartSection
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <SectionTitle variants={fadeInUpVariants}>热力图</SectionTitle>

          <ChartContainer variants={fadeInUpVariants} whileHover={{ y: -3 }}>
            <Chart>
              {chartData.map((item, index) => (
                <ChartBar
                  key={index}
                  height={item.value}
                  custom={index}
                  variants={barVariants}
                  whileHover={{ scaleY: 1.2, opacity: 1 }}
                />
              ))}
            </Chart>
            <ChartLabels>
              {chartData.map((item, index) => index % 3 === 0 && <span key={index}>{item.month}</span>)}
            </ChartLabels>
          </ChartContainer>
        </ChartSection>

        {/* 项目部分 */}
        <ProjectsSection
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerVariants}
        >
          <SectionTitle variants={fadeInUpVariants}>
            开源项目
            <motion.a href="/projects" whileHover={{ x: 5 }} variants={fadeInUpVariants}>
              查看全部 <FiArrowRight size={12} />
            </motion.a>
          </SectionTitle>

          <ProjectsGrid>
            {mockProjects.map((project, index) => (
              <ProjectCard key={project.id} variants={projectVariants} custom={index} whileHover={{ y: -5 }}>
                <ProjectHeader>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <ProjectIcon>{renderProjectIcon(project.icon)}</ProjectIcon>
                </ProjectHeader>

                <ProjectContent>
                  <ProjectDescription>{project.description}</ProjectDescription>

                  <ProjectMeta>
                    <ProjectLanguage color={project.languageColor}>{project.language}</ProjectLanguage>
                    <ProjectMetaItem>
                      <FiStar size={14} /> {project.stars}
                    </ProjectMetaItem>
                    <ProjectMetaItem>
                      <FiGithub size={14} /> {project.forks}
                    </ProjectMetaItem>
                  </ProjectMeta>

                  <ProjectLinks>
                    <ProjectLink href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="primary">
                      <FiGithub size={14} /> 查看源码
                    </ProjectLink>
                    <ProjectLink href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="secondary">
                      <FiExternalLink size={14} /> 演示
                    </ProjectLink>
                  </ProjectLinks>
                </ProjectContent>
              </ProjectCard>
            ))}
          </ProjectsGrid>
        </ProjectsSection>
      </PageContainer>
    </>
  );
};

export default Home;
