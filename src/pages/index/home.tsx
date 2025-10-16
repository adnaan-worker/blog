import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  FiLoader,
} from 'react-icons/fi';
import { API, SiteSettings, UserActivity, Project } from '@/utils/api';
import { formatDate } from '@/utils';
import { useAnimationOptimization } from '@/utils/animation-utils';
import { variants as animationVariants, gpuAcceleration, hoverScale } from '@/utils/animation-config';
import { RadarChart } from '@/components/common/RadarChart';
import { Icon } from '@/components/common/Icon';
import { getLanguageIcon, calculateProjectRadarData } from '@/utils/language-icons';

// 使用motion直接访问组件
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionH2 = motion.h2;
const MotionP = motion.p;
const MotionSpan = motion.span;

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--max-width);
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
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 16px;
  box-shadow: 0 8px 24px var(--accent-color-alpha);
  cursor: pointer;

  /* 性能优化 - 但不影响3D翻转 */
  will-change: transform;

  &:hover:not(.flipped) {
    transform: translateY(-8px) translateZ(0);
    box-shadow: 0 12px 28px var(--accent-color-alpha);
  }

  &.flipped {
    transform: rotateY(180deg) translateZ(0);
  }

  /* 确保翻转动画始终工作，即使有减少动画偏好 */
  @media (prefers-reduced-motion: reduce) {
    &.flipped {
      transform: rotateY(180deg) translateZ(0);
    }
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

const mouseScrollVariants: Variants = {
  initial: { opacity: 0.5, y: 0 },
  animate: {
    opacity: [0.5, 1, 0.5],
    y: [0, 5, 0],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const scrollWheelVariants: Variants = {
  initial: { opacity: 0.5, scaleY: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scaleY: [1, 0.7, 1],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
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

  /* 为标题添加装饰线 */
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    border-radius: 3px;
  }
`;

// 简洁居中标题容器
const CreativeSectionHeader = styled.div`
  text-align: center;
  margin: 3.5rem 0 2.5rem;

  @media (max-width: 768px) {
    margin: 2.5rem 0 2rem;
  }
`;

// 主标题
const CreativeSectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

// 副标题
const SectionSubtitle = styled(motion.p)`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const ArticleGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ArticleCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  transition: all 0.2s ease;
  position: relative;

  /* 左侧彩色指示点 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &:hover {
    &::before {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  [data-theme='dark'] & {
    border-bottom-color: rgba(75, 85, 99, 0.5);
  }
`;

const ArticleContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 1.2rem;

  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const ArticleTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.2s ease;

  ${ArticleCard}:hover & {
    color: var(--accent-color);
  }
`;

const ArticleTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 400;
  opacity: 0.7;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-left: 1rem;
  }
`;

// 两栏布局样式
const TwoColumnLayout = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 4rem;
  margin-bottom: 2.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 350px;
    gap: 3rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

// 活动滚动容器
const ActivityScrollContainer = styled.div`
  position: relative;
  max-height: 400px;
  overflow: hidden;
`;

// 活动相关样式
const ActivityGrid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 0;
  margin: -20px 0;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }
`;

// 虚化遮罩层
const FadeMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 2;

  &.top {
    top: 0;
    height: 30px;
    background: linear-gradient(
      180deg,
      var(--bg-primary) 0%,
      rgba(var(--bg-primary-rgb, 255, 255, 255), 0.9) 40%,
      rgba(var(--bg-primary-rgb, 255, 255, 255), 0.3) 80%,
      transparent 100%
    );
  }

  &.bottom {
    bottom: 0;
    height: 30px;
    background: linear-gradient(
      0deg,
      var(--bg-primary) 0%,
      rgba(var(--bg-primary-rgb, 255, 255, 255), 0.9) 40%,
      rgba(var(--bg-primary-rgb, 255, 255, 255), 0.3) 80%,
      transparent 100%
    );
  }

  [data-theme='dark'] & {
    &.top {
      background: linear-gradient(
        180deg,
        var(--bg-primary) 0%,
        rgba(var(--bg-primary-rgb, 30, 30, 30), 0.9) 40%,
        rgba(var(--bg-primary-rgb, 30, 30, 30), 0.3) 80%,
        transparent 100%
      );
    }

    &.bottom {
      background: linear-gradient(
        0deg,
        var(--bg-primary) 0%,
        rgba(var(--bg-primary-rgb, 30, 30, 30), 0.9) 40%,
        rgba(var(--bg-primary-rgb, 30, 30, 30), 0.3) 80%,
        transparent 100%
      );
    }
  }
`;

const ActivityLink = styled(motion.a)`
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  color: inherit;

  /* 左侧彩色指示点 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.2rem;
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  &:hover {
    &::before {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  &:last-child {
    border-bottom: none;
  }

  [data-theme='dark'] & {
    border-bottom-color: rgba(75, 85, 99, 0.5);
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 1.2rem;
`;

const ActivityTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0 0 0.3rem 0;
  transition: color 0.2s ease;

  ${ActivityLink}:hover & {
    color: var(--accent-color-hover);
  }
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ActivityAuthor = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;

  &::before {
    content: '·';
    margin-right: 0.5rem;
  }
`;

const ActivityDescription = styled.p`
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ChartSection = styled(motion.section)`
  margin: 2.5rem 0;
`;

const ChartContainer = styled(motion.div)`
  padding: 1.25rem;

  [data-theme='dark'] & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Chart = styled.div`
  height: 150px;
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

// 图表条动画变体 - 使用自定义配置因为需要custom参数
const barVariants: Variants = {
  hidden: { scaleY: 0, transformOrigin: 'bottom' },
  visible: (custom) => ({
    scaleY: 1,
    transition: {
      duration: 0.3,
      delay: custom * 0.03,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

// 添加开源项目相关的样式组件
const ProjectsSection = styled(motion.section)`
  margin: 3rem 0 4rem;
  position: relative;

  /* 拼图画布背景 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb), 0.03) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }
`;

// 左右布局容器 - 左侧60% 右侧40%
const ProjectsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  padding: 2rem 0;
  position: relative;

  /* 简短中间分割线 - 在间隔中间 */
  &::before {
    content: '';
    position: absolute;
    left: 60%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 100px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--border-color) 15%,
      var(--border-color) 85%,
      transparent 100%
    );
    opacity: 0.6;

    @media (max-width: 968px) {
      display: none;
    }
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// 左侧大卡片容器
const ProjectMainCard = styled(motion.div)`
  position: relative;
`;

// 左侧项目展示容器
const ProjectDetailContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 420px;

  /* GPU加速 */
  ${gpuAcceleration as any}
`;

// 项目信息区域
const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// 右侧几何拼图容器
const GeometryGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 60px;
  gap: 0.5rem;
  height: 420px;
  overflow: hidden;
  position: relative;

  @media (max-width: 968px) {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 50px;
    height: auto;
    max-height: 300px;
  }
`;

// 几何块标题（悬停显示）- 需要在 GeometryBlock 之前声明
const GeometryBlockTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(
    to top,
    rgba(var(--accent-rgb), 0.95) 0%,
    rgba(var(--accent-rgb), 0.85) 50%,
    transparent 100%
  );
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(4px);

  /* 默认隐藏 */
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

// 几何块 - 不规则尺寸
const GeometryBlock = styled(motion.div)<{
  isActive: boolean;
  rowSpan: number;
  colSpan: number;
  colorIndex: number;
}>`
  grid-row: span ${(props) => props.rowSpan};
  grid-column: span ${(props) => props.colSpan};
  background: ${(props) => (props.isActive ? 'rgba(var(--accent-rgb), 0.15)' : 'rgba(var(--accent-rgb), 0.06)')};
  border-radius: 8px;
  border: 2px solid ${(props) => (props.isActive ? 'var(--accent-color)' : 'transparent')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* 扁平化装饰 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(var(--accent-rgb), 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(var(--accent-rgb), 0.12);
    border-color: ${(props) => (props.isActive ? 'var(--accent-color)' : 'rgba(var(--accent-rgb), 0.4)')};
    transform: scale(1.02);
    z-index: 1;

    &::before {
      opacity: 1;
    }

    /* 悬停时显示标题 */
    ${GeometryBlockTitle} {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 968px) {
    border-radius: 6px;
  }
`;

// 几何块内容
const GeometryBlockContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--accent-color);
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

// 项目数据展示区域
const ProjectDataSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// 项目数据卡片
const DataCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// 数据项
const DataItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.5);

  &:last-child {
    border-bottom: none;
  }
`;

// 数据标签
const DataLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// 数据值
const DataValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

// 项目头部 - 扁平设计
const ProjectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-right: 6rem; /* 为右上角链接预留空间 */

  @media (max-width: 768px) {
    flex-direction: column;
    padding-right: 0;
  }
`;

// 右上角查看详情链接 - 修复布局
const ViewDetailLink = styled(Link)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.8rem;
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;

  &:hover {
    color: var(--accent-color);
    opacity: 0.8;
    transform: translateX(2px);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(2px);
  }

  @media (max-width: 768px) {
    position: static;
    margin-top: 0.5rem;
  }
`;

const ProjectIcon = styled.div<{ size?: 'large' | 'small' }>`
  width: ${(props) => (props.size === 'small' ? '32px' : '56px')};
  height: ${(props) => (props.size === 'small' ? '32px' : '56px')};
  border-radius: ${(props) => (props.size === 'small' ? '10px' : '14px')};
  background: rgba(var(--accent-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  font-size: ${(props) => (props.size === 'small' ? '1rem' : '1.75rem')};
  flex-shrink: 0;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--accent-rgb), 0.15);
    transform: scale(1.05);
  }
`;

// 缩略图内容容器
const ThumbnailContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--accent-color);
  position: relative;
  z-index: 1;

  svg {
    opacity: 0.8;
  }
`;

// 加载更多指示器
const LoadMoreIndicator = styled.div`
  aspect-ratio: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 968px) {
    border-radius: 8px;
  }
`;

// 空状态提示
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  min-height: 420px;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.4;
  }

  p {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.7;
  }
`;

// 语言标签样式
const LanguageTag = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary);

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${(props) => props.color};
  }
`;

const ProjectTitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  transition: color 0.2s ease;
  line-height: 1.4;
`;

const ProjectContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: auto;
`;

const ProjectMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    opacity: 0.6;
  }
`;

const ProjectLanguage = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;

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
  margin-top: 0.5rem;
`;

const ProjectLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  color: var(--text-secondary);
  background: transparent;

  &:hover {
    color: var(--accent-color);
    background: rgba(var(--accent-rgb), 0.08);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
// 简约淡入动画 - 轻微上浮效果
// 项目卡片切换动画 - 优雅的淡入淡出
const projectVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// 活动格式化函数 - 根据不同类型返回不同的展示格式
const formatActivityText = (activity: UserActivity & { user?: { username: string } }) => {
  const username = activity.user?.username || '某人';
  const metadata = activity.metadata || {};

  switch (activity.type) {
    case 'post_created':
      return {
        primary: `${username}发布了文章`,
        secondary: metadata.postTitle || '无标题',
        emoji: '📝',
        color: 'var(--accent-color)',
      };
    case 'post_updated':
      return {
        primary: `${username}更新了文章`,
        secondary: metadata.postTitle || '无标题',
        emoji: '✏️',
        color: '#10b981',
      };
    case 'note_created':
      return {
        primary: `${username}发布了手记`,
        secondary: activity.description || '...',
        emoji: '📌',
        color: '#f59e0b',
      };
    case 'comment_created':
      return {
        primary: `${username}发表了评论`,
        secondary: activity.description || '',
        emoji: '💬',
        color: '#8b5cf6',
      };
    case 'achievement_unlocked':
      return {
        primary: `${username}解锁了成就`,
        secondary: metadata.achievementName || activity.description || '',
        emoji: '🏆',
        color: '#f59e0b',
      };
    case 'post_trending':
      return {
        primary: `${username}的文章上热门了`,
        secondary: metadata.postTitle || '',
        emoji: '🔥',
        color: '#ef4444',
      };
    case 'post_featured':
      return {
        primary: `${username}的文章被精选了`,
        secondary: metadata.postTitle || '',
        emoji: '⭐',
        color: '#f59e0b',
      };
    default:
      return {
        primary: `${username}${activity.title}`,
        secondary: activity.description || '',
        emoji: '📄',
        color: 'var(--text-secondary)',
      };
  }
};

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
const Home: React.FC = () => {
  // 使用动画优化工具
  const { fadeInUp, staggerContainer, iconVariants, shouldReduceAnimations } = useAnimationOptimization();

  // 使用统一的动画变体
  const cardVariants = shouldReduceAnimations ? animationVariants.fade : animationVariants.cardVariants;

  // 卡片翻转状态
  const [isFlipped, setIsFlipped] = useState(false);
  // 网站设置数据
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  // 文章和手记数据
  const [articles, setArticles] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  // 活动数据
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  // 项目数据
  const [projects, setProjects] = useState<Project[]>([]);
  // 当前选中的项目索引
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  // 项目分页状态
  const [projectPage, setProjectPage] = useState(1);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [loadingMoreProjects, setLoadingMoreProjects] = useState(false);

  // 生成不规则几何块布局 - 优化版本
  const generateGeometryLayout = (count: number) => {
    // 精心设计的几何块模式，确保能够良好拼接
    const patterns = [
      { rowSpan: 2, colSpan: 3 }, // 0 - 大横块
      { rowSpan: 2, colSpan: 3 }, // 1 - 大横块
      { rowSpan: 3, colSpan: 2 }, // 2 - 竖长块
      { rowSpan: 1, colSpan: 2 }, // 3 - 小横块
      { rowSpan: 2, colSpan: 2 }, // 4 - 方块
      { rowSpan: 1, colSpan: 2 }, // 5 - 小横块
      { rowSpan: 3, colSpan: 2 }, // 6 - 竖长块
    ];

    const layouts = [];
    for (let i = 0; i < Math.min(count, 7); i++) {
      layouts.push(patterns[i]);
    }
    return layouts;
  };

  // 加载网站设置
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await API.siteSettings.getSiteSettings();
        setSiteSettings(response.data);
      } catch (error) {
        console.error('加载网站设置失败:', error);
      } finally {
      }
    };

    loadSiteSettings();
  }, []);

  // 加载文章列表
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await API.article.getArticles({ page: 1, limit: 3 });
        setArticles(response.data || []);
      } catch (error) {
        console.error('加载文章失败:', error);
      }
    };

    loadArticles();
  }, []);

  // 加载手记列表
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await API.note.getNotes({ page: 1, limit: 5, isPrivate: false });
        setNotes(response.data || []);
      } catch (error) {
        console.error('加载手记失败:', error);
      }
    };

    loadNotes();
  }, []);

  // 加载全站活动
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await API.activity.getRecentActivities({ page: 1, limit: 10 });
        setActivities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('加载活动失败:', error);
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    loadActivities();
  }, []);

  // 加载精选项目（首次加载）
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await API.project.getFeaturedProjects({ page: 1, limit: 100 });
        setProjects(response.data || []);
        setHasMoreProjects((response as any).meta?.pagination?.totalPages > 1);
      } catch (error) {
        console.error('加载项目失败:', error);
      }
    };

    loadProjects();
  }, []);

  // 加载更多项目
  const loadMoreProjects = async () => {
    if (loadingMoreProjects || !hasMoreProjects) return;

    try {
      setLoadingMoreProjects(true);
      const nextPage = projectPage + 1;
      const response = await API.project.getFeaturedProjects({ page: nextPage, limit: 6 });

      if (response.data && response.data.length > 0) {
        setProjects((prev) => [...prev, ...response.data]);
        setProjectPage(nextPage);
        setHasMoreProjects((response as any).meta?.pagination?.page < (response as any).meta?.pagination?.totalPages);
      } else {
        setHasMoreProjects(false);
      }
    } catch (error) {
      console.error('加载更多项目失败:', error);
    } finally {
      setLoadingMoreProjects(false);
    }
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // 使用网站设置或默认值（仅用于介绍卡片）
  const authorName = siteSettings?.authorName || '';
  const authorTitle = siteSettings?.authorTitle || '';
  const authorBio = siteSettings?.authorBio || '';
  const mbti = siteSettings?.mbti || '';
  const location = siteSettings?.location || '';
  const occupation = siteSettings?.occupation || '';
  const skills = siteSettings?.skills || [];
  const quote = siteSettings?.quote || '';
  const quoteAuthor = siteSettings?.quoteAuthor || '';
  const socialLinks = siteSettings?.socialLinks || [];

  return (
    <>
      <PageContainer>
        <HeroSection>
          <Hero>
            <HeroContent variants={staggerContainer} initial="hidden" animate="visible">
              <Title variants={fadeInUp}>
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

              <Subtitle variants={fadeInUp}>
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

              <Description variants={fadeInUp}>
                我是<strong style={{ color: 'var(--accent-color)' }}>全栈工程师</strong>与
                <strong style={{ color: 'var(--accent-color)' }}>UI/UX爱好者</strong>，专注于构建美观且高性能的Web体验。
                <br />
                <span style={{ fontSize: '0.9em', opacity: 0.9 }}>「每一行代码都有诗意，每一个像素都有故事」</span>
              </Description>

              <SkillTags variants={fadeInUp}>
                <span>
                  <FiCode size={14} /> 开发者
                </span>
                <span>
                  <Icon name="helpCircle" size={14} /> 设计爱好者
                </span>
                <span>
                  <Icon name="share" size={14} /> 终身学习者
                </span>
              </SkillTags>

              <SocialLinks variants={staggerContainer}>
                <SocialLink
                  href={Array.isArray(socialLinks) ? undefined : socialLinks?.email}
                  aria-label="Email"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMail />
                </SocialLink>
                <SocialLink
                  href={Array.isArray(socialLinks) ? undefined : socialLinks?.github}
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
                  href={Array.isArray(socialLinks) ? undefined : socialLinks?.bilibili}
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
                  <Icon name="bilibili" size={18} />
                </SocialLink>
                <SocialLink
                  href={Array.isArray(socialLinks) ? undefined : socialLinks?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon name="telegram" size={18} />
                </SocialLink>
                <SocialLink
                  href={Array.isArray(socialLinks) ? undefined : socialLinks?.rss}
                  aria-label="RSS Feed"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon name="rss" size={18} />
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
                      alt={authorName}
                    />
                  </ProfileImage>
                  <ProfileName>{authorName}</ProfileName>
                  <ProfileTitle>{authorTitle}</ProfileTitle>

                  <ProfileInfoList>
                    {mbti && (
                      <ProfileInfoItem>
                        <span>MBTI</span>
                        <span>{mbti}</span>
                      </ProfileInfoItem>
                    )}
                    {location && (
                      <ProfileInfoItem>
                        <span>地点</span>
                        <span>{location}</span>
                      </ProfileInfoItem>
                    )}
                    {occupation && (
                      <ProfileInfoItem>
                        <span>职业</span>
                        <span>{occupation}</span>
                      </ProfileInfoItem>
                    )}
                    {skills && skills.length > 0 && (
                      <ProfileInfoItem>
                        <span>技能</span>
                        <span>{skills.join(', ')}</span>
                      </ProfileInfoItem>
                    )}
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
                    {authorBio}
                  </p>

                  <CardTitle>技能标签</CardTitle>
                  <SkillList>
                    {skills.map((skill, index) => (
                      <SkillItem key={index}>{skill}</SkillItem>
                    ))}
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
            {quote} {quoteAuthor && `—— ${quoteAuthor}`}
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

        {/* 两栏布局容器 */}
        <TwoColumnLayout
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* 左侧栏 */}
          <LeftColumn>
            {/* 文章部分 */}
            <ContentSection variants={fadeInUp}>
              <SectionTitle>
                最近更新的文稿
                <Link to="/blog" style={{ textDecoration: 'none' }}>
                  <motion.span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: 'var(--accent-color)',
                      fontSize: '0.85rem',
                    }}
                    whileHover={{ x: 5 }}
                  >
                    还有更多 <FiArrowRight size={12} />
                  </motion.span>
                </Link>
              </SectionTitle>

              <ArticleGrid variants={staggerContainer}>
                {articles.slice(0, 3).map((article, index) => (
                  <ArticleLink
                    to={`/blog/${article.id}`}
                    key={article.id}
                    variants={cardVariants}
                    whileHover={{ x: 2 }}
                    custom={index}
                  >
                    <ArticleContent>
                      <ArticleTitle>{article.title}</ArticleTitle>
                    </ArticleContent>
                    <ArticleTime>
                      {formatDate(article.publishedAt || article.createdAt, 'YYYY-MM-DD') || article.date}
                    </ArticleTime>
                  </ArticleLink>
                ))}
              </ArticleGrid>
            </ContentSection>

            {/* 手记部分 */}
            <ContentSection variants={fadeInUp}>
              <SectionTitle>
                最近更新的手记
                <Link to="/notes" style={{ textDecoration: 'none' }}>
                  <motion.span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: 'var(--accent-color)',
                      fontSize: '0.85rem',
                    }}
                    whileHover={{ x: 5 }}
                  >
                    还有更多 <FiArrowRight size={12} />
                  </motion.span>
                </Link>
              </SectionTitle>

              <ArticleGrid variants={staggerContainer}>
                {notes.slice(0, 5).map((note, index) => (
                  <ArticleLink
                    to={`/notes/${note.id}`}
                    key={note.id}
                    variants={cardVariants}
                    whileHover={{ x: 2 }}
                    custom={index}
                  >
                    <ArticleContent>
                      <ArticleTitle>{note.title || '无标题手记'}</ArticleTitle>
                    </ArticleContent>
                    <ArticleTime>{formatDate(note.createdAt, 'YYYY-MM-DD') || note.date}</ArticleTime>
                  </ArticleLink>
                ))}
              </ArticleGrid>
            </ContentSection>
          </LeftColumn>

          {/* 右侧栏 */}
          <RightColumn>
            <ContentSection variants={fadeInUp}>
              <SectionTitle>最近发生的事</SectionTitle>

              <ActivityScrollContainer>
                <FadeMask className="top" />
                <ActivityGrid variants={staggerContainer}>
                  {activitiesLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      加载中...
                    </div>
                  ) : activities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>暂无活动</div>
                  ) : (
                    activities.map((activity, index) => {
                      const formatted = formatActivityText(activity as any);
                      const activityTime = formatDate(activity.timestamp, 'MM-DD HH:mm');

                      return (
                        <ActivityLink
                          href={activity.link || '#'}
                          key={activity.id}
                          variants={cardVariants}
                          whileHover={{ x: 2 }}
                          custom={index}
                        >
                          <ActivityContent>
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
                            >
                              <span style={{ fontSize: '1.2rem' }}>{formatted.emoji}</span>
                              <ActivityAuthor style={{ color: formatted.color, fontWeight: 500 }}>
                                {formatted.primary}
                              </ActivityAuthor>
                            </div>
                            {formatted.secondary && (
                              <ActivityTitle
                                style={{
                                  fontSize: '0.9rem',
                                  fontWeight: 400,
                                  color: 'var(--text-primary)',
                                  marginBottom: '0.5rem',
                                }}
                              >
                                {formatted.secondary}
                              </ActivityTitle>
                            )}
                            <ActivityMeta style={{ marginTop: '0.5rem' }}>
                              <ActivityTime>{activityTime}</ActivityTime>
                            </ActivityMeta>
                          </ActivityContent>
                        </ActivityLink>
                      );
                    })
                  )}
                </ActivityGrid>
                <FadeMask className="bottom" />
              </ActivityScrollContainer>
            </ContentSection>
          </RightColumn>
        </TwoColumnLayout>

        {/* 图表部分 */}
        <ChartSection
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <CreativeSectionHeader>
            <CreativeSectionTitle
              variants={fadeInUp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              年度活跃度一览
            </CreativeSectionTitle>
            <SectionSubtitle
              variants={fadeInUp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
              记录每一次创作的足迹
            </SectionSubtitle>
          </CreativeSectionHeader>

          <ChartContainer variants={fadeInUp} whileHover={{ y: -3 }}>
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
          variants={staggerContainer}
        >
          <CreativeSectionHeader>
            <CreativeSectionTitle
              variants={fadeInUp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              开源项目
            </CreativeSectionTitle>
            <SectionSubtitle
              variants={fadeInUp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
              用代码构建更美好的世界
            </SectionSubtitle>
          </CreativeSectionHeader>

          <ProjectsGrid>
            {/* 左侧：选中项目的详细信息 */}
            <ProjectMainCard>
              {projects.length === 0 ? (
                <EmptyState>
                  <FiFolderPlus />
                  <p>暂无精选项目</p>
                </EmptyState>
              ) : projects[selectedProjectIndex] ? (
                <ProjectDetailContainer
                  key={projects[selectedProjectIndex].id}
                  variants={projectVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* 项目基本信息 */}
                  <ProjectInfo>
                    <ProjectHeader>
                      <ProjectIcon size="large">
                        {getLanguageIcon(projects[selectedProjectIndex].language).icon === 'code' ? (
                          <FiCode size={28} />
                        ) : (
                          <Icon
                            name={getLanguageIcon(projects[selectedProjectIndex].language).icon}
                            size={28}
                            color={getLanguageIcon(projects[selectedProjectIndex].language).color}
                          />
                        )}
                      </ProjectIcon>
                      <ProjectTitleWrapper>
                        <ProjectTitle>{projects[selectedProjectIndex].title}</ProjectTitle>
                        <ProjectDescription>{projects[selectedProjectIndex].description}</ProjectDescription>
                      </ProjectTitleWrapper>
                      <ViewDetailLink to={`/projects/${projects[selectedProjectIndex].slug}`}>
                        查看详情
                        <FiArrowRight size={12} />
                      </ViewDetailLink>
                    </ProjectHeader>
                  </ProjectInfo>

                  {/* 项目数据和雷达图 */}
                  <ProjectDataSection>
                    {/* 左侧：项目数据 */}
                    <DataCard>
                      <DataItem>
                        <DataLabel>
                          <FiStar size={16} />
                          Stars
                        </DataLabel>
                        <DataValue>{projects[selectedProjectIndex].stars || 0}</DataValue>
                      </DataItem>
                      <DataItem>
                        <DataLabel>
                          <FiGithub size={16} />
                          Forks
                        </DataLabel>
                        <DataValue>{projects[selectedProjectIndex].forks || 0}</DataValue>
                      </DataItem>
                      <DataItem>
                        <DataLabel>
                          <FiCode size={16} />
                          语言
                        </DataLabel>
                        <DataValue>
                          <LanguageTag color={getLanguageIcon(projects[selectedProjectIndex].language).color}>
                            {projects[selectedProjectIndex].language || 'N/A'}
                          </LanguageTag>
                        </DataValue>
                      </DataItem>
                      <DataItem>
                        <DataLabel>
                          <FiCalendar size={16} />
                          更新时间
                        </DataLabel>
                        <DataValue>
                          {projects[selectedProjectIndex].updatedAt
                            ? formatDate(projects[selectedProjectIndex].updatedAt, 'YYYY-MM-DD')
                            : '最近'}
                        </DataValue>
                      </DataItem>

                      {/* 项目链接 - 放在数据下方 */}
                      <ProjectLinks>
                        {projects[selectedProjectIndex].githubUrl && (
                          <ProjectLink
                            href={projects[selectedProjectIndex].githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiGithub /> GitHub
                          </ProjectLink>
                        )}
                        {projects[selectedProjectIndex].giteeUrl && (
                          <ProjectLink
                            href={projects[selectedProjectIndex].giteeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon name="gitee" size={14} /> Gitee
                          </ProjectLink>
                        )}
                        {projects[selectedProjectIndex].demoUrl && (
                          <ProjectLink
                            href={projects[selectedProjectIndex].demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiExternalLink /> 演示
                          </ProjectLink>
                        )}
                      </ProjectLinks>
                    </DataCard>

                    {/* 右侧：雷达图 */}
                    <RadarChart data={calculateProjectRadarData(projects[selectedProjectIndex])} size={280} />
                  </ProjectDataSection>
                </ProjectDetailContainer>
              ) : null}
            </ProjectMainCard>

            {/* 右侧：不规则几何拼图布局 */}
            <div>
              <GeometryGridContainer>
                {projects.slice(0, 7).map((project, index) => {
                  const langIcon = getLanguageIcon(project.language);
                  const isActive = selectedProjectIndex === index;
                  const layout = generateGeometryLayout(7)[index];

                  return (
                    <GeometryBlock
                      key={project.id}
                      isActive={isActive}
                      rowSpan={layout.rowSpan}
                      colSpan={layout.colSpan}
                      colorIndex={index}
                      onClick={() => setSelectedProjectIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GeometryBlockContent>
                        {langIcon.icon === 'code' ? (
                          <FiCode
                            size={layout.rowSpan * layout.colSpan > 2 ? 32 : 24}
                            style={{ color: langIcon.color }}
                          />
                        ) : (
                          <Icon
                            name={langIcon.icon}
                            size={layout.rowSpan * layout.colSpan > 2 ? 32 : 24}
                            color={langIcon.color}
                          />
                        )}

                        {/* 悬停显示标题 */}
                        <GeometryBlockTitle>{project.title}</GeometryBlockTitle>
                      </GeometryBlockContent>
                    </GeometryBlock>
                  );
                })}
              </GeometryGridContainer>

              {/* 当前选中项目提示 */}
              {projects.length > 0 && (
                <div
                  style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                  }}
                >
                  {projects[selectedProjectIndex]?.title || ''}
                </div>
              )}

              {/* 项目数量提示 */}
              {projects.length > 7 && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    opacity: 0.5,
                  }}
                >
                  显示 7 / {projects.length} 个项目
                </div>
              )}
            </div>
          </ProjectsGrid>
        </ProjectsSection>
      </PageContainer>
    </>
  );
};

export default Home;
