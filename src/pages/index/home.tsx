import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { FiGithub, FiMail, FiCode } from 'react-icons/fi';
import { API, UserActivity, Project } from '@/utils/api';
import { useAnimationEngine } from '@/utils/animation-engine';
import { Icon } from '@/components/common/Icon';
import { WaveText } from '@/components/common';
import { useSiteSettings } from '@/layouts';
import {
  ArticlesSection,
  NotesSection,
  ActivitiesSection,
  ActivityChartSection,
  ProjectsSection as ProjectsSectionModule,
} from './modules';

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
  will-change: transform;

  &:hover:not(.flipped) {
    transform: translateY(-8px) translateZ(0);
    box-shadow: 0 12px 28px var(--accent-color-alpha);
  }

  &.flipped {
    transform: rotateY(180deg) translateZ(0);
  }

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

/**
 * 单个字符容器 - 支持波浪动画
 *
 * 用于需要单独样式控制的字符（如渐变色、加粗等）
 * 对于纯文本波浪效果，推荐使用 WaveText 组件
 */
const AnimatedChar = styled(MotionSpan)`
  display: inline-block;
`;

const Home: React.FC = () => {
  // 使用动画引擎 - 统一的 Spring 动画系统
  const { variants, springPresets } = useAnimationEngine();

  // 按行显示控制（3行）
  const [showLine1, setShowLine1] = useState(true); // 欢迎踏入代码与创意交织的奇幻宇宙🌌
  const [showLine2, setShowLine2] = useState(false); // 在代码与设计的交界，创造数字诗篇 @adnaan
  const [showLine3, setShowLine3] = useState(false); // 我是全栈工程师与UI/UX爱好者...
  const [showLine4, setShowLine4] = useState(false); // 「每一行代码都有诗意，每一个像素都有故事」
  const [showRest, setShowRest] = useState(false); // 技能标签和社交链接

  // 卡片翻转状态
  const [isFlipped, setIsFlipped] = useState(false);
  // 使用网站设置Hook
  const { siteSettings } = useSiteSettings();
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
  // 贡献数据
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // 加载文章列表
  const loadArticles = async () => {
    try {
      const response = await API.article.getArticles({ page: 1, limit: 3 });
      setArticles(response.data || []);
    } catch (error) {
      console.error('加载文章失败:', error);
    }
  };

  // 加载手记列表
  const loadNotes = async () => {
    try {
      const response = await API.note.getNotes({ page: 1, limit: 5, isPrivate: false });
      setNotes(response.data || []);
    } catch (error) {
      console.error('加载手记失败:', error);
    }
  };

  // 加载全站活动
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

  // 加载精选项目
  const loadProjects = async () => {
    try {
      const response = await API.project.getFeaturedProjects({ page: 1, limit: 100 });
      setProjects(response.data || []);
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  };

  // 加载贡献统计数据
  const loadContributions = async () => {
    try {
      setChartLoading(true);
      // 从网站设置中获取用户名，或使用默认值
      const githubUsername = siteSettings?.githubUsername || 'adnaan';
      const giteeUsername = siteSettings?.giteeUsername || 'adnaan';

      const response = await API.contribution.getContributions({
        githubUsername,
        giteeUsername,
      });
      setChartData(response.data || []);
    } catch (error) {
      console.error('加载贡献数据失败:', error);
      // 加载失败时使用空数据
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      if (!isMounted) return;
      await loadArticles();
      if (!isMounted) return;
      await loadNotes();
      if (!isMounted) return;
      await loadActivities();
      if (!isMounted) return;
      await loadProjects();
      if (!isMounted) return;
      await loadContributions();
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <PageContainer>
        <HeroSection>
          <Hero>
            <HeroContent>
              {/* 第1行：欢迎踏入代码与创意交织的奇幻宇宙🌌 */}
              <Title>
                <MotionSpan
                  variants={variants.waveContainer}
                  initial="hidden"
                  animate={showLine1 ? 'visible' : 'hidden'}
                  style={{ display: 'inline-block' }}
                  onAnimationComplete={(definition: any) => {
                    if (definition === 'visible' && showLine1) {
                      setShowLine2(true);
                    }
                  }}
                >
                  {'欢迎踏入代码与创意交织的'.split('').map((char, index) => (
                    <AnimatedChar key={index} variants={variants.waveChar}>
                      {char}
                    </AnimatedChar>
                  ))}{' '}
                  <span style={{ color: 'var(--accent-color)' }}>
                    {'奇幻宇宙'.split('').map((char, index) => (
                      <AnimatedChar key={`highlight-${index}`} variants={variants.waveChar}>
                        {char}
                      </AnimatedChar>
                    ))}
                  </span>
                </MotionSpan>
                <MotionSpan
                  className="wave"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={showLine1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: showLine1 ? 0.5 : 0, ...springPresets.snappy }}
                  style={{
                    display: 'inline-block',
                    fontSize: '0.8em',
                  }}
                >
                  🌌
                </MotionSpan>
              </Title>

              {/* 第2行：在代码与设计的交界，创造数字诗篇 @adnaan */}
              <Subtitle initial={{ opacity: 0 }} animate={showLine2 ? { opacity: 1 } : { opacity: 0 }}>
                <MotionSpan
                  variants={variants.waveContainer}
                  initial="hidden"
                  animate={showLine2 ? 'visible' : 'hidden'}
                  style={{ display: 'inline-block' }}
                  onAnimationComplete={(definition: any) => {
                    if (definition === 'visible' && showLine2) {
                      setShowLine3(true);
                    }
                  }}
                >
                  {'在代码与设计的交界，创造数字诗篇'.split('').map((char, index) => (
                    <AnimatedChar
                      key={index}
                      variants={variants.waveChar}
                      style={{
                        background: 'linear-gradient(90deg, rgb(var(--gradient-from)), rgb(var(--gradient-to)))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {char}
                    </AnimatedChar>
                  ))}
                  <AnimatedChar variants={variants.waveChar}> </AnimatedChar>
                  <motion.code
                    variants={variants.waveChar}
                    style={{
                      display: 'inline-block',
                      color: 'var(--accent-color)',
                      fontFamily: 'var(--font-code)',
                      background: 'rgba(81, 131, 245, 0.08)',
                      padding: '0.2em 0.4em',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      marginLeft: '0.5em',
                      border: '1px solid rgba(81, 131, 245, 0.1)',
                    }}
                  >
                    @adnaan
                  </motion.code>
                </MotionSpan>
              </Subtitle>

              {/* 第3行：我是全栈工程师与UI/UX爱好者... */}
              <Description initial={{ opacity: 0 }} animate={showLine3 ? { opacity: 1 } : { opacity: 0 }}>
                <MotionSpan
                  variants={variants.waveContainer}
                  initial="hidden"
                  animate={showLine3 ? 'visible' : 'hidden'}
                  style={{ display: 'inline' }}
                  onAnimationComplete={(definition: any) => {
                    if (definition === 'visible' && showLine3) {
                      setShowLine4(true);
                    }
                  }}
                >
                  {'我是'.split('').map((char, i) => (
                    <AnimatedChar key={i} variants={variants.waveChar}>
                      {char}
                    </AnimatedChar>
                  ))}
                  <strong style={{ color: 'var(--accent-color)' }}>
                    {'全栈工程师'.split('').map((char, i) => (
                      <AnimatedChar key={`s1-${i}`} variants={variants.waveChar}>
                        {char}
                      </AnimatedChar>
                    ))}
                  </strong>
                  {'与'.split('').map((char, i) => (
                    <AnimatedChar key={`and-${i}`} variants={variants.waveChar}>
                      {char}
                    </AnimatedChar>
                  ))}
                  <strong style={{ color: 'var(--accent-color)' }}>
                    {'UI/UX爱好者'.split('').map((char, i) => (
                      <AnimatedChar key={`s2-${i}`} variants={variants.waveChar}>
                        {char}
                      </AnimatedChar>
                    ))}
                  </strong>
                  {'，专注于构建美观且高性能的Web体验。'.split('').map((char, i) => (
                    <AnimatedChar key={`end-${i}`} variants={variants.waveChar}>
                      {char}
                    </AnimatedChar>
                  ))}
                </MotionSpan>
                <br />
                {/* 第4行：「每一行代码都有诗意，每一个像素都有故事」- 带渐变下划线 */}
                <MotionSpan
                  initial={{ opacity: 0 }}
                  animate={showLine4 ? { opacity: 1 } : { opacity: 0 }}
                  style={{
                    fontSize: '0.9em',
                    opacity: 0.9,
                    display: 'inline-block',
                    position: 'relative',
                    paddingBottom: '0.25rem',
                  }}
                >
                  <WaveText show={showLine4} onComplete={() => setShowRest(true)}>
                    「每一行代码都有诗意，每一个像素都有故事」
                  </WaveText>
                  <MotionSpan
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={showLine4 ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '2px',
                      background: 'linear-gradient(90deg, var(--accent-color), transparent)',
                      transformOrigin: 'left',
                    }}
                  />
                </MotionSpan>
              </Description>

              <SkillTags
                initial={{ opacity: 0, y: 10 }}
                animate={showRest ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={springPresets.gentle}
              >
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

              <SocialLinks
                initial={{ opacity: 0, y: 10 }}
                animate={showRest ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ ...springPresets.gentle, delay: 0.2 }}
              >
                <SocialLink
                  href={siteSettings?.socialLinks?.email ? `mailto:${siteSettings.socialLinks.email}` : undefined}
                  aria-label="Email"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springPresets.bouncy}
                >
                  <FiMail />
                </SocialLink>
                <SocialLink
                  href={siteSettings?.socialLinks?.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springPresets.bouncy}
                >
                  <FiGithub />
                </SocialLink>
                <SocialLink
                  href={siteSettings?.socialLinks?.bilibili}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bilibili"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springPresets.bouncy}
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(var(--gradient-from), 0.08), rgba(var(--gradient-to), 0.08))',
                  }}
                >
                  <Icon name="bilibili" size={18} />
                </SocialLink>
                <SocialLink
                  href={siteSettings?.socialLinks?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springPresets.bouncy}
                >
                  <Icon name="telegram" size={18} />
                </SocialLink>
                <SocialLink
                  href={siteSettings?.socialLinks?.rss}
                  aria-label="RSS Feed"
                  initial={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springPresets.bouncy}
                >
                  <Icon name="rss" size={18} />
                </SocialLink>
              </SocialLinks>
            </HeroContent>

            {/* 个人卡片 - 立即弹出 */}
            <HeroImage
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={springPresets.bouncy}
              className="card-container"
            >
              <ProfileCard className={isFlipped ? 'flipped' : ''} onClick={handleCardFlip}>
                <CardFront className="card-face">
                  <ProfileImage>
                    <img
                      src="https://foruda.gitee.com/avatar/1745582574310382271/5352827_adnaan_1745582574.png!avatar100"
                      alt={siteSettings?.authorName || '头像'}
                    />
                  </ProfileImage>
                  <ProfileName>{siteSettings?.authorName || ''}</ProfileName>
                  <ProfileTitle>{siteSettings?.authorTitle || ''}</ProfileTitle>

                  <ProfileInfoList>
                    {siteSettings?.mbti && (
                      <ProfileInfoItem>
                        <span>MBTI</span>
                        <span>{siteSettings.mbti}</span>
                      </ProfileInfoItem>
                    )}
                    {siteSettings?.location && (
                      <ProfileInfoItem>
                        <span>地点</span>
                        <span>{siteSettings.location}</span>
                      </ProfileInfoItem>
                    )}
                    {siteSettings?.occupation && (
                      <ProfileInfoItem>
                        <span>职业</span>
                        <span>{siteSettings.occupation}</span>
                      </ProfileInfoItem>
                    )}
                    {siteSettings?.skills && siteSettings.skills.length > 0 && (
                      <ProfileInfoItem>
                        <span>技能</span>
                        <span>{siteSettings.skills.join(', ')}</span>
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
                    {siteSettings?.authorBio || ''}
                  </p>

                  <CardTitle>技能标签</CardTitle>
                  <SkillList>
                    {siteSettings?.skills?.map((skill, index) => (
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

          <Quote
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ ...springPresets.floaty, delay: 0.5 }}
          >
            {siteSettings?.quote || ''} {siteSettings?.quoteAuthor && `—— ${siteSettings.quoteAuthor}`}
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
          variants={variants.stagger}
        >
          {/* 左侧栏 */}
          <LeftColumn>
            <ArticlesSection articles={articles} loading={false} />
            <NotesSection notes={notes} loading={false} />
          </LeftColumn>

          {/* 右侧栏 */}
          <RightColumn>
            <ActivitiesSection activities={activities} loading={activitiesLoading} />
          </RightColumn>
        </TwoColumnLayout>

        {/* 图表部分 */}
        <ActivityChartSection chartData={chartData} />

        {/* 项目部分 */}
        <ProjectsSectionModule
          projects={projects}
          selectedProjectIndex={selectedProjectIndex}
          onProjectChange={setSelectedProjectIndex}
        />
      </PageContainer>
    </>
  );
};

export default Home;
